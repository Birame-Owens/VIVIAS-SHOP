<?php
// ================================================================
// 📝 FICHIER: app/Services/Client/ProductService.php
// ================================================================

namespace App\Services\Client;

use App\Models\Produit;
use App\Models\Category;
use Illuminate\Support\Facades\Cache;

class ProductService
{
    public function getProducts(array $filters = []): array
{
    $query = Produit::where('est_visible', true)
        ->with(['category', 'images_produits' => function($q) {
            $q->where('est_principale', true)->orWhere('ordre_affichage', 1);
        }]);

    // Filtres
    if (isset($filters['category'])) {
        $query->where('categorie_id', $filters['category']);
    }

    if (isset($filters['search'])) {
        $query->where(function($q) use ($filters) {
            $q->where('nom', 'ILIKE', "%{$filters['search']}%")
              ->orWhere('description', 'ILIKE', "%{$filters['search']}%");
        });
    }

    if (isset($filters['min_price']) && $filters['min_price']) {
        $query->where('prix', '>=', $filters['min_price']);
    }

    if (isset($filters['max_price']) && $filters['max_price']) {
        $query->where('prix', '<=', $filters['max_price']);
    }

    if (isset($filters['on_sale']) && $filters['on_sale']) {
        $query->whereNotNull('prix_promo');
    }

    // Tri
    $sort = $filters['sort'] ?? 'recent';
    
    switch ($sort) {
        case 'price_asc':
            $query->orderBy('prix', 'asc');
            break;
        case 'price_desc':
            $query->orderBy('prix', 'desc');
            break;
        case 'popular':
            $query->orderBy('nombre_vues', 'desc');
            break;
        case 'rating':
            $query->orderBy('note_moyenne', 'desc');
            break;
        default:
            $query->orderBy('created_at', 'desc');
    }

    $perPage = $filters['per_page'] ?? 20;
    $products = $query->paginate($perPage);

    // IMPORTANT : Formater les produits
    $formattedProducts = $products->map(function ($product) {
        return $this->formatProductCard($product);
    });

    return [
        'products' => $formattedProducts,
        'pagination' => [
            'current_page' => $products->currentPage(),
            'last_page' => $products->lastPage(),
            'per_page' => $products->perPage(),
            'total' => $products->total(),
            'has_more' => $products->hasMorePages()
        ]
    ];
}

    public function getProductBySlug(string $slug): ?array
    {
        $product = Produit::where('slug', $slug)
            ->where('est_visible', true)
            ->with([
                'category',
                'images_produits' => function($q) {
                    $q->orderBy('ordre_affichage');
                }
            ])
            ->first();

        if (!$product) {
            return null;
        }

        // Incrémenter les vues
        $product->increment('nombre_vues');

        return $this->formatProductDetails($product);
    }

    public function getProductImages(int $productId): array
    {
        $product = Produit::find($productId);
        
        if (!$product) {
            return [];
        }

        return $product->images_produits->map(function ($image) {
            return [
                'id' => $image->id,
                'original' => asset('storage/' . $image->chemin_original),
                'thumbnail' => asset('storage/' . $image->chemin_miniature),
                'medium' => asset('storage/' . $image->chemin_moyen),
                'alt_text' => $image->alt_text ?: '',
                'est_principale' => $image->est_principale,
                'ordre' => $image->ordre_affichage
            ];
        })->toArray();
    }

    public function getRelatedProducts(int $productId, int $limit = 8): array
    {
        $product = Produit::find($productId);
        
        if (!$product) {
            return [];
        }

        $related = Produit::where('est_visible', true)
            ->where('id', '!=', $productId)
            ->where('categorie_id', $product->categorie_id)
            ->with(['images_produits' => function($q) {
                $q->where('est_principale', true);
            }])
            ->inRandomOrder()
            ->limit($limit)
            ->get();

        return $related->map(function ($product) {
            return $this->formatProductCard($product);
        })->toArray();
    }

    public function getWhatsAppData(int $productId): array
    {
        $product = Produit::with(['images_produits' => function($q) {
            $q->where('est_principale', true);
        }])->find($productId);

        if (!$product) {
            return ['success' => false, 'message' => 'Produit non trouvé'];
        }

        $image = $product->images_produits->first();
        $imageUrl = $image ? asset('storage/' . $image->chemin_original) : null;

        $message = "Bonjour VIVIAS SHOP ! 👋\n\n";
        $message .= "Je suis intéressé(e) par ce produit :\n";
        $message .= "📦 *{$product->nom}*\n";
        $message .= "💰 Prix : " . number_format($product->prix_promo ?: $product->prix, 0, ',', ' ') . " FCFA\n";
        
        if ($product->prix_promo) {
            $message .= "🏷️ Prix promotionnel !\n";
        }
        
        $message .= "\nPourriez-vous me donner plus d'informations ?\n";
        $message .= "Merci ! 🙏";

        $whatsappNumber = config('app.whatsapp_number', '221771397393');
        
        return [
            'success' => true,
            'data' => [
                'message' => $message,
                'phone' => $whatsappNumber,
                'url' => "https://wa.me/{$whatsappNumber}?text=" . urlencode($message),
                'product_image' => $imageUrl
            ]
        ];
    }

