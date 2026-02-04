# ============================================
# GUIDE DE DÉPLOIEMENT PRODUCTION - VIVIAS SHOP
# Déploiement en 5 jours
# ============================================

## 📋 CHECKLIST PRÉ-DÉPLOIEMENT

### JOUR 1 - Configuration Serveur

#### 1. Serveur Requirements
- **OS**: Ubuntu 22.04 LTS (recommandé)
- **RAM**: Minimum 4GB (8GB recommandé pour 2000+ clients)
- **CPU**: 2+ cores
- **Stockage**: 50GB+ SSD
- **PHP**: 8.2+
- **Database**: PostgreSQL 15+ ou MySQL 8+
- **Redis**: 7.0+
- **Nginx**: Latest

#### 2. Installation Serveur
```bash
# Mise à jour système
sudo apt update && sudo apt upgrade -y

# Installation PHP 8.2
sudo apt install -y php8.2-fpm php8.2-cli php8.2-common php8.2-mysql php8.2-pgsql \
  php8.2-zip php8.2-gd php8.2-mbstring php8.2-curl php8.2-xml php8.2-bcmath \
  php8.2-redis php8.2-intl

# Installation PostgreSQL
sudo apt install -y postgresql postgresql-contrib

# Installation Redis
sudo apt install -y redis-server

# Installation Nginx
sudo apt install -y nginx

# Installation Node.js 20
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
sudo apt install -y nodejs

# Installation Composer
curl -sS https://getcomposer.org/installer | php
sudo mv composer.phar /usr/local/bin/composer
```

#### 3. Configuration PostgreSQL
```bash
sudo -u postgres psql

CREATE DATABASE vivias_shop_production;
CREATE USER vivias_user WITH ENCRYPTED PASSWORD 'MOT_DE_PASSE_SECURISE';
GRANT ALL PRIVILEGES ON DATABASE vivias_shop_production TO vivias_user;
\q
```

#### 4. Configuration Redis
```bash
sudo nano /etc/redis/redis.conf

# Modifier:
maxmemory 2gb
maxmemory-policy allkeys-lru
requirepass VOTRE_MOT_DE_PASSE_REDIS

sudo systemctl restart redis
```

---

### JOUR 2 - Déploiement Application

#### 1. Cloner le Repository
```bash
cd /var/www
sudo git clone https://github.com/Birame-Owens/VIVIAS-SHOP.git vivias-shop
cd vivias-shop
sudo chown -R www-data:www-data /var/www/vivias-shop
```

#### 2. Installation Dépendances
```bash
# PHP
composer install --no-dev --optimize-autoloader

# Node.js
npm install
npm run build
```

#### 3. Configuration Environnement
```bash
# Copier .env
cp .env.production.example .env

# IMPORTANT: Éditer .env avec vos vraies valeurs
nano .env

# Générer clé app
php artisan key:generate

# Lier storage
php artisan storage:link
```

#### 4. Migrations & Seeds
```bash
# Exécuter migrations
php artisan migrate --force

# Ajouter indexes performance
php artisan migrate --path=database/migrations/2025_01_XX_add_performance_indexes.php --force

# Seed données (optionnel)
php artisan db:seed --force
```

#### 5. Optimisations Laravel
```bash
# Cache config
php artisan config:cache

# Cache routes
php artisan route:cache

# Cache views
php artisan view:cache

# Cache events
php artisan event:cache

# Optimisation autoload
composer dump-autoload --optimize
```

---

### JOUR 3 - Configuration Nginx & SSL

#### 1. Configuration Nginx
```bash
sudo nano /etc/nginx/sites-available/viviasshop
```

```nginx
server {
    listen 80;
    listen [::]:80;
    server_name viviasshop.sn www.viviasshop.sn;
    root /var/www/vivias-shop/public;

    add_header X-Frame-Options "SAMEORIGIN";
    add_header X-Content-Type-Options "nosniff";
    add_header X-XSS-Protection "1; mode=block";

    index index.php;

    charset utf-8;

    # Gzip Compression
    gzip on;
    gzip_vary on;
    gzip_proxied any;
    gzip_comp_level 6;
    gzip_types text/plain text/css text/xml text/javascript application/json application/javascript application/xml+rss application/rss+xml font/truetype font/opentype application/vnd.ms-fontobject image/svg+xml;

    # Cache static assets
    location ~* \.(jpg|jpeg|png|gif|ico|css|js|svg|woff|woff2|ttf|eot)$ {
        expires 1y;
        add_header Cache-Control "public, immutable";
    }

    location / {
        try_files $uri $uri/ /index.php?$query_string;
    }

    location = /favicon.ico { access_log off; log_not_found off; }
    location = /robots.txt  { access_log off; log_not_found off; }

    error_page 404 /index.php;

    location ~ \.php$ {
        fastcgi_pass unix:/var/run/php/php8.2-fpm.sock;
        fastcgi_param SCRIPT_FILENAME $realpath_root$fastcgi_script_name;
        include fastcgi_params;
        fastcgi_hide_header X-Powered-By;
    }

    location ~ /\.(?!well-known).* {
        deny all;
    }
}
```

```bash
# Activer le site
sudo ln -s /etc/nginx/sites-available/viviasshop /etc/nginx/sites-enabled/

# Tester configuration
sudo nginx -t

# Redémarrer Nginx
sudo systemctl restart nginx
```

