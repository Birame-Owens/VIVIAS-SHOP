<?php

namespace App\Http\Controllers\Api\Admin;

use App\Http\Controllers\Controller;
use App\Models\Produit;
use App\Models\ImagesProduit;
use App\Http\Requests\Admin\ProduitRequest;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Str;

class ProduitController extends Controller
{
    /**
     * Liste tous les produits
     */
    public function index(Request $request): JsonResponse
    {
        try {
            $perPage = $request->get('per_page', 15);
            $search = $request->get('search');
            $categoryId = $request->get('category_id');
            $status = $request->get('status'); // 'visible', 'hidden', 'all'
            $sort = $request->get('sort', 'created_at');
            $direction = $request->get('direction', 'desc');

            $query = Produit::with(['category', 'images_produits' => function ($q) {
                $q->where('est_principale', true)->orWhere('ordre_affichage', 1);
            }]);

            // Recherche
            if ($search) {
                $query->where(function ($q) use ($search) {
                    $q->where('nom', 'ILIKE', "%{$search}%")
                      ->orWhere('description', 'ILIKE', "%{$search}%")
                      ->orWhere('tags', 'ILIKE', "%{$search}%");
                });
            }

            // Filtrer par catégorie
            if ($categoryId) {
                $query->where('categorie_id', $categoryId);
            }

            // Filtrer par statut
            if ($status && $status !== 'all') {
                $query->where('est_visible', $status === 'visible');
            }

            // Tri
            $allowedSorts = ['nom', 'prix', 'stock_disponible', 'created_at', 'nombre_ventes', 'note_moyenne'];
            if (in_array($sort, $allowedSorts)) {
                $query->orderBy($sort, $direction);
            }

            $produits = $query->paginate($perPage);

            return response()->json([
                'success' => true,
                'data' => [
                    'produits' => $produits->map(function ($produit) {
                        $image = $produit->images_produits->first();
                        
                       return [
    'id' => $produit->id,
    'nom' => $produit->nom,
    'slug' => $produit->slug,
    'description' => $produit->description, // MANQUANT
    'description_courte' => $produit->description_courte,
    'prix' => $produit->prix,
    'prix_promo' => $produit->prix_promo,
    'debut_promo' => $produit->debut_promo, // MANQUANT
    'fin_promo' => $produit->fin_promo, // MANQUANT
    'prix_actuel' => $produit->prix_promo ?: $produit->prix,
    'en_promo' => $produit->prix_promo !== null,
    'image_principale' => $image 
        ? asset('storage/' . $image->chemin_original) 
        : ($produit->image_principale ? asset('storage/' . $produit->image_principale) : null),
    'categorie' => $produit->category ? [
        'id' => $produit->category->id,
        'nom' => $produit->category->nom
    ] : null,
    'stock_disponible' => $produit->stock_disponible,
    'seuil_alerte' => $produit->seuil_alerte,
    'gestion_stock' => $produit->gestion_stock, // MANQUANT
    'stock_status' => $this->getStockStatus($produit),
    'fait_sur_mesure' => $produit->fait_sur_mesure,
    'delai_production_jours' => $produit->delai_production_jours, // MANQUANT
    'cout_production' => $produit->cout_production, // MANQUANT
    
    // Arrays à décoder depuis JSON
    'tailles_disponibles' => $produit->tailles_disponibles ? json_decode($produit->tailles_disponibles, true) : [], // MANQUANT
    'couleurs_disponibles' => $produit->couleurs_disponibles ? json_decode($produit->couleurs_disponibles, true) : [], // MANQUANT
    'materiaux_necessaires' => $produit->materiaux_necessaires ? json_decode($produit->materiaux_necessaires, true) : [], // MANQUANT
    
    'est_visible' => $produit->est_visible,
    'est_populaire' => $produit->est_populaire,
    'est_nouveaute' => $produit->est_nouveaute,
    'ordre_affichage' => $produit->ordre_affichage, // MANQUANT
    'nombre_ventes' => $produit->nombre_ventes,
    'note_moyenne' => $produit->note_moyenne,
    'nombre_avis' => $produit->nombre_avis,
    
    // Champs SEO
    'meta_titre' => $produit->meta_titre, // MANQUANT
    'meta_description' => $produit->meta_description, // MANQUANT
    'tags' => $produit->tags, // MANQUANT
    
    'created_at' => $produit->created_at->format('d/m/Y H:i'),
    'updated_at' => $produit->updated_at->format('d/m/Y H:i'),
];
                    }),
                    'pagination' => [
                        'current_page' => $produits->currentPage(),
                        'per_page' => $produits->perPage(),
                        'total' => $produits->total(),
                        'last_page' => $produits->lastPage(),
                    ]
                ]
            ]);

        } catch (\Exception $e) {
            Log::error('Erreur lors de la récupération des produits', [
                'error' => $e->getMessage(),
                'trace' => $e->getTraceAsString()
            ]);

            return response()->json([
                'success' => false,
                'message' => 'Erreur lors de la récupération des produits'
            ], 500);
        }
    }

