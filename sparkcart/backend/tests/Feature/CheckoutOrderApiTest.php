<?php

namespace Tests\Feature;

use App\Models\Address;
use App\Models\Category;
use App\Models\Order;
use App\Models\Product;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Str;
use Laravel\Sanctum\Sanctum;
use Tests\TestCase;

class CheckoutOrderApiTest extends TestCase
{
    use RefreshDatabase;

    public function test_guest_can_create_an_order_with_secure_confirmation_access(): void
    {
        [$user, $product] = $this->customerAndProduct();

        $response = $this->postJson('/api/checkout/orders', $this->payload($user, $product))
            ->assertCreated()
            ->assertJsonPath('duplicate', false)
            ->assertJsonPath('order.customer_email', $user->email);

        $token = $response->json('guest_access_token');
        $this->assertIsString($token);
        $this->assertMatchesRegularExpression('/^[a-f0-9]{64}$/', $token);
        $this->assertSame($response->json('order.order_number'), $response->json('order_number'));

        $order = Order::query()->sole();
        $this->assertNull($order->user_id);
        $this->assertSame(hash('sha256', $token), $order->guest_access_token_hash);
        $this->assertNotSame($token, $order->guest_access_token_encrypted);

        $this->getJson("/api/guest-orders/{$token}")
            ->assertOk()
            ->assertJsonPath('order.order_number', $order->order_number)
            ->assertJsonMissingPath('order.guest_access_token_hash')
            ->assertJsonMissingPath('order.guest_access_token_encrypted');
    }

    public function test_invalid_bearer_token_is_not_treated_as_guest_checkout(): void
    {
        [$user, $product] = $this->customerAndProduct();

        $this->withToken('not-a-valid-sanctum-token')
            ->postJson('/api/checkout/orders', $this->payload($user, $product))
            ->assertUnauthorized();

        $this->assertDatabaseCount('orders', 0);
    }

    public function test_invalid_guest_confirmation_token_exposes_no_order_information(): void
    {
        $this->getJson('/api/guest-orders/'.str_repeat('0', 64))
            ->assertNotFound()
            ->assertJsonMissingPath('order');
    }

    public function test_guest_cannot_save_an_address(): void
    {
        [$user, $product] = $this->customerAndProduct();

        $this->postJson('/api/checkout/orders', $this->payload($user, $product, saveAddress: true))
            ->assertUnprocessable()
            ->assertJsonValidationErrors('save_address');

        $this->assertDatabaseCount('orders', 0);
        $this->assertDatabaseCount('addresses', 0);
    }

    public function test_legal_acceptance_is_required_and_versions_are_server_assigned(): void
    {
        [$user, $product] = $this->customerAndProduct();
        $payload = $this->payload($user, $product);
        $payload['terms_version'] = 'client-controlled';
        $payload['privacy_version'] = 'client-controlled';
        unset($payload['legal_acceptance']);

        $this->postJson('/api/checkout/orders', $payload)
            ->assertUnprocessable()
            ->assertJsonValidationErrors('legal_acceptance');

        $payload['legal_acceptance'] = true;
        $this->postJson('/api/checkout/orders', $payload)->assertCreated();

        $order = Order::query()->sole();
        $this->assertSame('2026-07', $order->terms_version);
        $this->assertSame('2026-07', $order->privacy_version);
        $this->assertNotNull($order->terms_accepted_at);
        $this->assertNotNull($order->privacy_accepted_at);
    }

    public function test_duplicate_guest_submission_returns_original_access_token(): void
    {
        [$user, $product] = $this->customerAndProduct();
        $payload = $this->payload($user, $product);

        $first = $this->postJson('/api/checkout/orders', $payload)->assertCreated();
        $second = $this->postJson('/api/checkout/orders', $payload)
            ->assertOk()
            ->assertJsonPath('duplicate', true);

        $this->assertSame($first->json('order_number'), $second->json('order_number'));
        $this->assertSame($first->json('guest_access_token'), $second->json('guest_access_token'));
        $this->assertDatabaseCount('orders', 1);
        $this->assertDatabaseCount('order_items', 1);
    }

