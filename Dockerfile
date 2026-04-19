# ==========================================
# VIVIAS-SHOP Backend - Laravel 12 Dockerfile
# ==========================================

FROM php:8.2-fpm-alpine

# Install system dependencies
RUN apk add --no-cache \
    build-base \
    libpq-dev \
    postgresql-client \
    git \
    curl \
    zip \
    unzip \
    supervisor \
    nginx

# Install PHP extensions
RUN docker-php-ext-install \
    pdo \
    pdo_pgsql \
    bcmath \
    ctype \
    json \
    mbstring \
    tokenizer \
    xml

# Install Composer
RUN curl -sS https://getcomposer.org/installer | php -- --install-dir=/usr/bin --filename=composer

# Set working directory
WORKDIR /app

# Copy composer files
COPY composer.json composer.lock ./

# Install dependencies
RUN composer install --no-dev --no-interaction --prefer-dist

# Copy application code
COPY . .

# Create necessary directories
RUN mkdir -p storage/logs storage/pail bootstrap/cache \
    && chmod -R 775 storage bootstrap/cache

# Generate app key and cache
RUN php artisan key:generate --force \
    && php artisan config:cache \
    && php artisan route:cache \
    && php artisan view:cache

# Expose port
EXPOSE 8000

# Run migrations and start application
CMD sh -c 'php artisan migrate --force && php artisan queue:work database --sleep=3 --tries=3 --daemon & php artisan serve --host=0.0.0.0 --port=8000'
