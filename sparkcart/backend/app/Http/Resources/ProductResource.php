<?php

namespace App\Http\Resources;

use App\Support\ManagedPublicFile;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class ProductResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        $primary = $this->relationLoaded('images')
            ? $this->images->firstWhere('is_primary', true) ?? $this->images->first()
            : null;
        $primaryPath = $primary?->image_path ?: $this->image_path;
        $images = $this->relationLoaded('images')
            ? ProductImageResource::collection($this->images)
            : [];

        if ($this->relationLoaded('images') && $this->images->isEmpty() && $this->image_path) {
            $images = [[
                'id' => null,
                'image_path' => $this->image_path,
                'url' => ManagedPublicFile::url($this->image_path),
                'alt' => $this->name,
                'alt_text' => $this->name,
                'display_order' => 0,
                'is_primary' => true,
                'legacy' => true,
            ]];
        }

        return [
            'id' => $this->id,
            'category_id' => $this->category_id,
            'brand_id' => $this->brand_id,
            'name' => $this->name,
            'slug' => $this->slug,
            'sku' => $this->sku,
            'model_number' => $this->model_number,
            'short_description' => $this->short_description,
            'description' => $this->description,
            'price' => $this->price,
            'compare_at_price' => $this->compare_at_price,
            'stock' => (int) $this->stock,
            'low_stock_threshold' => (int) $this->low_stock_threshold,
            'image_path' => $primaryPath,
            'image_url' => ManagedPublicFile::url($primaryPath),
            'primary_image' => ManagedPublicFile::url($primaryPath),
            'images' => $images,
            'wattage' => $this->wattage,
            'capacity_ah' => $this->capacity_ah,
            'voltage' => $this->voltage,
            'warranty' => $this->warranty,
            'datasheet_path' => $this->datasheet_path,
            'datasheet_url' => ManagedPublicFile::url($this->datasheet_path),
            'is_featured' => (bool) $this->is_featured,
            'is_active' => (bool) $this->is_active,
            'seo_title' => $this->seo_title,
            'seo_description' => $this->seo_description,
            'category' => $this->whenLoaded('category', fn () => [
                'id' => $this->category->id,
                'name' => $this->category->name,
                'slug' => $this->category->slug,
            ]),
            'category_name' => $this->whenLoaded('category', fn () => $this->category->name),
            'brand' => BrandResource::make($this->whenLoaded('brand')),
            'brand_name' => $this->whenLoaded('brand', fn () => $this->brand?->name),
            'specifications' => ProductSpecificationResource::collection(
                $this->whenLoaded('specifications')
            ),
            'archived_at' => $this->deleted_at?->toISOString(),
            'created_at' => $this->created_at?->toISOString(),
            'updated_at' => $this->updated_at?->toISOString(),
        ];
    }
}
