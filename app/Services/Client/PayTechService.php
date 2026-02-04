<?php

namespace App\Services\Client;

use App\Models\Commande;
use App\Models\Paiement;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;
use Exception;

class PayTechService
{
    private string $apiKey;
    private string $apiSecret;
    private string $env;
    private string $ipnUrl;
    private string $successUrl;
    private string $cancelUrl;
    private const API_URL = 'https://paytech.sn/api';

    public function __construct()
    {
        $this->apiKey = config('services.paytech.api_key');
        $this->apiSecret = config('services.paytech.api_secret');
        $this->env = config('services.paytech.env', 'test');
        $this->ipnUrl = config('services.paytech.ipn_url');
        $this->successUrl = config('services.paytech.success_url');
        $this->cancelUrl = config('services.paytech.cancel_url');

        if (!$this->apiKey || !$this->apiSecret) {
            throw new Exception('PayTech credentials not configured');
        }
    }

    /**
     * Créer une demande de paiement PayTech
     * 
     * @param Commande $commande
     * @param string $paymentMethod 'Orange Money', 'Wave', etc.
     * @param string|null $phoneNumber Numéro du client
     * @return array
     */
    public function createPaymentRequest(Commande $commande, string $paymentMethod = '', ?string $phoneNumber = null): array
    {
        $client = $commande->client;
        
        // Préparer les custom fields
        $customField = [
            'commande_id' => $commande->id,
            'numero_commande' => $commande->numero_commande,
            'client_id' => $commande->client_id,
            'email' => $client->email ?? '',
        ];

        $payload = [
            'item_name' => "Commande VIVIAS-SHOP #{$commande->numero_commande}",
            'item_price' => (int) $commande->montant_total,
            'currency' => 'XOF',
            'ref_command' => $commande->numero_commande,
            'command_name' => "Achat VIVIAS-SHOP - {$client->nom} {$client->prenom}",
            'env' => $this->env,
            'ipn_url' => $this->ipnUrl,
            'success_url' => $this->successUrl . "?order={$commande->numero_commande}",
            'cancel_url' => $this->cancelUrl . "?order={$commande->numero_commande}",
            'custom_field' => json_encode($customField),
        ];

        // Ajouter target_payment si méthode spécifique
        if (!empty($paymentMethod)) {
            $payload['target_payment'] = $paymentMethod;
        }

        try {
            Log::info('PayTech payment request initiated', [
                'commande' => $commande->numero_commande,
                'amount' => $commande->montant_total,
                'method' => $paymentMethod,
            ]);

            $response = Http::withHeaders([
                'API_KEY' => $this->apiKey,
                'API_SECRET' => $this->apiSecret,
                'Content-Type' => 'application/x-www-form-urlencoded',
            ])->asForm()->post(self::API_URL . '/payment/request-payment', $payload);

            if (!$response->successful()) {
                Log::error('PayTech payment request failed', [
                    'status' => $response->status(),
                    'body' => $response->body(),
                ]);
                throw new Exception('Payment request failed: ' . $response->body());
            }

            $data = $response->json();

            // Log la réponse
            Log::info('PayTech payment request successful', [
                'commande' => $commande->numero_commande,
                'token' => $data['token'] ?? null,
                'redirect_url' => $data['redirect_url'] ?? null,
            ]);

            // Ajouter les paramètres d'autofill si méthode unique et client avec téléphone
            if (!empty($paymentMethod) && strpos($paymentMethod, ',') === false && $phoneNumber) {
                $queryParams = [
                    'pn' => $phoneNumber,                           // +221777777777
                    'nn' => substr($phoneNumber, -9),               // 777777777 (derniers 9 chiffres)
                    'fn' => $client->nom . ' ' . $client->prenom,   // Nom complet
                    'tp' => $paymentMethod,                         // Même valeur que target_payment
                    'nac' => ($paymentMethod === 'Carte Bancaire') ? '0' : '1', // Auto-submit
                ];

                $queryString = http_build_query($queryParams);
                $data['redirect_url'] = $data['redirect_url'] . '?' . $queryString;
                $data['redirectUrl'] = $data['redirect_url'];
            }

            return $data;

        } catch (Exception $e) {
            Log::error('PayTech API error', [
                'message' => $e->getMessage(),
                'commande' => $commande->numero_commande,
            ]);
            throw $e;
        }
    }

