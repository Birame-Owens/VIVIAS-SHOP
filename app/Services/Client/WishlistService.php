<?php
// ================================================================
// 📝 FICHIER: app/Services/Client/WishlistService.php
// ================================================================

namespace App\Services\Client;

use App\Models\Produit;
use Illuminate\Support\Facades\Session;

class WishlistService
{
    private string $sessionKey = 'vivias_wishlist';

    public function getWishlist(): array
    {
        $wishlistData = Session::get($this->sessionKey, []);
        
        if (empty($wishlistData)) {
            return ['items' => [], 'count' => 0];
        }

        $productIds = array_column($wishlistData, 'product_id');
        $products = Produit::whereIn('id', $productIds)
            ->where('est_visible', true)
            ->with(['images_produits' => function($q) {
                $q->where('est_principale', true);
            }, 'category'])
            ->get();

        $items = [];
        foreach ($wishlistData as $item) {
            $product = $products->firstWhere('id', $item['product_id']);
            if ($product) {
                $items[] = [
                    'product' => [
                        'id' => $product->id,
                        'nom' => $product->nom,
                        'slug' => $product->slug,
                        'prix' => $product->prix,
                        'prix_promo' => $product->prix_promo,
                        'prix_affiche' => $product->prix_promo ?: $product->prix,
                        'en_promo' => $product->prix_promo !== null,
                        'image' => $product->images_produits->first() ? 
                            asset('storage/' . $product->images_produits->first()->chemin_original) : 
                            '/images/placeholder.jpg',
                        'category' => $product->category ? $product->category->nom : '',
                        'en_stock' => !$product->gestion_stock || $product->stock_disponible > 0,
                        'note_moyenne' => $product->note_moyenne,
                        'url' => "/products/{$product->slug}"
                    ],
                    'added_at' => $item['added_at']
                ];
            }
        }

        return [
            'items' => $items,
            'count' => count($items)
        ];
    }

    public function addToWishlist(int $productId): array
    {
        $product = Produit::find($productId);
        
        if (!$product || !$product->est_visible) {
            return ['success' => false, 'message' => 'Produit non trouvé'];
        }

        $wishlist = Session::get($this->sessionKey, []);

        // Vérifier si le produit est déjà dans la wishlist
        $exists = collect($wishlist)->contains('product_id', $productId);
        
        if ($exists) {
            return ['success' => false, 'message' => 'Produit déjà dans vos favoris'];
        }

        $wishlist[] = [
            'product_id' => $productId,
            'added_at' => now()->toISOString()
        ];

        Session::put($this->sessionKey, $wishlist);

        return ['success' => true, 'message' => 'Produit ajouté aux favoris'];
    }

    public function removeFromWishlist(int $productId): array
    {
        $wishlist = Session::get($this->sessionKey, []);
        $wishlist = array_filter($wishlist, fn($item) => $item['product_id'] !== $productId);
        
        Session::put($this->sessionKey, array_values($wishlist));

        return ['success' => true, 'message' => 'Produit retiré des favoris'];
    }

    public function clearWishlist(): array
    {
        Session::forget($this->sessionKey);
        return ['success' => true, 'message' => 'Favoris vidés'];
    }

    public function isInWishlist(int $productId): bool
    {
        $wishlist = Session::get($this->sessionKey, []);
        return collect($wishlist)->contains('product_id', $productId);
    }

    public function moveToCart(int $productId): array
    {
        $cartService = new CartService();
        
        // Ajouter au panier
        $result = $cartService->addItem($productId, 1);
        
        if ($result['success']) {
            // Retirer des favoris
            $this->removeFromWishlist($productId);
            return ['success' => true, 'message' => 'Produit déplacé vers le panier'];
        }

        return $result;
    }

    public function getCount(): int
    {
        $wishlist = Session::get($this->sessionKey, []);
        return count($wishlist);
    }
}
