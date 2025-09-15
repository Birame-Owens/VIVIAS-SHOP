import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { 
    Plus, 
    Search, 
    Edit, 
    Eye,
    Calendar,
    RefreshCw,
    X,
    Clock,
    CheckCircle,
    AlertTriangle,
    Package,
    Truck,
    Phone,
    MapPin,
    Filter,
    Download,
    ChevronLeft,
    ChevronRight,
    User,
    Mail,
    CreditCard,
    FileText
} from 'lucide-react';
import { toast } from 'react-hot-toast';

const Commands = () => {
    const { token } = useAuth();
    const [commands, setCommands] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [statusFilter, setStatusFilter] = useState('');
    const [priorityFilter, setPriorityFilter] = useState('');
    const [currentPage, setCurrentPage] = useState(1);
    const [pagination, setPagination] = useState({});
    const [showModal, setShowModal] = useState(false);
    const [selectedCommand, setSelectedCommand] = useState(null);
    const [stats, setStats] = useState({});
    const [updating, setUpdating] = useState(false);
const [showFormModal, setShowFormModal] = useState(false);
const [editingCommand, setEditingCommand] = useState(null);
const [formLoading, setFormLoading] = useState(false);

    const API_BASE = '/api/admin';
    const getHeaders = () => {
        const headers = {
            'Authorization': `Bearer ${token}`,
            'Accept': 'application/json'
        };

        const csrfToken = document.querySelector('meta[name="csrf-token"]')?.getAttribute('content');
        if (csrfToken) {
            headers['X-CSRF-TOKEN'] = csrfToken;
        }

        return headers;
    };

    // Charger les commandes
    const loadCommands = async () => {
        try {
            setLoading(true);
            const params = new URLSearchParams({
                page: currentPage,
                per_page: 15,
                search: searchTerm
            });

            if (statusFilter) params.append('statut', statusFilter);
            if (priorityFilter) params.append('priorite', priorityFilter);

            const response = await fetch(`${API_BASE}/commandes?${params}`, {
                headers: getHeaders()
            });

            if (!response.ok) throw new Error('Erreur lors du chargement');

            const result = await response.json();
            if (result.success) {
                setCommands(result.data.commandes);
                setPagination(result.data.pagination);
            }
        } catch (error) {
            console.error('Erreur:', error);
            toast.error('Erreur lors du chargement des commandes');
        } finally {
            setLoading(false);
        }
    };

    // Charger les statistiques
    const loadStats = async () => {
        try {
            const response = await fetch(`${API_BASE}/commandes/stats`, {
                headers: getHeaders()
            });

            if (!response.ok) throw new Error('Erreur lors du chargement');

            const result = await response.json();
            if (result.success) {
                setStats(result.data);
            }
        } catch (error) {
            console.error('Erreur stats:', error);
        }
    };

    useEffect(() => {
        loadCommands();
    }, [currentPage, searchTerm, statusFilter, priorityFilter]);

    useEffect(() => {
        loadStats();
    }, []);

    // Gérer la recherche
    const handleSearch = (e) => {
        setSearchTerm(e.target.value);
        setCurrentPage(1);
    };

    // Voir les détails d'une commande
    const viewCommand = async (command) => {
        try {
            const response = await fetch(`${API_BASE}/commandes/${command.id}`, {
                headers: getHeaders()
            });

            if (!response.ok) throw new Error('Erreur lors du chargement');

            const result = await response.json();
            if (result.success) {
                setSelectedCommand(result.data.commande);
                setShowModal(true);
            }
        } catch (error) {
            console.error('Erreur:', error);
            toast.error('Erreur lors du chargement des détails');
        }
    };

    // Mettre à jour le statut
    const updateStatus = async (commandId, newStatus) => {
        try {
            setUpdating(true);
            const formData = new FormData();
            const csrfToken = document.querySelector('meta[name="csrf-token"]')?.getAttribute('content');
            
            if (csrfToken) {
                formData.append('_token', csrfToken);
            }
            formData.append('statut', newStatus);

            const response = await fetch(`${API_BASE}/commandes/${commandId}/update-status`, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Accept': 'application/json'
                },
                body: formData
            });

            const result = await response.json();
            if (result.success) {
                toast.success(result.message);
                loadCommands();
                loadStats();
                if (selectedCommand) {
                    setSelectedCommand({ ...selectedCommand, statut: newStatus, statut_label: getStatutLabel(newStatus) });
                }
            } else {
                toast.error(result.message);
            }
        } catch (error) {
            console.error('Erreur:', error);
            toast.error('Erreur lors de la mise à jour du statut');
        } finally {
            setUpdating(false);
        }
    };

    // Annuler une commande
    const cancelCommand = async (commandId, reason) => {
        try {
            const formData = new FormData();
            const csrfToken = document.querySelector('meta[name="csrf-token"]')?.getAttribute('content');
            
            if (csrfToken) {
                formData.append('_token', csrfToken);
            }
            formData.append('raison_annulation', reason);

            const response = await fetch(`${API_BASE}/commandes/${commandId}/cancel`, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Accept': 'application/json'
                },
                body: formData
            });

            const result = await response.json();
            if (result.success) {
                toast.success('Commande annulée avec succès');
                loadCommands();
                loadStats();
                setShowModal(false);
            } else {
                toast.error(result.message);
            }
        } catch (error) {
            console.error('Erreur:', error);
            toast.error('Erreur lors de l\'annulation');
        }
    };

    // Fermer le modal
    const closeModal = () => {
        setShowModal(false);
        setSelectedCommand(null);
    };

    // Formater le prix
    const formatPrice = (price) => {
        return new Intl.NumberFormat('fr-SN', {
            style: 'currency',
            currency: 'XOF',
            minimumFractionDigits: 0
        }).format(price);
    };

    // Obtenir la couleur du statut
    const getStatusColor = (status) => {
        const colors = {
            'en_attente': 'bg-yellow-100 text-yellow-800',
            'confirmee': 'bg-blue-100 text-blue-800',
            'en_preparation': 'bg-orange-100 text-orange-800',
            'prete': 'bg-purple-100 text-purple-800',
            'en_livraison': 'bg-indigo-100 text-indigo-800',
            'livree': 'bg-green-100 text-green-800',
            'annulee': 'bg-red-100 text-red-800'
        };
        return colors[status] || 'bg-gray-100 text-gray-800';
    };

    // Obtenir l'icône du statut
    const getStatusIcon = (status) => {
        const icons = {
            'en_attente': Clock,
            'confirmee': CheckCircle,
            'en_preparation': Package,
            'prete': CheckCircle,
            'en_livraison': Truck,
            'livree': CheckCircle,
            'annulee': X
        };
        const Icon = icons[status] || Clock;
        return <Icon className="w-4 h-4" />;
    };

    // Obtenir le libellé du statut
    const getStatutLabel = (statut) => {
        const labels = {
            'en_attente': 'En attente',
            'confirmee': 'Confirmée',
            'en_preparation': 'En préparation',
            'prete': 'Prête',
            'en_livraison': 'En livraison',
            'livree': 'Livrée',
            'annulee': 'Annulée'
        };
        return labels[statut] || statut;
    };

    // Obtenir la couleur de priorité
    const getPriorityColor = (priority) => {
        const colors = {
            'normale': 'bg-gray-100 text-gray-800',
            'urgente': 'bg-orange-100 text-orange-800',
            'tres_urgente': 'bg-red-100 text-red-800'
        };
        return colors[priority] || 'bg-gray-100 text-gray-800';
    };

    // Pagination
    const handlePageChange = (page) => {
        if (page >= 1 && page <= pagination.last_page) {
            setCurrentPage(page);
        }
    };

    return (
        <div className="p-6">
            {/* Header avec stats */}
            <div className="mb-6">
                <div className="flex items-center justify-between mb-6">
                    <div>
                        <h1 className="text-2xl font-bold text-gray-900">Commandes</h1>
                        <p className="text-gray-600">Gérez les commandes de votre boutique</p>
                    </div>
                    <button
                        onClick={() => {/* Ajouter nouvelle commande */}}
                        className="bg-purple-600 text-white px-4 py-2 rounded-lg hover:bg-purple-700 flex items-center space-x-2"
                    >
                        <Plus className="w-4 h-4" />
                        <span>Nouvelle commande</span>
                    </button>
                </div>

                {/* Statistiques rapides */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
                    <div className="bg-white p-4 rounded-lg shadow-sm border">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm text-gray-600">Total commandes</p>
                                <p className="text-2xl font-bold text-gray-900">{stats.total_commandes || 0}</p>
                            </div>
                            <Package className="w-8 h-8 text-purple-500" />
                        </div>
                    </div>
                    
                    <div className="bg-white p-4 rounded-lg shadow-sm border">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm text-gray-600">En attente</p>
                                <p className="text-2xl font-bold text-yellow-600">{stats.commandes_en_attente || 0}</p>
                            </div>
                            <Clock className="w-8 h-8 text-yellow-500" />
                        </div>
                    </div>
                    
                    <div className="bg-white p-4 rounded-lg shadow-sm border">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm text-gray-600">En retard</p>
                                <p className="text-2xl font-bold text-red-600">{stats.commandes_en_retard || 0}</p>
                            </div>
                            <AlertTriangle className="w-8 h-8 text-red-500" />
                        </div>
                    </div>
                    
                    <div className="bg-white p-4 rounded-lg shadow-sm border">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm text-gray-600">CA du mois</p>
                                <p className="text-lg font-bold text-green-600">{formatPrice(stats.chiffre_affaires_mois || 0)}</p>
                            </div>
                            <CheckCircle className="w-8 h-8 text-green-500" />
                        </div>
                    </div>
                </div>
            </div>

            {/* Filtres et recherche */}
            <div className="bg-white rounded-lg shadow-sm border mb-6 p-4">
                <div className="flex flex-col md:flex-row md:items-center md:justify-between space-y-4 md:space-y-0">
                    <div className="flex flex-col md:flex-row md:items-center space-y-4 md:space-y-0 md:space-x-4">
                        <div className="relative">
                            <Search className="w-4 h-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                            <input
                                type="text"
                                placeholder="Rechercher une commande..."
                                value={searchTerm}
                                onChange={handleSearch}
                                className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent w-full md:w-80"
                            />
                        </div>
                        
                        <select
                            value={statusFilter}
                            onChange={(e) => {
                                setStatusFilter(e.target.value);
                                setCurrentPage(1);
                            }}
                            className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                        >
                            <option value="">Tous les statuts</option>
                            <option value="en_attente">En attente</option>
                            <option value="confirmee">Confirmée</option>
                            <option value="en_preparation">En préparation</option>
                            <option value="prete">Prête</option>
                            <option value="en_livraison">En livraison</option>
                            <option value="livree">Livrée</option>
                            <option value="annulee">Annulée</option>
                        </select>

                        <select
                            value={priorityFilter}
                            onChange={(e) => {
                                setPriorityFilter(e.target.value);
                                setCurrentPage(1);
                            }}
                            className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                        >
                            <option value="">Toutes les priorités</option>
                            <option value="normale">Normale</option>
                            <option value="urgente">Urgente</option>
                            <option value="tres_urgente">Très urgente</option>
                        </select>
                        
                        <button
                            onClick={loadCommands}
                            className="p-2 border border-gray-300 rounded-lg hover:bg-gray-50"
                            title="Actualiser"
                        >
                            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
                        </button>
                    </div>

                    <div className="flex items-center space-x-2">
                        <span className="text-sm text-gray-500">
                            {pagination.total || 0} commande(s)
                        </span>
                    </div>
                </div>
            </div>

            {/* Liste des commandes */}
            <div className="bg-white rounded-lg shadow-sm border overflow-hidden">
                {loading ? (
                    <div className="p-8 text-center">
                        <RefreshCw className="w-8 h-8 animate-spin mx-auto mb-4 text-gray-400" />
                        <p className="text-gray-500">Chargement des commandes...</p>
                    </div>
                ) : commands.length === 0 ? (
                    <div className="p-8 text-center">
                        <Package className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                        <h3 className="text-lg font-semibold text-gray-900 mb-2">Aucune commande trouvée</h3>
                        <p className="text-gray-500">
                            {searchTerm || statusFilter || priorityFilter
                                ? 'Aucune commande ne correspond à vos critères de recherche.'
                                : 'Aucune commande n\'a encore été passée.'
                            }
                        </p>
                    </div>
                ) : (
                    <div className="overflow-x-auto">
                        <table className="w-full">
                            <thead className="bg-gray-50 border-b">
                                <tr>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Commande
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Client
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Montant
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Statut
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Date
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Actions
                                    </th>
                                </tr>
                            </thead>
                            <tbody className="bg-white divide-y divide-gray-200">
                                {commands.map((command) => (
                                    <tr key={command.id} className="hover:bg-gray-50">
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <div>
                                                <div className="text-sm font-medium text-gray-900">
                                                    {command.numero_commande}
                                                </div>
                                                <div className="text-sm text-gray-500">
                                                    {command.nb_articles} article(s)
                                                </div>
                                                {command.priorite !== 'normale' && (
                                                    <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs mt-1 ${getPriorityColor(command.priorite)}`}>
                                                        {command.priorite === 'urgente' ? 'Urgente' : 'Très urgente'}
                                                    </span>
                                                )}
                                                {command.est_en_retard && (
                                                    <span className="inline-flex items-center px-2 py-1 rounded-full text-xs bg-red-100 text-red-800 mt-1">
                                                        <AlertTriangle className="w-3 h-3 mr-1" />
                                                        En retard
                                                    </span>
                                                )}
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <div>
                                                <div className="text-sm font-medium text-gray-900">
                                                    {command.nom_destinataire}
                                                </div>
                                                <div className="text-sm text-gray-500 flex items-center">
                                                    <Phone className="w-3 h-3 mr-1" />
                                                    {command.telephone_livraison}
                                                </div>
                                                {command.client && (
                                                    <div className="text-xs text-gray-400 flex items-center mt-1">
                                                        <User className="w-3 h-3 mr-1" />
                                                        {command.client.nom}
                                                    </div>
                                                )}
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <div className="text-sm font-medium text-gray-900">
                                                {formatPrice(command.montant_total)}
                                            </div>
                                            {command.frais_livraison > 0 && (
                                                <div className="text-xs text-gray-500">
                                                    + {formatPrice(command.frais_livraison)} livraison
                                                </div>
                                            )}
                                            {command.remise > 0 && (
                                                <div className="text-xs text-green-600">
                                                    - {formatPrice(command.remise)} remise
                                                </div>
                                            )}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(command.statut)}`}>
                                                {getStatusIcon(command.statut)}
                                                <span className="ml-1">{command.statut_label}</span>
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                            <div>{command.date_commande}</div>
                                            {command.date_livraison_prevue && (
                                                <div className="text-xs flex items-center mt-1">
                                                    <Calendar className="w-3 h-3 mr-1" />
                                                    Livraison: {command.date_livraison_prevue}
                                                </div>
                                            )}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                                            <div className="flex items-center space-x-2">
                                                <button
                                                    onClick={() => viewCommand(command)}
                                                    className="text-purple-600 hover:text-purple-900 p-1 rounded"
                                                    title="Voir les détails"
                                                >
                                                    <Eye className="w-4 h-4" />
                                                </button>
                                                {command.statut !== 'livree' && command.statut !== 'annulee' && (
                                                    <button
                                                        onClick={() => openEditCommandForm(command)}
                                                        className="text-blue-600 hover:text-blue-900 p-1 rounded"
                                                        title="Modifier"
                                                    >
                                                        <Edit className="w-4 h-4" />
                                                    </button>
                                                )}
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}

                {/* Pagination */}
                {pagination.last_page > 1 && (
                    <div className="bg-white px-4 py-3 border-t border-gray-200 sm:px-6">
                        <div className="flex items-center justify-between">
                            <div className="flex-1 flex justify-between sm:hidden">
                                <button
                                    onClick={() => handlePageChange(currentPage - 1)}
                                    disabled={currentPage === 1}
                                    className="relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50"
                                >
                                    Précédent
                                </button>
                                <button
                                    onClick={() => handlePageChange(currentPage + 1)}
                                    disabled={currentPage === pagination.last_page}
                                    className="ml-3 relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50"
                                >
                                    Suivant
                                </button>
                            </div>
                            <div className="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between">
                                <div>
                                    <p className="text-sm text-gray-700">
                                        Affichage de{' '}
                                        <span className="font-medium">
                                            {((currentPage - 1) * pagination.per_page) + 1}
                                        </span>{' '}
                                        à{' '}
                                        <span className="font-medium">
                                            {Math.min(currentPage * pagination.per_page, pagination.total)}
                                        </span>{' '}
                                        sur{' '}
                                        <span className="font-medium">{pagination.total}</span>{' '}
                                        résultats
                                    </p>
                                </div>
                                <div>
                                    <nav className="relative z-0 inline-flex rounded-md shadow-sm -space-x-px">
                                        <button
                                            onClick={() => handlePageChange(currentPage - 1)}
                                            disabled={currentPage === 1}
                                            className="relative inline-flex items-center px-2 py-2 rounded-l-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50"
                                        >
                                            <ChevronLeft className="h-5 w-5" />
                                        </button>
                                        {Array.from({ length: Math.min(5, pagination.last_page) }, (_, i) => {
                                            let pageNum;
                                            if (pagination.last_page <= 5) {
                                                pageNum = i + 1;
                                            } else if (currentPage <= 3) {
                                                pageNum = i + 1;
                                            } else if (currentPage >= pagination.last_page - 2) {
                                                pageNum = pagination.last_page - 4 + i;
                                            } else {
                                                pageNum = currentPage - 2 + i;
                                            }
                                            
                                            return (
                                                <button
                                                    key={pageNum}
                                                    onClick={() => handlePageChange(pageNum)}
                                                    className={`relative inline-flex items-center px-4 py-2 border text-sm font-medium ${
                                                        pageNum === currentPage
                                                            ? 'z-10 bg-purple-50 border-purple-500 text-purple-600'
                                                            : 'bg-white border-gray-300 text-gray-500 hover:bg-gray-50'
                                                    }`}
                                                >
                                                    {pageNum}
                                                </button>
                                            );
                                        })}
                                        <button
                                            onClick={() => handlePageChange(currentPage + 1)}
                                            disabled={currentPage === pagination.last_page}
                                            className="relative inline-flex items-center px-2 py-2 rounded-r-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50"
                                        >
                                            <ChevronRight className="h-5 w-5" />
                                        </button>
                                    </nav>
                                </div>
                            </div>
                        </div>
                    </div>
                )}
            </div>

            {/* Modal détails commande */}
            {showModal && selectedCommand && (
                <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
                    <div className="relative top-20 mx-auto p-5 border w-11/12 max-w-4xl shadow-lg rounded-md bg-white">
                        <div className="flex items-center justify-between mb-4">
                            <h3 className="text-lg font-bold text-gray-900">
                                Détails de la commande {selectedCommand.numero_commande}
                            </h3>
                            <button
                                onClick={closeModal}
                                className="text-gray-400 hover:text-gray-600"
                            >
                                <X className="w-6 h-6" />
                            </button>
                        </div>

                        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                            {/* Informations principales */}
                            <div className="lg:col-span-2 space-y-6">
                                {/* Informations client */}
                                <div className="bg-gray-50 p-4 rounded-lg">
                                    <h4 className="font-semibold text-gray-900 mb-3 flex items-center">
                                        <User className="w-5 h-5 mr-2" />
                                        Informations client
                                    </h4>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        <div>
                                            <label className="text-sm text-gray-600">Destinataire</label>
                                            <p className="font-medium">{selectedCommand.nom_destinataire}</p>
                                        </div>
                                        <div>
                                            <label className="text-sm text-gray-600">Téléphone</label>
                                            <p className="font-medium flex items-center">
                                                <Phone className="w-4 h-4 mr-1" />
                                                {selectedCommand.telephone_livraison}
                                            </p>
                                        </div>
                                        {selectedCommand.client && (
                                            <>
                                                <div>
                                                    <label className="text-sm text-gray-600">Client</label>
                                                    <p className="font-medium">{selectedCommand.client.nom}</p>
                                                </div>
                                                <div>
                                                    <label className="text-sm text-gray-600">Email</label>
                                                    <p className="font-medium flex items-center">
                                                        <Mail className="w-4 h-4 mr-1" />
                                                        {selectedCommand.client.email}
                                                    </p>
                                                </div>
                                            </>
                                        )}
                                    </div>
                                </div>

                                {/* Adresse de livraison */}
                                <div className="bg-gray-50 p-4 rounded-lg">
                                    <h4 className="font-semibold text-gray-900 mb-3 flex items-center">
                                        <MapPin className="w-5 h-5 mr-2" />
                                        Livraison
                                    </h4>
                                    <div className="space-y-2">
                                        <div>
                                            <label className="text-sm text-gray-600">Adresse</label>
                                            <p className="font-medium">{selectedCommand.adresse_livraison}</p>
                                        </div>
                                        <div>
                                            <label className="text-sm text-gray-600">Mode de livraison</label>
                                            <p className="font-medium capitalize">{selectedCommand.mode_livraison.replace('_', ' ')}</p>
                                        </div>
                                        {selectedCommand.instructions_livraison && (
                                            <div>
                                                <label className="text-sm text-gray-600">Instructions</label>
                                                <p className="font-medium">{selectedCommand.instructions_livraison}</p>
                                            </div>
                                        )}
                                    </div>
                                </div>

                                {/* Articles commandés */}
                                <div>
                                    <h4 className="font-semibold text-gray-900 mb-3 flex items-center">
                                        <Package className="w-5 h-5 mr-2" />
                                        Articles commandés
                                    </h4>
                                    <div className="border rounded-lg overflow-hidden">
                                        <table className="w-full">
                                            <thead className="bg-gray-50">
                                                <tr>
                                                    <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Produit</th>
                                                    <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Quantité</th>
                                                    <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Prix unitaire</th>
                                                    <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Total</th>
                                                </tr>
                                            </thead>
                                            <tbody className="divide-y divide-gray-200">
                                                {selectedCommand.articles?.map((article, index) => (
                                                    <tr key={index}>
                                                        <td className="px-4 py-3">
                                                            <div className="flex items-center">
                                                                {article.produit.image && (
                                                                    <img 
                                                                        src={article.produit.image} 
                                                                        alt={article.produit.nom}
                                                                        className="w-10 h-10 rounded object-cover mr-3"
                                                                    />
                                                                )}
                                                                <div>
                                                                    <p className="font-medium text-gray-900">{article.produit.nom}</p>
                                                                    {article.produit.categorie && (
                                                                        <p className="text-sm text-gray-500">{article.produit.categorie}</p>
                                                                    )}
                                                                    {article.personnalisations && (
                                                                        <p className="text-xs text-blue-600">Personnalisé</p>
                                                                    )}
                                                                </div>
                                                            </div>
                                                        </td>
                                                        <td className="px-4 py-3 text-sm text-gray-900">{article.quantite}</td>
                                                        <td className="px-4 py-3 text-sm text-gray-900">{formatPrice(article.prix_unitaire)}</td>
                                                        <td className="px-4 py-3 text-sm font-medium text-gray-900">{formatPrice(article.prix_total)}</td>
                                                    </tr>
                                                ))}
                                            </tbody>
                                        </table>
                                    </div>
                                </div>

                                {/* Notes et commentaires */}
                                {(selectedCommand.notes_client || selectedCommand.notes_admin || selectedCommand.message_cadeau) && (
                                    <div className="bg-gray-50 p-4 rounded-lg">
                                        <h4 className="font-semibold text-gray-900 mb-3 flex items-center">
                                            <FileText className="w-5 h-5 mr-2" />
                                            Notes et commentaires
                                        </h4>
                                        <div className="space-y-3">
                                            {selectedCommand.notes_client && (
                                                <div>
                                                    <label className="text-sm text-gray-600 font-medium">Notes du client</label>
                                                    <p className="text-sm text-gray-900 bg-white p-2 rounded border">{selectedCommand.notes_client}</p>
                                                </div>
                                            )}
                                            {selectedCommand.message_cadeau && (
                                                <div>
                                                    <label className="text-sm text-gray-600 font-medium">Message cadeau</label>
                                                    <p className="text-sm text-gray-900 bg-white p-2 rounded border">{selectedCommand.message_cadeau}</p>
                                                </div>
                                            )}
                                            {selectedCommand.notes_admin && (
                                                <div>
                                                    <label className="text-sm text-gray-600 font-medium">Notes administratives</label>
                                                    <p className="text-sm text-gray-900 bg-white p-2 rounded border">{selectedCommand.notes_admin}</p>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                )}
                            </div>

                            {/* Sidebar avec résumé et actions */}
                            <div className="space-y-6">
                                {/* Statut et priorité */}
                                <div className="bg-white border rounded-lg p-4">
                                    <h4 className="font-semibold text-gray-900 mb-3">Statut de la commande</h4>
                                    <div className="space-y-3">
                                        <div className="flex items-center justify-between">
                                            <span className="text-sm text-gray-600">Statut actuel</span>
                                            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(selectedCommand.statut)}`}>
                                                {getStatusIcon(selectedCommand.statut)}
                                                <span className="ml-1">{selectedCommand.statut_label}</span>
                                            </span>
                                        </div>
                                        <div className="flex items-center justify-between">
                                            <span className="text-sm text-gray-600">Priorité</span>
                                            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getPriorityColor(selectedCommand.priorite)}`}>
                                                {selectedCommand.priorite === 'normale' ? 'Normale' : 
                                                 selectedCommand.priorite === 'urgente' ? 'Urgente' : 'Très urgente'}
                                            </span>
                                        </div>
                                        {selectedCommand.est_cadeau && (
                                            <div className="flex items-center justify-between">
                                                <span className="text-sm text-gray-600">Cadeau</span>
                                                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-pink-100 text-pink-800">
                                                    Oui
                                                </span>
                                            </div>
                                        )}
                                    </div>
                                </div>

                                {/* Actions sur le statut */}
                                {selectedCommand.statut !== 'livree' && selectedCommand.statut !== 'annulee' && (
                                    <div className="bg-white border rounded-lg p-4">
                                        <h4 className="font-semibold text-gray-900 mb-3">Actions</h4>
                                        <div className="space-y-2">
                                            {selectedCommand.statut === 'en_attente' && (
                                                <button
                                                    onClick={() => updateStatus(selectedCommand.id, 'confirmee')}
                                                    disabled={updating}
                                                    className="w-full bg-blue-600 text-white px-3 py-2 rounded text-sm hover:bg-blue-700 disabled:opacity-50"
                                                >
                                                    {updating ? 'Mise à jour...' : 'Confirmer la commande'}
                                                </button>
                                            )}
                                            {selectedCommand.statut === 'confirmee' && (
                                                <button
                                                    onClick={() => updateStatus(selectedCommand.id, 'en_preparation')}
                                                    disabled={updating}
                                                    className="w-full bg-orange-600 text-white px-3 py-2 rounded text-sm hover:bg-orange-700 disabled:opacity-50"
                                                >
                                                    {updating ? 'Mise à jour...' : 'Mettre en préparation'}
                                                </button>
                                            )}
                                            {selectedCommand.statut === 'en_preparation' && (
                                                <button
                                                    onClick={() => updateStatus(selectedCommand.id, 'prete')}
                                                    disabled={updating}
                                                    className="w-full bg-purple-600 text-white px-3 py-2 rounded text-sm hover:bg-purple-700 disabled:opacity-50"
                                                >
                                                    {updating ? 'Mise à jour...' : 'Marquer comme prête'}
                                                </button>
                                            )}
                                            {selectedCommand.statut === 'prete' && (
                                                <button
                                                    onClick={() => updateStatus(selectedCommand.id, 'en_livraison')}
                                                    disabled={updating}
                                                    className="w-full bg-indigo-600 text-white px-3 py-2 rounded text-sm hover:bg-indigo-700 disabled:opacity-50"
                                                >
                                                    {updating ? 'Mise à jour...' : 'Mettre en livraison'}
                                                </button>
                                            )}
                                            {selectedCommand.statut === 'en_livraison' && (
                                                <button
                                                    onClick={() => updateStatus(selectedCommand.id, 'livree')}
                                                    disabled={updating}
                                                    className="w-full bg-green-600 text-white px-3 py-2 rounded text-sm hover:bg-green-700 disabled:opacity-50"
                                                >
                                                    {updating ? 'Mise à jour...' : 'Marquer comme livrée'}
                                                </button>
                                            )}
                                            <button
                                                onClick={() => {
                                                    const reason = prompt('Raison de l\'annulation:');
                                                    if (reason) {
                                                        cancelCommand(selectedCommand.id, reason);
                                                    }
                                                }}
                                                className="w-full bg-red-600 text-white px-3 py-2 rounded text-sm hover:bg-red-700"
                                            >
                                                Annuler la commande
                                            </button>
                                        </div>
                                    </div>
                                )}

                                {/* Résumé financier */}
                                <div className="bg-white border rounded-lg p-4">
                                    <h4 className="font-semibold text-gray-900 mb-3 flex items-center">
                                        <CreditCard className="w-5 h-5 mr-2" />
                                        Résumé financier
                                    </h4>
                                    <div className="space-y-2">
                                        <div className="flex justify-between text-sm">
                                            <span className="text-gray-600">Sous-total</span>
                                            <span className="font-medium">{formatPrice(selectedCommand.sous_total)}</span>
                                        </div>
                                        {selectedCommand.frais_livraison > 0 && (
                                            <div className="flex justify-between text-sm">
                                                <span className="text-gray-600">Frais de livraison</span>
                                                <span className="font-medium">{formatPrice(selectedCommand.frais_livraison)}</span>
                                            </div>
                                        )}
                                        {selectedCommand.remise > 0 && (
                                            <div className="flex justify-between text-sm">
                                                <span className="text-gray-600">Remise</span>
                                                <span className="font-medium text-green-600">-{formatPrice(selectedCommand.remise)}</span>
                                            </div>
                                        )}
                                        <div className="border-t pt-2">
                                            <div className="flex justify-between">
                                                <span className="font-semibold text-gray-900">Total</span>
                                                <span className="font-bold text-lg text-gray-900">{formatPrice(selectedCommand.montant_total)}</span>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                {/* Informations de suivi */}
                                <div className="bg-white border rounded-lg p-4">
                                    <h4 className="font-semibold text-gray-900 mb-3 flex items-center">
                                        <Clock className="w-5 h-5 mr-2" />
                                        Suivi
                                    </h4>
                                    <div className="space-y-2 text-sm">
                                        <div className="flex justify-between">
                                            <span className="text-gray-600">Commande passée</span>
                                            <span className="font-medium">{selectedCommand.date_commande}</span>
                                        </div>
                                        {selectedCommand.date_livraison_prevue && (
                                            <div className="flex justify-between">
                                                <span className="text-gray-600">Livraison prévue</span>
                                                <span className="font-medium">{selectedCommand.date_livraison_prevue}</span>
                                            </div>
                                        )}
                                        {selectedCommand.date_livraison_reelle && (
                                            <div className="flex justify-between">
                                                <span className="text-gray-600">Livraison réelle</span>
                                                <span className="font-medium">{selectedCommand.date_livraison_reelle}</span>
                                            </div>
                                        )}
                                        <div className="flex justify-between">
                                            <span className="text-gray-600">Source</span>
                                            <span className="font-medium capitalize">{selectedCommand.source}</span>
                                        </div>
                                    </div>
                                </div>

                                {/* Paiements */}
                                {selectedCommand.paiements && selectedCommand.paiements.length > 0 && (
                                    <div className="bg-white border rounded-lg p-4">
                                        <h4 className="font-semibold text-gray-900 mb-3">Paiements</h4>
                                        <div className="space-y-2">
                                            {selectedCommand.paiements.map((paiement, index) => (
                                                <div key={index} className="flex justify-between items-center text-sm">
                                                    <div>
                                                        <span className="font-medium">{formatPrice(paiement.montant)}</span>
                                                        <span className="text-gray-500 ml-2">({paiement.methode})</span>
                                                    </div>
                                                    <span className={`px-2 py-1 rounded text-xs ${
                                                        paiement.statut === 'valide' ? 'bg-green-100 text-green-800' :
                                                        paiement.statut === 'en_attente' ? 'bg-yellow-100 text-yellow-800' :
                                                        'bg-red-100 text-red-800'
                                                    }`}>
                                                        {paiement.statut}
                                                    </span>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Boutons de fermeture */}
                        <div className="flex justify-end space-x-3 mt-6 pt-4 border-t">
                            <button
                                onClick={closeModal}
                                className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50"
                            >
                                Fermer
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Modal de formulaire pour créer/modifier une commande */}
            {showFormModal && (
                <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
                    <div className="relative top-20 mx-auto p-5 border w-11/12 max-w-2xl shadow-lg rounded-md bg-white">
                        <div className="flex items-center justify-between mb-4">
                            <h3 className="text-lg font-bold text-gray-900">
                                {editingCommand ? 'Modifier la commande' : 'Nouvelle commande'}
                            </h3>
                            <button
                                onClick={closeFormModal}
                                className="text-gray-400 hover:text-gray-600"
                            >
                                <X className="w-6 h-6" />
                            </button>
                        </div>

                        <div className="text-center py-8">
                            <Package className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                            <h4 className="text-lg font-semibold text-gray-900 mb-2">
                                Formulaire de commande
                            </h4>
                            <p className="text-gray-600 mb-4">
                                Cette fonctionnalité sera bientôt disponible.
                            </p>
                            <p className="text-sm text-gray-500 mb-6">
                                Le formulaire complet de création/modification de commande avec sélection de produits, 
                                gestion des clients, et calculs automatiques est en cours de développement.
                            </p>
                            <button
                                onClick={closeFormModal}
                                className="px-4 py-2 bg-purple-600 text-white rounded-md text-sm font-medium hover:bg-purple-700"
                            >
                                Fermer
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Commands;