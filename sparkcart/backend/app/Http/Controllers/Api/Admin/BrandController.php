<?php

namespace App\Http\Controllers\Api\Admin;

use App\Http\Controllers\Controller;
use App\Http\Requests\Admin\StoreBrandRequest;
use App\Http\Requests\Admin\UpdateBrandRequest;
use App\Http\Resources\BrandResource;
use App\Models\Brand;
use App\Support\ManagedPublicFile;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\AnonymousResourceCollection;
use Illuminate\Support\Facades\DB;
use Symfony\Component\HttpFoundation\Response;
use Throwable;

class BrandController extends Controller
{
    public function index(Request $request): AnonymousResourceCollection
    {
        $validated = $request->validate([
            'archived' => ['nullable', 'in:with,only,without'],
            'status' => ['nullable', 'in:all,active,inactive,archived'],
            'search' => ['nullable', 'string', 'max:255'],
            'per_page' => ['nullable', 'integer', 'min:1', 'max:100'],
        ]);

        $status = $validated['status'] ?? null;
        $query = Brand::query()
            ->withCount('products')
            ->when(
                $status === 'archived' || ($validated['archived'] ?? 'without') === 'only',
                fn ($query) => $query->onlyTrashed()
            )
            ->when(
                $status === null && ($validated['archived'] ?? 'without') === 'with',
                fn ($query) => $query->withTrashed()
            )
            ->when(
                $status === 'active',
                fn ($query) => $query->where('is_active', true)
            )
            ->when(
                $status === 'inactive',
                fn ($query) => $query->where('is_active', false)
            )
            ->when(
                trim($validated['search'] ?? '') !== '',
                fn ($query) => $query->where('name', 'like', '%'.trim($validated['search']).'%')
            )
            ->orderBy('display_order')
            ->orderBy('name');

        return BrandResource::collection($query->paginate($validated['per_page'] ?? 20));
    }

    public function store(StoreBrandRequest $request): JsonResponse
    {
        $validated = $request->validated();
        $logoPath = $request->file('logo')
            ? ManagedPublicFile::store($request->file('logo'), 'brands/logos')
            : null;

        try {
            $brand = DB::transaction(function () use ($validated, $logoPath): Brand {
                unset($validated['logo']);

                return Brand::query()->create([
                    ...$validated,
                    'logo_path' => $logoPath,
                ]);
            });
        } catch (Throwable $exception) {
            ManagedPublicFile::delete($logoPath);
            throw $exception;
        }

        return (new BrandResource($brand->loadCount('products')))
            ->response()
            ->setStatusCode(Response::HTTP_CREATED);
    }

    public function show(Brand $brand): BrandResource
    {
        return new BrandResource($brand->loadCount('products'));
    }

    public function update(UpdateBrandRequest $request, Brand $brand): BrandResource
    {
        $validated = $request->validated();
        $newLogoPath = $request->file('logo')
            ? ManagedPublicFile::store($request->file('logo'), 'brands/logos')
            : null;
        $oldLogoPath = $brand->logo_path;

        try {
            DB::transaction(function () use ($brand, $validated, $newLogoPath): void {
                unset($validated['logo']);
                if ($newLogoPath) {
                    $validated['logo_path'] = $newLogoPath;
                }
                $brand->update($validated);
            });
        } catch (Throwable $exception) {
            ManagedPublicFile::delete($newLogoPath);
            throw $exception;
        }

        if ($newLogoPath) {
            ManagedPublicFile::delete($oldLogoPath);
        }

        return new BrandResource($brand->refresh()->loadCount('products'));
    }

    public function destroy(Brand $brand): JsonResponse
    {
        $brand->update(['is_active' => false]);
        $brand->delete();

        return response()->json([
            'message' => $brand->products()->exists()
                ? 'Brand archived safely because products are assigned to it.'
                : 'Brand archived successfully.',
        ]);
    }

    public function updateActive(Request $request, Brand $brand): BrandResource
    {
        $validated = $request->validate(['is_active' => ['required', 'boolean']]);
        $brand->update($validated);

        return new BrandResource($brand->refresh()->loadCount('products'));
    }

    public function restore(int $brand): BrandResource
    {
        $model = Brand::onlyTrashed()->findOrFail($brand);
        $model->restore();

        return new BrandResource($model->refresh()->loadCount('products'));
    }

    public function forceDelete(Request $request, int $brand): JsonResponse
    {
        $request->validate(['confirmation' => ['required', 'in:DELETE']]);
        $model = Brand::withTrashed()->findOrFail($brand);

        if ($model->products()->withTrashed()->exists()) {
            return response()->json([
                'message' => 'This brand cannot be permanently deleted while products are assigned.',
            ], Response::HTTP_CONFLICT);
        }

        $model->forceDelete();

        return response()->json(['message' => 'Brand permanently deleted.']);
    }

    public function removeLogo(Brand $brand): BrandResource
    {
        $oldPath = $brand->logo_path;
        $brand->update(['logo_path' => null]);
        ManagedPublicFile::delete($oldPath);

        return new BrandResource($brand->refresh()->loadCount('products'));
    }
}
