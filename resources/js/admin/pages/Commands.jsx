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
    ChevronLeft,
    ChevronRight,
    User,
    Mail,
    CreditCard,
    FileText,
    Ruler,
    Save,
    Trash2,
    DollarSign,
    TrendingUp,
    ShoppingCart,
    Users
} from 'lucide-react';
import { toast } from 'react-hot-toast';
import CommandDetailsModal from './CommandDetailsModal';
import CommandFormModal from './CommandFormModal';

const Commands = () => {
    const { token } = useAuth();
    
    // États principaux
    const [commands, setCommands] = useState([]);
    const [clients, setClients] = useState([]);
    const [produits, setProduits] = useState([]);
    const [loading, setLoading] = useState(true);
    const [updating, setUpdating] = useState(false);
    
    // États de recherche et filtres
    const [filters, setFilters] = useState({
        numero_commande: '',
        client_search: '',
        produit_search: '',
        statut: '',
        date_debut: '',
        date_fin: '',
        priorite: ''
    });
    
    // États de pagination
    const [currentPage, setCurrentPage] = useState(1);
    const [pagination, setPagination] = useState({});
    
    // États des modaux
    const [showDetailModal, setShowDetailModal] = useState(false);
    const [showFormModal, setShowFormModal] = useState(false);
    const [selectedCommand, setSelectedCommand] = useState(null);
    const [isEditing, setIsEditing] = useState(false);
    
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
    }, [currentPage, filters]);

  // Dans Commands.jsx, corrigez la méthode loadCommands :

