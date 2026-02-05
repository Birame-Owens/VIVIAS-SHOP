// resources/js/client/app.jsx - VERSION ULTRA-OPTIMISÉE POUR BUNDLE RÉDUIT
import React, { useEffect, useState, createContext, lazy, Suspense } from "react";
import { createRoot } from "react-dom/client";
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider } from "./contexts/AuthContext";
import api from "./utils/api";
import SkeletonLoader from "./components/SkeletonLoader";
import PageLoadingOverlay from "./components/PageLoadingOverlay";
import { useRouteLoading } from "./hooks/useRouteLoading";
import "./client.css";

// ⚡ IMPORTANT: Retirer tous les logs en production
if (process.env.NODE_ENV === 'production') {
    console.log = () => {};
    console.debug = () => {};
    console.warn = () => {};
}

// ⚡ LAZY LOADING AGRESSIF: Toutes les pages en chunks séparés
const HomePage = lazy(() => import(/* webpackChunkName: "page-home" */ "./pages/HomePage"));
const ShopPage = lazy(() => import(/* webpackChunkName: "page-shop" */ "./pages/ShopPage"));
const CategoryPage = lazy(() => import(/* webpackChunkName: "page-category" */ "./pages/CategoryPage"));
const ProductDetailPage = lazy(() => import(/* webpackChunkName: "page-product" */ "./pages/ProductDetailPage"));
const CartPage = lazy(() => import(/* webpackChunkName: "page-cart" */ "./pages/CartPage"));
const WishlistPage = lazy(() => import(/* webpackChunkName: "page-wishlist" */ "./pages/WishlistPage"));
const ProfilePage = lazy(() => import(/* webpackChunkName: "page-profile" */ "./pages/ProfilePage"));
const AccountPage = lazy(() => import(/* webpackChunkName: "page-account" */ "./pages/AccountPage"));
const OrdersPage = lazy(() => import(/* webpackChunkName: "page-orders" */ "./pages/OrdersPage"));
const OrderDetailPage = lazy(() => import(/* webpackChunkName: "page-order-detail" */ "./pages/OrderDetailPage"));
const CheckoutPage = lazy(() => import(/* webpackChunkName: "page-checkout" */ "./pages/CheckoutPage"));
const PaymentSuccess = lazy(() => import(/* webpackChunkName: "page-payment-success" */ "./pages/PaymentSuccess"));
const ForgotPasswordPage = lazy(() => import(/* webpackChunkName: "page-forgot" */ "./pages/ForgotPasswordPage"));
const ResetPasswordPage = lazy(() => import(/* webpackChunkName: "page-reset" */ "./pages/ResetPasswordPage"));

// ⚡ Loading - Utilise le PageLoadingOverlay globalement
// Le Suspense fallback n'est pas utilisé car PageLoadingOverlay gère le loading
const PageLoader = () => null;

// Routes component avec loading overlay
const RoutesWithLoading = () => {
    const { isLoading } = useRouteLoading();

    return (
        <>
            <PageLoadingOverlay isLoading={isLoading} />
            <Suspense fallback={<PageLoader />}>
                <Routes>
                    <Route path="/" element={<HomePage />} />
                    <Route path="/shop" element={<ShopPage />} />
                    <Route path="/products/:slug" element={<ProductDetailPage />} />
                    <Route path="/categories/:slug" element={<CategoryPage />} />
                    <Route path="/cart" element={<CartPage />} />
                    <Route path="/wishlist" element={<WishlistPage />} />
                    <Route path="/checkout" element={<CheckoutPage />} />
                    <Route path="/checkout/success" element={<PaymentSuccess />} />
                    <Route path="/forgot-password" element={<ForgotPasswordPage />} />
                    <Route path="/reset-password" element={<ResetPasswordPage />} />
                    <Route path="/profile" element={<ProfilePage />} />
                    <Route path="/account" element={<AccountPage />} />
                    <Route path="/orders" element={<OrdersPage />} />
                    <Route path="/orders/:id" element={<OrderDetailPage />} />
                    <Route path="*" element={<Navigate to="/" replace />} />
                </Routes>
            </Suspense>
        </>
    );
};

// Context global
export const AppContext = createContext({
    config: null,
    prefetchProduct: () => {}
});

const AppClient = () => {
    const [config, setConfig] = useState(null);

    useEffect(() => {
        // Initialiser CSRF
        api.initCsrf();
        loadConfig();
        
        // Précharger SEULEMENT les données vraiment critiques
        prefetchCriticalData();
        
        // Lazy prefetch pages secondaires après 3s (délai non-bloquant)
        const prefetchTimer = setTimeout(() => {
            prefetchSecondaryPages();
        }, 3000);
        
        return () => clearTimeout(prefetchTimer);
    }, []);

    const loadConfig = async () => {
        try {
            const cachedConfig = sessionStorage.getItem('app_config');
            if (cachedConfig) {
                setConfig(JSON.parse(cachedConfig));
                return;
            }

            const response = await api.getConfig();
            if (response?.success) {
                setConfig(response.data);
                sessionStorage.setItem('app_config', JSON.stringify(response.data));
            }
        } catch (error) {
            // Config par défaut minimale
            const defaultConfig = {
                company: { name: 'VIVIAS SHOP' },
                currency: 'FCFA',
                shipping: { free_threshold: 50000, default_fee: 2500 }
            };
            setConfig(defaultConfig);
            sessionStorage.setItem('app_config', JSON.stringify(defaultConfig));
        }
    };

    // ⚡ Précharger SEULEMENT les données critiques (catégories)
    const prefetchCriticalData = async () => {
        try {
            api.getCategories().catch(() => {});
        } catch (error) {
            // Silent fail
        }
    };

    // ⚡ Précharger pages probables APRÈS le rendu initial
    const prefetchSecondaryPages = () => {
        try {
            // Utiliser requestIdleCallback pour ne pas bloquer
            if ('requestIdleCallback' in window) {
                requestIdleCallback(() => {
                    import('./pages/ShopPage').catch(() => {});
                    import('./pages/ProductDetailPage').catch(() => {});
                }, { timeout: 5000 });
            } else {
                // Fallback: attendre 2s avant prefetch
                setTimeout(() => {
                    import('./pages/ShopPage').catch(() => {});
                    import('./pages/ProductDetailPage').catch(() => {});
                }, 2000);
            }
        } catch (error) {
            // Silent
        }
    };

    // Fonction pour précharger un produit (utilisée au survol)
    const prefetchProduct = (slug) => {
        if (slug) {
            if ('requestIdleCallback' in window) {
                requestIdleCallback(() => {
                    api.getProductBySlug?.(slug).catch(() => {});
                });
            }
        }
    };

    return (
        <AuthProvider>
            <AppContext.Provider value={{ config, prefetchProduct }}>
                <Router>
                    <RoutesWithLoading />
                </Router>
            </AppContext.Provider>
        </AuthProvider>
    );
};

// Montage simple de l'app
const container = document.getElementById("client-app");
if (container && !container._reactRootContainer) {
    try {
        const root = createRoot(container);
        container._reactRootContainer = root;
        root.render(<AppClient />);
    } catch (error) {
        container.innerHTML = `<div style="padding:20px;text-align:center;"><h1>⚠️ Erreur</h1><button onclick="location.reload()">Rafraîchir</button></div>`;
    }
}

export default AppClient;