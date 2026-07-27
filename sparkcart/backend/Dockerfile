FROM php:8.5-cli

RUN apt-get update \
    && apt-get install -y git unzip zip libzip-dev libssl-dev && rm -rf /var/lib/apt/lists/* \
    && docker-php-ext-install pdo_mysql

RUN printf '%s\n' \
    'opcache.enable=1' \
    'opcache.enable_cli=1' \
    'opcache.validate_timestamps=1' \
    'opcache.revalidate_freq=0' \
    'opcache.memory_consumption=128' \
    'opcache.max_accelerated_files=20000' \
    > /usr/local/etc/php/conf.d/opcache-development.ini

# Copy composer from the official composer image
COPY --from=composer:2 /usr/bin/composer /usr/bin/composer

WORKDIR /var/www/html

COPY composer.json composer.lock ./
RUN composer install --no-interaction --prefer-dist --no-scripts

COPY . .
RUN touch .env
RUN PAO_DISABLE=1 composer dump-autoload --optimize
RUN php artisan storage:link

EXPOSE 8000

CMD ["php", "artisan", "serve", "--host=0.0.0.0", "--port=8000", "--no-reload"]
