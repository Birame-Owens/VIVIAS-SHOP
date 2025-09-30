// resources/js/client/app.jsx (suite et fin)
import React, { useEffect, useState, createContext } from "react";
import { createRoot } from "react-dom/client";
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import HomePage from "./pages/HomePage";
import CategoryPage from "./pages/CategoryPage";
import ProductDetailPage from "./pages/ProductDetailPage";
import api from "./utils/api";
import "./client.css";

// Context global
export const AppContext = createContext({
    config: null
});

const AppClient = () => {
    const [config, setConfig] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        loadConfig();
    }, []);

    const loadConfig = async () => {
        try {
            const response = await api.getConfig();
            if (response.success) {
                setConfig(response.data);
            } else {
                throw new Error('Config non disponible');
            }
        } catch (error) {
            console.error('Erreur chargement config:', error);
            setConfig({
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
            });
        } finally {
            setLoading(false);
        }
    };

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-purple-50 via-pink-50 to-purple-50">
                <div className="text-center">
                    <div className="w-20 h-20 bg-gradient-to-r from-purple-600 to-pink-600 rounded-full flex items-center justify-center mx-auto mb-6 animate-bounce">
                        <span className="text-white font-bold text-3xl">V</span>
                    </div>
                    <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-purple-600 mx-auto mb-4"></div>
                    <p className="text-gray-600 text-lg font-medium">Chargement de VIVIAS SHOP...</p>
                </div>
            </div>
        );
    }

    return (
        <AppContext.Provider value={{ config }}>
            <Router>
                <Routes>
                    {/* Page d'accueil */}
                    <Route path="/" element={<HomePage />} />
                    
                    {/* Pages produits */}
                    <Route path="/products/:slug" element={<ProductDetailPage />} />
                    
                    {/* Pages catégories */}
                    <Route path="/categories/:slug" element={<CategoryPage />} />
                    
                    {/* Panier */}
                    <Route path="/cart" element={<div>Page Panier (à créer)</div>} />
                    
                    {/* Favoris */}
                    <Route path="/wishlist" element={<div>Page Favoris (à créer)</div>} />
                    
                    {/* Recherche */}
                    <Route path="/search" element={<div>Page Recherche (à créer)</div>} />
                    
                    {/* Profil */}
                    <Route path="/profile" element={<div>Page Profil (à créer)</div>} />
                    
                    {/* Promotions */}
                    <Route path="/promotions" element={<div>Page Promotions (à créer)</div>} />
                    
                    {/* Toutes les autres routes redirigent vers la page d'accueil */}
                    <Route path="*" element={<Navigate to="/" replace />} />
                </Routes>
            </Router>
        </AppContext.Provider>
    );
};

// Montage de l'application
const container = document.getElementById("client-app");

if (container) {
    // Éviter les doubles montages en développement
    if (!container._reactRootContainer) {
        const root = createRoot(container);
        container._reactRootContainer = root;
        root.render(<AppClient />);
    }
} else {
    console.error('Container #client-app non trouvé dans le DOM');
}

export default AppClient;