    public function test_guest_order_can_be_recovered_with_original_secret_and_token(): void
    {
        [$user, $product] = $this->customerAndProduct();
        $payload = $this->payload($user, $product);
        $created = $this->postJson('/api/checkout/orders', $payload)->assertCreated();

        $recovered = $this
            ->withHeader('X-Checkout-Recovery-Secret', $payload['checkout_recovery_secret'])
            ->getJson("/api/checkout/orders/recover/{$payload['submission_id']}")
            ->assertOk()
            ->assertJsonPath('recovered', true)
            ->assertJsonPath('order_number', $created->json('order_number'));

        $this->assertSame(
            $created->json('guest_access_token'),
            $recovered->json('guest_access_token'),
        );
    }

    public function test_guest_recovery_rejects_invalid_or_missing_secret(): void
    {
        [$user, $product] = $this->customerAndProduct();
        $payload = $this->payload($user, $product);
        $this->postJson('/api/checkout/orders', $payload)->assertCreated();
        $path = "/api/checkout/orders/recover/{$payload['submission_id']}";

        $this->getJson($path)->assertNotFound()->assertJsonMissingPath('order');
        $this->withHeader('X-Checkout-Recovery-Secret', str_repeat('0', 64))
            ->getJson($path)
            ->assertNotFound()
            ->assertJsonMissingPath('order');
    }

    public function test_guest_duplicate_retry_rejects_a_different_recovery_secret(): void
    {
        [$user, $product] = $this->customerAndProduct();
        $payload = $this->payload($user, $product);
        $this->postJson('/api/checkout/orders', $payload)->assertCreated();
        $payload['checkout_recovery_secret'] = str_repeat('0', 64);

        $this->postJson('/api/checkout/orders', $payload)->assertNotFound();
        $this->assertDatabaseCount('orders', 1);
    }

    public function test_authenticated_recovery_only_returns_the_owners_order(): void
    {
        [$owner, $product] = $this->customerAndProduct();
        Sanctum::actingAs($owner);
        $payload = $this->payload($owner, $product);
        $created = $this->postJson('/api/checkout/orders', $payload)->assertCreated();
        $path = "/api/checkout/orders/recover/{$payload['submission_id']}";

        $this->getJson($path)
            ->assertOk()
            ->assertJsonPath('order_number', $created->json('order_number'))
            ->assertJsonMissingPath('guest_access_token');

        Sanctum::actingAs(User::factory()->create());
        $this->getJson($path)->assertNotFound()->assertJsonMissingPath('order');
    }

    public function test_customer_can_create_an_order_with_server_calculated_totals(): void
    {
        [$user, $product] = $this->customerAndProduct(price: '1234.50', stock: 5);
        Sanctum::actingAs($user);

        $response = $this->postJson('/api/checkout/orders', $this->payload($user, $product, 2));

        $response
            ->assertCreated()
            ->assertJsonPath('duplicate', false)
            ->assertJsonPath('order.customer_email', $user->email)
            ->assertJsonPath('order.subtotal', '2469.00')
            ->assertJsonPath('order.delivery_amount', '0.00')
            ->assertJsonPath('order.tax_amount', '0.00')
            ->assertJsonPath('order.total', '2469.00')
            ->assertJsonPath('order.currency', 'KES')
            ->assertJsonPath('order.payment_status', 'pending')
            ->assertJsonPath('order.order_status', 'pending')
            ->assertJsonPath('order.items.0.product_name', $product->name)
            ->assertJsonPath('order.items.0.unit_price', '1234.50')
            ->assertJsonPath('order.items.0.line_total', '2469.00');

        $this->assertMatchesRegularExpression(
            '/^BSS-\d{8}-[A-F0-9]{6}$/',
            $response->json('order.order_number'),
        );
        $this->assertDatabaseHas('orders', [
            'user_id' => $user->id,
            'subtotal' => '2469.00',
            'total' => '2469.00',
        ]);
        $this->assertDatabaseHas('order_items', [
            'product_id' => $product->id,
            'quantity' => 2,
            'unit_price' => '1234.50',
            'line_total' => '2469.00',
        ]);
        $this->assertSame(5, $product->fresh()->stock);
    }

    public function test_checkout_ignores_untrusted_totals_and_uses_current_database_price(): void
    {
        [$user, $product] = $this->customerAndProduct(price: '8500.00');
        Sanctum::actingAs($user);
        $payload = $this->payload($user, $product, 2);
        unset($payload['items'][0]['expected_unit_price']);
        $payload['subtotal'] = '1.00';
        $payload['total'] = '1.00';
        $payload['items'][0]['unit_price'] = '1.00';

        $this->postJson('/api/checkout/orders', $payload)
            ->assertCreated()
            ->assertJsonPath('order.subtotal', '17000.00')
            ->assertJsonPath('order.total', '17000.00');
    }

