import React, { useEffect, useState, Suspense } from 'react';
import { lazy } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import api from './services/OptimizedApiService';
import {
    useProductStore,
    useCartStore,
    useWishlistStore,
    useAuthStore,
} from './stores/index';

// ============================================
// 📄 PAGES (Lazy Loading)
// ============================================

// Critiques - Eager load
import HomePage from './pages/HomePage';
import CartPage from './pages/CartPage';

// Secondaires - Lazy load
const ProductDetailPage = lazy(() => import('./pages/ProductDetailPageOptimized'));
const CategoryPage = lazy(() => import('./pages/CategoryPage'));
const CheckoutPage = lazy(() => import('./pages/CheckoutPage'));
const WishlistPage = lazy(() => import('./pages/WishlistPage'));
const ProfilePage = lazy(() => import('./pages/ProfilePage'));
const NotFoundPage = lazy(() => import('./pages/NotFoundPage'));

// ============================================
// 🎨 LAYOUTS
// ============================================
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import PageLoader from './components/PageLoader';

/**
 * 🎯 EXEMPLE D'INTÉGRATION COMPLÈTE - APP.JSX OPTIMISÉE
 * Démontre l'utilisation de tous les éléments d'optimisation
 */

// ============================================
// 📊 APP PRINCIPALE
// ============================================
export default function App() {
    const [isInitialized, setIsInitialized] = useState(false);

    // ✅ ÉTAPE 1: Charger données critiques au démarrage
    useEffect(() => {
        initializeApp();
    }, []);

    const initializeApp = async () => {
        try {
            console.log('🚀 Initialisation VIVIAS SHOP...');

            // ============================================
            // 🔐 AUTH: Charger utilisateur si token existe
            // ============================================
            const { loadUser, isAuthenticated } = useAuthStore.getState();
            if (localStorage.getItem('auth_token')) {
                await loadUser();
                console.log('✅ Utilisateur chargé');
            }

            // ============================================
            // 🛒 PANIER: Charger depuis API (si authentifié)
            // ============================================
            if (isAuthenticated) {
                const { fetchCart } = useCartStore.getState();
                await fetchCart();
                console.log('✅ Panier chargé');
            }

            // ============================================
            // ❤️ WISHLIST: Charger depuis API (si authentifié)
            // ============================================
            if (isAuthenticated) {
                const { fetchWishlist } = useWishlistStore.getState();
                await fetchWishlist();
                console.log('✅ Wishlist chargée');
            }

            // ============================================
            // 🚀 PREFETCH: Lancer chargement en parallèle
            // ============================================
            // ⚠️ Non-bloquant, se fait en background
            api.prefetchAll().then(() => {
                console.log('✅ Données critiques pré-chargées');
            });

            // ============================================
            // 🏷️ CATÉGORIES: Charger pour navigation
            // ============================================
            const { fetchCategories } = useProductStore.getState();
            await fetchCategories();
            console.log('✅ Catégories chargées');

            console.log('🎉 App initialisée avec succès');
            setIsInitialized(true);

        } catch (error) {
            console.error('❌ Erreur initialisation:', error);
            // Continuer même avec erreur (fallback)
            setIsInitialized(true);
        }
    };

    if (!isInitialized) {
        return <PageLoader />;
    }

    return (
        <Router>
            <div className="flex flex-col min-h-screen bg-gray-50">
                {/* Navigation */}
                <Navbar />

                {/* Contenu principal */}
                <main className="flex-1">
                    <Suspense fallback={<PageLoader />}>
                        <Routes>
                            {/* 📍 PAGES PRINCIPALES */}
                            <Route path="/" element={<HomePage />} />
                            <Route path="/panier" element={<CartPage />} />
                            <Route path="/checkout" element={<CheckoutPage />} />

                            {/* 📍 PAGES DYNAMIQUES */}
                            <Route path="/produit/:id" element={<ProductDetailPage />} />
                            <Route path="/categorie/:slug" element={<CategoryPage />} />
                            <Route path="/wishlist" element={<WishlistPage />} />
                            <Route path="/profile" element={<ProfilePage />} />

                            {/* 📍 CATCH-ALL */}
                            <Route path="*" element={<NotFoundPage />} />
                        </Routes>
                    </Suspense>
                </main>

                {/* Footer */}
                <Footer />

                {/* Toast notifications */}
                <Toaster
                    position="bottom-right"
                    toastOptions={{
                        duration: 3000,
                        style: {
                            background: '#1F2937',
                            color: '#FFF',
                        },
                    }}
                />
            </div>
        </Router>
    );
}

// ============================================
// 📋 UTILISATION DANS LES PAGES
// ============================================

