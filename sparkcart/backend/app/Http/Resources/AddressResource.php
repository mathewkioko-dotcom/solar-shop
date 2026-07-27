<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class AddressResource extends JsonResource
{
    public static $wrap = null;

    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'label' => $this->label,
            'first_name' => $this->first_name,
            'last_name' => $this->last_name,
            'phone' => $this->phone,
            'county' => $this->county,
            'city' => $this->city,
            'street_address' => $this->street_address,
            'building_details' => $this->building_details,
            'postal_code' => $this->postal_code,
            'delivery_instructions' => $this->delivery_instructions,
            'is_default' => $this->is_default,
            'created_at' => $this->created_at?->toISOString(),
        ];
    }
}