    public function test_invalid_product_is_rejected(): void
    {
        [$user, $product] = $this->customerAndProduct();
        Sanctum::actingAs($user);
        $payload = $this->payload($user, $product);
        $payload['items'][0]['product_id'] = 999999;

        $this->postJson('/api/checkout/orders', $payload)
            ->assertUnprocessable()
            ->assertJsonValidationErrors('items.999999.product_id');

        $this->assertDatabaseCount('orders', 0);
    }

    public function test_out_of_stock_quantity_is_rejected(): void
    {
        [$user, $product] = $this->customerAndProduct(stock: 1);
        Sanctum::actingAs($user);

        $this->postJson('/api/checkout/orders', $this->payload($user, $product, 2))
            ->assertUnprocessable()
            ->assertJsonValidationErrors("items.{$product->id}.quantity");

        $this->assertDatabaseCount('orders', 0);
    }

    public function test_quantity_must_be_a_positive_integer(): void
    {
        [$user, $product] = $this->customerAndProduct();
        Sanctum::actingAs($user);
        $payload = $this->payload($user, $product);
        $payload['items'][0]['quantity'] = 0;

        $this->postJson('/api/checkout/orders', $payload)
            ->assertUnprocessable()
            ->assertJsonValidationErrors('items.0.quantity');
    }

    public function test_changed_product_price_is_rejected_for_customer_review(): void
    {
        [$user, $product] = $this->customerAndProduct(price: '5000.00');
        Sanctum::actingAs($user);
        $payload = $this->payload($user, $product);
        $payload['items'][0]['expected_unit_price'] = '4500.00';

        $this->postJson('/api/checkout/orders', $payload)
            ->assertUnprocessable()
            ->assertJsonValidationErrors("items.{$product->id}.expected_unit_price");

        $this->assertDatabaseCount('orders', 0);
    }

    public function test_checkout_saves_address_when_requested(): void
    {
        [$user, $product] = $this->customerAndProduct();
        Sanctum::actingAs($user);

        $this->postJson('/api/checkout/orders', $this->payload($user, $product, saveAddress: true))
            ->assertCreated();

        $this->assertDatabaseHas('addresses', [
            'user_id' => $user->id,
            'label' => 'Home',
            'phone' => '+254712345678',
            'street_address' => 'Example Road',
            'is_default' => true,
        ]);
    }

    public function test_checkout_does_not_save_address_when_not_requested(): void
    {
        [$user, $product] = $this->customerAndProduct();
        Sanctum::actingAs($user);

        $this->postJson('/api/checkout/orders', $this->payload($user, $product))
            ->assertCreated();

        $this->assertDatabaseCount('addresses', 0);
    }

    public function test_duplicate_submission_returns_existing_order(): void
    {
        [$user, $product] = $this->customerAndProduct();
        Sanctum::actingAs($user);
        $payload = $this->payload($user, $product);

        $first = $this->postJson('/api/checkout/orders', $payload)->assertCreated();
        $second = $this->postJson('/api/checkout/orders', $payload)
            ->assertOk()
            ->assertJsonPath('duplicate', true);

        $this->assertSame(
            $first->json('order.order_number'),
            $second->json('order.order_number'),
        );
        $this->assertDatabaseCount('orders', 1);
        $this->assertDatabaseCount('order_items', 1);
    }

    public function test_customer_order_list_is_newest_first_and_paginated(): void
    {
        [$user, $product] = $this->customerAndProduct();
        Sanctum::actingAs($user);
        $firstPayload = $this->payload($user, $product);
        $secondPayload = $this->payload($user, $product);

        $firstNumber = $this->postJson('/api/checkout/orders', $firstPayload)
            ->json('order.order_number');
        Order::query()->where('order_number', $firstNumber)->update([
            'placed_at' => now()->subDay(),
        ]);
        $secondNumber = $this->postJson('/api/checkout/orders', $secondPayload)
            ->json('order.order_number');

        $this->getJson('/api/orders')
            ->assertOk()
            ->assertJsonPath('data.0.order_number', $secondNumber)
            ->assertJsonPath('data.1.order_number', $firstNumber)
            ->assertJsonPath('meta.current_page', 1)
            ->assertJsonPath('meta.per_page', 10);
    }

