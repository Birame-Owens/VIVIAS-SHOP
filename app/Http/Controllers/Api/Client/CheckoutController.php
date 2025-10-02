<?php

namespace App\Http\Controllers\Api\Client;

use App\Http\Controllers\Controller;
use App\Http\Requests\Client\CheckoutRequest;
use App\Services\Client\CheckoutService;
use App\Models\Client;
use App\Models\Paiement;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Log;

class CheckoutController extends Controller
{
    protected CheckoutService $checkoutService;

    public function __construct(CheckoutService $checkoutService)
    {
        $this->checkoutService = $checkoutService;
    }

    /**
     * Traiter le processus de checkout
     */
    public function process(CheckoutRequest $request)
    {
        try {
            $user = Auth::user();
            
            // Récupérer le client associé à l'utilisateur
            $client = Client::where('user_id', $user->id)->first();
            
            if (!$client) {
                return response()->json([
                    'success' => false,
                    'message' => 'Profil client introuvable. Veuillez compléter votre profil.'
                ], 404);
            }
            
            // Créer la commande depuis le panier
            $orderResult = $this->checkoutService->createOrder(
                $request->delivery_info,
                $client->id,
                'site_web' // Source de la commande
            );

            if (!$orderResult['success']) {
                return response()->json($orderResult, 400);
            }

            $commandeId = $orderResult['data']['commande_id'];

            // Traiter le paiement selon la méthode choisie
            $paymentResult = match($request->payment_method) {
                'wave', 'orange', 'free' => $this->checkoutService->initiateWavePayment(
                    $commandeId,
                    $request->delivery_info['telephone']
                ),
                'stripe' => $this->checkoutService->initiateStripePayment($commandeId),
                'delivery' => $this->checkoutService->processCashOnDelivery($commandeId),
                default => [
                    'success' => false, 
                    'message' => 'Méthode de paiement non supportée'
                ]
            };

            // Vider le panier UNIQUEMENT pour les paiements confirmés instantanément
            // Pour Stripe, on attend le webhook de confirmation
            if ($paymentResult['success'] && in_array($request->payment_method, ['delivery', 'wave', 'orange', 'free'])) {
                $this->checkoutService->clearCartAfterOrder();
            }

            return response()->json($paymentResult);

        } catch (\Exception $e) {
            Log::error('Erreur checkout process', [
                'error' => $e->getMessage(),
                'trace' => $e->getTraceAsString(),
                'user_id' => Auth::id(),
                'request_data' => $request->except(['password'])
            ]);
            
            return response()->json([
                'success' => false,
                'message' => 'Une erreur est survenue lors du traitement de votre commande',
                'debug' => config('app.debug') ? $e->getMessage() : null
            ], 500);
        }
    }

    /**
     * Vérifier le statut d'un paiement Stripe après redirection
     */
    public function verifyStripePayment(Request $request)
    {
        try {
            $sessionId = $request->query('session_id');
            
            if (!$sessionId) {
                return response()->json([
                    'success' => false,
                    'message' => 'Session ID manquant'
                ], 400);
            }

            $user = Auth::user();
            $client = Client::where('user_id', $user->id)->first();

            if (!$client) {
                return response()->json([
                    'success' => false,
                    'message' => 'Profil client introuvable'
                ], 404);
            }

            // Récupérer le paiement avec la commande
            $paiement = Paiement::with('commande')
                ->where('transaction_id', $sessionId)
                ->first();

            if (!$paiement) {
                return response()->json([
                    'success' => false,
                    'message' => 'Paiement introuvable'
                ], 404);
            }

            // Vérifier que le paiement appartient bien au client connecté
            if ($paiement->client_id !== $client->id) {
                return response()->json([
                    'success' => false,
                    'message' => 'Accès non autorisé'
                ], 403);
            }

            $commande = $paiement->commande;

            // Si le paiement est validé, vider le panier
            if ($paiement->statut === 'valide') {
                $this->checkoutService->clearCartAfterOrder();
            }

            return response()->json([
                'success' => true,
                'data' => [
                    'paiement' => [
                        'statut' => $paiement->statut,
                        'montant' => $paiement->montant,
                        'methode' => $paiement->methode_paiement,
                        'date_validation' => $paiement->date_validation
                    ],
                    'commande' => [
                        'id' => $commande->id,
                        'numero_commande' => $commande->numero_commande,
                        'statut' => $commande->statut,
                        'montant_total' => $commande->montant_total,
                        'date_confirmation' => $commande->date_confirmation
                    ]
                ]
            ]);

        } catch (\Exception $e) {
            Log::error('Erreur vérification paiement Stripe', [
                'error' => $e->getMessage(),
                'trace' => $e->getTraceAsString(),
                'user_id' => Auth::id(),
                'session_id' => $request->query('session_id')
            ]);
            
            return response()->json([
                'success' => false,
                'message' => 'Erreur lors de la vérification du paiement',
                'debug' => config('app.debug') ? $e->getMessage() : null
            ], 500);
        }
    }
}