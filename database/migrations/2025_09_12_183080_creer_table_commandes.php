<?php
// ================================================================
// 📝 MIGRATION 6: creer_table_commandes (SYSTÈME DE COMMANDES)
// ================================================================
// Fichier: 2025_09_12_183230_creer_table_commandes.php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up()
    {
        Schema::create('commandes', function (Blueprint $table) {
            $table->id();
            
            // Identification commande
            $table->string('numero_commande')->unique(); // CMD-2024-001
            $table->foreignId('client_id')->constrained('clients');
            
            // Montants financiers (XOF)
            $table->decimal('sous_total', 12, 2); // Avant taxes et frais
            $table->decimal('frais_livraison', 8, 2)->default(2000); // Frais livraison standard
            $table->decimal('remise', 10, 2)->default(0); // Remise appliquée
            $table->decimal('montant_tva', 10, 2)->default(0); // TVA 18%
            $table->decimal('montant_total', 12, 2); // Total final
            
            // Statut de la commande (WORKFLOW SIMPLE pour votre amie)
            $table->enum('statut', [
                'en_attente',       // Commande reçue, en attente paiement
                'confirmee',        // Paiement reçu, commande confirmée
                'en_production',    // En cours de confection
                'prete',           // Prête à livrer/récupérer
                'livree',          // Livrée au client
                'annulee',         // Annulée
                'retournee'        // Retournée par le client
            ])->default('en_attente');
            
            // Dates importantes (SUIVI pour admin)
            $table->timestamp('date_confirmation')->nullable();
            $table->timestamp('date_debut_production')->nullable();
            $table->timestamp('date_fin_production')->nullable();
            $table->timestamp('date_livraison_prevue')->nullable();
            $table->timestamp('date_livraison_reelle')->nullable();
            
            // Informations livraison
            $table->text('adresse_livraison');
            $table->string('telephone_livraison');
            $table->string('nom_destinataire');
            $table->text('instructions_livraison')->nullable();
            $table->enum('mode_livraison', ['domicile', 'boutique', 'point_relais'])->default('domicile');
            
            // Communication client
            $table->text('notes_client')->nullable(); // Demandes spéciales du client
            $table->text('notes_admin')->nullable(); // Notes privées admin
            $table->text('notes_production')->nullable(); // Notes pour les tailleurs
            
            // Origine et canal
            $table->enum('source', ['site_web', 'whatsapp', 'telephone', 'boutique', 'facebook'])->default('site_web');
            $table->string('code_promo')->nullable(); // Code promo utilisé
            
            // Urgence et priorité (GESTION pour votre amie)
            $table->enum('priorite', ['normale', 'urgente', 'tres_urgente'])->default('normale');
            $table->boolean('est_cadeau')->default(false); // Commande cadeau
            $table->text('message_cadeau')->nullable();
            
            // Satisfaction client
            $table->integer('note_satisfaction')->nullable(); // Note sur 5
            $table->text('commentaire_satisfaction')->nullable();
            
            $table->timestamps();
            $table->softDeletes();
            
            // Index pour performance et recherche
            $table->index(['statut', 'created_at']);
            $table->index(['client_id', 'statut']);
            $table->index('numero_commande');
            $table->index(['date_livraison_prevue', 'statut']);
        });
    }

    public function down()
    {
        Schema::dropIfExists('commandes');
    }
};