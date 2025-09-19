<?php

namespace App\Http\Controllers\Api\Admin;

use App\Http\Controllers\Controller;
use App\Models\Commande;
use App\Models\Client;
use App\Http\Requests\Admin\CommandeRequest;
use App\Services\Admin\CommandeService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\DB;

class CommandeController extends Controller
{
    protected CommandeService $commandeService;

    public function __construct(CommandeService $commandeService)
    {
        $this->commandeService = $commandeService;
    }

    /**
     * Liste toutes les commandes
     */
    public function index(Request $request): JsonResponse
    {
        try {
            $perPage = $request->get('per_page', 15);
            $search = $request->get('search');
            $statut = $request->get('statut');
            $statutPaiement = $request->get('statut_paiement');
            $sort = $request->get('sort', 'created_at');
            $direction = $request->get('direction', 'desc');

            $query = Commande::with(['client', 'articles_commandes.produit']);

            // Recherche
            if ($search) {
                $query->where(function ($q) use ($search) {
                    $q->where('numero_commande', 'ILIKE', "%{$search}%")
                      ->orWhere('nom_destinataire', 'ILIKE', "%{$search}%")
                      ->orWhere('telephone_livraison', 'ILIKE', "%{$search}%")
                      ->orWhereHas('client', function ($clientQuery) use ($search) {
                          $clientQuery->where('nom', 'ILIKE', "%{$search}%")
                                    ->orWhere('email', 'ILIKE', "%{$search}%");
                      });
                });
            }

            // Filtrer par statut
            if ($statut) {
                $query->where('statut', $statut);
            }

            // Filtrer par statut de paiement
            if ($statutPaiement) {
                $query->whereHas('paiements', function ($q) use ($statutPaiement) {
                    $q->where('statut', $statutPaiement);
                });
            }

            // Tri
            $allowedSorts = ['numero_commande', 'montant_total', 'statut', 'created_at', 'date_livraison_prevue'];
            if (in_array($sort, $allowedSorts)) {
                $query->orderBy($sort, $direction);
            }

            $commandes = $query->paginate($perPage);

            return response()->json([
                'success' => true,
                'data' => [
                    'commandes' => $commandes->map(function ($commande) {
                        return $this->formatCommandeResponse($commande);
                    }),
                    'pagination' => [
                        'current_page' => $commandes->currentPage(),
                        'per_page' => $commandes->perPage(),
                        'total' => $commandes->total(),
                        'last_page' => $commandes->lastPage(),
                    ]
                ]
            ]);

        } catch (\Exception $e) {
            Log::error('Erreur lors de la récupération des commandes', [
                'error' => $e->getMessage(),
                'trace' => $e->getTraceAsString()
            ]);

            return response()->json([
                'success' => false,
                'message' => 'Erreur lors de la récupération des commandes'
            ], 500);
        }
    }

