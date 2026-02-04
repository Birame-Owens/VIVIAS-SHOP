# 🎯 ARCHITECTURE REFACTOR - CHEAT SHEET

## 📋 À CONNAITRE (5 fichiers clés)

### 1. BaseController
**Où**: `app/Http/Controllers/BaseController.php`

**Méthodes de réponse**:
```php
$this->success($data, $message, 200);        // ✅ Success
$this->created($data, $message);              // 201
$this->updated($data, $message);              // 200
$this->deleted($model, $id, $message);        // 200
$this->error($message, 400);                  // ❌ Error
$this->notFound($message);                    // 404
$this->validationFailed($errors);             // 422
$this->unauthorized();                        // 401
$this->forbidden();                           // 403
$this->rateLimited();                         // 429
$this->serverError($e);                       // 500
```

**Helpers**:
```php
$this->validateRequest($rules, $messages);    // Valide
$this->getPaginationParams();                 // [per_page, page]
$this->respondPaginated($data, $message);     // + pagination metadata
$this->auditLog($action, $model, $id, $changes); // Log
```

### 2. ResourceCrudTrait
**Où**: `app/Http/Controllers/Traits/ResourceCrudTrait.php`

**Hérite automatiquement** (5 méthodes):
```php
index()        // GET /api/resources
show($id)      // GET /api/resources/{id}
store()        // POST /api/resources
update($id)    // PUT /api/resources/{id}
destroy($id)   // DELETE /api/resources/{id}
```

**À implémenter** (4 abstract methods):
```php
protected function getRepository()              // Repo instance
protected function getResourceName(): string    // 'Product'
protected function getValidationRules(string $action = 'create'): array // Rules
```

### 3. DTOs
**Où**: `app/Data/Transfer/DTOs.php`

**5 DTOs pré-créés**:
```php
ProductDTO      // name, description, prix_vente, prix_reduction, stock
OrderDTO        // user_id, total, statut, adresse_livraison, notes
UserDTO         // name, email, password, telephone, role
PaymentDTO      // commande_id, montant, method, statut, transaction_id
ReviewDTO       // produit_id, rating, comment, user_id
```

**Utiliser**:
```php
$validated = ProductDTO::validate(request()->all());  // Valide + retourne DTO
$data = $validated->toArray();                        // Convert to array
```

### 4. Events
**Où**: `app/Events/Events.php`

**6 events pré-créés**:
```php
OrderPlaced         // Commande créée
PaymentProcessed    // Paiement reçu
OrderShipped        // Commande expédiée
ReviewSubmitted     // Avis reçu
UserRegistered      // User inscrit
LowStockAlert       // Stock faible
```

**Dispatcher**:
```php
event(new OrderPlaced($order, $user));
// → Déclenche automatiquement les listeners
```

### 5. Jobs
**Où**: `app/Jobs/Jobs.php`

**7 jobs pré-créés**:
```
SendWhatsAppMessage    // Queue WhatsApp (3 retries)
SendEmailJob           // Queue email (3 retries)
UpdateStockJob         // Update stock async
ProcessOrderJob        // Process complet (5 retries)
SyncInventoryJob       // Sync inventory périodique
GenerateReportJob      // Generate reports
```

**Dispatcher**:
```php
dispatch(new SendWhatsAppMessage($phone, $message, $type));
// → Queued, pas bloquant!
```

---

## 🔄 PATTERN SIMPLE (2 min setup)

### Créer un nouveau Controller

```php
<?php
namespace App\Http\Controllers;

use App\Http\Controllers\Traits\ResourceCrudTrait;
use App\Repositories\YourRepository;

class YourController extends BaseController
{
    use ResourceCrudTrait;

    protected function getRepository() 
    {
        return app(YourRepository::class);
    }

    protected function getResourceName(): string 
    {
        return 'YourModel';
    }

    protected function getValidationRules(string $action = 'create'): array 
    {
        return [
            'name' => 'required|string|max:255',
            'email' => 'required|email|unique:your_table',
            // ... other rules
        ];
    }
}
```

