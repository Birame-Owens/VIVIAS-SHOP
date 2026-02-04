<?php

namespace App\Http\Controllers\Api\Client;

use App\Http\Controllers\Controller;
use App\Models\Commande;
use App\Services\Client\PayTechService;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\Log;
use Exception;

class PayTechController extends Controller
{
    private PayTechService $payTechService;

    public function __construct(PayTechService $payTechService)
    {
        $this->payTechService = $payTechService;
    }

    /**
     * Initier un paiement PayTech (Wave, Orange Money, etc.)
     * 
     * POST /api/client/paytech/initiate
     * 
     * @param Request $request
     * @return JsonResponse
     */
    public function initiate(Request $request): JsonResponse
    {
        try {
            $validated = $request->validate([
                'numero_commande' => 'required|string|exists:commandes,numero_commande',
                'payment_method' => 'nullable|string', // 'Orange Money', 'Wave', 'Free Money', etc.
                'phone' => 'nullable|string',
            ]);

            $commande = Commande::where('numero_commande', $validated['numero_commande'])
                ->with('client')
                ->first();

            if (!$commande) {
                return response()->json([
                    'success' => false,
                    'message' => 'Commande non trouvée',
                ], 404);
            }

            // Vérifier que la commande est en attente
            if ($commande->statut !== 'en_attente') {
                return response()->json([
                    'success' => false,
                    'message' => 'Cette commande ne peut plus être payée',
                ], 400);
            }

            // Créer la demande de paiement PayTech
            $paymentData = $this->payTechService->createPaymentRequest(
                $commande,
                $validated['payment_method'] ?? '',
                $validated['phone'] ?? $commande->client->telephone
            );

            if (!isset($paymentData['success']) || $paymentData['success'] !== 1) {
                throw new Exception($paymentData['message'] ?? 'Erreur lors de la création du paiement');
            }

            return response()->json([
                'success' => true,
                'message' => 'Paiement initié avec succès',
                'data' => [
                    'payment_url' => $paymentData['redirect_url'] ?? $paymentData['redirectUrl'] ?? null,
                    'token' => $paymentData['token'] ?? null,
                ],
            ]);

        } catch (Exception $e) {
            Log::error('PayTech initiation error', [
                'message' => $e->getMessage(),
                'request' => $request->all(),
            ]);

            return response()->json([
                'success' => false,
                'message' => 'Erreur lors de l\'initialisation du paiement',
                'error' => $e->getMessage(),
            ], 500);
        }
    }

    /**
     * Vérifier le statut d'un paiement
     * 
     * GET /api/client/paytech/status/{token}
     * 
     * @param string $token
     * @return JsonResponse
     */
    public function checkStatus(string $token): JsonResponse
    {
        try {
            $statusData = $this->payTechService->getPaymentStatus($token);

            return response()->json([
                'success' => true,
                'data' => $statusData,
            ]);

        } catch (Exception $e) {
            Log::error('PayTech status check error', [
                'token' => $token,
                'message' => $e->getMessage(),
            ]);

            return response()->json([
                'success' => false,
                'message' => 'Erreur lors de la vérification du statut',
            ], 500);
        }
    }

    /**
     * Callback de succès/annulation (redirection depuis PayTech)
     * 
     * GET /api/client/paytech/callback
     * 
     * @param Request $request
     * @return JsonResponse
     */
    public function callback(Request $request): JsonResponse
    {
        try {
            $numeroCommande = $request->query('order');

            if (!$numeroCommande) {
                return response()->json([
                    'success' => false,
                    'message' => 'Numéro de commande manquant',
                ], 400);
            }

            $commande = Commande::where('numero_commande', $numeroCommande)
                ->with(['paiement', 'client', 'articles.produit'])
                ->first();

            if (!$commande) {
                return response()->json([
                    'success' => false,
                    'message' => 'Commande non trouvée',
                ], 404);
            }

            return response()->json([
                'success' => true,
                'data' => [
                    'commande' => $commande,
                ],
            ]);

        } catch (Exception $e) {
            Log::error('PayTech callback error', [
                'message' => $e->getMessage(),
                'query' => $request->query(),
            ]);

            return response()->json([
                'success' => false,
                'message' => 'Erreur lors du traitement du callback',
            ], 500);
        }
    }

    /**
     * Webhook PayTech (IPN - Instant Payment Notification)
     * 
     * POST /api/webhook/paytech
     * 
     * @param Request $request
     * @return JsonResponse
     */
    public function webhook(Request $request): JsonResponse
    {
        try {
            Log::info('PayTech webhook received', [
                'type_event' => $request->input('type_event'),
                'ref_command' => $request->input('ref_command'),
                'payload' => $request->all(),
            ]);

            // Traiter l'événement IPN
            $payload = $request->all();
            $success = $this->payTechService->handleIPN($payload);

            if ($success) {
                return response()->json(['success' => true], 200);
            }

            return response()->json(['error' => 'IPN processing failed'], 500);

        } catch (Exception $e) {
            Log::error('PayTech webhook error', [
                'message' => $e->getMessage(),
                'payload' => $request->all(),
            ]);

            return response()->json(['error' => 'Internal error'], 500);
        }
    }
}
