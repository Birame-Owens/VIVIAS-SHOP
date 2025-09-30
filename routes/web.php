<?php

use Illuminate\Support\Facades\Route;

// Redirection racine vers l'app client
Route::get('/', function () {
    return view('client.client');
});

// Routes admin
Route::prefix('admin')->group(function () {
    Route::get('/login', function () {
        return view('admin.login');
    })->name('admin.login');
    
    Route::get('/{path?}', function () {
        return view('admin.app');
    })->where('path', '.*')->name('admin.app');
});

// Route catch-all pour le SPA client (DOIT être en dernier)
Route::get('/{any}', function () {
    return view('client.client');
})->where('any', '.*')->name('client.spa');