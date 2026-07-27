<?php

namespace App\Http\Controllers\Api\Admin;

use App\Http\Controllers\Controller;
use App\Http\Requests\Admin\StoreProductRequest;
use App\Http\Requests\Admin\UpdateProductRequest;
use App\Http\Requests\Admin\UpdateStockRequest;
use App\Http\Requests\Admin\UploadDatasheetRequest;
use App\Http\Requests\Admin\UploadProductImageRequest;
use App\Http\Resources\ProductImageResource;
use App\Http\Resources\ProductResource;
use App\Models\Product;
use App\Models\ProductImage;
use App\Support\ManagedPublicFile;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\AnonymousResourceCollection;
use Illuminate\Support\Arr;
use Illuminate\Support\Facades\DB;
use Symfony\Component\HttpFoundation\Response;
use Throwable;

class ProductController extends Controller
{
    public function index(Request $request): AnonymousResourceCollection
    {
        $validated = $request->validate([
            'search' => ['nullable', 'string', 'max:255'],
            'category' => ['nullable', 'integer', 'exists:categories,id'],
            'brand' => ['nullable', 'integer', 'exists:brands,id'],
            'active' => ['nullable', 'boolean'],
            'featured' => ['nullable', 'boolean'],
            'stock_status' => ['nullable', 'in:in_stock,out_of_stock,low_stock'],
            'low_stock' => ['nullable', 'boolean'],
            'archived' => ['nullable', 'in:with,only,without'],
            'sort' => ['nullable', 'in:name,price,stock,newest,oldest'],
            'direction' => ['nullable', 'in:asc,desc'],
            'per_page' => ['nullable', 'integer', 'min:1', 'max:100'],
        ]);

        $search = trim($validated['search'] ?? '');
        $query = Product::query()
            ->with(['category', 'brand', 'specifications', 'images'])
            ->when(
                ($validated['archived'] ?? 'without') === 'with',
                fn ($query) => $query->withTrashed()
            )
            ->when(
                ($validated['archived'] ?? 'without') === 'only',
                fn ($query) => $query->onlyTrashed()
            )
            ->when($search !== '', function ($query) use ($search): void {
                $query->where(function ($nested) use ($search): void {
                    $nested
                        ->where('name', 'like', "%{$search}%")
                        ->orWhere('sku', 'like', "%{$search}%")
                        ->orWhere('model_number', 'like', "%{$search}%")
                        ->orWhereHas('brand', fn ($brand) => $brand->where('name', 'like', "%{$search}%"))
                        ->orWhereHas('category', fn ($category) => $category->where('name', 'like', "%{$search}%"));
                });
            })
            ->when(isset($validated['category']), fn ($query) => $query->where('category_id', $validated['category']))
            ->when(isset($validated['brand']), fn ($query) => $query->where('brand_id', $validated['brand']))
            ->when(isset($validated['active']), fn ($query) => $query->where('is_active', $validated['active']))
            ->when(isset($validated['featured']), fn ($query) => $query->where('is_featured', $validated['featured']))
            ->when(
                ($validated['stock_status'] ?? null) === 'in_stock',
                fn ($query) => $query->where('stock', '>', 0)
            )
            ->when(
                ($validated['stock_status'] ?? null) === 'out_of_stock',
                fn ($query) => $query->where('stock', 0)
            )
            ->when(
                ($validated['stock_status'] ?? null) === 'low_stock'
                    || ($validated['low_stock'] ?? false),
                fn ($query) => $query->whereColumn('stock', '<=', 'low_stock_threshold')
            );

        $sort = $validated['sort'] ?? 'newest';
        $direction = $validated['direction'] ?? ($sort === 'oldest' ? 'asc' : 'desc');
        match ($sort) {
            'name' => $query->orderBy('name', $direction),
            'price' => $query->orderBy('price', $direction),
            'stock' => $query->orderBy('stock', $direction),
            'oldest' => $query->orderBy('created_at'),
            default => $query->orderByDesc('created_at'),
        };

        return ProductResource::collection($query->paginate($validated['per_page'] ?? 20));
    }