    /**
     * Créer un nouveau produit
     */
    public function store(ProduitRequest $request): JsonResponse
    {
        try {
            DB::beginTransaction();

            // Debug: Vérifier ce qui est reçu
            Log::info('📦 Création produit - Données reçues', [
                'has_file_image_principale' => $request->hasFile('image_principale'),
                'file_info' => $request->hasFile('image_principale') ? [
                    'name' => $request->file('image_principale')->getClientOriginalName(),
                    'mime' => $request->file('image_principale')->getMimeType(),
                    'size' => $request->file('image_principale')->getSize(),
                ] : 'Aucun fichier',
                'all_files' => $request->allFiles(),
                'nom_produit' => $request->input('nom')
            ]);

            $validatedData = $request->validated();
            
            // Génération du slug
            $validatedData['slug'] = Str::slug($validatedData['nom']);
            
            // Vérifier l'unicité du slug
            $originalSlug = $validatedData['slug'];
            $counter = 1;
            while (Produit::where('slug', $validatedData['slug'])->exists()) {
                $validatedData['slug'] = $originalSlug . '-' . $counter;
                $counter++;
            }

            // Gestion de l'image principale (avec valeur par défaut)
            if ($request->hasFile('image_principale')) {
                $imagePath = $request->file('image_principale')->store('produits', 'public');
                $validatedData['image_principale'] = $imagePath;
            } else {
                // Image par défaut si aucune image n'est fournie
                $validatedData['image_principale'] = 'produits/default-product.jpg';
            }

            // Traiter les données JSON
            if (isset($validatedData['tailles_disponibles']) && is_array($validatedData['tailles_disponibles'])) {
                $validatedData['tailles_disponibles'] = json_encode($validatedData['tailles_disponibles']);
            }
            
            if (isset($validatedData['couleurs_disponibles']) && is_array($validatedData['couleurs_disponibles'])) {
                $validatedData['couleurs_disponibles'] = json_encode($validatedData['couleurs_disponibles']);
            }

            if (isset($validatedData['materiaux_necessaires']) && is_array($validatedData['materiaux_necessaires'])) {
                $validatedData['materiaux_necessaires'] = json_encode($validatedData['materiaux_necessaires']);
            }

            $produit = Produit::create($validatedData);

            // Gestion des images multiples
            if ($request->hasFile('images')) {
                $this->handleProductImages($produit, $request->file('images'));
            }

            DB::commit();

            Log::info('Nouveau produit créé', [
                'produit_id' => $produit->id,
                'nom' => $produit->nom,
                'user_id' => auth()->id()
            ]);

            return response()->json([
                'success' => true,
                'message' => 'Produit créé avec succès',
                'data' => [
                    'produit' => $this->formatProduitResponse($produit->load(['category', 'images_produits']))
                ]
            ], 201);

        } catch (\Exception $e) {
            DB::rollBack();
            
            Log::error('Erreur lors de la création du produit', [
                'error' => $e->getMessage(),
                'data' => $request->all()
            ]);

            return response()->json([
                'success' => false,
                'message' => 'Erreur lors de la création du produit'
            ], 500);
        }
    }

