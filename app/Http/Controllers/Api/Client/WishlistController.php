<?php 

namespace App\Http\Controllers\Api\Client;

use App\Http\Controllers\Controller;
use App\Services\Client\WishlistService;
use App\Http\Requests\Client\WishlistRequest;
use Illuminate\Http\JsonResponse;

class WishlistController extends Controller
{
    protected WishlistService $wishlistService;

    public function __construct(WishlistService $wishlistService)
    {
        $this->wishlistService = $wishlistService;
    }

    public function index(): JsonResponse
    {
        try {
            $wishlist = $this->wishlistService->getWishlist();

            return response()->json([
                'success' => true,
                'data' => $wishlist
            ]);

        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Erreur lors du chargement des favoris'
            ], 500);
        }
    }

    public function add(WishlistRequest $request): JsonResponse
    {
        try {
            $validated = $request->validated();
            $result = $this->wishlistService->addToWishlist($validated['product_id']);

            return response()->json($result);

        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Erreur lors de l\'ajout aux favoris'
            ], 500);
        }
    }

    public function remove(int $productId): JsonResponse
    {
        try {
            $result = $this->wishlistService->removeFromWishlist($productId);

            return response()->json($result);

        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Erreur lors de la suppression'
            ], 500);    
        }
    }
 }