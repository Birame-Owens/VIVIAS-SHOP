<?php

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;
use App\Http\Controllers\Api\Admin\AuthController;
use App\Http\Controllers\Api\Admin\DashboardController;
use App\Http\Controllers\Api\Admin\CategoryController;
use App\Http\Controllers\Api\Admin\ProduitController;
use App\Http\Controllers\Api\Admin\CommandeController; 
use App\Http\Controllers\Api\Admin\ClientController;
use App\Http\Controllers\Api\Admin\PaiementController;
use App\Http\Controllers\Api\Admin\PromotionController;
use App\Http\Controllers\Api\Admin\AvisClientController;

Route::get('/user', function (Request $request) {
    return $request->user();
})->middleware('auth:sanctum');

// Routes admin
Route::prefix('admin')->group(function () {
    // Authentification (sans middleware)
    Route::post('/login', [AuthController::class, 'login']);
    Route::post('/logout', [AuthController::class, 'logout']);

    // Routes protégées
    Route::middleware(['auth:sanctum', 'admin.auth'])->group(function () {
        Route::get('/user', [AuthController::class, 'user']);
        Route::get('/check', [AuthController::class, 'check']);
        Route::post('/refresh', [AuthController::class, 'refresh']);

        // Dashboard
        Route::get('/dashboard', [DashboardController::class, 'index'])->name('admin.api.dashboard');
        Route::get('/dashboard/quick-stats', [DashboardController::class, 'quickStats'])->name('admin.api.dashboard.quick-stats');

        // Catégories - Routes RESTful complètes
        Route::apiResource('categories', CategoryController::class);
        Route::get('/categories/options', [CategoryController::class, 'options'])->name('admin.api.categories.options');
        Route::post('/categories/{category}/toggle-status', [CategoryController::class, 'toggleStatus'])->name('admin.api.categories.toggle-status');

        // Produits - Routes RESTful complètes
        Route::apiResource('produits', ProduitController::class);
        Route::post('/produits/{produit}/toggle-status', [ProduitController::class, 'toggleStatus'])->name('admin.api.produits.toggle-status');
        Route::post('/produits/{produit}/duplicate', [ProduitController::class, 'duplicate'])->name('admin.api.produits.duplicate');
        Route::delete('/produits/{produit}/images/{image}', [ProduitController::class, 'deleteImage'])->name('admin.api.produits.delete-image');
        Route::post('/produits/{produit}/images/order', [ProduitController::class, 'updateImagesOrder'])->name('admin.api.produits.update-images-order');

        // Commandes - Routes RESTful complètes
        Route::get('/commandes/stats', [CommandeController::class, 'stats'])->name('admin.api.commandes.stats'); // ← DÉPLACER AVANT apiResource
        Route::apiResource('commandes', CommandeController::class);
        Route::post('/commandes/{commande}/update-status', [CommandeController::class, 'updateStatus'])->name('admin.api.commandes.update-status');
        Route::post('/commandes/{commande}/update-date-livraison', [CommandeController::class, 'updateDateLivraison'])->name('admin.api.commandes.update-date-livraison');
        Route::post('/commandes/{commande}/cancel', [CommandeController::class, 'cancel'])->name('admin.api.commandes.cancel');

        // Clients - Routes RESTful complètes
        Route::get('/clients/stats', [ClientController::class, 'stats'])->name('admin.api.clients.stats');
        Route::get('/clients/vip', [ClientController::class, 'vipClients'])->name('admin.api.clients.vip');
        Route::get('/clients/inactive', [ClientController::class, 'inactiveClients'])->name('admin.api.clients.inactive');
        Route::get('/clients/search', [ClientController::class, 'search'])->name('admin.api.clients.search');
        
        Route::apiResource('clients', ClientController::class);
        
        // WhatsApp et notifications
        Route::post('/clients/{client}/send-whatsapp', [ClientController::class, 'sendWhatsApp'])->name('admin.api.clients.send-whatsapp');
        Route::post('/clients/send-novelty-notification', [ClientController::class, 'sendNoveltyNotification'])->name('admin.api.clients.send-novelty');

        // Paiements - Routes RESTful complètes
        Route::get('/paiements/stats', [PaiementController::class, 'stats'])->name('admin.api.paiements.stats');
        Route::get('/paiements/payment-methods', [PaiementController::class, 'paymentMethods'])->name('admin.api.paiements.payment-methods');
        
        Route::apiResource('paiements', PaiementController::class);
        
        // Actions spécifiques sur les paiements
        Route::post('/paiements/{paiement}/confirm', [PaiementController::class, 'confirm'])->name('admin.api.paiements.confirm');
        Route::post('/paiements/{paiement}/reject', [PaiementController::class, 'reject'])->name('admin.api.paiements.reject');
        Route::post('/paiements/{paiement}/refund', [PaiementController::class, 'refund'])->name('admin.api.paiements.refund');
        Route::get('/paiements/{paiement}/check-status', [PaiementController::class, 'checkStatus'])->name('admin.api.paiements.check-status');
        
        // Webhooks pour les paiements (à placer avant les routes protégées si nécessaire)
        Route::post('/paiements/webhook/wave', [PaiementController::class, 'webhookWave'])->name('admin.api.paiements.webhook.wave');
        Route::post('/paiements/webhook/orange-money', [PaiementController::class, 'webhookOrangeMoney'])->name('admin.api.paiements.webhook.orange-money');

        // À ajouter dans routes/api.php - section admin

// Promotions - Routes RESTful complètes
        Route::get('/promotions/stats', [PromotionController::class, 'stats'])->name('admin.api.promotions.stats');
        Route::get('/promotions/options', [PromotionController::class, 'options'])->name('admin.api.promotions.options');
        Route::post('/promotions/validate-code', [PromotionController::class, 'validateCode'])->name('admin.api.promotions.validate-code');

        Route::apiResource('promotions', PromotionController::class);

// Actions spécifiques sur les promotions
       Route::post('/promotions/{promotion}/toggle-status', [PromotionController::class, 'toggleStatus'])->name('admin.api.promotions.toggle-status');
       Route::post('/promotions/{promotion}/duplicate', [PromotionController::class, 'duplicate'])->name('admin.api.promotions.duplicate');


       // Avis Clients - Gestion Admin uniquement
Route::get('/avis-clients/stats', [AvisClientController::class, 'stats'])->name('admin.api.avis-clients.stats');
Route::get('/avis-clients/options', [AvisClientController::class, 'options'])->name('admin.api.avis-clients.options');
Route::get('/avis-clients/en-attente', [AvisClientController::class, 'enAttente'])->name('admin.api.avis-clients.en-attente');

Route::apiResource('avis-clients', AvisClientController::class)->only(['index', 'show', 'destroy']);

// Actions de modération admin
Route::post('/avis-clients/{avis}/moderer', [AvisClientController::class, 'moderer'])->name('admin.api.avis-clients.moderer');
Route::post('/avis-clients/{avis}/repondre', [AvisClientController::class, 'repondre'])->name('admin.api.avis-clients.repondre');
Route::post('/avis-clients/{avis}/toggle-mise-en-avant', [AvisClientController::class, 'toggleMiseEnAvant'])->name('admin.api.avis-clients.toggle-mise-en-avant');
Route::post('/avis-clients/{avis}/toggle-verifie', [AvisClientController::class, 'toggleVerifie'])->name('admin.api.avis-clients.toggle-verifie');





    });
});