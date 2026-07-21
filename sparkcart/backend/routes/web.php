<?php

use Illuminate\Support\Facades\Route;
use App\Http\Controllers\ProductController;
use App\Http\Controllers\CategoryController;
use App\Http\Controllers\AdminController;

// Universal Marketplace Dynamic Catalog Mappings
Route::get('/', [ProductController::class, 'index'])->name('shop.index');
Route::get('/category/{slug}', [CategoryController::class, 'show'])->name('shop.category');
Route::get('/product/{id}', [ProductController::class, 'show'])->name('product.show');
Route::get('/product/details/{id}', [ProductController::class, 'getProductDetails'])->name('product.details');

// Asynchronous Client AJAX Basket Memory Endpoints
Route::post('/cart/add/{id}', [ProductController::class, 'addToCart'])->name('cart.add');
Route::post('/cart/update/{id}', [ProductController::class, 'updateQuantity'])->name('cart.update');
Route::post('/cart/remove/{id}', [ProductController::class, 'removeFromCart'])->name('cart.remove');

// M-Pesa payment gateway integration endpoints
Route::post('/mpesa/pay', [ProductController::class, 'mpesaPay'])->name('mpesa.pay');
Route::post('/mpesa/callback', [ProductController::class, 'mpesaCallback'])->name('mpesa.callback');
Route::get('/mpesa/status/{checkoutRequestId}', [ProductController::class, 'mpesaStatus'])->name('mpesa.status');

Route::get('/mpesa/debug', function () {
    if (! config('app.debug')) {
        abort(404);
    }

    $environment = config('mpesa.environment');
    $consumerKey = config('mpesa.mpesa_consumer_key');
    $consumerSecret = config('mpesa.mpesa_consumer_secret');
    $callbackUrl = config('mpesa.callbacks.callback_url');
    $url = ($environment === 'production' ? 'https://api.safaricom.co.ke' : 'https://sandbox.safaricom.co.ke') . '/oauth/v1/generate?grant_type=client_credentials';

    try {
        $response = \Illuminate\Support\Facades\Http::withBasicAuth($consumerKey, $consumerSecret)
            ->acceptJson()
            ->get($url);

        $tokenResponse = [
            'status' => $response->status(),
            'body' => $response->body(),
            'json' => $response->json(),
        ];
    } catch (\Throwable $e) {
        $tokenResponse = ['error' => $e->getMessage()];
    }

    return response()->json([
        'debug' => true,
        'mpesa' => [
            'enabled' => config('mpesa.enabled'),
            'environment' => $environment,
            'consumer_key_set' => ! empty($consumerKey),
            'consumer_secret_set' => ! empty($consumerSecret),
            'shortcode' => config('mpesa.shortcode'),
            'passkey_set' => ! empty(config('mpesa.passkey')),
            'callback_url' => $callbackUrl,
            'oauth_endpoint' => $url,
        ],
        'token_request' => $tokenResponse,
    ]);
})->name('mpesa.debug');

// Real Production-Ready Customer Authenticators Registry
Route::post('/register', [ProductController::class, 'handleRegister'])->name('register.submit');
Route::post('/login', [ProductController::class, 'handleLogin'])->name('login.submit');
Route::post('/guest-checkout', [ProductController::class, 'handleGuestCheckout'])->name('guest.checkout');
Route::post('/logout', [ProductController::class, 'handleLogout'])->name('logout');
Route::get('/checkout', [ProductController::class, 'checkout'])->name('checkout');
Route::get('/dashboard', [ProductController::class, 'dashboard'])->name('dashboard');

// Admin settings management
Route::get('/admin/settings', [AdminController::class, 'settings'])->name('admin.settings');
Route::post('/admin/settings', [AdminController::class, 'saveSettings'])->name('admin.settings.save');