**C'est tout!** Hérite automatiquement:
- ✅ index() avec pagination + filters
- ✅ show($id)
- ✅ store() avec validation
- ✅ update($id)
- ✅ destroy($id)
- ✅ Audit logging auto

---

## 🎯 CAS D'USAGE COURANTS

### Cas 1: Valider des données

**AVANT**:
```php
$validated = $request->validate([
    'name' => 'required|string|max:255',
    'email' => 'required|email',
]);
```

**APRÈS**:
```php
use App\Data\Transfer\ProductDTO;

$validated = ProductDTO::validate(request()->all());
// Validation centralisée + messages multilingues
```

### Cas 2: Créer une ressource

**AVANT**:
```php
try {
    $product = Product::create($data);
    \Log::info('Product created', ['id' => $product->id]);
    return response()->json($product, 201);
} catch (\Exception $e) {
    return response()->json(['error' => $e->getMessage()], 500);
}
```

**APRÈS**:
```php
use App\Events\ProductCreated;

$product = Product::create($data);
event(new ProductCreated($product)); // Auto-logging
return $this->created($product);
```

### Cas 3: Notifier utilisateur (async)

**AVANT** (synchrone, bloquant):
```php
// ❌ Bloque pendant 2-3 secondes
app('services.whatsapp')->sendMessage($phone, $message);
return $this->success($order);
```

**APRÈS** (async):
```php
use App\Jobs\SendWhatsAppMessage;

// ✅ Queued immédiatement, pas de blocage
dispatch(new SendWhatsAppMessage($phone, $message, 'order_confirmation'));
return $this->created($order);
```

### Cas 4: Logger une action importante

```php
use App\Services\AuditLogService;

// Paiement
AuditLogService::logPayment($paymentId, 'completed', 1500, 'stripe', $txnId);

// Stock
AuditLogService::logStockChange($productId, 100, 95, 'order_placed');

// Admin action
AuditLogService::logAdminAction('DISABLE_USER', 'User', $userId, $changes);

// Sécurité
AuditLogService::logSecurityEvent('BRUTE_FORCE', "IP: $ip", severity: 3);
```

### Cas 5: Rate limiter une action

**Enregistrer middleware** dans `bootstrap/app.php`:
```php
$middleware->api(prepend: [
    \App\Http\Middleware\RateLimitingMiddleware::class,
]);
```

**Automatique**:
- Login: 5 tentatives/min par IP
- API: 60 requêtes/min par user
- Search: 30 requêtes/min par user
- Payment: 10 requêtes/min par user

### Cas 6: Retourner erreurs

```php
// Validation échouée
return $this->validationFailed($errors); // 422

// Non trouvé
return $this->notFound('Product not found'); // 404

// Non autorisé
return $this->unauthorized(); // 401

// Forbidden
return $this->forbidden('Access denied'); // 403

// Rate limit
return $this->rateLimited(); // 429

// Serveur erreur
return $this->serverError('Internal error', $exception); // 500
```

---

## 📊 STRUCTURE JSON DES RÉPONSES

### Success

```json
{
  "success": true,
  "status": 200,
  "message": "Operation successful",
  "data": { ... },
  "pagination": {
    "total": 100,
    "per_page": 15,
    "current_page": 1,
    "last_page": 7
  }
}
```

### Error

```json
{
  "success": false,
  "status": 422,
  "message": "Validation failed",
  "code": "VALIDATION_ERROR",
  "errors": {
    "name": ["The name field is required"],
    "email": ["The email field is invalid"]
  }
}
```

---

## 🔌 MIDDLEWARE À ENREGISTRER

**Dans** `bootstrap/app.php`:

```php
->withMiddleware(function (Middleware $middleware) {
    $middleware->api(prepend: [
        \App\Http\Middleware\RateLimitingMiddleware::class,
        \App\Http\Middleware\SecurityHeadersMiddleware::class,
        \App\Http\Middleware\CorsMiddleware::class,
    ]);
    
    $middleware->validateCsrfTokens(except: ['api/*']);
})
```