    /**
     * Vérifier le statut d'un paiement
     * 
     * @param string $tokenPayment
     * @return array
     */
    public function getPaymentStatus(string $tokenPayment): array
    {
        try {
            $response = Http::withHeaders([
                'API_KEY' => $this->apiKey,
                'API_SECRET' => $this->apiSecret,
            ])->get(self::API_URL . '/payment/get-status', [
                'token_payment' => $tokenPayment,
            ]);

            if (!$response->successful()) {
                throw new Exception('Payment status check failed');
            }

            return $response->json();

        } catch (Exception $e) {
            Log::error('PayTech status check error', [
                'token' => $tokenPayment,
                'message' => $e->getMessage(),
            ]);
            throw $e;
        }
    }

    /**
     * Traiter un événement IPN (Instant Payment Notification)
     * 
     * @param array $payload
     * @return bool
     */
    public function handleIPN(array $payload): bool
    {
        try {
            // Vérifier l'authenticité via HMAC-SHA256
            if (!$this->verifyIPNSignature($payload)) {
                Log::warning('PayTech IPN: invalid signature', [
                    'ref_command' => $payload['ref_command'] ?? 'unknown',
                ]);
                return false;
            }

            $typeEvent = $payload['type_event'] ?? null;
            $refCommand = $payload['ref_command'] ?? null;

            if (!$refCommand) {
                Log::error('PayTech IPN: missing ref_command');
                return false;
            }

            Log::info('PayTech IPN received', [
                'type' => $typeEvent,
                'ref_command' => $refCommand,
                'payment_method' => $payload['payment_method'] ?? null,
            ]);

            switch ($typeEvent) {
                case 'sale_complete':
                    return $this->handlePaymentComplete($payload);

                case 'sale_canceled':
                    return $this->handlePaymentCanceled($payload);

                case 'refund_complete':
                    return $this->handleRefundComplete($payload);

                default:
                    Log::warning('Unknown PayTech IPN type', ['type' => $typeEvent]);
                    return false;
            }

        } catch (Exception $e) {
            Log::error('PayTech IPN handling error', [
                'message' => $e->getMessage(),
                'payload' => $payload,
            ]);
            return false;
        }
    }

    /**
     * Vérifier la signature HMAC-SHA256 de l'IPN
     * 
     * @param array $payload
     * @return bool
     */
    private function verifyIPNSignature(array $payload): bool
    {
        // Méthode 1: Vérification HMAC-SHA256 (recommandée)
        if (isset($payload['hmac_compute'])) {
            $itemPrice = $payload['item_price'] ?? $payload['final_item_price'] ?? 0;
            $refCommand = $payload['ref_command'] ?? '';
            
            // Message: amount|ref_command|api_key
            $message = "{$itemPrice}|{$refCommand}|{$this->apiKey}";
            $expectedHmac = hash_hmac('sha256', $message, $this->apiSecret);

            if ($expectedHmac === $payload['hmac_compute']) {
                return true;
            }

            Log::warning('PayTech IPN: HMAC mismatch', [
                'expected' => $expectedHmac,
                'received' => $payload['hmac_compute'],
            ]);
        }

        // Méthode 2: Vérification SHA256 classique (fallback)
        if (isset($payload['api_key_sha256']) && isset($payload['api_secret_sha256'])) {
            $expectedKeyHash = hash('sha256', $this->apiKey);
            $expectedSecretHash = hash('sha256', $this->apiSecret);

            return $expectedKeyHash === $payload['api_key_sha256'] 
                && $expectedSecretHash === $payload['api_secret_sha256'];
        }

        return false;
    }

