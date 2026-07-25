<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Product;
use Illuminate\Http\JsonResponse;

class ProductApiController extends Controller
{
    public function index(): JsonResponse
    {
        $products = Product::query()
            ->with('category')
            ->get();

        return response()->json($products);
    }

    public function show(string $slug): JsonResponse
    {
        $product = Product::query()
            ->with('category')
            ->where('slug', $slug)
            ->first();

        if (! $product) {
            return response()->json([
                'message' => 'Product not found.',
            ], 404);
        }

        return response()->json([
            'product' => $product,
        ]);
    }
}