<?php

namespace App\Services\Client;

use App\Models\Client;
use App\Models\Commande;
use App\Models\ArticlesCommande;
use App\Models\Paiement;
use App\Models\Produit;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Str;
use Exception;

class CheckoutService
{
    /**
     * Créer une commande (avec ou sans authentification)
     */
    public function createOrder(array $data)
    {
        DB::beginTransaction();

        try {
            // 1. Obtenir ou créer le client
            $client = $this->getOrCreateClient($data['customer']);

            // 2. Valider les articles du panier
            $validatedItems = $this->validateCartItems($data['items']);

            // 3. Calculer les totaux
            $totals = $this->calculateTotals($validatedItems, $data['coupon_code'] ?? null);

            // 4. Créer la commande
            $commande = $this->createCommande($client, $data, $totals);

            // 5. Créer les articles de commande
            $this->createOrderItems($commande, $validatedItems);

            // 6. Mettre à jour le stock
            $this->updateStock($validatedItems);

            DB::commit();

            return [
                'success' => true,
                'data' => [
                    'commande' => $commande->load(['articles.produit', 'client']),
                    'totals' => $totals,
                ]
            ];

        } catch (Exception $e) {
            DB::rollBack();
            throw $e;
        }
    }

    /**
     * Obtenir client existant ou créer client avec compte User
     * SOLUTION PROFESSIONNELLE: Unicité email + Compte auto-créé avec mot de passe temporaire
     */
    private function getOrCreateClient(array $customerData)
    {
        // Si l'utilisateur est connecté
        if (Auth::check()) {
            $user = Auth::user();

            // Si l'utilisateur a déjà un client, le retourner
            if ($user->client) {
                // Mettre à jour les informations si différentes
                $user->client->update([
                    'adresse_livraison' => $customerData['adresse_livraison'] ?? $user->client->adresse_livraison,
                    'ville' => $customerData['ville'] ?? $user->client->ville,
                    'code_postal' => $customerData['code_postal'] ?? $user->client->code_postal,
                ]);
                return $user->client;
            }

            // Sinon créer un client pour cet utilisateur
            return Client::create([
                'user_id' => $user->id,
                'nom' => $customerData['nom'],
                'prenom' => $customerData['prenom'],
                'telephone' => $customerData['telephone'],
                'email' => $customerData['email'],
                'adresse_livraison' => $customerData['adresse_livraison'],
                'ville' => $customerData['ville'] ?? null,
                'code_postal' => $customerData['code_postal'] ?? null,
                'pays' => $customerData['pays'] ?? 'Sénégal',
                'type' => 'particulier',
                'statut' => 'actif',
            ]);
        }

        // ===== CHECKOUT INVITÉ AVEC CRÉATION DE COMPTE AUTO =====
        
        // 1. Vérifier si un COMPTE User existe avec cet email
        $existingUser = \App\Models\User::where('email', $customerData['email'])->first();
        
        if ($existingUser) {
            // ❌ Email déjà utilisé → Demander connexion
            throw new Exception(
                "Un compte existe déjà avec l'email {$customerData['email']}. "
                . "Veuillez vous connecter pour passer commande ou utilisez un autre email."
            );
        }

        // 2. Vérifier si un CLIENT sans User existe (anciens guests)
        $existingClient = Client::whereNull('user_id')
            ->where('email', $customerData['email'])
            ->first();

        if ($existingClient) {
            // Client invité existant → Créer son compte User maintenant
            $temporaryPassword = Str::random(12);
            
            $user = \App\Models\User::create([
                'name' => trim($customerData['prenom'] . ' ' . $customerData['nom']),
                'email' => $customerData['email'],
                'password' => bcrypt($temporaryPassword),
                'email_verified_at' => now(), // Vérifier l'email automatiquement
            ]);

            // Connecter automatiquement l'utilisateur
            \Illuminate\Support\Facades\Auth::login($user);
            
            \Log::info('🔐 Ancien client invité connecté automatiquement', [
                'user_id' => $user->id,
                'client_id' => $existingClient->id,
                'email' => $user->email
            ]);

            // Lier le client existant au nouveau compte
            $existingClient->update([
                'user_id' => $user->id,
                'nom' => $customerData['nom'],
                'prenom' => $customerData['prenom'],
                'telephone' => $customerData['telephone'],
                'adresse_livraison' => $customerData['adresse_livraison'],
                'ville' => $customerData['ville'] ?? $existingClient->ville,
                'code_postal' => $customerData['code_postal'] ?? $existingClient->code_postal,
                'type' => 'particulier', // Upgrade de 'invite' à 'particulier'
                'derniere_activite' => now(),
            ]);

            // Marquer pour envoi du mot de passe temporaire
            $existingClient->temporary_password = $temporaryPassword;
            $existingClient->is_new_account = true;

            return $existingClient;
        }

        // 3. Nouveau client → Créer compte User + Client en même temps
        $temporaryPassword = Str::random(12);
        
        $user = \App\Models\User::create([
            'name' => trim($customerData['prenom'] . ' ' . $customerData['nom']),
            'email' => $customerData['email'],
            'password' => bcrypt($temporaryPassword),
            'email_verified_at' => now(), // Email vérifié automatiquement
        ]);

        // Connecter automatiquement l'utilisateur
        \Illuminate\Support\Facades\Auth::login($user);
        
        // ✅ CRÉER TOKEN SANCTUM pour authentification frontend
        $token = $user->createToken('auth_token')->plainTextToken;
        
        \Log::info('🔐 Utilisateur connecté automatiquement après création compte', [
            'user_id' => $user->id,
            'email' => $user->email,
            'token_created' => true
        ]);

        $newClient = Client::create([
            'user_id' => $user->id,
            'nom' => $customerData['nom'],
            'prenom' => $customerData['prenom'],
            'telephone' => $customerData['telephone'],
            'email' => $customerData['email'],
            'adresse_livraison' => $customerData['adresse_livraison'],
            'ville' => $customerData['ville'] ?? null,
            'code_postal' => $customerData['code_postal'] ?? null,
            'pays' => $customerData['pays'] ?? 'Sénégal',
            'type' => 'particulier',
            'statut' => 'actif',
            'accepte_newsletter' => $customerData['newsletter'] ?? false,
            'derniere_activite' => now(),
        ]);

        // Stocker le mot de passe temporaire et token pour l'email
        $newClient->temporary_password = $temporaryPassword;
        $newClient->auth_token = $token;
        $newClient->is_new_account = true;

        return $newClient;
    }

