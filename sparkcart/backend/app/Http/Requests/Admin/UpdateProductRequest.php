<?php

namespace App\Http\Requests\Admin;

use App\Models\Product;
use Illuminate\Validation\Rule;

class UpdateProductRequest extends StoreProductRequest
{
    protected function prepareForValidation(): void
    {
        $specifications = $this->input('specifications');
        if (is_string($specifications)) {
            $decoded = json_decode($specifications, true);
            if (is_array($decoded)) {
                $this->merge(['specifications' => $decoded]);
            }
        }
    }

    public function rules(): array
    {
        /** @var Product $product */
        $product = $this->route('product');
        $rules = $this->productRules();

        foreach (['category_id', 'name', 'price', 'stock'] as $field) {
            array_unshift($rules[$field], 'sometimes');
        }
        $rules['slug'] = ['sometimes', 'required', 'string', 'max:255', Rule::unique('products', 'slug')->ignore($product)];
        $rules['sku'] = ['nullable', 'string', 'max:100', Rule::unique('products', 'sku')->ignore($product)];

        return $rules;
    }
}