    public function test_guest_order_does_not_appear_in_customer_order_history(): void
    {
        [$user, $product] = $this->customerAndProduct();
        $this->postJson('/api/checkout/orders', $this->payload($user, $product))
            ->assertCreated();

        Sanctum::actingAs($user);
        $this->getJson('/api/orders')
            ->assertOk()
            ->assertJsonCount(0, 'data');
    }

    public function test_customer_can_view_own_order_details(): void
    {
        [$user, $product] = $this->customerAndProduct();
        Sanctum::actingAs($user);
        $orderNumber = $this->postJson('/api/checkout/orders', $this->payload($user, $product))
            ->json('order.order_number');

        $this->getJson("/api/orders/{$orderNumber}")
            ->assertOk()
            ->assertJsonPath('order_number', $orderNumber)
            ->assertJsonPath('items.0.product_slug', $product->slug)
            ->assertJsonMissingPath('user_id')
            ->assertJsonMissingPath('checkout_submission_id');
    }

    public function test_customer_cannot_view_another_customers_order(): void
    {
        [$owner, $product] = $this->customerAndProduct();
        Sanctum::actingAs($owner);
        $orderNumber = $this->postJson('/api/checkout/orders', $this->payload($owner, $product))
            ->json('order.order_number');

        Sanctum::actingAs(User::factory()->create());
        $this->getJson("/api/orders/{$orderNumber}")->assertNotFound();
    }

    public function test_address_routes_enforce_customer_ownership(): void
    {
        $owner = User::factory()->create();
        $otherCustomer = User::factory()->create();
        $ownerAddress = Address::query()->create([
            'user_id' => $owner->id,
            ...$this->address(),
            'is_default' => true,
        ]);
        $otherAddress = Address::query()->create([
            'user_id' => $otherCustomer->id,
            ...$this->address(),
            'label' => 'Office',
            'is_default' => true,
        ]);

        Sanctum::actingAs($owner);

        $this->getJson('/api/addresses')
            ->assertOk()
            ->assertJsonCount(1, 'data')
            ->assertJsonPath('data.0.id', $ownerAddress->id);
        $this->deleteJson("/api/addresses/{$otherAddress->id}")->assertNotFound();

        $this->assertDatabaseHas('addresses', ['id' => $otherAddress->id]);
    }

    private function customerAndProduct(string $price = '2500.00', int $stock = 10): array
    {
        $user = User::factory()->create();
        $category = Category::query()->create([
            'name' => 'Solar Panels',
            'slug' => 'solar-panels',
        ]);
        $product = Product::query()->create([
            'category_id' => $category->id,
            'name' => 'Premium Solar Panel',
            'slug' => 'premium-solar-panel',
            'description' => 'Test product',
            'price' => $price,
            'stock' => $stock,
            'image_path' => 'images/panel.webp',
            'is_featured' => false,
        ]);

        return [$user, $product];
    }

    private function payload(
        User $user,
        Product $product,
        int $quantity = 1,
        bool $saveAddress = false,
    ): array {
        return [
            'submission_id' => (string) Str::uuid(),
            'checkout_recovery_secret' => bin2hex(random_bytes(32)),
            'contact' => [
                'first_name' => $user->first_name,
                'last_name' => $user->last_name,
                'email' => $user->email,
                'phone' => '0712345678',
            ],
            'address' => $this->address(),
            'save_address' => $saveAddress,
            'delivery_method' => 'standard_delivery',
            'payment_method' => 'pay_on_confirmation',
            'legal_acceptance' => true,
            'items' => [[
                'product_id' => $product->id,
                'quantity' => $quantity,
                'expected_unit_price' => $product->price,
            ]],
        ];
    }

    private function address(): array
    {
        return [
            'label' => 'Home',
            'first_name' => 'Jane',
            'last_name' => 'Doe',
            'phone' => '+254712345678',
            'county' => 'Nairobi',
            'city' => 'Nairobi',
            'street_address' => 'Example Road',
            'building_details' => 'Apartment 4B',
            'postal_code' => '00100',
            'delivery_instructions' => 'Call on arrival',
        ];
    }
}
