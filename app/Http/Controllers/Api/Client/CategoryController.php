<?php
namespace App\Http\Controllers\Api\Client;

use App\Http\Controllers\Controller;
use App\Models\Category;
use App\Services\Client\ProductService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class CategoryController extends Controller
{
    protected ProductService $productService;

    public function __construct(ProductService $productService)
    {
        $this->productService = $productService;
    }

    public function index(): JsonResponse
    {
        try {
            $categories = Category::where('est_active', true)
                ->whereNull('parent_id')
                ->withCount('produits')
                ->orderBy('ordre_affichage')
                ->get()
                ->map(function ($category) {
                    return [
                        'id' => $category->id,
                        'nom' => $category->nom,
                        'slug' => $category->slug,
                        'description' => $category->description,
                        'image' => $category->image ? asset('storage/' . $category->image) : null,
                        'produits_count' => $category->produits_count,
                        'url' => "/categories/{$category->slug}"
                    ];
                });

            return response()->json([
                'success' => true,
                'data' => $categories
            ]);

        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Erreur lors du chargement des catégories'
            ], 500);
        }
    }

    public function show(string $slug): JsonResponse
    {
        try {
            $category = Category::where('slug', $slug)
                ->where('est_active', true)
                ->withCount('produits')
                ->first();

            if (!$category) {
                return response()->json([
                    'success' => false,
                    'message' => 'Catégorie non trouvée'
                ], 404);
            }

            return response()->json([
                'success' => true,
                'data' => [
                    'id' => $category->id,
                    'nom' => $category->nom,
                    'slug' => $category->slug,
                    'description' => $category->description,
                    'image' => $category->image ? asset('storage/' . $category->image) : null,
                    'produits_count' => $category->produits_count
                ]
            ]);

        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Erreur lors du chargement de la catégorie'
            ], 500);
        }
    }

    public function getProducts(string $slug, Request $request): JsonResponse
{
    try {
        $category = Category::where('slug', $slug)
            ->where('est_active', true)
            ->first();

        if (!$category) {
            return response()->json([
                'success' => false,
                'message' => 'Catégorie non trouvée'
            ], 404);
        }

        $filters = $request->only([
            'search', 'min_price', 'max_price', 'on_sale', 
            'sort', 'direction', 'per_page'
        ]);
        $filters['category'] = $category->id;

        $result = $this->productService->getProducts($filters);

        return response()->json([
            'success' => true,
            'data' => $result
        ]);

    } catch (\Exception $e) {
        \Log::error('Erreur getProducts:', ['error' => $e->getMessage()]);
        
        return response()->json([
            'success' => false,
            'message' => 'Erreur lors du chargement des produits'
        ], 500);
    }
}
}
