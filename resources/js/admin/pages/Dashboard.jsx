// ================================================================
// 📝 FICHIER: resources/js/admin/pages/Dashboard.jsx (CORRIGÉ)
// ================================================================

import React, { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';

const Dashboard = () => {
    const { user, logout } = useAuth();
    const navigate = useNavigate();
    const [stats, setStats] = useState({
        loading: true,
        data: null
    });

    useEffect(() => {
        // Simulation de chargement des stats
        setTimeout(() => {
            setStats({
                loading: false,
                data: {
                    totalClients: 156,
                    commandesAujourdhui: 12,
                    chiffresAffairesMois: 2450000,
                    produitsStockBas: 8
                }
            });
        }, 1000);
    }, []);

    const handleLogout = async () => {
        await logout();
        navigate('/admin/login');
    };

    return (
        <div className="min-h-screen bg-gray-50">
            {/* Header */}
            <header className="bg-white shadow-sm border-b border-gray-200">
                <div className="px-6 py-4 flex justify-between items-center">
                    <h1 className="text-2xl font-bold text-gray-900">
                        Dashboard VIVIAS SHOP
                    </h1>
                    <div className="flex items-center space-x-4">
                        <div className="text-right">
                            <p className="text-sm text-gray-600">Bienvenue,</p>
                            <p className="font-semibold text-gray-900">{user?.name}</p>
                        </div>
                        <div className="w-10 h-10 bg-purple-600 rounded-full flex items-center justify-center text-white font-semibold">
                            {user?.name?.charAt(0)}
                        </div>
                        <button
                            onClick={handleLogout}
                            className="px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors"
                        >
                            Déconnexion
                        </button>
                    </div>
                </div>
            </header>

            {/* Contenu principal */}
            <main className="p-6">
                <div className="max-w-7xl mx-auto">
                    {/* Message de bienvenue */}
                    <div className="mb-8 p-6 bg-gradient-to-r from-purple-600 to-indigo-600 rounded-2xl text-white">
                        <h2 className="text-2xl font-bold mb-2">
                            Bienvenue dans l'administration VIVIAS SHOP
                        </h2>
                        <p className="text-purple-100">
                            Gérez votre boutique de mode sénégalaise en toute simplicité
                        </p>
                    </div>

                    {/* Statistiques */}
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                        {stats.loading ? (
                            // Skeleton loading
                            Array.from({ length: 4 }).map((_, index) => (
                                <div key={index} className="bg-white rounded-2xl shadow-lg p-6 animate-pulse">
                                    <div className="w-12 h-12 bg-gray-200 rounded-xl mb-4"></div>
                                    <div className="h-8 bg-gray-200 rounded mb-2"></div>
                                    <div className="h-4 bg-gray-200 rounded"></div>
                                </div>
                            ))
                        ) : (
                            <>
                                {/* Total clients */}
                                <div className="bg-white rounded-2xl shadow-lg p-6 border border-gray-100 hover:shadow-xl transition-shadow">
                                    <div className="w-12 h-12 bg-blue-500 rounded-xl flex items-center justify-center text-white mb-4">
                                        <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
                                            <path d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"/>
                                        </svg>
                                    </div>
                                    <h3 className="text-3xl font-bold text-gray-900 mb-1">
                                        {stats.data.totalClients.toLocaleString()}
                                    </h3>
                                    <p className="text-gray-600">Total clients</p>
                                </div>

                                {/* Commandes aujourd'hui */}
                                <div className="bg-white rounded-2xl shadow-lg p-6 border border-gray-100 hover:shadow-xl transition-shadow">
                                    <div className="w-12 h-12 bg-green-500 rounded-xl flex items-center justify-center text-white mb-4">
                                        <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
                                            <path d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z"/>
                                        </svg>
                                    </div>
                                    <h3 className="text-3xl font-bold text-gray-900 mb-1">
                                        {stats.data.commandesAujourdhui}
                                    </h3>
                                    <p className="text-gray-600">Commandes aujourd'hui</p>
                                </div>

                                {/* Chiffre d'affaires */}
                                <div className="bg-white rounded-2xl shadow-lg p-6 border border-gray-100 hover:shadow-xl transition-shadow">
                                    <div className="w-12 h-12 bg-purple-500 rounded-xl flex items-center justify-center text-white mb-4">
                                        <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
                                            <path d="M12 2C13.1 2 14 2.9 14 4C14 5.1 13.1 6 12 6C10.9 6 10 5.1 10 4C10 2.9 10.9 2 12 2ZM21 9V7L15 1H5C3.89 1 3 1.89 3 3V19A2 2 0 0 0 5 21H19A2 2 0 0 0 21 19V9Z"/>
                                        </svg>
                                    </div>
                                    <h3 className="text-3xl font-bold text-gray-900 mb-1">
                                        {(stats.data.chiffresAffairesMois / 1000000).toFixed(1)}M
                                    </h3>
                                    <p className="text-gray-600">CA ce mois (XOF)</p>
                                </div>

                                {/* Stock bas */}
                                <div className="bg-white rounded-2xl shadow-lg p-6 border border-gray-100 hover:shadow-xl transition-shadow">
                                    <div className="w-12 h-12 bg-orange-500 rounded-xl flex items-center justify-center text-white mb-4">
                                        <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
                                            <path d="M12 2L2 7L12 12L22 7L12 2Z"/>
                                            <path d="M2 17L12 22L22 17"/>
                                            <path d="M2 12L12 17L22 12"/>
                                        </svg>
                                    </div>
                                    <h3 className="text-3xl font-bold text-gray-900 mb-1">
                                        {stats.data.produitsStockBas}
                                    </h3>
                                    <p className="text-gray-600">Produits stock bas</p>
                                </div>
                            </>
                        )}
                    </div>

                    {/* Actions rapides */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        <div className="bg-white rounded-2xl shadow-lg p-6 border border-gray-100">
                            <h3 className="text-lg font-semibold text-gray-900 mb-4">Actions rapides</h3>
                            <div className="space-y-3">
                                <button className="w-full text-left p-3 rounded-lg border hover:bg-purple-50 transition-colors">
                                    <div className="font-medium text-gray-900">Ajouter un produit</div>
                                    <div className="text-sm text-gray-500">Nouveau produit au catalogue</div>
                                </button>
                                <button className="w-full text-left p-3 rounded-lg border hover:bg-purple-50 transition-colors">
                                    <div className="font-medium text-gray-900">Voir les commandes</div>
                                    <div className="text-sm text-gray-500">Gérer les commandes en cours</div>
                                </button>
                                <button className="w-full text-left p-3 rounded-lg border hover:bg-purple-50 transition-colors">
                                    <div className="font-medium text-gray-900">Gestion des stocks</div>
                                    <div className="text-sm text-gray-500">Alertes et réapprovisionnement</div>
                                </button>
                            </div>
                        </div>

                        <div className="bg-white rounded-2xl shadow-lg p-6 border border-gray-100">
                            <h3 className="text-lg font-semibold text-gray-900 mb-4">Notifications</h3>
                            <div className="space-y-3">
                                <div className="p-3 bg-orange-50 border border-orange-200 rounded-lg">
                                    <div className="font-medium text-orange-800">Stock faible</div>
                                    <div className="text-sm text-orange-600">8 produits nécessitent un réapprovisionnement</div>
                                </div>
                                <div className="p-3 bg-green-50 border border-green-200 rounded-lg">
                                    <div className="font-medium text-green-800">Nouvelle commande</div>
                                    <div className="text-sm text-green-600">Commande #CMD-2024-156 reçue</div>
                                </div>
                            </div>
                        </div>

                        <div className="bg-white rounded-2xl shadow-lg p-6 border border-gray-100">
                            <h3 className="text-lg font-semibold text-gray-900 mb-4">Aperçu système</h3>
                            <div className="space-y-3">
                                <div className="flex justify-between items-center">
                                    <span className="text-gray-600">Version</span>
                                    <span className="font-medium">1.0.0</span>
                                </div>
                                <div className="flex justify-between items-center">
                                    <span className="text-gray-600">Statut</span>
                                    <span className="px-2 py-1 bg-green-100 text-green-800 rounded-full text-sm font-medium">
                                        Opérationnel
                                    </span>
                                </div>
                                <div className="flex justify-between items-center">
                                    <span className="text-gray-600">Dernière sauvegarde</span>
                                    <span className="text-sm text-gray-500">Il y a 2h</span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </main>
        </div>
    );
};

export default Dashboard;