/**
 * EXEMPLE: HomePage optimisée
 */
export function HomePageExample() {
    // ✅ Selectors optimisés (ne re-render que si change)
    const { products, trending, fetchProducts, fetchTrending } = useProductStore(
        state => ({
            products: state.products,
            trending: state.trending,
            fetchProducts: state.fetchProducts,
            fetchTrending: state.fetchTrending,
        })
    );

    useEffect(() => {
        fetchProducts();
        fetchTrending();
    }, []);

    return (
        <div className="space-y-12 py-12">
            {/* Section Trending */}
            <section>
                <h2 className="text-2xl font-bold mb-6">🔥 Tendances</h2>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    {trending.map(product => (
                        <ProductCard key={product.id} product={product} />
                    ))}
                </div>
            </section>

            {/* Section Tous les produits */}
            <section>
                <h2 className="text-2xl font-bold mb-6">Tous les produits</h2>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    {products.map(product => (
                        <ProductCard key={product.id} product={product} />
                    ))}
                </div>
            </section>
        </div>
    );
}

/**
 * EXEMPLE: Composant panier optimisé
 */
export function CartSummary() {
    // ✅ Sélecteur très spécifique
    const { itemCount, total } = useCartStore(
        state => ({
            itemCount: state.itemCount,
            total: state.total,
        })
    );

    const handleCheckout = () => {
        // Navigation vers checkout
        window.location.href = '/checkout';
    };

    return (
        <div className="bg-white p-4 rounded-lg shadow">
            <h3 className="font-bold text-lg mb-3">Résumé panier</h3>

            <div className="space-y-2 mb-4 border-b pb-4">
                <div className="flex justify-between">
                    <span>{itemCount} articles</span>
                    <span className="font-bold">{total.toLocaleString('fr-FR')} FCFA</span>
                </div>
            </div>

            <button
                onClick={handleCheckout}
                className="w-full bg-purple-600 text-white py-3 rounded-lg font-bold hover:bg-purple-700 transition-colors"
            >
                Passer la commande
            </button>
        </div>
    );
}


export function SearchBar() {
    import { useDebouncedSearch } from './hooks/useOptimization';
    const { query, results, loading, handleSearch } = useDebouncedSearch(
        async (q) => {
            const response = await api.searchProducts(q);
            return response.data || [];
        },
        300 // Debounce 300ms
    );

    return (
        <div className="relative">
            <input
                type="text"
                placeholder="Chercher des produits..."
                value={query}
                onChange={(e) => handleSearch(e.target.value)}
                className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-purple-600"
            />

            {/* Dropdown résultats */}
            {query && (
                <div className="absolute top-full left-0 right-0 bg-white border border-gray-300 rounded-lg mt-1 shadow-lg z-10 max-h-96 overflow-y-auto">
                    {loading && <div className="p-4 text-center">⏳ Recherche...</div>}

                    {!loading && results.length === 0 && (
                        <div className="p-4 text-center text-gray-500">
                            Aucun résultat pour "{query}"
                        </div>
                    )}

                    {results.map(product => (
                        <a
                            key={product.id}
                            href={`/produit/${product.id}`}
                            className="flex items-center gap-3 p-3 hover:bg-gray-50 transition-colors border-b"
                        >
                            <img
                                src={product.image_principale}
                                alt={product.nom}
                                className="w-12 h-12 object-cover rounded"
                            />
                            <div className="flex-1">
                                <h4 className="font-semibold text-sm">{product.nom}</h4>
                                <p className="text-xs text-gray-500">
                                    {product.prix.toLocaleString('fr-FR')} FCFA
                                </p>
                            </div>
                        </a>
                    ))}
                </div>
            )}
        </div>
    );
}

/**
 * EXEMPLE: Producteur performance monitoring
 */
export function PerformanceMonitor() {
    useEffect(() => {
        if (window.performance) {
            // Navigation timing
            window.addEventListener('load', () => {
                const perfData = window.performance.timing;
                const pageLoadTime = perfData.loadEventEnd - perfData.navigationStart;

                console.log('📊 Performance Metrics:');
                console.log(`  - Page Load: ${pageLoadTime}ms`);
                console.log(`  - DOM Ready: ${perfData.domContentLoadedEventEnd - perfData.navigationStart}ms`);
                console.log(`  - Time to First Byte: ${perfData.responseStart - perfData.navigationStart}ms`);
            });

            // Cache stats
            import { cache } from './services/OptimizedApiService';
            setInterval(() => {
                console.log(`💾 Cache Stats: ${cache.cache.size} items`);
            }, 60000);
        }
    }, []);

    return null;
}
