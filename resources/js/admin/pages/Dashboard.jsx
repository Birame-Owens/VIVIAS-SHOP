import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import Sidebar from '../components/Sidebar';
import { 
    Menu, 
    Bell, 
    RefreshCw,
    TrendingUp, 
    ShoppingBag, 
    Users, 
    Package,
    ArrowUp,
    ArrowDown,
    AlertTriangle,
    CheckCircle,
    Loader
} from 'lucide-react';

const Dashboard = () => {
    const { user, token } = useAuth();
    const [sidebarOpen, setSidebarOpen] = useState(false);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [dashboardData, setDashboardData] = useState(null);

    // Configuration API
    const API_BASE = '/api/admin';
    const getHeaders = () => ({
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
        'Accept': 'application/json'
    });

    // Chargement des données
    const loadData = async () => {
        try {
            setLoading(true);
            setError(null);

            const response = await fetch(`${API_BASE}/dashboard`, {
                headers: getHeaders()
            });

            if (!response.ok) {
                throw new Error(`Erreur ${response.status}: ${response.statusText}`);
            }

            const result = await response.json();

            if (result.success) {
                setDashboardData(result.data);
            } else {
                throw new Error(result.message || 'Erreur lors du chargement');
            }

        } catch (err) {
            console.error('Erreur API:', err);
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    // Chargement initial
    useEffect(() => {
        loadData();
    }, []);

    // Actualisation
    const handleRefresh = async () => {
        await loadData();
    };

    // Formatage FCFA
    const formatCurrency = (amount) => {
        if (!amount && amount !== 0) return '0 FCFA';
        return new Intl.NumberFormat('fr-SN', {
            style: 'currency',
            currency: 'XOF',
            minimumFractionDigits: 0
        }).format(amount);
    };

    // Formatage nombres
    const formatNumber = (number) => {
        if (!number && number !== 0) return '0';
        return new Intl.NumberFormat('fr-FR').format(number);
    };

    // Carte de statistique
    const StatCard = ({ title, value, icon: Icon, color, trend, isLoading }) => (
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <div className="flex items-center">
                <div className={`p-3 rounded-lg ${color} bg-opacity-10`}>
                    <Icon className={`w-6 h-6 ${color.replace('bg-', 'text-')}`} />
                </div>
                <div className="ml-4 flex-1">
                    <h3 className="text-sm font-medium text-gray-500">{title}</h3>
                    {isLoading ? (
                        <div className="mt-1">
                            <div className="h-8 w-24 bg-gray-200 rounded animate-pulse"></div>
                        </div>
                    ) : (
                        <>
                            <div className="mt-1 text-2xl font-semibold text-gray-900">
                                {typeof value === 'number' && title.toLowerCase().includes('affaires') 
                                    ? formatCurrency(value) 
                                    : formatNumber(value)}
                            </div>
                            {trend && (
                                <div className={`flex items-center mt-2 text-sm ${
                                    trend.positive ? 'text-green-600' : 'text-red-600'
                                }`}>
                                    {trend.positive ? 
                                        <ArrowUp className="w-4 h-4 mr-1" /> : 
                                        <ArrowDown className="w-4 h-4 mr-1" />
                                    }
                                    {trend.text}
                                </div>
                            )}
                        </>
                    )}
                </div>
            </div>
        </div>
    );

    // Composant d'erreur
    if (error) {
        return (
            <div className="min-h-screen bg-gray-50 flex">
                {/* Sidebar toujours visible */}
                <Sidebar isOpen={sidebarOpen} setIsOpen={setSidebarOpen} />
                
                {/* Contenu d'erreur qui s'adapte */}
                <div className="flex-1 flex items-center justify-center">
                    <div className="text-center p-8">
                        <AlertTriangle className="w-16 h-16 text-red-500 mx-auto mb-4" />
                        <h2 className="text-xl font-semibold text-gray-900 mb-2">Erreur de chargement</h2>
                        <p className="text-gray-600 mb-4">{error}</p>
                        <button
                            onClick={loadData}
                            className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700"
                        >
                            Réessayer
                        </button>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50 flex">
            {/* Sidebar */}
            <Sidebar isOpen={sidebarOpen} setIsOpen={setSidebarOpen} />

            {/* Contenu principal - s'adapte à la sidebar */}
            <div className="flex-1 min-w-0 lg:ml-64">
                {/* Header */}
                <header className="bg-white shadow-sm border-b">
                    <div className="px-4 sm:px-6 py-4">
                        <div className="flex items-center justify-between">
                            <div className="flex items-center min-w-0">
                                <button
                                    onClick={() => setSidebarOpen(true)}
                                    className="lg:hidden p-2 rounded-md text-gray-400 hover:text-gray-500 flex-shrink-0"
                                >
                                    <Menu className="w-6 h-6" />
                                </button>
                                
                                <div className="ml-4 lg:ml-0 min-w-0">
                                    <h1 className="text-xl sm:text-2xl font-bold text-gray-900 truncate">Dashboard</h1>
                                    <p className="text-sm text-gray-500">Aperçu de votre boutique</p>
                                </div>
                            </div>

                            <div className="flex items-center space-x-2 sm:space-x-3 flex-shrink-0">
                                <button
                                    onClick={handleRefresh}
                                    disabled={loading}
                                    className="p-2 text-gray-400 hover:text-gray-600 rounded-md disabled:opacity-50"
                                    title="Actualiser"
                                >
                                    <RefreshCw className={`w-5 h-5 ${loading ? 'animate-spin' : ''}`} />
                                </button>

                                <button className="p-2 text-gray-400 hover:text-gray-600 rounded-md">
                                    <Bell className="w-5 h-5" />
                                </button>

                                <div className="flex items-center space-x-3">
                                    <div className="hidden sm:block text-right">
                                        <p className="text-sm font-medium text-gray-900">{user?.name}</p>
                                        <p className="text-xs text-gray-500">Admin</p>
                                    </div>
                                    <div className="w-8 h-8 bg-purple-600 rounded-full flex items-center justify-center flex-shrink-0">
                                        <span className="text-white text-sm font-medium">
                                            {user?.name?.charAt(0) || 'A'}
                                        </span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </header>

                {/* Contenu du dashboard - utilise tout l'espace disponible */}
                <main className="p-4 sm:p-6 max-w-full">
                    {/* Statistiques principales */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 mb-6 sm:mb-8">
                        <StatCard
                            title="Chiffre d'Affaires (mois)"
                            value={dashboardData?.overview?.chiffre_affaires_mois}
                            icon={TrendingUp}
                            color="bg-green-500"
                            trend={dashboardData?.sales?.growth_percentage && {
                                positive: dashboardData.sales.is_positive_growth,
                                text: `${dashboardData.sales.growth_percentage}% vs mois dernier`
                            }}
                            isLoading={loading}
                        />

                        <StatCard
                            title="Commandes (mois)"
                            value={dashboardData?.orders?.total_month}
                            icon={ShoppingBag}
                            color="bg-blue-500"
                            trend={dashboardData?.orders?.pending && {
                                positive: false,
                                text: `${dashboardData.orders.pending} en attente`
                            }}
                            isLoading={loading}
                        />

                        <StatCard
                            title="Total Clients"
                            value={dashboardData?.overview?.total_clients}
                            icon={Users}
                            color="bg-purple-500"
                            trend={dashboardData?.overview?.nouveaux_clients_mois && {
                                positive: true,
                                text: `+${dashboardData.overview.nouveaux_clients_mois} ce mois`
                            }}
                            isLoading={loading}
                        />

                        <StatCard
                            title="Stock Total"
                            value={dashboardData?.products?.total_stock}
                            icon={Package}
                            color="bg-orange-500"
                            trend={dashboardData?.products?.low_stock && {
                                positive: false,
                                text: `${dashboardData.products.low_stock} en alerte`
                            }}
                            isLoading={loading}
                        />
                    </div>

                    {/* Alertes et informations */}
                    <div className="grid grid-cols-1 xl:grid-cols-2 gap-4 sm:gap-6">
                        {/* Stock faible */}
                        <div className="bg-white rounded-lg shadow-sm border">
                            <div className="p-4 border-b">
                                <div className="flex items-center justify-between">
                                    <h3 className="font-semibold text-gray-900 flex items-center">
                                        <AlertTriangle className="w-5 h-5 text-orange-500 mr-2" />
                                        Stock Faible
                                    </h3>
                                    <span className="px-2 py-1 bg-orange-100 text-orange-800 text-xs rounded-full">
                                        {dashboardData?.low_stock_products?.length || 0}
                                    </span>
                                </div>
                            </div>
                            
                            <div className="p-4 max-h-80 overflow-y-auto">
                                {loading ? (
                                    <div className="space-y-3">
                                        {[1,2,3].map(i => (
                                            <div key={i} className="animate-pulse">
                                                <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
                                                <div className="h-3 bg-gray-200 rounded w-1/2"></div>
                                            </div>
                                        ))}
                                    </div>
                                ) : dashboardData?.low_stock_products?.length > 0 ? (
                                    <div className="space-y-3">
                                        {dashboardData.low_stock_products.slice(0, 10).map((product, index) => (
                                            <div key={index} className="flex justify-between items-center py-2">
                                                <div className="min-w-0 flex-1 mr-4">
                                                    <p className="font-medium text-sm truncate">{product.nom}</p>
                                                    <p className="text-xs text-gray-500 truncate">{product.category}</p>
                                                </div>
                                                <span className={`px-2 py-1 rounded-full text-xs font-medium whitespace-nowrap ${
                                                    product.stock_actuel === 0 
                                                        ? 'bg-red-100 text-red-800' 
                                                        : 'bg-orange-100 text-orange-800'
                                                }`}>
                                                    {product.stock_actuel === 0 ? 'Rupture' : `${product.stock_actuel} restant(s)`}
                                                </span>
                                            </div>
                                        ))}
                                    </div>
                                ) : (
                                    <div className="text-center py-8 text-gray-500">
                                        <CheckCircle className="w-8 h-8 mx-auto mb-2 text-green-500" />
                                        <p>Tous les stocks sont suffisants</p>
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Produits populaires */}
                        <div className="bg-white rounded-lg shadow-sm border">
                            <div className="p-4 border-b">
                                <div className="flex items-center justify-between">
                                    <h3 className="font-semibold text-gray-900 flex items-center">
                                        <TrendingUp className="w-5 h-5 text-green-500 mr-2" />
                                        Top Produits
                                    </h3>
                                    <span className="px-2 py-1 bg-green-100 text-green-800 text-xs rounded-full">
                                        {dashboardData?.popular_products?.length || 0}
                                    </span>
                                </div>
                            </div>
                            
                            <div className="p-4 max-h-80 overflow-y-auto">
                                {loading ? (
                                    <div className="space-y-3">
                                        {[1,2,3].map(i => (
                                            <div key={i} className="animate-pulse">
                                                <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
                                                <div className="h-3 bg-gray-200 rounded w-1/2"></div>
                                            </div>
                                        ))}
                                    </div>
                                ) : dashboardData?.popular_products?.length > 0 ? (
                                    <div className="space-y-3">
                                        {dashboardData.popular_products.slice(0, 10).map((product, index) => (
                                            <div key={index} className="flex justify-between items-center py-2">
                                                <div className="min-w-0 flex-1 mr-4">
                                                    <p className="font-medium text-sm truncate">{product.nom}</p>
                                                    <p className="text-xs text-gray-500 truncate">
                                                        {product.category} • {formatCurrency(product.prix)}
                                                    </p>
                                                </div>
                                                <span className="px-2 py-1 bg-green-100 text-green-800 text-xs rounded-full font-medium whitespace-nowrap">
                                                    {product.ventes} ventes
                                                </span>
                                            </div>
                                        ))}
                                    </div>
                                ) : (
                                    <div className="text-center py-8 text-gray-500">
                                        <Package className="w-8 h-8 mx-auto mb-2" />
                                        <p>Aucune vente récente</p>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>

                    {/* Statistiques rapides */}
                    {dashboardData && (
                        <div className="mt-6 bg-white rounded-lg shadow-sm border p-4 sm:p-6">
                            <h3 className="font-semibold text-gray-900 mb-4">Résumé rapide</h3>
                            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                                <div className="text-center">
                                    <p className="text-xl sm:text-2xl font-bold text-blue-600">
                                        {formatNumber(dashboardData.overview?.commandes_aujourd_hui || 0)}
                                    </p>
                                    <p className="text-xs sm:text-sm text-gray-500">Commandes aujourd'hui</p>
                                </div>
                                <div className="text-center">
                                    <p className="text-xl sm:text-2xl font-bold text-green-600">
                                        {formatCurrency(dashboardData.overview?.chiffre_affaires_aujourd_hui || 0)}
                                    </p>
                                    <p className="text-xs sm:text-sm text-gray-500">CA aujourd'hui</p>
                                </div>
                                <div className="text-center">
                                    <p className="text-xl sm:text-2xl font-bold text-purple-600">
                                        {formatNumber(dashboardData.overview?.nouveaux_clients_aujourd_hui || 0)}
                                    </p>
                                    <p className="text-xs sm:text-sm text-gray-500">Nouveaux clients</p>
                                </div>
                                <div className="text-center">
                                    <p className="text-xl sm:text-2xl font-bold text-orange-600">
                                        {dashboardData.orders?.completion_rate || 0}%
                                    </p>
                                    <p className="text-xs sm:text-sm text-gray-500">Taux de completion</p>
                                </div>
                            </div>
                        </div>
                    )}
                </main>
            </div>
        </div>
    );
};

export default Dashboard;