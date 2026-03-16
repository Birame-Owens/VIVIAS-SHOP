# 🚀 PLAN D'AMÉLIORATIONS - VIVIAS SHOP 2026

**Date:** 5 février 2026  
**Status:** 65-70% déploiement  
**Objectif:** 90%+ pour production

---

## 🔴 **P0: CRITIQUE - À FAIRE IMMÉDIATEMENT**

### 1. **Renommer le dossier OneDrive** (URGENT!)
```
Problème: Caractères spéciaux causent erreurs PHP
Impact: Bloque php artisan, tinker, migrations

Solution:
cd C:\
git clone "chemin-actuel" vivias-shop
cd C:\vivias-shop
npm install
composer install
npm run build
```
**Temps:** 15 minutes

---

### 2. **Fixer CORS** (SÉCURITÉ)
```php
// config/cors.php
- ❌ 'allowed_origins' => ['*'],
+ ✅ 'allowed_origins' => [
+     'http://192.168.1.21:5173',
+     'http://localhost:5173',
+     'https://votre-domaine.com' // Production
+ ],
```
**Temps:** 5 minutes

---

### 3. **Ajouter Rate Limiting** (SÉCURITÉ)
```php
// app/Http/Middleware/RateLimitMiddleware.php
Route::middleware('throttle:60,1')->group(function () {
    Route::post('/auth/login', [AuthController::class, 'login']);
    Route::post('/auth/forgot-password', ...);
    Route::post('/auth/register', ...);
});
```
**Temps:** 20 minutes

---

### 4. **Déplacer Config Hardcoded → .env**
```php
// ❌ Dans le code
const CACHE_DURATION = 1800;
const PANIER_TTL = 30;
const SESSION_TIMEOUT = 3600;

// ✅ Dans .env
CACHE_PRODUCT_DURATION=1800
PANIER_TTL=30
SESSION_TIMEOUT=3600
STRIPE_WEBHOOK_SECRET=...
SENDGRID_API_KEY=...
```
**Temps:** 30 minutes

---

## 🟠 **P1: IMPORTANT - Avant Production**

### 5. **Ajouter Tests Backend** (ZÉRO ACTUELLEMENT!)
```bash
# Installer PHPUnit
composer require --dev phpunit/phpunit

# Créer les tests essentiels
php artisan make:test LoginControllerTest
php artisan make:test CartControllerTest
php artisan make:test PaymentControllerTest
php artisan make:test OrderControllerTest
php artisan make:test ProductRepositoryTest

# Minimum: 40-50 tests
# Visé: 80+ tests
```
**Tests à faire:**
- ✅ Authentification (login, register, reset)
- ✅ Panier (add, remove, update)
- ✅ Commandes (create, status, list)
- ✅ Paiements (Stripe webhooks)
- ✅ Produits (search, filters)
- ✅ Admin (permissions, roles)

**Temps:** 3-4 jours

**Exemple:**
```php
// tests/Feature/LoginTest.php
public function test_user_can_login_with_valid_credentials()
{
    $user = User::factory()->create([
        'email' => 'test@test.com',
        'password' => bcrypt('password123')
    ]);

    $response = $this->post('/api/auth/login', [
        'email' => 'test@test.com',
        'password' => 'password123'
    ]);

    $response->assertStatus(200);
    $response->assertJsonStructure(['token', 'user']);
}
```

---

### 6. **Générer Documentation API**
```bash
php artisan scribe:generate
# Génère /docs avec OpenAPI 3.0
```
**Temps:** 30 minutes

---

### 7. **Ajouter Logging Structuré**
```php
// app/Services/LoggingService.php
public static function logPayment($order, $result)
{
    Log::info('Payment processed', [
        'order_id' => $order->id,
        'amount' => $order->montant,
        'gateway' => 'stripe',
        'status' => $result->status,
        'timestamp' => now(),
    ]);
}

// Dans PaymentController
LoggingService::logPayment($order, $payment);
```
**Temps:** 1 heure

---

### 8. **Configurer Sauvegardes Automatiques**
```bash
php artisan vendor:publish --provider="Spatie\Backup\BackupServiceProvider"
```

**.env**
```
BACKUP_DISK=backup
BACKUP_NOTIFICATION_EMAIL=admin@vivias-shop.com
```

**Temps:** 30 minutes

---

### 9. **Sécuriser les Secrets**
```bash
# .env (NE PAS commiter!)
STRIPE_SECRET_KEY=sk_test_...
SENDGRID_API_KEY=...
TWILIO_SID=...
JWT_SECRET=...

# Vérifier dans .gitignore
echo ".env" >> .gitignore
echo "*.pem" >> .gitignore
```
**Temps:** 10 minutes

---

## 🟡 **P2: IMPORTANT - Optimisations**

### 10. **Améliorer CI/CD GitHub Actions**
```yaml
# .github/workflows/tests.yml - AJOUTER:
jobs:
  backend:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: shivammathur/setup-php@v2
        with:
          php-version: '8.2'
      - run: composer install
      - run: php artisan migrate --force
      - run: php artisan test  # ← CRUCIAL!
      
  deploy:
    needs: [backend, frontend]
    if: github.ref == 'refs/heads/main'
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - name: Deploy to Heroku
        uses: akhileshns/heroku-deploy@v3
        with:
          heroku_api_key: ${{ secrets.HEROKU_API_KEY }}
          heroku_app_name: "vivias-shop"
```
**Temps:** 2 heures

---

### 11. **Ajouter Monitoring (Sentry)**
```bash
composer require sentry/sentry-laravel
php artisan vendor:publish --provider="Sentry\Laravel\ServiceProvider"
```

