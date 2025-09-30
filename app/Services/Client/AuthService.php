<?php
namespace App\Services\Client;

use App\Models\Client;
use App\Models\User;
use App\Models\MesureClient;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Str;
use Laravel\Sanctum\PersonalAccessToken;

class AuthService
{
    public function register(array $data): array
    {
        try {
            // Vérifier si l'email existe déjà
            if (User::where('email', $data['email'])->exists()) {
                return ['success' => false, 'message' => 'Cet email est déjà utilisé'];
            }

            // Vérifier si le téléphone existe déjà
            if (Client::where('telephone', $data['telephone'])->exists()) {
                return ['success' => false, 'message' => 'Ce numéro de téléphone est déjà utilisé'];
            }

            DB::beginTransaction();

            // Créer l'utilisateur
            $user = User::create([
                'name' => $data['prenom'] . ' ' . $data['nom'],
                'email' => $data['email'],
                'password' => Hash::make($data['password']),
                'role' => 'client',
                'statut' => 'actif'
            ]);

            // Créer le profil client
            $client = Client::create([
                'nom' => $data['nom'],
                'prenom' => $data['prenom'],
                'telephone' => $data['telephone'],
                'email' => $data['email'],
                'ville' => $data['ville'] ?? 'Dakar',
                'adresse_principale' => $data['adresse'] ?? null,
                'user_id' => $user->id,
                'type_client' => 'particulier',
                'accepte_whatsapp' => $data['accepte_whatsapp'] ?? true,
                'accepte_email' => $data['accepte_email'] ?? true,
                'accepte_promotions' => $data['accepte_promotions'] ?? true
            ]);

            // Générer le token
            $token = $user->createToken('vivias_client_token')->plainTextToken;

            DB::commit();

            return [
                'success' => true,
                'message' => 'Inscription réussie',
                'data' => [
                    'user' => [
                        'id' => $user->id,
                        'name' => $user->name,
                        'email' => $user->email
                    ],
                    'client' => [
                        'id' => $client->id,
                        'nom' => $client->nom,
                        'prenom' => $client->prenom,
                        'telephone' => $client->telephone,
                        'ville' => $client->ville
                    ],
                    'token' => $token
                ]
            ];

        } catch (\Exception $e) {
            DB::rollback();
            return ['success' => false, 'message' => 'Erreur lors de l\'inscription'];
        }
    }

    public function login(string $email, string $password): array
    {
        $user = User::where('email', $email)
            ->where('role', 'client')
            ->where('statut', 'actif')
            ->first();

        if (!$user || !Hash::check($password, $user->password)) {
            return ['success' => false, 'message' => 'Identifiants incorrects'];
        }

        $client = Client::where('user_id', $user->id)->first();

        if (!$client) {
            return ['success' => false, 'message' => 'Profil client non trouvé'];
        }

        // Révoquer les anciens tokens
        $user->tokens()->delete();

        // Créer un nouveau token
        $token = $user->createToken('vivias_client_token')->plainTextToken;

        // Mettre à jour les stats de connexion
        $user->update([
            'derniere_connexion' => now(),
            'nombre_connexions' => $user->nombre_connexions + 1
        ]);

        $client->update(['derniere_visite' => now()]);

        return [
            'success' => true,
            'message' => 'Connexion réussie',
            'data' => [
                'user' => [
                    'id' => $user->id,
                    'name' => $user->name,
                    'email' => $user->email
                ],
                'client' => [
                    'id' => $client->id,
                    'nom' => $client->nom,
                    'prenom' => $client->prenom,
                    'telephone' => $client->telephone,
                    'ville' => $client->ville,
                    'type_client' => $client->type_client,
                    'score_fidelite' => $client->score_fidelite
                ],
                'token' => $token
            ]
        ];
    }

