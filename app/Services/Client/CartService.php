<?php
// ================================================================
// 📝 FICHIER: app/Services/Client/CartService.php
// ================================================================

namespace App\Services\Client;

use App\Models\Produit;
use App\Models\Promotion;
use Illuminate\Support\Facades\Session;

class CartService
{
    private string $sessionKey = 'vivias_cart';
    private string $couponKey = 'vivias_coupon';

    public function getCart(): array
    {
        $cartData = Session::get($this->sessionKey, []);
        $coupon = Session::get($this->couponKey);
        
        if (empty($cartData)) {
            return $this->getEmptyCart();
        }

        $items = [];
        $subtotal = 0;

        foreach ($cartData as $itemData) {
            $product = Produit::with(['images_produits' => function($q) {
                $q->where('est_principale', true);
            }])->find($itemData['product_id']);

            if (!$product || !$product->est_visible) {
                continue;
            }

            $itemTotal = ($product->prix_promo ?: $product->prix) * $itemData['quantity'];
            $subtotal += $itemTotal;

            $items[] = [
                'id' => $itemData['id'],
                'product' => [
                    'id' => $product->id,
                    'nom' => $product->nom,
                    'slug' => $product->slug,
                    'prix' => $product->prix,
                    'prix_promo' => $product->prix_promo,
                    'prix_unitaire' => $product->prix_promo ?: $product->prix,
                    'image' => $product->images_produits->first() ? 
                        asset('storage/' . $product->images_produits->first()->chemin_original) : 
                        '/images/placeholder.jpg',
                    'en_stock' => !$product->gestion_stock || $product->stock_disponible > 0
                ],
                'quantity' => $itemData['quantity'],
                'taille' => $itemData['taille'] ?? null,
                'couleur' => $itemData['couleur'] ?? null,
                'prix_total' => $itemTotal,
                'added_at' => $itemData['added_at'] ?? now()->toISOString()
            ];
        }

        $discount = 0;
        $couponData = null;

        if ($coupon && isset($coupon['code'])) {
            $promotion = $this->validateCoupon($coupon['code'], $subtotal);
            if ($promotion) {
                $discount = $this->calculateDiscount($promotion, $subtotal);
                $couponData = [
                    'code' => $coupon['code'],
                    'nom' => $promotion->nom,
                    'type' => $promotion->type_promotion,
                    'valeur' => $promotion->valeur,
                    'discount' => $discount
                ];
            }
        }

        $shippingFee = $this->calculateShipping($subtotal);
        $total = $subtotal - $discount + $shippingFee;

        return [
            'items' => $items,
            'count' => count($items),
            'subtotal' => $subtotal,
            'discount' => $discount,
            'shipping_fee' => $shippingFee,
            'total' => $total,
            'coupon' => $couponData,
            'has_free_shipping' => $subtotal >= 50000
        ];
    }

    public function addItem(int $productId, int $quantity = 1, array $options = []): array
    {
        $product = Produit::find($productId);
        
        if (!$product || !$product->est_visible) {
            return ['success' => false, 'message' => 'Produit non trouvé'];
        }

        if ($product->gestion_stock && $product->stock_disponible < $quantity) {
            return ['success' => false, 'message' => 'Stock insuffisant'];
        }

        $cart = Session::get($this->sessionKey, []);
        $itemId = $this->generateItemId($productId, $options);

        // Vérifier si l'item existe déjà
        $existingKey = null;
        foreach ($cart as $key => $item) {
            if ($item['id'] === $itemId) {
                $existingKey = $key;
                break;
            }
        }

        if ($existingKey !== null) {
            $cart[$existingKey]['quantity'] += $quantity;
        } else {
            $cart[] = [
                'id' => $itemId,
                'product_id' => $productId,
                'quantity' => $quantity,
                'taille' => $options['taille'] ?? null,
                'couleur' => $options['couleur'] ?? null,
                'added_at' => now()->toISOString()
            ];
        }

        Session::put($this->sessionKey, $cart);

        return ['success' => true, 'message' => 'Produit ajouté au panier'];
    }

    public function updateItem(string $itemId, int $quantity): array
    {
        if ($quantity <= 0) {
            return $this->removeItem($itemId);
        }

        $cart = Session::get($this->sessionKey, []);
        $updated = false;

        foreach ($cart as &$item) {
            if ($item['id'] === $itemId) {
                $item['quantity'] = $quantity;
                $updated = true;
                break;
            }
        }

        if (!$updated) {
            return ['success' => false, 'message' => 'Article non trouvé'];
        }

        Session::put($this->sessionKey, $cart);
        return ['success' => true, 'message' => 'Panier mis à jour'];
    }

