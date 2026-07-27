<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Requests\Checkout\StoreCheckoutOrderRequest;
use App\Http\Resources\OrderResource;
use App\Models\Order;
use App\Models\OrderItem;
use App\Models\Product;
use App\Models\User;
use Illuminate\Database\QueryException;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Collection;
use Illuminate\Support\Facades\Crypt;
use Illuminate\Support\Facades\DB;
use Illuminate\Validation\ValidationException;

class CheckoutController extends Controller
{
    private const TERMS_VERSION = '2026-07';

    private const PRIVACY_VERSION = '2026-07';

    public function store(StoreCheckoutOrderRequest $request): JsonResponse
    {
        /** @var User|null $user */
        $user = $request->user();
        $validated = $request->validated();

        $existingOrder = $this->submissionQuery($user, $validated['submission_id'])->first();

        if ($existingOrder) {
            $this->assertGuestRecoverySecretMatches(
                $existingOrder,
                $validated['checkout_recovery_secret'],
            );

            return $this->orderResponse($this->loadForConfirmation($existingOrder), true);
        }

        $requestedItems = collect($validated['items'])->keyBy('product_id');
        $products = Product::query()
            ->whereIn('id', $requestedItems->keys())
            ->get()
            ->keyBy('id');

        $this->validateProducts($requestedItems, $products);

        $subtotalCents = $requestedItems->sum(function (array $item, int $productId) use ($products): int {
            return $this->moneyToCents($products->get($productId)->price) * $item['quantity'];
        });
        $acceptedAt = now();
        $guestToken = $user === null ? bin2hex(random_bytes(32)) : null;
        $guestTokenEncrypted = $guestToken ? Crypt::encryptString($guestToken) : null;
        $recoverySecretHash = hash('sha256', $validated['checkout_recovery_secret']);
        $orderNumber = $this->generateOrderNumber();
        $itemSnapshots = $requestedItems->map(function (array $item, int $productId) use ($products): array {
            $product = $products->get($productId);
            $unitPriceCents = $this->moneyToCents($product->price);

            return [
                'product_id' => $product->id,
                'product_name' => $product->name,
                'product_slug' => $product->slug,
                'product_image' => $product->image_path,
                'unit_price' => $this->centsToMoney($unitPriceCents),
                'quantity' => $item['quantity'],
                'line_total' => $this->centsToMoney($unitPriceCents * $item['quantity']),
            ];
        })->values()->all();

        try {
            $order = DB::transaction(function () use (
                $user,
                $validated,
                $subtotalCents,
                $acceptedAt,
                $guestToken,
                $guestTokenEncrypted,
                $recoverySecretHash,
                $orderNumber,
                $itemSnapshots,
            ): Order {
                $address = $validated['address'];
                $order = Order::query()->create([
                    'user_id' => $user?->id,
                    'checkout_submission_id' => $validated['submission_id'],
                    'checkout_recovery_secret_hash' => $recoverySecretHash,
                    'order_number' => $orderNumber,
                    'customer_email' => $validated['contact']['email'],
                    'customer_phone' => $validated['contact']['phone'],
                    'delivery_first_name' => $address['first_name'],
                    'delivery_last_name' => $address['last_name'],
                    'delivery_phone' => $address['phone'],
                    'delivery_county' => $address['county'],
                    'delivery_city' => $address['city'],
                    'delivery_street_address' => $address['street_address'],
                    'delivery_building_details' => $address['building_details'] ?? null,
                    'delivery_postal_code' => $address['postal_code'] ?? null,
                    'delivery_instructions' => $address['delivery_instructions'] ?? null,
                    'delivery_method' => $validated['delivery_method'],
                    'payment_method' => $validated['payment_method'],
                    'payment_status' => 'pending',
                    'order_status' => 'pending',
                    'subtotal' => $this->centsToMoney($subtotalCents),
                    'delivery_amount' => '0.00',
                    'tax_amount' => '0.00',
                    'total' => $this->centsToMoney($subtotalCents),
                    'currency' => 'KES',
                    'placed_at' => $acceptedAt,
                    'terms_accepted_at' => $acceptedAt,
                    'terms_version' => self::TERMS_VERSION,
                    'privacy_accepted_at' => $acceptedAt,
                    'privacy_version' => self::PRIVACY_VERSION,
                    'guest_access_token_hash' => $guestToken ? hash('sha256', $guestToken) : null,
                    'guest_access_token_encrypted' => $guestTokenEncrypted,
                ]);

                OrderItem::query()->insert(array_map(
                    static fn (array $snapshot): array => [
                        ...$snapshot,
                        'order_id' => $order->id,
                        'created_at' => $acceptedAt,
                        'updated_at' => $acceptedAt,
                    ],
                    $itemSnapshots,
                ));

                if ($user !== null && $validated['save_address']) {
                    $user->addresses()->create([
                        ...$address,
                        'is_default' => ! $user->addresses()->exists(),
                    ]);
                }

                return $order;
            }, 3);
        } catch (QueryException $exception) {
            $duplicate = $this->submissionQuery($user, $validated['submission_id'])->first();

            if ($duplicate) {
                $this->assertGuestRecoverySecretMatches(
                    $duplicate,
                    $validated['checkout_recovery_secret'],
                );

                return $this->orderResponse($this->loadForConfirmation($duplicate), true);
            }

            throw $exception;
        }

        return $this->orderResponse($this->loadForConfirmation($order), false);
    }

