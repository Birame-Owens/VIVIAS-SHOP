// resources/js/client/app.jsx - VERSION OPTIMISÉE
import React, { useEffect, useState, createContext, Suspense, lazy } from "react";
import { createRoot } from "react-dom/client";
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import api from "./utils/api";
import "./client.css";

// Lazy loading des pages pour réduire le bundle initial
const HomePage = lazy(() => import("./pages/HomePage"));
const CategoryPage = lazy(() => import("./pages/CategoryPage"));
const ProductDetailPage = lazy(() => import("./pages/ProductDetailPage"));
const CartPage = lazy(() => import("./pages/CartPage"));
const ProfilePage = lazy(() => import("./pages/ProfilePage"));
const CheckoutPage = lazy(() => import("./pages/CheckoutPage"));
const PaymentSuccessPage = lazy(() => import("./pages/PaymentSuccessPage"));

// Context global
export const AppContext = createContext({
    config: null,
    prefetchProduct: () => {}
});

// Composant de chargement élégant et rapide
const PageLoader = () => (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-purple-50 via-pink-50 to-purple-50">
        <div className="text-center">
            <div className="w-16 h-16 bg-gradient-to-r from-purple-600 to-pink-600 rounded-full flex items-center justify-center mx-auto mb-4 animate-bounce">
                <span className="text-white font-bold text-2xl">V</span>
            </div>
            <div className="animate-spin rounded-full h-12 w-12 border-b-4 border-purple-600 mx-auto mb-3"></div>
            <p className="text-gray-600 text-base font-medium">Chargement...</p>
        </div>
    </div>
);

const AppClient = () => {
    const [config, setConfig] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        loadConfig();
        prefetchCriticalData();
    }, []);

    const loadConfig = async () => {
        try {
            const cachedConfig = sessionStorage.getItem('app_config');
            if (cachedConfig) {
                setConfig(JSON.parse(cachedConfig));
                setLoading(false);
                return;
            }

            const response = await api.getConfig();
            if (response.success) {
                setConfig(response.data);
                sessionStorage.setItem('app_config', JSON.stringify(response.data));
            } else {
                throw new Error('Config non disponible');
            }
        } catch (error) {
            console.error('Erreur chargement config:', error);
            const defaultConfig = {
                company: {
                    name: 'VIVIAS SHOP',
                    whatsapp: '+221771397393',
                    email: 'contact@viviasshop.sn',
                    phone: '+221771397393',
                    address: 'Dakar, Sénégal'
                },
                currency: 'FCFA',
                shipping: {
                    free_threshold: 50000,
                    default_fee: 2500
                },
                social: {
                    facebook: 'https://facebook.com/viviasshop',
                    instagram: 'https://instagram.com/viviasshop',
                    twitter: 'https://twitter.com/viviasshop'
                }
            };
            setConfig(defaultConfig);
            sessionStorage.setItem('app_config', JSON.stringify(defaultConfig));
        } finally {
            setLoading(false);
        }
    };

    const prefetchCriticalData = async () => {
        try {
            api.getCategories();
            api.getCartCount();
            api.getWishlistCount();
        } catch (error) {
            console.error('Erreur préchargement:', error);
        }
    };

    const prefetchProduct = (slug) => {
        if (slug) {
            api.getProductBySlug(slug).catch(() => {});
        }
    };

    if (loading) {
        return <PageLoader />;
    }

    return (
        <AppContext.Provider value={{ config, prefetchProduct }}>
            <Router>
                <Suspense fallback={<PageLoader />}>
                    <Routes>
                        {/* Page d'accueil */}
                        <Route path="/" element={<HomePage />} />
                        
                        {/* Pages produits */}
                        <Route path="/products/:slug" element={<ProductDetailPage />} />
                        
                        {/* Pages catégories */}
                        <Route path="/categories/:slug" element={<CategoryPage />} />
                        
                        {/* Panier */}
                        <Route path="/cart" element={<CartPage />} />

                        {/* Checkout */}
                        <Route path="/checkout" element={<CheckoutPage />} />
                        
                        {/* Page de succès de paiement */}
                        <Route path="/payment/success" element={<PaymentSuccessPage />} />
                        
                        {/* Favoris */}
                        <Route path="/wishlist" element={
                            <div className="min-h-screen flex items-center justify-center">
                                <div className="text-center">
                                    <h1 className="text-2xl font-bold text-gray-900 mb-4">Page Favoris</h1>
                                    <p className="text-gray-600">En cours de développement</p>
                                </div>
                            </div>
                        } />
                        
                        {/* Recherche */}
                        <Route path="/search" element={
                            <div className="min-h-screen flex items-center justify-center">
                                <div className="text-center">
                                    <h1 className="text-2xl font-bold text-gray-900 mb-4">Page Recherche</h1>
                                    <p className="text-gray-600">En cours de développement</p>
                                </div>
                            </div>
                        } />
                        
                        {/* Profil */}
                        <Route path="/profile" element={<ProfilePage />} />
                        
                        {/* Promotions */}
                        <Route path="/promotions" element={
                            <div className="min-h-screen flex items-center justify-center">
                                <div className="text-center">
                                    <h1 className="text-2xl font-bold text-gray-900 mb-4">Page Promotions</h1>
                                    <p className="text-gray-600">En cours de développement</p>
                                </div>
                            </div>
                        } />
                        
                        {/* Redirection par défaut */}
                        <Route path="*" element={<Navigate to="/" replace />} />
                    </Routes>
                </Suspense>
            </Router>
        </AppContext.Provider>
    );
};

const container = document.getElementById("client-app");

if (container) {
    if (!container._reactRootContainer) {
        const root = createRoot(container);
        container._reactRootContainer = root;
        root.render(<AppClient />);
    }
} else {
    console.error('Container #client-app non trouvé dans le DOM');
}

export default AppClient;