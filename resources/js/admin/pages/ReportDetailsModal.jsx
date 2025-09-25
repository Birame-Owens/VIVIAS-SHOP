import React, { useState } from 'react';
import { 
    X, 
    Download, 
    TrendingUp, 
    TrendingDown, 
    Package, 
    Users, 
    DollarSign, 
    ShoppingCart,
    Warehouse,
    AlertTriangle,
    FileText,
    Calendar,
    RefreshCw,
    BarChart3,
    PieChart,
    Activity,
    Eye,
} from 'lucide-react';
import { LineChart, Line, BarChart, Bar, PieChart as RechartsPieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

const ReportDetailsModal = ({ 
    reportType, 
    reportData, 
    onClose, 
    onExport, 
    formatPrice, 
    formatNumber, 
    exporting 
}) => {
    const [activeTab, setActiveTab] = useState('overview');
    const [exportFormat, setExportFormat] = useState('excel');

    // Couleurs pour les graphiques
    const CHART_COLORS = ['#8884d8', '#82ca9d', '#ffc658', '#ff7300', '#8dd1e1', '#d084d0'];

    const getReportTitle = (type) => {
        const titles = {
            'ventes': 'Rapport des Ventes',
            'produits': 'Rapport des Produits',
            'clients': 'Rapport des Clients',
            'financier': 'Rapport Financier',
            'stock': 'Rapport de Stock',
            'commandes': 'Rapport des Commandes',
            'tailleurs': 'Rapport des Tailleurs',
            'tissus': 'Rapport des Tissus'
        };
        return titles[type] || 'Rapport';
    };

    const getReportIcon = (type) => {
        const icons = {
            'ventes': TrendingUp,
            'produits': Package,
            'clients': Users,
            'financier': DollarSign,
            'stock': Warehouse,
            'commandes': ShoppingCart,
            'tailleurs': Users,
            'tissus': Package
        };
        const Icon = icons[type] || FileText;
        return <Icon className="w-6 h-6" />;
    };

    const renderVentesReport = () => {
        const { ventes, totaux, graphique_data } = reportData;

        return (
            <div className="space-y-6">
                {/* KPIs */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                    <div className="bg-green-50 p-4 rounded-lg">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm text-green-600 font-medium">Chiffre d'affaires</p>
                                <p className="text-2xl font-bold text-green-700">
                                    {formatPrice(totaux.total_ca)}
                                </p>
                            </div>
                            <DollarSign className="w-8 h-8 text-green-500" />
                        </div>
                    </div>

                    <div className="bg-blue-50 p-4 rounded-lg">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm text-blue-600 font-medium">Commandes</p>
                                <p className="text-2xl font-bold text-blue-700">
                                    {formatNumber(totaux.total_commandes)}
                                </p>
                            </div>
                            <ShoppingCart className="w-8 h-8 text-blue-500" />
                        </div>
                    </div>

                    <div className="bg-purple-50 p-4 rounded-lg">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm text-purple-600 font-medium">Panier moyen</p>
                                <p className="text-2xl font-bold text-purple-700">
                                    {formatPrice(totaux.panier_moyen_global)}
                                </p>
                            </div>
                            <BarChart3 className="w-8 h-8 text-purple-500" />
                        </div>
                    </div>

                    <div className="bg-orange-50 p-4 rounded-lg">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm text-orange-600 font-medium">Clients uniques</p>
                                <p className="text-2xl font-bold text-orange-700">
                                    {formatNumber(totaux.total_clients_uniques)}
                                </p>
                            </div>
                            <Users className="w-8 h-8 text-orange-500" />
                        </div>
                    </div>
                </div>

                {/* Graphique */}
                {graphique_data && (
                    <div className="bg-gray-50 p-4 rounded-lg">
                        <h4 className="text-lg font-semibold mb-4">Évolution des ventes</h4>
                        <div className="h-80">
                            <ResponsiveContainer width="100%" height="100%">
                                <LineChart data={ventes}>
                                    <CartesianGrid strokeDasharray="3 3" />
                                    <XAxis dataKey="periode" />
                                    <YAxis />
                                    <Tooltip 
                                        formatter={(value, name) => [
                                            name === 'chiffre_affaires' ? formatPrice(value) : formatNumber(value), 
                                            name === 'chiffre_affaires' ? 'CA' : 
                                            name === 'nombre_commandes' ? 'Commandes' : 
                                            name === 'panier_moyen' ? 'Panier moyen' : name
                                        ]} 
                                    />
                                    <Legend />
                                    <Line type="monotone" dataKey="chiffre_affaires" stroke="#10b981" strokeWidth={2} name="CA" />
                                    <Line type="monotone" dataKey="nombre_commandes" stroke="#3b82f6" strokeWidth={2} name="Commandes" />
                                </LineChart>
                            </ResponsiveContainer>
                        </div>
                    </div>
                )}

                {/* Tableau détaillé */}
                <div className="bg-white border rounded-lg">
                    <div className="px-4 py-3 border-b">
                        <h4 className="text-lg font-semibold">Détail par période</h4>
                    </div>
                    <div className="overflow-x-auto">
                        <table className="w-full">
                            <thead className="bg-gray-50">
                                <tr>
                                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Période</th>
                                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">CA</th>
                                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Commandes</th>
                                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Panier moyen</th>
                                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Clients</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-200">
                                {ventes.map((periode, index) => (
                                    <tr key={index}>
                                        <td className="px-4 py-3 text-sm font-medium">{periode.periode}</td>
                                        <td className="px-4 py-3 text-sm">{formatPrice(periode.chiffre_affaires)}</td>
                                        <td className="px-4 py-3 text-sm">{formatNumber(periode.nombre_commandes)}</td>
                                        <td className="px-4 py-3 text-sm">{formatPrice(periode.panier_moyen)}</td>
                                        <td className="px-4 py-3 text-sm">{formatNumber(periode.clients_uniques)}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        );
    };

    const renderProduitsReport = () => {
        const { produits, categories } = reportData;

        return (
            <div className="space-y-6">
                {/* Top produits */}
                <div className="bg-white border rounded-lg">
                    <div className="px-4 py-3 border-b">
                        <h4 className="text-lg font-semibold">Top produits vendus</h4>
                    </div>
                    <div className="overflow-x-auto">
                        <table className="w-full">
                            <thead className="bg-gray-50">
                                <tr>
                                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Produit</th>
                                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Catégorie</th>
                                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Quantité vendue</th>
                                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">CA</th>
                                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Prix moyen</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-200">
                                {produits.map((produit, index) => (
                                    <tr key={index}>
                                        <td className="px-4 py-3">
                                            <div className="text-sm font-medium text-gray-900">{produit.nom}</div>
                                            <div className="text-xs text-gray-500">{produit.nombre_commandes} commandes</div>
                                        </td>
                                        <td className="px-4 py-3 text-sm">{produit.categorie}</td>
                                        <td className="px-4 py-3 text-sm font-medium">{formatNumber(produit.total_vendu)}</td>
                                        <td className="px-4 py-3 text-sm">{formatPrice(produit.chiffre_affaires)}</td>
                                        <td className="px-4 py-3 text-sm">{formatPrice(produit.prix_moyen)}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>

                {/* Analyse par catégorie */}
                {categories && (
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                        <div className="bg-white border rounded-lg p-4">
                            <h4 className="text-lg font-semibold mb-4">Répartition par catégorie</h4>
                            <div className="h-64">
                                <ResponsiveContainer width="100%" height="100%">
                                    <RechartsPieChart>
                                        <Pie
                                            data={categories}
                                            cx="50%"
                                            cy="50%"
                                            outerRadius={80}
                                            dataKey="chiffre_affaires"
                                            nameKey="categorie"
                                        >
                                            {categories.map((entry, index) => (
                                                <Cell key={`cell-${index}`} fill={CHART_COLORS[index % CHART_COLORS.length]} />
                                            ))}
                                        </Pie>
                                        <Tooltip formatter={(value) => formatPrice(value)} />
                                        <Legend />
                                    </RechartsPieChart>
                                </ResponsiveContainer>
                            </div>
                        </div>

                        <div className="bg-white border rounded-lg">
                            <div className="px-4 py-3 border-b">
                                <h4 className="text-lg font-semibold">Performance par catégorie</h4>
                            </div>
                            <div className="p-4 space-y-3">
                                {categories.map((categorie, index) => (
                                    <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                                        <div>
                                            <div className="font-medium">{categorie.categorie}</div>
                                            <div className="text-sm text-gray-600">
                                                {formatNumber(categorie.produits_vendus)} produits
                                            </div>
                                        </div>
                                        <div className="text-right">
                                            <div className="font-medium">{formatPrice(categorie.chiffre_affaires)}</div>
                                            <div className="text-sm text-gray-600">
                                                {formatNumber(categorie.total_vendu)} unités
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                )}
            </div>
        );
    };

    const renderClientsReport = () => {
        const { top_clients, nouveaux_clients, repartition_villes, statistiques } = reportData;

        return (
            <div className="space-y-6">
                {/* Statistiques générales */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="bg-blue-50 p-4 rounded-lg">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm text-blue-600 font-medium">Nouveaux clients</p>
                                <p className="text-2xl font-bold text-blue-700">
                                    {formatNumber(statistiques.total_nouveaux)}
                                </p>
                            </div>
                            <Users className="w-8 h-8 text-blue-500" />
                        </div>
                    </div>

                    <div className="bg-green-50 p-4 rounded-lg">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm text-green-600 font-medium">Clients actifs</p>
                                <p className="text-2xl font-bold text-green-700">
                                    {formatNumber(statistiques.total_actifs)}
                                </p>
                            </div>
                            <Activity className="w-8 h-8 text-green-500" />
                        </div>
                    </div>

                    <div className="bg-purple-50 p-4 rounded-lg">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm text-purple-600 font-medium">CA moyen/client</p>
                                <p className="text-2xl font-bold text-purple-700">
                                    {formatPrice(statistiques.ca_moyen_par_client)}
                                </p>
                            </div>
                            <DollarSign className="w-8 h-8 text-purple-500" />
                        </div>
                    </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    {/* Top clients */}
                    <div className="bg-white border rounded-lg">
                        <div className="px-4 py-3 border-b">
                            <h4 className="text-lg font-semibold">Meilleurs clients</h4>
                        </div>
                        <div className="p-4 space-y-3 max-h-96 overflow-y-auto">
                            {top_clients.slice(0, 10).map((client, index) => (
                                <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                                    <div>
                                        <div className="font-medium">{client.nom} {client.prenom}</div>
                                        <div className="text-sm text-gray-600">{client.telephone}</div>
                                        <div className="text-xs text-gray-500">{client.ville}</div>
                                    </div>
                                    <div className="text-right">
                                        <div className="font-medium text-green-600">{formatPrice(client.total_depense)}</div>
                                        <div className="text-sm text-gray-600">{formatNumber(client.nombre_commandes)} commandes</div>
                                        <div className="text-xs text-gray-500">Panier: {formatPrice(client.panier_moyen)}</div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Répartition par ville */}
                    <div className="bg-white border rounded-lg">
                        <div className="px-4 py-3 border-b">
                            <h4 className="text-lg font-semibold">Répartition géographique</h4>
                        </div>
                        <div className="p-4 space-y-3 max-h-96 overflow-y-auto">
                            {repartition_villes.map((ville, index) => (
                                <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                                    <div>
                                        <div className="font-medium">{ville.ville}</div>
                                        <div className="text-sm text-gray-600">
                                            {formatNumber(ville.nombre_clients)} clients
                                        </div>
                                    </div>
                                    <div className="text-right">
                                        <div className="font-medium">{formatPrice(ville.chiffre_affaires)}</div>
                                        <div className="text-sm text-gray-600">
                                            {formatNumber(ville.nombre_commandes)} commandes
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </div>
        );
    };

    const renderCommandesReport = () => {
    const { commandes_par_statut, evolution_quotidienne, modes_livraison, statistiques } = reportData;

    return (
        <div className="space-y-6">
            {/* Statistiques générales */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="bg-blue-50 p-4 rounded-lg">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm text-blue-600 font-medium">Total commandes</p>
                            <p className="text-2xl font-bold text-blue-700">
                                {formatNumber(statistiques.total_commandes)}
                            </p>
                        </div>
                        <ShoppingCart className="w-8 h-8 text-blue-500" />
                    </div>
                </div>

                <div className="bg-green-50 p-4 rounded-lg">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm text-green-600 font-medium">Montant total</p>
                            <p className="text-2xl font-bold text-green-700">
                                {formatPrice(statistiques.montant_total)}
                            </p>
                        </div>
                        <DollarSign className="w-8 h-8 text-green-500" />
                    </div>
                </div>

                <div className="bg-purple-50 p-4 rounded-lg">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm text-purple-600 font-medium">Panier moyen</p>
                            <p className="text-2xl font-bold text-purple-700">
                                {formatPrice(statistiques.panier_moyen_global)}
                            </p>
                        </div>
                        <BarChart3 className="w-8 h-8 text-purple-500" />
                    </div>
                </div>

                <div className="bg-orange-50 p-4 rounded-lg">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm text-orange-600 font-medium">Commandes urgentes</p>
                            <p className="text-2xl font-bold text-orange-700">
                                {formatNumber(statistiques.commandes_urgentes)}
                            </p>
                        </div>
                        <AlertTriangle className="w-8 h-8 text-orange-500" />
                    </div>
                </div>
            </div>

            {/* Tableau par statut */}
            <div className="bg-white border rounded-lg">
                <div className="px-4 py-3 border-b">
                    <h4 className="text-lg font-semibold">Commandes par statut</h4>
                </div>
                <div className="overflow-x-auto">
                    <table className="w-full">
                        <thead className="bg-gray-50">
                            <tr>
                                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Statut</th>
                                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Nombre</th>
                                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Montant total</th>
                                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Panier moyen</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-200">
                            {commandes_par_statut?.map((statut, index) => (
                                <tr key={index}>
                                    <td className="px-4 py-3">
                                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                                            statut.statut === 'livree' ? 'bg-green-100 text-green-800' :
                                            statut.statut === 'en_attente' ? 'bg-yellow-100 text-yellow-800' :
                                            statut.statut === 'annulee' ? 'bg-red-100 text-red-800' :
                                            'bg-blue-100 text-blue-800'
                                        }`}>
                                            {statut.statut}
                                        </span>
                                    </td>
                                    <td className="px-4 py-3 text-sm font-medium">{formatNumber(statut.nombre_commandes)}</td>
                                    <td className="px-4 py-3 text-sm">{formatPrice(statut.montant_total)}</td>
                                    <td className="px-4 py-3 text-sm">{formatPrice(statut.panier_moyen)}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Modes de livraison */}
            {modes_livraison && modes_livraison.length > 0 && (
                <div className="bg-white border rounded-lg">
                    <div className="px-4 py-3 border-b">
                        <h4 className="text-lg font-semibold">Modes de livraison</h4>
                    </div>
                    <div className="p-4 space-y-3">
                        {modes_livraison.map((mode, index) => (
                            <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                                <div>
                                    <div className="font-medium capitalize">{mode.mode_livraison}</div>
                                    <div className="text-sm text-gray-600">
                                        {formatNumber(mode.nombre_commandes)} commandes
                                    </div>
                                </div>
                                <div className="font-medium text-green-600">
                                    {formatPrice(mode.montant_total)}
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
};

const renderFinancierReport = () => {
    const { paiements_par_methode, evolution_quotidienne, commandes_non_payees, totaux } = reportData;

    return (
        <div className="space-y-6">
            {/* KPIs financiers */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="bg-green-50 p-4 rounded-lg">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm text-green-600 font-medium">CA Total</p>
                            <p className="text-2xl font-bold text-green-700">
                                {formatPrice(totaux.ca_total)}
                            </p>
                        </div>
                        <DollarSign className="w-8 h-8 text-green-500" />
                    </div>
                </div>

                <div className="bg-blue-50 p-4 rounded-lg">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm text-blue-600 font-medium">Transactions</p>
                            <p className="text-2xl font-bold text-blue-700">
                                {formatNumber(totaux.nombre_transactions)}
                            </p>
                        </div>
                        <Activity className="w-8 h-8 text-blue-500" />
                    </div>
                </div>

                <div className="bg-purple-50 p-4 rounded-lg">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm text-purple-600 font-medium">Ticket moyen</p>
                            <p className="text-2xl font-bold text-purple-700">
                                {formatPrice(totaux.ticket_moyen)}
                            </p>
                        </div>
                        <BarChart3 className="w-8 h-8 text-purple-500" />
                    </div>
                </div>

                <div className="bg-red-50 p-4 rounded-lg">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm text-red-600 font-medium">Impayés</p>
                            <p className="text-2xl font-bold text-red-700">
                                {formatPrice(totaux.total_impaye)}
                            </p>
                        </div>
                        <AlertTriangle className="w-8 h-8 text-red-500" />
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Paiements par méthode */}
                <div className="bg-white border rounded-lg">
                    <div className="px-4 py-3 border-b">
                        <h4 className="text-lg font-semibold">Paiements par méthode</h4>
                    </div>
                    <div className="p-4 space-y-3">
                        {paiements_par_methode?.map((methode, index) => (
                            <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                                <div>
                                    <div className="font-medium capitalize">{methode.methode_paiement}</div>
                                    <div className="text-sm text-gray-600">
                                        {formatNumber(methode.nombre_transactions)} transactions
                                    </div>
                                </div>
                                <div className="text-right">
                                    <div className="font-medium text-green-600">{formatPrice(methode.total_montant)}</div>
                                    <div className="text-xs text-gray-500">
                                        Moy: {formatPrice(methode.montant_moyen)}
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Commandes non payées */}
                <div className="bg-white border rounded-lg">
                    <div className="px-4 py-3 border-b">
                        <h4 className="text-lg font-semibold">Commandes non payées</h4>
                    </div>
                    <div className="p-4 space-y-3 max-h-80 overflow-y-auto">
                        {commandes_non_payees?.slice(0, 10).map((commande, index) => (
                            <div key={index} className="flex items-center justify-between p-3 bg-red-50 rounded-lg">
                                <div>
                                    <div className="font-medium">{commande.numero_commande}</div>
                                    <div className="text-sm text-gray-600">{commande.nom_destinataire}</div>
                                    <div className="text-xs text-gray-500">
                                        {new Date(commande.created_at).toLocaleDateString('fr-FR')}
                                    </div>
                                </div>
                                <div className="font-medium text-red-600">
                                    {formatPrice(commande.montant_restant)}
                                </div>
                            </div>
                        ))}
                        {commandes_non_payees?.length > 10 && (
                            <div className="text-center text-sm text-gray-500">
                                Et {commandes_non_payees.length - 10} autres commandes...
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* Graphique évolution quotidienne */}
            {evolution_quotidienne && evolution_quotidienne.length > 0 && (
                <div className="bg-gray-50 p-4 rounded-lg">
                    <h4 className="text-lg font-semibold mb-4">Évolution quotidienne</h4>
                    <div className="h-80">
                        <ResponsiveContainer width="100%" height="100%">
                            <LineChart data={evolution_quotidienne}>
                                <CartesianGrid strokeDasharray="3 3" />
                                <XAxis dataKey="date" />
                                <YAxis />
                                <Tooltip 
                                    formatter={(value, name) => [
                                        name === 'chiffre_affaires' ? formatPrice(value) : formatNumber(value),
                                        name === 'chiffre_affaires' ? 'CA' : 'Paiements'
                                    ]} 
                                />
                                <Legend />
                                <Line type="monotone" dataKey="chiffre_affaires" stroke="#10b981" strokeWidth={2} name="CA" />
                                <Line type="monotone" dataKey="nombre_paiements" stroke="#3b82f6" strokeWidth={2} name="Paiements" />
                            </LineChart>
                        </ResponsiveContainer>
                    </div>
                </div>
            )}
        </div>
    );
};
    const renderStockReport = () => {
        const { produits, alertes, repartition_par_categorie } = reportData;

        return (
            <div className="space-y-6">
                {/* Alertes de stock */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="bg-red-50 p-4 rounded-lg">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm text-red-600 font-medium">Ruptures de stock</p>
                                <p className="text-2xl font-bold text-red-700">
                                    {formatNumber(alertes.rupture)}
                                </p>
                            </div>
                            <AlertTriangle className="w-8 h-8 text-red-500" />
                        </div>
                    </div>

                    <div className="bg-yellow-50 p-4 rounded-lg">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm text-yellow-600 font-medium">Stock faible</p>
                                <p className="text-2xl font-bold text-yellow-700">
                                    {formatNumber(alertes.stock_faible)}
                                </p>
                            </div>
                            <Warehouse className="w-8 h-8 text-yellow-500" />
                        </div>
                    </div>

                    <div className="bg-green-50 p-4 rounded-lg">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm text-green-600 font-medium">Valeur totale</p>
                                <p className="text-2xl font-bold text-green-700">
                                    {formatPrice(alertes.valeur_totale)}
                                </p>
                            </div>
                            <DollarSign className="w-8 h-8 text-green-500" />
                        </div>
                    </div>
                </div>

                {/* État détaillé des stocks */}
                <div className="bg-white border rounded-lg">
                    <div className="px-4 py-3 border-b">
                        <h4 className="text-lg font-semibold">État détaillé des stocks</h4>
                    </div>
                    <div className="overflow-x-auto">
                        <table className="w-full">
                            <thead className="bg-gray-50">
                                <tr>
                                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Produit</th>
                                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Catégorie</th>
                                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Stock</th>
                                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Seuil</th>
                                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Valeur</th>
                                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Statut</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-200">
                                {produits.map((produit, index) => (
                                    <tr key={index}>
                                        <td className="px-4 py-3">
                                            <div className="text-sm font-medium text-gray-900">{produit.nom}</div>
                                            <div className="text-xs text-gray-500">Prix: {formatPrice(produit.prix)}</div>
                                        </td>
                                        <td className="px-4 py-3 text-sm">{produit.categorie}</td>
                                        <td className="px-4 py-3 text-sm font-medium">{formatNumber(produit.stock_disponible)}</td>
                                        <td className="px-4 py-3 text-sm">{formatNumber(produit.seuil_alerte)}</td>
                                        <td className="px-4 py-3 text-sm">{formatPrice(produit.valeur_stock)}</td>
                                        <td className="px-4 py-3">
                                            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                                                produit.statut_stock === 'rupture' ? 'bg-red-100 text-red-800' :
                                                produit.statut_stock === 'faible' ? 'bg-yellow-100 text-yellow-800' :
                                                'bg-green-100 text-green-800'
                                            }`}>
                                                {produit.statut_stock === 'rupture' ? 'Rupture' :
                                                 produit.statut_stock === 'faible' ? 'Faible' : 'Normal'}
                                            </span>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        );
    };

    const renderAnalyticsReport = () => {
    const { visiteurs_uniques, pages_vues, taux_conversion, sources_trafic, evolution_quotidienne } = reportData;
    
    return (
        <div className="space-y-6">
            {/* KPIs Web */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="bg-teal-50 p-4 rounded-lg">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm text-teal-600 font-medium">Visiteurs uniques</p>
                            <p className="text-2xl font-bold text-teal-700">{formatNumber(visiteurs_uniques)}</p>
                        </div>
                        <Users className="w-8 h-8 text-teal-500" />
                    </div>
                </div>
                
                <div className="bg-blue-50 p-4 rounded-lg">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm text-blue-600 font-medium">Pages vues</p>
                            <p className="text-2xl font-bold text-blue-700">{formatNumber(pages_vues)}</p>
                        </div>
                        <Eye className="w-8 h-8 text-blue-500" />
                    </div>
                </div>
                
                <div className="bg-green-50 p-4 rounded-lg">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm text-green-600 font-medium">Taux conversion</p>
                            <p className="text-2xl font-bold text-green-700">{taux_conversion}%</p>
                        </div>
                        <TrendingUp className="w-8 h-8 text-green-500" />
                    </div>
                </div>
            </div>
            
            {/* Sources de trafic */}
            <div className="bg-white border rounded-lg">
                <div className="px-4 py-3 border-b">
                    <h4 className="text-lg font-semibold">Sources de trafic</h4>
                </div>
                <div className="p-4 space-y-3">
                    {sources_trafic?.map((source, index) => (
                        <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                            <div className="font-medium">{source.source}</div>
                            <div className="text-right">
                                <div className="font-medium">{formatNumber(source.visiteurs)} visiteurs</div>
                                <div className="text-sm text-gray-600">{source.pourcentage}%</div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
};

const renderPerformanceProduitsReport = () => {
    const { produits_performance, analyse_commandes, analyse_paniers } = reportData;

    return (
        <div className="space-y-6">
            {/* KPIs Commandes */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div className="bg-blue-50 p-4 rounded-lg">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm text-blue-600 font-medium">Total commandes</p>
                            <p className="text-2xl font-bold text-blue-700">
                                {formatNumber(analyse_commandes?.total_commandes || 0)}
                            </p>
                        </div>
                        <ShoppingCart className="w-8 h-8 text-blue-500" />
                    </div>
                </div>

                <div className="bg-green-50 p-4 rounded-lg">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm text-green-600 font-medium">Commandes validées</p>
                            <p className="text-2xl font-bold text-green-700">
                                {formatNumber(analyse_commandes?.commandes_validees || 0)}
                            </p>
                        </div>
                        <TrendingUp className="w-8 h-8 text-green-500" />
                    </div>
                </div>

                <div className="bg-purple-50 p-4 rounded-lg">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm text-purple-600 font-medium">Taux validation</p>
                            <p className="text-2xl font-bold text-purple-700">
                                {analyse_commandes?.taux_validation || 0}%
                            </p>
                        </div>
                        <BarChart3 className="w-8 h-8 text-purple-500" />
                    </div>
                </div>

                <div className="bg-orange-50 p-4 rounded-lg">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm text-orange-600 font-medium">Taux paiement</p>
                            <p className="text-2xl font-bold text-orange-700">
                                {analyse_commandes?.taux_paiement || 0}%
                            </p>
                        </div>
                        <DollarSign className="w-8 h-8 text-orange-500" />
                    </div>
                </div>
            </div>

            {/* Section paniers séparée */}
            {analyse_paniers && (
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="bg-gray-50 p-4 rounded-lg">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm text-gray-600 font-medium">Total paniers</p>
                                <p className="text-2xl font-bold text-gray-700">
                                    {formatNumber(analyse_paniers.total_paniers || 0)}
                                </p>
                            </div>
                        </div>
                    </div>

                    <div className="bg-green-50 p-4 rounded-lg">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm text-green-600 font-medium">Paniers → Commandes</p>
                                <p className="text-2xl font-bold text-green-700">
                                    {analyse_paniers.taux_transformation || 0}%
                                </p>
                            </div>
                        </div>
                    </div>

                    <div className="bg-red-50 p-4 rounded-lg">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm text-red-600 font-medium">Paniers abandonnés</p>
                                <p className="text-2xl font-bold text-red-700">
                                    {analyse_paniers.taux_abandon || 0}%
                                </p>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Le reste reste identique... */}
        </div>
    );
};

    const renderDefaultReport = () => {
        return (
            <div className="text-center py-8">
                <FileText className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-gray-900 mb-2">Données du rapport</h3>
                <pre className="text-left bg-gray-100 p-4 rounded-lg text-sm overflow-auto max-h-96">
                    {JSON.stringify(reportData, null, 2)}
                </pre>
            </div>
        );
    };

    const renderReportContent = () => {
        switch (reportType) {
            case 'ventes':
                return renderVentesReport();
            case 'produits':
                return renderProduitsReport();
            case 'clients':
                return renderClientsReport();
            case 'stock':
                return renderStockReport();
            case 'commandes':  
                return renderCommandesReport();  
            case 'financier':  
                return renderFinancierReport(); 
           case 'analytics':
                return renderAnalyticsReport();
           case 'performance-produits':
                return renderPerformanceProduitsReport();
            default:
                return renderDefaultReport();
        }
    };

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-lg shadow-xl w-full max-w-6xl max-h-[90vh] flex flex-col">
                {/* Header */}
                <div className="flex items-center justify-between p-6 border-b">
                    <div className="flex items-center space-x-3">
                        {getReportIcon(reportType)}
                        <div>
                            <h2 className="text-xl font-semibold text-gray-900">
                                {getReportTitle(reportType)}
                            </h2>
                            <p className="text-sm text-gray-500">
                                Généré le {new Date().toLocaleDateString('fr-FR')}
                            </p>
                        </div>
                    </div>
                    
                    <div className="flex items-center space-x-3">
                        <div className="flex items-center space-x-2">
                            <select
                                value={exportFormat}
                                onChange={(e) => setExportFormat(e.target.value)}
                                className="px-3 py-1 border border-gray-300 rounded text-sm focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                            >
                                <option value="excel">Excel</option>
                                <option value="csv">CSV</option>
                                <option value="pdf">PDF</option>
                            </select>
                            
                            <button
                                onClick={() => onExport(exportFormat)}
                                disabled={exporting}
                                className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 disabled:opacity-50 flex items-center space-x-2"
                            >
                                {exporting ? (
                                    <RefreshCw className="w-4 h-4 animate-spin" />
                                ) : (
                                    <Download className="w-4 h-4" />
                                )}
                                <span>Exporter</span>
                            </button>
                        </div>
                        
                        <button
                            onClick={onClose}
                            className="text-gray-400 hover:text-gray-600 p-2"
                        >
                            <X className="w-6 h-6" />
                        </button>
                    </div>
                </div>

                {/* Content */}
                <div className="flex-1 overflow-auto p-6">
                    {renderReportContent()}
                </div>
            </div>
        </div>
    );
};

export default ReportDetailsModal;