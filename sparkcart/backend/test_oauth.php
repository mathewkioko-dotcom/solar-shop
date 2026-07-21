<?php
require __DIR__ . '/vendor/autoload.php';
$app = require_once __DIR__ . '/bootstrap/app.php';
$kernel = $app->make(Illuminate\Contracts\Console\Kernel::class);
$kernel->bootstrap();

$environment = config('mpesa.environment');
$consumerKey = config('mpesa.mpesa_consumer_key');
$consumerSecret = config('mpesa.mpesa_consumer_secret');
$callbackUrl = config('mpesa.callbacks.callback_url');

echo "MPESA Environment: {$environment}\n";
echo "Consumer key set: " . (! empty($consumerKey) ? 'yes' : 'no') . "\n";
echo "Consumer secret set: " . (! empty($consumerSecret) ? 'yes' : 'no') . "\n";
echo "Callback URL: {$callbackUrl}\n";

$url = ($environment === 'production' ? 'https://api.safaricom.co.ke' : 'https://sandbox.safaricom.co.ke') . '/oauth/v1/generate?grant_type=client_credentials';

try {
    $response = Illuminate\Support\Facades\Http::withBasicAuth($consumerKey, $consumerSecret)
        ->acceptJson()
        ->get($url);

    echo "Raw status: " . $response->status() . "\n";
    echo "Raw body: " . $response->body() . "\n";
    echo "JSON: \n" . json_encode($response->json(), JSON_PRETTY_PRINT) . "\n";
} catch (Exception $e) {
    echo "Raw request failed: " . $e->getMessage() . "\n";
}

echo "---\n";

try {
    $m = $app->make(Iankumu\Mpesa\Mpesa::class);
    $token = $m->generateAccessToken('C2B');
    echo "Generated token: " . $token . "\n";
} catch (Exception $e) {
    echo "EX: " . $e->getMessage() . "\n";
}
