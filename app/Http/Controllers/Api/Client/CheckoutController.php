<?php

namespace App\Http\Controllers\Api\Client;

use App\Http\Controllers\Controller;
use App\Services\Client\CheckoutService;
use App\Models\Commande;
use App\Models\Paiement;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Validator;
use Exception;

class CheckoutController extends Controller
{
    protected $checkoutService;

    public function __construct(CheckoutService $checkoutService)
    {
        $this->checkoutService = $checkoutService;
    }

    /**
     * Créer une commande (guest ou authentifié)
     */
    public function createOrder(Request $request)
    {
        try {
            // ===== VALIDATION =====
            $validator = Validator::make($request->all(), [
                'customer.nom' => 'required|string|max:100',
                'customer.prenom' => 'required|string|max:100',
                'customer.telephone' => 'required|string|max:20',
                'customer.email' => 'required|email|max:255',
                'customer.adresse_livraison' => 'required|string',
                'customer.ville' => 'nullable|string|max:100',
                'customer.code_postal' => 'nullable|string|max:10',
                'customer.pays' => 'nullable|string|max:100',
                'items' => 'required|array|min:1',
                'items.*.product_id' => 'required|integer|exists:produits,id',
                'items.*.quantity' => 'required|integer|min:1',
                'items.*.options' => 'nullable|array',
                'coupon_code' => 'nullable|string',
                'notes' => 'nullable|string|max:500',
            ]);

            if ($validator->fails()) {
                return response()->json([
                    'success' => false,
                    'message' => $validator->errors()->first(),
                    'errors' => $validator->errors()
                ], 422);
            }

            \Log::info('🛒 CheckoutController@createOrder - Début', [
                'customer' => $request->input('customer'),
                'items_count' => count($request->input('items', [])),
                'session_id' => session()->getId()
            ]);

            $result = $this->checkoutService->createOrder($request->all());

            \Log::info('✅ CheckoutController@createOrder - Succès', [
                'commande_id' => $result['data']['commande']->id ?? null
            ]);

            // ✅ Ajouter le token d'authentification si compte créé automatiquement
            $client = $result['data']['commande']->client;
            if (isset($client->auth_token)) {
                $result['auth'] = [
                    'token' => $client->auth_token,
                    'user' => [
                        'id' => $client->user_id,
                        'name' => $client->prenom . ' ' . $client->nom,
                        'email' => $client->email,
                        'client' => $client
                    ],
                    'message' => 'Compte créé et connecté automatiquement'
                ];
                
                \Log::info('🎉 Token authentification ajouté à la réponse', [
                    'user_id' => $client->user_id,
                    'email' => $client->email
                ]);
            }

            return response()->json($result, 201);

        } catch (Exception $e) {
            \Log::error('❌ CheckoutController@createOrder - Erreur', [
                'message' => $e->getMessage(),
                'file' => $e->getFile(),
                'line' => $e->getLine(),
                'trace' => $e->getTraceAsString()
            ]);

            // Distinguer erreurs métier (400) des erreurs techniques (500)
            $isBusinessError = str_contains($e->getMessage(), 'Un compte existe déjà') 
                            || str_contains($e->getMessage(), 'email') 
                            || str_contains($e->getMessage(), 'stock')
                            || str_contains($e->getMessage(), 'stock')
                            || str_contains($e->getMessage(), 'téléphone')
                            || str_contains($e->getMessage(), 'connecter')
                            || str_contains($e->getMessage(), 'existe déjà');

            return response()->json([
                'success' => false,
                'message' => $e->getMessage(),
                'type' => $isBusinessError ? 'validation' : 'server_error',
                'status' => $isBusinessError ? 400 : 500
            ], $isBusinessError ? 400 : 500);
        }
    }

    /**
     * Initier le paiement
     */
    public function initiatePayment(Request $request, $orderNumber)
    {
        $validator = Validator::make($request->all(), [
            'provider' => 'required|in:stripe,wave,orange_money',
            'phone' => 'required_if:provider,wave,orange_money|string',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'errors' => $validator->errors()
            ], 422);
        }