    /**
     * Gérer un paiement réussi
     * 
     * @param array $data
     * @return bool
     */
    private function handlePaymentComplete(array $data): bool
    {
        $numeroCommande = $data['ref_command'];
        
        $commande = Commande::where('numero_commande', $numeroCommande)->first();

        if (!$commande) {
            Log::error('PayTech IPN: commande not found', ['numero' => $numeroCommande]);
            return false;
        }

        // Déterminer le montant final (après promotions si applicable)
        $montantFinal = $data['final_item_price'] ?? $data['item_price'] ?? $commande->montant_total;

        // Créer ou mettre à jour le paiement
        $paiement = Paiement::updateOrCreate(
            ['commande_id' => $commande->id],
            [
                'client_id' => $commande->client_id,
                'montant' => $montantFinal,
                'methode_paiement' => $this->mapPaymentMethod($data['payment_method'] ?? 'paytech'),
                'statut' => 'valide',
                'date_paiement' => now(),
                'reference_paiement' => $numeroCommande,
                'transaction_id' => $data['token'] ?? null,
                'details_paiement' => $data,
            ]
        );

        // Mettre à jour le statut de la commande
        $commande->update([
            'statut' => 'confirmee',
            'date_paiement' => now(),
        ]);

        // Recharger la commande avec ses relations pour l'email
        $commande->load(['client', 'articles_commandes.produit', 'paiements']);

        // Envoyer l'email de confirmation de commande
        \App\Jobs\SendOrderConfirmationEmailJob::dispatch($commande);

        Log::info('PayTech payment confirmed', [
            'commande_id' => $commande->id,
            'numero_commande' => $numeroCommande,
            'montant' => $montantFinal,
            'payment_method' => $data['payment_method'] ?? 'unknown',
        ]);

        return true;
    }

    /**
     * Gérer un paiement annulé
     * 
     * @param array $data
     * @return bool
     */
    private function handlePaymentCanceled(array $data): bool
    {
        $numeroCommande = $data['ref_command'];
        
        $commande = Commande::where('numero_commande', $numeroCommande)->first();

        if (!$commande) {
            Log::error('PayTech IPN: commande not found', ['numero' => $numeroCommande]);
            return false;
        }

        // Mettre à jour le paiement si existant
        $paiement = Paiement::where('commande_id', $commande->id)->first();
        
        if ($paiement) {
            $paiement->update([
                'statut' => 'annule',
                'details_paiement' => $data,
            ]);
        }

        // Marquer la commande comme annulée
        $commande->update([
            'statut' => 'annulee',
        ]);

        Log::info('PayTech payment cancelled', [
            'commande' => $numeroCommande,
            'reason' => $data['cancel_reason'] ?? 'unknown',
        ]);

        return true;
    }

    /**
     * Gérer un remboursement
     * 
     * @param array $data
     * @return bool
     */
    private function handleRefundComplete(array $data): bool
    {
        $numeroCommande = $data['ref_command'];
        
        $commande = Commande::where('numero_commande', $numeroCommande)->first();

        if (!$commande) {
            Log::error('PayTech IPN: commande not found for refund', ['numero' => $numeroCommande]);
            return false;
        }

        $paiement = Paiement::where('commande_id', $commande->id)->first();
        
        if ($paiement) {
            $paiement->update([
                'statut' => 'rembourse',
                'details_paiement' => array_merge($paiement->details_paiement ?? [], [
                    'refund' => $data,
                    'refund_date' => now()->toDateTimeString(),
                ]),
            ]);
        }

        $commande->update([
            'statut' => 'remboursee',
        ]);

        Log::info('PayTech refund processed', [
            'commande' => $numeroCommande,
            'amount' => $data['item_price'] ?? 0,
        ]);

        return true;
    }

    /**
     * Mapper la méthode de paiement PayTech vers notre format interne
     * 
     * @param string $paytechMethod
     * @return string
     */
    private function mapPaymentMethod(string $paytechMethod): string
    {
        $mapping = [
            'Orange Money' => 'orange_money',
            'Wave' => 'wave',
            'Free Money' => 'free_money',
            'Carte Bancaire' => 'carte_bancaire',
        ];

        return $mapping[$paytechMethod] ?? 'paytech';
    }
}
