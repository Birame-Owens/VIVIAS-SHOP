import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { 
    Plus, 
    Search, 
    Eye,
    RefreshCw,
    X,
    Edit,
    Trash2,
    Copy,
    ToggleLeft,
    ToggleRight,
    ChevronLeft,
    ChevronRight,
    Tag,
    Users,
    TrendingUp,
    Percent,
    DollarSign,
    Gift,
    CheckCircle,
    XCircle,
    Clock,
    AlertTriangle,
    Zap,
    Calendar
} from 'lucide-react';
import { toast } from 'react-hot-toast';

const Promotions = () => {
    const { token } = useAuth();
    
    // États principaux
    const [promotions, setPromotions] = useState([]);
    const [stats, setStats] = useState({});
    const [options, setOptions] = useState({});
    
    // États de l'interface
    const [loading, setLoading] = useState(true);
    const [updating, setUpdating] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');
    const [statutFilter, setStatutFilter] = useState('');
    const [typeFilter, setTypeFilter] = useState('');
    
    // États de pagination
    const [currentPage, setCurrentPage] = useState(1);
    const [pagination, setPagination] = useState({});
    
    // États des modaux
    const [showDetailsModal, setShowDetailsModal] = useState(false);
    const [showFormModal, setShowFormModal] = useState(false);
    const [selectedPromotion, setSelectedPromotion] = useState(null);
    const [editingPromotion, setEditingPromotion] = useState(null);

    const API_BASE = '/api/admin';

    // Configuration des headers
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

    // ===== CHARGEMENT DES DONNÉES =====
    
    const loadPromotions = async () => {
        try {
            setLoading(true);
            const params = new URLSearchParams({
                page: currentPage,
                per_page: 15,
                search: searchTerm
            });

            if (statutFilter) params.append('statut', statutFilter);
            if (typeFilter) params.append('type', typeFilter);

            const response = await fetch(`${API_BASE}/promotions?${params}`, {
                headers: getHeaders()
            });

            if (!response.ok) throw new Error('Erreur lors du chargement');

            const result = await response.json();
            if (result.success) {
                setPromotions(result.data.promotions);
                setPagination(result.data.pagination);
            }
        } catch (error) {
            console.error('Erreur:', error);
            toast.error('Erreur lors du chargement des promotions');
        } finally {
            setLoading(false);
        }
    };

    const loadStats = async () => {
        try {
            const response = await fetch(`${API_BASE}/promotions/stats`, {
                headers: getHeaders()
            });

            if (response.ok) {
                const result = await response.json();
                if (result.success) {
                    setStats(result.data);
                }
            }
        } catch (error) {
            console.error('Erreur stats:', error);
        }
    };

    const loadOptions = async () => {
        try {
            const response = await fetch(`${API_BASE}/promotions/options`, {
                headers: getHeaders()
            });

            if (response.ok) {
                const result = await response.json();
                console.log('Options reçues:', result); // Debug
                if (result.success) {
                    setOptions(result.data);
                } else {
                    console.error('Erreur options:', result.message);
                    // Fallback avec options par défaut
                    setOptions({
                        types_promotion: [
                            { value: 'pourcentage', label: 'Pourcentage (%)' },
                            { value: 'montant_fixe', label: 'Montant fixe (FCFA)' },
                            { value: 'livraison_gratuite', label: 'Livraison gratuite' }
                        ],
                        cibles_client: [
                            { value: 'tous', label: 'Tous les clients' },
                            { value: 'nouveaux', label: 'Nouveaux clients' },
                            { value: 'vip', label: 'Clients VIP' },
                            { value: 'reguliers', label: 'Clients réguliers' }
                        ]
                    });
                }
            } else {
                console.error('Erreur HTTP:', response.status);
                // Fallback avec options par défaut
                setOptions({
                    types_promotion: [
                        { value: 'pourcentage', label: 'Pourcentage (%)' },
                        { value: 'montant_fixe', label: 'Montant fixe (FCFA)' },
                        { value: 'livraison_gratuite', label: 'Livraison gratuite' }
                    ],
                    cibles_client: [
                        { value: 'tous', label: 'Tous les clients' },
                        { value: 'nouveaux', label: 'Nouveaux clients' },
                        { value: 'vip', label: 'Clients VIP' },
                        { value: 'reguliers', label: 'Clients réguliers' }
                    ]
                });
            }
        } catch (error) {
            console.error('Erreur options:', error);
            // Fallback avec options par défaut
            setOptions({
                types_promotion: [
                    { value: 'pourcentage', label: 'Pourcentage (%)' },
                    { value: 'montant_fixe', label: 'Montant fixe (FCFA)' },
                    { value: 'livraison_gratuite', label: 'Livraison gratuite' }
                ],
                cibles_client: [
                    { value: 'tous', label: 'Tous les clients' },
                    { value: 'nouveaux', label: 'Nouveaux clients' },
                    { value: 'vip', label: 'Clients VIP' },
                    { value: 'reguliers', label: 'Clients réguliers' }
                ]
            });
        }
    };

    // ===== ACTIONS =====

    const handleSearch = (e) => {
        setSearchTerm(e.target.value);
        setCurrentPage(1);
    };

    const handleViewPromotion = async (promotion) => {
        try {
            const response = await fetch(`${API_BASE}/promotions/${promotion.id}`, {
                headers: getHeaders()
            });

            if (response.ok) {
                const result = await response.json();
                if (result.success) {
                    setSelectedPromotion(result.data.promotion);
                    setShowDetailsModal(true);
                }
            }
        } catch (error) {
            toast.error('Erreur lors du chargement des détails');
        }
    };

    const handleToggleStatus = async (promotion) => {
        try {
            setUpdating(true);
            const response = await fetch(`${API_BASE}/promotions/${promotion.id}/toggle-status`, {
                method: 'POST',
                headers: getHeaders()
            });

            const result = await response.json();
            if (result.success) {
                toast.success(result.message);
                loadPromotions();
                loadStats();
            } else {
                toast.error(result.message);
            }
        } catch (error) {
            toast.error('Erreur lors du changement de statut');
        } finally {
            setUpdating(false);
        }
    };

    const handleDuplicate = async (promotion) => {
        try {
            const response = await fetch(`${API_BASE}/promotions/${promotion.id}/duplicate`, {
                method: 'POST',
                headers: getHeaders()
            });

            const result = await response.json();
            if (result.success) {
                toast.success('Promotion dupliquée avec succès');
                loadPromotions();
                loadStats();
            } else {
                toast.error(result.message);
            }
        } catch (error) {
            toast.error('Erreur lors de la duplication');
        }
    };

    const handleDelete = async (promotion) => {
        if (!window.confirm('Êtes-vous sûr de vouloir supprimer cette promotion ?')) {
            return;
        }

        try {
            const response = await fetch(`${API_BASE}/promotions/${promotion.id}`, {
                method: 'DELETE',
                headers: getHeaders()
            });

            const result = await response.json();
            if (result.success) {
                toast.success('Promotion supprimée avec succès');
                loadPromotions();
                loadStats();
            } else {
                toast.error(result.message);
            }
        } catch (error) {
            toast.error('Erreur lors de la suppression');
        }
    };

    const handleEdit = (promotion) => {
        setEditingPromotion(promotion);
        setShowFormModal(true);
    };

    const handleCreate = () => {
        setEditingPromotion(null);
        setShowFormModal(true);
    };

    const handleCloseModals = () => {
        setShowDetailsModal(false);
        setShowFormModal(false);
        setSelectedPromotion(null);
        setEditingPromotion(null);
    };

    const handleFormSuccess = () => {
        loadPromotions();
        loadStats();
        handleCloseModals();
    };

    // ===== UTILITAIRES =====

    const formatPrice = (price) => {
        return new Intl.NumberFormat('fr-SN', {
            style: 'currency',
            currency: 'XOF',
            minimumFractionDigits: 0
        }).format(price);
    };

    const getStatutColor = (statut) => {
        const colors = {
            'active': 'bg-green-100 text-green-800',
            'inactive': 'bg-gray-100 text-gray-800',
            'future': 'bg-blue-100 text-blue-800',
            'expiree': 'bg-red-100 text-red-800',
            'epuisee': 'bg-orange-100 text-orange-800'
        };
        return colors[statut] || 'bg-gray-100 text-gray-800';
    };

    const getStatutIcon = (statut) => {
        const icons = {
            'active': CheckCircle,
            'inactive': XCircle,
            'future': Clock,
            'expiree': AlertTriangle,
            'epuisee': Zap
        };
        const Icon = icons[statut] || Clock;
        return <Icon className="w-4 h-4" />;
    };

    const getTypeIcon = (type) => {
        const icons = {
            'pourcentage': Percent,
            'montant_fixe': DollarSign,
            'livraison_gratuite': Gift
        };
        const Icon = icons[type] || Tag;
        return <Icon className="w-4 h-4" />;
    };

    const handlePageChange = (page) => {
        if (page >= 1 && page <= pagination.last_page) {
            setCurrentPage(page);
        }
    };

    // ===== EFFETS =====
    
    useEffect(() => {
        loadPromotions();
    }, [currentPage, searchTerm, statutFilter, typeFilter]);

    useEffect(() => {
        loadStats();
        loadOptions();
    }, []);

    // ===== RENDU =====

    return (
        <div className="p-6">
            {/* En-tête et statistiques */}
            <Header 
                stats={stats}
                formatPrice={formatPrice}
                onCreate={handleCreate}
            />

            {/* Filtres et recherche */}
            <SearchFilters
                searchTerm={searchTerm}
                statutFilter={statutFilter}
                typeFilter={typeFilter}
                onSearchChange={handleSearch}
                onStatutFilterChange={(value) => {
                    setStatutFilter(value);
                    setCurrentPage(1);
                }}
                onTypeFilterChange={(value) => {
                    setTypeFilter(value);
                    setCurrentPage(1);
                }}
                onRefresh={loadPromotions}
                loading={loading}
                total={pagination.total || 0}
            />

            {/* Liste des promotions */}
            <PromotionsList
                promotions={promotions}
                loading={loading}
                searchTerm={searchTerm}
                statutFilter={statutFilter}
                typeFilter={typeFilter}
                formatPrice={formatPrice}
                getStatutColor={getStatutColor}
                getStatutIcon={getStatutIcon}
                getTypeIcon={getTypeIcon}
                onView={handleViewPromotion}
                onEdit={handleEdit}
                onToggleStatus={handleToggleStatus}
                onDuplicate={handleDuplicate}
                onDelete={handleDelete}
                updating={updating}
            />

            {/* Pagination */}
            {pagination.last_page > 1 && (
                <Pagination
                    currentPage={currentPage}
                    pagination={pagination}
                    onPageChange={handlePageChange}
                />
            )}

            {/* Modaux */}
            {showDetailsModal && selectedPromotion && (
                <DetailsModal
                    promotion={selectedPromotion}
                    onClose={handleCloseModals}
                    formatPrice={formatPrice}
                    getStatutColor={getStatutColor}
                    getStatutIcon={getStatutIcon}
                    getTypeIcon={getTypeIcon}
                />
            )}

            {showFormModal && (
                <FormModal
                    promotion={editingPromotion}
                    options={options}
                    onClose={handleCloseModals}
                    onSuccess={handleFormSuccess}
                    formatPrice={formatPrice}
                    getHeaders={getHeaders}
                    API_BASE={API_BASE}
                />
            )}
        </div>
    );
};

