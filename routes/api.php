<?php

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;
use App\Http\Controllers\Api\Admin\AuthController;

Route::get('/user', function (Request $request) {
    return $request->user();
})->middleware('auth:sanctum');

// Routes admin
Route::prefix('admin')->group(function () {
    Route::post('/login', [AuthController::class, 'login']);
    Route::post('/logout', [AuthController::class, 'logout']);
    
    Route::middleware(['auth:sanctum', 'admin.auth'])->group(function () {
        Route::get('/user', [AuthController::class, 'user']);
        Route::get('/check', [AuthController::class, 'check']);
    });
});