    public function removeItem(string $itemId): array
    {
        $cart = Session::get($this->sessionKey, []);
        $cart = array_filter($cart, fn($item) => $item['id'] !== $itemId);
        
        Session::put($this->sessionKey, array_values($cart));
        return ['success' => true, 'message' => 'Article retiré du panier'];
    }

    public function clearCart(): array
    {
        Session::forget($this->sessionKey);
        Session::forget($this->couponKey);
        return ['success' => true, 'message' => 'Panier vidé'];
    }

    public function applyCoupon(string $code): array
    {
        $cart = $this->getCart();
        
        if (empty($cart['items'])) {
            return ['success' => false, 'message' => 'Votre panier est vide'];
        }

        $promotion = $this->validateCoupon($code, $cart['subtotal']);
        
        if (!$promotion) {
            return ['success' => false, 'message' => 'Code promo invalide ou expiré'];
        }

        Session::put($this->couponKey, ['code' => $code]);
        
        return [
            'success' => true, 
            'message' => 'Code promo appliqué avec succès',
            'discount' => $this->calculateDiscount($promotion, $cart['subtotal'])
        ];
    }

    public function removeCoupon(): array
    {
        Session::forget($this->couponKey);
        return ['success' => true, 'message' => 'Code promo retiré'];
    }

    public function generateWhatsAppMessage(): array
    {
        $cart = $this->getCart();
        
        if (empty($cart['items'])) {
            return ['success' => false, 'message' => 'Votre panier est vide'];
        }

        $message = "🛒 *COMMANDE VIVIAS SHOP*\n\n";
        
        foreach ($cart['items'] as $item) {
            $message .= "📦 *{$item['product']['nom']}*\n";
            $message .= "   Quantité: {$item['quantity']}\n";
            if ($item['taille']) $message .= "   Taille: {$item['taille']}\n";
            if ($item['couleur']) $message .= "   Couleur: {$item['couleur']}\n";
            $message .= "   Prix: " . number_format($item['prix_total'], 0, ',', ' ') . " FCFA\n\n";
        }

        $message .= "💰 *RÉCAPITULATIF:*\n";
        $message .= "Sous-total: " . number_format($cart['subtotal'], 0, ',', ' ') . " FCFA\n";
        
        if ($cart['discount'] > 0) {
            $message .= "Remise: -" . number_format($cart['discount'], 0, ',', ' ') . " FCFA\n";
        }
        
        $message .= "Livraison: " . number_format($cart['shipping_fee'], 0, ',', ' ') . " FCFA\n";
        $message .= "*TOTAL: " . number_format($cart['total'], 0, ',', ' ') . " FCFA*\n\n";
        $message .= "Je souhaiterais passer cette commande. Merci ! 🙏";

        $whatsappNumber = config('app.whatsapp_number', '221771397393');
        
        return [
            'success' => true,
            'data' => [
                'message' => $message,
                'url' => "https://wa.me/{$whatsappNumber}?text=" . urlencode($message),
                'items_count' => count($cart['items']),
                'total' => $cart['total']
            ]
        ];
    }

    private function validateCoupon(string $code, float $subtotal): ?Promotion
    {
        return Promotion::where('code', $code)
            ->where('est_active', true)
            ->where('date_debut', '<=', now())
            ->where('date_fin', '>=', now())
            ->where(function($query) use ($subtotal) {
                $query->whereNull('montant_minimum')
                      ->orWhere('montant_minimum', '<=', $subtotal);
            })
            ->first();
    }

    private function calculateDiscount(Promotion $promotion, float $subtotal): float
    {
        switch ($promotion->type_promotion) {
            case 'pourcentage':
                $discount = ($subtotal * $promotion->valeur) / 100;
                return $promotion->reduction_maximum ? 
                    min($discount, $promotion->reduction_maximum) : $discount;
                
            case 'montant_fixe':
                return min($promotion->valeur, $subtotal);
                
            default:
                return 0;
        }
    }

    private function calculateShipping(float $subtotal): float
    {
        $freeShippingThreshold = config('app.free_shipping_threshold', 50000);
        return $subtotal >= $freeShippingThreshold ? 0 : 2500;
    }

    private function generateItemId(int $productId, array $options): string
    {
        $optionsString = http_build_query($options);
        return md5($productId . '_' . $optionsString);
    }

    private function getEmptyCart(): array
    {
        return [
            'items' => [],
            'count' => 0,
            'subtotal' => 0,
            'discount' => 0,
            'shipping_fee' => 0,
            'total' => 0,
            'coupon' => null,
            'has_free_shipping' => false
        ];
    }
}