---

## 🧪 TESTER RAPIDEMENT

### Test CRUD

```bash
# Créer
curl -X POST http://localhost:8000/api/products \
  -H "Content-Type: application/json" \
  -d '{"name":"Test","prix_vente":100}'

# Lister
curl http://localhost:8000/api/products?page=1&per_page=15

# Récupérer
curl http://localhost:8000/api/products/1

# Mettre à jour
curl -X PUT http://localhost:8000/api/products/1 \
  -d '{"name":"Updated"}'

# Supprimer
curl -X DELETE http://localhost:8000/api/products/1
```

### Test Rate Limiting

```bash
# 6 appels = rate limit sur 6e
for i in {1..6}; do
  curl http://localhost:8000/api/auth/login
done
```

### Test Logging

```bash
# Voir audit logs
tail -f storage/logs/audit.log

# Voir security logs
tail -f storage/logs/security.log
```

---

## 📚 FICHIERS À CONSULTER

| Besoin | Fichier |
|--------|---------|
| **Configuration d'un nouveau controller** | Voir `ARCHITECTURE_IMPROVEMENTS.md` |
| **Migrer un ancien controller** | Voir `MIGRATION_GUIDE.md` |
| **Exemple complet** | `app/Http/Controllers/Examples/ProductControllerExample.php` |
| **Source du BaseController** | `app/Http/Controllers/BaseController.php` |
| **Source des DTOs** | `app/Data/Transfer/DTOs.php` |
| **Tout résumé** | Ce fichier! |

---

## ⚡ SHORTCUTS UTILES

### Réponses courantes

```php
// ✅ Success
return $this->success($data);

// 201 Created
return $this->created($data);

// 200 Updated
return $this->updated($data);

// 200 Deleted
return $this->deleted('Model', $id);

// 404 Not Found
return $this->notFound();

// 422 Validation Failed
return $this->validationFailed($errors);

// 401 Unauthorized
return $this->unauthorized();

// 403 Forbidden
return $this->forbidden();

// 429 Rate Limited
return $this->rateLimited();

// 500 Server Error
return $this->serverError($exception);
```

### Logging courant

```php
// Paiement
AuditLogService::logPayment($id, 'completed', $amount, $method, $txn);

// Stock
AuditLogService::logStockChange($id, $old, $new, 'order');

// Admin
AuditLogService::logAdminAction('ACTION', 'Model', $id, $changes);

// Sécurité
AuditLogService::logSecurityEvent('EVENT', 'details', severity: 2);
```

### Events/Jobs courant

```php
// Event
event(new OrderPlaced($order, $user));

// Job
dispatch(new SendWhatsAppMessage($phone, $msg, 'type'));
dispatch(new SendEmailJob($email, $subject, $template, $data));
dispatch(new UpdateStockJob($productId, $qty, 'decrease'));
```

---

## ✅ CHECKLIST INSTALLATION (5 min)

- [ ] Tous les fichiers en place
- [ ] `php artisan queue:table` exécuté
- [ ] `php artisan migrate` exécuté
- [ ] `bootstrap/app.php` middleware enregistré
- [ ] `config/logging.php` adapté
- [ ] 1 test curl pour vérifier

```bash
# Quick test
php artisan tinker
ProductDTO::validate(['name' => 'Test', 'prix_vente' => 100]);
# Devrait marcher! ✅
```

---

## 🚀 PROCHAINES ÉTAPES

1. **Cette semaine**: Migrer 5 controllers pilotes
2. **Prochaine semaine**: Mettre en place Events/Jobs complets
3. **Dans 2 semaines**: 100% des controllers migrés + 70% tests
4. **Dans 1 mois**: TypeScript + PWA

---

**Besoin d'aide?** Consulter:
- `ARCHITECTURE_IMPROVEMENTS.md` pour détails
- `MIGRATION_GUIDE.md` pour étapes
- Source code pour exemples

_Code quality = Product quality!_ 🎖️
