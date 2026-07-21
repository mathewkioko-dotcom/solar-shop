FROM php:8.5-cli

RUN apt-get update \
    && apt-get install -y git unzip zip libzip-dev libssl-dev && rm -rf /var/lib/apt/lists/* \
    && docker-php-ext-install pdo_mysql

# Copy composer from the official composer image
COPY --from=composer:2 /usr/bin/composer /usr/bin/composer

WORKDIR /var/www/html

EXPOSE 8000

CMD sh -c "composer install --no-interaction --prefer-dist || true; php artisan key:generate || true; php artisan serve --host=0.0.0.0 --port=8000"