    /**
     * Valider les articles du panier
     */
    private function validateCartItems(array $items)
    {
        $validatedItems = [];

        foreach ($items as $item) {
            $produit = Produit::with('images_produits')
                ->where('id', $item['product_id'])
                ->where('est_visible', true)
                ->first();

            if (!$produit) {
                throw new Exception("Produit {$item['product_id']} non disponible");
            }

            // Vérifier le stock si gestion activée
            if ($produit->gestion_stock && $produit->stock_disponible < $item['quantity']) {
                throw new Exception("Stock insuffisant pour {$produit->nom}. Disponible: {$produit->stock_disponible}");
            }

            $validatedItems[] = [
                'produit' => $produit,
                'quantity' => $item['quantity'],
                'options' => $item['options'] ?? null, // Taille, couleur, etc.
            ];
        }

        return $validatedItems;
    }

    /**
     * Calculer les totaux (subtotal, remise, livraison, total)
     */
    private function calculateTotals(array $items, $couponCode = null)
    {
        $subtotal = 0;

        foreach ($items as $item) {
            $prix = $item['produit']->en_promo && $item['produit']->prix_promo
                ? $item['produit']->prix_promo
                : $item['produit']->prix;

            $subtotal += $prix * $item['quantity'];
        }

        // Appliquer la remise si coupon valide
        $discount = 0;
        $promotion = null;

        if ($couponCode) {
            $promotion = \App\Models\Promotion::where('code', $couponCode)
                ->where('est_active', true)
                ->where('date_debut', '<=', now())
                ->where('date_fin', '>=', now())
                ->first();

            if ($promotion) {
                // Vérifier le montant minimum
                if ($promotion->montant_minimum && $subtotal < $promotion->montant_minimum) {
                    // Ne pas appliquer la promotion si le montant minimum n'est pas atteint
                    $promotion = null;
                } else {
                    // Calculer la remise selon le type
                    if ($promotion->type_promotion === 'pourcentage') {
                        $discount = ($subtotal * $promotion->valeur) / 100;
                        
                        // Appliquer la réduction maximum si définie
                        if ($promotion->reduction_maximum && $discount > $promotion->reduction_maximum) {
                            $discount = $promotion->reduction_maximum;
                        }
                    } elseif ($promotion->type_promotion === 'montant_fixe') {
                        $discount = $promotion->valeur;
                    } elseif ($promotion->type_promotion === 'livraison_gratuite') {
                        // La livraison gratuite sera gérée plus bas
                        $discount = 0;
                    }
                }
            }
        }

        // Frais de livraison - Utiliser les paramètres de la base de données
        $shippingSettings = \App\Models\ShippingSetting::getSettings();
        
        $shippingCost = 0;
        if ($shippingSettings->is_enabled) {
            $freeShippingThreshold = $shippingSettings->free_threshold;
            $shippingCost = ($subtotal - $discount) >= $freeShippingThreshold ? 0 : $shippingSettings->default_cost;
        }
        
        // Appliquer livraison gratuite si c'est le type de promotion
        if ($promotion && $promotion->type_promotion === 'livraison_gratuite') {
            $shippingCost = 0;
        }

        $total = $subtotal - $discount + $shippingCost;

        return [
            'subtotal' => $subtotal,
            'discount' => $discount,
            'shipping' => $shippingCost,
            'total' => $total,
            'promotion' => $promotion,
        ];
    }

