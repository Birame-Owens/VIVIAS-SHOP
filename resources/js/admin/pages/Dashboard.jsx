// ================================================================
// 📝 FICHIER: resources/js/admin/pages/Dashboard.jsx (VERSION RESPONSIVE PRO)
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
    const [sidebarOpen, setSidebarOpen] = useState(false);

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

    const menuItems = [
        { name: 'Dashboard', icon: 'M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2H5a2 2 0 00-2-2z', active: true },
        { name: 'Commandes', icon: 'M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2' },
        { name: 'Produits', icon: 'M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4' },
        { name: 'Clients', icon: 'M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z' },
        { name: 'Tailleurs', icon: 'M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z' },
        { name: 'Stock', icon: 'M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16' },
        { name: 'Paramètres', icon: 'M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z M15 12a3 3 0 11-6 0 3 3 0 016 0z' },
    ];

    const StatCard = ({ title, value, icon, color, loading }) => (
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 hover:shadow-md transition-shadow duration-200">
            {loading ? (
                <div className="animate-pulse">
                    <div className="flex items-center justify-between mb-4">
                        <div className="h-4 bg-gray-200 rounded w-20"></div>
                        <div className={`w-12 h-12 bg-gray-200 rounded-xl`}></div>
                    </div>
                    <div className="h-8 bg-gray-200 rounded w-24 mb-2"></div>
                    <div className="h-4 bg-gray-200 rounded w-16"></div>
                </div>
            ) : (
                <>
                    <div className="flex items-center justify-between mb-4">
                        <h3 className="text-sm font-medium text-gray-500">{title}</h3>
                        <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${color}`}>
                            <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={icon} />
                            </svg>
                        </div>
                    </div>
                    <div className="text-3xl font-bold text-gray-900 mb-1">
                        {typeof value === 'number' && value > 1000000 
                            ? `${(value / 1000000).toFixed(1)}M`
                            : typeof value === 'number' 
                            ? value.toLocaleString()
                            : value
                        }
                    </div>
                    <p className="text-sm text-gray-600">
                        {title === 'CA ce mois (XOF)' && 'XOF'}
                    </p>
                </>
            )}
        </div>
    );

    return (
        <div className="min-h-screen bg-gray-50">
            {/* Mobile menu backdrop */}
            {sidebarOpen && (
                <div 
                    className="fixed inset-0 bg-black bg-opacity-50 z-40 lg:hidden"
                    onClick={() => setSidebarOpen(false)}
                />
            )}

            {/* Sidebar */}
            <div className={`
                fixed inset-y-0 left-0 z-50 w-64 bg-white shadow-lg transform transition-transform duration-300 ease-in-out lg:translate-x-0 lg:static lg:inset-0
                ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'}
            `}>
                <div className="flex items-center justify-center h-16 px-4 border-b border-gray-200">
                    <div className="flex items-center space-x-3">
                        {/* Logo VIVIAS */}
                        <div className="w-10 h-10 bg-purple-600 rounded-lg flex items-center justify-center">
                            <svg viewBox="0 0 100 100" className="w-6 h-6" fill="none">
                                <path d="M20 25 L35 65 L50 25 L65 25 L45 75 L25 75 Z" fill="white"/>
                                <path d="M55 45 Q70 40 70 50 Q70 60 55 55 Q40 50 40 60 Q40 70 55 65" stroke="white" strokeWidth="2" fill="none"/>
                            </svg>
                        </div>
                        <div>
                            <h1 className="text-lg font-bold text-gray-900">VIVIAS</h1>
                            <p className="text-xs text-gray-500">Administration</p>
                        </div>
                    </div>
                </div>

                <nav className="mt-6 px-3">
                    {menuItems.map((item, index) => (
                        <a
                            key={index}
                            href="#"
                            className={`
                                flex items-center px-3 py-3 text-sm font-medium rounded-lg mb-1 transition-colors duration-200
                                ${item.active 
                                    ? 'bg-purple-50 text-purple-700 border-r-2 border-purple-600' 
                                    : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                                }
                            `}
                        >
                            <svg className="w-5 h-5 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={item.icon} />
                            </svg>
                            {item.name}
                        </a>
                    ))}
                </nav>
            </div>

            {/* Main content */}
            <div className="lg:pl-64">
                {/* Top bar */}
                <div className="sticky top-0 z-40 bg-white shadow-sm border-b border-gray-200 px-4 sm:px-6 lg:px-8">
                    <div className="flex items-center justify-between h-16">
                        {/* Mobile menu button */}
                        <button
                            onClick={() => setSidebarOpen(!sidebarOpen)}
                            className="lg:hidden p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-md transition-colors duration-200"
                        >
                            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                            </svg>
                        </button>

                        <div className="flex-1 lg:flex lg:items-center lg:justify-between">
                            <div className="min-w-0 flex-1">
                                <h1 className="text-xl sm:text-2xl font-bold text-gray-900 truncate">
                                    Dashboard
                                </h1>
                                <p className="text-sm text-gray-500 hidden sm:block">
                                    Bienvenue dans l'administration VIVIAS SHOP
                                </p>
                            </div>

                            {/* User menu */}
                            <div className="flex items-center space-x-4">
                                <div className="hidden sm:flex sm:flex-col sm:items-end">
                                    <p className="text-sm font-medium text-gray-900">{user?.name}</p>
                                    <p className="text-xs text-gray-500">{user?.role}</p>
                                </div>
                                <div className="w-10 h-10 bg-purple-100 rounded-full flex items-center justify-center">
                                    <span className="text-purple-600 font-medium text-sm">
                                        {user?.name?.charAt(0)}
                                    </span>
                                </div>
                                <button
                                    onClick={handleLogout}
                                    className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-md transition-colors duration-200"
                                    title="Déconnexion"
                                >
                                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                                    </svg>
                                </button>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Dashboard content */}
                <main className="px-4 sm:px-6 lg:px-8 py-6">
                    {/* Stats grid */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                        <StatCard
                            title="Total clients"
                            value={stats.data?.totalClients}
                            icon="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"
                            color="bg-blue-500"
                            loading={stats.loading}
                        />

                        <StatCard
                            title="Commandes aujourd'hui"
                            value={stats.data?.commandesAujourdhui}
                            icon="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01"
                            color="bg-green-500"
                            loading={stats.loading}
                        />

                        <StatCard
                            title="CA ce mois (XOF)"
                            value={stats.data?.chiffresAffairesMois}
                            icon="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                            color="bg-purple-500"
                            loading={stats.loading}
                        />

                        <StatCard
                            title="Produits stock bas"
                            value={stats.data?.produitsStockBas}
                            icon="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z"
                            color="bg-orange-500"
                            loading={stats.loading}
                        />
                    </div>

                    {/* Content grid */}
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                        {/* Actions rapides */}
                        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
                            <h3 className="text-lg font-semibold text-gray-900 mb-4">Actions rapides</h3>
                            <div className="space-y-3">
                                <button className="w-full flex items-center p-3 text-left rounded-lg border border-gray-200 hover:border-purple-300 hover:bg-purple-50 transition-all duration-200 group">
                                    <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center mr-3 group-hover:bg-blue-200">
                                        <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                                        </svg>
                                    </div>
                                    <div>
                                        <div className="font-medium text-gray-900">Ajouter un produit</div>
                                        <div className="text-sm text-gray-500">Nouveau produit au catalogue</div>
                                    </div>
                                </button>

                                <button className="w-full flex items-center p-3 text-left rounded-lg border border-gray-200 hover:border-purple-300 hover:bg-purple-50 transition-all duration-200 group">
                                    <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center mr-3 group-hover:bg-green-200">
                                        <svg className="w-5 h-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                                        </svg>
                                    </div>
                                    <div>
                                        <div className="font-medium text-gray-900">Voir les commandes</div>
                                        <div className="text-sm text-gray-500">Gérer les commandes en cours</div>
                                    </div>
                                </button>

                                <button className="w-full flex items-center p-3 text-left rounded-lg border border-gray-200 hover:border-purple-300 hover:bg-purple-50 transition-all duration-200 group">
                                    <div className="w-10 h-10 bg-orange-100 rounded-lg flex items-center justify-center mr-3 group-hover:bg-orange-200">
                                        <svg className="w-5 h-5 text-orange-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
                                        </svg>
                                    </div>
                                    <div>
                                        <div className="font-medium text-gray-900">Gestion des stocks</div>
                                        <div className="text-sm text-gray-500">Alertes et réapprovisionnement</div>
                                    </div>
                                </button>
                            </div>
                        </div>

                        {/* Notifications */}
                        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
                            <h3 className="text-lg font-semibold text-gray-900 mb-4">Notifications</h3>
                            <div className="space-y-3">
                                <div className="flex items-start p-3 bg-orange-50 border border-orange-200 rounded-lg">
                                    <div className="w-8 h-8 bg-orange-500 rounded-full flex items-center justify-center flex-shrink-0 mr-3">
                                        <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
                                        </svg>
                                    </div>
                                    <div>
                                        <div className="font-medium text-orange-800">Stock faible</div>
                                        <div className="text-sm text-orange-600">8 produits nécessitent un réapprovisionnement</div>
                                        <div className="text-xs text-orange-500 mt-1">Il y a 2 heures</div>
                                    </div>
                                </div>

                                <div className="flex items-start p-3 bg-green-50 border border-green-200 rounded-lg">
                                    <div className="w-8 h-8 bg-green-500 rounded-full flex items-center justify-center flex-shrink-0 mr-3">
                                        <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                        </svg>
                                    </div>
                                    <div>
                                        <div className="font-medium text-green-800">Nouvelle commande</div>
                                        <div className="text-sm text-green-600">Commande #CMD-2024-156 reçue</div>
                                        <div className="text-xs text-green-500 mt-1">Il y a 15 minutes</div>
                                    </div>
                                </div>

                                <div className="flex items-start p-3 bg-blue-50 border border-blue-200 rounded-lg">
                                    <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center flex-shrink-0 mr-3">
                                        <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                                        </svg>
                                    </div>
                                    <div>
                                        <div className="font-medium text-blue-800">Commande prête</div>
                                        <div className="text-sm text-blue-600">CMD-2024-154 prête à livrer</div>
                                        <div className="text-xs text-blue-500 mt-1">Il y a 1 heure</div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Aperçu système */}
                        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
                            <h3 className="text-lg font-semibold text-gray-900 mb-4">Aperçu système</h3>
                            <div className="space-y-4">
                                <div className="flex justify-between items-center py-2">
                                    <span className="text-gray-600">Version</span>
                                    <span className="font-medium bg-gray-100 px-2 py-1 rounded text-sm">v1.0.0</span>
                                </div>
                                
                                <div className="flex justify-between items-center py-2">
                                    <span className="text-gray-600">Statut</span>
                                    <span className="flex items-center">
                                        <div className="w-2 h-2 bg-green-500 rounded-full mr-2"></div>
                                        <span className="text-sm font-medium text-green-700">Opérationnel</span>
                                    </span>
                                </div>
                                
                                <div className="flex justify-between items-center py-2">
                                    <span className="text-gray-600">Dernière sauvegarde</span>
                                    <span className="text-sm text-gray-500">Il y a 2h</span>
                                </div>
                                
                                <div className="flex justify-between items-center py-2">
                                    <span className="text-gray-600">Utilisateurs actifs</span>
                                    <span className="font-medium text-purple-600">3</span>
                                </div>

                                <div className="pt-4 border-t border-gray-200">
                                    <button className="w-full bg-gray-50 hover:bg-gray-100 text-gray-700 py-2 px-4 rounded-lg transition-colors duration-200 text-sm font-medium">
                                        Voir tous les détails
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Graphiques récents (placeholder) */}
                    <div className="mt-8 bg-white rounded-xl shadow-sm border border-gray-100 p-6">
                        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-6">
                            <h3 className="text-lg font-semibold text-gray-900 mb-2 sm:mb-0">Activité récente</h3>
                            <div className="flex space-x-2">
                                <button className="px-3 py-1 text-sm bg-purple-100 text-purple-700 rounded-lg font-medium">
                                    7 jours
                                </button>
                                <button className="px-3 py-1 text-sm text-gray-600 hover:bg-gray-100 rounded-lg">
                                    30 jours
                                </button>
                                <button className="px-3 py-1 text-sm text-gray-600 hover:bg-gray-100 rounded-lg">
                                    3 mois
                                </button>
                            </div>
                        </div>
                        
                        {/* Placeholder pour graphique */}
                        <div className="h-64 bg-gray-50 rounded-lg flex items-center justify-center">
                            <div className="text-center">
                                <svg className="w-12 h-12 text-gray-400 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                                </svg>
                                <p className="text-gray-500">Graphique des ventes à venir</p>
                                <p className="text-sm text-gray-400">Intégration Chart.js prévue</p>
                            </div>
                        </div>
                    </div>
                </main>
            </div>
        </div>
    );
};

export default Dashboard;