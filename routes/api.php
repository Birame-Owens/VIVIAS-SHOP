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
use App\Http\Controllers\Api\Admin\RapportController;

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
        Route::get('/dashboard', [DashboardController::class, 'index']);
        Route::get('/dashboard/quick-stats', [DashboardController::class, 'quickStats']);

        // =================== SYSTÈME DE RAPPORTS ===================
        
        // Liste et informations générales des rapports
        Route::get('/rapports', [RapportController::class, 'index']);
        Route::get('/rapports/dashboard', [RapportController::class, 'dashboard']);
        Route::get('/rapports/alertes', [RapportController::class, 'alertes']);
        Route::get('/rapports/tendances', [RapportController::class, 'tendances']);
        
        // Rapports spécifiques par type
        Route::get('/rapports/ventes', [RapportController::class, 'ventes']);
        Route::get('/rapports/produits', [RapportController::class, 'produits']);
        Route::get('/rapports/clients', [RapportController::class, 'clients']);
        Route::get('/rapports/financier', [RapportController::class, 'financier']);
        Route::get('/rapports/stock', [RapportController::class, 'stock']);
        Route::get('/rapports/commandes', [RapportController::class, 'commandes']);
        Route::get('/rapports/tailleurs', [RapportController::class, 'tailleurs']);
        Route::get('/rapports/tissus', [RapportController::class, 'tissus']);
        // Dans la section rapports
        Route::get('/rapports/analytics', [RapportController::class, 'analytics']);
        Route::get('/rapports/performance-produits', [RapportController::class, 'performanceProduits']);


        // Export et fonctionnalités avancées
        Route::post('/rapports/export', [RapportController::class, 'export']);
        Route::post('/rapports/comparatif', [RapportController::class, 'comparatif']);
        Route::post('/rapports/planifier', [RapportController::class, 'planifier']);

        // =================== FIN SYSTÈME DE RAPPORTS ===================

        // Catégories
        Route::get('/categories/options', [CategoryController::class, 'options']);
        Route::post('/categories/{category}/toggle-status', [CategoryController::class, 'toggleStatus']);
        Route::apiResource('categories', CategoryController::class);

        // Produits
        Route::post('/produits/{produit}/toggle-status', [ProduitController::class, 'toggleStatus']);
        Route::post('/produits/{produit}/duplicate', [ProduitController::class, 'duplicate']);
        Route::delete('/produits/{produit}/images/{image}', [ProduitController::class, 'deleteImage']);
        Route::post('/produits/{produit}/images/order', [ProduitController::class, 'updateImagesOrder']);
        Route::apiResource('produits', ProduitController::class);

        // =================== COMMANDES - NOUVELLE IMPLÉMENTATION ===================
        
        // Routes auxiliaires pour les commandes (AVANT les routes avec paramètres)
        Route::get('/commandes/statistics', [CommandeController::class, 'getStatistics']);
        Route::get('/commandes/clients-with-mesures', [CommandeController::class, 'getClientsWithMesures']);
        Route::get('/commandes/produits', [CommandeController::class, 'getProduits']);
        Route::get('/commandes/en-retard', [CommandeController::class, 'getCommandesEnRetard']);
        Route::get('/commandes/urgentes', [CommandeController::class, 'getCommandesUrgentes']);
        Route::get('/commandes/quick-search', [CommandeController::class, 'quickSearch']);
        Route::get('/commandes/export', [CommandeController::class, 'export']);
        Route::get('/commandes/daily-report', [CommandeController::class, 'getDailyReport']);
        
        // Routes avec paramètres de commande spécifique
        Route::post('/commandes/{commande}/update-status', [CommandeController::class, 'updateStatus']);
        Route::post('/commandes/{commande}/duplicate', [CommandeController::class, 'duplicate']);
        Route::post('/commandes/{commande}/mark-paid', [CommandeController::class, 'markAsPaid']);
        
        // Routes CRUD principales (à la fin)
        Route::apiResource('commandes', CommandeController::class);

        // =================== FIN COMMANDES ===================

        // Clients
        Route::get('/clients/stats', [ClientController::class, 'stats']);
        Route::get('/clients/vip', [ClientController::class, 'vipClients']);
        Route::get('/clients/inactive', [ClientController::class, 'inactiveClients']);
        Route::get('/clients/search', [ClientController::class, 'search']);
        Route::post('/clients/{client}/send-whatsapp', [ClientController::class, 'sendWhatsApp']);
        Route::post('/clients/send-novelty-notification', [ClientController::class, 'sendNoveltyNotification']);
        Route::apiResource('clients', ClientController::class);

        // Paiements
        Route::get('/paiements/stats', [PaiementController::class, 'stats']);
        Route::get('/paiements/payment-methods', [PaiementController::class, 'paymentMethods']);
        Route::post('/paiements/{paiement}/confirm', [PaiementController::class, 'confirm']);
        Route::post('/paiements/{paiement}/reject', [PaiementController::class, 'reject']);
        Route::post('/paiements/{paiement}/refund', [PaiementController::class, 'refund']);
        Route::get('/paiements/{paiement}/check-status', [PaiementController::class, 'checkStatus']);
        Route::post('/paiements/webhook/wave', [PaiementController::class, 'webhookWave']);
        Route::post('/paiements/webhook/orange-money', [PaiementController::class, 'webhookOrangeMoney']);
        Route::apiResource('paiements', PaiementController::class);

        // Promotions
        Route::get('/promotions/stats', [PromotionController::class, 'stats']);
        Route::get('/promotions/options', [PromotionController::class, 'options']);
        Route::post('/promotions/validate-code', [PromotionController::class, 'validateCode']);
        Route::post('/promotions/{promotion}/toggle-status', [PromotionController::class, 'toggleStatus']);
        Route::post('/promotions/{promotion}/duplicate', [PromotionController::class, 'duplicate']);
        Route::apiResource('promotions', PromotionController::class);

        // Avis Clients
        Route::get('/avis-clients/stats', [AvisClientController::class, 'stats']);
        Route::get('/avis-clients/options', [AvisClientController::class, 'options']);
        Route::get('/avis-clients/en-attente', [AvisClientController::class, 'enAttente']);
        Route::post('/avis-clients/{avis}/moderer', [AvisClientController::class, 'moderer']);
        Route::post('/avis-clients/{avis}/repondre', [AvisClientController::class, 'repondre']);
        Route::post('/avis-clients/{avis}/toggle-mise-en-avant', [AvisClientController::class, 'toggleMiseEnAvant']);
        Route::post('/avis-clients/{avis}/toggle-verifie', [AvisClientController::class, 'toggleVerifie']);
        Route::apiResource('avis-clients', AvisClientController::class)->only(['index', 'show', 'destroy']);
    });
});