    /**
     * Créer la commande
     */
    private function createCommande(Client $client, array $data, array $totals)
    {
        $nomComplet = trim(($data['customer']['prenom'] ?? '') . ' ' . ($data['customer']['nom'] ?? ''));
        
        return Commande::create([
            'client_id' => $client->id,
            'numero_commande' => $this->generateOrderNumber(),
            'statut' => 'en_attente',
            'sous_total' => $totals['subtotal'],
            'montant_total' => $totals['total'],
            'remise' => $totals['discount'] ?? 0,
            'frais_livraison' => $totals['shipping'],
            'adresse_livraison' => $data['customer']['adresse_livraison'],
            'telephone_livraison' => $data['customer']['telephone'],
            'nom_destinataire' => $nomComplet ?: 'Client',
            'notes_client' => $data['notes'] ?? null,
        ]);
    }

    /**
     * Créer les articles de commande
     */
    private function createOrderItems(Commande $commande, array $items)
    {
        foreach ($items as $item) {
            $produit = $item['produit'];
            $prix = $produit->en_promo && $produit->prix_promo
                ? $produit->prix_promo
                : $produit->prix;

            ArticlesCommande::create([
                'commande_id' => $commande->id,
                'produit_id' => $produit->id,
                'nom_produit' => $produit->nom,
                'description_produit' => $produit->description_courte ?? $produit->description,
                'quantite' => $item['quantity'],
                'prix_unitaire' => $prix,
                'prix_total_article' => $prix * $item['quantity'],
                'taille_choisie' => $item['options']['taille'] ?? null,
                'couleur_choisie' => $item['options']['couleur'] ?? null,
                'options_supplementaires' => !empty($item['options']) ? json_encode($item['options']) : null,
            ]);
        }
    }

    /**
     * Mettre à jour le stock des produits
     */
    private function updateStock(array $items)
    {
        foreach ($items as $item) {
            $produit = $item['produit'];

            if ($produit->gestion_stock) {
                $produit->decrement('stock_disponible', $item['quantity']);

                // Incrémenter le nombre de ventes
                $produit->increment('nombre_ventes', $item['quantity']);
            }
        }
    }

