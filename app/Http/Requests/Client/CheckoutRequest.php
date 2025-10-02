<?php

namespace App\Http\Requests\Client;

use Illuminate\Foundation\Http\FormRequest;

class CheckoutRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'payment_method' => 'required|in:wave,orange,free,stripe,delivery',
            'delivery_info' => 'required|array',
            'delivery_info.nom' => 'required|string|max:100',
            'delivery_info.prenom' => 'required|string|max:100',
            'delivery_info.telephone' => 'required|string|max:20',
            'delivery_info.email' => 'nullable|email',
            'delivery_info.adresse' => 'required|string',
            'delivery_info.ville' => 'required|string|max:100',
            'delivery_info.quartier' => 'nullable|string|max:100',
            'delivery_info.indications' => 'nullable|string'
        ];
    }

    public function messages(): array
    {
        return [
            'payment_method.required' => 'Veuillez choisir une méthode de paiement',
            'delivery_info.nom.required' => 'Le nom est obligatoire',
            'delivery_info.prenom.required' => 'Le prénom est obligatoire',
            'delivery_info.telephone.required' => 'Le téléphone est obligatoire',
            'delivery_info.adresse.required' => 'L\'adresse est obligatoire',
            'delivery_info.ville.required' => 'La ville est obligatoire'
        ];
    }
}