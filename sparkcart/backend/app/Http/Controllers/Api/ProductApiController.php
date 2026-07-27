<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Resources\ProductResource;
use App\Models\Product;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Validation\ValidationException;

class ProductApiController extends Controller
{
    public function index(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'category_id' => ['nullable', 'integer', 'min:1'],
            'category' => ['nullable', 'string', 'max:255'],
            'brand' => ['nullable', 'string', 'max:255'],
            'search' => ['nullable', 'string', 'max:255'],
            'min_price' => ['nullable', 'numeric', 'min:0'],
            'max_price' => ['nullable', 'numeric', 'min:0'],
            'in_stock' => ['nullable', 'in:1,true'],
            'sort' => ['nullable', 'in:newest,price_asc,price_desc,name_asc,name_desc'],
            'limit' => ['nullable', 'integer', 'min:1', 'max:100'],
        ]);

        if (
            isset($validated['min_price'], $validated['max_price'])
            && (float) $validated['max_price'] < (float) $validated['min_price']
        ) {
            throw ValidationException::withMessages([
                'max_price' => 'The maximum price must be greater than or equal to the minimum price.',
            ]);
        }

        $search = trim($validated['search'] ?? '');
        $sort = $validated['sort'] ?? 'newest';

        $query = Product::query()
            ->where('is_active', true)
            ->with(['category', 'brand', 'specifications', 'images'])
            ->when(
                isset($validated['category_id']),
                fn ($query) => $query->where('category_id', $validated['category_id'])
            )
            ->when(
                isset($validated['category']),
                fn ($query) => $query->whereHas(
                    'category',
                    fn ($category) => $category->where('slug', $validated['category'])
                )
            )
            ->when(
                isset($validated['brand']),
                fn ($query) => $query->whereHas(
                    'brand',
                    fn ($brand) => $brand
                        ->where('slug', $validated['brand'])
                        ->where('is_active', true)
                        ->whereNull('deleted_at')
                )
            )
            ->when(
                $search !== '',
                fn ($query) => $query->where(function ($searchQuery) use ($search) {
                    $searchQuery
                        ->where('name', 'like', '%' . $search . '%')
                        ->orWhere('sku', 'like', '%' . $search . '%')
                        ->orWhere('model_number', 'like', '%' . $search . '%')
                        ->orWhereHas('brand', function ($brandQuery) use ($search) {
                            $brandQuery->where('name', 'like', '%' . $search . '%');
                        })
                        ->orWhereHas('category', function ($categoryQuery) use ($search) {
                            $categoryQuery->where('name', 'like', '%' . $search . '%');
                        });
                })
            )
            ->when(
                isset($validated['min_price']),
                fn ($query) => $query->where('price', '>=', $validated['min_price'])
            )
            ->when(
                isset($validated['max_price']),
                fn ($query) => $query->where('price', '<=', $validated['max_price'])
            )
            ->when(
                isset($validated['in_stock']),
                fn ($query) => $query->where('stock', '>', 0)
            );

        match ($sort) {
            'price_asc' => $query->orderBy('price'),
            'price_desc' => $query->orderByDesc('price'),
            'name_asc' => $query->orderBy('name'),
            'name_desc' => $query->orderByDesc('name'),
            default => $query->latest(),
        };

        $products = $query
            ->when(isset($validated['limit']), fn ($query) => $query->limit($validated['limit']))
            ->get();

        return ProductResource::collection($products)->response();
    }

    public function show(string $slug): JsonResponse
    {
        $product = Product::query()
            ->where('is_active', true)
            ->with(['category', 'brand', 'specifications', 'images'])
            ->where('slug', $slug)
            ->first();

        if (! $product) {
            return response()->json([
                'message' => 'Product not found.',
            ], 404);
        }

        return response()->json([
            'product' => (new ProductResource($product))->resolve(request()),
        ]);
    }
}