    /**
     * Afficher un produit spécifique
     */
    public function show(Produit $produit): JsonResponse
    {
        try {
            $produit->load(['category', 'images_produits' => function ($q) {
                $q->orderBy('ordre_affichage');
            }, 'avis_clients' => function ($q) {
                $q->where('statut', 'approuve')->latest()->take(5);
            }]);

            return response()->json([
                'success' => true,
                'data' => [
                    'produit' => $this->formatProduitResponse($produit, true)
                ]
            ]);

        } catch (\Exception $e) {
            Log::error('Erreur lors de la récupération du produit', [
                'produit_id' => $produit->id,
                'error' => $e->getMessage()
            ]);

            return response()->json([
                'success' => false,
                'message' => 'Erreur lors de la récupération du produit'
            ], 500);
        }
    }

    /**
     * Mettre à jour un produit
     */
    public function update(ProduitRequest $request, Produit $produit): JsonResponse
    {
        try {
            DB::beginTransaction();

            $validatedData = $request->validated();
            
            // Mise à jour du slug si le nom change
            if (isset($validatedData['nom']) && $validatedData['nom'] !== $produit->nom) {
                $newSlug = Str::slug($validatedData['nom']);
                
                $originalSlug = $newSlug;
                $counter = 1;
                while (Produit::where('slug', $newSlug)->where('id', '!=', $produit->id)->exists()) {
                    $newSlug = $originalSlug . '-' . $counter;
                    $counter++;
                }
                
                $validatedData['slug'] = $newSlug;
            }

            // Gestion de l'image principale
            if ($request->hasFile('image_principale')) {
                if ($produit->image_principale && Storage::disk('public')->exists($produit->image_principale)) {
                    Storage::disk('public')->delete($produit->image_principale);
                }
                
                $imagePath = $request->file('image_principale')->store('produits', 'public');
                $validatedData['image_principale'] = $imagePath;
            }

            // Traiter les données JSON
            if (isset($validatedData['tailles_disponibles']) && is_array($validatedData['tailles_disponibles'])) {
                $validatedData['tailles_disponibles'] = json_encode($validatedData['tailles_disponibles']);
            }
            
            if (isset($validatedData['couleurs_disponibles']) && is_array($validatedData['couleurs_disponibles'])) {
                $validatedData['couleurs_disponibles'] = json_encode($validatedData['couleurs_disponibles']);
            }

            if (isset($validatedData['materiaux_necessaires']) && is_array($validatedData['materiaux_necessaires'])) {
                $validatedData['materiaux_necessaires'] = json_encode($validatedData['materiaux_necessaires']);
            }

            $produit->update($validatedData);

            // Gestion des nouvelles images
            if ($request->hasFile('images')) {
                $this->handleProductImages($produit, $request->file('images'));
            }

            DB::commit();

            Log::info('Produit mis à jour', [
                'produit_id' => $produit->id,
                'nom' => $produit->nom,
                'user_id' => auth()->id()
            ]);

            return response()->json([
                'success' => true,
                'message' => 'Produit mis à jour avec succès',
                'data' => [
                    'produit' => $this->formatProduitResponse($produit->load(['category', 'images_produits']))
                ]
            ]);

        } catch (\Exception $e) {
            DB::rollBack();
            
            Log::error('Erreur lors de la mise à jour du produit', [
                'produit_id' => $produit->id,
                'error' => $e->getMessage(),
                'data' => $request->all()
            ]);

            return response()->json([
                'success' => false,
                'message' => 'Erreur lors de la mise à jour du produit'
            ], 500);
        }
    }