    /**
     * Générer un numéro de commande unique
     */
    private function generateOrderNumber()
    {
        $prefix = 'CMD';
        $date = now()->format('Ymd');
        $random = strtoupper(Str::random(6));

        return "{$prefix}-{$date}-{$random}";
    }

    /**
     * Initier le paiement selon le provider
     */
    public function initiatePayment(Commande $commande, string $provider, array $data = [])
    {
        // Mapper les providers vers les méthodes de paiement autorisées
        $methodePaiement = match($provider) {
            'stripe' => 'carte_bancaire',
            'wave' => 'wave',
            'orange_money' => 'orange_money',
            default => 'carte_bancaire'
        };

        // Créer l'enregistrement de paiement
        $paiement = Paiement::create([
            'commande_id' => $commande->id,
            'client_id' => $commande->client_id,
            'montant' => $commande->montant_total,
            'methode_paiement' => $methodePaiement,
            'statut' => 'en_attente',
            'reference_paiement' => $this->generatePaymentReference(),
        ]);

        switch ($provider) {
            case 'stripe':
                return $this->initiateStripePayment($paiement, $commande);

            case 'wave':
                return $this->initiateWavePayment($paiement, $commande, $data);

            case 'orange_money':
                return $this->initiateOrangeMoneyPayment($paiement, $commande, $data);

            default:
                throw new Exception("Provider de paiement non supporté: {$provider}");
        }
    }

    /**
     * Initier paiement Stripe
     */
    private function initiateStripePayment(Paiement $paiement, Commande $commande)
    {
        try {
            // MODE SIMULATION si pas de connexion Stripe
            if (env('STRIPE_SIMULATION_MODE', false)) {
                \Log::warning('MODE SIMULATION STRIPE - Pas de vraie session créée');
                
                $fakeSessionId = 'sim_' . uniqid();
                $paiement->update(['reference_transaction' => $fakeSessionId]);
                
                // Simuler URL Stripe (redirige vers success directement)
                return [
                    'success' => true,
                    'payment_url' => config('app.url') . "/checkout/success?order={$commande->numero_commande}&simulated=true",
                    'session_id' => $fakeSessionId,
                ];
            }

            \Stripe\Stripe::setApiKey(config('services.stripe.secret'));

            // Préparer les line items avec tous les articles
            $lineItems = [];
            foreach ($commande->articles as $article) {
                $lineItems[] = [
                    'price_data' => [
                        'currency' => 'xof', // Franc CFA
                        'product_data' => [
                            'name' => $article->nom_produit,
                            'description' => $article->description_produit ?? '',
                        ],
                        'unit_amount' => (int) ($article->prix_unitaire), // Stripe en centimes mais XOF pas de décimales
                    ],
                    'quantity' => $article->quantite,
                ];
            }

            // Ajouter frais de livraison si > 0
            if ($commande->frais_livraison > 0) {
                $lineItems[] = [
                    'price_data' => [
                        'currency' => 'xof',
                        'product_data' => [
                            'name' => 'Frais de livraison',
                        ],
                        'unit_amount' => (int) $commande->frais_livraison,
                    ],
                    'quantity' => 1,
                ];
            }

            $session = \Stripe\Checkout\Session::create([
                'payment_method_types' => ['card'],
                'line_items' => $lineItems,
                'mode' => 'payment',
                'success_url' => config('services.frontend_url', 'http://192.168.1.10:5173') .
                    "/checkout/success?session_id={CHECKOUT_SESSION_ID}&order={$commande->numero_commande}",
                'cancel_url' => config('services.frontend_url', 'http://192.168.1.10:5173') . "/checkout/cancel?order={$commande->numero_commande}",
                'client_reference_id' => $commande->numero_commande,
                'customer_email' => $commande->client->email,
                'metadata' => [
                    'commande_id' => $commande->id,
                    'paiement_id' => $paiement->id,
                    'numero_commande' => $commande->numero_commande,
                    'client_id' => $commande->client_id,
                ],
            ]);

            // Mettre à jour la référence de transaction
            $paiement->update([
                'transaction_id' => $session->id,
            ]);

            return [
                'success' => true,
                'payment_url' => $session->url,
                'session_id' => $session->id,
            ];

        } catch (\Exception $e) {
            \Log::error('Erreur Stripe', [
                'commande_id' => $commande->id,
                'error' => $e->getMessage()
            ]);
            
            // Marquer le paiement comme échoué
            $paiement->update([
                'statut' => 'echoue',
                'message_retour' => $e->getMessage()
            ]);
            
            // Marquer la commande comme échouée si c'est le premier/seul paiement
            $commande->update(['statut' => 'echoue']);
            
            throw new Exception("Erreur Stripe: " . $e->getMessage());
        }
    }