    /**
     * Créer une nouvelle commande
     */
    public function store(CommandeRequest $request): JsonResponse
    {
        try {
            DB::beginTransaction();

            $commande = $this->commandeService->createCommande($request->validated());

            DB::commit();

            return response()->json([
                'success' => true,
                'message' => 'Commande créée avec succès',
                'data' => [
                    'commande' => $this->formatCommandeResponse($commande, true)
                ]
            ], 201);

        } catch (\Exception $e) {
            DB::rollBack();
            
            Log::error('Erreur création commande', [
                'error' => $e->getMessage(),
                'trace' => $e->getTraceAsString()
            ]);

            return response()->json([
                'success' => false,
                'message' => 'Erreur lors de la création de la commande',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Afficher une commande spécifique
     */
    public function show(Commande $commande): JsonResponse
    {
        try {
            $commande->load([
                'client.mesures',
                'articles_commandes.produit.category',
                'paiements',
                'factures'
            ]);

            return response()->json([
                'success' => true,
                'data' => [
                    'commande' => $this->formatCommandeResponse($commande, true)
                ]
            ]);

        } catch (\Exception $e) {
            Log::error('Erreur lors de la récupération de la commande', [
                'commande_id' => $commande->id,
                'error' => $e->getMessage()
            ]);

            return response()->json([
                'success' => false,
                'message' => 'Erreur lors de la récupération de la commande'
            ], 500);
        }
    }

    /**
     * Obtenir les clients avec leurs mesures
     */
 // Dans CommandeController.php - méthode getClientsWithMesures

public function getClientsWithMesures(): JsonResponse
{
    try {
        $clients = Client::with('mesures')
            ->select(
                'id', 
                'nom', 
                'prenom', 
                'telephone', 
                'email',
                'adresse_principale',  // AJOUTEZ CES CHAMPS
                'quartier',
                'ville',
                'indications_livraison'
            )
            ->orderBy('nom')
            ->get()
            ->map(function ($client) {
                return [
                    'id' => $client->id,
                    'nom_complet' => $client->nom . ' ' . $client->prenom,
                    'telephone' => $client->telephone,
                    'email' => $client->email,
                    'adresse_principale' => $client->adresse_principale,
                    'quartier' => $client->quartier,
                    'ville' => $client->ville,
                    'indications_livraison' => $client->indications_livraison,
                    'a_mesures' => $client->mesures !== null,
                    'mesures' => $client->mesures
                ];
            });

        return response()->json([
            'success' => true,
            'data' => ['clients' => $clients]
        ]);

    } catch (\Exception $e) {
        Log::error('Erreur récupération clients avec mesures', [
            'error' => $e->getMessage()
        ]);

        return response()->json([
            'success' => false,
            'message' => 'Erreur lors de la récupération des clients'
        ], 500);
    }
}
    /**
     * Mettre à jour le statut d'une commande
     */
    public function updateStatus(Request $request, Commande $commande): JsonResponse
    {
        try {
            $validated = $request->validate([
                'statut' => 'required|in:en_attente,confirmee,en_preparation,prete,en_livraison,livree,annulee',
                'notes_admin' => 'nullable|string|max:1000'
            ]);

            DB::beginTransaction();

            $ancienStatut = $commande->statut;
            $commande->update($validated);

            // Mettre à jour les dates automatiquement selon le statut
            $this->updateStatusDates($commande, $validated['statut']);

            DB::commit();

            Log::info('Statut de commande mis à jour', [
                'commande_id' => $commande->id,
                'numero_commande' => $commande->numero_commande,
                'ancien_statut' => $ancienStatut,
                'nouveau_statut' => $validated['statut'],
                'user_id' => auth()->id()
            ]);

            return response()->json([
                'success' => true,
                'message' => 'Statut de la commande mis à jour avec succès',
                'data' => [
                    'commande' => $this->formatCommandeResponse($commande->fresh())
                ]
            ]);

        } catch (\Exception $e) {
            DB::rollBack();
            
            Log::error('Erreur lors de la mise à jour du statut', [
                'commande_id' => $commande->id,
                'error' => $e->getMessage()
            ]);

            return response()->json([
                'success' => false,
                'message' => 'Erreur lors de la mise à jour du statut'
            ], 500);
        }
    }

    /**
     * Assigner une date de livraison
     */
    public function updateDateLivraison(Request $request, Commande $commande): JsonResponse
    {
        try {
            $validated = $request->validate([
                'date_livraison_prevue' => 'required|date|after:now',
                'notes_admin' => 'nullable|string|max:1000'
            ]);

            $commande->update($validated);

            Log::info('Date de livraison mise à jour', [
                'commande_id' => $commande->id,
                'numero_commande' => $commande->numero_commande,
                'nouvelle_date' => $validated['date_livraison_prevue'],
                'user_id' => auth()->id()
            ]);

            return response()->json([
                'success' => true,
                'message' => 'Date de livraison mise à jour avec succès',
                'data' => [
                    'commande' => $this->formatCommandeResponse($commande->fresh())
                ]
            ]);

        } catch (\Exception $e) {
            Log::error('Erreur lors de la mise à jour de la date de livraison', [
                'commande_id' => $commande->id,
                'error' => $e->getMessage()
            ]);

            return response()->json([
                'success' => false,
                'message' => 'Erreur lors de la mise à jour de la date de livraison'
            ], 500);
        }
    }

    /**
     * Annuler une commande
     */
    public function cancel(Request $request, Commande $commande): JsonResponse
    {
        try {
            if (in_array($commande->statut, ['livree', 'annulee'])) {
                return response()->json([
                    'success' => false,
                    'message' => 'Cette commande ne peut pas être annulée'
                ], 400);
            }

            $validated = $request->validate([
                'raison_annulation' => 'required|string|max:500'
            ]);

            DB::beginTransaction();

            $commande->update([
                'statut' => 'annulee',
                'notes_admin' => ($commande->notes_admin ? $commande->notes_admin . "\n\n" : '') . 
                               "ANNULATION: " . $validated['raison_annulation']
            ]);

            // Remettre en stock les produits si nécessaire
            $this->restoreStock($commande);

            DB::commit();

            Log::info('Commande annulée', [
                'commande_id' => $commande->id,
                'numero_commande' => $commande->numero_commande,
                'raison' => $validated['raison_annulation'],
                'user_id' => auth()->id()
            ]);

            return response()->json([
                'success' => true,
                'message' => 'Commande annulée avec succès'
            ]);

        } catch (\Exception $e) {
            DB::rollBack();
            
            Log::error('Erreur lors de l\'annulation de la commande', [
                'commande_id' => $commande->id,
                'error' => $e->getMessage()
            ]);

            return response()->json([
                'success' => false,
                'message' => 'Erreur lors de l\'annulation de la commande'
            ], 500);
        }
    }

    /**
     * Obtenir les statistiques des commandes
     */
    public function stats(): JsonResponse
    {
        try {
            $stats = [
                'total_commandes' => Commande::count(),
                'commandes_en_attente' => Commande::where('statut', 'en_attente')->count(),
                'commandes_confirmees' => Commande::where('statut', 'confirmee')->count(),
                'commandes_en_preparation' => Commande::where('statut', 'en_preparation')->count(),
                'commandes_pretes' => Commande::where('statut', 'prete')->count(),
                'commandes_en_livraison' => Commande::where('statut', 'en_livraison')->count(),
                'commandes_livrees' => Commande::where('statut', 'livree')->count(),
                'commandes_annulees' => Commande::where('statut', 'annulee')->count(),
                'chiffre_affaires_mois' => Commande::where('statut', 'livree')
                    ->whereBetween('created_at', [now()->startOfMonth(), now()->endOfMonth()])
                    ->sum('montant_total'),
                'commandes_en_retard' => Commande::where('date_livraison_prevue', '<', now())
                    ->whereNotIn('statut', ['livree', 'annulee'])
                    ->count()
            ];

            return response()->json([
                'success' => true,
                'data' => $stats
            ]);

        } catch (\Exception $e) {
            Log::error('Erreur lors de la récupération des statistiques', [
                'error' => $e->getMessage()
            ]);

            return response()->json([
                'success' => false,
                'message' => 'Erreur lors de la récupération des statistiques'
            ], 500);
        }
    }

    // ========== MÉTHODES PRIVÉES ==========

    /**
     * Formater la réponse d'une commande
     */
    private function formatCommandeResponse(Commande $commande, bool $detailed = false): array
    {
        $data = [
            'id' => $commande->id,
            'numero_commande' => $commande->numero_commande,
            'client' => $commande->client ? [
                'id' => $commande->client->id,
                'nom' => $commande->client->nom,
                'email' => $commande->client->email,
                'telephone' => $commande->client->telephone
            ] : null,
            'nom_destinataire' => $commande->nom_destinataire,
            'telephone_livraison' => $commande->telephone_livraison,
            'adresse_livraison' => $commande->adresse_livraison,
            'sous_total' => $commande->sous_total,
            'frais_livraison' => $commande->frais_livraison,
            'remise' => $commande->remise,
            'montant_total' => $commande->montant_total,
            'statut' => $commande->statut,
            'statut_label' => $this->getStatutLabel($commande->statut),
            'priorite' => $commande->priorite,
            'est_cadeau' => $commande->est_cadeau,
            'mode_livraison' => $commande->mode_livraison,
            'source' => $commande->source,
            'date_commande' => $commande->created_at->format('d/m/Y H:i'),
            'date_livraison_prevue' => $commande->date_livraison_prevue?->format('d/m/Y H:i'),
            'date_livraison_reelle' => $commande->date_livraison_reelle?->format('d/m/Y H:i'),
            'nb_articles' => $commande->articles_commandes->sum('quantite'),
            'est_en_retard' => $commande->date_livraison_prevue && 
                               $commande->date_livraison_prevue < now() && 
                               !in_array($commande->statut, ['livree', 'annulee'])
        ];

        if ($detailed) {
            $data = array_merge($data, [
                'instructions_livraison' => $commande->instructions_livraison,
                'notes_client' => $commande->notes_client,
                'notes_admin' => $commande->notes_admin,
                'notes_production' => $commande->notes_production,
                'message_cadeau' => $commande->message_cadeau,
                'code_promo' => $commande->code_promo,
                'note_satisfaction' => $commande->note_satisfaction,
                'commentaire_satisfaction' => $commande->commentaire_satisfaction,
                'articles' => $commande->articles_commandes->map(function ($article) {
                    $articleData = [
                        'id' => $article->id,
                        'produit' => [
                            'id' => $article->produit->id,
                            'nom' => $article->produit->nom,
                            'image' => $article->produit->image_principale,
                            'categorie' => $article->produit->category->nom ?? null
                        ],
                        'quantite' => $article->quantite,
                        'prix_unitaire' => $article->prix_unitaire,
                        'prix_total' => $article->prix_total_article,
                        'personnalisations' => $article->personnalisations,
                        'utilise_mesures_client' => $article->utilise_mesures_client ?? false,
                    ];

                    // Ajouter les mesures si présentes
                    if ($article->mesures_client) {
                        $articleData['mesures'] = json_decode($article->mesures_client, true);
                    }

                    return $articleData;
                }),
                'paiements' => $commande->paiements->map(function ($paiement) {
                    return [
                        'id' => $paiement->id,
                        'montant' => $paiement->montant,
                        'methode' => $paiement->methode_paiement,
                        'statut' => $paiement->statut,
                        'date' => $paiement->created_at->format('d/m/Y H:i')
                    ];
                })
            ]);
        }

        return $data;
    }

    /**
     * Obtenir le libellé du statut
     */
    private function getStatutLabel(string $statut): string
    {
        $labels = [
            'en_attente' => 'En attente',
            'confirmee' => 'Confirmée',
            'en_preparation' => 'En préparation',
            'prete' => 'Prête',
            'en_livraison' => 'En livraison',
            'livree' => 'Livrée',
            'annulee' => 'Annulée'
        ];

        return $labels[$statut] ?? $statut;
    }

    /**
     * Mettre à jour les dates selon le statut
     */
    private function updateStatusDates(Commande $commande, string $nouveauStatut): void
    {
        $updates = [];

        switch ($nouveauStatut) {
            case 'confirmee':
                if (!$commande->date_confirmation) {
                    $updates['date_confirmation'] = now();
                }
                break;
            case 'en_preparation':
                if (!$commande->date_debut_production) {
                    $updates['date_debut_production'] = now();
                }
                break;
            case 'prete':
                if (!$commande->date_fin_production) {
                    $updates['date_fin_production'] = now();
                }
                break;
            case 'livree':
                if (!$commande->date_livraison_reelle) {
                    $updates['date_livraison_reelle'] = now();
                }
                break;
        }

        if (!empty($updates)) {
            $commande->update($updates);
        }
    }

    /**
     * Remettre en stock les produits d'une commande annulée
     */
    private function restoreStock(Commande $commande): void
    {
        foreach ($commande->articles_commandes as $article) {
            if ($article->produit->gestion_stock) {
                $article->produit->increment('stock_disponible', $article->quantite);
            }
        }
    }
    /**
 * Mettre à jour une commande
 */
public function update(CommandeRequest $request, Commande $commande): JsonResponse
{
    try {
        DB::beginTransaction();

        $updatedCommande = $this->commandeService->updateCommande($commande, $request->validated());

        DB::commit();

        return response()->json([
            'success' => true,
            'message' => 'Commande mise à jour avec succès',
            'data' => [
                'commande' => $this->formatCommandeResponse($updatedCommande, true)
            ]
        ]);
    } catch (\Exception $e) {
        DB::rollBack();
        
        Log::error('Erreur mise à jour commande', [
            'commande_id' => $commande->id,
            'error' => $e->getMessage()
        ]);

        return response()->json([
            'success' => false,
            'message' => 'Erreur lors de la mise à jour'
        ], 500);
    }
}

/**
 * Supprimer une commande
 */
public function destroy(Commande $commande): JsonResponse
{
    try {

         if ($commande->paiements()->exists()) {
        return response()->json([
            'success' => false,
            'message' => 'Impossible de supprimer une commande avec des paiements associés'
        ], 400);
    }
        // Vérifier si on peut supprimer
        if (in_array($commande->statut, ['en_livraison', 'livree'])) {
            return response()->json([
                'success' => false,
                'message' => 'Impossible de supprimer une commande en livraison ou livrée'
            ], 400);
        }

        DB::beginTransaction();

        // Remettre en stock
        foreach ($commande->articles_commandes as $article) {
            if ($article->produit->gestion_stock) {
                $article->produit->increment('stock_disponible', $article->quantite);
            }
        }

        $commande->delete();

        DB::commit();

        Log::info('Commande supprimée', [
            'commande_id' => $commande->id,
            'numero_commande' => $commande->numero_commande,
            'user_id' => auth()->id()
        ]);

        return response()->json([
            'success' => true,
            'message' => 'Commande supprimée avec succès'
        ]);
    } catch (\Exception $e) {
        DB::rollBack();
        
        Log::error('Erreur suppression commande', [
            'commande_id' => $commande->id,
            'error' => $e->getMessage()
        ]);

        return response()->json([
            'success' => false,
            'message' => 'Erreur lors de la suppression'
        ], 500);
    }
}
}