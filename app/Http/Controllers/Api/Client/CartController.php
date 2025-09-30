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
            return response()->json(['success' => true, 'data' => $cart]);
        } catch (\Exception $e) {
            return response()->json(['success' => false, 'message' => 'Erreur'], 500);
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
            return response()->json(['success' => false, 'message' => 'Erreur'], 500);
        }
    }

    public function update(string $itemId, CartRequest $request): JsonResponse
    {
        try {
            $validated = $request->validated();
            $result = $this->cartService->updateItem($itemId, $validated['quantity']);
            return response()->json($result);
        } catch (\Exception $e) {
            return response()->json(['success' => false, 'message' => 'Erreur'], 500);
        }
    }

    public function remove(string $itemId): JsonResponse
    {
        try {
            $result = $this->cartService->removeItem($itemId);
            return response()->json($result);
        } catch (\Exception $e) {
            return response()->json(['success' => false, 'message' => 'Erreur'], 500);
        }
    }

    // ⚠️ CORRIGÉ - Utilisez cartService au lieu de wishlistService
    public function clear(): JsonResponse
    {
        try {
            $result = $this->cartService->clearCart();
            return response()->json($result);
        } catch (\Exception $e) {
            return response()->json(['success' => false, 'message' => 'Erreur'], 500);
        }
    }

    // ⚠️ CORRIGÉ - Utilisez cartService
    public function getCount(): JsonResponse
    {
        try {
            $cart = $this->cartService->getCart();
            return response()->json([
                'success' => true,
                'data' => ['count' => $cart['count']]
            ]);
        } catch (\Exception $e) {
            return response()->json(['success' => false, 'message' => 'Erreur comptage'], 500);
        }
    }

    public function getTotal(): JsonResponse
    {
        try {
            $cart = $this->cartService->getCart();
            return response()->json([
                'success' => true,
                'data' => [
                    'subtotal' => $cart['subtotal'],
                    'discount' => $cart['discount'],
                    'shipping_fee' => $cart['shipping_fee'],
                    'total' => $cart['total']
                ]
            ]);
        } catch (\Exception $e) {
            return response()->json(['success' => false, 'message' => 'Erreur'], 500);
        }
    }

    public function applyCoupon(CartRequest $request): JsonResponse
    {
        try {
            $validated = $request->validated();
            $result = $this->cartService->applyCoupon($validated['code']);
            return response()->json($result);
        } catch (\Exception $e) {
            return response()->json(['success' => false, 'message' => 'Erreur'], 500);
        }
    }

    public function removeCoupon(): JsonResponse
    {
        try {
            $result = $this->cartService->removeCoupon();
            return response()->json($result);
        } catch (\Exception $e) {
            return response()->json(['success' => false, 'message' => 'Erreur'], 500);
        }
    }

    public function generateWhatsAppMessage(): JsonResponse
    {
        try {
            $result = $this->cartService->generateWhatsAppMessage();
            return response()->json($result);
        } catch (\Exception $e) {
            return response()->json(['success' => false, 'message' => 'Erreur'], 500);
        }
    }
}