**.env**
```
SENTRY_LARAVEL_DSN=https://key@sentry.io/project
SENTRY_ENVIRONMENT=production
```

**Temps:** 30 minutes

---

### 12. **Validation Centralisée avec Form Requests**
```php
// app/Http/Requests/StoreProductRequest.php
class StoreProductRequest extends FormRequest
{
    public function rules()
    {
        return [
            'nom' => 'required|string|max:255|unique:produits',
            'prix' => 'required|numeric|min:0',
            'stock' => 'required|integer|min:0',
            'categorie_id' => 'required|exists:categories,id',
            'images' => 'array|max:5',
            'images.*' => 'image|max:5120'
        ];
    }
}

// Dans ProductController
public function store(StoreProductRequest $request)
{
    // $request->validated() contient déjà les données validées!
}
```
**Temps:** 1 jour (appliquer à tous les controllers)

---

### 13. **Gestion Erreurs Unifiée**
```php
// app/Exceptions/Handler.php
public function register()
{
    $this->reportable(function (Throwable $e) {
        if ($e instanceof InvalidCartException) {
            return false; // Ne pas rapporter
        }
    });

    $this->renderable(function (InvalidCartException $e) {
        return response()->json([
            'success' => false,
            'message' => $e->getMessage(),
            'code' => 'INVALID_CART'
        ], 422);
    });
}
```
**Temps:** 1 jour

---

### 14. **Tests Frontend (React)**
```bash
npm install --save-dev vitest @testing-library/react

# tests/components/ProductCard.test.jsx
describe('ProductCard', () => {
    it('renders product with correct price', () => {
        const { getByText } = render(
            <ProductCard price={99.99} />
        );
        expect(getByText('99.99')).toBeInTheDocument();
    });
});
```
**Temps:** 2 jours

---

## 📊 **TABLEAU RÉCAPITULATIF**

| # | Tâche | Criticité | Temps | Impact |
|----|-------|-----------|-------|--------|
| 1 | Renommer dossier | 🔴 CRITIQUE | 15 min | Débloque tout |
| 2 | Fixer CORS | 🔴 CRITIQUE | 5 min | Sécurité |
| 3 | Rate Limiting | 🔴 CRITIQUE | 20 min | Sécurité |
| 4 | Config → .env | 🔴 CRITIQUE | 30 min | Production-ready |
| 5 | Tests Backend | 🟠 HAUTE | 3-4 j | Confiance |
| 6 | Doc API | 🟠 HAUTE | 30 min | Intégration |
| 7 | Logging | 🟠 HAUTE | 1 h | Débugging |
| 8 | Sauvegardes | 🟠 HAUTE | 30 min | Récupération |
| 9 | Sécuriser secrets | 🟠 HAUTE | 10 min | Sécurité |
| 10 | CI/CD amélioré | 🟡 MOYEN | 2 h | Automation |
| 11 | Monitoring | 🟡 MOYEN | 30 min | Alertes |
| 12 | Form Requests | 🟡 MOYEN | 1 j | Maintenabilité |
| 13 | Erreurs unifiées | 🟡 MOYEN | 1 j | Maintenabilité |
| 14 | Tests Frontend | 🟡 MOYEN | 2 j | Qualité |

**Temps total:** ~15 jours (avec tests)

---

## 📅 **PLAN D'ACTION RECOMMANDÉ**

### **Semaine 1: Critique**
```
Jour 1-2: P0 (Dossier, CORS, Rate Limiting, Config)
Jour 3-5: Tests Backend essentiels (40 tests)
```
**Objectif:** 80% de déploiement

### **Semaine 2: Important**
```
Jour 6-7: Tests restants + Frontend tests
Jour 8-10: CI/CD, Monitoring, Logging
```
**Objectif:** 90%+ de déploiement

### **Semaine 3: Optimisations**
```
Jour 11-15: Refactoring, Form Requests, Gestion erreurs
```
**Objectif:** 95%+ production-ready

---

## 🎯 **CHECKLIST DÉPLOIEMENT FINAL**

```
AVANT PRODUCTION:
☐ Renommer dossier sans accents
☐ CORS restreint
☐ Rate Limiting activé
☐ Tous les secrets en .env
☐ 50+ tests backend passent
☐ 20+ tests frontend passent
☐ Doc API générée
☐ Monitoring Sentry activé
☐ Sauvegardes automatiques configurées
☐ Tests E2E réussis
☐ Lighthouse score > 85
☐ Aucune vulnérabilité npm/composer

LORS DU DÉPLOIEMENT:
☐ DB migrations appliquées
☐ Cache clearé
☐ Assets compilés
☐ Env variables correctes
☐ SSL certificat valide
☐ SMTP configuré
☐ Stripe webhooks configurés
☐ Backup initial fait
```

---

## 💡 **RESSOURCES UTILES**

**Tests:**
- [Laravel Testing Docs](https://laravel.com/docs/12/testing)
- [Vitest React](https://vitest.dev/)

**Security:**
- [OWASP Top 10](https://owasp.org/www-project-top-ten/)
- [Laravel Security](https://laravel.com/docs/12/security)

**DevOps:**
- [GitHub Actions](https://github.com/features/actions)
- [Heroku Deployment](https://devcenter.heroku.com/)

---

## 📞 **SUPPORT**

Questions sur une tâche? Consultez:
1. La documentation officielle
2. Les exemples dans le repo
3. Créez un issue GitHub avec les détails

**Next Step:** Demain, déplacez le projet et commencez par P0! 🚀