    /**
     * Supprimer un produit
     */
    public function destroy(Produit $produit): JsonResponse
    {
        try {
            DB::beginTransaction();

            // Vérifier s'il y a des commandes associées
            $commandesCount = $produit->articles_commandes()->count();
            
            if ($commandesCount > 0) {
                return response()->json([
                    'success' => false,
                    'message' => "Impossible de supprimer ce produit car il est associé à {$commandesCount} commande(s)."
                ], 400);
            }

            // Supprimer toutes les images
            if ($produit->image_principale && Storage::disk('public')->exists($produit->image_principale)) {
                Storage::disk('public')->delete($produit->image_principale);
            }

            foreach ($produit->images_produits as $image) {
                if (Storage::disk('public')->exists($image->chemin_original)) {
                    Storage::disk('public')->delete($image->chemin_original);
                }
                if ($image->chemin_miniature && Storage::disk('public')->exists($image->chemin_miniature)) {
                    Storage::disk('public')->delete($image->chemin_miniature);
                }
                if ($image->chemin_moyen && Storage::disk('public')->exists($image->chemin_moyen)) {
                    Storage::disk('public')->delete($image->chemin_moyen);
                }
            }

            $produitNom = $produit->nom;
            $produit->delete();

            DB::commit();

            Log::info('Produit supprimé', [
                'produit_nom' => $produitNom,
                'user_id' => auth()->id()
            ]);

            return response()->json([
                'success' => true,
                'message' => 'Produit supprimé avec succès'
            ]);

        } catch (\Exception $e) {
            DB::rollBack();
            
            Log::error('Erreur lors de la suppression du produit', [
                'produit_id' => $produit->id,
                'error' => $e->getMessage()
            ]);

            return response()->json([
                'success' => false,
                'message' => 'Erreur lors de la suppression du produit'
            ], 500);
        }
    }

    /**
     * Activer/Désactiver un produit
     */
    public function toggleStatus(Produit $produit): JsonResponse
    {
        try {
            $produit->update(['est_visible' => !$produit->est_visible]);

            $status = $produit->est_visible ? 'activé' : 'désactivé';

            Log::info("Produit {$status}", [
                'produit_id' => $produit->id,
                'nom' => $produit->nom,
                'user_id' => auth()->id()
            ]);

            return response()->json([
                'success' => true,
                'message' => "Produit {$status} avec succès",
                'data' => [
                    'produit' => [
                        'id' => $produit->id,
                        'nom' => $produit->nom,
                        'est_visible' => $produit->est_visible
                    ]
                ]
            ]);

        } catch (\Exception $e) {
            Log::error('Erreur lors du changement de statut du produit', [
                'produit_id' => $produit->id,
                'error' => $e->getMessage()
            ]);

            return response()->json([
                'success' => false,
                'message' => 'Erreur lors du changement de statut'
            ], 500);
        }
    }

    /**
     * Dupliquer un produit
     */
    public function duplicate(Produit $produit): JsonResponse
    {
        try {
            DB::beginTransaction();

            $newProduit = $produit->replicate();
            $newProduit->nom = $produit->nom . ' (Copie)';
            $newProduit->slug = Str::slug($newProduit->nom);
            
            // Vérifier l'unicité du slug
            $originalSlug = $newProduit->slug;
            $counter = 1;
            while (Produit::where('slug', $newProduit->slug)->exists()) {
                $newProduit->slug = $originalSlug . '-' . $counter;
                $counter++;
            }

            $newProduit->est_visible = false; // Créer en mode brouillon
            $newProduit->save();

            // Dupliquer les images
            foreach ($produit->images_produits as $image) {
                $newImage = $image->replicate();
                $newImage->produit_id = $newProduit->id;
                
                // Copier les fichiers physiques
                if (Storage::disk('public')->exists($image->chemin_original)) {
                    $newPath = 'produits/' . $newProduit->id . '_' . basename($image->chemin_original);
                    Storage::disk('public')->copy($image->chemin_original, $newPath);
                    $newImage->chemin_original = $newPath;
                }
                
                $newImage->save();
            }

            DB::commit();

            Log::info('Produit dupliqué', [
                'produit_original_id' => $produit->id,
                'nouveau_produit_id' => $newProduit->id,
                'user_id' => auth()->id()
            ]);

            return response()->json([
                'success' => true,
                'message' => 'Produit dupliqué avec succès',
                'data' => [
                    'produit' => $this->formatProduitResponse($newProduit->load(['category', 'images_produits']))
                ]
            ]);

        } catch (\Exception $e) {
            DB::rollBack();
            
            Log::error('Erreur lors de la duplication du produit', [
                'produit_id' => $produit->id,
                'error' => $e->getMessage()
            ]);

            return response()->json([
                'success' => false,
                'message' => 'Erreur lors de la duplication du produit'
            ], 500);
        }
    }

