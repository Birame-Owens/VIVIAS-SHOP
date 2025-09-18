

<?php
// ================================================================
// 📝 MIGRATION 10: creer_table_tissus
// ================================================================
// Fichier: 2025_09_12_183317_creer_table_tissus.php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up()
    {
        Schema::create('tissus', function (Blueprint $table) {
            $table->id();
            
            // Informations de base
            $table->string('nom'); // Wax Vlisco, Bazin Riche, Coton, etc.
            $table->string('reference')->unique(); // REF-WAX-001
            $table->text('description')->nullable();
            $table->string('couleur_principale'); // Rouge, Bleu, Multicolore
            $table->json('couleurs_secondaires')->nullable(); // ["Jaune", "Vert"]
            
            // Caractéristiques techniques
            $table->enum('type_tissu', [
                'wax',              // Wax africain
                'bazin',            // Bazin riche
                'coton',            // Coton simple
                'soie',             // Soie
                'satin',            // Satin
                'dentelle',         // Dentelle
                'voile',            // Voile
                'autres'            // Autres types
            ]);
            
            $table->decimal('largeur_metres', 5, 2)->default(1.20); // Largeur standard
            $table->string('motif')->nullable(); // Géométrique, Floral, Uni, etc.
            $table->enum('qualite', ['premium', 'standard', 'economique'])->default('standard');
            
            // Gestion stock et coûts (IMPORTANT pour business)
            $table->decimal('quantite_metres', 8, 2)->default(0); // Stock en mètres
            $table->decimal('prix_achat_metre', 8, 2); // Prix d'achat par mètre
            $table->decimal('prix_vente_metre', 8, 2); // Prix de vente par mètre
            $table->decimal('marge_beneficiaire', 5, 2)->default(0); // Marge en pourcentage
            
            // Alertes stock (DASHBOARD admin)
            $table->integer('seuil_alerte_metres')->default(10); // Alerte stock bas
            $table->integer('stock_minimum')->default(5); // Stock minimum à maintenir
            $table->integer('stock_maximum')->default(100); // Stock maximum
            
            // Fournisseur et approvisionnement
            $table->string('fournisseur')->nullable(); // Nom du fournisseur
            $table->string('telephone_fournisseur')->nullable();
            $table->text('adresse_fournisseur')->nullable();
            $table->integer('delai_livraison_jours')->default(7); // Délai de réappro
            $table->decimal('quantite_commande_optimale', 8, 2)->nullable(); // Quantité optimale à commander
            
            // Utilisation et popularité
            $table->integer('nombre_utilisations')->default(0); // Combien de fois utilisé
            $table->decimal('metres_vendus_total', 10, 2)->default(0); // Total vendu
            $table->boolean('est_populaire')->default(false); // Tissu populaire
            $table->boolean('est_nouveaute')->default(false); // Nouveau tissu
            
            // Gestion affichage
            $table->string('image')->nullable(); // Photo du tissu
            $table->boolean('est_disponible')->default(true); // Disponible à la vente
            $table->boolean('est_visible_client')->default(true); // Visible pour clients
            $table->integer('ordre_affichage')->default(0);
            
            // Saisons et occasions
            $table->json('saisons_recommandees')->nullable(); // ["été", "hiver"]
            $table->json('occasions_recommandees')->nullable(); // ["mariage", "bureau", "fête"]
            
            // Notes admin (pour votre amie)
            $table->text('notes_admin')->nullable(); // Notes privées
            $table->enum('evaluation_qualite', ['excellent', 'bon', 'moyen', 'faible'])->default('bon');
            
            $table->timestamps();
            $table->softDeletes();
            
            // Index pour performance
            $table->index(['type_tissu', 'est_disponible']);
            $table->index(['quantite_metres', 'seuil_alerte_metres']); // Pour alertes stock
            $table->index('reference');
            $table->fullText(['nom', 'description', 'couleur_principale']); // Recherche
        });
    }

    public function down()
    {
        Schema::dropIfExists('tissus');
    }
};