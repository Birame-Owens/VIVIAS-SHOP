import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { 
    Plus, 
    Search, 
    Edit, 
    Eye,
    Trash2,
    RefreshCw,
    X,
    Phone,
    Mail,
    MapPin,
    Star,
    MessageCircle,
    Users,
    Calendar,
    TrendingUp,
    Crown,
    ChevronLeft,
    ChevronRight,
    Send,
    MessageSquare
} from 'lucide-react';
import { toast } from 'react-hot-toast';

const Clients = () => {
    const { token } = useAuth();
    const [clients, setClients] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [typeFilter, setTypeFilter] = useState('');
    const [villeFilter, setVilleFilter] = useState('');
    const [whatsappFilter, setWhatsappFilter] = useState('');
    const [currentPage, setCurrentPage] = useState(1);
    const [pagination, setPagination] = useState({});
    const [showModal, setShowModal] = useState(false);
    const [selectedClient, setSelectedClient] = useState(null);
    const [showFormModal, setShowFormModal] = useState(false);
    const [editingClient, setEditingClient] = useState(null);
    const [showWhatsAppModal, setShowWhatsAppModal] = useState(false);
    const [showBulkModal, setShowBulkModal] = useState(false);
    const [stats, setStats] = useState({});
    const [updating, setUpdating] = useState(false);

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

    // Charger les clients
    const loadClients = async () => {
        try {
            setLoading(true);
            const params = new URLSearchParams({
                page: currentPage,
                per_page: 15,
                search: searchTerm
            });

            if (typeFilter) params.append('type_client', typeFilter);
            if (villeFilter) params.append('ville', villeFilter);
            if (whatsappFilter) params.append('accepte_whatsapp', whatsappFilter);

            const response = await fetch(`${API_BASE}/clients?${params}`, {
                headers: getHeaders()
            });

            if (!response.ok) throw new Error('Erreur lors du chargement');

            const result = await response.json();
            if (result.success) {
                setClients(result.data.clients);
                setPagination(result.data.pagination);
            }
        } catch (error) {
            console.error('Erreur:', error);
            toast.error('Erreur lors du chargement des clients');
        } finally {
            setLoading(false);
        }
    };

    // Charger les statistiques
    const loadStats = async () => {
        try {
            const response = await fetch(`${API_BASE}/clients/stats`, {
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
        loadClients();
    }, [currentPage, searchTerm, typeFilter, villeFilter, whatsappFilter]);

    useEffect(() => {
        loadStats();
    }, []);

    // Gérer la recherche
    const handleSearch = (e) => {
        setSearchTerm(e.target.value);
        setCurrentPage(1);
    };

    // Voir les détails d'un client
    const viewClient = async (client) => {
        try {
            const response = await fetch(`${API_BASE}/clients/${client.id}`, {
                headers: getHeaders()
            });

            if (!response.ok) throw new Error('Erreur lors du chargement');

            const result = await response.json();
            if (result.success) {
                setSelectedClient(result.data.client);
                setShowModal(true);
            }
        } catch (error) {
            console.error('Erreur:', error);
            toast.error('Erreur lors du chargement des détails');
        }
    };

    // Ouvrir WhatsApp
    const openWhatsApp = (client) => {
        if (!client.accepte_whatsapp) {
            toast.error('Ce client n\'accepte pas WhatsApp');
            return;
        }
        window.open(client.whatsapp_url, '_blank');
    };

    // Envoyer message WhatsApp via l'API
    const sendWhatsAppMessage = async (clientId, message) => {
        try {
            setUpdating(true);
            const response = await fetch(`${API_BASE}/clients/${clientId}/send-whatsapp`, {
                method: 'POST',
                headers: {
                    ...getHeaders(),
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    message: message,
                    type: 'notification'
                })
            });

            const result = await response.json();
            if (result.success) {
                toast.success('Message WhatsApp envoyé avec succès');
                setShowWhatsAppModal(false);
            } else {
                toast.error(result.message);
            }
        } catch (error) {
            console.error('Erreur:', error);
            toast.error('Erreur lors de l\'envoi du message');
        } finally {
            setUpdating(false);
        }
    };

    // Envoyer notification en masse
    const sendBulkNotification = async (message, filters) => {
        try {
            setUpdating(true);
            const response = await fetch(`${API_BASE}/clients/send-novelty-notification`, {
                method: 'POST',
                headers: {
                    ...getHeaders(),
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    message: message,
                    filters: filters
                })
            });

            const result = await response.json();
            if (result.success) {
                toast.success(`Notification envoyée à ${result.data.envoyes} clients`);
                setShowBulkModal(false);
            } else {
                toast.error(result.message);
            }
        } catch (error) {
            console.error('Erreur:', error);
            toast.error('Erreur lors de l\'envoi de la notification');
        } finally {
            setUpdating(false);
        }
    };

    // Supprimer un client
    const deleteClient = async (clientId) => {
        if (!confirm('Êtes-vous sûr de vouloir supprimer ce client ?')) {
            return;
        }

        try {
            const response = await fetch(`${API_BASE}/clients/${clientId}`, {
                method: 'DELETE',
                headers: getHeaders()
            });

            const result = await response.json();
            if (result.success) {
                toast.success('Client supprimé avec succès');
                loadClients();
                loadStats();
            } else {
                toast.error(result.message);
            }
        } catch (error) {
            console.error('Erreur:', error);
            toast.error('Erreur lors de la suppression');
        }
    };

    // Fermer les modaux
    const closeModal = () => {
        setShowModal(false);
        setSelectedClient(null);
    };

    const closeFormModal = () => {
        setShowFormModal(false);
        setEditingClient(null);
    };

    // Formater le prix
    const formatPrice = (price) => {
        return new Intl.NumberFormat('fr-SN', {
            style: 'currency',
            currency: 'XOF',
            minimumFractionDigits: 0
        }).format(price);
    };

    // Obtenir la couleur du type de client
    const getTypeColor = (type) => {
        const colors = {
            'nouveau': 'bg-blue-100 text-blue-800',
            'regulier': 'bg-green-100 text-green-800',
            'fidele': 'bg-purple-100 text-purple-800',
            'vip': 'bg-yellow-100 text-yellow-800'
        };
        return colors[type] || 'bg-gray-100 text-gray-800';
    };

    // Obtenir l'icône du type de client
    const getTypeIcon = (type) => {
        const icons = {
            'nouveau': Users,
            'regulier': Star,
            'fidele': TrendingUp,
            'vip': Crown
        };
        const Icon = icons[type] || Users;
        return <Icon className="w-4 h-4" />;
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
                        <h1 className="text-2xl font-bold text-gray-900">Clients</h1>
                        <p className="text-gray-600">Gérez vos clients et communiquez via WhatsApp</p>
                    </div>
                    <div className="flex space-x-3">
                        <button
                            onClick={() => setShowBulkModal(true)}
                            className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 flex items-center space-x-2"
                        >
                            <MessageSquare className="w-4 h-4" />
                            <span>Notification groupe</span>
                        </button>
                        <button
                            onClick={() => {
                                setEditingClient(null);
                                setShowFormModal(true);
                            }}
                            className="bg-purple-600 text-white px-4 py-2 rounded-lg hover:bg-purple-700 flex items-center space-x-2"
                        >
                            <Plus className="w-4 h-4" />
                            <span>Nouveau client</span>
                        </button>
                    </div>
                </div>

                {/* Statistiques rapides */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
                    <div className="bg-white p-4 rounded-lg shadow-sm border">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm text-gray-600">Total clients</p>
                                <p className="text-2xl font-bold text-gray-900">{stats.total_clients || 0}</p>
                            </div>
                            <Users className="w-8 h-8 text-purple-500" />
                        </div>
                    </div>
                    
                    <div className="bg-white p-4 rounded-lg shadow-sm border">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm text-gray-600">Clients VIP</p>
                                <p className="text-2xl font-bold text-yellow-600">{stats.clients_vip || 0}</p>
                            </div>
                            <Crown className="w-8 h-8 text-yellow-500" />
                        </div>
                    </div>
                    
                    <div className="bg-white p-4 rounded-lg shadow-sm border">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm text-gray-600">WhatsApp actifs</p>
                                <p className="text-2xl font-bold text-green-600">{stats.clients_whatsapp || 0}</p>
                            </div>
                            <MessageCircle className="w-8 h-8 text-green-500" />
                        </div>
                    </div>
                    
                    <div className="bg-white p-4 rounded-lg shadow-sm border">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm text-gray-600">Panier moyen</p>
                                <p className="text-lg font-bold text-blue-600">{formatPrice(stats.panier_moyen_global || 0)}</p>
                            </div>
                            <TrendingUp className="w-8 h-8 text-blue-500" />
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
                                placeholder="Rechercher un client..."
                                value={searchTerm}
                                onChange={handleSearch}
                                className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent w-full md:w-80"
                            />
                        </div>
                        
                        <select
                            value={typeFilter}
                            onChange={(e) => {
                                setTypeFilter(e.target.value);
                                setCurrentPage(1);
                            }}
                            className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                        >
                            <option value="">Tous les types</option>
                            <option value="nouveau">Nouveau</option>
                            <option value="regulier">Régulier</option>
                            <option value="fidele">Fidèle</option>
                            <option value="vip">VIP</option>
                        </select>

                        <select
                            value={whatsappFilter}
                            onChange={(e) => {
                                setWhatsappFilter(e.target.value);
                                setCurrentPage(1);
                            }}
                            className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                        >
                            <option value="">WhatsApp</option>
                            <option value="true">Accepte WhatsApp</option>
                            <option value="false">N'accepte pas</option>
                        </select>
                        
                                             <button
                            onClick={loadClients}
                            className="p-2 border border-gray-300 rounded-lg hover:bg-gray-50"
                            title="Actualiser"
                        >
                            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
                        </button>
                    </div>

                    <div className="flex items-center space-x-2">
                        <span className="text-sm text-gray-500">
                            {pagination.total || 0} client(s)
                        </span>
                    </div>
                </div>
            </div>

            {/* Liste des clients */}
            <div className="bg-white rounded-lg shadow-sm border overflow-hidden">
                {loading ? (
                    <div className="p-8 text-center">
                        <RefreshCw className="w-8 h-8 animate-spin mx-auto mb-4 text-gray-400" />
                        <p className="text-gray-500">Chargement des clients...</p>
                    </div>
                ) : clients.length === 0 ? (
                    <div className="p-8 text-center">
                        <Users className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                        <h3 className="text-lg font-semibold text-gray-900 mb-2">Aucun client trouvé</h3>
                        <p className="text-gray-500">
                            {searchTerm || typeFilter || whatsappFilter
                                ? 'Aucun client ne correspond à vos critères de recherche.'
                                : 'Aucun client n\'a encore été créé.'
                            }
                        </p>
                    </div>
                ) : (
                    <div className="overflow-x-auto">
                        <table className="w-full">
                            <thead className="bg-gray-50 border-b">
                                <tr>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Client
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Contact
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Type / Fidélité
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Commandes
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Dernière activité
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Actions
                                    </th>
                                </tr>
                            </thead>
                            <tbody className="bg-white divide-y divide-gray-200">
                                {clients.map((client) => (
                                    <tr key={client.id} className="hover:bg-gray-50">
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <div className="flex items-center">
                                                <div className="w-10 h-10 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full flex items-center justify-center text-white font-semibold">
                                                    {client.nom.charAt(0)}{client.prenom.charAt(0)}
                                                </div>
                                                <div className="ml-4">
                                                    <div className="text-sm font-medium text-gray-900">
                                                        {client.nom_complet}
                                                    </div>
                                                    <div className="text-sm text-gray-500 flex items-center">
                                                        <MapPin className="w-3 h-3 mr-1" />
                                                        {client.ville}
                                                        {client.quartier && `, ${client.quartier}`}
                                                    </div>
                                                    {client.est_vip && (
                                                        <span className="inline-flex items-center px-2 py-1 rounded-full text-xs bg-yellow-100 text-yellow-800 mt-1">
                                                            <Crown className="w-3 h-3 mr-1" />
                                                            VIP
                                                        </span>
                                                    )}
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <div className="space-y-1">
                                                <div className="flex items-center text-sm text-gray-900">
                                                    <Phone className="w-3 h-3 mr-2 text-gray-400" />
                                                    {client.telephone}
                                                    {client.accepte_whatsapp && (
                                                        <button
                                                            onClick={() => openWhatsApp(client)}
                                                            className="ml-2 text-green-600 hover:text-green-800"
                                                            title="Ouvrir WhatsApp"
                                                        >
                                                            <MessageCircle className="w-4 h-4" />
                                                        </button>
                                                    )}
                                                </div>
                                                {client.email && (
                                                    <div className="flex items-center text-sm text-gray-500">
                                                        <Mail className="w-3 h-3 mr-2 text-gray-400" />
                                                        {client.email}
                                                    </div>
                                                )}
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <div className="space-y-2">
                                                <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getTypeColor(client.type_client)}`}>
                                                    {getTypeIcon(client.type_client)}
                                                    <span className="ml-1">{client.type_client_label}</span>
                                                </span>
                                                <div className="text-sm text-gray-500">
                                                    Score: {client.score_fidelite} pts
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <div className="text-sm text-gray-900">
                                                {client.nombre_commandes} commande(s)
                                            </div>
                                            <div className="text-sm text-gray-500">
                                                {formatPrice(client.total_depense)} total
                                            </div>
                                            {client.panier_moyen > 0 && (
                                                <div className="text-xs text-gray-400">
                                                    Panier moy: {formatPrice(client.panier_moyen)}
                                                </div>
                                            )}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                            <div>
                                                {client.derniere_visite ? (
                                                    <>
                                                        <div className="flex items-center">
                                                            <Calendar className="w-3 h-3 mr-1" />
                                                            {client.derniere_visite}
                                                        </div>
                                                        {client.est_inactif && (
                                                            <span className="inline-flex items-center px-2 py-1 rounded-full text-xs bg-orange-100 text-orange-800 mt-1">
                                                                Inactif
                                                            </span>
                                                        )}
                                                    </>
                                                ) : (
                                                    <span className="text-gray-400">Jamais connecté</span>
                                                )}
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                                            <div className="flex items-center space-x-2">
                                                <button
                                                    onClick={() => viewClient(client)}
                                                    className="text-purple-600 hover:text-purple-900 p-1 rounded"
                                                    title="Voir les détails"
                                                >
                                                    <Eye className="w-4 h-4" />
                                                </button>
                                                <button
                                                    onClick={() => {
                                                        setEditingClient(client);
                                                        setShowFormModal(true);
                                                    }}
                                                    className="text-blue-600 hover:text-blue-900 p-1 rounded"
                                                    title="Modifier"
                                                >
                                                    <Edit className="w-4 h-4" />
                                                </button>
                                                {client.accepte_whatsapp && (
                                                    <button
                                                        onClick={() => {
                                                            setSelectedClient(client);
                                                            setShowWhatsAppModal(true);
                                                        }}
                                                        className="text-green-600 hover:text-green-900 p-1 rounded"
                                                        title="Envoyer message WhatsApp"
                                                    >
                                                        <Send className="w-4 h-4" />
                                                    </button>
                                                )}
                                                <button
                                                    onClick={() => deleteClient(client.id)}
                                                    className="text-red-600 hover:text-red-900 p-1 rounded"
                                                    title="Supprimer"
                                                >
                                                    <Trash2 className="w-4 h-4" />
                                                </button>
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

            {/* Modal détails client */}
            {showModal && selectedClient && (
                <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
                    <div className="relative top-20 mx-auto p-5 border w-11/12 max-w-4xl shadow-lg rounded-md bg-white">
                        <div className="flex items-center justify-between mb-4">
                            <h3 className="text-lg font-bold text-gray-900">
                                Profil de {selectedClient.nom_complet}
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
                                {/* Informations personnelles */}
                                <div className="bg-gray-50 p-4 rounded-lg">
                                    <h4 className="font-semibold text-gray-900 mb-3 flex items-center">
                                        <Users className="w-5 h-5 mr-2" />
                                        Informations personnelles
                                    </h4>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        <div>
                                            <label className="text-sm text-gray-600">Nom complet</label>
                                            <p className="font-medium">{selectedClient.nom_complet}</p>
                                        </div>
                                        <div>
                                            <label className="text-sm text-gray-600">Genre</label>
                                            <p className="font-medium">{selectedClient.genre || 'Non spécifié'}</p>
                                        </div>
                                        <div>
                                            <label className="text-sm text-gray-600">Âge</label>
                                            <p className="font-medium">{selectedClient.age ? `${selectedClient.age} ans` : 'Non spécifié'}</p>
                                        </div>
                                        <div>
                                            <label className="text-sm text-gray-600">Ville</label>
                                            <p className="font-medium">{selectedClient.ville}</p>
                                        </div>
                                    </div>
                                    {selectedClient.adresse_principale && (
                                        <div className="mt-4">
                                            <label className="text-sm text-gray-600">Adresse</label>
                                            <p className="font-medium">{selectedClient.adresse_principale}</p>
                                        </div>
                                    )}
                                </div>

                                {/* Préférences */}
                                {(selectedClient.taille_habituelle || selectedClient.couleurs_preferees || selectedClient.styles_preferes) && (
                                    <div className="bg-gray-50 p-4 rounded-lg">
                                        <h4 className="font-semibold text-gray-900 mb-3">Préférences</h4>
                                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                            {selectedClient.taille_habituelle && (
                                                <div>
                                                    <label className="text-sm text-gray-600">Taille habituelle</label>
                                                    <p className="font-medium">{selectedClient.taille_habituelle}</p>
                                                </div>
                                            )}
                                            {selectedClient.couleurs_preferees && (
                                                <div>
                                                    <label className="text-sm text-gray-600">Couleurs préférées</label>
                                                    <p className="font-medium">{selectedClient.couleurs_preferees}</p>
                                                </div>
                                            )}
                                            {selectedClient.styles_preferes && (
                                                <div>
                                                    <label className="text-sm text-gray-600">Styles préférés</label>
                                                    <p className="font-medium">{selectedClient.styles_preferes}</p>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                )}

                                {/* Commandes récentes */}
                                {selectedClient.commandes_recentes && selectedClient.commandes_recentes.length > 0 && (
                                    <div>
                                        <h4 className="font-semibold text-gray-900 mb-3">Commandes récentes</h4>
                                        <div className="border rounded-lg overflow-hidden">
                                            <table className="w-full">
                                                <thead className="bg-gray-50">
                                                    <tr>
                                                        <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">N° Commande</th>
                                                        <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Montant</th>
                                                        <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Statut</th>
                                                        <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Date</th>
                                                    </tr>
                                                </thead>
                                                <tbody className="divide-y divide-gray-200">
                                                    {selectedClient.commandes_recentes.map((commande, index) => (
                                                        <tr key={index}>
                                                            <td className="px-4 py-3 text-sm font-medium text-gray-900">
                                                                {commande.numero_commande}
                                                            </td>
                                                            <td className="px-4 py-3 text-sm text-gray-900">
                                                                {formatPrice(commande.montant_total)}
                                                            </td>
                                                            <td className="px-4 py-3 text-sm text-gray-900">
                                                                {commande.statut}
                                                            </td>
                                                            <td className="px-4 py-3 text-sm text-gray-500">
                                                                {commande.date_commande}
                                                            </td>
                                                        </tr>
                                                    ))}
                                                </tbody>
                                            </table>
                                        </div>
                                    </div>
                                )}
                            </div>

                            {/* Sidebar avec statistiques */}
                            <div className="space-y-6">
                                {/* Statut client */}
                                <div className="bg-white border rounded-lg p-4">
                                    <h4 className="font-semibold text-gray-900 mb-3">Statut client</h4>
                                    <div className="space-y-3">
                                        <div className="flex items-center justify-between">
                                            <span className="text-sm text-gray-600">Type</span>
                                            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getTypeColor(selectedClient.type_client)}`}>
                                                {getTypeIcon(selectedClient.type_client)}
                                                <span className="ml-1">{selectedClient.type_client_label}</span>
                                            </span>
                                        </div>
                                        <div className="flex items-center justify-between">
                                            <span className="text-sm text-gray-600">Score fidélité</span>
                                            <span className="font-medium">{selectedClient.score_fidelite} pts</span>
                                        </div>
                                        <div className="flex items-center justify-between">
                                            <span className="text-sm text-gray-600">Priorité</span>
                                            <span className="font-medium capitalize">{selectedClient.priorite}</span>
                                        </div>
                                    </div>
                                </div>

                                {/* Communications */}
                                <div className="bg-white border rounded-lg p-4">
                                    <h4 className="font-semibold text-gray-900 mb-3">Communications</h4>
                                    <div className="space-y-2">
                                        <div className="flex items-center justify-between">
                                            <span className="text-sm text-gray-600">WhatsApp</span>
                                            <span className={`px-2 py-1 rounded text-xs ${selectedClient.accepte_whatsapp ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'}`}>
                                                {selectedClient.accepte_whatsapp ? 'Accepte' : 'Refuse'}
                                            </span>
                                        </div>
                                        <div className="flex items-center justify-between">
                                            <span className="text-sm text-gray-600">Email</span>
                                            <span className={`px-2 py-1 rounded text-xs ${selectedClient.accepte_email ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'}`}>
                                                {selectedClient.accepte_email ? 'Accepte' : 'Refuse'}
                                            </span>
                                        </div>
                                        <div className="flex items-center justify-between">
                                            <span className="text-sm text-gray-600">Promotions</span>
                                            <span className={`px-2 py-1 rounded text-xs ${selectedClient.accepte_promotions ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'}`}>
                                                {selectedClient.accepte_promotions ? 'Accepte' : 'Refuse'}
                                            </span>
                                        </div>
                                    </div>
                                    
                                    {selectedClient.accepte_whatsapp && (
                                        <div className="mt-4 pt-4 border-t">
                                            <button
                                                onClick={() => openWhatsApp(selectedClient)}
                                                className="w-full bg-green-600 text-white px-3 py-2 rounded text-sm hover:bg-green-700 flex items-center justify-center"
                                            >
                                                <MessageCircle className="w-4 h-4 mr-2" />
                                                Ouvrir WhatsApp
                                            </button>
                                        </div>
                                    )}
                                </div>

                                {/* Statistiques commerciales */}
                                <div className="bg-white border rounded-lg p-4">
                                    <h4 className="font-semibold text-gray-900 mb-3">Statistiques</h4>
                                    <div className="space-y-2 text-sm">
                                        <div className="flex justify-between">
                                            <span className="text-gray-600">Commandes</span>
                                            <span className="font-medium">{selectedClient.nombre_commandes}</span>
                                        </div>
                                        <div className="flex justify-between">
                                            <span className="text-gray-600">Total dépensé</span>
                                            <span className="font-medium">{formatPrice(selectedClient.total_depense)}</span>
                                        </div>
                                        <div className="flex justify-between">
                                            <span className="text-gray-600">Panier moyen</span>
                                            <span className="font-medium">{formatPrice(selectedClient.panier_moyen)}</span>
                                        </div>
                                        {selectedClient.budget_moyen && (
                                            <div className="flex justify-between">
                                                <span className="text-gray-600">Budget moyen</span>
                                                <span className="font-medium">{formatPrice(selectedClient.budget_moyen)}</span>
                                            </div>
                                        )}
                                    </div>
                                </div>

                                {/* Notes privées */}
                                {selectedClient.notes_privees && (
                                    <div className="bg-white border rounded-lg p-4">
                                        <h4 className="font-semibold text-gray-900 mb-3">Notes privées</h4>
                                        <p className="text-sm text-gray-900 bg-gray-50 p-3 rounded">
                                            {selectedClient.notes_privees}
                                        </p>
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

            {/* Modal formulaire client */}
            {showFormModal && (
                <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
                    <div className="relative top-20 mx-auto p-5 border w-11/12 max-w-2xl shadow-lg rounded-md bg-white">
                        <div className="flex items-center justify-between mb-4">
                            <h3 className="text-lg font-bold text-gray-900">
                                {editingClient ? 'Modifier le client' : 'Nouveau client'}
                            </h3>
                            <button
                                onClick={closeFormModal}
                                className="text-gray-400 hover:text-gray-600"
                            >
                                <X className="w-6 h-6" />
                            </button>
                        </div>

                        <div className="text-center py-8">
                            <Users className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                            <h4 className="text-lg font-semibold text-gray-900 mb-2">
                                Formulaire client
                            </h4>
                            <p className="text-gray-600 mb-4">
                                Cette fonctionnalité sera bientôt disponible.
                            </p>
                            <p className="text-sm text-gray-500 mb-6">
                                Le formulaire complet de création/modification de client avec tous les champs 
                                et validations est en cours de développement.
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

            {/* Modal WhatsApp individuel */}
            {showWhatsAppModal && selectedClient && (
                <WhatsAppModal
                    client={selectedClient}
                    onClose={() => setShowWhatsAppModal(false)}
                    onSend={(message) => sendWhatsAppMessage(selectedClient.id, message)}
                    updating={updating}
                />
            )}

            {/* Modal notification en masse */}
            {showBulkModal && (
                <BulkNotificationModal
                    onClose={() => setShowBulkModal(false)}
                    onSend={sendBulkNotification}
                    updating={updating}
                />
            )}
        </div>
    );
};

// Composant Modal WhatsApp
const WhatsAppModal = ({ client, onClose, onSend, updating }) => {
    const [message, setMessage] = useState('');

    const handleSubmit = (e) => {
        e.preventDefault();
        if (!message.trim()) return;
        onSend(message);
        setMessage('');
    };

    return (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
            <div className="relative top-20 mx-auto p-5 border w-11/12 max-w-md shadow-lg rounded-md bg-white">
                <div className="flex items-center justify-between mb-4">
                    <h3 className="text-lg font-bold text-gray-900 flex items-center">
                        <MessageCircle className="w-5 h-5 mr-2 text-green-600" />
                        Message WhatsApp
                    </h3>
                    <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
                        <X className="w-6 h-6" />
                    </button>
                </div>

                <div className="mb-4 p-3 bg-gray-50 rounded-lg">
                    <p className="text-sm text-gray-600">À :</p>
                    <p className="font-medium">{client.nom_complet}</p>
                    <p className="text-sm text-gray-500">{client.telephone}</p>
                </div>

                <form onSubmit={handleSubmit}>
                    <div className="mb-4">
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            Message
                        </label>
                        <textarea
                            value={message}
                            onChange={(e) => setMessage(e.target.value)}
                            rows={4}
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-green-500 focus:border-green-500"
                            placeholder="Tapez votre message..."
                            required
                        />
                        <p className="text-xs text-gray-500 mt-1">
                            {message.length}/1000 caractères
                        </p>
                    </div>

                    <div className="flex justify-end space-x-3">
                        <button
                            type="button"
                            onClick={onClose}
                            className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50"
                        >
                            Annuler
                        </button>
                        <button
                            type="submit"
                            disabled={updating || !message.trim()}
                            className="px-4 py-2 bg-green-600 text-white rounded-md text-sm font-medium hover:bg-green-700 disabled:opacity-50 flex items-center"
                        >
                            {updating ? (
                                <>
                                    <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                                    Envoi...
                                </>
                            ) : (
                                <>
                                    <Send className="w-4 h-4 mr-2" />
                                    Envoyer
                                </>
                            )}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

// Composant Modal notification en masse
const BulkNotificationModal = ({ onClose, onSend, updating }) => {
    const [message, setMessage] = useState('');
    const [filters, setFilters] = useState({
        type_client: [],
        ville: [],
        score_fidelite_min: ''
    });

    const handleSubmit = (e) => {
        e.preventDefault();
        if (!message.trim()) return;
        onSend(message, filters);
        setMessage('');
    };

    const handleFilterChange = (key, value) => {
        setFilters(prev => ({
            ...prev,
            [key]: value
        }));
    };

    const addToArrayFilter = (key, value) => {
        if (value && !filters[key].includes(value)) {
            setFilters(prev => ({
                ...prev,
                [key]: [...prev[key], value]
            }));
        }
    };

    const removeFromArrayFilter = (key, value) => {
        setFilters(prev => ({
            ...prev,
            [key]: prev[key].filter(item => item !== value)
        }));
    };

    return (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
            <div className="relative top-20 mx-auto p-5 border w-11/12 max-w-lg shadow-lg rounded-md bg-white">
                <div className="flex items-center justify-between mb-4">
                    <h3 className="text-lg font-bold text-gray-900 flex items-center">
                        <MessageSquare className="w-5 h-5 mr-2 text-green-600" />
                        Notification en masse
                    </h3>
                    <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
                        <X className="w-6 h-6" />
                    </button>
                </div>

                <form onSubmit={handleSubmit} className="space-y-4">
                    {/* Message */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            Message de nouveauté
                        </label>
                        <textarea
                            value={message}
                            onChange={(e) => setMessage(e.target.value)}
                            rows={4}
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-green-500 focus:border-green-500"
                            placeholder="Bonjour {nom}, nous avons de nouveaux produits qui pourraient vous intéresser..."
                            required
                        />
                        <p className="text-xs text-gray-500 mt-1">
                            Utilisez {"{nom}"} pour personnaliser. {message.length}/1000 caractères
                        </p>
                    </div>

                    {/* Filtres */}
                    <div className="border-t pt-4">
                        <h4 className="font-medium text-gray-900 mb-3">Filtres des destinataires</h4>
                        
                        {/* Types de clients */}
                        <div className="mb-3">
                            <label className="block text-sm text-gray-700 mb-1">Types de clients</label>
                            <div className="flex flex-wrap gap-2 mb-2">
                                {filters.type_client.map(type => (
                                    <span key={type} className="inline-flex items-center px-2 py-1 rounded-full text-xs bg-purple-100 text-purple-800">
                                        {type}
                                        <button
                                            type="button"
                                            onClick={() => removeFromArrayFilter('type_client', type)}
                                            className="ml-1 text-purple-600 hover:text-purple-800"
                                        >
                                            <X className="w-3 h-3" />
                                        </button>
                                    </span>
                                ))}
                            </div>
                            <select
                                onChange={(e) => {
                                    addToArrayFilter('type_client', e.target.value);
                                    e.target.value = '';
                                }}
                                className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm"
                            >
                                <option value="">Ajouter un type</option>
                                <option value="nouveau">Nouveau</option>
                                <option value="regulier">Régulier</option>
                                <option value="fidele">Fidèle</option>
                                <option value="vip">VIP</option>
                            </select>
                        </div>

                        {/* Score de fidélité minimum */}
                        <div className="mb-3">
                            <label className="block text-sm text-gray-700 mb-1">Score fidélité minimum</label>
                            <input
                                type="number"
                                min="0"
                                value={filters.score_fidelite_min}
                                onChange={(e) => handleFilterChange('score_fidelite_min', e.target.value)}
                                className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm"
                                placeholder="Ex: 500"
                            />
                        </div>

                        <p className="text-xs text-gray-500">
                            Laissez vide pour envoyer à tous les clients qui acceptent WhatsApp et les promotions.
                        </p>
                    </div>

                    <div className="flex justify-end space-x-3 pt-4 border-t">
                        <button
                            type="button"
                            onClick={onClose}
                            className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50"
                        >
                            Annuler
                        </button>
                        <button
                            type="submit"
                            disabled={updating || !message.trim()}
                            className="px-4 py-2 bg-green-600 text-white rounded-md text-sm font-medium hover:bg-green-700 disabled:opacity-50 flex items-center"
                        >
                            {updating ? (
                                <>
                                    <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                                    Envoi...
                                </>
                            ) : (
                                <>
                                    <MessageSquare className="w-4 h-4 mr-2" />
                                    Envoyer notification
                                </>
                            )}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};
export default Clients;