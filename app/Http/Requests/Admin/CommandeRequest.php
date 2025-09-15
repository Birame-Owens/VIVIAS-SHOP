<?php

namespace App\Http\Requests\Admin;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Contracts\Validation\Validator;
use Illuminate\Http\Exceptions\HttpResponseException;

class CommandeRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'client_id' => [
                'required',
                'integer',
                'exists:clients,id'
            ],
            'nom_destinataire' => [
                'required',
                'string',
                'max:100'
            ],
            'telephone_livraison' => [
                'required',
                'string',
                'max:20'
            ],
            'adresse_livraison' => [
                'required',
                'string',
                'max:500'
            ],
            'instructions_livraison' => [
                'nullable',
                'string',
                'max:1000'
            ],
            'mode_livraison' => [
                'required',
                'string',
                'in:domicile,magasin,point_relais'
            ],
            'date_livraison_prevue' => [
                'nullable',
                'date',
                'after:now'
            ],
            'notes_client' => [
                'nullable',
                'string',
                'max:1000'
            ],
            'notes_admin' => [
                'nullable',
                'string',
                'max:1000'
            ],
            'priorite' => [
                'required',
                'string',
                'in:normale,urgente,tres_urgente'
            ],
            'est_cadeau' => [
                'boolean'
            ],
            'message_cadeau' => [
                'nullable',
                'string',
                'max:500'
            ],
            'code_promo' => [
                'nullable',
                'string',
                'max:20'
            ],
            'frais_livraison' => [
                'required',
                'numeric',
                'min:0',
                'max:50000'
            ],
            'remise' => [
                'nullable',
                'numeric',
                'min:0',
                'max:1000000'
            ],
            
            // Articles de la commande
            'articles' => [
                'required',
                'array',
                'min:1'
            ],
            'articles.*.produit_id' => [
                'required',
                'integer',
                'exists:produits,id'
            ],
            'articles.*.quantite' => [
                'required',
                'integer',
                'min:1',
                'max:100'
            ],
            'articles.*.prix_unitaire' => [
                'required',
                'numeric',
                'min:0'
            ],
            'articles.*.personnalisations' => [
                'nullable',
                'json'
            ]
        ];
    }

    public function messages(): array
    {
        return [
            // Client
            'client_id.required' => 'Le client est obligatoire.',
            'client_id.integer' => 'L\'ID du client doit être un nombre entier.',
            'client_id.exists' => 'Le client sélectionné n\'existe pas.',
            
            // Destinataire
            'nom_destinataire.required' => 'Le nom du destinataire est obligatoire.',
            'nom_destinataire.string' => 'Le nom du destinataire doit être une chaîne de caractères.',
            'nom_destinataire.max' => 'Le nom du destinataire ne peut pas dépasser 100 caractères.',
            
            'telephone_livraison.required' => 'Le téléphone de livraison est obligatoire.',
            'telephone_livraison.string' => 'Le téléphone de livraison doit être une chaîne de caractères.',
            'telephone_livraison.max' => 'Le téléphone de livraison ne peut pas dépasser 20 caractères.',
            
            'adresse_livraison.required' => 'L\'adresse de livraison est obligatoire.',
            'adresse_livraison.string' => 'L\'adresse de livraison doit être une chaîne de caractères.',
            'adresse_livraison.max' => 'L\'adresse de livraison ne peut pas dépasser 500 caractères.',
            
            'instructions_livraison.string' => 'Les instructions de livraison doivent être une chaîne de caractères.',
            'instructions_livraison.max' => 'Les instructions de livraison ne peuvent pas dépasser 1000 caractères.',
            
            // Mode et date de livraison
            'mode_livraison.required' => 'Le mode de livraison est obligatoire.',
            'mode_livraison.in' => 'Le mode de livraison doit être : domicile, magasin ou point_relais.',
            
            'date_livraison_prevue.date' => 'La date de livraison prévue doit être une date valide.',
            'date_livraison_prevue.after' => 'La date de livraison prévue doit être dans le futur.',
            
            // Notes
            'notes_client.string' => 'Les notes du client doivent être une chaîne de caractères.',
            'notes_client.max' => 'Les notes du client ne peuvent pas dépasser 1000 caractères.',
            
            'notes_admin.string' => 'Les notes administratives doivent être une chaîne de caractères.',
            'notes_admin.max' => 'Les notes administratives ne peuvent pas dépasser 1000 caractères.',
            
            // Priorité
            'priorite.required' => 'La priorité est obligatoire.',
            'priorite.in' => 'La priorité doit être : normale, urgente ou tres_urgente.',
            
            // Cadeau
            'est_cadeau.boolean' => 'Le statut cadeau doit être vrai ou faux.',
            'message_cadeau.string' => 'Le message cadeau doit être une chaîne de caractères.',
            'message_cadeau.max' => 'Le message cadeau ne peut pas dépasser 500 caractères.',
            
            // Code promo
            'code_promo.string' => 'Le code promo doit être une chaîne de caractères.',
            'code_promo.max' => 'Le code promo ne peut pas dépasser 20 caractères.',
            
            // Montants
            'frais_livraison.required' => 'Les frais de livraison sont obligatoires.',
            'frais_livraison.numeric' => 'Les frais de livraison doivent être un nombre.',
            'frais_livraison.min' => 'Les frais de livraison ne peuvent pas être négatifs.',
            'frais_livraison.max' => 'Les frais de livraison ne peuvent pas dépasser 50 000.',
            
            'remise.numeric' => 'La remise doit être un nombre.',
            'remise.min' => 'La remise ne peut pas être négative.',
            'remise.max' => 'La remise ne peut pas dépasser 1 000 000.',
            
            // Articles
            'articles.required' => 'Au moins un article est requis.',
            'articles.array' => 'Les articles doivent être un tableau.',
            'articles.min' => 'Au moins un article est requis.',
            
            'articles.*.produit_id.required' => 'L\'ID du produit est obligatoire.',
            'articles.*.produit_id.integer' => 'L\'ID du produit doit être un nombre entier.',
            'articles.*.produit_id.exists' => 'Le produit sélectionné n\'existe pas.',
            
            'articles.*.quantite.required' => 'La quantité est obligatoire.',
            'articles.*.quantite.integer' => 'La quantité doit être un nombre entier.',
            'articles.*.quantite.min' => 'La quantité doit être d\'au moins 1.',
            'articles.*.quantite.max' => 'La quantité ne peut pas dépasser 100.',
            
            'articles.*.prix_unitaire.required' => 'Le prix unitaire est obligatoire.',
            'articles.*.prix_unitaire.numeric' => 'Le prix unitaire doit être un nombre.',
            'articles.*.prix_unitaire.min' => 'Le prix unitaire ne peut pas être négatif.',
            
            'articles.*.personnalisations.json' => 'Les personnalisations doivent être au format JSON valide.',
        ];
    }

    /**
     * Préparer les données pour la validation
     */
    protected function prepareForValidation(): void
    {
        $this->merge([
            'est_cadeau' => $this->boolean('est_cadeau', false),
            'frais_livraison' => (float) ($this->input('frais_livraison') ?? 0),
            'remise' => (float) ($this->input('remise') ?? 0),
        ]);

        // Nettoyer les articles
        if ($this->has('articles') && is_array($this->input('articles'))) {
            $articles = [];
            foreach ($this->input('articles') as $article) {
                if (isset($article['produit_id']) && isset($article['quantite']) && isset($article['prix_unitaire'])) {
                    $articles[] = [
                        'produit_id' => (int) $article['produit_id'],
                        'quantite' => (int) $article['quantite'],
                        'prix_unitaire' => (float) $article['prix_unitaire'],
                        'personnalisations' => $article['personnalisations'] ?? null
                    ];
                }
            }
            $this->merge(['articles' => $articles]);
        }
    }

    /**
     * Personnaliser la réponse en cas d'échec de validation
     */
    protected function failedValidation(Validator $validator)
    {
        if ($this->expectsJson()) {
            throw new HttpResponseException(
                response()->json([
                    'success' => false,
                    'message' => 'Erreurs de validation',
                    'errors' => $validator->errors()
                ], 422)
            );
        }

        parent::failedValidation($validator);
    }

    /**
     * Validation personnalisée
     */
    public function withValidator(Validator $validator): void
    {
        $validator->after(function (Validator $validator) {
            // Vérifier la cohérence des articles
            if ($this->has('articles')) {
                $sousTotal = 0;
                foreach ($this->input('articles') as $index => $article) {
                    if (isset($article['quantite']) && isset($article['prix_unitaire'])) {
                        $sousTotal += $article['quantite'] * $article['prix_unitaire'];
                    }
                }

                // Calculer le total
                $fraisLivraison = (float) $this->input('frais_livraison', 0);
                $remise = (float) $this->input('remise', 0);
                $total = $sousTotal + $fraisLivraison - $remise;

                if ($total < 0) {
                    $validator->errors()->add('remise', 'La remise ne peut pas être supérieure au montant de la commande.');
                }

                // Vérifier que les quantités demandées sont disponibles en stock
                foreach ($this->input('articles') as $index => $article) {
                    if (isset($article['produit_id']) && isset($article['quantite'])) {
                        $produit = \App\Models\Produit::find($article['produit_id']);
                        if ($produit && $produit->gestion_stock && $produit->stock_disponible < $article['quantite']) {
                            $validator->errors()->add(
                                "articles.{$index}.quantite",
                                "Stock insuffisant pour le produit {$produit->nom}. Stock disponible: {$produit->stock_disponible}"
                            );
                        }
                    }
                }
            }

            // Vérifier la cohérence cadeau/message
            if ($this->boolean('est_cadeau') && !$this->input('message_cadeau')) {
                $validator->errors()->add('message_cadeau', 'Un message cadeau est requis si la commande est un cadeau.');
            }
        });
    }
}