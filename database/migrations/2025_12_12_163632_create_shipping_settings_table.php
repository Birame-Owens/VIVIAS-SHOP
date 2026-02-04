<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::create('shipping_settings', function (Blueprint $table) {
            $table->id();
            $table->decimal('default_cost', 10, 2)->default(2500); // Frais par défaut
            $table->decimal('free_threshold', 10, 2)->default(50000); // Seuil livraison gratuite
            $table->boolean('is_enabled')->default(true); // Activer/désactiver livraison
            $table->timestamps();
        });

        // Insérer les paramètres par défaut
        DB::table('shipping_settings')->insert([
            'default_cost' => 2500,
            'free_threshold' => 50000,
            'is_enabled' => true,
            'created_at' => now(),
            'updated_at' => now(),
        ]);
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('shipping_settings');
    }
};
