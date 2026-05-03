<?php

namespace Database\Seeders;

use App\Models\Client;
use App\Models\User;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;

class AdminUserSeeder extends Seeder
{
    public function run(): void
    {
        User::updateOrCreate(
            ['email' => 'admin@vivias.com'],
            [
                'name' => 'VIVIAS Admin',
                'email' => 'admin@vivias.com',
                'password' => Hash::make('password'),
                'telephone' => '+221770000000',
                'role' => 'admin',
                'statut' => 'actif',
                'nombre_connexions' => 0,
                'email_verified_at' => now(),
            ]
        );

        $clientUser = User::updateOrCreate(
            ['email' => 'client@vivias.com'],
            [
                'name' => 'Client Demo',
                'email' => 'client@vivias.com',
                'password' => Hash::make('password'),
                'telephone' => '+221770000001',
                'role' => 'client',
                'statut' => 'actif',
                'nombre_connexions' => 0,
                'email_verified_at' => now(),
            ]
        );

        Client::updateOrCreate(
            ['email' => 'client@vivias.com'],
            [
                'user_id' => $clientUser->id,
                'nom' => 'Demo',
                'prenom' => 'Client',
                'telephone' => '+221770000001',
                'ville' => 'Dakar',
                'adresse_principale' => 'Dakar',
                'type_client' => 'nouveau',
                'accepte_whatsapp' => true,
                'accepte_email' => true,
                'accepte_promotions' => true,
            ]
        );

        $this->command?->info('Default users ready: admin@vivias.com / password, client@vivias.com / password');
    }
}
