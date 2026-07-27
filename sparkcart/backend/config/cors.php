<?php

$frontendOrigins = array_values(array_filter(array_map(
    'trim',
    explode(',', env(
        'FRONTEND_ORIGINS',
        env('FRONTEND_URL', 'http://127.0.0.1:5173').',http://localhost:5173'
    ))
)));

return [
    'paths' => ['api/*'],
    'allowed_methods' => ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    'allowed_origins' => $frontendOrigins,
    'allowed_origins_patterns' => [],
    'allowed_headers' => [
        'Accept',
        'Authorization',
        'Content-Type',
        'Origin',
        'X-Checkout-Recovery-Secret',
        'X-Requested-With',
    ],
    'exposed_headers' => [],
    'max_age' => 0,
    'supports_credentials' => false,
];
