<?php

use Illuminate\Support\Facades\Route;

Route::get('/', function () {
    return view('welcome');
});

// Route pour Sanctum CSRF Cookie (nécessaire pour SPA)
Route::get('/sanctum/csrf-cookie', function () {
    return response()->json(['message' => 'CSRF cookie set']);
});

// Routes d'administration
Route::prefix('admin')->group(function () {
    // Toutes les routes admin renderont la SPA React
    Route::get('/{path?}', function () {
        return view('admin.app');
    })->where('path', '.*')->name('admin.app');
});