<?php

namespace App\Http\Controllers\Api\Admin;

use App\Http\Controllers\Controller;
use App\Http\Resources\ProductResource;
use App\Models\Brand;
use App\Models\Category;
use App\Models\Product;
use Illuminate\Http\JsonResponse;

class DashboardController extends Controller
{
    public function __invoke(): JsonResponse
    {
        $products = Product::query();
        $withRelations = ['category', 'brand', 'images'];

        return response()->json([
            'counts' => [
                'products' => (clone $products)->count(),
                'active_products' => (clone $products)->where('is_active', true)->count(),
                'featured_products' => (clone $products)->where('is_featured', true)->count(),
                'low_stock_products' => (clone $products)->whereColumn('stock', '<=', 'low_stock_threshold')->count(),
                'out_of_stock_products' => (clone $products)->where('stock', 0)->count(),
                'brands' => Brand::query()->count(),
                'categories' => Category::query()->count(),
            ],
            'inventory' => [
                'total_units' => (int) (clone $products)->sum('stock'),
            ],
            'low_stock' => ProductResource::collection(
                (clone $products)->with($withRelations)
                    ->whereColumn('stock', '<=', 'low_stock_threshold')
                    ->orderBy('stock')
                    ->limit(6)
                    ->get()
            ),
            'recently_updated' => ProductResource::collection(
                (clone $products)->with($withRelations)
                    ->latest('updated_at')
                    ->limit(6)
                    ->get()
            ),
        ]);
    }
}
