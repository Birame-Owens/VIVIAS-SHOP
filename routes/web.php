<?php
// ================================================================
// 📝 FICHIER: routes/web.php - Configuration Production
// ================================================================

use Illuminate\Support\Facades\Route;

/*
|--------------------------------------------------------------------------
| Web Routes - VIVIAS SHOP Production
|--------------------------------------------------------------------------
|
| Routes pour l'interface web. Séparation claire entre :
| - Interface admin (SPA React)
| - Interface client (SPA React) 
| - Routes utilitaires
|
*/

// ================================
// Landing page / SEO
// ================================
Route::get('/', function () {
    // En production, pourrait rediriger vers la boutique client
    return redirect('/client/home');
})->name('home');

// ================================
// Routes utilitaires
// ================================

// CSRF Token pour Sanctum (nécessaire pour les SPA)
Route::get('/sanctum/csrf-cookie', function () {
    return response()->json([
        'message' => 'CSRF cookie set',
        'timestamp' => now()->toISOString()
    ]);
})->name('sanctum.csrf');

// Health check pour monitoring production
Route::get('/health', function () {
    return response()->json([
        'status' => 'ok',
        'app' => config('app.name'),
        'environment' => app()->environment(),
        'timestamp' => now()->toISOString(),
        'version' => config('app.version', '1.0.0')
    ]);
})->name('health.check');

// Robots.txt dynamique
Route::get('/robots.txt', function () {
    $content = app()->environment('production') 
        ? "User-agent: *\nAllow: /\nSitemap: " . url('/sitemap.xml')
        : "User-agent: *\nDisallow: /";
    
    return response($content, 200, ['Content-Type' => 'text/plain']);
})->name('robots');

// ================================
// Interface Administration
// ================================
Route::prefix('admin')->middleware(['web'])->group(function () {
    
    // Page de connexion admin (si pas d'auth externe)
    Route::get('/login', function () {
        return view('admin.login');
    })->name('admin.login');
    
    // SPA Admin - Toutes les autres routes
    Route::get('/{path?}', function () {
        // Vérification de sécurité en production
        if (app()->environment('production')) {
            // Optionnel : Vérifier l'IP ou auth basique
            // abort_unless(auth()->check() || request()->ip() === '127.0.0.1', 403);
        }
        
        return view('admin.app', [
            'title' => 'VIVIAS SHOP - Administration',
            'meta_description' => 'Interface d\'administration VIVIAS SHOP'
        ]);
    })->where('path', '.*')->name('admin.app');
});

// ================================
// Interface Client / Boutique
// ================================
Route::prefix('client')->middleware(['web'])->group(function () {
    
    // Routes client SPA - ATTENTION: N'intercepte PAS les routes API
    Route::get('/{path?}', function ($path = null) {
        // Variables pour SEO selon la route
        $seoData = [
            'title' => 'VIVIAS SHOP - Mode Africaine Authentique',
            'description' => 'Découvrez notre collection de mode africaine traditionnelle et moderne',
            'keywords' => 'mode africaine, boubou, wax, traditionnel, Sénégal',
            'og_image' => asset('images/og-vivias-shop.jpg'),
            'canonical' => url()->current()
        ];
        
        // SEO spécifique par route
        switch ($path) {
            case 'home':
            case null:
                $seoData['title'] = 'VIVIAS SHOP - Accueil | Mode Africaine';
                break;
            case 'products':
                $seoData['title'] = 'Produits | VIVIAS SHOP';
                $seoData['description'] = 'Parcourez notre collection complète de vêtements africains';
                break;
            case str_starts_with($path, 'products/'):
                $seoData['title'] = 'Produit | VIVIAS SHOP';
                break;
            case 'cart':
                $seoData['title'] = 'Panier | VIVIAS SHOP';
                $seoData['description'] = 'Finalisez votre commande';
                break;
            default:
                $seoData['title'] = ucfirst($path) . ' | VIVIAS SHOP';
        }
        
        return view('client.client', compact('seoData'));
    })->where('path', '.*')->name('client.app');
});

// ================================
// Routes de redirection / SEO
// ================================

// Anciens liens ou raccourcis
Route::redirect('/shop', '/client/home', 301);
Route::redirect('/boutique', '/client/home', 301);
Route::redirect('/store', '/client/home', 301);

// Pages légales (pourraient être des vues Blade séparées en production)
Route::get('/mentions-legales', function () {
    return view('legal.mentions');
})->name('legal.mentions');

Route::get('/politique-confidentialite', function () {
    return view('legal.privacy');
})->name('legal.privacy');

Route::get('/conditions-utilisation', function () {
    return view('legal.terms');
})->name('legal.terms');

Route::get('/livraison', function () {
    return view('info.shipping');
})->name('info.shipping');

Route::get('/contact', function () {
    return view('info.contact', [
        'whatsapp' => config('client.whatsapp.number'),
        'email' => config('client.shop.email'),
        'phone' => config('client.shop.phone'),
        'address' => config('client.shop.address')
    ]);
})->name('info.contact');

// ================================
// Sitemap XML (pour SEO)
// ================================
Route::get('/sitemap.xml', function () {
    $urls = [
        ['loc' => url('/client/home'), 'changefreq' => 'daily', 'priority' => '1.0'],
        ['loc' => url('/client/products'), 'changefreq' => 'daily', 'priority' => '0.9'],
        ['loc' => url('/contact'), 'changefreq' => 'monthly', 'priority' => '0.7'],
        ['loc' => url('/mentions-legales'), 'changefreq' => 'yearly', 'priority' => '0.3'],
    ];
    
    return response()->view('sitemap', compact('urls'), 200, [
        'Content-Type' => 'application/xml'
    ]);
})->name('sitemap');

// ================================
// Gestion d'erreurs production
// ================================

// Page 404 personnalisée
Route::fallback(function () {
    if (request()->expectsJson()) {
        return response()->json([
            'success' => false,
            'message' => 'Route non trouvée',
            'error_code' => 'ROUTE_NOT_FOUND'
        ], 404);
    }
    
    return view('errors.404', [
        'title' => 'Page non trouvée | VIVIAS SHOP'
    ]);
});

// ================================
// Maintenance mode (production)
// ================================
if (app()->isDownForMaintenance()) {
    Route::get('/', function () {
        return view('maintenance', [
            'title' => 'Maintenance en cours | VIVIAS SHOP',
            'message' => 'Nous améliorons votre expérience shopping. Retour prévu dans quelques minutes.'
        ]);
    });
}