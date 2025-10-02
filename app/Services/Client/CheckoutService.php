<?php

namespace App\Services\Client;

use App\Models\Commande;
use App\Models\Paiement;
use App\Models\Client;
use App\Models\ArticlesCommande;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Str;
use Illuminate\Support\Facades\Log;
use Stripe\Stripe;
use Stripe\Checkout\Session as StripeSession;

class CheckoutService
{
    protected CartService $cartService;

    public function __construct(CartService $cartService)
    {
        $this->cartService = $cartService;
    }

    public function createOrder(array $deliveryInfo, int $clientId, string $source = 'site_web'): array
    {
        try {
            DB::beginTransaction();

            $cart = $this->cartService->getCart();
            
            if (!$cart || $cart['count'] === 0) {
                return ['success' => false, 'message' => 'Panier vide'];
            }

            $client = Client::findOrFail($clientId);
            $numeroCommande = $this->generateOrderNumber();

            $commande = Commande::create([
                'numero_commande' => $numeroCommande,
                'client_id' => $clientId,
                'sous_total' => $cart['subtotal'],
                'frais_livraison' => $cart['shipping_fee'],
                'remise' => $cart['discount'],
                'montant_tva' => 0,
                'montant_total' => $cart['total'],
                'statut' => 'en_attente', // Toujours en_attente au départ
                'adresse_livraison' => $deliveryInfo['adresse'],
                'telephone_livraison' => $deliveryInfo['telephone'],
                'nom_destinataire' => $deliveryInfo['prenom'] . ' ' . $deliveryInfo['nom'],
                'instructions_livraison' => $deliveryInfo['indications'] ?? null,
                'mode_livraison' => 'domicile',
                'source' => $source,
                'code_promo' => $cart['coupon']['code'] ?? null,
                'priorite' => 'normale',
                'est_cadeau' => false
            ]);

            // Créer les articles avec TOUS les champs requis
            foreach ($cart['items'] as $item) {
                ArticlesCommande::create([
                    'commande_id' => $commande->id,
                    'produit_id' => $item['product']['id'],
                    'nom_produit' => $item['product']['nom'],
                    'description_produit' => $item['product']['description'] ?? $item['product']['description_courte'] ?? null,
                    'quantite' => $item['quantity'],
                    'prix_unitaire' => $item['product']['prix_unitaire'],
                    'prix_total_article' => $item['prix_total'],
                    'taille_choisie' => $item['taille'] ?? null,
                    'couleur_choisie' => $item['couleur'] ?? null,
                    'statut_production' => 'en_attente',
                    'controle_qualite_ok' => false
                ]);
            }

            // Mettre à jour les informations du client
            $client->update([
                'adresse_principale' => $deliveryInfo['adresse'],
                'ville' => $deliveryInfo['ville'],
                'quartier' => $deliveryInfo['quartier'] ?? null,
                'indications_livraison' => $deliveryInfo['indications'] ?? null
            ]);

            DB::commit();

            Log::info('Commande créée avec succès', [
                'commande_id' => $commande->id,
                'numero_commande' => $numeroCommande,
                'client_id' => $clientId,
                'montant_total' => $cart['total']
            ]);

            return [
                'success' => true,
                'data' => [
                    'commande_id' => $commande->id,
                    'numero_commande' => $numeroCommande,
                    'montant_total' => $cart['total']
                ]
            ];

        } catch (\Exception $e) {
            DB::rollBack();
            Log::error('Erreur création commande', [
                'error' => $e->getMessage(),
                'trace' => $e->getTraceAsString()
            ]);
            return ['success' => false, 'message' => 'Erreur lors de la création de la commande: ' . $e->getMessage()];
        }
    }

    /**
     * Initier un paiement Wave/Orange/Free Money
     */
    public function initiateWavePayment(int $commandeId, string $phoneNumber): array
    {
        try {
            $commande = Commande::findOrFail($commandeId);
            
            // Générer référence unique
            $reference = 'PAY-' . strtoupper(Str::random(10));

            // Créer l'enregistrement de paiement
            $paiement = Paiement::create([
                'commande_id' => $commandeId,
                'client_id' => $commande->client_id,
                'montant' => $commande->montant_total,
                'reference_paiement' => $reference,
                'methode_paiement' => 'wave',
                'statut' => 'en_attente',
                'numero_telephone' => $phoneNumber,
                'date_initiation' => now()
            ]);

            // Appel API Wave (à implémenter selon documentation Wave)
            $waveResponse = $this->callWaveAPI([
                'amount' => $commande->montant_total,
                'currency' => 'XOF',
                'phone' => $phoneNumber,
                'reference' => $reference,
                'merchant_id' => config('services.wave.merchant_id'),
                'callback_url' => route('api.client.webhook.wave')
            ]);

            if ($waveResponse['success']) {
                $paiement->update([
                    'transaction_id' => $waveResponse['transaction_id'],
                    'donnees_api' => json_encode($waveResponse)
                ]);

                // Pour Wave/Orange/Free, on confirme immédiatement la commande
                // car ce sont des paiements quasi-instantanés
                $commande->update([
                    'statut' => 'confirmee',
                    'date_confirmation' => now()
                ]);

                return [
                    'success' => true,
                    'data' => [
                        'payment_url' => $waveResponse['payment_url'] ?? null,
                        'transaction_id' => $waveResponse['transaction_id'],
                        'reference' => $reference
                    ]
                ];
            }

            return ['success' => false, 'message' => 'Erreur lors de l\'initialisation du paiement Wave'];

        } catch (\Exception $e) {
            Log::error('Erreur paiement Wave', [
                'error' => $e->getMessage(),
                'commande_id' => $commandeId
            ]);
            return ['success' => false, 'message' => 'Erreur lors du paiement'];
        }
    }