    public function guestCheckout(array $data): array
    {
        // Pour les commandes invités, on crée un client temporaire
        try {
            $client = Client::create([
                'nom' => $data['nom'],
                'prenom' => $data['prenom'],
                'telephone' => $data['telephone'],
                'email' => $data['email'] ?? null,
                'ville' => $data['ville'],
                'adresse_principale' => $data['adresse'],
                'type_client' => 'invite',
                'accepte_whatsapp' => $data['accepte_whatsapp'] ?? true
            ]);

            return [
                'success' => true,
                'message' => 'Informations enregistrées',
                'data' => [
                    'client' => [
                        'id' => $client->id,
                        'nom' => $client->nom,
                        'prenom' => $client->prenom,
                        'telephone' => $client->telephone,
                        'email' => $client->email,
                        'ville' => $client->ville,
                        'adresse' => $client->adresse_principale
                    ]
                ]
            ];

        } catch (\Exception $e) {
            return ['success' => false, 'message' => 'Erreur lors de l\'enregistrement'];
        }
    }

    public function logout(): array
    {
        $user = Auth::user();
        
        if ($user) {
            $user->currentAccessToken()->delete();
        }

        return ['success' => true, 'message' => 'Déconnexion réussie'];
    }

    public function getProfile(): array
    {
        $user = Auth::user();
        $client = Client::where('user_id', $user->id)->first();

        if (!$client) {
            return ['success' => false, 'message' => 'Profil non trouvé'];
        }

        $mesures = MesureClient::where('client_id', $client->id)->first();

        return [
            'success' => true,
            'data' => [
                'user' => [
                    'id' => $user->id,
                    'name' => $user->name,
                    'email' => $user->email
                ],
                'client' => [
                    'id' => $client->id,
                    'nom' => $client->nom,
                    'prenom' => $client->prenom,
                    'telephone' => $client->telephone,
                    'email' => $client->email,
                    'ville' => $client->ville,
                    'adresse_principale' => $client->adresse_principale,
                    'date_naissance' => $client->date_naissance,
                    'genre' => $client->genre,
                    'type_client' => $client->type_client,
                    'score_fidelite' => $client->score_fidelite,
                    'nombre_commandes' => $client->nombre_commandes,
                    'total_depense' => $client->total_depense,
                    'preferences' => [
                        'accepte_whatsapp' => $client->accepte_whatsapp,
                        'accepte_email' => $client->accepte_email,
                        'accepte_promotions' => $client->accepte_promotions
                    ]
                ],
                'mesures' => $mesures ? $mesures->getMesuresRemplies() : null
            ]
        ];
    }

    public function updateProfile(array $data): array
    {
        try {
            $user = Auth::user();
            $client = Client::where('user_id', $user->id)->first();

            DB::beginTransaction();

            // Mettre à jour l'utilisateur
            $user->update([
                'name' => $data['prenom'] . ' ' . $data['nom'],
                'email' => $data['email']
            ]);

            // Mettre à jour le client
            $client->update([
                'nom' => $data['nom'],
                'prenom' => $data['prenom'],
                'telephone' => $data['telephone'],
                'email' => $data['email'],
                'ville' => $data['ville'],
                'adresse_principale' => $data['adresse'] ?? $client->adresse_principale,
                'date_naissance' => $data['date_naissance'] ?? $client->date_naissance,
                'genre' => $data['genre'] ?? $client->genre,
                'accepte_whatsapp' => $data['accepte_whatsapp'] ?? $client->accepte_whatsapp,
                'accepte_email' => $data['accepte_email'] ?? $client->accepte_email,
                'accepte_promotions' => $data['accepte_promotions'] ?? $client->accepte_promotions
            ]);

            DB::commit();

            return ['success' => true, 'message' => 'Profil mis à jour avec succès'];

        } catch (\Exception $e) {
            DB::rollback();
            return ['success' => false, 'message' => 'Erreur lors de la mise à jour'];
        }
    }

    public function saveMeasurements(array $data): array
    {
        try {
            $user = Auth::user();
            $client = Client::where('user_id', $user->id)->first();

            $mesures = MesureClient::updateOrCreate(
                ['client_id' => $client->id],
                array_merge($data, [
                    'date_prise_mesures' => now(),
                    'mesures_valides' => true
                ])
            );

            return [
                'success' => true,
                'message' => 'Mesures enregistrées avec succès',
                'data' => $mesures->getMesuresRemplies()
            ];

        } catch (\Exception $e) {
            return ['success' => false, 'message' => 'Erreur lors de l\'enregistrement des mesures'];
        }
    }
}