    /**
     * Initier paiement Wave (via PayTech)
     */
    private function initiateWavePayment(Paiement $paiement, Commande $commande, array $data)
    {
        try {
            $payTechService = app(PayTechService::class);
            
            $response = $payTechService->createPaymentRequest(
                $commande,
                'Wave',
                $data['phone'] ?? $commande->client->telephone
            );

            if (!isset($response['success']) || $response['success'] !== 1) {
                throw new Exception($response['message'] ?? 'Erreur PayTech');
            }

            // Mettre à jour la référence de transaction
            $paiement->update([
                'transaction_id' => $response['token'] ?? null,
            ]);

            return [
                'success' => true,
                'payment_url' => $response['redirect_url'] ?? $response['redirectUrl'],
                'token' => $response['token'] ?? null,
            ];

        } catch (\Exception $e) {
            \Log::error('Erreur Wave PayTech', [
                'commande_id' => $commande->id,
                'error' => $e->getMessage()
            ]);
            
            $paiement->update([
                'statut' => 'echoue',
                'message_retour' => $e->getMessage()
            ]);
            
            throw $e;
        }
    }

    /**
     * Initier paiement Orange Money (via PayTech)
     */
    private function initiateOrangeMoneyPayment(Paiement $paiement, Commande $commande, array $data)
    {
        try {
            $payTechService = app(PayTechService::class);
            
            $response = $payTechService->createPaymentRequest(
                $commande,
                'Orange Money',
                $data['phone'] ?? $commande->client->telephone
            );

            if (!isset($response['success']) || $response['success'] !== 1) {
                throw new Exception($response['message'] ?? 'Erreur PayTech');
            }

            // Mettre à jour la référence de transaction
            $paiement->update([
                'transaction_id' => $response['token'] ?? null,
            ]);

            return [
                'success' => true,
                'payment_url' => $response['redirect_url'] ?? $response['redirectUrl'],
                'token' => $response['token'] ?? null,
            ];

        } catch (\Exception $e) {
            \Log::error('Erreur Orange Money PayTech', [
                'commande_id' => $commande->id,
                'error' => $e->getMessage()
            ]);
            
            $paiement->update([
                'statut' => 'echoue',
                'message_retour' => $e->getMessage()
            ]);
            
            throw $e;
        }
    }

    /**
     * Générer référence de paiement unique
     */
    private function generatePaymentReference()
    {
        return 'PAY-' . now()->format('YmdHis') . '-' . strtoupper(Str::random(8));
    }

