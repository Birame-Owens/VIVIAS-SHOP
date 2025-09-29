<?php


namespace App\Http\Controllers\Api\Client;

use App\Http\Controllers\Controller;
use App\Services\Client\CartService;
use App\Http\Requests\Client\CartRequest;
use Illuminate\Http\JsonResponse;

class CartController extends Controller
{
    protected CartService $cartService;

    public function __construct(CartService $cartService)
    {
        $this->cartService = $cartService;
    }

    public function index(): JsonResponse
    {
        try {
            $cart = $this->cartService->getCart();

            return response()->json([
                'success' => true,
                'data' => $cart
            ]);

        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Erreur lors du chargement du panier'
            ], 500);
        }
    }

    public function add(CartRequest $request): JsonResponse
    {
        try {
            $validated = $request->validated();
            
            $result = $this->cartService->addItem(
                $validated['product_id'],
                $validated['quantity'] ?? 1,
                [
                    'taille' => $validated['taille'] ?? null,
                    'couleur' => $validated['couleur'] ?? null
                ]
            );

            return response()->json($result);

        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Erreur lors de l\'ajout au panier'
            ], 500);
        }
    }

    public function update(string $itemId, CartRequest $request): JsonResponse
    {
        try {
            $validated = $request->validated();
            $result = $this->cartService->updateItem($itemId, $validated['quantity']);

            return response()->json($result);

        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Erreur lors de la mise à jour'
            ], 500);
        }
    }

    public function remove(string $itemId): JsonResponse
    {
        try {
            $result = $this->cartService->removeItem($itemId);

            return response()->json($result);

        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Erreur lors de la suppression'
            ], 500);
        }
    }

    public function clear(): JsonResponse
    {
        try {
            $result = $this->wishlistService->clearWishlist();

            return response()->json($result);

        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Erreur lors de la suppression des favoris'
            ], 500);
        }
    }

    public function getCount(): JsonResponse
    {
        try {
            $count = $this->wishlistService->getCount();

            return response()->json([
                'success' => true,
                'data' => ['count' => $count]
            ]);

        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Erreur lors du comptage'
            ], 500);
        }
    }

    public function moveToCart(int $productId): JsonResponse
    {
        try {
            $result = $this->wishlistService->moveToCart($productId);

            return response()->json($result);

        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Erreur lors du déplacement'
            ], 500);
        }
    }

    public function checkProduct(int $productId): JsonResponse
    {
        try {
            $isInWishlist = $this->wishlistService->isInWishlist($productId);

            return response()->json([
                'success' => true,
                'data' => ['is_in_wishlist' => $isInWishlist]
            ]);

        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Erreur lors de la vérification'
            ], 500);
        }
    }
}
