<?php

use App\Http\Controllers\Api\ProductApiController;
use Illuminate\Support\Facades\Route;

Route::get('/products', [ProductApiController::class, 'index']);
Route::get('/products/{slug}', [ProductApiController::class, 'show']);