const loadCommands = async () => {
    try {
        setLoading(true);
        
        // Construire les paramètres de requête
        const params = new URLSearchParams({
            page: currentPage,
            per_page: 15,
            ...Object.fromEntries(
                Object.entries(filters).filter(([_, value]) => value !== '')
            )
        });

        // CORRECTION : Utiliser l'URL correcte sans 's' à la fin
        const response = await fetch(`${API_BASE}/commandes?${params}`, {
            headers: getHeaders()
        });

        console.log('Response status:', response.status);
        console.log('Request URL:', response.url);

        if (!response.ok) {
            const errorText = await response.text();
            console.error('Error response:', errorText);
            throw new Error(`HTTP ${response.status}: ${errorText}`);
        }

        const result = await response.json();
        console.log('API Result:', result);
        
        if (result.success) {
            setCommands(result.data.commandes);
            setPagination(result.data.pagination);
        } else {
            console.error('API Error:', result.message);
            toast.error(result.message || 'Erreur lors du chargement');
        }
    } catch (error) {
        console.error('Erreur complète:', error);
        toast.error('Erreur lors du chargement des commandes');
    } finally {
        setLoading(false);
    }
};

    const loadStats = async () => {
        try {
            const response = await fetch(`${API_BASE}/commandes/statistics`, {
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
            const response = await fetch(`${API_BASE}/commandes/clients-with-mesures`, {
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
            const response = await fetch(`${API_BASE}/commandes/produits`, {
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
    const openFormModal = (command = null) => {
        if (command) {
            setIsEditing(true);
            setSelectedCommand(command);
            loadCommandDetails(command.id);
        } else {
            setIsEditing(false);
            setSelectedCommand(null);
            resetForm();
        }
        
        loadClients();
        loadProduits();
        setShowFormModal(true);
    };

    const loadCommandDetails = async (commandId) => {
        try {
            const response = await fetch(`${API_BASE}/commandes/${commandId}`, {
                headers: getHeaders()
            });

            if (!response.ok) throw new Error('Erreur lors du chargement');

            const result = await response.json();
            if (result.success) {
                const command = result.data.commande;
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
                        taille: article.taille_choisie || '',
                        couleur: article.couleur_choisie || '',
                        utilise_mesures_client: false,
                        mesures: article.mesures || {},
                        instructions: article.demandes_personnalisation || ''
                    })) || []
                });

                if (command.client) {
                    const client = clients.find(c => c.id === command.client.id);
                    setSelectedClient(client);
                }
            }
        } catch (error) {
            console.error('Erreur:', error);
            toast.error('Erreur lors du chargement des détails');
        }
    };

    const resetForm = () => {
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

    const closeFormModal = () => {
        setShowFormModal(false);
        resetForm();
        setIsEditing(false);
        setSelectedCommand(null);
    };

    const handleClientChange = (clientId) => {
        const client = clients.find(c => c.id === parseInt(clientId));
        
        if (client) {
            setSelectedClient(client);
            setFormData({
                ...formData,
                client_id: client.id,
                nom_destinataire: client.nom_complet,
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
                    utilise_mesures_client: false,
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
            updateArticle(index, 'prix_unitaire', produit.prix_promo || produit.prix);
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
            
            const url = isEditing 
                ? `${API_BASE}/commandes/${selectedCommand.id}`
                : `${API_BASE}/commandes`;
                
            const method = isEditing ? 'PUT' : 'POST';
            
            const response = await fetch(url, {
                method: method,
                headers: getHeaders(),
                body: JSON.stringify(formData)
            });

            const result = await response.json();
            
            if (result.success) {
                toast.success(isEditing ? 'Commande modifiée avec succès' : 'Commande créée avec succès');
                closeFormModal();
                loadCommands();
                loadStats();
            } else {
                toast.error(result.message || 'Erreur lors de l\'opération');
                if (result.errors) {
                    Object.values(result.errors).flat().forEach(error => {
                        toast.error(error);
                    });
                }
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
                setShowDetailModal(true);
            }
        } catch (error) {
            console.error('Erreur:', error);
            toast.error('Erreur lors du chargement des détails');
        }
    };

    const editCommand = (command) => {
        if (!command.peut_modifier) {
            toast.error('Cette commande ne peut pas être modifiée car elle est déjà payée');
            return;
        }
        openFormModal(command);
    };

    const deleteCommand = async (commandId) => {
        const command = commands.find(c => c.id === commandId);
        if (!command.peut_supprimer) {
            toast.error('Cette commande ne peut pas être supprimée car elle est déjà payée');
            return;
        }

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
                toast.success('Statut mis à jour avec succès');
                loadCommands();
                loadStats();
                if (selectedCommand && selectedCommand.id === commandId) {
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

    const handleFilterChange = (field, value) => {
        setFilters({ ...filters, [field]: value });
        setCurrentPage(1);
    };

    const clearFilters = () => {
        setFilters({
            numero_commande: '',
            client_search: '',
            produit_search: '',
            statut: '',
            date_debut: '',
            date_fin: '',
            priorite: ''
        });
        setCurrentPage(1);
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

    const markAsPaid = async (commandId, montantTotal) => {
    const methodePaiement = window.prompt('Méthode de paiement (wave/orange_money/especes/virement):', 'especes');
    if (!methodePaiement) return;

    const reference = window.prompt('Référence du paiement (optionnel):', `PAY-${new Date().getFullYear()}${String(new Date().getMonth() + 1).padStart(2, '0')}${String(new Date().getDate()).padStart(2, '0')}-${Math.random().toString(36).substr(2, 6).toUpperCase()}`);

    try {
        setUpdating(true);
        const response = await fetch(`${API_BASE}/commandes/${commandId}/mark-paid`, {
            method: 'POST',
            headers: getHeaders(),
            body: JSON.stringify({
                montant: montantTotal,
                methode_paiement: methodePaiement,
                reference_paiement: reference || null
            })
        });

        const result = await response.json();
        
        if (result.success) {
            toast.success('Paiement enregistré avec succès');
            loadCommands();
            loadStats();
        } else {
            toast.error(result.message || 'Erreur lors de l\'enregistrement du paiement');
        }
    } catch (error) {
        console.error('Erreur:', error);
        toast.error('Erreur lors de l\'enregistrement du paiement');
    } finally {
        setUpdating(false);
    }
};

    return (
        <div className="p-6">
            {/* Header avec statistiques */}
            <div className="mb-6">
                <div className="flex items-center justify-between mb-6">
                    <div>
                        <h1 className="text-2xl font-bold text-gray-900">Gestion des Commandes</h1>
                        <p className="text-gray-600">Gérez les commandes de votre boutique VIVIAS</p>
                    </div>
                    <button
                        onClick={() => openFormModal()}
                        className="bg-purple-600 text-white px-4 py-2 rounded-lg hover:bg-purple-700 flex items-center space-x-2"
                    >
                        <Plus className="w-4 h-4" />
                        <span>Nouvelle commande</span>
                    </button>
                </div>

                {/* Statistiques détaillées */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
                    <div className="bg-white p-4 rounded-lg shadow-sm border">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm text-gray-600">Total commandes</p>
                                <p className="text-2xl font-bold text-gray-900">{stats.total_commandes || 0}</p>
                                <p className="text-xs text-gray-500">Ce mois: {stats.commandes_ce_mois || 0}</p>
                            </div>
                            <ShoppingCart className="w-8 h-8 text-purple-500" />
                        </div>
                    </div>
                    
                    <div className="bg-white p-4 rounded-lg shadow-sm border">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm text-gray-600">CA ce mois</p>
                                <p className="text-xl font-bold text-green-600">{formatPrice(stats.ca_ce_mois || 0)}</p>
                                <p className="text-xs text-gray-500">Panier moyen: {formatPrice(stats.panier_moyen || 0)}</p>
                            </div>
                            <DollarSign className="w-8 h-8 text-green-500" />
                        </div>
                    </div>
                    
                    <div className="bg-white p-4 rounded-lg shadow-sm border">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm text-gray-600">En attente</p>
                                <p className="text-2xl font-bold text-yellow-600">{stats.commandes_en_attente || 0}</p>
                                <p className="text-xs text-gray-500">Urgentes: {stats.commandes_urgentes || 0}</p>
                            </div>
                            <Clock className="w-8 h-8 text-yellow-500" />
                        </div>
                    </div>
                    
                    <div className="bg-white p-4 rounded-lg shadow-sm border">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm text-gray-600">En retard</p>
                                <p className="text-2xl font-bold text-red-600">{stats.commandes_en_retard || 0}</p>
                                <p className="text-xs text-gray-500">Prêtes: {stats.commandes_pretes || 0}</p>
                            </div>
                            <AlertTriangle className="w-8 h-8 text-red-500" />
                        </div>
                    </div>
                </div>
            </div>

            {/* Filtres de recherche avancée */}
            <div className="bg-white rounded-lg shadow-sm border mb-6 p-4">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">N° Commande</label>
                        <input
                            type="text"
                            placeholder="CMD-202501-..."
                            value={filters.numero_commande}
                            onChange={(e) => handleFilterChange('numero_commande', e.target.value)}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                        />
                    </div>
                    
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Client</label>
                        <input
                            type="text"
                            placeholder="Nom, téléphone..."
                            value={filters.client_search}
                            onChange={(e) => handleFilterChange('client_search', e.target.value)}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                        />
                    </div>
                    
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Produit</label>
                        <input
                            type="text"
                            placeholder="Nom du produit..."
                            value={filters.produit_search}
                            onChange={(e) => handleFilterChange('produit_search', e.target.value)}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                        />
                    </div>
                    
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Statut</label>
                        <select
                            value={filters.statut}
                            onChange={(e) => handleFilterChange('statut', e.target.value)}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
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
                    </div>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
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
                    
                    <div className="flex items-end space-x-2">
                        <button
                            onClick={clearFilters}
                            className="px-4 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600"
                        >
                            Effacer
                        </button>
                        <button
                            onClick={loadCommands}
                            className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 flex items-center space-x-2"
                        >
                            <Search className="w-4 h-4" />
                            <span>Rechercher</span>
                        </button>
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
                            {Object.values(filters).some(f => f !== '')
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
                                                {command.est_payee && (
                                                    <span className="inline-flex items-center px-2 py-1 rounded-full text-xs bg-green-100 text-green-800 mt-1">
                                                        <CreditCard className="w-3 h-3 mr-1" />
                                                        Payée
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
                                                        {command.client.nom_complet}
                                                    </div>
                                                )}
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <div className="text-sm font-medium text-gray-900">
                                                {formatPrice(command.montant_total)}
                                            </div>
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

                                                {!command.est_payee && command.statut !== 'annulee' && (
    <button
        onClick={() => markAsPaid(command.id, command.montant_total)}
        className="text-green-600 hover:text-green-900 p-1 rounded"
        title="Marquer comme payé"
        disabled={updating}
    >
        <CreditCard className="w-4 h-4" />
    </button>
)}
                                                
                                                {command.peut_modifier && (
                                                    <button
                                                        onClick={() => editCommand(command)}
                                                        className="text-blue-600 hover:text-blue-900 p-1 rounded"
                                                        title="Modifier"
                                                    >
                                                        <Edit className="w-4 h-4" />
                                                    </button>
                                                )}
                                                
                                                {command.peut_supprimer && (
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

            {/* Modaux */}
            {showDetailModal && selectedCommand && (
                <CommandDetailsModal
                    command={selectedCommand}
                    onClose={() => setShowDetailModal(false)}
                    onUpdateStatus={updateStatus}
                    formatPrice={formatPrice}
                    getStatusColor={getStatusColor}
                    getStatusIcon={getStatusIcon}
                    updating={updating}
                />
            )}

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
                    isEditing={isEditing}
                />
            )}
        </div>
    );
};

export default Commands;