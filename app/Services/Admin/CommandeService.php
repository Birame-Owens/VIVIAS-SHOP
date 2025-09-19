<?php

namespace App\Services\Admin;

use App\Models\Commande;
use App\Models\ArticlesCommande;
use App\Models\Produit;
use App\Models\Client;
use App\Models\MesureClient;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;

class CommandeService
{
    /**
     * Créer une nouvelle commande
     */
    public function createCommande(array $data): Commande
    {
        DB::beginTransaction();

        try {
            // Calculer les montants
            $montants = $this->calculateMontants($data['articles'], $data['frais_livraison'] ?? 0, $data['remise'] ?? 0);
            
            // Générer le numéro de commande
            $numeroCommande = $this->generateNumeroCommande();
            
            // Créer la commande
            $commande = Commande::create([
                'numero_commande' => $numeroCommande,
                'client_id' => $data['client_id'],
                'nom_destinataire' => $data['nom_destinataire'],
                'telephone_livraison' => $data['telephone_livraison'],
                'adresse_livraison' => $data['adresse_livraison'],
                'instructions_livraison' => $data['instructions_livraison'] ?? null,
                'mode_livraison' => $data['mode_livraison'] ?? 'domicile',
                'date_livraison_prevue' => $data['date_livraison_prevue'] ?? null,
                'sous_total' => $montants['sous_total'],
                'frais_livraison' => $data['frais_livraison'] ?? 0,
                'remise' => $data['remise'] ?? 0,
                'montant_total' => $montants['total'],
                'statut' => 'en_attente',
                'priorite' => $data['priorite'] ?? 'normale',
                'est_cadeau' => $data['est_cadeau'] ?? false,
                'message_cadeau' => $data['message_cadeau'] ?? null,
                'code_promo' => $data['code_promo'] ?? null,
                'notes_client' => $data['notes_client'] ?? null,
                'notes_admin' => $data['notes_admin'] ?? null,
                'source' => 'boutique'
            ]);

            // Créer les articles de commande avec gestion des mesures
            $this->createArticlesCommande($commande, $data['articles'], $data['client_id']);

            // Décrémenter le stock
            $this->decrementStock($data['articles']);

            DB::commit();

            Log::info('Nouvelle commande créée', [
                'commande_id' => $commande->id,
                'numero_commande' => $commande->numero_commande,
                'montant_total' => $commande->montant_total,
                'user_id' => auth()->id()
            ]);

            return $commande->load(['client', 'articles_commandes.produit']);

        } catch (\Exception $e) {
            DB::rollBack();
            Log::error('Erreur création commande', [
                'error' => $e->getMessage(),
                'trace' => $e->getTraceAsString()
            ]);
            throw $e;
        }
    }

    /**
     * Mettre à jour une commande
     */
    public function updateCommande(Commande $commande, array $data): Commande
    {
        DB::beginTransaction();

        try {
            // Si les articles ont changé, recalculer les montants
            if (isset($data['articles'])) {
                $montants = $this->calculateMontants($data['articles'], $data['frais_livraison'] ?? 0, $data['remise'] ?? 0);
                
                // Remettre en stock les anciens articles
                $this->restoreStock($commande->articles_commandes);
                
                // Supprimer les anciens articles
                $commande->articles_commandes()->delete();
                
                // Créer les nouveaux articles avec mesures
                $this->createArticlesCommande($commande, $data['articles'], $data['client_id']);
                
                // Décrémenter le stock pour les nouveaux articles
                $this->decrementStock($data['articles']);
                
                $data['sous_total'] = $montants['sous_total'];
                $data['montant_total'] = $montants['total'];
            }

            $commande->update($data);

            DB::commit();
Log::info('Commande mise à jour', [
                'commande_id' => $commande->id,
                'numero_commande' => $commande->numero_commande,
                'user_id' => auth()->id()
            ]);

            return $commande->fresh(['client', 'articles_commandes.produit']);

        } catch (\Exception $e) {
            DB::rollBack();
            Log::error('Erreur mise à jour commande', [
                'error' => $e->getMessage()
            ]);
            throw $e;
        }
    }

    /**
     * Calculer les montants de la commande
     */
    public function calculateMontants(array $articles, float $fraisLivraison, float $remise = 0): array
    {
        $sousTotal = 0;
        
        foreach ($articles as $article) {
            $sousTotal += $article['quantite'] * $article['prix_unitaire'];
        }
        
        $total = $sousTotal + $fraisLivraison - $remise;
        
        return [
            'sous_total' => $sousTotal,
            'total' => max(0, $total) // Éviter les totaux négatifs
        ];
    }

    /**
     * Générer un numéro de commande unique
     */
    public function generateNumeroCommande(): string
    {
        $year = date('Y');
        $month = date('m');
        
        // Compter les commandes du mois
        $count = Commande::whereYear('created_at', $year)
                        ->whereMonth('created_at', $month)
                        ->count();
        
        $numero = str_pad($count + 1, 4, '0', STR_PAD_LEFT);
        
        return "CMD-{$year}{$month}-{$numero}";
    }

    /**
     * Obtenir les statistiques des commandes
     */
    public function getStatistics(): array
    {
        return [
            'total_commandes' => Commande::count(),
            'commandes_aujourd_hui' => Commande::whereDate('created_at', today())->count(),
            'commandes_ce_mois' => Commande::whereMonth('created_at', now()->month)->count(),
            'chiffre_affaires_mois' => Commande::where('statut', 'livree')
                ->whereMonth('created_at', now()->month)
                ->sum('montant_total'),
            'commandes_par_statut' => Commande::select('statut', DB::raw('count(*) as total'))
                ->groupBy('statut')
                ->pluck('total', 'statut')
                ->toArray(),
            'commandes_en_retard' => Commande::where('date_livraison_prevue', '<', now())
                ->whereNotIn('statut', ['livree', 'annulee'])
                ->count(),
            'commandes_urgentes' => Commande::where('priorite', 'urgente')
                ->whereNotIn('statut', ['livree', 'annulee'])
                ->count()
        ];
    }

