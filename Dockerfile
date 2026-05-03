FROM php:8.2-fpm-alpine

RUN apk add --no-cache \
    build-base \
    libpq-dev \
    postgresql-client \
    libxml2-dev \
    oniguruma-dev \
    libzip-dev \
    freetype-dev \
    libjpeg-turbo-dev \
    libpng-dev \
    git \
    curl \
    zip \
    unzip

RUN docker-php-ext-configure gd --with-jpeg --with-freetype \
    && docker-php-ext-install \
    pdo_pgsql \
    bcmath \
    mbstring \
    xml \
    gd \
    exif \
    zip

COPY --from=composer:2 /usr/bin/composer /usr/bin/composer

WORKDIR /app

COPY composer.json composer.lock ./
RUN composer install --no-interaction --prefer-dist --optimize-autoloader --no-scripts

COPY . .

RUN composer dump-autoload --optimize

RUN mkdir -p storage/logs storage/framework/cache/data storage/framework/sessions storage/framework/views bootstrap/cache \
    && chmod -R 775 storage bootstrap/cache

EXPOSE 8000

CMD ["sh", "-c", "if [ ! -f .env ]; then cp .env.example .env; fi && php artisan key:generate --force && php artisan storage:link || true && php artisan migrate --force && php artisan serve --host=0.0.0.0 --port=8000"]
