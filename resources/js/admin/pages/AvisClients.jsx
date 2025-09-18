import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { 
    Search, 
    Eye,
    RefreshCw,
    X,
    Check,
    XCircle,
    Star,
    MessageSquare,
    ThumbsUp,
    ThumbsDown,
    Award,
    CheckCircle,
    Clock,
    AlertTriangle,
    EyeOff,
    ChevronLeft,
    ChevronRight,
    Filter,
    StarIcon,
    User,
    Package,
    Calendar,
    TrendingUp,
    Users,
    MessageCircle
} from 'lucide-react';
import { toast } from 'react-hot-toast';

const AvisClients = () => {
    const { token } = useAuth();
    
    // États principaux
    const [avis, setAvis] = useState([]);
    const [stats, setStats] = useState({});
    const [options, setOptions] = useState({});
    
    // États de l'interface
    const [loading, setLoading] = useState(true);
    const [updating, setUpdating] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');
    const [statutFilter, setStatutFilter] = useState('');
    const [noteFilter, setNoteFilter] = useState('');
    const [produitFilter, setProduitFilter] = useState('');
    
    // États de pagination
    const [currentPage, setCurrentPage] = useState(1);
    const [pagination, setPagination] = useState({});
    
    // États des modaux
    const [showDetailsModal, setShowDetailsModal] = useState(false);
    const [showResponseModal, setShowResponseModal] = useState(false);
    const [selectedAvis, setSelectedAvis] = useState(null);
    const [responseText, setResponseText] = useState('');

    const API_BASE = '/api/admin';

    // Configuration des headers
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

    // ===== CHARGEMENT DES DONNÉES =====
    
    const loadAvis = async () => {
        try {
            setLoading(true);
            const params = new URLSearchParams({
                page: currentPage,
                per_page: 15,
                search: searchTerm
            });

            if (statutFilter) params.append('statut', statutFilter);
            if (noteFilter) params.append('note_min', noteFilter);
            if (produitFilter) params.append('produit_id', produitFilter);

            const response = await fetch(`${API_BASE}/avis-clients?${params}`, {
                headers: getHeaders()
            });

            if (!response.ok) throw new Error('Erreur lors du chargement');

            const result = await response.json();
            if (result.success) {
                setAvis(result.data.avis);
                setPagination(result.data.pagination);
            }
        } catch (error) {
            console.error('Erreur:', error);
            toast.error('Erreur lors du chargement des avis');
        } finally {
            setLoading(false);
        }
    };

    const loadStats = async () => {
        try {
            const response = await fetch(`${API_BASE}/avis-clients/stats`, {
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
            const response = await fetch(`${API_BASE}/avis-clients/options`, {
                headers: getHeaders()
            });

            if (response.ok) {
                const result = await response.json();
                if (result.success) {
                    setOptions(result.data);
                }
            }
        } catch (error) {
            console.error('Erreur options:', error);
        }
    };

    // ===== ACTIONS =====

    const handleSearch = (e) => {
        setSearchTerm(e.target.value);
        setCurrentPage(1);
    };

    const handleViewAvis = async (avis) => {
        try {
            const response = await fetch(`${API_BASE}/avis-clients/${avis.id}`, {
                headers: getHeaders()
            });

            if (response.ok) {
                const result = await response.json();
                if (result.success) {
                    setSelectedAvis(result.data.avis);
                    setShowDetailsModal(true);
                }
            }
        } catch (error) {
            toast.error('Erreur lors du chargement des détails');
        }
    };

    const handleModeration = async (avis, action, raison = null) => {
        try {
            setUpdating(true);
            const response = await fetch(`${API_BASE}/avis-clients/${avis.id}/moderer`, {
                method: 'POST',
                headers: getHeaders(),
                body: JSON.stringify({ action, raison })
            });

            const result = await response.json();
            if (result.success) {
                toast.success(result.message);
                loadAvis();
                loadStats();
            } else {
                toast.error(result.message);
            }
        } catch (error) {
            toast.error('Erreur lors de la modération');
        } finally {
            setUpdating(false);
        }
    };

    const handleResponse = async () => {
        if (!responseText.trim() || responseText.length < 10) {
            toast.error('La réponse doit contenir au moins 10 caractères');
            return;
        }

        try {
            setUpdating(true);
            const response = await fetch(`${API_BASE}/avis-clients/${selectedAvis.id}/repondre`, {
                method: 'POST',
                headers: getHeaders(),
                body: JSON.stringify({ reponse: responseText })
            });

            const result = await response.json();
            if (result.success) {
                toast.success('Réponse ajoutée avec succès');
                setShowResponseModal(false);
                setResponseText('');
                loadAvis();
            } else {
                toast.error(result.message);
            }
        } catch (error) {
            toast.error('Erreur lors de l\'ajout de la réponse');
        } finally {
            setUpdating(false);
        }
    };

    const handleToggleMiseEnAvant = async (avis) => {
        try {
            setUpdating(true);
            const response = await fetch(`${API_BASE}/avis-clients/${avis.id}/toggle-mise-en-avant`, {
                method: 'POST',
                headers: getHeaders()
            });

            const result = await response.json();
            if (result.success) {
                toast.success(result.message);
                loadAvis();
            } else {
                toast.error(result.message);
            }
        } catch (error) {
            toast.error('Erreur lors de la modification');
        } finally {
            setUpdating(false);
        }
    };

    const handleToggleVerifie = async (avis) => {
        try {
            setUpdating(true);
            const response = await fetch(`${API_BASE}/avis-clients/${avis.id}/toggle-verifie`, {
                method: 'POST',
                headers: getHeaders()
            });

            const result = await response.json();
            if (result.success) {
                toast.success(result.message);
                loadAvis();
            } else {
                toast.error(result.message);
            }
        } catch (error) {
            toast.error('Erreur lors de la modification');
        } finally {
            setUpdating(false);
        }
    };

    const handleDelete = async (avis) => {
        if (!window.confirm('Êtes-vous sûr de vouloir supprimer cet avis ?')) {
            return;
        }

        try {
            const response = await fetch(`${API_BASE}/avis-clients/${avis.id}`, {
                method: 'DELETE',
                headers: getHeaders()
            });

            const result = await response.json();
            if (result.success) {
                toast.success('Avis supprimé avec succès');
                loadAvis();
                loadStats();
            } else {
                toast.error(result.message);
            }
        } catch (error) {
            toast.error('Erreur lors de la suppression');
        }
    };

    const handleCloseModals = () => {
        setShowDetailsModal(false);
        setShowResponseModal(false);
        setSelectedAvis(null);
        setResponseText('');
    };

    // ===== UTILITAIRES =====

    const renderStars = (note) => {
        return Array.from({ length: 5 }, (_, i) => (
            <Star
                key={i}
                className={`w-4 h-4 ${
                    i < note ? 'text-yellow-400 fill-current' : 'text-gray-300'
                }`}
            />
        ));
    };

    const getStatutIcon = (statut) => {
        const icons = {
            'en_attente': Clock,
            'approuve': CheckCircle,
            'rejete': XCircle,
            'masque': EyeOff
        };
        const Icon = icons[statut] || Clock;
        return <Icon className="w-4 h-4" />;
    };

    const handlePageChange = (page) => {
        if (page >= 1 && page <= pagination.last_page) {
            setCurrentPage(page);
        }
    };

    // ===== EFFETS =====
    
    useEffect(() => {
        loadAvis();
    }, [currentPage, searchTerm, statutFilter, noteFilter, produitFilter]);

    useEffect(() => {
        loadStats();
        loadOptions();
    }, []);

    // ===== RENDU =====

    return (
        <div className="p-6">
            {/* En-tête et statistiques */}
            <Header stats={stats} />

            {/* Filtres et recherche */}
            <SearchFilters
                searchTerm={searchTerm}
                statutFilter={statutFilter}
                noteFilter={noteFilter}
                produitFilter={produitFilter}
                options={options}
                onSearchChange={handleSearch}
                onStatutFilterChange={(value) => {
                    setStatutFilter(value);
                    setCurrentPage(1);
                }}
                onNoteFilterChange={(value) => {
                    setNoteFilter(value);
                    setCurrentPage(1);
                }}
                onProduitFilterChange={(value) => {
                    setProduitFilter(value);
                    setCurrentPage(1);
                }}
                onRefresh={loadAvis}
                loading={loading}
                total={pagination.total || 0}
            />

            {/* Liste des avis */}
            <AvisList
                avis={avis}
                loading={loading}
                updating={updating}
                renderStars={renderStars}
                getStatutIcon={getStatutIcon}
                onView={handleViewAvis}
                onModeration={handleModeration}
                onResponse={(avis) => {
                    setSelectedAvis(avis);
                    setShowResponseModal(true);
                }}
                onToggleMiseEnAvant={handleToggleMiseEnAvant}
                onToggleVerifie={handleToggleVerifie}
                onDelete={handleDelete}
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
            {showDetailsModal && selectedAvis && (
                <DetailsModal
                    avis={selectedAvis}
                    onClose={handleCloseModals}
                    renderStars={renderStars}
                    getStatutIcon={getStatutIcon}
                />
            )}

            {showResponseModal && selectedAvis && (
                <ResponseModal
                    avis={selectedAvis}
                    responseText={responseText}
                    setResponseText={setResponseText}
                    onSubmit={handleResponse}
                    onClose={handleCloseModals}
                    loading={updating}
                />
            )}
        </div>
    );
};

// ===== COMPOSANTS =====

const Header = ({ stats }) => (
    <div className="mb-6">
        <div className="mb-6">
            <h1 className="text-2xl font-bold text-gray-900">Avis Clients</h1>
            <p className="text-gray-600">Gérez les avis et commentaires de vos clients</p>
        </div>

        {/* Statistiques */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
            <div className="bg-white p-4 rounded-lg shadow-sm border">
                <div className="flex items-center justify-between">
                    <div>
                        <p className="text-sm text-gray-600">Total avis</p>
                        <p className="text-2xl font-bold text-gray-900">{stats.total_avis || 0}</p>
                    </div>
                    <MessageCircle className="w-8 h-8 text-blue-500" />
                </div>
            </div>
            
            <div className="bg-white p-4 rounded-lg shadow-sm border">
                <div className="flex items-center justify-between">
                    <div>
                        <p className="text-sm text-gray-600">En attente</p>
                        <p className="text-2xl font-bold text-orange-600">{stats.avis_en_attente || 0}</p>
                    </div>
                    <Clock className="w-8 h-8 text-orange-500" />
                </div>
            </div>
            
            <div className="bg-white p-4 rounded-lg shadow-sm border">
                <div className="flex items-center justify-between">
                    <div>
                        <p className="text-sm text-gray-600">Note moyenne</p>
                        <p className="text-2xl font-bold text-yellow-600">
                            {stats.note_moyenne_globale ? stats.note_moyenne_globale.toFixed(1) : '0.0'}
                        </p>
                    </div>
                    <Star className="w-8 h-8 text-yellow-500" />
                </div>
            </div>
            
            <div className="bg-white p-4 rounded-lg shadow-sm border">
                <div className="flex items-center justify-between">
                    <div>
                        <p className="text-sm text-gray-600">Approuvés</p>
                        <p className="text-2xl font-bold text-green-600">{stats.avis_approuves || 0}</p>
                    </div>
                    <CheckCircle className="w-8 h-8 text-green-500" />
                </div>
            </div>
        </div>
    </div>
);

const SearchFilters = ({ 
    searchTerm, 
    statutFilter, 
    noteFilter, 
    produitFilter,
    options,
    onSearchChange, 
    onStatutFilterChange, 
    onNoteFilterChange,
    onProduitFilterChange,
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
                        placeholder="Rechercher dans les avis..."
                        value={searchTerm}
                        onChange={onSearchChange}
                        className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent w-full md:w-80"
                    />
                </div>
                
                <select
                    value={statutFilter}
                    onChange={(e) => onStatutFilterChange(e.target.value)}
                    className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                    <option value="">Tous les statuts</option>
                    {options.statuts?.map(statut => (
                        <option key={statut.value} value={statut.value}>
                            {statut.label}
                        </option>
                    ))}
                </select>

                <select
                    value={noteFilter}
                    onChange={(e) => onNoteFilterChange(e.target.value)}
                    className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                    <option value="">Toutes les notes</option>
                    {options.notes?.map(note => (
                        <option key={note.value} value={note.value}>
                            {note.label} et +
                        </option>
                    ))}
                </select>

                <select
                    value={produitFilter}
                    onChange={(e) => onProduitFilterChange(e.target.value)}
                    className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                    <option value="">Tous les produits</option>
                    {options.produits?.map(produit => (
                        <option key={produit.id} value={produit.id}>
                            {produit.nom}
                        </option>
                    ))}
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
                <span className="text-sm text-gray-500">{total} avis</span>
            </div>
        </div>
    </div>
);

const AvisList = ({ 
    avis, 
    loading, 
    updating,
    renderStars,
    getStatutIcon,
    onView,
    onModeration,
    onResponse,
    onToggleMiseEnAvant,
    onToggleVerifie,
    onDelete
}) => {
    if (loading) {
        return (
            <div className="bg-white rounded-lg shadow-sm border p-8 text-center">
                <RefreshCw className="w-8 h-8 animate-spin mx-auto mb-4 text-gray-400" />
                <p className="text-gray-500">Chargement des avis...</p>
            </div>
        );
    }

    if (avis.length === 0) {
        return (
            <div className="bg-white rounded-lg shadow-sm border p-8 text-center">
                <MessageCircle className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-gray-900 mb-2">Aucun avis trouvé</h3>
                <p className="text-gray-500">Aucun avis ne correspond à vos critères de recherche.</p>
            </div>
        );
    }

    return (
        <div className="space-y-4">
            {avis.map((avis) => (
                <div key={avis.id} className="bg-white rounded-lg shadow-sm border p-6">
                    <div className="flex items-start justify-between">
                        <div className="flex-1">
                            <div className="flex items-center space-x-4 mb-3">
                                <div className="flex items-center space-x-2">
                                    <User className="w-4 h-4 text-gray-400" />
                                    <span className="font-medium text-gray-900">
                                        {avis.nom_affiche || avis.client.nom_complet}
                                    </span>
                                    {avis.avis_verifie && (
                                        <CheckCircle className="w-4 h-4 text-blue-500" title="Avis vérifié" />
                                    )}
                                </div>
                                
                                <div className="flex items-center space-x-1">
                                    {renderStars(avis.note_globale)}
                                    <span className="text-sm text-gray-600 ml-2">{avis.note_globale}/5</span>
                                </div>

                                <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${avis.statut_color}`}>
                                    {getStatutIcon(avis.statut)}
                                    <span className="ml-1">{avis.statut_label}</span>
                                </span>

                                {avis.est_mis_en_avant && (
                                    <Award className="w-4 h-4 text-yellow-500" title="Mis en avant" />
                                )}
                            </div>

                            <div className="mb-3">
                                <div className="flex items-center space-x-2 text-sm text-gray-600 mb-2">
                                    <Package className="w-4 h-4" />
                                    <span>{avis.produit.nom}</span>
                                    <Calendar className="w-4 h-4 ml-4" />
                                    <span>{avis.created_at}</span>
                                </div>
                                
                                {avis.titre && (
                                    <h4 className="font-medium text-gray-900 mb-2">{avis.titre}</h4>
                                )}
                                <p className="text-gray-700">{avis.commentaire}</p>
                            </div>

                            <div className="flex items-center space-x-4 text-sm text-gray-500">
                                <div className="flex items-center space-x-1">
                                    <ThumbsUp className="w-4 h-4" />
                                    <span>{avis.nombre_likes}</span>
                                </div>
                                <div className="flex items-center space-x-1">
                                    <ThumbsDown className="w-4 h-4" />
                                    <span>{avis.nombre_dislikes}</span>
                                </div>
                                {avis.a_photos && (
                                    <span className="text-blue-600">{avis.nombre_photos} photo(s)</span>
                                )}
                                {avis.a_reponse && (
                                    <span className="text-green-600">Réponse ajoutée</span>
                                )}
                            </div>
                        </div>

                        <div className="flex items-center space-x-2 ml-4">
                            <button
                                onClick={() => onView(avis)}
                                className="text-blue-600 hover:text-blue-900 p-2 rounded"
                                title="Voir les détails"
                            >
                                <Eye className="w-4 h-4" />
                            </button>

                            {avis.statut === 'en_attente' && (
                                <>
                                    <button
                                        onClick={() => onModeration(avis, 'approuver')}
                                        className="text-green-600 hover:text-green-900 p-2 rounded"
                                        title="Approuver"
                                        disabled={updating}
                                    >
                                        <Check className="w-4 h-4" />
                                    </button>
                                    <button
                                        onClick={() => {
                                            const raison = window.prompt('Raison du rejet (optionnel):');
                                            if (raison !== null) {
                                                onModeration(avis, 'rejeter', raison);
                                            }
                                        }}
                                        className="text-red-600 hover:text-red-900 p-2 rounded"
                                        title="Rejeter"
                                        disabled={updating}
                                    >
                                        <X className="w-4 h-4" />
                                    </button>
                                </>
                            )}

                            {avis.statut === 'approuve' && !avis.a_reponse && (
                                <button
                                    onClick={() => onResponse(avis)}
                                    className="text-purple-600 hover:text-purple-900 p-2 rounded"
                                    title="Répondre"
                                >
                                    <MessageSquare className="w-4 h-4" />
                                </button>
                            )}

                            <button
                                onClick={() => onToggleMiseEnAvant(avis)}
                                className={`p-2 rounded ${avis.est_mis_en_avant 
                                    ? 'text-yellow-600 hover:text-yellow-900' 
                                    : 'text-gray-600 hover:text-gray-900'
                                }`}
                                title={avis.est_mis_en_avant ? 'Retirer de la mise en avant' : 'Mettre en avant'}
                                disabled={updating}
                            >
                                <Award className="w-4 h-4" />
                            </button>

                            <button
                                onClick={() => onToggleVerifie(avis)}
                                className={`p-2 rounded ${avis.avis_verifie 
                                    ? 'text-blue-600 hover:text-blue-900' 
                                    : 'text-gray-600 hover:text-gray-900'
                                }`}
                                title={avis.avis_verifie ? 'Marquer comme non vérifié' : 'Marquer comme vérifié'}
                                disabled={updating}
                            >
                                <CheckCircle className="w-4 h-4" />
                            </button>

                            <button
                                onClick={() => onDelete(avis)}
                                className="text-red-600 hover:text-red-900 p-2 rounded"
                                title="Supprimer"
                            >
                                <XCircle className="w-4 h-4" />
                            </button>
                        </div>
                    </div>
                </div>
            ))}
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
                                            ? 'z-10 bg-blue-50 border-blue-500 text-blue-600'
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

// Modal de détails de l'avis
const DetailsModal = ({ avis, onClose, renderStars, getStatutIcon }) => (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-2xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
                {/* Header */}
                <div className="flex items-start justify-between mb-6 pb-4 border-b">
                    <div>
                        <h2 className="text-2xl font-bold text-gray-900">Détails de l'avis</h2>
                        <p className="text-gray-600">Informations complètes sur l'avis client</p>
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
                            <h3 className="text-lg font-semibold text-gray-900 mb-3">Informations client</h3>
                            <div className="space-y-2">
                                <div className="flex justify-between">
                                    <span className="text-gray-600">Nom affiché</span>
                                    <span className="font-medium">{avis.nom_affiche || 'Anonyme'}</span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-gray-600">Client</span>
                                    <span className="font-medium">{avis.client_detaille?.nom} {avis.client_detaille?.prenom}</span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-gray-600">Type</span>
                                    <span className="font-medium capitalize">{avis.client_detaille?.type_client}</span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-gray-600">Ville</span>
                                    <span className="font-medium">{avis.client_detaille?.ville}</span>
                                </div>
                            </div>
                        </div>

                        <div className="bg-gray-50 p-4 rounded-lg">
                            <h3 className="text-lg font-semibold text-gray-900 mb-3">Notes détaillées</h3>
                            <div className="space-y-3">
                                <div className="flex justify-between items-center">
                                    <span className="text-gray-600">Note globale</span>
                                    <div className="flex items-center space-x-2">
                                        <div className="flex items-center space-x-1">
                                            {renderStars(avis.note_globale)}
                                        </div>
                                        <span className="font-bold text-lg">{avis.note_globale}/5</span>
                                    </div>
                                </div>
                                {avis.note_qualite && (
                                    <div className="flex justify-between items-center">
                                        <span className="text-gray-600">Qualité</span>
                                        <div className="flex items-center space-x-1">
                                            {renderStars(avis.note_qualite)}
                                            <span className="ml-2">{avis.note_qualite}/5</span>
                                        </div>
                                    </div>
                                )}
                                {avis.note_livraison && (
                                    <div className="flex justify-between items-center">
                                        <span className="text-gray-600">Livraison</span>
                                        <div className="flex items-center space-x-1">
                                            {renderStars(avis.note_livraison)}
                                            <span className="ml-2">{avis.note_livraison}/5</span>
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>

                    {/* Contenu et statut */}
                    <div className="space-y-4">
                        <div className="bg-gray-50 p-4 rounded-lg">
                            <h3 className="text-lg font-semibold text-gray-900 mb-3">Contenu de l'avis</h3>
                            {avis.titre && (
                                <div className="mb-3">
                                    <span className="text-sm text-gray-600">Titre :</span>
                                    <p className="font-medium">{avis.titre}</p>
                                </div>
                            )}
                            <div>
                                <span className="text-sm text-gray-600">Commentaire :</span>
                                <p className="mt-1">{avis.commentaire}</p>
                            </div>
                        </div>

                        <div className="bg-gray-50 p-4 rounded-lg">
                            <h3 className="text-lg font-semibold text-gray-900 mb-3">Statut et modération</h3>
                            <div className="space-y-2">
                                <div className="flex justify-between items-center">
                                    <span className="text-gray-600">Statut</span>
                                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${avis.statut_color}`}>
                                        {getStatutIcon(avis.statut)}
                                        <span className="ml-1">{avis.statut_label}</span>
                                    </span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-gray-600">Vérifié</span>
                                    <span className={`font-medium ${avis.avis_verifie ? 'text-green-600' : 'text-gray-600'}`}>
                                        {avis.avis_verifie ? 'Oui' : 'Non'}
                                    </span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-gray-600">Mis en avant</span>
                                    <span className={`font-medium ${avis.est_mis_en_avant ? 'text-yellow-600' : 'text-gray-600'}`}>
                                        {avis.est_mis_en_avant ? 'Oui' : 'Non'}
                                    </span>
                                </div>
                                {avis.date_moderation && (
                                    <div className="flex justify-between">
                                        <span className="text-gray-600">Modéré le</span>
                                        <span className="font-medium">{avis.date_moderation}</span>
                                    </div>
                                )}
                                {avis.raison_rejet && (
                                    <div>
                                        <span className="text-sm text-gray-600">Raison du rejet :</span>
                                        <p className="text-red-600 mt-1">{avis.raison_rejet}</p>
                                    </div>
                                )}
                            </div>
                        </div>

                        {avis.reponse_boutique && (
                            <div className="bg-blue-50 p-4 rounded-lg">
                                <h3 className="text-lg font-semibold text-gray-900 mb-3">Réponse de la boutique</h3>
                                <p className="text-gray-700">{avis.reponse_boutique}</p>
                                {avis.date_reponse && (
                                    <p className="text-sm text-gray-500 mt-2">
                                        Répondu le {avis.date_reponse} par {avis.repondu_par}
                                    </p>
                                )}
                            </div>
                        )}
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

// Modal de réponse à un avis
const ResponseModal = ({ avis, responseText, setResponseText, onSubmit, onClose, loading }) => (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full">
            <div className="p-6">
                {/* Header */}
                <div className="flex items-center justify-between mb-6 pb-4 border-b">
                    <div>
                        <h2 className="text-2xl font-bold text-gray-900">Répondre à l'avis</h2>
                        <p className="text-gray-600">Ajoutez une réponse publique à cet avis</p>
                    </div>
                    <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
                        <X className="w-6 h-6" />
                    </button>
                </div>

                {/* Avis original */}
                <div className="bg-gray-50 p-4 rounded-lg mb-6">
                    <div className="flex items-center space-x-2 mb-2">
                        <span className="font-medium">{avis.nom_affiche}</span>
                        <div className="flex items-center space-x-1">
                            {Array.from({ length: 5 }, (_, i) => (
                                <Star
                                    key={i}
                                    className={`w-4 h-4 ${
                                        i < avis.note_globale ? 'text-yellow-400 fill-current' : 'text-gray-300'
                                    }`}
                                />
                            ))}
                        </div>
                    </div>
                    <p className="text-gray-700">{avis.commentaire}</p>
                </div>

                {/* Formulaire de réponse */}
                <div className="mb-6">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                        Votre réponse *
                    </label>
                    <textarea
                        value={responseText}
                        onChange={(e) => setResponseText(e.target.value)}
                        rows="5"
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        placeholder="Écrivez votre réponse publique à cet avis..."
                    />
                    <p className="text-sm text-gray-500 mt-1">
                        Minimum 10 caractères. Cette réponse sera visible publiquement.
                    </p>
                </div>

                {/* Boutons */}
                <div className="flex space-x-3">
                    <button
                        onClick={onSubmit}
                        disabled={loading || responseText.length < 10}
                        className="flex-1 bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 disabled:opacity-50 flex items-center justify-center space-x-2"
                    >
                        {loading ? (
                            <>
                                <RefreshCw className="w-4 h-4 animate-spin" />
                                <span>Envoi...</span>
                            </>
                        ) : (
                            <span>Publier la réponse</span>
                        )}
                    </button>
                    
                    <button
                        onClick={onClose}
                        disabled={loading}
                        className="px-6 py-3 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 disabled:opacity-50"
                    >
                        Annuler
                    </button>
                </div>
            </div>
        </div>
    </div>
);

export default AvisClients;