    public function recover(Request $request, string $submissionId): JsonResponse
    {
        /** @var User|null $user */
        $user = $request->user();

        if ($user !== null) {
            $order = $this->submissionQuery($user, $submissionId)->firstOrFail();
        } else {
            $order = $this->submissionQuery(null, $submissionId)->first();
            $this->assertGuestRecoverySecretMatches(
                $order,
                (string) $request->header('X-Checkout-Recovery-Secret'),
            );
        }

        $order = $this->loadForConfirmation($order);

        return response()->json([
            'message' => 'Your existing order was recovered successfully.',
            'recovered' => true,
            'order_number' => $order->order_number,
            'order' => new OrderResource($order),
            ...($order->user_id === null ? [
                'guest_access_token' => Crypt::decryptString(
                    $order->guest_access_token_encrypted,
                ),
            ] : []),
        ]);
    }

    private function submissionQuery(?User $user, string $submissionId)
    {
        return Order::query()
            ->where('checkout_submission_id', $submissionId)
            ->when(
                $user,
                fn ($query) => $query->where('user_id', $user->id),
                fn ($query) => $query->whereNull('user_id'),
            );
    }

    private function assertGuestRecoverySecretMatches(?Order $order, string $secret): void
    {
        if ($order?->user_id !== null) {
            return;
        }

        $storedHash = (string) ($order?->checkout_recovery_secret_hash ?? str_repeat('0', 64));
        $providedHash = hash('sha256', $secret);
        $hasValidFormat = preg_match('/^[a-f0-9]{64}$/i', $secret) === 1;

        abort_unless(
            $order !== null
            && $hasValidFormat
            && strlen($storedHash) === 64
            && hash_equals($storedHash, $providedHash),
            404,
        );
    }

    private function loadForConfirmation(Order $order): Order
    {
        return $order->loadMissing('items')->loadCount('items');
    }

    private function validateProducts(Collection $requestedItems, Collection $products): void
    {
        $errors = [];

        foreach ($requestedItems as $productId => $item) {
            $product = $products->get($productId);

            if (! $product) {
                $errors["items.$productId.product_id"] = ['One or more selected products are unavailable.'];
                continue;
            }

            if ($product->stock < $item['quantity']) {
                $errors["items.$productId.quantity"] = [
                    "{$product->name} does not have enough stock for the requested quantity.",
                ];
            }

            if (
                isset($item['expected_unit_price'])
                && $this->moneyToCents($item['expected_unit_price']) !== $this->moneyToCents($product->price)
            ) {
                $errors["items.$productId.expected_unit_price"] = [
                    "The price for {$product->name} has changed. Review your cart before placing the order.",
                ];
            }
        }

        if ($errors !== []) {
            throw ValidationException::withMessages($errors);
        }
    }

    private function generateOrderNumber(): string
    {
        do {
            $orderNumber = 'BSS-'.now()->format('Ymd').'-'.strtoupper(bin2hex(random_bytes(3)));
        } while (Order::query()->where('order_number', $orderNumber)->exists());

        return $orderNumber;
    }

    private function moneyToCents(string|int|float $amount): int
    {
        $parts = explode('.', trim((string) $amount), 2);
        $whole = $parts[0] === '' ? '0' : $parts[0];
        $fraction = str_pad(substr($parts[1] ?? '', 0, 2), 2, '0');

        return ((int) $whole * 100) + (int) $fraction;
    }

    private function centsToMoney(int $cents): string
    {
        return sprintf('%d.%02d', intdiv($cents, 100), $cents % 100);
    }

    private function orderResponse(Order $order, bool $duplicate): JsonResponse
    {
        $payload = [
            'message' => $duplicate
                ? 'This checkout was already submitted. The existing order has been returned.'
                : 'Your order has been placed successfully.',
            'duplicate' => $duplicate,
            'order_number' => $order->order_number,
            'order' => new OrderResource($order),
        ];

        if ($order->user_id === null) {
            $payload['guest_access_token'] = Crypt::decryptString(
                $order->guest_access_token_encrypted,
            );
        }

        return response()->json($payload, $duplicate ? 200 : 201);
    }
}