// ===== COMPOSANTS =====

const Header = ({ stats, formatPrice, onCreate }) => (
    <div className="mb-6">
        <div className="flex items-center justify-between mb-6">
            <div>
                <h1 className="text-2xl font-bold text-gray-900">Promotions</h1>
                <p className="text-gray-600">Gérez vos codes promo et offres spéciales</p>
            </div>
            <button
                onClick={onCreate}
                className="bg-purple-600 text-white px-4 py-2 rounded-lg hover:bg-purple-700 flex items-center space-x-2"
            >
                <Plus className="w-4 h-4" />
                <span>Nouvelle promotion</span>
            </button>
        </div>

        {/* Statistiques */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
            <div className="bg-white p-4 rounded-lg shadow-sm border">
                <div className="flex items-center justify-between">
                    <div>
                        <p className="text-sm text-gray-600">Total promotions</p>
                        <p className="text-2xl font-bold text-gray-900">{stats.total_promotions || 0}</p>
                    </div>
                    <Tag className="w-8 h-8 text-purple-500" />
                </div>
            </div>
            
            <div className="bg-white p-4 rounded-lg shadow-sm border">
                <div className="flex items-center justify-between">
                    <div>
                        <p className="text-sm text-gray-600">Actives</p>
                        <p className="text-2xl font-bold text-green-600">{stats.promotions_actives || 0}</p>
                    </div>
                    <CheckCircle className="w-8 h-8 text-green-500" />
                </div>
            </div>
            
            <div className="bg-white p-4 rounded-lg shadow-sm border">
                <div className="flex items-center justify-between">
                    <div>
                        <p className="text-sm text-gray-600">Utilisations totales</p>
                        <p className="text-2xl font-bold text-blue-600">{stats.utilisations_totales || 0}</p>
                    </div>
                    <Users className="w-8 h-8 text-blue-500" />
                </div>
            </div>
            
            <div className="bg-white p-4 rounded-lg shadow-sm border">
                <div className="flex items-center justify-between">
                    <div>
                        <p className="text-sm text-gray-600">CA généré</p>
                        <p className="text-lg font-bold text-emerald-600">{formatPrice(stats.ca_genere_total || 0)}</p>
                    </div>
                    <TrendingUp className="w-8 h-8 text-emerald-500" />
                </div>
            </div>
        </div>
    </div>
);

const SearchFilters = ({ 
    searchTerm, 
    statutFilter, 
    typeFilter, 
    onSearchChange, 
    onStatutFilterChange, 
    onTypeFilterChange, 
    onRefresh, 
    loading,
    total 
}) => (
    <div className="bg-white rounded-lg shadow-sm border mb-6 p-4">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between space-y-4 md:space-y-0">
            <div className="flex flex-col md:flex-row md:items-center space-y-4 md:space-y-0 md:space-x-4">
                <div className="relative">
                    <Search className="w-4 h-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                    <input
                        type="text"
                        placeholder="Rechercher une promotion..."
                        value={searchTerm}
                        onChange={onSearchChange}
                        className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent w-full md:w-80"
                    />
                </div>
                
                <select
                    value={statutFilter}
                    onChange={(e) => onStatutFilterChange(e.target.value)}
                    className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                >
                    <option value="">Tous les statuts</option>
                    <option value="active">Active</option>
                    <option value="inactive">Inactive</option>
                    <option value="future">Programmée</option>
                    <option value="expiree">Expirée</option>
                    <option value="epuisee">Épuisée</option>
                </select>

                <select
                    value={typeFilter}
                    onChange={(e) => onTypeFilterChange(e.target.value)}
                    className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                >
                    <option value="">Tous les types</option>
                    <option value="pourcentage">Pourcentage</option>
                    <option value="montant_fixe">Montant fixe</option>
                    <option value="livraison_gratuite">Livraison gratuite</option>
                </select>
                
                <button
                    onClick={onRefresh}
                    className="p-2 border border-gray-300 rounded-lg hover:bg-gray-50"
                    title="Actualiser"
                >
                    <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
                </button>
            </div>

            <div className="flex items-center space-x-2">
                <span className="text-sm text-gray-500">{total} promotion(s)</span>
            </div>
        </div>
    </div>
);

const PromotionsList = ({ 
    promotions, 
    loading, 
    searchTerm, 
    statutFilter, 
    typeFilter,
    formatPrice,
    getStatutColor,
    getStatutIcon,
    getTypeIcon,
    onView,
    onEdit,
    onToggleStatus,
    onDuplicate,
    onDelete,
    updating
}) => {
    if (loading) {
        return (
            <div className="bg-white rounded-lg shadow-sm border p-8 text-center">
                <RefreshCw className="w-8 h-8 animate-spin mx-auto mb-4 text-gray-400" />
                <p className="text-gray-500">Chargement des promotions...</p>
            </div>
        );
    }

    if (promotions.length === 0) {
        return (
            <div className="bg-white rounded-lg shadow-sm border p-8 text-center">
                <Tag className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-gray-900 mb-2">Aucune promotion trouvée</h3>
                <p className="text-gray-500">
                    {searchTerm || statutFilter || typeFilter
                        ? 'Aucune promotion ne correspond à vos critères de recherche.'
                        : 'Aucune promotion n\'a encore été créée.'
                    }
                </p>
            </div>
        );
    }

    return (
        <div className="bg-white rounded-lg shadow-sm border overflow-hidden">
            <div className="overflow-x-auto">
                <table className="w-full">
                    <thead className="bg-gray-50 border-b">
                        <tr>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                Promotion
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                Code
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                Type / Valeur
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                Période
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                Statut
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                Performances
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                Actions
                            </th>
                        </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                        {promotions.map((promotion) => (
                            <tr key={promotion.id} className="hover:bg-gray-50">
                                <td className="px-6 py-4 whitespace-nowrap">
                                    <div className="flex items-center">
                                        {promotion.image && (
                                            <img
                                                src={promotion.image}
                                                alt={promotion.nom}
                                                className="w-10 h-10 rounded object-cover mr-3"
                                            />
                                        )}
                                        <div>
                                            <div className="text-sm font-medium text-gray-900">
                                                {promotion.nom}
                                            </div>
                                            <div className="text-sm text-gray-500 truncate max-w-xs">
                                                {promotion.description}
                                            </div>
                                        </div>
                                    </div>
                                </td>
                                
                                <td className="px-6 py-4 whitespace-nowrap">
                                    <div className="text-sm font-mono bg-gray-100 px-2 py-1 rounded">
                                        {promotion.code}
                                    </div>
                                </td>
                                
                                <td className="px-6 py-4 whitespace-nowrap">
                                    <div className="flex items-center">
                                        {getTypeIcon(promotion.type_promotion)}
                                        <div className="ml-2">
                                            <div className="text-sm text-gray-900">
                                                {promotion.type_label}
                                            </div>
                                            <div className="text-sm font-bold text-purple-600">
                                                {promotion.valeur_formatted}
                                            </div>
                                        </div>
                                    </div>
                                </td>
                                
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                    <div>{promotion.date_debut}</div>
                                    <div>au {promotion.date_fin}</div>
                                    {promotion.jours_restants > 0 && (
                                        <div className="text-xs text-orange-600">
                                            {promotion.jours_restants} jour(s) restant(s)
                                        </div>
                                    )}
                                </td>
                                
                                <td className="px-6 py-4 whitespace-nowrap">
                                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatutColor(promotion.statut)}`}>
                                        {getStatutIcon(promotion.statut)}
                                        <span className="ml-1">{promotion.statut_label}</span>
                                    </span>
                                </td>
                                
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                    <div className="font-medium">{promotion.nombre_utilisations} utilisations</div>
                                    <div className="text-xs">
                                        {formatPrice(promotion.chiffre_affaires_genere)}
                                    </div>
                                </td>
                                
                                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                                    <div className="flex items-center space-x-2">
                                        <button
                                            onClick={() => onView(promotion)}
                                            className="text-purple-600 hover:text-purple-900 p-1 rounded"
                                            title="Voir les détails"
                                        >
                                            <Eye className="w-4 h-4" />
                                        </button>
                                        
                                        <button
                                            onClick={() => onEdit(promotion)}
                                            className="text-blue-600 hover:text-blue-900 p-1 rounded"
                                            title="Modifier"
                                        >
                                            <Edit className="w-4 h-4" />
                                        </button>

                                        <button
                                            onClick={() => onToggleStatus(promotion)}
                                            className={`p-1 rounded ${promotion.est_active 
                                                ? 'text-orange-600 hover:text-orange-900' 
                                                : 'text-green-600 hover:text-green-900'
                                            }`}
                                            title={promotion.est_active ? 'Désactiver' : 'Activer'}
                                            disabled={updating}
                                        >
                                            {promotion.est_active ? (
                                                <ToggleRight className="w-4 h-4" />
                                            ) : (
                                                <ToggleLeft className="w-4 h-4" />
                                            )}
                                        </button>

                                        <button
                                            onClick={() => onDuplicate(promotion)}
                                            className="text-gray-600 hover:text-gray-900 p-1 rounded"
                                            title="Dupliquer"
                                        >
                                            <Copy className="w-4 h-4" />
                                        </button>

                                        {promotion.nombre_utilisations === 0 && (
                                            <button
                                                onClick={() => onDelete(promotion)}
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
        </div>
    );
};

const Pagination = ({ currentPage, pagination, onPageChange }) => (
    <div className="bg-white px-4 py-3 border-t border-gray-200 sm:px-6 mt-4 rounded-lg">
        <div className="flex items-center justify-between">
            <div className="flex-1 flex justify-between sm:hidden">
                <button
                    onClick={() => onPageChange(currentPage - 1)}
                    disabled={currentPage === 1}
                    className="relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50"
                >
                    Précédent
                </button>
                <button
                    onClick={() => onPageChange(currentPage + 1)}
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
                            onClick={() => onPageChange(currentPage - 1)}
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
                                    onClick={() => onPageChange(pageNum)}
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
                            onClick={() => onPageChange(currentPage + 1)}
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
);

// Modal de détails de la promotion
const DetailsModal = ({ 
    promotion, 
    onClose, 
    formatPrice, 
    getStatutColor, 
    getStatutIcon, 
    getTypeIcon 
}) => (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-2xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
                {/* Header */}
                <div className="flex items-start justify-between mb-6 pb-4 border-b">
                    <div className="flex items-start space-x-4">
                        {promotion.image && (
                            <img
                                src={promotion.image}
                                alt={promotion.nom}
                                className="w-16 h-16 rounded-lg object-cover"
                            />
                        )}
                        <div>
                            <h2 className="text-2xl font-bold text-gray-900">{promotion.nom}</h2>
                            <p className="text-gray-600 mt-1">{promotion.description}</p>
                            <div className="mt-2">
                                <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${getStatutColor(promotion.statut)}`}>
                                    {getStatutIcon(promotion.statut)}
                                    <span className="ml-1">{promotion.statut_label}</span>
                                </span>
                            </div>
                        </div>
                    </div>
                    <button
                        onClick={onClose}
                        className="text-gray-400 hover:text-gray-600 p-2 rounded-lg"
                    >
                        <X className="w-6 h-6" />
                    </button>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    {/* Informations principales */}
                    <div className="space-y-4">
                        <div className="bg-gray-50 p-4 rounded-lg">
                            <h3 className="text-lg font-semibold text-gray-900 mb-3">Détails</h3>
                            <div className="space-y-3">
                                <div className="flex justify-between">
                                    <span className="text-gray-600">Code promo</span>
                                    <span className="font-mono bg-purple-100 px-2 py-1 rounded text-purple-800">
                                        {promotion.code}
                                    </span>
                                </div>
                                <div className="flex justify-between items-center">
                                    <span className="text-gray-600">Type</span>
                                    <div className="flex items-center">
                                        {getTypeIcon(promotion.type_promotion)}
                                        <span className="ml-2 font-medium">{promotion.type_label}</span>
                                    </div>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-gray-600">Valeur</span>
                                    <span className="font-bold text-lg text-purple-600">
                                        {promotion.valeur_formatted}
                                    </span>
                                </div>
                            </div>
                        </div>

                        <div className="bg-gray-50 p-4 rounded-lg">
                            <h3 className="text-lg font-semibold text-gray-900 mb-3">Période</h3>
                            <div className="space-y-3">
                                <div className="flex justify-between">
                                    <span className="text-gray-600">Du</span>
                                    <span className="font-medium">{promotion.date_debut}</span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-gray-600">Au</span>
                                    <span className="font-medium">{promotion.date_fin}</span>
                                </div>
                                {promotion.jours_restants > 0 && (
                                    <div className="flex justify-between">
                                        <span className="text-gray-600">Reste</span>
                                        <span className="font-medium text-orange-600">
                                            {promotion.jours_restants} jour(s)
                                        </span>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>

                    {/* Statistiques */}
                    <div className="space-y-4">
                        <div className="bg-gray-50 p-4 rounded-lg">
                            <h3 className="text-lg font-semibold text-gray-900 mb-3">Performances</h3>
                            <div className="space-y-3">
                                <div className="flex justify-between">
                                    <span className="text-gray-600">Utilisations</span>
                                    <span className="font-bold text-blue-600">{promotion.nombre_utilisations}</span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-gray-600">CA généré</span>
                                    <span className="font-bold text-green-600">
                                        {formatPrice(promotion.chiffre_affaires_genere)}
                                    </span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-gray-600">Commandes</span>
                                    <span className="font-medium">{promotion.nombre_commandes}</span>
                                </div>
                            </div>
                        </div>

                        <div className="bg-gray-50 p-4 rounded-lg">
                            <h3 className="text-lg font-semibold text-gray-900 mb-3">Configuration</h3>
                            <div className="space-y-2">
                                <div className="flex justify-between">
                                    <span className="text-gray-600">Cible</span>
                                    <span className="font-medium capitalize">{promotion.cible_client}</span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-gray-600">Cumul autorisé</span>
                                    <span className={`font-medium ${promotion.cumul_avec_autres ? 'text-green-600' : 'text-red-600'}`}>
                                        {promotion.cumul_avec_autres ? 'Oui' : 'Non'}
                                    </span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Bouton fermer */}
                <div className="flex justify-end mt-6 pt-4 border-t">
                    <button
                        onClick={onClose}
                        className="bg-gray-600 text-white px-6 py-2 rounded-lg hover:bg-gray-700"
                    >
                        Fermer
                    </button>
                </div>
            </div>
        </div>
    </div>
);

// Modal de formulaire (création/modification)
const FormModal = ({ 
    promotion, 
    options, 
    onClose, 
    onSuccess, 
    formatPrice, 
    getHeaders, 
    API_BASE 
}) => {
    const isEditing = !!promotion;
    const [loading, setLoading] = useState(false);
    const [errors, setErrors] = useState({});
    const [imagePreview, setImagePreview] = useState(promotion?.image || null);
    
    // Fonction pour formater la date pour les inputs date
    const formatDateForInput = (dateString) => {
        if (!dateString) return '';
        try {
            const date = new Date(dateString);
            return date.toISOString().split('T')[0];
        } catch (error) {
            return '';
        }
    };
    
    const [formData, setFormData] = useState({
        nom: promotion?.nom || '',
        code: promotion?.code || '',
        description: promotion?.description || '',
        type_promotion: promotion?.type_promotion || 'pourcentage',
        valeur: promotion?.valeur || '',
        montant_minimum: promotion?.montant_minimum || '',
        reduction_maximum: promotion?.reduction_maximum || '',
        date_debut: formatDateForInput(promotion?.date_debut_iso || promotion?.date_debut),
        date_fin: formatDateForInput(promotion?.date_fin_iso || promotion?.date_fin),
        est_active: promotion?.est_active || false,
        utilisation_maximum: promotion?.utilisation_maximum || '',
        utilisation_par_client: promotion?.utilisation_par_client || 1,
        cible_client: promotion?.cible_client || 'tous',
        cumul_avec_autres: promotion?.cumul_avec_autres || false,
        premiere_commande_seulement: promotion?.premiere_commande_seulement || false,
        afficher_site: promotion?.afficher_site ?? true,
        envoyer_whatsapp: promotion?.envoyer_whatsapp || false,
        envoyer_email: promotion?.envoyer_email || false,
        couleur_affichage: promotion?.couleur_affichage || '#8b5cf6'
    });

    const handleChange = (e) => {
        const { name, value, type, checked } = e.target;
        
        if (type === 'checkbox') {
            setFormData(prev => ({ ...prev, [name]: checked }));
        } else if (type === 'file') {
            const file = e.target.files[0];
            if (file) {
                setFormData(prev => ({ ...prev, [name]: file }));
                const reader = new FileReader();
                reader.onload = (e) => setImagePreview(e.target.result);
                reader.readAsDataURL(file);
            }
        } else {
            setFormData(prev => ({ ...prev, [name]: value }));
        }

        if (errors[name]) {
            setErrors(prev => ({ ...prev, [name]: null }));
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setErrors({});

        try {
            const formDataToSend = new FormData();
            
            // Préparer les données pour l'envoi
            Object.keys(formData).forEach(key => {
                const value = formData[key];
                
                // Ne pas envoyer les valeurs vides ou null
                if (value !== null && value !== '' && value !== undefined) {
                    // Convertir les valeurs booléennes en string pour FormData
                    if (typeof value === 'boolean') {
                        formDataToSend.append(key, value ? '1' : '0');
                    } else if (value instanceof File) {
                        // Pour les fichiers
                        formDataToSend.append(key, value);
                    } else {
                        formDataToSend.append(key, value);
                    }
                }
            });

            // Ajouter la méthode PUT pour l'édition (Laravel method spoofing)
            if (isEditing) {
                formDataToSend.append('_method', 'PUT');
            }

            const url = isEditing 
                ? `${API_BASE}/promotions/${promotion.id}` 
                : `${API_BASE}/promotions`;
            
            const headers = getHeaders();
            delete headers['Content-Type']; // Laisser le navigateur définir le Content-Type pour FormData

            console.log('Envoi des données:', Array.from(formDataToSend.entries())); // Debug

            const response = await fetch(url, {
                method: 'POST', // Toujours POST, même pour PUT avec FormData
                headers: headers,
                body: formDataToSend
            });

            const result = await response.json();
            
            if (result.success) {
                toast.success(isEditing ? 'Promotion mise à jour' : 'Promotion créée');
                onSuccess();
            } else {
                if (result.errors) {
                    setErrors(result.errors);
                    console.log('Erreurs de validation:', result.errors);
                } else {
                    toast.error(result.message);
                }
            }
        } catch (error) {
            console.error('Erreur lors de l\'enregistrement:', error);
            toast.error('Erreur lors de l\'enregistrement');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
            <div className="bg-white rounded-2xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
                <form onSubmit={handleSubmit} className="p-6">
                    {/* Header */}
                    <div className="flex items-center justify-between mb-6 pb-4 border-b">
                        <div>
                            <h2 className="text-2xl font-bold text-gray-900">
                                {isEditing ? 'Modifier la promotion' : 'Nouvelle promotion'}
                            </h2>
                            <p className="text-gray-600">
                                {isEditing ? 'Modifiez les détails' : 'Créez une nouvelle promotion'}
                            </p>
                        </div>
                        <button type="button" onClick={onClose} className="text-gray-400 hover:text-gray-600">
                            <X className="w-6 h-6" />
                        </button>
                    </div>

                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                        {/* Colonne gauche */}
                        <div className="space-y-4">
                            <h3 className="text-lg font-semibold">Informations de base</h3>
                            
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Nom de la promotion *
                                </label>
                                <input
                                    type="text"
                                    name="nom"
                                    value={formData.nom}
                                    onChange={handleChange}
                                    className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-purple-500 ${
                                        errors.nom ? 'border-red-500' : 'border-gray-300'
                                    }`}
                                    required
                                />
                                {errors.nom && <p className="text-red-500 text-sm mt-1">{errors.nom}</p>}
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Code promo
                                </label>
                                <input
                                    type="text"
                                    name="code"
                                    value={formData.code}
                                    onChange={handleChange}
                                    className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-purple-500 ${
                                        errors.code ? 'border-red-500' : 'border-gray-300'
                                    }`}
                                    placeholder="Auto-généré si vide"
                                />
                                {errors.code && <p className="text-red-500 text-sm mt-1">{errors.code}</p>}
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Description *
                                </label>
                                <textarea
                                    name="description"
                                    value={formData.description}
                                    onChange={handleChange}
                                    rows="3"
                                    className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-purple-500 ${
                                        errors.description ? 'border-red-500' : 'border-gray-300'
                                    }`}
                                    required
                                />
                                {errors.description && <p className="text-red-500 text-sm mt-1">{errors.description}</p>}
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Image
                                </label>
                                <div className="flex items-center space-x-4">
                                    {imagePreview && (
                                        <img src={imagePreview} alt="Aperçu" className="w-16 h-16 object-cover rounded" />
                                    )}
                                    <input
                                        type="file"
                                        name="image"
                                        onChange={handleChange}
                                        accept="image/*"
                                        className="flex-1 px-3 py-2 border border-gray-300 rounded-lg"
                                    />
                                </div>
                            </div>
                        </div>

                        {/* Colonne droite */}
                        <div className="space-y-4">
                            <h3 className="text-lg font-semibold">Configuration</h3>
                            
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        Type *
                                    </label>
                                    <select
                                        name="type_promotion"
                                        value={formData.type_promotion}
                                        onChange={handleChange}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500"
                                        required
                                    >
                                        {options.types_promotion ? (
                                            options.types_promotion.map(type => (
                                                <option key={type.value} value={type.value}>
                                                    {type.label}
                                                </option>
                                            ))
                                        ) : (
                                            // Fallback si les options ne sont pas chargées
                                            <>
                                                <option value="pourcentage">Pourcentage (%)</option>
                                                <option value="montant_fixe">Montant fixe (FCFA)</option>
                                                <option value="livraison_gratuite">Livraison gratuite</option>
                                            </>
                                        )}
                                    </select>
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        Valeur *
                                    </label>
                                    <input
                                        type="number"
                                        name="valeur"
                                        value={formData.valeur}
                                        onChange={handleChange}
                                        step="0.1"
                                        min="0"
                                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500"
                                        required
                                    />
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        Date début *
                                    </label>
                                    <input
                                        type="date"
                                        name="date_debut"
                                        value={formData.date_debut}
                                        onChange={handleChange}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500"
                                        required
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        Date fin *
                                    </label>
                                    <input
                                        type="date"
                                        name="date_fin"
                                        value={formData.date_fin}
                                        onChange={handleChange}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500"
                                        required
                                    />
                                </div>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Cible client
                                </label>
                                <select
                                    name="cible_client"
                                    value={formData.cible_client}
                                    onChange={handleChange}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500"
                                >
                                    {options.cibles_client ? (
                                        options.cibles_client.map(cible => (
                                            <option key={cible.value} value={cible.value}>
                                                {cible.label}
                                            </option>
                                        ))
                                    ) : (
                                        // Fallback si les options ne sont pas chargées
                                        <>
                                            <option value="tous">Tous les clients</option>
                                            <option value="nouveaux">Nouveaux clients</option>
                                            <option value="vip">Clients VIP</option>
                                            <option value="reguliers">Clients réguliers</option>
                                        </>
                                    )}
                                </select>
                            </div>

                            <div className="space-y-3">
                                <label className="flex items-center">
                                    <input
                                        type="checkbox"
                                        name="est_active"
                                        checked={formData.est_active}
                                        onChange={handleChange}
                                        className="h-4 w-4 text-purple-600 focus:ring-purple-500 border-gray-300 rounded"
                                    />
                                    <span className="ml-2 text-sm text-gray-700">Activer immédiatement</span>
                                </label>

                                <label className="flex items-center">
                                    <input
                                        type="checkbox"
                                        name="afficher_site"
                                        checked={formData.afficher_site}
                                        onChange={handleChange}
                                        className="h-4 w-4 text-purple-600 focus:ring-purple-500 border-gray-300 rounded"
                                    />
                                    <span className="ml-2 text-sm text-gray-700">Afficher sur le site</span>
                                </label>

                                <label className="flex items-center">
                                    <input
                                        type="checkbox"
                                        name="cumul_avec_autres"
                                        checked={formData.cumul_avec_autres}
                                        onChange={handleChange}
                                        className="h-4 w-4 text-purple-600 focus:ring-purple-500 border-gray-300 rounded"
                                    />
                                    <span className="ml-2 text-sm text-gray-700">Autoriser le cumul</span>
                                </label>
                            </div>
                        </div>
                    </div>

                    {/* Boutons */}
                    <div className="flex space-x-3 mt-6 pt-4 border-t">
                        <button
                            type="submit"
                            disabled={loading}
                            className="flex-1 bg-purple-600 text-white px-6 py-3 rounded-lg hover:bg-purple-700 disabled:opacity-50 flex items-center justify-center space-x-2"
                        >
                            {loading ? (
                                <>
                                    <RefreshCw className="w-4 h-4 animate-spin" />
                                    <span>{isEditing ? 'Mise à jour...' : 'Création...'}</span>
                                </>
                            ) : (
                                <span>{isEditing ? 'Mettre à jour' : 'Créer'}</span>
                            )}
                        </button>
                        
                        <button
                            type="button"
                            onClick={onClose}
                            disabled={loading}
                            className="px-6 py-3 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 disabled:opacity-50"
                        >
                            Annuler
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default Promotions;