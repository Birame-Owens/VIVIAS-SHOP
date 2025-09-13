<?php

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;
use App\Http\Controllers\Api\Admin\AuthController;
use App\Http\Controllers\Api\Admin\DashboardController;

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

        // Dashboard - routes plates (pas de sous-groupes)
        Route::get('/dashboard', [DashboardController::class, 'index'])->name('admin.api.dashboard');
        Route::get('/dashboard/quick-stats', [DashboardController::class, 'quickStats'])->name('admin.api.dashboard.quick-stats');
    });
});