    public function store(StoreProductRequest $request): JsonResponse
    {
        $validated = $request->validated();
        $storedPaths = [];
        $imagePaths = [];

        try {
            foreach ($request->file('images', []) as $file) {
                $imagePaths[] = ManagedPublicFile::store($file, 'products/images');
            }
            $storedPaths = $imagePaths;

            $datasheetPath = $request->file('datasheet')
                ? ManagedPublicFile::store($request->file('datasheet'), 'products/datasheets')
                : null;
            if ($datasheetPath) {
                $storedPaths[] = $datasheetPath;
            }

            $product = DB::transaction(function () use ($validated, $imagePaths, $datasheetPath): Product {
                $attributes = Arr::except($validated, ['specifications', 'images', 'datasheet']);
                $attributes['datasheet_path'] = $datasheetPath;
                $attributes['image_path'] = $imagePaths[0] ?? null;
                $product = Product::query()->create($attributes);

                $this->syncSpecifications($product, $validated['specifications'] ?? []);
                $this->createImageRecords($product, $imagePaths);

                return $product;
            });
        } catch (Throwable $exception) {
            foreach ($storedPaths as $path) {
                ManagedPublicFile::delete($path);
            }
            throw $exception;
        }

        return (new ProductResource($this->loadProduct($product)))
            ->response()
            ->setStatusCode(Response::HTTP_CREATED);
    }

    public function show(Product $product): ProductResource
    {
        return new ProductResource($this->loadProduct($product));
    }

    public function update(UpdateProductRequest $request, Product $product): ProductResource
    {
        $validated = $request->validated();
        $newPaths = [];
        $newImagePaths = [];
        $oldDatasheetPath = null;

        try {
            foreach ($request->file('images', []) as $file) {
                $newImagePaths[] = ManagedPublicFile::store($file, 'products/images');
            }
            $newPaths = $newImagePaths;
            $newDatasheetPath = $request->file('datasheet')
                ? ManagedPublicFile::store($request->file('datasheet'), 'products/datasheets')
                : null;
            if ($newDatasheetPath) {
                $newPaths[] = $newDatasheetPath;
                $oldDatasheetPath = $product->datasheet_path;
            }

            DB::transaction(function () use ($validated, $product, $newImagePaths, $newDatasheetPath): void {
                $attributes = Arr::except($validated, ['specifications', 'images', 'datasheet']);
                if ($newDatasheetPath) {
                    $attributes['datasheet_path'] = $newDatasheetPath;
                }
                $product->update($attributes);

                if (array_key_exists('specifications', $validated)) {
                    $this->syncSpecifications($product, $validated['specifications']);
                }
                if ($newImagePaths !== []) {
                    $this->createImageRecords($product, $newImagePaths);
                }
            });
        } catch (Throwable $exception) {
            foreach ($newPaths as $path) {
                ManagedPublicFile::delete($path);
            }
            throw $exception;
        }

        if ($newDatasheetPath ?? null) {
            ManagedPublicFile::delete($oldDatasheetPath);
        }

        return new ProductResource($this->loadProduct($product->refresh()));
    }

    public function destroy(Product $product): JsonResponse
    {
        $product->update(['is_active' => false]);
        $product->delete();

        return response()->json(['message' => 'Product archived successfully.']);
    }

    public function restore(int $product): ProductResource
    {
        $model = Product::onlyTrashed()->findOrFail($product);
        $model->restore();

        return new ProductResource($this->loadProduct($model->refresh()));
    }

    public function forceDelete(Request $request, int $product): JsonResponse
    {
        $request->validate(['confirmation' => ['required', 'in:DELETE']]);
        $model = Product::withTrashed()->with('images')->findOrFail($product);
        $model->forceDelete();

        return response()->json(['message' => 'Product permanently deleted.']);
    }

    public function uploadImage(
        UploadProductImageRequest $request,
        Product $product
    ): JsonResponse {
        $path = ManagedPublicFile::store($request->file('image'), 'products/images');

        try {
            $image = DB::transaction(function () use ($request, $product, $path): ProductImage {
                $makePrimary = $request->boolean('is_primary')
                    || ! $product->images()->where('is_primary', true)->exists();
                if ($makePrimary) {
                    $product->images()->update(['is_primary' => false]);
                }

                $image = $product->images()->create([
                    'image_path' => $path,
                    'alt_text' => $request->validated('alt_text'),
                    'display_order' => $request->integer('display_order', 0),
                    'is_primary' => $makePrimary,
                ]);
                if ($makePrimary) {
                    $product->update(['image_path' => $path]);
                }

                return $image;
            });
        } catch (Throwable $exception) {
            ManagedPublicFile::delete($path);
            throw $exception;
        }

        return (new ProductImageResource($image))
            ->response()
            ->setStatusCode(Response::HTTP_CREATED);
    }