    /**
     * Confirmer le paiement
     * OPTIMISÉ: Notifications WhatsApp admin + Email client
     */
    public function confirmPayment(Paiement $paiement)
    {
        // Vérifier si déjà validé pour éviter double traitement
        if ($paiement->statut === 'valide') {
            \Log::warning('Paiement déjà validé, skip', ['paiement_id' => $paiement->id]);
            return [
                'success' => true,
                'commande' => $paiement->commande->load(['articles.produit', 'client', 'paiements']),
                'message' => 'Paiement déjà confirmé',
            ];
        }

        DB::beginTransaction();

        try {
            // 1. Mettre à jour le paiement
            $paiement->update([
                'statut' => 'valide',
                'date_paiement' => now(),
            ]);

            // 2. Mettre à jour la commande
            $commande = $paiement->commande;
            $commande->update([
                'statut' => 'confirmee',
                'date_confirmation' => now(),
            ]);

            // 3. Vider le panier du client ou invité (OPTIMISÉ)
            if ($commande->client_id) {
                // Client authentifié : vider par client_id
                $deletedItems = \App\Models\ArticlesPanier::whereHas('panier', function($q) use ($commande) {
                    $q->where('client_id', $commande->client_id);
                })->delete();
                
                \Log::info('Panier vidé (client authentifié)', [
                    'client_id' => $commande->client_id,
                    'items_deleted' => $deletedItems
                ]);
            } else {
                // Client invité : vider par identifier de session
                $sessionIdentifier = 'guest_' . session()->getId();
                $deletedItems = \App\Models\ArticlesPanier::whereHas('panier', function($q) use ($sessionIdentifier) {
                    $q->where('identifier', $sessionIdentifier);
                })->delete();
                
                \Log::info('Panier vidé (invité)', [
                    'session_identifier' => $sessionIdentifier,
                    'items_deleted' => $deletedItems
                ]);
            }

            // 4. Mettre à jour les stats du client (optimisé)
            $client = $commande->client;
            $client->increment('nombre_commandes');
            $client->increment('total_depense', $commande->montant_total);
            
            // Calculer panier moyen
            $panierMoyen = $client->nombre_commandes > 0 
                ? $client->total_depense / $client->nombre_commandes 
                : 0;
                
            $client->update([
                'derniere_commande' => now(),
                'panier_moyen' => $panierMoyen,
            ]);

            DB::commit();

            // ===== NOTIFICATIONS ASYNCHRONES (performances optimisées) =====
            
            // 1. Notification WhatsApp à l'admin (TEMPORAIREMENT DÉSACTIVÉ - Twilio non configuré)
            // \App\Jobs\SendWhatsAppNotificationJob::dispatch(
            //     config('app.admin_whatsapp', '+221771397393'),
            //     $this->formatAdminWhatsAppMessage($commande, $paiement),
            //     'nouvelle_commande'
            // )->onQueue('high');

            // 2. Email de confirmation au client avec credentials si nouveau compte
            $temporaryPassword = $client->temporary_password ?? null;
            $isNewAccount = $client->is_new_account ?? false;
            
            \App\Jobs\SendOrderConfirmationEmailJob::dispatch($commande, $temporaryPassword, $isNewAccount)
                ->onQueue('emails');

            \Log::info('Paiement confirmé avec succès', [
                'paiement_id' => $paiement->id,
                'commande_id' => $commande->id,
                'montant' => $commande->montant_total,
                'new_account_created' => $isNewAccount
            ]);

            return [
                'success' => true,
                'commande' => $commande->load(['articles.produit', 'client', 'paiements']),
                'message' => 'Paiement confirmé avec succès',
            ];

        } catch (Exception $e) {
            DB::rollBack();
            \Log::error('Erreur confirmation paiement', [
                'paiement_id' => $paiement->id,
                'error' => $e->getMessage(),
                'trace' => $e->getTraceAsString()
            ]);
            throw $e;
        }
    }

    /**
     * Formater message WhatsApp pour admin
     */
    private function formatAdminWhatsAppMessage(Commande $commande, Paiement $paiement)
    {
        $client = $commande->client;
        $montant = number_format($commande->montant_total, 0, ',', ' ');
        
        return "🎉 *NOUVELLE COMMANDE PAYÉE*\n\n"
            . "📦 N°: *{$commande->numero_commande}*\n"
            . "👤 Client: {$client->prenom} {$client->nom}\n"
            . "📞 Tél: {$client->telephone}\n"
            . "💰 Montant: *{$montant} FCFA*\n"
            . "💳 Paiement: {$paiement->methode_paiement}\n"
            . "📍 Livraison: {$commande->ville_livraison}\n\n"
            . "🕐 " . now()->format('d/m/Y à H:i') . "\n\n"
            . "Voir détails: " . config('app.url') . "/admin/commandes/{$commande->id}";
    }
}