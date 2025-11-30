<?php

namespace App\Http\Controllers\Api\Client;

use App\Http\Controllers\Controller;
use App\Services\Client\CheckoutService;
use App\Models\Paiement;
use Illuminate\Http\Request;
use Stripe\Webhook;
use Exception;

class StripeWebhookController extends Controller
{
    protected $checkoutService;

    public function __construct(CheckoutService $checkoutService)
    {
        $this->checkoutService = $checkoutService;
    }

    /**
     * Gérer les webhooks Stripe
     */
    public function handle(Request $request)
    {
        $payload = $request->getContent();
        $sigHeader = $request->header('Stripe-Signature');
        $webhookSecret = config('services.stripe.webhook_secret');

        try {
            // Vérifier signature uniquement si webhook secret défini
            if ($webhookSecret) {
                $event = Webhook::constructEvent($payload, $sigHeader, $webhookSecret);
            } else {
                // Mode dev sans Stripe CLI - parser payload directement
                \Log::warning('Webhook Stripe sans vérification signature (dev mode)');
                $event = json_decode($payload);
                if (json_last_error() !== JSON_ERROR_NONE) {
                    throw new Exception('Invalid JSON payload');
                }
            }

            \Log::info('Webhook Stripe reçu', [
                'type' => $event->type ?? 'unknown',
                'id' => $event->id ?? null
            ]);

            $eventType = is_object($event) && isset($event->type) ? $event->type : null;

            switch ($eventType) {
                case 'checkout.session.completed':
                    $this->handleCheckoutCompleted($event->data->object ?? $event->data);
                    break;

                case 'payment_intent.succeeded':
                    $this->handlePaymentSucceeded($event->data->object ?? $event->data);
                    break;

                case 'payment_intent.payment_failed':
                    $this->handlePaymentFailed($event->data->object ?? $event->data);
                    break;

                default:
                    \Log::info('Stripe webhook type non géré: ' . $eventType);
            }

            return response()->json(['success' => true]);

        } catch (Exception $e) {
            \Log::error('Erreur webhook Stripe', [
                'error' => $e->getMessage(),
                'trace' => $e->getTraceAsString()
            ]);
            return response()->json(['error' => $e->getMessage()], 400);
        }
    }

    /**
     * Traiter checkout complété
     */
    private function handleCheckoutCompleted($session)
    {
        \Log::info('Traitement checkout completed', ['session_id' => $session->id]);
        
        $paiement = Paiement::where('reference_transaction', $session->id)->first();

        if (!$paiement) {
            \Log::error('Paiement non trouvé pour session: ' . $session->id);
            return;
        }

        if ($paiement->statut === 'valide') {
            \Log::warning('Paiement déjà validé: ' . $paiement->id);
            return;
        }

        try {
            $this->checkoutService->confirmPayment($paiement);
            \Log::info('Paiement confirmé avec succès', [
                'paiement_id' => $paiement->id,
                'commande_id' => $paiement->commande_id
            ]);
        } catch (\Exception $e) {
            \Log::error('Erreur confirmation paiement', [
                'paiement_id' => $paiement->id,
                'error' => $e->getMessage()
            ]);
            throw $e;
        }
    }

    /**
     * Traiter paiement réussi
     */
    private function handlePaymentSucceeded($paymentIntent)
    {
        \Log::info('Paiement réussi: ' . $paymentIntent->id);
    }

    /**
     * Traiter paiement échoué
     */
    private function handlePaymentFailed($paymentIntent)
    {
        \Log::warning('Paiement échoué: ' . $paymentIntent->id);
    }
}
