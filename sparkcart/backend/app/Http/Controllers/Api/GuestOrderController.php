<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Resources\OrderResource;
use App\Models\Order;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Str;

class GuestOrderController extends Controller
{
    public function show(string $token): JsonResponse
    {
        abort_unless(
            strlen($token) === 64 && ctype_xdigit($token),
            404,
        );

        $order = Order::query()
            ->whereNull('user_id')
            ->where('guest_access_token_hash', hash('sha256', $token))
            ->with('items')
            ->withCount('items')
            ->firstOrFail();

        return response()->json([
            'order' => new OrderResource($order),
        ]);
    }
}