    /**
     * Obtenir les commandes en retard
     */
    public function getCommandesEnRetard(): \Illuminate\Database\Eloquent\Collection
    {
        return Commande::with(['client', 'articles_commandes.produit'])
            ->where('date_livraison_prevue', '<', now())
            ->whereNotIn('statut', ['livree', 'annulee'])
            ->orderBy('date_livraison_prevue')
            ->get();
    }

    /**
     * Obtenir les commandes urgentes
     */
    public function getCommandesUrgentes(): \Illuminate\Database\Eloquent\Collection
    {
        return Commande::with(['client', 'articles_commandes.produit'])
            ->whereIn('priorite', ['urgente', 'tres_urgente'])
            ->whereNotIn('statut', ['livree', 'annulee'])
            ->orderBy('priorite', 'desc')
            ->orderBy('created_at')
            ->get();
    }

    // ========== MÉTHODES PRIVÉES ==========

    /**
     * Créer les articles de commande avec gestion automatique des mesures
     */
    private function createArticlesCommande(Commande $commande, array $articles, int $clientId): void
    {
        // Récupérer les mesures du client
        $mesuresClient = MesureClient::where('client_id', $clientId)->first();

        foreach ($articles as $articleData) {
            // Récupérer le produit
            $produit = Produit::find($articleData['produit_id']);
            
            $mesuresJson = null;
            $utiliseMesuresClient = false;

            // Gestion des mesures
            if (!empty($articleData['utilise_mesures_client']) && $mesuresClient) {
                // Utiliser les mesures existantes du client
                $mesuresArray = $mesuresClient->toArray();
                unset($mesuresArray['id'], $mesuresArray['client_id'], $mesuresArray['created_at'], $mesuresArray['updated_at'], $mesuresArray['deleted_at']);
                $mesuresJson = json_encode(array_filter($mesuresArray)); // Retirer les valeurs null
                $utiliseMesuresClient = true;
            } 
            elseif (!empty($articleData['mesures_personnalisees']) && !empty($articleData['mesures'])) {
                // Utiliser les mesures personnalisées et les sauvegarder si le client n'en a pas
                $mesuresJson = json_encode($articleData['mesures']);
                
                // Sauvegarder automatiquement dans mesures_clients si le client n'a pas de mesures
                if (!$mesuresClient) {
                    $this->saveMesuresClient($clientId, $articleData['mesures']);
                }
            }

            // Créer l'article de commande
            ArticlesCommande::create([
                'commande_id' => $commande->id,
                'produit_id' => $articleData['produit_id'],
                'nom_produit' => $produit->nom,
                'description_produit' => $produit->description,
                'quantite' => $articleData['quantite'],
                'prix_unitaire' => $articleData['prix_unitaire'],
                'prix_total_article' => $articleData['quantite'] * $articleData['prix_unitaire'],
                'utilise_mesures_client' => $utiliseMesuresClient,
                'mesures_client' => $mesuresJson,
                'personnalisations' => json_encode([
                    'taille' => $articleData['taille'] ?? null,
                    'couleur' => $articleData['couleur'] ?? null,
                    'tissu' => $articleData['tissu'] ?? null,
                    'instructions' => $articleData['instructions'] ?? null,
                ]),
            ]);
        }
    }

    /**
     * Sauvegarder les mesures du client
     */
    private function saveMesuresClient(int $clientId, array $mesures): void
    {
        try {
            MesureClient::create([
                'client_id' => $clientId,
                'epaule' => $mesures['epaule'] ?? null,
                'poitrine' => $mesures['poitrine'] ?? null,
                'taille' => $mesures['taille'] ?? null,
                'longueur_robe' => $mesures['longueur_robe'] ?? null,
                'tour_bras' => $mesures['tour_bras'] ?? null,
                'tour_cuisses' => $mesures['tour_cuisses'] ?? null,
                'longueur_jupe' => $mesures['longueur_jupe'] ?? null,
                'ceinture' => $mesures['ceinture'] ?? null,
                'tour_fesses' => $mesures['tour_fesses'] ?? null,
                'buste' => $mesures['buste'] ?? null,
                'longueur_manches_longues' => $mesures['longueur_manches_longues'] ?? null,
                'longueur_manches_courtes' => $mesures['longueur_manches_courtes'] ?? null,
            ]);

            Log::info('Mesures client sauvegardées automatiquement', [
                'client_id' => $clientId
            ]);
        } catch (\Exception $e) {
            Log::warning('Erreur sauvegarde mesures client', [
                'client_id' => $clientId,
                'error' => $e->getMessage()
            ]);
        }
    }

    /**
     * Décrémenter le stock des produits
     */
    private function decrementStock(array $articles): void
    {
        foreach ($articles as $article) {
            $produit = Produit::find($article['produit_id']);
            if ($produit && $produit->gestion_stock) {
                $produit->decrement('stock_disponible', $article['quantite']);
            }
        }
    }

    /**
     * Remettre en stock les produits
     */
    private function restoreStock($articlesCommande): void
    {
        foreach ($articlesCommande as $article) {
            if ($article->produit && $article->produit->gestion_stock) {
                $article->produit->increment('stock_disponible', $article->quantite);
            }
        }
    }
}