<?php

use Illuminate\Support\Facades\Route;

// Redirection racine vers l'app client
Route::get('/', function () {
    return view('client.client');
});

// Routes admin: React handles /admin/login and all admin pages.
Route::prefix('admin')->group(function () {
    Route::get('/{path?}', function () {
        return view('admin.app');
    })->where('path', '.*')->name('admin.app');
});

// Route catch-all pour le SPA client (DOIT être en dernier)
Route::get('/{any}', function () {
    return view('client.client');
})->where('any', '.*')->name('client.spa');
