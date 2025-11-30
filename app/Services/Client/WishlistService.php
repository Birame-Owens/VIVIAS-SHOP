<?php
// ================================================================
// 📝 FICHIER: app/Services/Client/WishlistService.php
// ================================================================

namespace App\Services\Client;

use App\Models\Produit;
use App\Models\Wishlist;
use Illuminate\Support\Facades\Session;
use Illuminate\Support\Facades\Auth;

class WishlistService
{
    private string $sessionKey = 'vivias_wishlist';

    public function getWishlist(): array
    {
        $user = Auth::guard('sanctum')->user();

        if ($user) {
            // Utilisateur authentifié - BD
            return $this->getWishlistFromDatabase($user->id);
        } else {
            // Utilisateur invité - SESSION
            return $this->getWishlistFromSession();
        }
    }

    private function getWishlistFromDatabase(int $clientId): array
    {
        $wishlistItems = Wishlist::where('client_id', $clientId)
            ->with(['produit' => function($q) {
                $q->where('est_visible', true)
                  ->with(['images_produits' => function($query) {
                      $query->where('est_principale', true);
                  }, 'category']);
            }])
            ->get();

        $items = [];
        foreach ($wishlistItems as $item) {
            if ($item->produit) {
                $product = $item->produit;
                $items[] = [
                    'product' => [
                        'id' => $product->id,
                        'nom' => $product->nom,
                        'slug' => $product->slug,
                        'prix' => $product->prix,
                        'prix_promo' => $product->prix_promo,
                        'prix_affiche' => $product->prix_promo ?: $product->prix,
                        'en_promo' => $product->prix_promo !== null,
                        'image' => $product->image,
                        'category' => $product->category ? $product->category->nom : '',
                        'en_stock' => !$product->gestion_stock || $product->stock_disponible > 0,
                        'note_moyenne' => $product->note_moyenne,
                        'url' => "/products/{$product->slug}"
                    ],
                    'added_at' => $item->created_at->toISOString()
                ];
            }
        }

        return [
            'items' => $items,
            'count' => count($items)
        ];
    }

    private function getWishlistFromSession(): array
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
                        'image' => $product->image,
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

        $user = Auth::guard('sanctum')->user();

        if ($user) {
            // BD
            $exists = Wishlist::where('client_id', $user->id)
                ->where('produit_id', $productId)
                ->exists();

            if ($exists) {
                return ['success' => false, 'message' => 'Produit déjà dans vos favoris'];
            }

            Wishlist::create([
                'client_id' => $user->id,
                'produit_id' => $productId,
            ]);

            return ['success' => true, 'message' => 'Produit ajouté aux favoris'];
        } else {
            // SESSION
            $wishlist = Session::get($this->sessionKey, []);
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
    }

    public function removeFromWishlist(int $productId): array
    {
        $user = Auth::guard('sanctum')->user();

        if ($user) {
            Wishlist::where('client_id', $user->id)
                ->where('produit_id', $productId)
                ->delete();
        } else {
            $wishlist = Session::get($this->sessionKey, []);
            $wishlist = array_filter($wishlist, fn($item) => $item['product_id'] !== $productId);
            Session::put($this->sessionKey, array_values($wishlist));
        }

        return ['success' => true, 'message' => 'Produit retiré des favoris'];
    }

    public function clearWishlist(): array
    {
        $user = Auth::guard('sanctum')->user();

        if ($user) {
            Wishlist::where('client_id', $user->id)->delete();
        } else {
            Session::forget($this->sessionKey);
        }

        return ['success' => true, 'message' => 'Favoris vidés'];
    }

    public function isInWishlist(int $productId): bool
    {
        $user = Auth::guard('sanctum')->user();

        if ($user) {
            return Wishlist::where('client_id', $user->id)
                ->where('produit_id', $productId)
                ->exists();
        } else {
            $wishlist = Session::get($this->sessionKey, []);
            return collect($wishlist)->contains('product_id', $productId);
        }
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
        $user = Auth::guard('sanctum')->user();

        if ($user) {
            return Wishlist::where('client_id', $user->id)->count();
        } else {
            $wishlist = Session::get($this->sessionKey, []);
            return count($wishlist);
        }
    }

    public function getWishlistCount($user): int
    {
        if (!$user) {
            $wishlist = Session::get($this->sessionKey, []);
            return count($wishlist);
        }

        return Wishlist::where('client_id', $user->id)->count();
    }
}

