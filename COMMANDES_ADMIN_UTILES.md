# 🔧 COMMANDES ADMIN UTILES

## Configuration Initiale

### 1. Lancer le seeder de test
```bash
php artisan db:seed --class=AdminProductsAndCategoriesSeeder
```

### 2. Créer un lien symbolique pour les images
```bash
php artisan storage:link
```

### 3. Vérifier la configuration du storage
```bash
php artisan config:cache
```

---

## API Endpoints Pratiques

### Synchronisation (Via HTTP)

```bash
# Synchroniser tous les catégories-produits
curl -X POST http://192.168.1.14:8000/api/admin/sync \
  -H "Authorization: Bearer {token}" \
  -H "Content-Type: application/json"

# Obtenir le rapport complet
curl -X GET http://192.168.1.14:8000/api/admin/sync/report \
  -H "Authorization: Bearer {token}"

# Vérifier la visibilité d'une catégorie
curl -X GET http://192.168.1.14:8000/api/admin/sync/categories/{id}/visibility \
  -H "Authorization: Bearer {token}"

# Réinitialiser une catégorie
curl -X POST http://192.168.1.14:8000/api/admin/sync/categories/{id}/reset \
  -H "Authorization: Bearer {token}"
```

### Catégories

```bash
# Lister toutes les catégories
curl -X GET http://192.168.1.14:8000/api/admin/categories \
  -H "Authorization: Bearer {token}"

# Créer une catégorie
curl -X POST http://192.168.1.14:8000/api/admin/categories \
  -H "Authorization: Bearer {token}" \
  -H "Content-Type: application/json" \
  -d '{
    "nom": "Nouvelle Catégorie",
    "description": "Description",
    "est_active": true,
    "ordre_affichage": 1
  }'

# Activer/Désactiver une catégorie
curl -X POST http://192.168.1.14:8000/api/admin/categories/{id}/toggle-status \
  -H "Authorization: Bearer {token}"
```

### Produits

```bash
# Lister tous les produits
curl -X GET "http://192.168.1.14:8000/api/admin/produits?per_page=15" \
  -H "Authorization: Bearer {token}"

# Filtrer par catégorie
curl -X GET "http://192.168.1.14:8000/api/admin/produits?category_id=1" \
  -H "Authorization: Bearer {token}"

# Filtrer par statut
curl -X GET "http://192.168.1.14:8000/api/admin/produits?status=visible" \
  -H "Authorization: Bearer {token}"

# Créer un produit
curl -X POST http://192.168.1.14:8000/api/admin/produits \
  -H "Authorization: Bearer {token}" \
  -H "Content-Type: multipart/form-data" \
  -F "nom=Nouveau Produit" \
  -F "description=Description du produit" \
  -F "prix=50000" \
  -F "categorie_id=1" \
  -F "stock_disponible=10" \
  -F "image_principale=@/path/to/image.jpg"

# Activer/Désactiver un produit
curl -X POST http://192.168.1.14:8000/api/admin/produits/{id}/toggle-status \
  -H "Authorization: Bearer {token}"
```

---

## Commandes Artisan Personnalisées

Créez ce fichier: `app/Console/Commands/SyncCategoryProducts.php`

```bash
php artisan sync:categories
```

Cela exécutera la synchronisation et affichera un rapport.

---

## Vérifications de Santé

### 1. Vérifier l'intégrité des catégories-produits

```bash
# Vérifier via Tinker
php artisan tinker

# Dans Tinker:
>>> $service = app(\App\Services\Admin\CategoryProductSyncService::class);
>>> $report = $service->generateFullReport();
>>> dd($report);
```

### 2. Vérifier les images orphelines

```bash
# Lister les fichiers dans le répertoire d'images
ls -la storage/app/public/images/produits/

# Nettoyer les images orphelines (ATTENTION: dangereux)
php artisan storage:prune
```

### 3. Vérifier les permissions

```bash
# Vérifier les permissions de storage
ls -la storage/app/public/

# Si nécessaire, réparer
chmod -R 755 storage/
chmod -R 755 public/storage/
```

---

## Tests & Débogage

### Tester le upload d'images

```bash
# Via Postman ou curl
POST /api/admin/produits
Body (form-data):
- nom: "Test Product"
- images: [File1, File2, File3]

# Vérifier que les variantes sont créées:
ls -la storage/app/public/images/produits/{produit_id}/
```

### Logger les erreurs

```bash
# Afficher les derniers logs
tail -f storage/logs/laravel.log

# Filtrer les erreurs d'upload
tail -f storage/logs/laravel.log | grep -i "upload\|image"
```

### Tester via Tinker

```bash
php artisan tinker

# Tester la synchronisation
>>> $service = app(\App\Services\Admin\CategoryProductSyncService::class);
>>> $result = $service->syncVisibility();
>>> print_r($result);

# Tester la visibilité d'une catégorie
>>> $category = \App\Models\Category::find(1);
>>> $visibility = $service->getCategoryClientVisibility($category);
>>> dd($visibility);

# Vérifier qu'un produit est visible côté client
>>> $product = \App\Models\Produit::find(1);
>>> $product->est_visible && $product->category->est_active;
```

---

## Performance & Optimisation

### Cache

```bash
# Activer le cache des requêtes
php artisan config:cache

# Vider le cache
php artisan cache:clear

# Vider le cache des vues
php artisan view:clear
```

### Optimisation des images

```bash
# Compresser une image existante
# (utilise ImageUploadService)

php artisan tinker
>>> $service = app(\App\Services\ImageUploadService::class);
>>> $image = \App\Models\ImagesProduit::find(1);
>>> $size = $service->getImageSize($image->image_url);
>>> dd($size);
```

---

## Modèle de Rapport Complet

Le rapport généré contient:

```json
{
  "generated_at": "2026-01-04 14:30:00",
  "total_categories": 4,
  "total_products": 12,
  "categories": [
    {
      "id": 1,
      "nom": "Costumes",
      "est_active": true,
      "total_products": 5,
      "visible_products": 4,
      "visible_on_client": true,
      "reason": "Catégorie et produits visibles côté client"
    },
    {
      "id": 2,
      "nom": "Robes",
      "est_active": true,
      "total_products": 3,
      "visible_products": 0,
      "visible_on_client": false,
      "reason": "Aucun produit visible dans cette catégorie"
    }
  ]
}
```

---

## Enregistrement dans les Logs

Tous les événements admin sont loggés dans `storage/logs/laravel.log`:

```
[YYYY-MM-DD HH:MM:SS] local.INFO: Nouvelle catégorie créée {"category_id": 5, "nom": "Test"}
[YYYY-MM-DD HH:MM:SS] local.INFO: Produit 3 activé {"nom": "Costume Test", "sera_visible_client": true}
[YYYY-MM-DD HH:MM:SS] local.WARNING: 2 produit(s) désactivé(s) - catégorie inactive
```

---

## Troubleshooting Rapide

| Problème | Solution |
|----------|----------|
| Images ne s'affichent pas | `php artisan storage:link` |
| Permissions refusées | `chmod -R 755 storage/` |
| Catégorie vide côté client | `GET /api/admin/sync/report` |
| Produit visible mais absent | Vérifier `est_visible` et catégorie `est_active` |
| Erreur 500 sur upload | Vérifier les logs: `tail -f storage/logs/laravel.log` |

---

**Version**: 1.0  
**Date**: 04/01/2026  
**Statut**: ✅ Prêt à l'emploi
