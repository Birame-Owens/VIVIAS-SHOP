<?php

namespace App\Http\Controllers\Api\Client;

use App\Http\Controllers\Controller;
use App\Models\Paiement;
use App\Models\Commande;
use App\Services\Client\CartService;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;
use Stripe\Webhook;
use Stripe\Exception\SignatureVerificationException;

class StripeWebhookController extends Controller
{
    protected CartService $cartService;

    public function __construct(CartService $cartService)
    {
        $this->cartService = $cartService;
    }

    public function handle(Request $request)
    {
        $payload = $request->getContent();
        $sigHeader = $request->header('Stripe-Signature');
        $webhookSecret = config('services.stripe.webhook_secret');

        try {
            $event = Webhook::constructEvent($payload, $sigHeader, $webhookSecret);
        } catch (SignatureVerificationException $e) {
            Log::error('Webhook Stripe signature invalide', ['error' => $e->getMessage()]);
            return response()->json(['error' => 'Invalid signature'], 400);
        }

        // Gérer l'événement selon son type
        switch ($event->type) {
            case 'checkout.session.completed':
                $this->handleCheckoutSessionCompleted($event->data->object);
                break;

            case 'payment_intent.succeeded':
                $this->handlePaymentIntentSucceeded($event->data->object);
                break;

            case 'payment_intent.payment_failed':
                $this->handlePaymentIntentFailed($event->data->object);
                break;

            default:
                Log::info('Type d\'événement Stripe non géré', ['type' => $event->type]);
        }

        return response()->json(['success' => true]);
    }

    /**
     * Gérer la session de checkout complétée
     */
  // app/Http/Controllers/Api/Client/StripeWebhookController.php

private function handleCheckoutSessionCompleted($session)
{
    try {
        $paiement = Paiement::where('transaction_id', $session->id)
            ->where('statut', 'en_attente')
            ->first();

        if (!$paiement) {
            Log::warning('Paiement introuvable', ['session_id' => $session->id]);
            return;
        }

        $paiement->update([
            'statut' => 'valide',
            'date_validation' => now(),
            'code_autorisation' => $session->payment_intent,
            'donnees_api' => json_encode($session->toArray())
        ]);

        $commande = $paiement->commande;
        
        if ($commande) {
            $commande->update([
                'statut' => 'confirmee',
                'date_confirmation' => now()
            ]);

            Log::info('✅ Commande confirmée et payée', [
                'commande_id' => $commande->id,
                'numero_commande' => $commande->numero_commande
            ]);

            // 🔔 ENVOYER NOTIFICATION AU CLIENT
            $this->sendClientNotification($commande);

            // 🔔 ENVOYER NOTIFICATION À L'ADMIN
            $this->sendAdminNotification($commande);
        }

    } catch (\Exception $e) {
        Log::error('Erreur webhook', [
            'error' => $e->getMessage(),
            'session_id' => $session->id ?? 'unknown'
        ]);
    }
}

/**
 * Envoyer notification WhatsApp au client
 */
private function sendClientNotification($commande)
{
    $client = $commande->client;
    $telephone = $client->telephone;
    
    $message = "🎉 *Commande confirmée !*\n\n";
    $message .= "Bonjour {$client->prenom},\n\n";
    $message .= "Votre commande *{$commande->numero_commande}* a été confirmée avec succès !\n\n";
    $message .= "📦 *Détails :*\n";
    $message .= "• Montant : {$commande->montant_total} F CFA\n";
    $message .= "• Articles : {$commande->articles_commandes->count()}\n";
    $message .= "• Statut : Confirmée ✅\n\n";
    $message .= "Nous traiterons votre commande dans les plus brefs délais.\n\n";
    $message .= "Merci de votre confiance ! 💜\n";
    $message .= "*VIVIAS SHOP*";

    // TODO: Implémenter l'envoi WhatsApp avec Twilio ou WhatsApp Business API
    Log::info('📱 Notification client WhatsApp', [
        'telephone' => $telephone,
        'message' => $message
    ]);
}

/**
 * Envoyer notification WhatsApp à l'admin
 */
private function sendAdminNotification($commande)
{
    $adminPhone = config('app.admin_whatsapp', '+221771397393');
    
    $message = "🔔 *NOUVELLE COMMANDE PAYÉE*\n\n";
    $message .= "📋 *{$commande->numero_commande}*\n\n";
    $message .= "👤 Client : {$commande->client->prenom} {$commande->client->nom}\n";
    $message .= "📞 Tél : {$commande->client->telephone}\n";
    $message .= "💰 Montant : *{$commande->montant_total} F CFA*\n";
    $message .= "📦 Articles : {$commande->articles_commandes->count()}\n";
    $message .= "✅ Paiement : Validé\n\n";
    $message .= "🕒 " . now()->format('d/m/Y à H:i');

    // TODO: Implémenter l'envoi WhatsApp
    Log::info('📱 Notification admin WhatsApp', [
        'telephone' => $adminPhone,
        'message' => $message
    ]);
}

    /**
     * Gérer le succès du payment intent
     */
    private function handlePaymentIntentSucceeded($paymentIntent)
    {
        Log::info('Payment intent succeeded', [
            'payment_intent' => $paymentIntent->id
        ]);
    }

    /**
     * Gérer l'échec du payment intent
     */
    private function handlePaymentIntentFailed($paymentIntent)
    {
        Log::error('Payment intent failed', [
            'payment_intent' => $paymentIntent->id,
            'last_error' => $paymentIntent->last_payment_error
        ]);

        // Trouver le paiement et marquer comme échoué
        $paiement = Paiement::where('code_autorisation', $paymentIntent->id)
            ->orWhere('transaction_id', 'like', '%' . $paymentIntent->id . '%')
            ->first();

        if ($paiement) {
            $paiement->update([
                'statut' => 'echoue',
                'message_retour' => $paymentIntent->last_payment_error->message ?? 'Paiement échoué',
                'donnees_api' => json_encode($paymentIntent->toArray())
            ]);
        }
    }
}