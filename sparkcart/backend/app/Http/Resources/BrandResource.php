<?php

namespace App\Http\Resources;

use App\Support\ManagedPublicFile;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class BrandResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'name' => $this->name,
            'slug' => $this->slug,
            'description' => $this->description,
            'logo_path' => $this->logo_path,
            'logo_url' => ManagedPublicFile::url($this->logo_path),
            'website_url' => $this->website_url,
            'is_active' => (bool) $this->is_active,
            'display_order' => (int) $this->display_order,
            'products_count' => $this->whenCounted('products'),
            'archived_at' => $this->deleted_at?->toISOString(),
            'created_at' => $this->created_at?->toISOString(),
            'updated_at' => $this->updated_at?->toISOString(),
        ];
    }
}