    public function removeImage(Product $product, ProductImage $image): JsonResponse
    {
        abort_unless($image->product_id === $product->id, Response::HTTP_NOT_FOUND);
        $path = $image->image_path;

        DB::transaction(function () use ($product, $image): void {
            $wasPrimary = $image->is_primary;
            $image->delete();
            if ($wasPrimary) {
                $replacement = $product->images()->orderBy('display_order')->first();
                if ($replacement) {
                    $replacement->update(['is_primary' => true]);
                }
                $product->update(['image_path' => $replacement?->image_path]);
            }
        });
        ManagedPublicFile::delete($path);

        return response()->json(['message' => 'Product image removed.']);
    }

    public function updateImage(Request $request, Product $product, ProductImage $image): ProductImageResource
    {
        abort_unless($image->product_id === $product->id, Response::HTTP_NOT_FOUND);
        $validated = $request->validate([
            'alt_text' => ['nullable', 'string', 'max:255'],
            'display_order' => ['required', 'integer', 'min:0'],
        ]);
        $image->update($validated);

        return new ProductImageResource($image->refresh());
    }

    public function setPrimaryImage(Product $product, ProductImage $image): ProductResource
    {
        abort_unless($image->product_id === $product->id, Response::HTTP_NOT_FOUND);

        DB::transaction(function () use ($product, $image): void {
            $product->images()->update(['is_primary' => false]);
            $image->update(['is_primary' => true]);
            $product->update(['image_path' => $image->image_path]);
        });

        return new ProductResource($this->loadProduct($product->refresh()));
    }

    public function uploadDatasheet(
        UploadDatasheetRequest $request,
        Product $product
    ): ProductResource {
        $newPath = ManagedPublicFile::store($request->file('datasheet'), 'products/datasheets');
        $oldPath = $product->datasheet_path;

        try {
            $product->update(['datasheet_path' => $newPath]);
        } catch (Throwable $exception) {
            ManagedPublicFile::delete($newPath);
            throw $exception;
        }
        ManagedPublicFile::delete($oldPath);

        return new ProductResource($this->loadProduct($product->refresh()));
    }

    public function removeDatasheet(Product $product): ProductResource
    {
        $oldPath = $product->datasheet_path;
        $product->update(['datasheet_path' => null]);
        ManagedPublicFile::delete($oldPath);

        return new ProductResource($this->loadProduct($product->refresh()));
    }

    public function updateStock(UpdateStockRequest $request, Product $product): ProductResource
    {
        DB::transaction(function () use ($request, $product): void {
            Product::query()->whereKey($product->id)->lockForUpdate()->firstOrFail()
                ->update(['stock' => $request->integer('stock')]);
        });

        return new ProductResource($this->loadProduct($product->refresh()));
    }

    public function updateFeatured(Request $request, Product $product): ProductResource
    {
        $validated = $request->validate(['is_featured' => ['required', 'boolean']]);
        $product->update($validated);

        return new ProductResource($this->loadProduct($product->refresh()));
    }

    public function updateActive(Request $request, Product $product): ProductResource
    {
        $validated = $request->validate(['is_active' => ['required', 'boolean']]);
        $product->update($validated);

        return new ProductResource($this->loadProduct($product->refresh()));
    }

    /**
     * @param  array<int, array<string, mixed>>  $specifications
     */
    private function syncSpecifications(Product $product, array $specifications): void
    {
        $product->specifications()->delete();
        if ($specifications !== []) {
            $product->specifications()->createMany($specifications);
        }
    }

    /**
     * @param  array<int, string>  $paths
     */
    private function createImageRecords(Product $product, array $paths): void
    {
        $hasPrimary = $product->images()->where('is_primary', true)->exists();
        foreach ($paths as $index => $path) {
            $isPrimary = ! $hasPrimary && $index === 0;
            $product->images()->create([
                'image_path' => $path,
                'alt_text' => $product->name,
                'display_order' => $product->images()->count(),
                'is_primary' => $isPrimary,
            ]);
            if ($isPrimary) {
                $product->update(['image_path' => $path]);
                $hasPrimary = true;
            }
        }
    }

    private function loadProduct(Product $product): Product
    {
        return $product->load(['category', 'brand', 'specifications', 'images']);
    }
}
