#!/bin/sh
set -e
cd /var/www/html
php artisan config:clear
php -r 'require __DIR__ . "/vendor/autoload.php"; $app = require __DIR__ . "/bootstrap/app.php"; $kernel = $app->make(Illuminate\Contracts\Console\Kernel::class); $kernel->bootstrap(); echo "mpesa_consumer_key=" . config("mpesa.mpesa_consumer_key") . "\n"; echo "mpesa_consumer_secret=" . config("mpesa.mpesa_consumer_secret") . "\n"; echo "mpesa_environment=" . config("mpesa.environment") . "\n"; echo "mpesa_callback=" . config("mpesa.callbacks.callback_url") . "\n";'
echo "--- RAW OAUTH ---"
curl -s -D - -u "3tuHKwVPBhOQKqtldtHMoHhlfCp3axYJUov5AlhXhG1BGhsW:pEKY4tmhqWHM1SoUFl9Qy3gRTkwmGd7a6MVjNzXT0JZbGshRRcNZplbNiDbo7Ak" "https://sandbox.safaricom.co.ke/oauth/v1/generate?grant_type=client_credentials" | sed -n '1,40p'
echo
