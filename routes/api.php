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
use App\Http\Controllers\Api\Admin\MessageGroupeController;
use App\Http\Controllers\Api\Client\HomeController;

use App\Http\Controllers\Api\Client\HomeController as ClientHomeController;
use App\Http\Controllers\Api\Client\NavigationController;
use App\Http\Controllers\Api\Client\ProductController as ClientProductController;
use App\Http\Controllers\Api\Client\CategoryController as ClientCategoryController;
use App\Http\Controllers\Api\Client\CartController;
use App\Http\Controllers\Api\Client\WishlistController;
use App\Http\Controllers\Api\Client\AuthController as ClientAuthController;
use App\Http\Controllers\Api\Client\SearchController;
use App\Http\Controllers\Api\Client\NewsletterController;




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
        Route::get('/rapports/commandes', [RapportController::class, 'commandes']);
        Route::get('/rapports/tailleurs', [RapportController::class, 'tailleurs']);
        Route::get('/rapports/tissus', [RapportController::class, 'tissus']);
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

        // Messages Groupés
        Route::prefix('messages')->group(function () {
            Route::get('/groups', [MessageGroupeController::class, 'getClientGroups']);
            Route::get('/clients', [MessageGroupeController::class, 'getGroupClients']);
            Route::post('/send', [MessageGroupeController::class, 'sendGroupMessage']);
        });

        
    });
    
});