        try {
            $commande = Commande::where('numero_commande', $orderNumber)->firstOrFail();

            if ($commande->statut !== 'en_attente') {
                return response()->json([
                    'success' => false,
                    'message' => 'Cette commande a déjà été traitée'
                ], 400);
            }

            $result = $this->checkoutService->initiatePayment(
                $commande,
                $request->provider,
                $request->only(['phone'])
            );

            return response()->json($result);

        } catch (Exception $e) {
            return response()->json([
                'success' => false,
                'message' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Page de succès après paiement
     */
    public function success(Request $request)
    {
        try {
            $orderNumber = $request->query('order');
            $sessionId = $request->query('session_id');

            if (!$orderNumber) {
                return response()->json([
                    'success' => false,
                    'message' => 'Numéro de commande manquant'
                ], 400);
            }

            // Si on a un session_id Stripe, confirmer le paiement
            if ($sessionId) {
                $paiement = Paiement::where('transaction_id', $sessionId)->first();

                if ($paiement && $paiement->statut !== 'valide') {
                    \Log::info('Confirmation paiement depuis success URL', [
                        'session_id' => $sessionId,
                        'paiement_id' => $paiement->id
                    ]);

                    // Confirmer le paiement (vide panier, crée facture, envoie emails)
                    $this->checkoutService->confirmPayment($paiement);
                }
            }

            $commande = Commande::where('numero_commande', $orderNumber)
                ->with([
                    'articles_commandes.produit.images_produits',
                    'client',
                    'paiements'
                ])
                ->firstOrFail();

            // Formatter les articles pour le frontend
            $commande->articles = $commande->articles_commandes->map(function ($article) {
                return [
                    'id' => $article->id,
                    'nom_produit' => $article->nom_produit,
                    'description_produit' => $article->description_produit,
                    'prix_unitaire' => $article->prix_unitaire,
                    'quantite' => $article->quantite,
                    'prix_total_article' => $article->prix_total_article,
                    'taille_choisie' => $article->taille_choisie,
                    'couleur_choisie' => $article->couleur_choisie,
                    'produit' => $article->produit
                ];
            });

            return response()->json([
                'success' => true,
                'data' => [
                    'commande' => $commande,
                    'message' => 'Votre commande a été enregistrée avec succès!'
                ]
            ]);

        } catch (Exception $e) {
            \Log::error('Erreur page success', [
                'order' => $request->query('order'),
                'error' => $e->getMessage()
            ]);

            return response()->json([
                'success' => false,
                'message' => $e->getMessage()
            ], 404);
        }
    }

    /**
     * Page d'annulation de paiement
     */
    public function cancel(Request $request)
    {
        try {
            $orderNumber = $request->query('order');

            if (!$orderNumber) {
                return response()->json([
                    'success' => false,
                    'message' => 'Numéro de commande manquant'
                ], 400);
            }

            $commande = Commande::where('numero_commande', $orderNumber)->firstOrFail();

            return response()->json([
                'success' => true,
                'data' => [
                    'commande' => $commande,
                    'message' => 'Le paiement a été annulé. Vous pouvez réessayer quand vous voulez.'
                ]
            ]);

        } catch (Exception $e) {
            return response()->json([
                'success' => false,
                'message' => $e->getMessage()
            ], 404);
        }
    }

    /**
     * Récupérer les détails d'une commande
     */
    public function getOrder($orderNumber)
    {
        try {
            $commande = Commande::where('numero_commande', $orderNumber)
                ->with(['articles.produit.images_produits', 'client', 'paiements'])
                ->firstOrFail();

            return response()->json([
                'success' => true,
                'data' => $commande
            ]);

        } catch (Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Commande non trouvée'
            ], 404);
        }
    }

    /**
     * Récupérer les commandes d'un utilisateur (si connecté)
     */
    public function getUserOrders(Request $request)
    {
        try {
            if (!auth()->check()) {
                return response()->json([
                    'success' => false,
                    'message' => 'Vous devez être connecté'
                ], 401);
            }

            $user = auth()->user();
            $client = $user->client;

            if (!$client) {
                return response()->json([
                    'success' => true,
                    'data' => []
                ]);
            }

            $commandes = Commande::where('client_id', $client->id)
                ->with(['articles.produit.images_produits', 'paiements'])
                ->orderBy('date_commande', 'desc')
                ->paginate(10);

            return response()->json([
                'success' => true,
                'data' => $commandes
            ]);

        } catch (Exception $e) {
            return response()->json([
                'success' => false,
                'message' => $e->getMessage()
            ], 500);
        }
    }
    
    /**
     * Récupérer une commande par son numéro (pour page success)
     */
    public function getOrderByNumber($orderNumber)
    {
        try {
            \Log::info('🔍 getOrderByNumber appelé', ['numero_commande' => $orderNumber]);
            
            $commande = Commande::where('numero_commande', $orderNumber)
                ->with(['articles.produit.images_produits', 'client', 'paiements'])
                ->firstOrFail();

            \Log::info('✅ Commande trouvée', [
                'id' => $commande->id,
                'numero' => $commande->numero_commande,
                'nb_articles' => $commande->articles->count(),
                'client' => $commande->client ? $commande->client->email : 'N/A'
            ]);

            return response()->json([
                'success' => true,
                'data' => $commande
            ]);

        } catch (Exception $e) {
            \Log::error('❌ getOrderByNumber erreur', [
                'numero_commande' => $orderNumber,
                'message' => $e->getMessage()
            ]);
            
            return response()->json([
                'success' => false,
                'message' => 'Commande non trouvée'
            ], 404);
        }
    }
}

