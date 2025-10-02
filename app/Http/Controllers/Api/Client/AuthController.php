<?php

namespace App\Http\Controllers\Api\Client;

use App\Http\Controllers\Controller;
use App\Services\Client\AuthService;
use App\Http\Requests\Client\AuthRequest;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request; // ✅ Ajoutez ceci
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Log; // ✅ Ajoutez ceci
use App\Models\Client; // ✅ Ajoutez ceci
use App\Models\Commande; // ✅ Ajoutez ceci

class AuthController extends Controller
{
    protected AuthService $authService;

    public function __construct(AuthService $authService)
    {
        $this->authService = $authService;
    }

    public function register(AuthRequest $request): JsonResponse
    {
        try {
            $validated = $request->validated();
            $result = $this->authService->register($validated);

            if ($result['success']) {
                return response()->json($result, 201);
            }

            return response()->json($result, 400);

        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Erreur lors de l\'inscription'
            ], 500);
        }
    }

    public function login(AuthRequest $request): JsonResponse
    {
        try {
            $validated = $request->validated();
            $result = $this->authService->login($validated['email'], $validated['password']);

            if ($result['success']) {
                return response()->json($result);
            }

            return response()->json($result, 401);

        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Erreur lors de la connexion'
            ], 500);
        }
    }

    public function guestCheckout(AuthRequest $request): JsonResponse
    {
        try {
            $validated = $request->validated();
            $result = $this->authService->guestCheckout($validated);

            return response()->json($result);

        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Erreur lors de l\'enregistrement'
            ], 500);
        }
    }

    public function logout(): JsonResponse
    {
        try {
            $result = $this->authService->logout();

            return response()->json($result);

        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Erreur lors de la déconnexion'
            ], 500);
        }
    }

    public function profile(): JsonResponse
    {
        try {
            $result = $this->authService->getProfile();

            return response()->json($result);

        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Erreur lors du chargement du profil'
            ], 500);
        }
    }

    public function updateProfile(AuthRequest $request): JsonResponse
    {
        try {
            $validated = $request->validated();
            $result = $this->authService->updateProfile($validated);

            return response()->json($result);

        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Erreur lors de la mise à jour'
            ], 500);
        }
    }

    public function saveMeasurements(AuthRequest $request): JsonResponse
    {
        try {
            $validated = $request->validated();
            $result = $this->authService->saveMeasurements($validated);

            return response()->json($result);

        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Erreur lors de l\'enregistrement des mesures'
            ], 500);
        }
    }

    public function getMeasurements(): JsonResponse
    {
        try {
            $profile = $this->authService->getProfile();
            
            return response()->json([
                'success' => true,
                'data' => $profile['data']['mesures'] ?? null
            ]);

        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Erreur lors du chargement des mesures'
            ], 500);
        }
    }

    // app/Http/Controllers/Api/Client/AuthController.php

/**
 * Obtenir l'historique des commandes du client
 */
public function getOrders(Request $request)
{
    try {
        $user = Auth::user();
        $client = Client::where('user_id', $user->id)->first();

        if (!$client) {
            return response()->json([
                'success' => false,
                'message' => 'Client introuvable'
            ], 404);
        }

        $commandes = Commande::with(['articles_commandes.produit', 'paiements'])
            ->where('client_id', $client->id)
            ->orderBy('created_at', 'desc')
            ->get()
            ->map(function($commande) {
                return [
                    'id' => $commande->id,
                    'numero_commande' => $commande->numero_commande,
                    'date' => $commande->created_at->format('d/m/Y H:i'),
                    'statut' => $commande->statut,
                    'montant_total' => $commande->montant_total,
                    'nombre_articles' => $commande->articles_commandes->count(),
                    'est_payee' => $commande->paiements()
                        ->where('statut', 'valide')
                        ->sum('montant') >= $commande->montant_total,
                    'articles' => $commande->articles_commandes->map(function($article) {
                        return [
                            'nom' => $article->nom_produit,
                            'quantite' => $article->quantite,
                            'prix' => $article->prix_unitaire,
                            'image' => $article->produit->image_principale ?? null
                        ];
                    })
                ];
            });

        return response()->json([
            'success' => true,
            'data' => $commandes
        ]);

    } catch (\Exception $e) {
        Log::error('Erreur récupération commandes', [
            'error' => $e->getMessage()
        ]);
        
        return response()->json([
            'success' => false,
            'message' => 'Erreur lors de la récupération des commandes'
        ], 500);
    }
}
}
