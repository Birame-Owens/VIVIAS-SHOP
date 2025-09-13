// ================================================================
// 📝 FICHIER: resources/js/admin/components/ProtectedRoute.jsx (CORRIGÉ)
// ================================================================

import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const ProtectedRoute = ({ children }) => {
    const { user, loading, isAuthenticated, isAdmin } = useAuth();

    console.log('ProtectedRoute - État:', { 
        user: !!user, 
        loading, 
        isAuthenticated: isAuthenticated(), 
        isAdmin: isAdmin() 
    });

    // Afficher un loader pendant la vérification
    if (loading) {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center">
                <div className="text-center">
                    <div className="bg-white p-6 rounded-2xl shadow-lg">
                        <div className="w-12 h-12 bg-purple-600 rounded-full flex items-center justify-center text-white font-semibold mx-auto mb-4 animate-pulse">
                            <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
                                <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/>
                            </svg>
                        </div>
                        <h2 className="text-lg font-semibold text-gray-900 mb-2">VIVIAS SHOP</h2>
                        <p className="text-gray-600 mb-4">Vérification de l'authentification...</p>
                        <div className="w-8 h-8 border-4 border-purple-600 border-t-transparent rounded-full animate-spin mx-auto"></div>
                    </div>
                </div>
            </div>
        );
    }

    // Rediriger vers login si non authentifié
    if (!isAuthenticated()) {
        console.log('ProtectedRoute - Redirection vers login');
        return <Navigate to="/admin/login" replace />;
    }

    // Rediriger si pas admin
    if (!isAdmin()) {
        console.log('ProtectedRoute - Pas admin, accès refusé');
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center">
                <div className="text-center">
                    <div className="bg-white p-6 rounded-2xl shadow-lg max-w-md">
                        <div className="w-12 h-12 bg-red-500 rounded-full flex items-center justify-center text-white mx-auto mb-4">
                            <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
                                <path d="M18.364 5.636L5.636 18.364m12.728 0L5.636 5.636"/>
                            </svg>
                        </div>
                        <h2 className="text-xl font-bold text-gray-900 mb-2">Accès refusé</h2>
                        <p className="text-gray-600 mb-4">
                            Vous n'avez pas les permissions d'administrateur nécessaires pour accéder à cette page.
                        </p>
                        <button
                            onClick={() => window.location.href = '/admin/login'}
                            className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
                        >
                            Retour à la connexion
                        </button>
                    </div>
                </div>
            </div>
        );
    }

    console.log('ProtectedRoute - Accès autorisé');
    // Rendre le composant protégé
    return children;
};

export default ProtectedRoute;