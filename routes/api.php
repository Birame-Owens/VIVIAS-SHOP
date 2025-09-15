<?php

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;
use App\Http\Controllers\Api\Admin\AuthController;
use App\Http\Controllers\Api\Admin\DashboardController;
use App\Http\Controllers\Api\Admin\CategoryController;
use App\Http\Controllers\Api\Admin\ProduitController;
use App\Http\Controllers\Api\Admin\CommandeController; // ← AJOUTER CETTE LIGNE

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
    });
});