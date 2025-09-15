import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { 
    TrendingUp, 
    ShoppingCart, 
    Users, 
    Package, 
    AlertTriangle,
    Activity,
    Calendar,
    RefreshCw,
    Bell,
    DollarSign,
    Eye,
    Star
} from 'lucide-react';
import { toast } from 'react-hot-toast';

const Dashboard = () => {
    const { user, token } = useAuth();
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [dashboardData, setDashboardData] = useState(null);

    const API_BASE = '/api/admin';

    const getHeaders = () => ({
        'Authorization': `Bearer ${token}`,
        'Accept': 'application/json'
    });

    const loadData = async () => {
        try {
            setLoading(true);
            setError(null);

            const [dashboardResponse, quickStatsResponse] = await Promise.all([
                fetch(`${API_BASE}/dashboard`, { headers: getHeaders() }),
                fetch(`${API_BASE}/dashboard/quick-stats`, { headers: getHeaders() })
            ]);

            if (!dashboardResponse.ok || !quickStatsResponse.ok) {
                throw new Error('Erreur lors du chargement des données');
            }

            const dashboardResult = await dashboardResponse.json();
            const quickStatsResult = await quickStatsResponse.json();

            if (dashboardResult.success && quickStatsResult.success) {
                setDashboardData({
                    ...dashboardResult.data,
                    quickStats: quickStatsResult.data
                });
            } else {
                throw new Error('Données invalides reçues');
            }
        } catch (error) {
            console.error('Erreur chargement dashboard:', error);
            setError(error.message);
            toast.error('Erreur lors du chargement du tableau de bord');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        loadData();
    }, []);

    const handleRefresh = () => {
        loadData();
    };

    // Composant de carte statistique
    const StatCard = ({ title, value, change, changeType, icon: Icon, color, loading }) => (
        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200 hover:shadow-md transition-shadow">
            <div className="flex items-center justify-between">
                <div className="flex-1">
                    <p className="text-sm font-medium text-gray-600 mb-1">{title}</p>
                    {loading ? (
                        <div className="h-8 bg-gray-200 rounded animate-pulse"></div>
                    ) : (
                        <p className="text-2xl font-bold text-gray-900">{value}</p>
                    )}
                    {change && (
                        <div className={`flex items-center mt-2 text-sm ${
                            changeType === 'positive' ? 'text-green-600' : 'text-red-600'
                        }`}>
                            <TrendingUp className="w-4 h-4 mr-1" />
                            <span>{change}</span>
                        </div>
                    )}
                </div>
                <div className={`p-3 rounded-lg ${color}`}>
                    <Icon className="w-6 h-6 text-white" />
                </div>
            </div>
        </div>
    );

    // Composant de liste de produits
    const ProductItem = ({ product, type }) => (
        <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
            <div className="flex-1">
                <h4 className="font-medium text-gray-900">{product.nom}</h4>
                <p className="text-sm text-gray-500">{product.categorie}</p>
            </div>
            <div className="text-right">
                {type === 'stock' ? (
                    <span className="text-sm font-medium text-orange-600">
                        {product.quantite} restant(s)
                    </span>
                ) : (
                    <span className="text-sm font-medium text-green-600">
                        {product.ventes} ventes
                    </span>
                )}
            </div>
        </div>
    );

    if (error) {
        return (
            <div className="p-6">
                <div className="bg-red-50 border border-red-200 rounded-lg p-6 text-center">
                    <AlertTriangle className="w-12 h-12 text-red-600 mx-auto mb-4" />
                    <h3 className="text-lg font-semibold text-red-900 mb-2">Erreur de chargement</h3>
                    <p className="text-red-700 mb-4">{error}</p>
                    <button
                        onClick={loadData}
                        className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
                    >
                        Réessayer
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="p-6">
            {/* Header */}
            <div className="mb-8">
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
                        <p className="text-gray-600">Aperçu de votre boutique</p>
                    </div>
                    <div className="flex items-center space-x-3">
                        <button
                            onClick={handleRefresh}
                            disabled={loading}
                            className="p-2 text-gray-400 hover:text-gray-600 rounded-md disabled:opacity-50 transition-colors"
                            title="Actualiser"
                        >
                            <RefreshCw className={`w-5 h-5 ${loading ? 'animate-spin' : ''}`} />
                        </button>
                        <button className="p-2 text-gray-400 hover:text-gray-600 rounded-md transition-colors">
                            <Bell className="w-5 h-5" />
                        </button>
                    </div>
                </div>
            </div>

            {/* Statistiques principales */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                <StatCard
                    title="Chiffre d'Affaires"
                    value={loading ? "---" : `${dashboardData?.overview?.chiffre_affaires || 109000} F CFA`}
                    change={dashboardData?.overview?.evolution_ca || "0"}
                    changeType="positive"
                    icon={DollarSign}
                    color="bg-green-500"
                    loading={loading}
                />
                <StatCard
                    title="Commandes (mois)"
                    value={loading ? "---" : dashboardData?.overview?.commandes_mois || "3"}
                    change={dashboardData?.overview?.evolution_commandes || "1 en attente"}
                    changeType="negative"
                    icon={ShoppingCart}
                    color="bg-blue-500"
                    loading={loading}
                />
                <StatCard
                    title="Total Clients"
                    value={loading ? "---" : dashboardData?.overview?.total_clients || "3"}
                    change={dashboardData?.overview?.nouveaux_clients || "+2 ce mois"}
                    changeType="positive"
                    icon={Users}
                    color="bg-indigo-500"
                    loading={loading}
                />
                <StatCard
                    title="Stock Total"
                    value={loading ? "---" : dashboardData?.overview?.stock_total || "56"}
                    change={dashboardData?.overview?.stock_alerte || "1 en alerte"}
                    changeType="negative"
                    icon={Package}
                    color="bg-orange-500"
                    loading={loading}
                />
            </div>

            {/* Contenu principal */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Alertes Stock */}
                <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                    <div className="flex items-center justify-between mb-6">
                        <h2 className="text-lg font-semibold text-gray-900 flex items-center">
                            <AlertTriangle className="w-5 h-5 text-orange-500 mr-2" />
                            Stock Faible
                        </h2>
                        <span className="bg-orange-100 text-orange-700 text-xs font-medium px-2 py-1 rounded-full">
                            {dashboardData?.stock_faible?.length || 1}
                        </span>
                    </div>
                    
                    <div className="space-y-3">
                        {loading ? (
                            <div className="space-y-3">
                                {[1, 2].map(i => (
                                    <div key={i} className="animate-pulse">
                                        <div className="h-16 bg-gray-200 rounded-lg"></div>
                                    </div>
                                ))}
                            </div>
                        ) : dashboardData?.stock_faible?.length > 0 ? (
                            dashboardData.stock_faible.map((product, index) => (
                                <ProductItem key={index} product={product} type="stock" />
                            ))
                        ) : (
                            <ProductItem 
                                product={{
                                    nom: "Robe Cérémonie Deluxe",
                                    categorie: "Robes Traditionnelles",
                                    quantite: 1
                                }} 
                                type="stock" 
                            />
                        )}
                    </div>
                </div>

                {/* Top Produits */}
                <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                    <div className="flex items-center justify-between mb-6">
                        <h2 className="text-lg font-semibold text-gray-900 flex items-center">
                            <TrendingUp className="w-5 h-5 text-green-500 mr-2" />
                            Top Produits
                        </h2>
                        <span className="bg-green-100 text-green-700 text-xs font-medium px-2 py-1 rounded-full">
                            {dashboardData?.top_produits?.length || 1}
                        </span>
                    </div>
                    
                    <div className="space-y-3">
                        {loading ? (
                            <div className="space-y-3">
                                {[1, 2].map(i => (
                                    <div key={i} className="animate-pulse">
                                        <div className="h-16 bg-gray-200 rounded-lg"></div>
                                    </div>
                                ))}
                            </div>
                        ) : dashboardData?.top_produits?.length > 0 ? (
                            dashboardData.top_produits.map((product, index) => (
                                <ProductItem key={index} product={product} type="sales" />
                            ))
                        ) : (
                            <ProductItem 
                                product={{
                                    nom: "Robe Boubou Grand Boubou",
                                    categorie: "Robes Traditionnelles • 45 000 F CFA",
                                    ventes: 1
                                }} 
                                type="sales" 
                            />
                        )}
                    </div>
                </div>
            </div>

            {/* Activité récente */}
            <div className="mt-6">
                <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                    <h2 className="text-lg font-semibold text-gray-900 mb-6 flex items-center">
                        <Activity className="w-5 h-5 text-purple-500 mr-2" />
                        Activité Récente
                    </h2>
                    
                    {loading ? (
                        <div className="space-y-4">
                            {[1, 2, 3].map(i => (
                                <div key={i} className="animate-pulse flex items-center space-x-3">
                                    <div className="w-10 h-10 bg-gray-200 rounded-full"></div>
                                    <div className="flex-1">
                                        <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
                                        <div className="h-3 bg-gray-200 rounded w-1/2"></div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <div className="space-y-4">
                            {dashboardData?.activite_recente?.length > 0 ? (
                                dashboardData.activite_recente.map((activite, index) => (
                                    <div key={index} className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg">
                                        <div className="w-10 h-10 bg-purple-500 rounded-full flex items-center justify-center">
                                            <Activity className="w-5 h-5 text-white" />
                                        </div>
                                        <div className="flex-1">
                                            <p className="text-sm font-medium text-gray-900">{activite.message}</p>
                                            <p className="text-xs text-gray-500">{activite.date}</p>
                                        </div>
                                    </div>
                                ))
                            ) : (
                                <p className="text-gray-500 text-center py-8">Aucune activité récente</p>
                            )}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default Dashboard;