    /**
     * Initier un paiement Stripe
     */
    public function initiateStripePayment(int $commandeId): array
    {
        try {
            $commande = Commande::with('articles_commandes.produit')->findOrFail($commandeId);
            
            Stripe::setApiKey(config('services.stripe.secret'));

            $lineItems = [];
            foreach ($commande->articles_commandes as $article) {
                $lineItems[] = [
                    'price_data' => [
                        'currency' => 'xof',
                        'product_data' => [
                            'name' => $article->nom_produit,
                            'description' => $article->taille_choisie ? "Taille: {$article->taille_choisie}" : null,
                        ],
                        'unit_amount' => (int)($article->prix_unitaire),
                    ],
                    'quantity' => $article->quantite,
                ];
            }

            if ($commande->frais_livraison > 0) {
                $lineItems[] = [
                    'price_data' => [
                        'currency' => 'xof',
                        'product_data' => ['name' => 'Frais de livraison'],
                        'unit_amount' => (int)($commande->frais_livraison),
                    ],
                    'quantity' => 1,
                ];
            }

            $session = StripeSession::create([
                'payment_method_types' => ['card'],
                'line_items' => $lineItems,
                'mode' => 'payment',
                'success_url' => url('/payment/success?session_id={CHECKOUT_SESSION_ID}'),
                'cancel_url' => url('/checkout'),
                'metadata' => [
                    'commande_id' => $commandeId,
                    'numero_commande' => $commande->numero_commande,
                    'client_id' => $commande->client_id // Important pour le webhook
                ]
            ]);

            // Créer l'enregistrement du paiement en attente
            Paiement::create([
                'commande_id' => $commandeId,
                'client_id' => $commande->client_id,
                'montant' => $commande->montant_total,
                'reference_paiement' => 'STRIPE-' . $session->id,
                'methode_paiement' => 'carte_bancaire',
                'statut' => 'en_attente',
                'transaction_id' => $session->id,
                'date_initiation' => now(),
                'donnees_api' => json_encode([
                    'session_id' => $session->id,
                    'payment_status' => $session->payment_status
                ])
            ]);

            Log::info('Session Stripe créée', [
                'session_id' => $session->id,
                'commande_id' => $commandeId,
                'montant' => $commande->montant_total
            ]);

            return [
                'success' => true,
                'data' => [
                    'checkout_url' => $session->url,
                    'session_id' => $session->id
                ]
            ];

        } catch (\Exception $e) {
            Log::error('Erreur paiement Stripe', [
                'error' => $e->getMessage(),
                'trace' => $e->getTraceAsString(),
                'commande_id' => $commandeId
            ]);
            return ['success' => false, 'message' => 'Erreur lors du paiement: ' . $e->getMessage()];
        }
    }

    /**
     * Traiter paiement à la livraison
     */
    public function processCashOnDelivery(int $commandeId): array
    {
        try {
            $commande = Commande::findOrFail($commandeId);

            Paiement::create([
                'commande_id' => $commandeId,
                'client_id' => $commande->client_id,
                'montant' => $commande->montant_total,
                'reference_paiement' => 'COD-' . strtoupper(Str::random(8)),
                'methode_paiement' => 'especes',
                'statut' => 'en_attente',
                'date_initiation' => now(),
                'notes_admin' => 'Paiement à la livraison'
            ]);

            // La commande est confirmée immédiatement pour le paiement à la livraison
            $commande->update([
                'statut' => 'confirmee',
                'date_confirmation' => now()
            ]);

            Log::info('Paiement à la livraison enregistré', [
                'commande_id' => $commandeId,
                'numero_commande' => $commande->numero_commande
            ]);

            return [
                'success' => true,
                'message' => 'Commande enregistrée avec paiement à la livraison',
                'data' => [
                    'commande_id' => $commandeId,
                    'numero_commande' => $commande->numero_commande
                ]
            ];

        } catch (\Exception $e) {
            Log::error('Erreur paiement COD', [
                'error' => $e->getMessage(),
                'commande_id' => $commandeId
            ]);
            return ['success' => false, 'message' => 'Erreur lors du traitement'];
        }
    }

    /**
     * Générer un numéro de commande unique
     */
    private function generateOrderNumber(): string
    {
        $prefix = 'CMD';
        $date = now()->format('Ymd');
        $random = strtoupper(Str::random(6));
        
        return "{$prefix}-{$date}-{$random}";
    }

    /**
     * Appel API Wave (simulation - à remplacer par l'implémentation réelle)
     */
    private function callWaveAPI(array $data): array
    {
        // TODO: Implémenter l'appel réel à l'API Wave
        // Documentation: https://www.wave.com/en/business/api/
        
        Log::info('Simulation appel API Wave', $data);
        
        // Pour l'instant, simulation
        return [
            'success' => true,
            'transaction_id' => 'WAVE-' . strtoupper(Str::random(12)),
            'payment_url' => 'https://api.wave.com/payment/' . Str::random(20),
            'status' => 'pending'
        ];
    }

    /**
     * Vider le panier après commande réussie
     */
    public function clearCartAfterOrder(): void
    {
        try {
            $this->cartService->clearCart();
            Log::info('Panier vidé après commande réussie');
        } catch (\Exception $e) {
            Log::error('Erreur lors du vidage du panier', [
                'error' => $e->getMessage()
            ]);
        }
    }
}