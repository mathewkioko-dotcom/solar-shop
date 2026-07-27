<?php

namespace App\Http\Resources;

use App\Support\ManagedPublicFile;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class ProductImageResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'image_path' => $this->image_path,
            'url' => ManagedPublicFile::url($this->image_path),
            'alt' => $this->alt_text,
            'alt_text' => $this->alt_text,
            'display_order' => (int) $this->display_order,
            'is_primary' => (bool) $this->is_primary,
        ];
    }
}
