// resources/js/client/app.jsx - VERSION OPTIMISÉE AVEC AUTH
import React, { useEffect, useState, createContext, lazy, Suspense } from "react";
import { createRoot } from "react-dom/client";
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider } from "./contexts/AuthContext";
import api from "./utils/api";
import "./client.css";

// Logs de débogage
console.log("🔧 App.jsx chargé");

// Gestion des erreurs non capturées
window.addEventListener('error', (event) => {
  console.error('❌ Erreur globale:', event.error);
});

window.addEventListener('unhandledrejection', (event) => {
  console.error('❌ Promise rejetée non gérée:', event.reason);
});

// LAZY LOADING avec prefetching agressif
const HomePage = lazy(() => import("./pages/HomePage"));
const ShopPage = lazy(() => import("./pages/ShopPage"));
const CategoryPage = lazy(() => import("./pages/CategoryPage"));
const ProductDetailPage = lazy(() => import("./pages/ProductDetailPage"));
const CartPage = lazy(() => import("./pages/CartPage"));
const WishlistPage = lazy(() => import("./pages/WishlistPage"));
const ProfilePage = lazy(() => import("./pages/ProfilePage"));
const AccountPage = lazy(() => import("./pages/AccountPage"));
const OrdersPage = lazy(() => import("./pages/OrdersPage"));
const OrderDetailPage = lazy(() => import("./pages/OrderDetailPage"));
const CheckoutPage = lazy(() => import("./pages/CheckoutPage"));
const PaymentSuccess = lazy(() => import("./pages/PaymentSuccess"));

// Prefetch immédiat des composants critiques au chargement
setTimeout(() => {
    import("./pages/CategoryPage");
    import("./pages/ProductDetailPage");
}, 100);

// Loading minimal - Invisible pour navigation fluide
const PageLoader = () => null;

// Context global
export const AppContext = createContext({
    config: null,
    prefetchProduct: () => {}
});

const AppClient = () => {
    const [config, setConfig] = useState(null);

    useEffect(() => {
        // Initialiser CSRF dès le chargement
        api.initCsrf();
        loadConfig();
        prefetchCriticalData();
    }, []);

    const loadConfig = async () => {
        try {
            const cachedConfig = sessionStorage.getItem('app_config');
            if (cachedConfig) {
                setConfig(JSON.parse(cachedConfig));
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
                    whatsapp: '+221784661412',
                    email: 'contact@viviasshop.sn',
                    phone: '+221784661412',
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
        }
    };

    // Précharger les données critiques
    const prefetchCriticalData = async () => {
        try {
            api.getCategories();
            api.getCartCount();
            api.getWishlistCount();
        } catch (error) {
            console.error('Erreur préchargement:', error);
        }
    };

    // Fonction pour précharger un produit (utilisée au survol)
    const prefetchProduct = (slug) => {
        if (slug) {
            api.getProductBySlug(slug).catch(() => {});
        }
    };

    return (
        <AuthProvider>
            <AppContext.Provider value={{ config, prefetchProduct }}>
                <Router>
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
                            <Route path="/profile" element={<ProfilePage />} />
                            <Route path="/account" element={<AccountPage />} />
                            <Route path="/orders" element={<OrdersPage />} />
                            <Route path="/orders/:id" element={<OrderDetailPage />} />
                            <Route path="*" element={<Navigate to="/" replace />} />
                        </Routes>
                    </Suspense>
                </Router>
            </AppContext.Provider>
        </AuthProvider>
    );
};

// Montage de l'application avec optimisations
const container = document.getElementById("client-app");

if (container) {
    console.log("✅ App container trouvé, montage React...");
    // Éviter les doubles montages en développement
    if (!container._reactRootContainer) {
        try {
            const root = createRoot(container);
            container._reactRootContainer = root;
            root.render(<AppClient />);
            window.reactMounted = true; // Signal pour timeout detector
            console.log("✅ AppClient rendu avec succès");
        } catch (error) {
            console.error("❌ Erreur montage React:", error);
            container.innerHTML = `
                <div style="padding: 20px; text-align: center;">
                    <h1>⚠️ Erreur de chargement</h1>
                    <p>${error.message}</p>
                    <p><button onclick="location.reload()">Rafraîchir</button></p>
                </div>
            `;
        }
    }
} else {
    console.error("❌ Container #client-app NOT FOUND");
}

export default AppClient;