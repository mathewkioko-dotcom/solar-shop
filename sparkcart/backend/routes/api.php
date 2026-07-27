<?php

use App\Http\Controllers\Api\AuthController;
use App\Http\Controllers\Api\Admin\BrandController as AdminBrandController;
use App\Http\Controllers\Api\Admin\CategoryController as AdminCategoryController;
use App\Http\Controllers\Api\Admin\DashboardController as AdminDashboardController;
use App\Http\Controllers\Api\Admin\ProductController as AdminProductController;
use App\Http\Controllers\Api\AddressController;
use App\Http\Controllers\Api\BrandApiController;
use App\Http\Controllers\Api\CategoryApiController;
use App\Http\Controllers\Api\CheckoutController;
use App\Http\Controllers\Api\GuestOrderController;
use App\Http\Controllers\Api\OrderController;
use App\Http\Controllers\Api\ProductApiController;
use App\Http\Middleware\ProfileRegistration;
use Illuminate\Support\Facades\Route;

Route::prefix('auth')->name('auth.')->group(function (): void {
    Route::post('/register', [AuthController::class, 'register'])
        ->middleware([ProfileRegistration::class, 'throttle:auth.register'])
        ->name('register');
    Route::post('/login', [AuthController::class, 'login'])
        ->middleware('throttle:auth.login')
        ->name('login');
    Route::post('/forgot-password', [AuthController::class, 'forgotPassword'])
        ->middleware('throttle:auth.forgot-password')
        ->name('forgot-password');
    Route::post('/reset-password', [AuthController::class, 'resetPassword'])
        ->middleware('throttle:auth.reset-password')
        ->name('reset-password');

    Route::middleware('auth:sanctum')->group(function (): void {
        Route::get('/user', [AuthController::class, 'user'])->name('user');
        Route::post('/logout', [AuthController::class, 'logout'])->name('logout');
    });
});

Route::get('/categories', [CategoryApiController::class, 'index']);
Route::get('/brands', [BrandApiController::class, 'index']);
Route::get('/products', [ProductApiController::class, 'index']);
Route::get('/products/{slug}', [ProductApiController::class, 'show']);

Route::prefix('admin')
    ->name('admin.')
    ->middleware(['auth:sanctum', 'admin', 'throttle:admin'])
    ->group(function (): void {
        Route::get('/dashboard', AdminDashboardController::class)->name('dashboard');
        Route::get('/brands', [AdminBrandController::class, 'index'])->name('brands.index');
        Route::post('/brands', [AdminBrandController::class, 'store'])->name('brands.store');
        Route::get('/brands/{brand}', [AdminBrandController::class, 'show'])->name('brands.show');
        Route::match(['put', 'patch'], '/brands/{brand}', [AdminBrandController::class, 'update'])
            ->name('brands.update');
        Route::post('/brands/{brand}/logo', [AdminBrandController::class, 'update'])
            ->name('brands.logo.store');
        Route::delete('/brands/{brand}/logo', [AdminBrandController::class, 'removeLogo'])
            ->name('brands.logo.destroy');
        Route::delete('/brands/{brand}', [AdminBrandController::class, 'destroy'])->name('brands.destroy');
        Route::patch('/brands/{brand}/active', [AdminBrandController::class, 'updateActive'])
            ->name('brands.active');
        Route::post('/brands/{brand}/restore', [AdminBrandController::class, 'restore'])
            ->whereNumber('brand')
            ->name('brands.restore');
        Route::delete('/brands/{brand}/force', [AdminBrandController::class, 'forceDelete'])
            ->whereNumber('brand')
            ->name('brands.force-delete');

        Route::get('/categories', [AdminCategoryController::class, 'index'])->name('categories.index');
        Route::post('/categories', [AdminCategoryController::class, 'store'])->name('categories.store');
        Route::match(['put', 'patch'], '/categories/{category}', [AdminCategoryController::class, 'update'])
            ->name('categories.update');
        Route::delete('/categories/{category}', [AdminCategoryController::class, 'destroy'])
            ->name('categories.destroy');

        Route::get('/products', [AdminProductController::class, 'index'])->name('products.index');
        Route::post('/products', [AdminProductController::class, 'store'])->name('products.store');
        Route::get('/products/{product}', [AdminProductController::class, 'show'])->name('products.show');
        Route::match(['put', 'patch'], '/products/{product}', [AdminProductController::class, 'update'])
            ->name('products.update');
        Route::delete('/products/{product}', [AdminProductController::class, 'destroy'])
            ->name('products.destroy');
        Route::post('/products/{product}/restore', [AdminProductController::class, 'restore'])
            ->whereNumber('product')
            ->name('products.restore');
        Route::delete('/products/{product}/force', [AdminProductController::class, 'forceDelete'])
            ->whereNumber('product')
            ->name('products.force-delete');
        Route::post('/products/{product}/images', [AdminProductController::class, 'uploadImage'])
            ->name('products.images.store');
        Route::delete('/products/{product}/images/{image}', [AdminProductController::class, 'removeImage'])
            ->name('products.images.destroy');
        Route::patch('/products/{product}/images/{image}', [AdminProductController::class, 'updateImage'])
            ->name('products.images.update');
        Route::patch('/products/{product}/images/{image}/primary', [AdminProductController::class, 'setPrimaryImage'])
            ->name('products.images.primary');
        Route::post('/products/{product}/datasheet', [AdminProductController::class, 'uploadDatasheet'])
            ->name('products.datasheet.store');
        Route::delete('/products/{product}/datasheet', [AdminProductController::class, 'removeDatasheet'])
            ->name('products.datasheet.destroy');
        Route::patch('/products/{product}/stock', [AdminProductController::class, 'updateStock'])
            ->name('products.stock');
        Route::patch('/products/{product}/featured', [AdminProductController::class, 'updateFeatured'])
            ->name('products.featured');
        Route::patch('/products/{product}/active', [AdminProductController::class, 'updateActive'])
            ->name('products.active');
    });

Route::post('/checkout/orders', [CheckoutController::class, 'store'])
    ->middleware(['auth.optional.sanctum', 'throttle:checkout.orders']);
Route::get('/checkout/orders/recover/{submissionId}', [CheckoutController::class, 'recover'])
    ->whereUuid('submissionId')
    ->middleware(['auth.optional.sanctum', 'throttle:checkout.recovery']);
Route::get('/guest-orders/{token}', [GuestOrderController::class, 'show'])
    ->where('token', '[A-Fa-f0-9]{64}')
    ->middleware('throttle:guest-orders.show');

Route::middleware('auth:sanctum')->group(function (): void {
    Route::get('/orders', [OrderController::class, 'index']);
    Route::get('/orders/{orderNumber}', [OrderController::class, 'show']);

    Route::get('/addresses', [AddressController::class, 'index']);
    Route::post('/addresses', [AddressController::class, 'store']);
    Route::delete('/addresses/{address}', [AddressController::class, 'destroy']);
});