    /**
     * Supprimer une image de produit
     */
    public function deleteImage(Produit $produit, ImagesProduit $image): JsonResponse
    {
        try {
            // Vérifier que l'image appartient au produit
            if ($image->produit_id !== $produit->id) {
                return response()->json([
                    'success' => false,
                    'message' => 'Image non trouvée pour ce produit'
                ], 404);
            }

            // Supprimer les fichiers physiques
            if (Storage::disk('public')->exists($image->chemin_original)) {
                Storage::disk('public')->delete($image->chemin_original);
            }
            if ($image->chemin_miniature && Storage::disk('public')->exists($image->chemin_miniature)) {
                Storage::disk('public')->delete($image->chemin_miniature);
            }
            if ($image->chemin_moyen && Storage::disk('public')->exists($image->chemin_moyen)) {
                Storage::disk('public')->delete($image->chemin_moyen);
            }

            $image->delete();

            Log::info('Image de produit supprimée', [
                'produit_id' => $produit->id,
                'image_id' => $image->id,
                'user_id' => auth()->id()
            ]);

            return response()->json([
                'success' => true,
                'message' => 'Image supprimée avec succès'
            ]);

        } catch (\Exception $e) {
            Log::error('Erreur lors de la suppression de l\'image', [
                'produit_id' => $produit->id,
                'image_id' => $image->id,
                'error' => $e->getMessage()
            ]);

            return response()->json([
                'success' => false,
                'message' => 'Erreur lors de la suppression de l\'image'
            ], 500);
        }
    }

    /**
     * Mettre à jour l'ordre des images
     */
    public function updateImagesOrder(Produit $produit, Request $request): JsonResponse
    {
        try {
            $imageOrders = $request->validate([
                'images' => 'required|array',
                'images.*.id' => 'required|integer|exists:images_produits,id',
                'images.*.ordre_affichage' => 'required|integer|min:1',
                'images.*.est_principale' => 'boolean'
            ]);

            DB::beginTransaction();

            foreach ($imageOrders['images'] as $imageData) {
                ImagesProduit::where('id', $imageData['id'])
                    ->where('produit_id', $produit->id)
                    ->update([
                        'ordre_affichage' => $imageData['ordre_affichage'],
                        'est_principale' => $imageData['est_principale'] ?? false
                    ]);
            }

            DB::commit();

            return response()->json([
                'success' => true,
                'message' => 'Ordre des images mis à jour avec succès'
            ]);

        } catch (\Exception $e) {
            DB::rollBack();
            
            Log::error('Erreur lors de la mise à jour de l\'ordre des images', [
                'produit_id' => $produit->id,
                'error' => $e->getMessage()
            ]);

            return response()->json([
                'success' => false,
                'message' => 'Erreur lors de la mise à jour de l\'ordre des images'
            ], 500);
        }
    }

    // ========== MÉTHODES PRIVÉES ==========

    /**
     * Gérer les images multiples d'un produit
     */
    private function handleProductImages(Produit $produit, array $images): void
    {
        foreach ($images as $index => $imageFile) {
            $imagePath = $imageFile->store('produits', 'public');
            
            // Obtenir les dimensions de l'image
            $imageDimensions = getimagesize(Storage::disk('public')->path($imagePath));
            
            ImagesProduit::create([
                'produit_id' => $produit->id,
                'nom_fichier' => $imageFile->getClientOriginalName(),
                'chemin_original' => $imagePath,
                'alt_text' => $produit->nom,
                'ordre_affichage' => $index + 1,
                'est_principale' => $index === 0,
                'est_visible' => true,
                'format' => $imageFile->getClientOriginalExtension(),
                'taille_octets' => $imageFile->getSize(),
                'largeur' => $imageDimensions[0] ?? null,
                'hauteur' => $imageDimensions[1] ?? null,
            ]);
        }
    }

