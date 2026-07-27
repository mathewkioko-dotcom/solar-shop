<?php

namespace App\Http\Requests\Admin;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Support\Str;

class StoreProductRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    protected function prepareForValidation(): void
    {
        $specifications = $this->input('specifications');
        if (is_string($specifications)) {
            $decoded = json_decode($specifications, true);
            if (is_array($decoded)) {
                $this->merge(['specifications' => $decoded]);
            }
        }

        $this->merge([
            'slug' => Str::slug((string) ($this->input('slug') ?: $this->input('name'))),
        ]);
    }

    public function rules(): array
    {
        return $this->productRules();
    }

    /**
     * @return array<string, mixed>
     */
    protected function productRules(): array
    {
        return [
            'category_id' => ['required', 'integer', 'exists:categories,id'],
            'brand_id' => ['nullable', 'integer', 'exists:brands,id,deleted_at,NULL'],
            'name' => ['required', 'string', 'max:255'],
            'slug' => ['required', 'string', 'max:255', 'unique:products,slug'],
            'sku' => ['nullable', 'string', 'max:100', 'unique:products,sku'],
            'model_number' => ['nullable', 'string', 'max:255'],
            'short_description' => ['nullable', 'string', 'max:1000'],
            'description' => ['nullable', 'string'],
            'price' => ['required', 'decimal:0,2', 'min:0'],
            'compare_at_price' => ['nullable', 'decimal:0,2', 'min:0'],
            'stock' => ['required', 'integer', 'min:0'],
            'low_stock_threshold' => ['sometimes', 'integer', 'min:0'],
            'wattage' => ['nullable', 'integer', 'min:0'],
            'capacity_ah' => ['nullable', 'integer', 'min:0'],
            'voltage' => ['nullable', 'string', 'max:100'],
            'warranty' => ['nullable', 'string', 'max:255'],
            'is_featured' => ['sometimes', 'boolean'],
            'is_active' => ['sometimes', 'boolean'],
            'seo_title' => ['nullable', 'string', 'max:255'],
            'seo_description' => ['nullable', 'string', 'max:1000'],
            'specifications' => ['sometimes', 'array', 'max:100'],
            'specifications.*.name' => ['required', 'string', 'max:255'],
            'specifications.*.value' => ['required', 'string', 'max:255'],
            'specifications.*.unit' => ['nullable', 'string', 'max:100'],
            'specifications.*.display_order' => ['sometimes', 'integer', 'min:0'],
            'images' => ['sometimes', 'array', 'max:20'],
            'images.*' => ['file', 'mimes:jpg,jpeg,png,webp', 'max:5120'],
            'datasheet' => ['nullable', 'file', 'mimes:pdf', 'max:15360'],
        ];
    }
}