#### 2. Installation SSL (Let's Encrypt)
```bash
# Installation Certbot
sudo apt install -y certbot python3-certbot-nginx

# Obtenir certificat SSL
sudo certbot --nginx -d viviasshop.sn -d www.viviasshop.sn

# Auto-renouvellement
sudo systemctl enable certbot.timer
```

---

### JOUR 4 - Queues & Supervisor

#### 1. Configuration Supervisor (Queue Workers)
```bash
sudo apt install -y supervisor

sudo nano /etc/supervisor/conf.d/vivias-shop-worker.conf
```

```ini
[program:vivias-shop-worker]
process_name=%(program_name)s_%(process_num)02d
command=php /var/www/vivias-shop/artisan queue:work redis --sleep=3 --tries=3 --max-time=3600
autostart=true
autorestart=true
stopasgroup=true
killasgroup=true
user=www-data
numprocs=4
redirect_stderr=true
stdout_logfile=/var/www/vivias-shop/storage/logs/worker.log
stopwaitsecs=3600
```

```bash
# Démarrer Supervisor
sudo supervisorctl reread
sudo supervisorctl update
sudo supervisorctl start vivias-shop-worker:*
```

#### 2. Cron Jobs
```bash
sudo crontab -e

# Ajouter:
* * * * * cd /var/www/vivias-shop && php artisan schedule:run >> /dev/null 2>&1
0 0 * * * cd /var/www/vivias-shop && php artisan cache:prune >> /dev/null 2>&1
0 2 * * * cd /var/www/vivias-shop && php artisan backup:run >> /dev/null 2>&1
```

---

### JOUR 5 - Tests & Monitoring

#### 1. Tests Finaux
```bash
# Test application
curl -I https://viviasshop.sn

# Test API
curl https://viviasshop.sn/api/client/home

# Test Redis
redis-cli -a VOTRE_MOT_DE_PASSE_REDIS ping

# Test Queue
php artisan queue:work --once
```

#### 2. Monitoring & Logs
```bash
# Logs en temps réel
tail -f /var/www/vivias-shop/storage/logs/laravel.log

# Nginx access logs
tail -f /var/log/nginx/access.log

# Worker logs
tail -f /var/www/vivias-shop/storage/logs/worker.log
```

#### 3. Configuration Backup Automatique
```bash
# Configuration Spatie Backup
php artisan backup:run

# Vérifier backup
php artisan backup:list
```

---

## 🔒 SÉCURITÉ

### Firewall (UFW)
```bash
sudo ufw allow 22/tcp    # SSH
sudo ufw allow 80/tcp    # HTTP
sudo ufw allow 443/tcp   # HTTPS
sudo ufw enable
```

### Fail2Ban
```bash
sudo apt install -y fail2ban
sudo systemctl enable fail2ban
sudo systemctl start fail2ban
```

### Permissions
```bash
sudo chown -R www-data:www-data /var/www/vivias-shop
sudo chmod -R 755 /var/www/vivias-shop
sudo chmod -R 775 /var/www/vivias-shop/storage
sudo chmod -R 775 /var/www/vivias-shop/bootstrap/cache
```

---

## ⚡ OPTIMISATIONS PERFORMANCE

### PHP-FPM
```bash
sudo nano /etc/php/8.2/fpm/pool.d/www.conf

# Modifier:
pm = dynamic
pm.max_children = 50
pm.start_servers = 10
pm.min_spare_servers = 5
pm.max_spare_servers = 20
pm.max_requests = 500

sudo systemctl restart php8.2-fpm
```

### OpCache
```bash
sudo nano /etc/php/8.2/fpm/conf.d/10-opcache.ini

# Ajouter:
opcache.enable=1
opcache.memory_consumption=256
opcache.interned_strings_buffer=16
opcache.max_accelerated_files=10000
opcache.validate_timestamps=0
opcache.save_comments=1
opcache.fast_shutdown=1

sudo systemctl restart php8.2-fpm
```

---

## 📊 MONITORING (Optionnel)

### Laravel Horizon (Redis Dashboard)
```bash
composer require laravel/horizon --no-dev
php artisan horizon:install
php artisan horizon:publish

# Accès: https://viviasshop.sn/horizon
```

### Logs Centralisés
- Utiliser Papertrail, Loggly ou ELK Stack

---

## 🚀 POST-DÉPLOIEMENT

### Checklist Finale
- [ ] Site accessible via HTTPS
- [ ] Certificat SSL valide
- [ ] Redis fonctionne
- [ ] Queue workers actifs
- [ ] Emails envoyés correctement
- [ ] WhatsApp notifications fonctionnent
- [ ] Paiements Stripe testés
- [ ] Images chargent rapidement
- [ ] Backup automatique configuré
- [ ] Monitoring actif
- [ ] Logs vérifiés

### Support & Maintenance
- **Backups quotidiens** : Vérifier /storage/backups
- **Logs** : Surveiller erreurs quotidiennement
- **Updates** : Mettre à jour mensuel
- **Security** : Audits trimestriels

---

## 📞 CONTACT URGENCE
- **Développeur** : [Votre contact]
- **Hébergeur** : [Contact hébergeur]
- **Support Laravel** : https://laravel.com/support

---

## 🎉 FÉLICITATIONS !
Votre application VIVIAS SHOP est maintenant en production et optimisée pour 2000+ clients simultanés !