Route::prefix('client')->group(function () {
    
    // =================== PAGE D'ACCUEIL ===================
    Route::get('/home', [HomeController::class, 'index']);
    Route::get('/featured-products', [HomeController::class, 'featuredProducts']);
    Route::get('/new-arrivals', [HomeController::class, 'newArrivals']);
    Route::get('/products-on-sale', [HomeController::class, 'productsOnSale']);
    Route::get('/categories-preview', [HomeController::class, 'categoriesPreview']);
    Route::get('/active-promotions', [HomeController::class, 'activePromotions']);
    Route::get('/shop-stats', [HomeController::class, 'shopStats']);
    Route::get('/testimonials', [HomeController::class, 'testimonials']);
    
    // =================== NAVIGATION DYNAMIQUE ===================
    Route::get('/navigation/menu', [NavigationController::class, 'getMainMenu']);
    Route::get('/navigation/categories/{slug}/preview', [NavigationController::class, 'getCategoryPreview']);
    
    // =================== PRODUITS ===================
    Route::prefix('products')->group(function () {
    Route::get('/', [ClientProductController::class, 'index']);
    Route::get('/trending', [ClientProductController::class, 'trending']);
    Route::get('/new-arrivals', [ClientProductController::class, 'newArrivals']);
    Route::get('/on-sale', [ClientProductController::class, 'onSale']);
    Route::get('/{slug}/page-data', [ClientProductController::class, 'getPageData']);
    
    Route::get('/{slug}', [ClientProductController::class, 'show']);
    Route::get('/{id}/images', [ClientProductController::class, 'getImages']);
    Route::get('/{id}/related', [ClientProductController::class, 'getRelated']);
    Route::post('/{id}/view', [ClientProductController::class, 'incrementViews']);
    Route::get('/{id}/whatsapp-data', [ClientProductController::class, 'getWhatsAppData']);
});
    
    // =================== CATÉGORIES ===================
   Route::prefix('categories')->group(function () {
    Route::get('/', [ClientCategoryController::class, 'index']);
    Route::get('/{slug}', [ClientCategoryController::class, 'show']);
    Route::get('/{slug}/products', [ClientCategoryController::class, 'getProducts']);
});
    
    // =================== RECHERCHE ===================
    Route::prefix('search')->group(function () {
        Route::get('/', [SearchController::class, 'search']);
        Route::get('/suggestions', [SearchController::class, 'suggestions']);
        Route::get('/quick', [HomeController::class, 'quickSearch']); // Compatibilité avec l'existant
    });
    
    // =================== PANIER (SESSION BASED) ===================
    Route::prefix('cart')->group(function () {
        Route::get('/', [CartController::class, 'index']);
        Route::post('/add', [CartController::class, 'add']);
        Route::put('/update/{itemId}', [CartController::class, 'update']);
        Route::delete('/remove/{itemId}', [CartController::class, 'remove']);
        Route::delete('/clear', [CartController::class, 'clear']);
        Route::get('/count', [CartController::class, 'getCount']);
        Route::get('/total', [CartController::class, 'getTotal']);
        Route::post('/whatsapp', [CartController::class, 'generateWhatsAppMessage']);
        Route::post('/apply-coupon', [CartController::class, 'applyCoupon']);
        Route::delete('/remove-coupon', [CartController::class, 'removeCoupon']);
    });
    
    // =================== FAVORIS (SESSION BASED) ===================
    Route::prefix('wishlist')->group(function () {
        Route::get('/', [WishlistController::class, 'index']);
        Route::post('/add', [WishlistController::class, 'add']);
        Route::delete('/remove/{productId}', [WishlistController::class, 'remove']);
        Route::delete('/clear', [WishlistController::class, 'clear']);
        Route::get('/count', [WishlistController::class, 'getCount']);
        Route::post('/move-to-cart/{productId}', [WishlistController::class, 'moveToCart']);
        Route::get('/check/{productId}', [WishlistController::class, 'checkProduct']);
    });
    
    // =================== AUTHENTIFICATION CLIENT ===================
    Route::prefix('auth')->group(function () {
        // Routes publiques
        Route::post('/register', [ClientAuthController::class, 'register'])->name('client.auth.register');
        Route::post('/login', [ClientAuthController::class, 'login'])->name('client.auth.login');
        Route::post('/guest-checkout', [ClientAuthController::class, 'guestCheckout'])->name('client.auth.guest-checkout');
        
        // Routes protégées
        Route::middleware(['auth:sanctum'])->group(function () {
            Route::post('/logout', [ClientAuthController::class, 'logout'])->name('client.auth.logout');
            Route::get('/user', [ClientAuthController::class, 'profile'])->name('client.auth.user');
            Route::get('/profile', [ClientAuthController::class, 'profile'])->name('client.auth.profile');
            Route::put('/profile', [ClientAuthController::class, 'updateProfile'])->name('client.auth.update-profile');
            Route::get('/measurements', [ClientAuthController::class, 'getMeasurements'])->name('client.auth.get-measurements');
            Route::post('/measurements', [ClientAuthController::class, 'saveMeasurements'])->name('client.auth.save-measurements');
        });
    });

    // =================== COMPTE CLIENT (DASHBOARD) ===================
    Route::prefix('account')->middleware(['auth:sanctum'])->group(function () {
        Route::get('/orders', [\App\Http\Controllers\Api\Client\AccountController::class, 'getOrders']);
        Route::get('/orders/{orderId}', [\App\Http\Controllers\Api\Client\AccountController::class, 'getOrderDetails']);
        Route::get('/invoices', [\App\Http\Controllers\Api\Client\AccountController::class, 'getInvoices']);
        Route::get('/invoices/{invoiceId}/download', [\App\Http\Controllers\Api\Client\AccountController::class, 'downloadInvoice']);
        Route::get('/profile', [\App\Http\Controllers\Api\Client\AccountController::class, 'getProfile']);
    });

    // =================== CHECKOUT & PAIEMENT ===================
    Route::prefix('checkout')->group(function () {
        Route::post('/create-order', [\App\Http\Controllers\Api\Client\CheckoutController::class, 'createOrder']);
        Route::post('/payment/{orderNumber}', [\App\Http\Controllers\Api\Client\CheckoutController::class, 'initiatePayment']);
        Route::get('/success', [\App\Http\Controllers\Api\Client\CheckoutController::class, 'success']);
        Route::get('/cancel', [\App\Http\Controllers\Api\Client\CheckoutController::class, 'cancel']);
    });
    
    // Route publique pour récupérer détails commande après paiement
    Route::get('/commandes/{orderNumber}', [\App\Http\Controllers\Api\Client\CheckoutController::class, 'getOrderByNumber']);

    // Webhook Stripe
    Route::post('/stripe/webhook', [\App\Http\Controllers\Api\Client\StripeWebhookController::class, 'handle'])->name('stripe.webhook');
    
    // =================== NEXPAY (Wave & Orange Money) ===================
    Route::prefix('nexpay')->group(function () {
        Route::post('/initiate', [\App\Http\Controllers\Api\Client\NexPayController::class, 'initiate']);
        Route::get('/status/{sessionId}', [\App\Http\Controllers\Api\Client\NexPayController::class, 'checkStatus']);
        Route::get('/callback', [\App\Http\Controllers\Api\Client\NexPayController::class, 'callback']);
    });
    
    // Webhook NexPay (hors groupe client pour éviter middleware)
    Route::post('/webhook/nexpay', [\App\Http\Controllers\Api\Client\NexPayController::class, 'webhook']);
    
    // =================== NEWSLETTER ===================
    Route::post('/newsletter/subscribe', [NewsletterController::class, 'subscribe']);
    
    // =================== CONFIGURATION SYSTÈME ===================
    Route::get('/config', function() {
        return response()->json([
            'success' => true,
            'data' => [
                'company' => [
                    'name' => 'VIVIAS SHOP',
                    'whatsapp' => config('app.admin_whatsapp', '+221784661412'),
                    'instagram' => config('app.instagram_url', 'https://instagram.com/viviasshop'),
                    'tiktok' => config('app.tiktok_url', 'https://tiktok.com/@viviasshop'),
                    'email' => config('app.contact_email', 'contact@viviasshop.sn'),
                    'address' => 'Dakar, Sénégal'
                ],
                'currency' => 'F CFA',
                'shipping' => [
                    'free_threshold' => env('SHIPPING_FREE_THRESHOLD', 50000),
                    'default_fee' => env('SHIPPING_DEFAULT_COST', 2500)
                ],
                'features' => [
                    'guest_checkout' => true,
                    'whatsapp_support' => true,
                    'cart_session' => true,
                    'wishlist_session' => true,
                    'dynamic_navigation' => true,
                    'product_carousel' => true,
                    'reviews' => true,
                    'coupons' => true,
                    'auto_invoices' => true,
                    'whatsapp_notifications' => true
                ],
                'limits' => [
                    'cart_max_items' => 50,
                    'wishlist_max_items' => 100,
                    'session_timeout' => 7200
                ]
            ]
        ]);
    });
    
});