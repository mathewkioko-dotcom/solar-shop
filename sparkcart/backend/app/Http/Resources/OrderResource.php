<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class OrderResource extends JsonResource
{
    public static $wrap = null;

    public function toArray(Request $request): array
    {
        return [
            'order_number' => $this->order_number,
            'customer_email' => $this->customer_email,
            'customer_phone' => $this->customer_phone,
            'delivery_address' => [
                'first_name' => $this->delivery_first_name,
                'last_name' => $this->delivery_last_name,
                'phone' => $this->delivery_phone,
                'county' => $this->delivery_county,
                'city' => $this->delivery_city,
                'street_address' => $this->delivery_street_address,
                'building_details' => $this->delivery_building_details,
                'postal_code' => $this->delivery_postal_code,
                'delivery_instructions' => $this->delivery_instructions,
            ],
            'delivery_method' => $this->delivery_method,
            'payment_method' => $this->payment_method,
            'payment_status' => $this->payment_status,
            'order_status' => $this->order_status,
            'subtotal' => $this->subtotal,
            'delivery_amount' => $this->delivery_amount,
            'delivery_status' => 'pending_confirmation',
            'tax_amount' => $this->tax_amount,
            'total' => $this->total,
            'currency' => $this->currency,
            'item_count' => $this->whenCounted('items'),
            'items' => OrderItemResource::collection($this->whenLoaded('items')),
            'placed_at' => $this->placed_at?->toISOString(),
            'created_at' => $this->created_at?->toISOString(),
        ];
    }
}