   private function formatProductDetails(Produit $product): array
{
    return [
        'id' => $product->id,
        'nom' => $product->nom,
        'slug' => $product->slug,
        'description' => $product->description,
        'description_courte' => $product->description_courte,
        'prix' => $product->prix,
        'prix_promo' => $product->prix_promo,
        'prix_affiche' => $product->prix_promo ?: $product->prix,
        'en_promo' => $product->prix_promo !== null,
        'pourcentage_reduction' => $product->prix_promo ? 
            round(((($product->prix - $product->prix_promo) / $product->prix) * 100), 0) : 0,
        'category' => $product->category ? [
            'id' => $product->category->id,
            'nom' => $product->category->nom,
            'slug' => $product->category->slug
        ] : null,
        'images' => $product->images_produits->map(function ($image) use ($product) {
            return [
                'id' => $image->id,
                'original' => $image->chemin_original ? asset('storage/' . $image->chemin_original) : asset('images/placeholder.jpg'),
                'thumbnail' => $image->chemin_miniature ? asset('storage/' . $image->chemin_miniature) : asset('images/placeholder.jpg'),
                'medium' => $image->chemin_moyen ? asset('storage/' . $image->chemin_moyen) : asset('images/placeholder.jpg'),
                'alt_text' => $image->alt_text ?: $product->nom,
                'est_principale' => $image->est_principale
            ];
        })->toArray(),
        'tailles_disponibles' => $product->tailles_disponibles ? 
            json_decode($product->tailles_disponibles, true) : [],
        'couleurs_disponibles' => $product->couleurs_disponibles ? 
            json_decode($product->couleurs_disponibles, true) : [],
        'stock_disponible' => $product->gestion_stock ? $product->stock_disponible : null,
        'en_stock' => !$product->gestion_stock || $product->stock_disponible > 0,
        'fait_sur_mesure' => $product->fait_sur_mesure,
        'delai_production_jours' => $product->delai_production_jours,
        'note_moyenne' => $product->note_moyenne,
        'nombre_avis' => $product->nombre_avis,
        'tags' => $product->tags ? explode(',', $product->tags) : [],
        'est_nouveaute' => $product->est_nouveaute,
        'est_populaire' => $product->est_populaire,
        'meta' => [
            'views' => $product->nombre_vues,
            'sales' => $product->nombre_ventes,
            'created_at' => $product->created_at->toISOString()
        ]
    ];
}
    private function formatProductCard(Produit $product): array
{
    $image = $product->images_produits->first();
    
    return [
        'id' => $product->id,
        'nom' => $product->nom,
        'slug' => $product->slug,
        'description_courte' => $product->description_courte,
        'prix' => $product->prix,
        'prix_promo' => $product->prix_promo,
        'prix_affiche' => $product->prix_promo ?: $product->prix,
        'en_promo' => $product->prix_promo !== null,
        'image' => $image && $image->chemin_original ? 
            asset('storage/' . $image->chemin_original) : 
            asset('images/placeholder-product.jpg'),
        'note_moyenne' => $product->note_moyenne ?? 0,
        'nombre_avis' => $product->nombre_avis ?? 0,
        'est_nouveaute' => $product->est_nouveaute,
        'est_populaire' => $product->est_populaire,
        'url' => "/products/{$product->slug}",
        'badge' => $this->getProductBadge($product)
    ];
}

    private function getProductBadge(Produit $product): ?array
    {
        if ($product->prix_promo) {
            $reduction = round(((($product->prix - $product->prix_promo) / $product->prix) * 100), 0);
            return ['text' => "-{$reduction}%", 'color' => 'red'];
        }
        
        if ($product->est_nouveaute || $product->created_at->gt(now()->subDays(30))) {
            return ['text' => 'Nouveau', 'color' => 'blue'];
        }
        
        if ($product->est_populaire) {
            return ['text' => 'Populaire', 'color' => 'yellow'];
        }
        
        return null;
    }



    
    public function getProductDetailPageData(string $slug): array
{
    $product = Produit::where('slug', $slug)
        ->where('est_visible', true)
        ->with([
            'category',
            'images_produits' => function($q) {
                $q->orderBy('ordre_affichage');
            }
        ])
        ->first();

    if (!$product) {
        return ['success' => false, 'message' => 'Produit non trouvé'];
    }

    // Incrémenter les vues
    $product->increment('nombre_vues');

    // Charger produits similaires
    $related = Produit::where('est_visible', true)
        ->where('id', '!=', $product->id)
        ->where('categorie_id', $product->categorie_id)
        ->with(['images_produits' => function($q) {
            $q->where('est_principale', true);
        }])
        ->inRandomOrder()
        ->limit(8)
        ->get();

    return [
        'success' => true,
        'data' => [
            'product' => $this->formatProductDetails($product),
            'related_products' => $related->map(function ($p) {
                return $this->formatProductCard($p);
            })->toArray()
        ]
    ];
}
}