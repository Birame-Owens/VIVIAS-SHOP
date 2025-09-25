import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { 
    BarChart3, 
    TrendingUp, 
    Package, 
    Users, 
    DollarSign, 
    Warehouse, 
    ShoppingCart,
    UserCheck,
    Scissors,
    Download,
    Filter,
    Calendar,
    RefreshCw,
    Eye,
    FileText,
    Mail,
    Clock,
    AlertTriangle,
    CheckCircle,
    X,
    ChevronDown,
    ChevronRight,
    ArrowUp,
    ArrowDown,
    Minus
} from 'lucide-react';
import { toast } from 'react-hot-toast';
import ReportDetailsModal from './ReportDetailsModal';
import { LineChart, Line, BarChart, Bar, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

const Reports = () => {
    const { token } = useAuth();
    
    // États principaux
    const [reports, setReports] = useState([]);
    const [loading, setLoading] = useState(true);
    const [generating, setGenerating] = useState(false);
    const [exporting, setExporting] = useState(false);
    
    // États des rapports
    const [selectedReport, setSelectedReport] = useState(null);
    const [reportData, setReportData] = useState(null);
    const [showDetailModal, setShowDetailModal] = useState(false);
    
    // États des filtres
    const [filters, setFilters] = useState({
        periode: '30_jours',
        date_debut: '',
        date_fin: '',
        group_by: 'day',
        limit: 20,
        format_export: 'excel'
    });
    
    // États du dashboard
    const [dashboardData, setDashboardData] = useState({});
    const [alertes, setAlertes] = useState([]);
    const [tendances, setTendances] = useState({});

    const API_BASE = '/api/admin';

    const getHeaders = () => {
        const headers = {
            'Authorization': `Bearer ${token}`,
            'Accept': 'application/json',
            'Content-Type': 'application/json'
        };

        const csrfToken = document.querySelector('meta[name="csrf-token"]')?.getAttribute('content');
        if (csrfToken) {
            headers['X-CSRF-TOKEN'] = csrfToken;
        }

        return headers;
    };

    // Types de rapports disponibles
    const reportTypes = [
        {
            id: 'ventes',
            nom: 'Rapport des Ventes',
            description: 'Analyse des ventes par période avec graphiques',
            icone: TrendingUp,
            couleur: 'green'
        },
        {
            id: 'produits',
            nom: 'Rapport des Produits',
            description: 'Produits les plus vendus et analyse par catégorie',
            icone: Package,
            couleur: 'blue'
        },
        {
            id: 'clients',
            nom: 'Rapport des Clients',
            description: 'Analyse de la clientèle et segmentation',
            icone: Users,
            couleur: 'purple'
        },
        {
            id: 'financier',
            nom: 'Rapport Financier',
            description: 'Chiffre d\'affaires, paiements et créances',
            icone: DollarSign,
            couleur: 'emerald'
        },
        {
            id: 'stock',
            nom: 'Rapport de Stock',
            description: 'État des stocks et alertes',
            icone: Warehouse,
            couleur: 'orange'
        },
        {
            id: 'commandes',
            nom: 'Rapport des Commandes',
            description: 'Analyse des commandes par statut et période',
            icone: ShoppingCart,
            couleur: 'indigo'
        },
         {
        id: 'analytics',
        nom: 'Analytics Web',
        description: 'Visiteurs, sessions, sources de trafic',
        icone: BarChart3,
        couleur: 'teal'
    },
    {
        id: 'performance-produits',
        nom: 'Performance Produits',
        description: 'Taux de conversion, produits consultés vs vendus',
        icone: TrendingUp,
        couleur: 'rose'
    }
       
    ];

    // Charger les données
    useEffect(() => {
        loadDashboard();
        loadAlertes();
        loadTendances();
    }, []);

    const loadDashboard = async () => {
        try {
            setLoading(true);
            const response = await fetch(`${API_BASE}/rapports/dashboard`, {
                headers: getHeaders()
            });

            if (!response.ok) throw new Error('Erreur lors du chargement');

            const result = await response.json();
            if (result.success) {
                setDashboardData(result.data);
            }
        } catch (error) {
            console.error('Erreur dashboard:', error);
            toast.error('Erreur lors du chargement du dashboard');
        } finally {
            setLoading(false);
        }
    };

    const loadAlertes = async () => {
        try {
            const response = await fetch(`${API_BASE}/rapports/alertes`, {
                headers: getHeaders()
            });

            if (!response.ok) throw new Error('Erreur lors du chargement');

            const result = await response.json();
            if (result.success) {
                setAlertes(result.data);
            }
        } catch (error) {
            console.error('Erreur alertes:', error);
        }
    };

    const loadTendances = async () => {
        try {
            const response = await fetch(`${API_BASE}/rapports/tendances?type=ventes&periode=12_mois`, {
                headers: getHeaders()
            });

            if (!response.ok) throw new Error('Erreur lors du chargement');

            const result = await response.json();
            if (result.success) {
                setTendances(result.data);
            }
        } catch (error) {
            console.error('Erreur tendances:', error);
        }
    };

    const generateReport = async (reportType) => {
        try {
            setGenerating(true);
            setSelectedReport(reportType);

            // Construire les paramètres
            const params = new URLSearchParams(filters);
            
            const response = await fetch(`${API_BASE}/rapports/${reportType}?${params}`, {
                headers: getHeaders()
            });

            if (!response.ok) throw new Error('Erreur lors de la génération');

            const result = await response.json();
            if (result.success) {
                setReportData(result.data);
                setShowDetailModal(true);
                toast.success('Rapport généré avec succès');
            } else {
                toast.error(result.message || 'Erreur lors de la génération');
            }
        } catch (error) {
            console.error('Erreur génération:', error);
            toast.error('Erreur lors de la génération du rapport');
        } finally {
            setGenerating(false);
        }
    };

    const exportReport = async (reportType, format) => {
        try {
            setExporting(true);
            
            const response = await fetch(`${API_BASE}/rapports/export`, {
                method: 'POST',
                headers: getHeaders(),
                body: JSON.stringify({
                    type: reportType,
                    format: format,
                    ...filters
                })
            });

            if (!response.ok) throw new Error('Erreur lors de l\'export');

            const result = await response.json();
            if (result.success) {
                // Déclencher le téléchargement
                const link = document.createElement('a');
                link.href = result.data.download_url;
                link.download = result.data.filename;
                link.click();
                
                toast.success('Export réussi');
            } else {
                toast.error(result.message || 'Erreur lors de l\'export');
            }
        } catch (error) {
            console.error('Erreur export:', error);
            toast.error('Erreur lors de l\'export');
        } finally {
            setExporting(false);
        }
    };

    const handleFilterChange = (field, value) => {
        setFilters(prev => ({ ...prev, [field]: value }));
    };

    const formatPrice = (price) => {
        return new Intl.NumberFormat('fr-SN', {
            style: 'currency',
            currency: 'XOF',
            minimumFractionDigits: 0
        }).format(price || 0);
    };

    const formatNumber = (number) => {
        return new Intl.NumberFormat('fr-SN').format(number || 0);
    };

    const getColorClass = (color) => {
        const colors = {
            green: 'text-green-600 bg-green-50',
            blue: 'text-blue-600 bg-blue-50',
            purple: 'text-purple-600 bg-purple-50',
            emerald: 'text-emerald-600 bg-emerald-50',
            orange: 'text-orange-600 bg-orange-50',
            indigo: 'text-indigo-600 bg-indigo-50',
            cyan: 'text-cyan-600 bg-cyan-50',
            pink: 'text-pink-600 bg-pink-50'
        };
        return colors[color] || 'text-gray-600 bg-gray-50';
    };

    const getTrendIcon = (trend) => {
        if (trend > 0) return <ArrowUp className="w-4 h-4 text-green-500" />;
        if (trend < 0) return <ArrowDown className="w-4 h-4 text-red-500" />;
        return <Minus className="w-4 h-4 text-gray-400" />;
    };

    const getAlertIcon = (niveau) => {
        const icons = {
            'info': <CheckCircle className="w-5 h-5 text-blue-500" />,
            'warning': <AlertTriangle className="w-5 h-5 text-yellow-500" />,
            'critique': <X className="w-5 h-5 text-red-500" />
        };
        return icons[niveau] || icons.info;
    };

    // Couleurs pour les graphiques
    const CHART_COLORS = ['#8884d8', '#82ca9d', '#ffc658', '#ff7300', '#8dd1e1'];

    return (
        <div className="p-6">
            {/* Header */}
            <div className="mb-6">
                <div className="flex items-center justify-between mb-6">
                    <div>
                        <h1 className="text-2xl font-bold text-gray-900">Rapports & Analytics</h1>
                        <p className="text-gray-600">Analyses et statistiques de votre boutique VIVIAS</p>
                    </div>
                    <button
                        onClick={loadDashboard}
                        className="bg-purple-600 text-white px-4 py-2 rounded-lg hover:bg-purple-700 flex items-center space-x-2"
                        disabled={loading}
                    >
                        <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
                        <span>Actualiser</span>
                    </button>
                </div>

                {/* KPIs Dashboard */}
                {dashboardData && Object.keys(dashboardData).length > 0 && (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
                        <div className="bg-white p-4 rounded-lg shadow-sm border">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-sm text-gray-600">CA ce mois</p>
                                    <p className="text-2xl font-bold text-green-600">
                                        {formatPrice(dashboardData.ca_ce_mois)}
                                    </p>
                                    <div className="flex items-center mt-1">
                                        {getTrendIcon(dashboardData.evolution_ca)}
                                        <span className="text-xs text-gray-500 ml-1">
                                            {Math.abs(dashboardData.evolution_ca || 0).toFixed(1)}% vs mois dernier
                                        </span>
                                    </div>
                                </div>
                                <DollarSign className="w-8 h-8 text-green-500" />
                            </div>
                        </div>

                        <div className="bg-white p-4 rounded-lg shadow-sm border">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-sm text-gray-600">Commandes</p>
                                    <p className="text-2xl font-bold text-blue-600">
                                        {formatNumber(dashboardData.commandes_ce_mois)}
                                    </p>
                                    <div className="flex items-center mt-1">
                                        {getTrendIcon(dashboardData.evolution_commandes)}
                                        <span className="text-xs text-gray-500 ml-1">
                                            {Math.abs(dashboardData.evolution_commandes || 0).toFixed(1)}% vs mois dernier
                                        </span>
                                    </div>
                                </div>
                                <ShoppingCart className="w-8 h-8 text-blue-500" />
                            </div>
                        </div>

                        <div className="bg-white p-4 rounded-lg shadow-sm border">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-sm text-gray-600">Nouveaux clients</p>
                                    <p className="text-2xl font-bold text-purple-600">
                                        {formatNumber(dashboardData.nouveaux_clients)}
                                    </p>
                                    <div className="flex items-center mt-1">
                                        {getTrendIcon(dashboardData.evolution_clients)}
                                        <span className="text-xs text-gray-500 ml-1">
                                            {Math.abs(dashboardData.evolution_clients || 0).toFixed(1)}% vs mois dernier
                                        </span>
                                    </div>
                                </div>
                                <Users className="w-8 h-8 text-purple-500" />
                            </div>
                        </div>

                        <div className="bg-white p-4 rounded-lg shadow-sm border">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-sm text-gray-600">Panier moyen</p>
                                    <p className="text-2xl font-bold text-orange-600">
                                        {formatPrice(dashboardData.panier_moyen)}
                                    </p>
                                    <div className="flex items-center mt-1">
                                        {getTrendIcon(dashboardData.evolution_panier)}
                                        <span className="text-xs text-gray-500 ml-1">
                                            {Math.abs(dashboardData.evolution_panier || 0).toFixed(1)}% vs mois dernier
                                        </span>
                                    </div>
                                </div>
                                <BarChart3 className="w-8 h-8 text-orange-500" />
                            </div>
                        </div>
                    </div>
                )}

                {/* Alertes */}
                {alertes.length > 0 && (
                    <div className="bg-white rounded-lg shadow-sm border mb-6 p-4">
                        <h3 className="text-lg font-semibold mb-3 flex items-center">
                            <AlertTriangle className="w-5 h-5 mr-2 text-yellow-500" />
                            Alertes ({alertes.length})
                        </h3>
                        <div className="space-y-2">
                            {alertes.slice(0, 3).map((alerte, index) => (
                                <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                                    <div className="flex items-center space-x-3">
                                        {getAlertIcon(alerte.niveau)}
                                        <div>
                                            <p className="font-medium text-gray-900">{alerte.titre}</p>
                                            <p className="text-sm text-gray-600">{alerte.message}</p>
                                        </div>
                                    </div>
                                    <div className="text-xs text-gray-500">{alerte.date}</div>
                                </div>
                            ))}
                            {alertes.length > 3 && (
                                <div className="text-center">
                                    <button className="text-purple-600 text-sm hover:underline">
                                        Voir toutes les alertes ({alertes.length})
                                    </button>
                                </div>
                            )}
                        </div>
                    </div>
                )}
            </div>

            {/* Filtres de génération */}
            <div className="bg-white rounded-lg shadow-sm border mb-6 p-4">
                <div className="flex items-center mb-4">
                    <Filter className="w-5 h-5 mr-2 text-gray-500" />
                    <h3 className="text-lg font-semibold">Paramètres des rapports</h3>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Période</label>
                        <select
                            value={filters.periode}
                            onChange={(e) => handleFilterChange('periode', e.target.value)}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                        >
                            <option value="7_jours">Les 7 derniers jours</option>
                            <option value="30_jours">Les 30 derniers jours</option>
                            <option value="mois_actuel">Mois actuel</option>
                            <option value="mois_precedent">Mois précédent</option>
                            <option value="trimestre_actuel">Trimestre actuel</option>
                            <option value="annee_actuelle">Année actuelle</option>
                            <option value="personnalise">Période personnalisée</option>
                        </select>
                    </div>

                    {filters.periode === 'personnalise' && (
                        <>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Date début</label>
                                <input
                                    type="date"
                                    value={filters.date_debut}
                                    onChange={(e) => handleFilterChange('date_debut', e.target.value)}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Date fin</label>
                                <input
                                    type="date"
                                    value={filters.date_fin}
                                    onChange={(e) => handleFilterChange('date_fin', e.target.value)}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                                />
                            </div>
                        </>
                    )}

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Groupement</label>
                        <select
                            value={filters.group_by}
                            onChange={(e) => handleFilterChange('group_by', e.target.value)}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                        >
                            <option value="day">Par jour</option>
                            <option value="week">Par semaine</option>
                            <option value="month">Par mois</option>
                            <option value="year">Par année</option>
                        </select>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Format export</label>
                        <select
                            value={filters.format_export}
                            onChange={(e) => handleFilterChange('format_export', e.target.value)}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                        >
                            <option value="excel">Excel (.xlsx)</option>
                            <option value="csv">CSV (.csv)</option>
                            <option value="pdf">PDF (.pdf)</option>
                        </select>
                    </div>
                </div>
            </div>

            {/* Grille des rapports */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                {reportTypes.map((report) => {
                    const Icon = report.icone;
                    return (
                        <div key={report.id} className="bg-white rounded-lg shadow-sm border hover:shadow-md transition-shadow">
                            <div className="p-6">
                                <div className={`w-12 h-12 rounded-lg ${getColorClass(report.couleur)} flex items-center justify-center mb-4`}>
                                    <Icon className="w-6 h-6" />
                                </div>
                                
                                <h3 className="text-lg font-semibold text-gray-900 mb-2">{report.nom}</h3>
                                <p className="text-sm text-gray-600 mb-4">{report.description}</p>
                                
                                <div className="flex flex-col space-y-2">
                                    <button
                                        onClick={() => generateReport(report.id)}
                                        disabled={generating && selectedReport === report.id}
                                        className="w-full bg-purple-600 text-white px-4 py-2 rounded-lg hover:bg-purple-700 disabled:opacity-50 flex items-center justify-center space-x-2"
                                    >
                                        {generating && selectedReport === report.id ? (
                                            <>
                                                <RefreshCw className="w-4 h-4 animate-spin" />
                                                <span>Génération...</span>
                                            </>
                                        ) : (
                                            <>
                                                <Eye className="w-4 h-4" />
                                                <span>Générer</span>
                                            </>
                                        )}
                                    </button>
                                    
                                    <button
                                        onClick={() => exportReport(report.id, filters.format_export)}
                                        disabled={exporting}
                                        className="w-full bg-gray-600 text-white px-4 py-2 rounded-lg hover:bg-gray-700 disabled:opacity-50 flex items-center justify-center space-x-2"
                                    >
                                        {exporting ? (
                                            <>
                                                <RefreshCw className="w-4 h-4 animate-spin" />
                                                <span>Export...</span>
                                            </>
                                        ) : (
                                            <>
                                                <Download className="w-4 h-4" />
                                                <span>Exporter</span>
                                            </>
                                        )}
                                    </button>
                                </div>
                            </div>
                        </div>
                    );
                })}
            </div>

            {/* Graphique des tendances */}
            {tendances && Object.keys(tendances).length > 0 && (
                <div className="bg-white rounded-lg shadow-sm border mt-6 p-6">
                    <div className="flex items-center justify-between mb-4">
                        <h3 className="text-lg font-semibold">Tendances des ventes (12 derniers mois)</h3>
                        <button
                            onClick={() => loadTendances()}
                            className="text-purple-600 hover:text-purple-800"
                        >
                            <RefreshCw className="w-4 h-4" />
                        </button>
                    </div>
                    
                    {tendances.evolution && (
                        <div className="h-80">
                            <ResponsiveContainer width="100%" height="100%">
                                <LineChart data={tendances.evolution}>
                                    <CartesianGrid strokeDasharray="3 3" />
                                    <XAxis dataKey="periode" />
                                    <YAxis />
                                    <Tooltip formatter={(value) => [formatPrice(value), 'Chiffre d\'affaires']} />
                                    <Legend />
                                    <Line 
                                        type="monotone" 
                                        dataKey="chiffre_affaires" 
                                        stroke="#8884d8" 
                                        strokeWidth={2}
                                        name="CA"
                                    />
                                </LineChart>
                            </ResponsiveContainer>
                        </div>
                    )}
                </div>
            )}

            {/* Modal des détails */}
            {showDetailModal && selectedReport && reportData && (
                <ReportDetailsModal
                    reportType={selectedReport}
                    reportData={reportData}
                    onClose={() => {
                        setShowDetailModal(false);
                        setReportData(null);
                        setSelectedReport(null);
                    }}
                    onExport={(format) => exportReport(selectedReport, format)}
                    formatPrice={formatPrice}
                    formatNumber={formatNumber}
                    exporting={exporting}
                />
            )}
        </div>
    );
};

export default Reports;