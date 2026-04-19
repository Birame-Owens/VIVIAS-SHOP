# 🛍️ VIVIAS-SHOP

E-commerce platform for African fashion with modern tech stack.

[![Build Status](https://img.shields.io/badge/build-passing-brightgreen)]()
[![License](https://img.shields.io/badge/license-MIT-blue)]()
[![Version](https://img.shields.io/badge/version-1.0.0-blue)]()

---

## 🎯 Project Overview

**VIVIAS-SHOP** is a full-stack e-commerce platform specializing in African fashion and traditional wear. Built with modern technologies, it provides seamless shopping experiences with robust backend APIs and responsive frontend interfaces.

### 🏗️ Technology Stack

#### Backend
- **Laravel 12** - PHP framework
- **PostgreSQL** - Database
- **Redis** - Caching & Queue
- **AWS S3** - Image storage

#### Frontend
- **React 19** - UI framework
- **Vite** - Build tool
- **TailwindCSS** - Styling
- **Zustand** - State management

#### DevOps
- **Docker** - Containerization
- **GitLab CI/CD** - Continuous Integration/Deployment
- **PostgreSQL** - Database container

---

## 📋 Features

### 🛒 Shopping Features
- Product browsing with advanced filters
- Shopping cart management
- Wishlist functionality
- Order management
- Payment integration (Stripe, NexPay, PayTech, Wave Money, Orange Money)

### 👔 Product Management
- Multiple product categories (Costumes, Watches, Traditional Robes)
- Image management via AWS S3
- Inventory tracking
- Promotional codes

### 👤 User Management
- User authentication (Sanctum)
- Role-based access (Admin, Client)
- User profiles
- Order history

### 📧 Communication
- Email notifications
- Group messaging system
- Invoice generation

---

## 🚀 Quick Start

### Prerequisites
- **Docker & Docker Compose** (Recommended)
- OR **PHP 8.2**, **Node.js 20**, **PostgreSQL 15** (Manual setup)

### Option 1: Docker (Recommended) 🐳

```bash
# Clone the repository
git clone https://github.com/Birame-Owens/VIVIAS-SHOP.git
cd VIVIAS-SHOP

# Copy environment file
cp .env.example .env

# Start all services
docker-compose up -d

# Run migrations
docker-compose exec backend php artisan migrate

# Create admin user
docker-compose exec backend php artisan tinker
# In tinker: \App\Models\User::factory()->admin()->create(['email' => 'admin@vivias.com'])

# Access the application
# Frontend: http://localhost:5173
# Backend API: http://localhost:8000/api
# Database: localhost:5432 (User: postgres, Password: password)
```

### Option 2: Manual Setup

#### Backend Setup
```bash
# Install PHP dependencies
composer install

# Generate app key
php artisan key:generate

# Configure database
# Update .env with your PostgreSQL credentials

# Run migrations
php artisan migrate

# Start the development server
php artisan serve

# Start queue worker
php artisan queue:work database --sleep=3 --tries=3
```

#### Frontend Setup
```bash
# Install Node dependencies
npm install

# Start development server
npm run dev

# Build for production
npm run build
```

---

## 📁 Project Structure

```
VIVIAS-SHOP/
├── 🐳 Docker
│   ├── Dockerfile                 # Laravel container
│   ├── Dockerfile.frontend        # React container
│   └── docker-compose.yml         # Container orchestration
│
├── 📦 Backend (Laravel)
│   ├── app/
│   │   ├── Models/               # 28 Eloquent models
│   │   ├── Controllers/          # 31 API controllers
│   │   ├── Services/             # 21 business logic services
│   │   └── Jobs/                 # 6 queue jobs
│   ├── routes/api.php            # 100+ API endpoints
│   ├── database/migrations/      # 42 migrations
│   └── storage/                  # Logs and cache
│
├── 🎨 Frontend (React)
│   ├── src/
│   │   ├── pages/               # 31 pages
│   │   │   ├── client/          # 15 client pages
│   │   │   └── admin/           # 16 admin pages
│   │   ├── components/          # 23 reusable components
│   │   ├── hooks/               # Custom hooks
│   │   └── stores/              # Zustand state management
│   ├── public/
│   └── vite.config.ts
│
├── ⚙️ Configuration
│   ├── .env.example             # Environment template
│   ├── .gitignore               # Git ignore rules
│   ├── .gitlab-ci.yml           # CI/CD pipeline
│   └── docker-compose.yml
│
└── 📚 Documentation
    ├── README.md                # This file
    ├── API.md                   # API documentation
    └── SETUP.md                 # Detailed setup guide
```

---

## 🔧 Configuration

### Environment Variables

1. Copy `.env.example` to `.env`
2. Update required variables:

```env
# Application
APP_NAME="VIVIAS SHOP"
APP_ENV=production
APP_DEBUG=false
APP_URL=http://localhost:8000

# Database
DB_CONNECTION=pgsql
DB_HOST=127.0.0.1
DB_DATABASE=VIVIAS
DB_USERNAME=postgres
DB_PASSWORD=password

# AWS S3 (for image storage)
AWS_ACCESS_KEY_ID=your_key
AWS_SECRET_ACCESS_KEY=your_secret
AWS_BUCKET=ecommerce-images-owens

# Stripe Payment
STRIPE_SECRET_KEY=sk_test_xxx
STRIPE_PUBLIC_KEY=pk_test_xxx
```

### Database Migration

```bash
# Run all migrations
php artisan migrate

# Create seed data
php artisan db:seed
```

---

## 🔄 API Endpoints

### Authentication
- `POST /api/auth/login` - User login
- `POST /api/auth/logout` - User logout
- `POST /api/auth/register` - User registration

### Products
- `GET /api/products` - List all products
- `GET /api/products/:id` - Get product details
- `POST /api/products` - Create product (Admin)
- `PUT /api/products/:id` - Update product (Admin)
- `DELETE /api/products/:id` - Delete product (Admin)

### Cart
- `GET /api/cart` - Get user's cart
- `POST /api/cart/items` - Add item to cart
- `PUT /api/cart/items/:id` - Update cart item
- `DELETE /api/cart/items/:id` - Remove item from cart

### Orders
- `GET /api/orders` - List user's orders
- `POST /api/orders` - Create new order
- `GET /api/orders/:id` - Get order details
- `PUT /api/orders/:id` - Update order status (Admin)

See [API.md](./API.md) for complete API documentation.

---

## 🚀 Deployment

### GitLab CI/CD

The project includes `.gitlab-ci.yml` for automated CI/CD:

1. **Build Stage**: Docker image build
2. **Test Stage**: Backend PHPStan analysis, Frontend build
3. **Deploy Stage**: Automated deployment to production

### Docker Deployment

```bash
# Pull latest code
git pull origin main

# Build and start containers
docker-compose -f docker-compose.yml up -d

# View logs
docker-compose logs -f

# Stop containers
docker-compose down
```

### Manual Deployment

```bash
# Install dependencies
composer install --no-dev
npm ci

# Build frontend
npm run build

# Run migrations
php artisan migrate --force

# Cache configuration
php artisan config:cache
php artisan route:cache

# Start queue worker
php artisan queue:work database --daemon
```

---

## 📊 Database Schema

### Core Tables
- **users** - User accounts
- **products** - Product catalog
- **categories** - Product categories
- **panier** - Shopping cart items
- **commandes** - Orders
- **paiements** - Payments
- **factures** - Invoices
- **images_produits** - Product images

See database migrations in `database/migrations/` for full schema.

---

## 🧪 Testing

### Backend Tests
```bash
# Run PHPUnit tests
php artisan test

# Run with coverage
php artisan test --coverage
```

### Frontend Tests
```bash
# Run Vitest
npm run test

# Run with coverage
npm run test:coverage
```

---

## 🐛 Troubleshooting

### Database Connection Issues
```bash
# Check PostgreSQL status
docker-compose ps db

# View database logs
docker-compose logs db

# Restart database
docker-compose restart db
```

### Queue Worker Issues
```bash
# Check failed jobs
php artisan queue:failed

# Retry failed jobs
php artisan queue:retry all

# Clear failed jobs
php artisan queue:flush
```

### Frontend Build Issues
```bash
# Clear npm cache
npm cache clean --force

# Reinstall dependencies
rm -rf node_modules package-lock.json
npm install
```

---

## 🤝 Contributing

1. Create a feature branch: `git checkout -b feature/amazing-feature`
2. Commit changes: `git commit -m 'Add amazing feature'`
3. Push to branch: `git push origin feature/amazing-feature`
4. Open a Pull Request

---

## 📝 License

This project is licensed under the MIT License - see the LICENSE file for details.

---

## 📧 Support & Contact

For support or questions:
- Create an issue on GitHub
- Contact: support@vivias-shop.com

---

## 🙏 Acknowledgments

- Built with ❤️ by Birame Owens
- Powered by Laravel, React, and PostgreSQL
- Hosted on AWS

---

## 📈 Project Status

- ✅ Backend API (100+ endpoints)
- ✅ Frontend Application
- ✅ Docker Support
- ✅ CI/CD Pipeline (GitLab)
- 🔄 Payment Integration (In Progress)
- 📋 Mobile App (Planned)

---

**Made with ❤️ for African Fashion | VIVIAS-SHOP © 2025**

## Learning Laravel

Laravel has the most extensive and thorough [documentation](https://laravel.com/docs) and video tutorial library of all modern web application frameworks, making it a breeze to get started with the framework.

You may also try the [Laravel Bootcamp](https://bootcamp.laravel.com), where you will be guided through building a modern Laravel application from scratch.

If you don't feel like reading, [Laracasts](https://laracasts.com) can help. Laracasts contains thousands of video tutorials on a range of topics including Laravel, modern PHP, unit testing, and JavaScript. Boost your skills by digging into our comprehensive video library.

## Laravel Sponsors

We would like to extend our thanks to the following sponsors for funding Laravel development. If you are interested in becoming a sponsor, please visit the [Laravel Partners program](https://partners.laravel.com).

### Premium Partners

- **[Vehikl](https://vehikl.com)**
- **[Tighten Co.](https://tighten.co)**
- **[Kirschbaum Development Group](https://kirschbaumdevelopment.com)**
- **[64 Robots](https://64robots.com)**
- **[Curotec](https://www.curotec.com/services/technologies/laravel)**
- **[DevSquad](https://devsquad.com/hire-laravel-developers)**
- **[Redberry](https://redberry.international/laravel-development)**
- **[Active Logic](https://activelogic.com)**

## Contributing

Thank you for considering contributing to the Laravel framework! The contribution guide can be found in the [Laravel documentation](https://laravel.com/docs/contributions).

## Code of Conduct

In order to ensure that the Laravel community is welcoming to all, please review and abide by the [Code of Conduct](https://laravel.com/docs/contributions#code-of-conduct).

## Security Vulnerabilities

If you discover a security vulnerability within Laravel, please send an e-mail to Taylor Otwell via [taylor@laravel.com](mailto:taylor@laravel.com). All security vulnerabilities will be promptly addressed.

## License

The Laravel framework is open-sourced software licensed under the [MIT license](https://opensource.org/licenses/MIT).
