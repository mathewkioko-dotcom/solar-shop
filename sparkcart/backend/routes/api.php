<?php

use App\Http\Controllers\ProductController;
use App\Models\Product;
use Illuminate\Support\Facades\Route;

Route::get('/products', function () {
    return Product::with('category')->get();
});

Route::get('/products/{slug}', [ProductController::class, 'showBySlug']);
