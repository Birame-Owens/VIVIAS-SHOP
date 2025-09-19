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
    FileText,
    Ruler,
    Save,
    Trash2
} from 'lucide-react';
import { toast } from 'react-hot-toast';

const Commands = () => {
    const { token } = useAuth();
    
    // États principaux
    const [commands, setCommands] = useState([]);
    const [clients, setClients] = useState([]);
    const [produits, setProduits] = useState([]);
    const [loading, setLoading] = useState(true);
    const [updating, setUpdating] = useState(false);
    
    // États de recherche et filtres
    const [searchTerm, setSearchTerm] = useState('');
    const [statusFilter, setStatusFilter] = useState('');
    const [priorityFilter, setPriorityFilter] = useState('');
    
    // États de pagination
    const [currentPage, setCurrentPage] = useState(1);
    const [pagination, setPagination] = useState({});
    
    // États des modaux
    const [showModal, setShowModal] = useState(false);
    const [showFormModal, setShowFormModal] = useState(false);
    const [selectedCommand, setSelectedCommand] = useState(null);
    
    // États du formulaire
    const [formData, setFormData] = useState({
        client_id: '',
        nom_destinataire: '',
        telephone_livraison: '',
        adresse_livraison: '',
        instructions_livraison: '',
        mode_livraison: 'domicile',
        date_livraison_prevue: '',
        notes_client: '',
        notes_admin: '',
        priorite: 'normale',
        est_cadeau: false,
        message_cadeau: '',
        code_promo: '',
        frais_livraison: 0,
        remise: 0,
        articles: []
    });
    
    const [selectedClient, setSelectedClient] = useState(null);
    const [stats, setStats] = useState({});

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

    // Charger les données
    useEffect(() => {
        loadCommands();
        loadStats();
    }, [currentPage, searchTerm, statusFilter, priorityFilter]);

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

    const loadClients = async () => {
        try {
            const response = await fetch(`${API_BASE}/clients-with-mesures`, {
                headers: getHeaders()
            });

            if (!response.ok) throw new Error('Erreur lors du chargement');

            const result = await response.json();
            if (result.success) {
                setClients(result.data.clients);
            }
        } catch (error) {
            console.error('Erreur clients:', error);
            toast.error('Erreur lors du chargement des clients');
        }
    };

    const loadProduits = async () => {
        try {
            const response = await fetch(`${API_BASE}/produits`, {
                headers: getHeaders()
            });

            if (!response.ok) throw new Error('Erreur lors du chargement');

            const result = await response.json();
            if (result.success) {
                setProduits(result.data.produits);
            }
        } catch (error) {
            console.error('Erreur produits:', error);
            toast.error('Erreur lors du chargement des produits');
        }
    };

    // Gestion du formulaire
    const openFormModal = () => {
        loadClients();
        loadProduits();
        setShowFormModal(true);
    };

    const closeFormModal = () => {
        setShowFormModal(false);
        setFormData({
            client_id: '',
            nom_destinataire: '',
            telephone_livraison: '',
            adresse_livraison: '',
            instructions_livraison: '',
            mode_livraison: 'domicile',
            date_livraison_prevue: '',
            notes_client: '',
            notes_admin: '',
            priorite: 'normale',
            est_cadeau: false,
            message_cadeau: '',
            code_promo: '',
            frais_livraison: 0,
            remise: 0,
            articles: []
        });
        setSelectedClient(null);
    };

    const handleClientChange = (clientId) => {
        const client = clients.find(c => c.id === parseInt(clientId));
        
        if (client) {
            setSelectedClient(client);
            setFormData({
                ...formData,
                client_id: client.id,
            nom_destinataire: client.nom_complet,  // ← UTILISEZ nom_complet au lieu de nom + prenom
            telephone_livraison: client.telephone,
            adresse_livraison: client.adresse_principale || '',
            instructions_livraison: client.indications_livraison || ''
        });
    }
};

    const addArticle = () => {
    setFormData({
        ...formData,
        articles: [
            ...formData.articles,
            {
                produit_id: '',
                quantite: 1,
                prix_unitaire: 0,
                taille: '',
                couleur: '',
                tissu: '',
                utilise_mesures_client: false,
                mesures_personnalisees: false,
                mesures: {},
                instructions: ''
            }
        ]
    });
};

    const updateArticle = (index, field, value) => {
        const newArticles = [...formData.articles];
        newArticles[index][field] = value;
        setFormData({ ...formData, articles: newArticles });
    };

    const removeArticle = (index) => {
        setFormData({
            ...formData,
            articles: formData.articles.filter((_, i) => i !== index)
        });
    };

    const handleProduitChange = (index, produitId) => {
        const produit = produits.find(p => p.id === parseInt(produitId));
        if (produit) {
            updateArticle(index, 'produit_id', produit.id);
            updateArticle(index, 'prix_unitaire', produit.prix);
        }
    };

   const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (formData.articles.length === 0) {
        toast.error('Ajoutez au moins un article à la commande');
        return;
    }

    try {
        setUpdating(true);
        
        const url = selectedCommand 
            ? `${API_BASE}/commandes/${selectedCommand.id}`
            : `${API_BASE}/commandes`;
            
        const method = selectedCommand ? 'PUT' : 'POST';
        
        const response = await fetch(url, {
            method: method,
            headers: getHeaders(),
            body: JSON.stringify(formData)
        });

        const result = await response.json();
        
        if (result.success) {
            toast.success(selectedCommand ? 'Commande modifiée avec succès' : 'Commande créée avec succès');
            closeFormModal();
            loadCommands();
            loadStats();
        } else {
            toast.error(result.message || 'Erreur lors de l\'opération');
        }
    } catch (error) {
        console.error('Erreur:', error);
        toast.error('Erreur lors de l\'opération');
    } finally {
        setUpdating(false);
    }
};

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

    const updateStatus = async (commandId, newStatus) => {
        try {
            setUpdating(true);
            const response = await fetch(`${API_BASE}/commandes/${commandId}/update-status`, {
                method: 'POST',
                headers: getHeaders(),
                body: JSON.stringify({ statut: newStatus })
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

    const cancelCommand = async (commandId, reason) => {
        try {
            const response = await fetch(`${API_BASE}/commandes/${commandId}/cancel`, {
                method: 'POST',
                headers: getHeaders(),
                body: JSON.stringify({ raison_annulation: reason })
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

    // Après la fonction cancelCommand, ajoutez ces nouvelles fonctions :

const editCommand = (command) => {
    // Charger les données de la commande dans le formulaire
    setFormData({
        client_id: command.client?.id || '',
        nom_destinataire: command.nom_destinataire,
        telephone_livraison: command.telephone_livraison,
        adresse_livraison: command.adresse_livraison,
        instructions_livraison: command.instructions_livraison || '',
        mode_livraison: command.mode_livraison,
        date_livraison_prevue: command.date_livraison_prevue ? command.date_livraison_prevue.split(' ')[0] : '',
        notes_client: command.notes_client || '',
        notes_admin: command.notes_admin || '',
        priorite: command.priorite,
        est_cadeau: command.est_cadeau,
        message_cadeau: command.message_cadeau || '',
        code_promo: command.code_promo || '',
        frais_livraison: command.frais_livraison,
        remise: command.remise,
        articles: command.articles?.map(article => ({
            produit_id: article.produit.id,
            quantite: article.quantite,
            prix_unitaire: article.prix_unitaire,
            taille: article.personnalisations?.taille || '',
            couleur: article.personnalisations?.couleur || '',
            tissu: article.personnalisations?.tissu || '',
            utilise_mesures_client: article.utilise_mesures_client || false,
            mesures_personnalisees: article.mesures && !article.utilise_mesures_client,
            mesures: article.mesures || {},
            instructions: article.personnalisations?.instructions || ''
        })) || []
    });
    
    loadClients();
    loadProduits();
    setSelectedCommand(command);
    setShowFormModal(true);
};

const deleteCommand = async (commandId) => {
    if (!window.confirm('Êtes-vous sûr de vouloir supprimer cette commande ?')) {
        return;
    }

    try {
        const response = await fetch(`${API_BASE}/commandes/${commandId}`, {
            method: 'DELETE',
            headers: getHeaders()
        });

        const result = await response.json();
        
        if (result.success) {
            toast.success('Commande supprimée avec succès');
            loadCommands();
            loadStats();
        } else {
            toast.error(result.message || 'Erreur lors de la suppression');
        }
    } catch (error) {
        console.error('Erreur:', error);
        toast.error('Erreur lors de la suppression de la commande');
    }
};

    const closeModal = () => {
        setShowModal(false);
        setSelectedCommand(null);
    };

    const formatPrice = (price) => {
        return new Intl.NumberFormat('fr-SN', {
            style: 'currency',
            currency: 'XOF',
            minimumFractionDigits: 0
        }).format(price);
    };

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

    const getPriorityColor = (priority) => {
        const colors = {
            'normale': 'bg-gray-100 text-gray-800',
            'urgente': 'bg-orange-100 text-orange-800',
            'tres_urgente': 'bg-red-100 text-red-800'
        };
        return colors[priority] || 'bg-gray-100 text-gray-800';
    };

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
                        onClick={openFormModal}
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
                                onChange={(e) => {
                                    setSearchTerm(e.target.value);
                                    setCurrentPage(1);
                                }}
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
                                                    {command.date_livraison_prevue}
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
        
        {/* Bouton Modifier */}
        {!['livree', 'annulee'].includes(command.statut) && (
            <button
                onClick={() => editCommand(command)}
                className="text-blue-600 hover:text-blue-900 p-1 rounded"
                title="Modifier"
            >
                <Edit className="w-4 h-4" />
            </button>
        )}
        
        {/* Bouton Supprimer */}
        {!['livree'].includes(command.statut) && (
            <button
                onClick={() => deleteCommand(command.id)}
                className="text-red-600 hover:text-red-900 p-1 rounded"
                title="Supprimer"
            >
                <Trash2 className="w-4 h-4" />
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
                <CommandDetailsModal
                    command={selectedCommand}
                    onClose={closeModal}
                    onUpdateStatus={updateStatus}
                    onCancel={cancelCommand}
                    formatPrice={formatPrice}
                    getStatusColor={getStatusColor}
                    getStatusIcon={getStatusIcon}
                    updating={updating}
                />
            )}

            {/* Modal formulaire commande */}
            {showFormModal && (
                <CommandFormModal
                    formData={formData}
                    setFormData={setFormData}
                    clients={clients}
                    produits={produits}
                    selectedClient={selectedClient}
                    onClientChange={handleClientChange}
                    onProduitChange={handleProduitChange}
                    onAddArticle={addArticle}
                    onUpdateArticle={updateArticle}
                    onRemoveArticle={removeArticle}
                    onSubmit={handleSubmit}
                    onClose={closeFormModal}
                    updating={updating}
                    formatPrice={formatPrice}
                />
            )}
        </div>
    );
};

// Composant Modal Détails Commande
const CommandDetailsModal = ({ 
    command, 
    onClose, 
    onUpdateStatus, 
    onCancel, 
    formatPrice, 
    getStatusColor, 
    getStatusIcon,
    updating 
}) => (
    <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
        <div className="relative top-20 mx-auto p-5 border w-11/12 max-w-4xl shadow-lg rounded-md bg-white">
            <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-bold text-gray-900">
                    Détails de la commande {command.numero_commande}
                </h3>
                <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
                    <X className="w-6 h-6" />
                </button>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Colonne principale */}
                <div className="lg:col-span-2 space-y-4">
                    {/* Informations client */}
                    <div className="bg-gray-50 p-4 rounded-lg">
                        <h4 className="font-semibold text-gray-900 mb-3 flex items-center">
                            <User className="w-5 h-5 mr-2" />
                            Informations client
                        </h4>
                        <div className="grid grid-cols-2 gap-3">
                            <div>
                                <label className="text-sm text-gray-600">Destinataire</label>
                                <p className="font-medium">{command.nom_destinataire}</p>
                            </div>
                            <div>
                                <label className="text-sm text-gray-600">Téléphone</label>
                                <p className="font-medium">{command.telephone_livraison}</p>
                            </div>
                        </div>
                    </div>

                    {/* Articles avec mesures */}
                    <div>
                        <h4 className="font-semibold text-gray-900 mb-3 flex items-center">
                            <Package className="w-5 h-5 mr-2" />
                            Articles commandés
                        </h4>
                        <div className="space-y-3">
                            {command.articles?.map((article, index) => (
                                <div key={index} className="border rounded-lg p-3">
                                    <div className="flex justify-between items-start">
                                        <div className="flex-1">
                                            <p className="font-medium">{article.produit.nom}</p>
                                            <p className="text-sm text-gray-600">
                                                Quantité: {article.quantite} × {formatPrice(article.prix_unitaire)}
                                            </p>
                                            
                                            {/* Affichage des mesures si présentes */}
                                            {article.mesures && Object.keys(article.mesures).length > 0 && (
                                                <div className="mt-2 bg-blue-50 p-2 rounded">
                                                    <p className="text-xs font-medium text-blue-900 mb-1 flex items-center">
                                                        <Ruler className="w-3 h-3 mr-1" />
                                                        Mesures {article.utilise_mesures_client ? '(client)' : '(personnalisées)'}
                                                    </p>
                                                    <div className="grid grid-cols-3 gap-1 text-xs">
                                                        {Object.entries(article.mesures).map(([key, value]) => (
                                                            value && (
                                                                <div key={key}>
                                                                    <span className="text-gray-600">{key.replace(/_/g, ' ')}:</span>
                                                                    <span className="font-medium ml-1">{value}cm</span>
                                                                </div>
                                                            )
                                                        ))}
                                                    </div>
                                                </div>
                                            )}
                                        </div>
                                        <p className="font-semibold">{formatPrice(article.prix_total)}</p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>

                {/* Sidebar */}
                <div className="space-y-4">
                    {/* Statut */}
                    <div className="bg-white border rounded-lg p-4">
                        <h4 className="font-semibold text-gray-900 mb-3">Statut</h4>
                        <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(command.statut)}`}>
                            {getStatusIcon(command.statut)}
                            <span className="ml-1">{command.statut_label}</span>
                        </span>

                        {/* Actions */}
                        {command.statut !== 'livree' && command.statut !== 'annulee' && (
                            <div className="mt-4 space-y-2">
                                {command.statut === 'en_attente' && (
                                    <button
                                        onClick={() => onUpdateStatus(command.id, 'confirmee')}
                                        disabled={updating}
                                        className="w-full bg-blue-600 text-white px-3 py-2 rounded text-sm hover:bg-blue-700"
                                    >
                                        Confirmer
                                    </button>
                                )}
                                <button
                                    onClick={() => {
                                        const reason = prompt('Raison de l\'annulation:');
                                        if (reason) onCancel(command.id, reason);
                                    }}
                                    className="w-full bg-red-600 text-white px-3 py-2 rounded text-sm hover:bg-red-700"
                                >
                                    Annuler
                                </button>
                            </div>
                        )}
                    </div>

                    {/* Résumé financier */}
                    <div className="bg-white border rounded-lg p-4">
                        <h4 className="font-semibold text-gray-900 mb-3">Total</h4>
                        <div className="space-y-2 text-sm">
                            <div className="flex justify-between">
                                <span>Sous-total</span>
                                <span>{formatPrice(command.sous_total)}</span>
                            </div>
                            {command.frais_livraison > 0 && (
                                <div className="flex justify-between">
                                    <span>Livraison</span>
                                    <span>{formatPrice(command.frais_livraison)}</span>
                                </div>
                            )}
                            <div className="border-t pt-2">
                                <div className="flex justify-between font-bold text-lg">
                                    <span>Total</span>
                                    <span>{formatPrice(command.montant_total)}</span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <div className="flex justify-end mt-6 pt-4 border-t">
                <button
                    onClick={onClose}
                    className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50"
                >
                    Fermer
                </button>
            </div>
        </div>
    </div>
);

// Composant Modal Formulaire Commande
const CommandFormModal = ({ 
    formData, 
    setFormData, 
    clients, 
    produits, 
    selectedClient, 
    onClientChange, 
    onProduitChange, 
    onAddArticle, 
    onUpdateArticle, 
    onRemoveArticle, 
    onSubmit, 
    onClose, 
    updating,
    formatPrice 
}) => (
    <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
        <div className="relative top-10 mx-auto p-5 border w-11/12 max-w-4xl shadow-lg rounded-md bg-white mb-10">
            <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-bold text-gray-900">Nouvelle commande</h3>
                <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
                    <X className="w-6 h-6" />
                </button>
            </div>

            <form onSubmit={onSubmit} className="space-y-6">
                {/* Sélection client */}
                <div className="bg-gray-50 p-4 rounded-lg">
                    <h4 className="font-semibold mb-3">Client</h4>
                    <select
                        value={formData.client_id}
                        onChange={(e) => onClientChange(e.target.value)}
                        className="w-full px-3 py-2 border rounded-lg"
                        required
                    >
                        <option value="">-- Sélectionner un client --</option>
                        {clients.map(client => (
                            <option key={client.id} value={client.id}>
                                {client.nom_complet} - {client.telephone}
                                {client.a_mesures && ' ✓ (mesures)'}
                            </option>
                        ))}
                    </select>

                    {selectedClient?.mesures && (
                        <div className="mt-3 bg-blue-50 p-3 rounded">
                            <p className="text-sm font-medium text-blue-900 mb-2">
                                Mesures disponibles
                            </p>
                            <div className="grid grid-cols-3 gap-2 text-xs">
                                {Object.entries(selectedClient.mesures).map(([key, value]) => {
                                    if (value && !['id', 'client_id', 'created_at', 'updated_at'].includes(key)) {
                                        return (
                                            <div key={key}>
                                                <span className="text-gray-600">{key.replace(/_/g, ' ')}:</span>
                                                <span className="font-medium ml-1">{value}cm</span>
                                            </div>
                                        );
                                    }
                                    return null;
                                })}
                            </div>
                        </div>
                    )}
                </div>

                {/* Informations livraison */}
                <div className="bg-gray-50 p-4 rounded-lg">
                    <h4 className="font-semibold mb-3">Livraison</h4>
                    <div className="grid grid-cols-2 gap-3">
                        <input
                            type="text"
                            placeholder="Nom destinataire *"
                            value={formData.nom_destinataire}
                            onChange={(e) => setFormData({...formData, nom_destinataire: e.target.value})}
                            className="px-3 py-2 border rounded-lg"
                            required
                        />
                        <input
                            type="tel"
                            placeholder="Téléphone *"
                            value={formData.telephone_livraison}
                            onChange={(e) => setFormData({...formData, telephone_livraison: e.target.value})}
                            className="px-3 py-2 border rounded-lg"
                            required
                        />
                        <input
                            type="text"
                            placeholder="Adresse *"
                            value={formData.adresse_livraison}
                            onChange={(e) => setFormData({...formData, adresse_livraison: e.target.value})}
                            className="col-span-2 px-3 py-2 border rounded-lg"
                            required
                        />
                    </div>
                </div>

                {/* Articles */}
               

{/* Articles */}
<div>
    <div className="flex justify-between items-center mb-3">
        <h4 className="font-semibold">Articles</h4>
        <button
            type="button"
            onClick={onAddArticle}
            className="text-purple-600 hover:text-purple-700 flex items-center text-sm"
        >
            <Plus className="w-4 h-4 mr-1" />
            Ajouter un article
        </button>
    </div>

    {formData.articles.map((article, index) => (
        <div key={index} className="border rounded-lg p-4 mb-3 bg-white">
            <div className="flex justify-between items-start mb-3">
                <h5 className="font-medium text-lg">Article {index + 1}</h5>
                <button
                    type="button"
                    onClick={() => onRemoveArticle(index)}
                    className="text-red-500 hover:text-red-700"
                >
                    <Trash2 className="w-4 h-4" />
                </button>
            </div>

            {/* Sélection produit et détails de base */}
            <div className="grid grid-cols-3 gap-3 mb-3">
                <div className="col-span-3">
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                        Produit *
                    </label>
                    <select
                        value={article.produit_id}
                        onChange={(e) => onProduitChange(index, e.target.value)}
                        className="w-full px-3 py-2 border rounded-lg"
                        required
                    >
                        <option value="">-- Sélectionner un produit --</option>
                        {produits.map(p => (
                            <option key={p.id} value={p.id}>
                                {p.nom} - {formatPrice(p.prix)}
                            </option>
                        ))}
                    </select>
                </div>
                
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                        Quantité *
                    </label>
                    <input
                        type="number"
                        min="1"
                        value={article.quantite}
                        onChange={(e) => onUpdateArticle(index, 'quantite', parseInt(e.target.value))}
                        className="w-full px-3 py-2 border rounded-lg"
                        required
                    />
                </div>
                
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                        Prix unitaire *
                    </label>
                    <input
                        type="number"
                        min="0"
                        step="100"
                        value={article.prix_unitaire}
                        onChange={(e) => onUpdateArticle(index, 'prix_unitaire', parseFloat(e.target.value))}
                        className="w-full px-3 py-2 border rounded-lg"
                        required
                    />
                </div>
                
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                        Taille
                    </label>
                    <select
                        value={article.taille || ''}
                        onChange={(e) => onUpdateArticle(index, 'taille', e.target.value)}
                        className="w-full px-3 py-2 border rounded-lg"
                    >
                        <option value="">Sur mesure</option>
                        <option value="XS">XS</option>
                        <option value="S">S</option>
                        <option value="M">M</option>
                        <option value="L">L</option>
                        <option value="XL">XL</option>
                        <option value="XXL">XXL</option>
                        <option value="XXXL">XXXL</option>
                    </select>
                </div>
            </div>

            {/* Couleur et options */}
            <div className="grid grid-cols-2 gap-3 mb-3">
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                        Couleur
                    </label>
                    <input
                        type="text"
                        placeholder="Ex: Rouge, Bleu..."
                        value={article.couleur || ''}
                        onChange={(e) => onUpdateArticle(index, 'couleur', e.target.value)}
                        className="w-full px-3 py-2 border rounded-lg"
                    />
                </div>
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                        Tissu/Matériau
                    </label>
                    <input
                        type="text"
                        placeholder="Ex: Coton, Soie..."
                        value={article.tissu || ''}
                        onChange={(e) => onUpdateArticle(index, 'tissu', e.target.value)}
                        className="w-full px-3 py-2 border rounded-lg"
                    />
                </div>
            </div>

            {/* Options de mesures */}
            <div className="bg-gray-50 rounded-lg p-3 mb-3">
                <div className="flex items-center justify-between mb-2">
                    <label className="text-sm font-medium text-gray-700">
                        Type de confection
                    </label>
                </div>
                
                <div className="space-y-2">
                    <label className="flex items-center">
                        <input
                            type="radio"
                            name={`mesure_type_${index}`}
                            checked={!article.utilise_mesures_client && !article.mesures_personnalisees}
                            onChange={() => {
                                onUpdateArticle(index, 'utilise_mesures_client', false);
                                onUpdateArticle(index, 'mesures_personnalisees', false);
                            }}
                            className="mr-2"
                        />
                        <span className="text-sm">Taille standard uniquement</span>
                    </label>
                    
                    {selectedClient?.mesures && (
                        <label className="flex items-center">
                            <input
                                type="radio"
                                name={`mesure_type_${index}`}
                                checked={article.utilise_mesures_client}
                                onChange={(e) => {
                                    onUpdateArticle(index, 'utilise_mesures_client', true);
                                    onUpdateArticle(index, 'mesures_personnalisees', false);
                                }}
                                className="mr-2"
                            />
                            <span className="text-sm">Utiliser les mesures du client</span>
                        </label>
                    )}
                    
                    <label className="flex items-center">
                        <input
                            type="radio"
                            name={`mesure_type_${index}`}
                            checked={article.mesures_personnalisees}
                            onChange={() => {
                                onUpdateArticle(index, 'utilise_mesures_client', false);
                                onUpdateArticle(index, 'mesures_personnalisees', true);
                            }}
                            className="mr-2"
                        />
                        <span className="text-sm">Ajouter des mesures spécifiques</span>
                    </label>
                </div>

                {/* Affichage des mesures du client */}
                {article.utilise_mesures_client && selectedClient?.mesures && (
                    <div className="mt-3 bg-blue-50 p-3 rounded border border-blue-200">
                        <p className="text-xs font-medium text-blue-900 mb-2">
                            Mesures du client qui seront utilisées :
                        </p>
                        <div className="grid grid-cols-3 gap-1 text-xs">
                            {Object.entries(selectedClient.mesures).map(([key, value]) => {
                                if (value && !['id', 'client_id', 'created_at', 'updated_at', 'deleted_at'].includes(key)) {
                                    return (
                                        <div key={key} className="text-blue-800">
                                            <span className="font-medium">{key.replace(/_/g, ' ')}:</span> {value}cm
                                        </div>
                                    );
                                }
                                return null;
                            })}
                        </div>
                    </div>
                )}

                {/* Formulaire de mesures personnalisées */}
                {article.mesures_personnalisees && (
                    <div className="mt-3 space-y-2">
                        <p className="text-sm font-medium text-gray-700 mb-2">Mesures en centimètres :</p>
                        <div className="grid grid-cols-3 gap-2">
                            {[
                                { key: 'epaule', label: 'Épaule' },
                                { key: 'poitrine', label: 'Poitrine' },
                                { key: 'taille', label: 'Taille' },
                                { key: 'longueur_robe', label: 'Long. robe' },
                                { key: 'tour_bras', label: 'Tour bras' },
                                { key: 'tour_cuisses', label: 'Tour cuisses' },
                                { key: 'longueur_jupe', label: 'Long. jupe' },
                                { key: 'ceinture', label: 'Ceinture' },
                                { key: 'tour_fesses', label: 'Tour fesses' },
                                { key: 'buste', label: 'Buste' },
                                { key: 'longueur_manches_longues', label: 'Manches L' },
                                { key: 'longueur_manches_courtes', label: 'Manches C' }
                            ].map(({ key, label }) => (
                                <div key={key}>
                                    <label className="block text-xs text-gray-600">{label}</label>
                                    <input
                                        type="number"
                                        step="0.1"
                                        min="0"
                                        placeholder="cm"
                                        value={article.mesures?.[key] || ''}
                                        onChange={(e) => {
                                            const mesures = { ...article.mesures };
                                            mesures[key] = parseFloat(e.target.value) || 0;
                                            onUpdateArticle(index, 'mesures', mesures);
                                        }}
                                        className="w-full px-2 py-1 border rounded text-sm"
                                    />
                                </div>
                            ))}
                        </div>
                    </div>
                )}
            </div>

            {/* Notes spéciales pour cet article */}
            <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                    Instructions spéciales / Personnalisations
                </label>
                <textarea
                    value={article.instructions || ''}
                    onChange={(e) => onUpdateArticle(index, 'instructions', e.target.value)}
                    placeholder="Ex: Ajouter des perles, broderie spéciale, modification du col..."
                    className="w-full px-3 py-2 border rounded-lg text-sm"
                    rows="2"
                />
            </div>
        </div>
    ))}
</div>

{/* Options supplémentaires de la commande */}
<div className="bg-gray-50 p-4 rounded-lg">
    <h4 className="font-semibold mb-3">Options de la commande</h4>
    
    <div className="grid grid-cols-2 gap-3">
        <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
                Frais de livraison
            </label>
            <input
                type="number"
                min="0"
                step="100"
                value={formData.frais_livraison}
                onChange={(e) => setFormData({...formData, frais_livraison: parseFloat(e.target.value) || 0})}
                className="w-full px-3 py-2 border rounded-lg"
            />
        </div>
        
        <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
                Priorité
            </label>
            <select
                value={formData.priorite}
                onChange={(e) => setFormData({...formData, priorite: e.target.value})}
                className="w-full px-3 py-2 border rounded-lg"
            >
                <option value="normale">Normale</option>
                <option value="urgente">Urgente</option>
                <option value="tres_urgente">Très urgente</option>
            </select>
        </div>
        
        <div className="col-span-2">
            <label className="block text-sm font-medium text-gray-700 mb-1">
                Date de livraison prévue
            </label>
            <input
                type="date"
                value={formData.date_livraison_prevue}
                onChange={(e) => setFormData({...formData, date_livraison_prevue: e.target.value})}
                min={new Date().toISOString().split('T')[0]}
                className="w-full px-3 py-2 border rounded-lg"
            />
        </div>
        
        <div className="col-span-2">
            <label className="flex items-center">
                <input
                    type="checkbox"
                    checked={formData.est_cadeau}
                    onChange={(e) => setFormData({...formData, est_cadeau: e.target.checked})}
                    className="mr-2"
                />
                <span className="text-sm font-medium text-gray-700">
                    C'est un cadeau
                </span>
            </label>
        </div>
        
        {formData.est_cadeau && (
            <div className="col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                    Message cadeau
                </label>
                <textarea
                    value={formData.message_cadeau}
                    onChange={(e) => setFormData({...formData, message_cadeau: e.target.value})}
                    className="w-full px-3 py-2 border rounded-lg"
                    rows="2"
                    placeholder="Message à joindre au cadeau..."
                />
            </div>
        )}
    </div>
</div>
{/* AJOUTEZ CETTE SECTION DES BOUTONS */}
<div className="flex justify-end space-x-3 pt-4 border-t">
    <button
        type="button"
        onClick={onClose}
        disabled={updating}
        className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 disabled:opacity-50"
    >
        Annuler
    </button>
    <button
        type="submit"
        disabled={updating || formData.articles.length === 0}
        className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 disabled:opacity-50 flex items-center space-x-2"
    >
        {updating ? (
            <>
                <RefreshCw className="w-4 h-4 animate-spin" />
                <span>Création...</span>
            </>
        ) : (
            <>
                <Save className="w-4 h-4" />
                <span>Créer la commande</span>
            </>
        )}
    </button>
</div>

            </form>  {/* FIN DU FORMULAIRE */}
        </div>
    </div>
);

export default Commands;