    /**
     * Formater la réponse d'un produit
     */
    private function formatProduitResponse(Produit $produit, bool $detailed = false): array
    {
        $data = [
            'id' => $produit->id,
            'nom' => $produit->nom,
            'slug' => $produit->slug,
            'description' => $produit->description,
            'description_courte' => $produit->description_courte,
            'prix' => $produit->prix,
            'prix_promo' => $produit->prix_promo,
            'prix_actuel' => $produit->prix_promo ?: $produit->prix,
            'en_promo' => $produit->prix_promo !== null,
            'debut_promo' => $produit->debut_promo?->format('Y-m-d H:i:s'),
            'fin_promo' => $produit->fin_promo?->format('Y-m-d H:i:s'),
            'image_principale' => $produit->image_principale ? asset('storage/' . $produit->image_principale) : null,
            'images' => $produit->images_produits->map(function ($image) {
                return [
                    'id' => $image->id,
                    'nom_fichier' => $image->nom_fichier,
                    'url_originale' => asset('storage/' . $image->chemin_original),
                    'url_miniature' => $image->chemin_miniature ? asset('storage/' . $image->chemin_miniature) : null,
                    'url_moyenne' => $image->chemin_moyen ? asset('storage/' . $image->chemin_moyen) : null,
                    'alt_text' => $image->alt_text,
                    'titre' => $image->titre,
                    'ordre_affichage' => $image->ordre_affichage,
                    'est_principale' => $image->est_principale,
                    'largeur' => $image->largeur,
                    'hauteur' => $image->hauteur,
                ];
            }),
            'categorie' => $produit->category ? [
                'id' => $produit->category->id,
                'nom' => $produit->category->nom,
                'slug' => $produit->category->slug
            ] : null,
            'stock_disponible' => $produit->stock_disponible,
            'seuil_alerte' => $produit->seuil_alerte,
            'stock_status' => $this->getStockStatus($produit),
            'gestion_stock' => $produit->gestion_stock,
            'fait_sur_mesure' => $produit->fait_sur_mesure,
            'delai_production_jours' => $produit->delai_production_jours,
            'cout_production' => $produit->cout_production,
            'tailles_disponibles' => $produit->tailles_disponibles ? json_decode($produit->tailles_disponibles) : [],
            'couleurs_disponibles' => $produit->couleurs_disponibles ? json_decode($produit->couleurs_disponibles) : [],
            'materiaux_necessaires' => $produit->materiaux_necessaires ? json_decode($produit->materiaux_necessaires) : [],
            'est_visible' => $produit->est_visible,
            'est_populaire' => $produit->est_populaire,
            'est_nouveaute' => $produit->est_nouveaute,
            'ordre_affichage' => $produit->ordre_affichage,
            'nombre_vues' => $produit->nombre_vues,
            'nombre_ventes' => $produit->nombre_ventes,
            'note_moyenne' => $produit->note_moyenne,
            'nombre_avis' => $produit->nombre_avis,
            'meta_titre' => $produit->meta_titre,
            'meta_description' => $produit->meta_description,
            'tags' => $produit->tags,
            'created_at' => $produit->created_at->format('d/m/Y H:i'),
            'updated_at' => $produit->updated_at->format('d/m/Y H:i'),
        ];

        if ($detailed && isset($produit->avis_clients)) {
            $data['avis_clients'] = $produit->avis_clients->map(function ($avis) {
                return [
                    'id' => $avis->id,
                    'client_nom' => $avis->nom_affiche ?: 'Client anonyme',
                    'note_globale' => $avis->note_globale,
                    'commentaire' => $avis->commentaire,
                    'date' => $avis->created_at->format('d/m/Y'),
                ];
            });
        }

        return $data;
    }

    /**
     * Obtenir le statut du stock
     */
    private function getStockStatus(Produit $produit): array
    {
        if (!$produit->gestion_stock) {
            return [
                'status' => 'unlimited',
                'label' => 'Stock illimité',
                'color' => 'blue'
            ];
        }

        if ($produit->stock_disponible <= 0) {
            return [
                'status' => 'out_of_stock',
                'label' => 'Rupture de stock',
                'color' => 'red'
            ];
        }

        if ($produit->stock_disponible <= $produit->seuil_alerte) {
            return [
                'status' => 'low_stock',
                'label' => 'Stock faible',
                'color' => 'orange'
            ];
        }

        return [
            'status' => 'in_stock',
            'label' => 'En stock',
            'color' => 'green'
        ];
    }
}