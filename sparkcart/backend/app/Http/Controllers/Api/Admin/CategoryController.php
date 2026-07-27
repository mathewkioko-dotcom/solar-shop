<?php

namespace App\Http\Controllers\Api\Admin;

use App\Http\Controllers\Controller;
use App\Http\Requests\Admin\StoreCategoryRequest;
use App\Http\Requests\Admin\UpdateCategoryRequest;
use App\Http\Resources\CategoryResource;
use App\Models\Category;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\AnonymousResourceCollection;
use Symfony\Component\HttpFoundation\Response;

class CategoryController extends Controller
{
    public function index(Request $request): AnonymousResourceCollection
    {
        $validated = $request->validate([
            'archived' => ['nullable', 'in:with,only,without'],
            'search' => ['nullable', 'string', 'max:255'],
            'per_page' => ['nullable', 'integer', 'min:1', 'max:100'],
        ]);

        $query = Category::query()
            ->withCount('products')
            ->when(($validated['archived'] ?? 'without') === 'with', fn ($query) => $query->withTrashed())
            ->when(($validated['archived'] ?? 'without') === 'only', fn ($query) => $query->onlyTrashed())
            ->when(
                trim($validated['search'] ?? '') !== '',
                fn ($query) => $query->where('name', 'like', '%'.trim($validated['search']).'%')
            )
            ->orderBy('display_order')
            ->orderBy('name');

        return CategoryResource::collection($query->paginate($validated['per_page'] ?? 50));
    }

    public function store(StoreCategoryRequest $request): JsonResponse
    {
        $category = Category::query()->create($request->validated());

        return (new CategoryResource($category->loadCount('products')))
            ->response()
            ->setStatusCode(Response::HTTP_CREATED);
    }

    public function update(UpdateCategoryRequest $request, Category $category): CategoryResource
    {
        $category->update($request->validated());

        return new CategoryResource($category->refresh()->loadCount('products'));
    }

    public function destroy(Category $category): JsonResponse
    {
        if ($category->products()->exists()) {
            return response()->json([
                'message' => 'This category cannot be archived while products are assigned.',
            ], Response::HTTP_CONFLICT);
        }

        $category->update(['is_active' => false]);
        $category->delete();

        return response()->json(['message' => 'Category archived successfully.']);
    }
}
