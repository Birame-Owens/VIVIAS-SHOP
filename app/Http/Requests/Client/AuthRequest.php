<?php

namespace App\Http\Requests\Client;

use Illuminate\Foundation\Http\FormRequest;

class AuthRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true; // Autoriser toutes les requêtes
    }

    public function rules(): array
    {
        $rules = [];

        // Déterminer le type de requête basé sur la route
        $route = $this->route()->getName();
        $method = $this->method();
        $path = $this->path();

        // INSCRIPTION
        if ($this->isMethod('POST') && str_contains($path, 'register')) {
            $rules = [
                'nom' => 'required|string|max:100',
                'prenom' => 'required|string|max:100',
                'email' => 'required|email|unique:users,email',
                'password' => 'required|string|min:6',
                'password_confirmation' => 'required|same:password',
                'telephone' => 'required|string|max:20|unique:clients,telephone',
                'ville' => 'nullable|string|max:100',
                'adresse' => 'nullable|string',
                'accepte_conditions' => 'required|accepted',
                'accepte_whatsapp' => 'nullable|boolean',
                'accepte_email' => 'nullable|boolean',
                'accepte_promotions' => 'nullable|boolean',
            ];
        }

        // CONNEXION
        if ($this->isMethod('POST') && str_contains($path, 'login')) {
            $rules = [
                'email' => 'required|email',
                'password' => 'required|string',
            ];
        }

        // GUEST CHECKOUT
        if ($this->isMethod('POST') && str_contains($path, 'guest-checkout')) {
            $rules = [
                'nom' => 'required|string|max:100',
                'prenom' => 'required|string|max:100',
                'telephone' => 'required|string|max:20',
                'email' => 'nullable|email',
                'ville' => 'required|string|max:100',
                'adresse' => 'required|string',
                'accepte_whatsapp' => 'nullable|boolean',
            ];
        }

        // MISE À JOUR PROFIL
        if ($this->isMethod('PUT') && str_contains($path, 'profile')) {
            $userId = auth()->id();
            $rules = [
                'nom' => 'required|string|max:100',
                'prenom' => 'required|string|max:100',
                'email' => 'required|email|unique:users,email,' . $userId,
                'telephone' => 'required|string|max:20',
                'ville' => 'required|string|max:100',
                'adresse' => 'nullable|string',
                'date_naissance' => 'nullable|date',
                'genre' => 'nullable|in:homme,femme',
                'accepte_whatsapp' => 'nullable|boolean',
                'accepte_email' => 'nullable|boolean',
                'accepte_promotions' => 'nullable|boolean',
            ];
        }

        // MESURES
        if ($this->isMethod('POST') && str_contains($path, 'measurements')) {
            $rules = [
                // Mesures générales
                'hauteur' => 'nullable|numeric|min:0',
                'poids' => 'nullable|numeric|min:0',
                
                // Mesures homme
                'tour_cou' => 'nullable|numeric|min:0',
                'tour_poitrine' => 'nullable|numeric|min:0',
                'tour_taille' => 'nullable|numeric|min:0',
                'tour_hanches' => 'nullable|numeric|min:0',
                'longueur_bras' => 'nullable|numeric|min:0',
                'longueur_jambe' => 'nullable|numeric|min:0',
                'epaule' => 'nullable|numeric|min:0',
                
                // Mesures femme
                'tour_dessous_poitrine' => 'nullable|numeric|min:0',
                'longueur_robe' => 'nullable|numeric|min:0',
                'tour_cuisse' => 'nullable|numeric|min:0',
            ];
        }

        return $rules;
    }

    public function messages(): array
    {
        return [
            'nom.required' => 'Le nom est obligatoire',
            'prenom.required' => 'Le prénom est obligatoire',
            'email.required' => 'L\'email est obligatoire',
            'email.email' => 'L\'email doit être valide',
            'email.unique' => 'Cet email est déjà utilisé',
            'password.required' => 'Le mot de passe est obligatoire',
            'password.min' => 'Le mot de passe doit contenir au moins 6 caractères',
            'password_confirmation.required' => 'La confirmation du mot de passe est obligatoire',
            'password_confirmation.same' => 'Les mots de passe ne correspondent pas',
            'telephone.required' => 'Le téléphone est obligatoire',
            'telephone.unique' => 'Ce numéro de téléphone est déjà utilisé',
            'ville.required' => 'La ville est obligatoire',
            'adresse.required' => 'L\'adresse est obligatoire',
            'accepte_conditions.required' => 'Vous devez accepter les conditions d\'utilisation',
            'accepte_conditions.accepted' => 'Vous devez accepter les conditions d\'utilisation',
        ];
    }
}