<?php
// ================================================================
// 📝 CRÉER ADMIN SEEDER
// ================================================================

// Commande à exécuter d'abord :
// php artisan make:seeder AdminUserSeeder

// ================================================================
// FICHIER: database/seeders/AdminUserSeeder.php
// ================================================================

namespace Database\Seeders;

use App\Models\User;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;

class AdminUserSeeder extends Seeder
{
    public function run(): void
    {
        // Créer l'utilisateur admin principal
        User::updateOrCreate(
            ['email' => 'admin@vivias-shop.com'],
            [
                'name' => 'Amina ',
                'email' => 'admin@vivias-shop.com',
                'password' => Hash::make('amina123'),
                'telephone' => '+221771397393',
                'role' => 'admin',
                'statut' => 'actif',
                'nombre_connexions' => 0,
                'email_verified_at' => now(),
            ]
        );

        // Créer un deuxième admin (votre amie)
        User::updateOrCreate(
            ['email' => 'diopbirame8@gmail.com'],
            [
                'name' => 'Birame Diop',
                'email' => 'diopbirame8@gmail.com',
                'password' => Hash::make('vivias2024'),
                'telephone' => '+221771397393',
                'role' => 'admin',
                'statut' => 'actif',
                'nombre_connexions' => 0,
                'email_verified_at' => now(),
            ]
        );

        echo "✅ Utilisateurs admin créés avec succès !\n";
        echo "📧 admin@vivias-shop.com / amina123\n";
        echo "📧 diopbirame8@gmail.com / vivias2024\n";
    }
}