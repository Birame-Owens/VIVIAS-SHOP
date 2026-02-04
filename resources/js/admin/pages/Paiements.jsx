import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { 
    Plus, 
    Search, 
    Eye,
    RefreshCw,
    X,
    Check,
    AlertTriangle,
    CreditCard,
    Smartphone,
    Building2,
    Banknote,
    FileText,
    ChevronLeft,
    ChevronRight,
    Filter,
    Calendar,
    TrendingUp,
    DollarSign,
    Clock,
    CheckCircle,
    XCircle,
    RotateCcw,
    ExternalLink,
    User,
    Package,
    Trash2,
    Download
} from 'lucide-react';
import { toast } from 'react-hot-toast';

const Paiements = () => {
    const { token } = useAuth();
    const [paiements, setPaiements] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [statutFilter, setStatutFilter] = useState('');
    const [methodeFilter, setMethodeFilter] = useState('');
    const [currentPage, setCurrentPage] = useState(1);
    const [pagination, setPagination] = useState({});
    const [showModal, setShowModal] = useState(false);
    const [selectedPaiement, setSelectedPaiement] = useState(null);
    const [showFormModal, setShowFormModal] = useState(false);
    const [stats, setStats] = useState({});
    const [paymentMethods, setPaymentMethods] = useState([]);
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

    // Charger les paiements
    const loadPaiements = async () => {
        try {
            setLoading(true);
            const params = new URLSearchParams({
                page: currentPage,
                per_page: 15,
                search: searchTerm
            });

            if (statutFilter) params.append('statut', statutFilter);
            if (methodeFilter) params.append('methode', methodeFilter);

            const response = await fetch(`${API_BASE}/paiements?${params}`, {
                headers: getHeaders()
            });

            if (!response.ok) throw new Error('Erreur lors du chargement');

            const result = await response.json();
            if (result.success) {
                setPaiements(result.data.paiements);
                setPagination(result.data.pagination);
            }
        } catch (error) {
            console.error('Erreur:', error);
            toast.error('Erreur lors du chargement des paiements');
        } finally {
            setLoading(false);
        }
    };

    // Charger les statistiques
    const loadStats = async () => {
        try {
            const response = await fetch(`${API_BASE}/paiements/stats`, {
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

    // Charger les méthodes de paiement
    const loadPaymentMethods = async () => {
        try {
            const response = await fetch(`${API_BASE}/paiements/payment-methods`, {
                headers: getHeaders()
            });

            if (!response.ok) throw new Error('Erreur lors du chargement');

            const result = await response.json();
            if (result.success) {
                setPaymentMethods(result.data);
            }
        } catch (error) {
            console.error('Erreur méthodes:', error);
        }
    };

    useEffect(() => {
        loadPaiements();
    }, [currentPage, searchTerm, statutFilter, methodeFilter]);

    useEffect(() => {
        loadStats();
        loadPaymentMethods();
    }, []);

    // Gérer la recherche
    const handleSearch = (e) => {
        setSearchTerm(e.target.value);
        setCurrentPage(1);
    };

    // Voir les détails d'un paiement
    const viewPaiement = async (paiement) => {
        try {
            const response = await fetch(`${API_BASE}/paiements/${paiement.id}`, {
                headers: getHeaders()
            });

            if (!response.ok) throw new Error('Erreur lors du chargement');

            const result = await response.json();
            if (result.success) {
                setSelectedPaiement(result.data.paiement);
                setShowModal(true);
            }
        } catch (error) {
            console.error('Erreur:', error);
            toast.error('Erreur lors du chargement des détails');
        }
    };

    // Confirmer un paiement
    const confirmPaiement = async (paiementId, data = {}) => {
        try {
            setUpdating(true);
            const response = await fetch(`${API_BASE}/paiements/${paiementId}/confirm`, {
                method: 'POST',
                headers: {
                    ...getHeaders(),
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(data)
            });

            const result = await response.json();
            if (result.success) {
                toast.success('Paiement confirmé avec succès');
                loadPaiements();
                loadStats();
                if (selectedPaiement) {
                    setSelectedPaiement(result.data.paiement);
                }
            } else {
                toast.error(result.message);
            }
        } catch (error) {
            console.error('Erreur:', error);
            toast.error('Erreur lors de la confirmation');
        } finally {
            setUpdating(false);
        }
    };

    // Rejeter un paiement
    const rejectPaiement = async (paiementId, raison) => {
        try {
            const response = await fetch(`${API_BASE}/paiements/${paiementId}/reject`, {
                method: 'POST',
                headers: {
                    ...getHeaders(),
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ raison })
            });

            const result = await response.json();
            if (result.success) {
                toast.success('Paiement rejeté avec succès');
                loadPaiements();
                loadStats();
                setShowModal(false);
            } else {
                toast.error(result.message);
            }
        } catch (error) {
            console.error('Erreur:', error);
            toast.error('Erreur lors du rejet');
        }
    };

    // Vérifier le statut
    const checkStatus = async (paiementId) => {
        try {
            setUpdating(true);
            const response = await fetch(`${API_BASE}/paiements/${paiementId}/check-status`, {
                headers: getHeaders()
            });

            const result = await response.json();
            if (result.success) {
                toast.success('Statut mis à jour');
                loadPaiements();
                if (selectedPaiement) {
                    setSelectedPaiement(result.data.paiement);
                }
            } else {
                toast.error(result.message);
            }
        } catch (error) {
            console.error('Erreur:', error);
            toast.error('Erreur lors de la vérification');
        } finally {
            setUpdating(false);
        }
    };

    // Fermer les modaux
    const closeModal = () => {
        setShowModal(false);
        setSelectedPaiement(null);
    };

    const closeFormModal = () => {
        setShowFormModal(false);
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
    const getStatutColor = (statut) => {
        const colors = {
            'en_attente': 'bg-yellow-100 text-yellow-800',
            'en_cours': 'bg-blue-100 text-blue-800',
            'valide': 'bg-green-100 text-green-800',
            'echec': 'bg-red-100 text-red-800',
            'rembourse': 'bg-purple-100 text-purple-800',
            'annule': 'bg-gray-100 text-gray-800'
        };
        return colors[statut] || 'bg-gray-100 text-gray-800';
    };

    // Obtenir l'icône du statut
    const getStatutIcon = (statut) => {
        const icons = {
            'en_attente': Clock,
            'en_cours': RefreshCw,
            'valide': CheckCircle,
            'echec': XCircle,
            'rembourse': RotateCcw,
            'annule': X
        };
        const Icon = icons[statut] || Clock;
        return <Icon className="w-4 h-4" />;
    };

    // Obtenir l'icône de la méthode
    const getMethodeIcon = (methode) => {
        const icons = {
            'carte_bancaire': CreditCard,
            'wave': Smartphone,
            'orange_money': Smartphone,
            'virement': Building2,
            'especes': Banknote,
            'cheque': FileText
        };
        const Icon = icons[methode] || CreditCard;
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
                        <h1 className="text-2xl font-bold text-gray-900">Paiements</h1>
                        <p className="text-gray-600">Gérez tous les paiements et transactions</p>
                    </div>
                    <button
                        onClick={() => setShowFormModal(true)}
                        className="bg-purple-600 text-white px-4 py-2 rounded-lg hover:bg-purple-700 flex items-center space-x-2"
                    >
                        <Plus className="w-4 h-4" />
                        <span>Nouveau paiement</span>
                    </button>
                </div>

                {/* Statistiques rapides */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
                    <div className="bg-white p-4 rounded-lg shadow-sm border">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm text-gray-600">Total paiements</p>
                                <p className="text-2xl font-bold text-gray-900">{stats.total_paiements || 0}</p>
                            </div>
                            <DollarSign className="w-8 h-8 text-purple-500" />
                        </div>
                    </div>
                    
                    <div className="bg-white p-4 rounded-lg shadow-sm border">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm text-gray-600">Validés</p>
                                <p className="text-2xl font-bold text-green-600">{stats.paiements_valides || 0}</p>
                            </div>
                            <CheckCircle className="w-8 h-8 text-green-500" />
                        </div>
                    </div>
                    
                    <div className="bg-white p-4 rounded-lg shadow-sm border">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm text-gray-600">En attente</p>
                                <p className="text-2xl font-bold text-yellow-600">{stats.paiements_en_attente || 0}</p>
                            </div>
                            <Clock className="w-8 h-8 text-yellow-500" />
                        </div>
                    </div>
                    
                    <div className="bg-white p-4 rounded-lg shadow-sm border">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm text-gray-600">Montant total</p>
                                <p className="text-lg font-bold text-blue-600">{formatPrice(stats.montant_total_valide || 0)}</p>
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
                                placeholder="Rechercher un paiement..."
                                value={searchTerm}
                                onChange={handleSearch}
                                className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent w-full md:w-80"
                            />
                        </div>
                        
                        <select
                            value={statutFilter}
                            onChange={(e) => {
                                setStatutFilter(e.target.value);
                                setCurrentPage(1);
                            }}
                            className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                        >
                            <option value="">Tous les statuts</option>
                            <option value="en_attente">En attente</option>
                            <option value="en_cours">En cours</option>
                            <option value="valide">Validé</option>
                            <option value="echec">Échec</option>
                            <option value="rembourse">Remboursé</option>
                        </select>

                        <select
                            value={methodeFilter}
                            onChange={(e) => {
                                setMethodeFilter(e.target.value);
                                setCurrentPage(1);
                            }}
                            className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                        >
                            <option value="">Toutes les méthodes</option>
                            <option value="carte_bancaire">Carte bancaire</option>
                            <option value="wave">Wave</option>
                            <option value="orange_money">Orange Money</option>
                            <option value="virement">Virement</option>
                            <option value="especes">Espèces</option>
                            <option value="cheque">Chèque</option>
                        </select>
                        
                        <button
                            onClick={loadPaiements}
                            className="p-2 border border-gray-300 rounded-lg hover:bg-gray-50"
                            title="Actualiser"
                        >
                            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
                        </button>
                    </div>

                    <div className="flex items-center space-x-2">
                        <span className="text-sm text-gray-500">
                            {pagination.total || 0} paiement(s)
                        </span>
                    </div>
                </div>
            </div>

            {/* Liste des paiements */}
            <div className="bg-white rounded-lg shadow-sm border overflow-hidden">
                {loading ? (
                    <div className="p-8 text-center">
                        <RefreshCw className="w-8 h-8 animate-spin mx-auto mb-4 text-gray-400" />
                        <p className="text-gray-500">Chargement des paiements...</p>
                    </div>
                ) : paiements.length === 0 ? (
                    <div className="p-8 text-center">
                        <DollarSign className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                        <h3 className="text-lg font-semibold text-gray-900 mb-2">Aucun paiement trouvé</h3>
                        <p className="text-gray-500">
                            {searchTerm || statutFilter || methodeFilter
                                ? 'Aucun paiement ne correspond à vos critères de recherche.'
                                : 'Aucun paiement n\'a encore été enregistré.'
                            }
                        </p>
                    </div>
                ) : (
                    <div className="overflow-x-auto">
                        <table className="w-full">
                            <thead className="bg-gray-50 border-b">
                                <tr>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Référence
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Client
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Montant
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Méthode
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
                                {paiements.map((paiement) => (
                                    <tr key={paiement.id} className="hover:bg-gray-50">
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <div>
                                                <div className="text-sm font-medium text-gray-900">
                                                    {paiement.reference_paiement}
                                                </div>
                                                {paiement.transaction_id && (
                                                    <div className="text-xs text-gray-500">
                                                        ID: {paiement.transaction_id}
                                                    </div>
                                                )}
                                                <div className="text-xs text-gray-500">
                                                    {paiement.commande?.numero_commande || 'Commande supprimée'}
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <div>
                                                <div className="text-sm font-medium text-gray-900">
                                                    {paiement.client?.nom_complet || 'Client supprimé'}
                                                </div>
                                                <div className="text-sm text-gray-500">
                                                    {paiement.client?.telephone || '-'}
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <div className="text-sm font-medium text-gray-900">
                                                {formatPrice(paiement.montant)}
                                            </div>
                                            {paiement.est_acompte && (
                                                <span className="inline-flex items-center px-2 py-1 rounded-full text-xs bg-orange-100 text-orange-800">
                                                    Acompte
                                                </span>
                                            )}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <div className="flex items-center">
                                                {getMethodeIcon(paiement.methode_paiement)}
                                                <span className="ml-2 text-sm text-gray-900">
                                                    {paiement.methode_label}
                                                </span>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatutColor(paiement.statut)}`}>
                                                {getStatutIcon(paiement.statut)}
                                                <span className="ml-1">{paiement.statut_label}</span>
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                            <div>{paiement.date_initiation}</div>
                                            {paiement.date_validation && (
                                                <div className="text-xs text-green-600">
                                                    Validé: {paiement.date_validation}
                                                </div>
                                            )}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                                            <div className="flex items-center space-x-2">
                                                <button
                                                    onClick={() => viewPaiement(paiement)}
                                                    className="text-purple-600 hover:text-purple-900 p-1 rounded"
                                                    title="Voir les détails"
                                                >
                                                    <Eye className="w-4 h-4" />
                                                </button>
                                                {(paiement.methode_paiement === 'wave' || paiement.methode_paiement === 'orange_money') && 
                                                 paiement.statut === 'en_cours' && (
                                                    <button
                                                        onClick={() => checkStatus(paiement.id)}
                                                        className="text-blue-600 hover:text-blue-900 p-1 rounded"
                                                        title="Vérifier le statut"
                                                        disabled={updating}
                                                    >
                                                        <RefreshCw className={`w-4 h-4 ${updating ? 'animate-spin' : ''}`} />
                                                    </button>
                                                )}
                                                {paiement.statut === 'en_attente' && (
                                                    <button
                                                        onClick={() => confirmPaiement(paiement.id)}
                                                        className="text-green-600 hover:text-green-900 p-1 rounded"
                                                        title="Confirmer"
                                                        disabled={updating}
                                                    >
                                                        <Check className="w-4 h-4" />
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

            {/* Modal détails paiement */}
            {showModal && selectedPaiement && (
                <PaiementDetailsModal
                    paiement={selectedPaiement}
                    onClose={closeModal}
                    onConfirm={confirmPaiement}
                    onReject={rejectPaiement}
                    onCheckStatus={checkStatus}
                    updating={updating}
                    formatPrice={formatPrice}
                    getStatutColor={getStatutColor}
                    getStatutIcon={getStatutIcon}
                    getMethodeIcon={getMethodeIcon}
                />
            )}

            {/* Modal formulaire paiement */}
            {showFormModal && (
                <PaiementFormModal
                    onClose={closeFormModal}
                    paymentMethods={paymentMethods}
                    onSuccess={() => {
                        loadPaiements();
                        loadStats();
                        closeFormModal();
                    }}
                    formatPrice={formatPrice}
                    getHeaders={getHeaders}
                    API_BASE={API_BASE}
                />
            )}
        </div>
    );
};

// Composant Modal de détails
const PaiementDetailsModal = ({ 
    paiement, 
    onClose, 
    onConfirm, 
    onReject, 
    onCheckStatus, 
    updating, 
    formatPrice, 
    getStatutColor, 
    getStatutIcon, 
    getMethodeIcon 
}) => {
    const [showConfirmDialog, setShowConfirmDialog] = useState(false);
    const [showRejectDialog, setShowRejectDialog] = useState(false);
    const [rejectReason, setRejectReason] = useState('');
    const [confirmData, setConfirmData] = useState({
        code_autorisation: '',
        notes_admin: ''
    });

    const handleConfirm = () => {
        onConfirm(paiement.id, confirmData);
        setShowConfirmDialog(false);
    };

    const handleReject = () => {
        if (rejectReason.trim()) {
            onReject(paiement.id, rejectReason);
            setShowRejectDialog(false);
        } else {
            toast.error('Veuillez indiquer une raison pour le rejet');
        }
    };

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
            <div className="bg-white rounded-2xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
                <div className="p-6">
                    {/* Header */}
                    <div className="flex items-center justify-between mb-6 pb-4 border-b">
                        <div>
                            <h2 className="text-2xl font-bold text-gray-900">Détails du paiement</h2>
                            <p className="text-gray-600">{paiement.reference_paiement}</p>
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
                                <h3 className="text-lg font-semibold text-gray-900 mb-3">Informations générales</h3>
                                <div className="space-y-3">
                                    <div className="flex justify-between">
                                        <span className="text-gray-600">Référence</span>
                                        <span className="font-medium">{paiement.reference_paiement}</span>
                                    </div>
                                    {paiement.transaction_id && (
                                        <div className="flex justify-between">
                                            <span className="text-gray-600">Transaction ID</span>
                                            <span className="font-medium text-sm">{paiement.transaction_id}</span>
                                        </div>
                                    )}
                                    <div className="flex justify-between">
                                        <span className="text-gray-600">Montant</span>
                                        <span className="font-bold text-lg">{formatPrice(paiement.montant)}</span>
                                    </div>
                                    <div className="flex justify-between items-center">
                                        <span className="text-gray-600">Méthode</span>
                                        <div className="flex items-center">
                                            {getMethodeIcon(paiement.methode_paiement)}
                                            <span className="ml-2 font-medium">{paiement.methode_label}</span>
                                        </div>
                                    </div>
                                    <div className="flex justify-between items-center">
                                        <span className="text-gray-600">Statut</span>
                                        <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${getStatutColor(paiement.statut)}`}>
                                            {getStatutIcon(paiement.statut)}
                                            <span className="ml-1">{paiement.statut_label}</span>
                                        </span>
                                    </div>
                                    {paiement.est_acompte && (
                                        <>
                                            <div className="flex justify-between">
                                                <span className="text-gray-600">Type</span>
                                                <span className="bg-orange-100 text-orange-800 px-2 py-1 rounded text-sm">Acompte</span>
                                            </div>
                                            <div className="flex justify-between">
                                                <span className="text-gray-600">Montant restant</span>
                                                <span className="font-medium">{formatPrice(paiement.montant_restant)}</span>
                                            </div>
                                        </>
                                    )}
                                    {paiement.numero_telephone && (
                                        <div className="flex justify-between">
                                            <span className="text-gray-600">Téléphone</span>
                                            <span className="font-medium">{paiement.numero_telephone}</span>
                                        </div>
                                    )}
                                </div>
                            </div>

                            {/* Dates */}
                            <div className="bg-gray-50 p-4 rounded-lg">
                                <h3 className="text-lg font-semibold text-gray-900 mb-3">Dates importantes</h3>
                                <div className="space-y-3">
                                    <div className="flex justify-between">
                                        <span className="text-gray-600">Initiation</span>
                                        <span className="font-medium">{paiement.date_initiation}</span>
                                    </div>
                                    {paiement.date_validation && (
                                        <div className="flex justify-between">
                                            <span className="text-gray-600">Validation</span>
                                            <span className="font-medium text-green-600">{paiement.date_validation}</span>
                                        </div>
                                    )}
                                    {paiement.date_echeance && (
                                        <div className="flex justify-between">
                                            <span className="text-gray-600">Échéance</span>
                                            <span className="font-medium">{paiement.date_echeance}</span>
                                        </div>
                                    )}
                                    {paiement.date_remboursement && (
                                        <div className="flex justify-between">
                                            <span className="text-gray-600">Remboursement</span>
                                            <span className="font-medium text-purple-600">{paiement.date_remboursement}</span>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>

                        {/* Client et commande */}
                        <div className="space-y-4">
                            <div className="bg-gray-50 p-4 rounded-lg">
                                <h3 className="text-lg font-semibold text-gray-900 mb-3">Client</h3>
                                <div className="space-y-3">
                                    <div className="flex justify-between">
                                        <span className="text-gray-600">Nom</span>
                                        <span className="font-medium">{paiement.client.nom_complet}</span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span className="text-gray-600">Téléphone</span>
                                        <span className="font-medium">{paiement.client.telephone}</span>
                                    </div>
                                    {paiement.client.email && (
                                        <div className="flex justify-between">
                                            <span className="text-gray-600">Email</span>
                                            <span className="font-medium">{paiement.client.email}</span>
                                        </div>
                                    )}
                                </div>
                            </div>

                            {paiement.commande && (
                                <div className="bg-gray-50 p-4 rounded-lg">
                                    <h3 className="text-lg font-semibold text-gray-900 mb-3">Commande</h3>
                                    <div className="space-y-3">
                                        <div className="flex justify-between">
                                            <span className="text-gray-600">Numéro</span>
                                            <span className="font-medium">{paiement.commande.numero_commande}</span>
                                        </div>
                                        <div className="flex justify-between">
                                            <span className="text-gray-600">Montant total</span>
                                            <span className="font-bold">{formatPrice(paiement.commande.montant_total)}</span>
                                        </div>
                                    </div>
                                </div>
                            )}
                            
                            {!paiement.commande && (
                                <div className="bg-yellow-50 border border-yellow-200 p-4 rounded-lg">
                                    <p className="text-yellow-800 text-sm">⚠️ La commande associée a été supprimée</p>
                                </div>
                            )}

                            {/* Messages et notes */}
                            {(paiement.message_retour || paiement.notes_admin || paiement.commentaire_client) && (
                                <div className="bg-gray-50 p-4 rounded-lg">
                                    <h3 className="text-lg font-semibold text-gray-900 mb-3">Messages et notes</h3>
                                    <div className="space-y-3">
                                        {paiement.message_retour && (
                                            <div>
                                                <span className="text-gray-600 text-sm">Message de retour</span>
                                                <p className="text-gray-900 bg-white p-2 rounded border text-sm">
                                                    {paiement.message_retour}
                                                </p>
                                            </div>
                                        )}
                                        {paiement.notes_admin && (
                                            <div>
                                                <span className="text-gray-600 text-sm">Notes administratives</span>
                                                <p className="text-gray-900 bg-white p-2 rounded border text-sm">
                                                    {paiement.notes_admin}
                                                </p>
                                            </div>
                                        )}
                                        {paiement.commentaire_client && (
                                            <div>
                                                <span className="text-gray-600 text-sm">Commentaire client</span>
                                                <p className="text-gray-900 bg-white p-2 rounded border text-sm">
                                                    {paiement.commentaire_client}
                                                </p>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Paiements liés */}
                    {paiement.paiements_lies && paiement.paiements_lies.length > 0 && (
                        <div className="mt-6 bg-gray-50 p-4 rounded-lg">
                            <h3 className="text-lg font-semibold text-gray-900 mb-3">Paiements liés</h3>
                            <div className="space-y-2">
                                {paiement.paiements_lies.map((p, index) => (
                                    <div key={index} className="flex justify-between items-center bg-white p-2 rounded border">
                                        <div>
                                            <span className="font-medium">{p.reference}</span>
                                            <span className="text-gray-500 text-sm ml-2">({p.date})</span>
                                        </div>
                                        <div className="flex items-center space-x-2">
                                            <span className="font-medium">{formatPrice(p.montant)}</span>
                                            <span className={`px-2 py-1 rounded text-xs ${getStatutColor(p.statut)}`}>
                                                {p.statut}
                                            </span>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* Actions */}
                    <div className="flex flex-wrap gap-3 mt-6 pt-4 border-t">
                        {paiement.statut === 'en_attente' && (
                            <>
                                <button
                                    onClick={() => setShowConfirmDialog(true)}
                                    disabled={updating}
                                    className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 flex items-center space-x-2 disabled:opacity-50"
                                >
                                    <Check className="w-4 h-4" />
                                    <span>Confirmer</span>
                                </button>
                                <button
                                    onClick={() => setShowRejectDialog(true)}
                                    disabled={updating}
                                    className="bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 flex items-center space-x-2 disabled:opacity-50"
                                >
                                    <X className="w-4 h-4" />
                                    <span>Rejeter</span>
                                </button>
                            </>
                        )}
                        
                        {(paiement.methode_paiement === 'wave' || paiement.methode_paiement === 'orange_money') && 
                         paiement.statut === 'en_cours' && (
                            <button
                                onClick={() => onCheckStatus(paiement.id)}
                                disabled={updating}
                                className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 flex items-center space-x-2 disabled:opacity-50"
                            >
                                <RefreshCw className={`w-4 h-4 ${updating ? 'animate-spin' : ''}`} />
                                <span>Vérifier le statut</span>
                            </button>
                        )}

                        <button
                            onClick={onClose}
                            className="bg-gray-600 text-white px-4 py-2 rounded-lg hover:bg-gray-700 flex items-center space-x-2"
                        >
                            <span>Fermer</span>
                        </button>
                    </div>
                </div>
            </div>

            {/* Dialog de confirmation */}
            {showConfirmDialog && (
                <div className="fixed inset-0 bg-black bg-opacity-75 z-60 flex items-center justify-center p-4">
                    <div className="bg-white rounded-lg shadow-xl max-w-md w-full p-6">
                        <h3 className="text-lg font-semibold text-gray-900 mb-4">Confirmer le paiement</h3>
                        <div className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Code d'autorisation (optionnel)
                                </label>
                                <input
                                    type="text"
                                    value={confirmData.code_autorisation}
                                    onChange={(e) => setConfirmData({...confirmData, code_autorisation: e.target.value})}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500"
                                    placeholder="Code d'autorisation"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Notes administratives (optionnel)
                                </label>
                                <textarea
                                    value={confirmData.notes_admin}
                                    onChange={(e) => setConfirmData({...confirmData, notes_admin: e.target.value})}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500"
                                    rows="3"
                                    placeholder="Notes ou commentaires..."
                                />
                            </div>
                        </div>
                        <div className="flex space-x-3 mt-6">
                            <button
                                onClick={handleConfirm}
                                className="flex-1 bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700"
                            >
                                Confirmer
                            </button>
                            <button
                                onClick={() => setShowConfirmDialog(false)}
                                className="flex-1 bg-gray-300 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-400"
                            >
                                Annuler
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Dialog de rejet */}
            {showRejectDialog && (
                <div className="fixed inset-0 bg-black bg-opacity-75 z-60 flex items-center justify-center p-4">
                    <div className="bg-white rounded-lg shadow-xl max-w-md w-full p-6">
                        <h3 className="text-lg font-semibold text-gray-900 mb-4">Rejeter le paiement</h3>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                Raison du rejet *
                            </label>
                            <textarea
                                value={rejectReason}
                                onChange={(e) => setRejectReason(e.target.value)}
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500"
                                rows="4"
                                placeholder="Indiquez la raison du rejet..."
                                required
                            />
                        </div>
                        <div className="flex space-x-3 mt-6">
                            <button
                                onClick={handleReject}
                                className="flex-1 bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700"
                            >
                                Rejeter
                            </button>
                            <button
                                onClick={() => setShowRejectDialog(false)}
                                className="flex-1 bg-gray-300 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-400"
                            >
                                Annuler
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

// Composant Modal de formulaire
const PaiementFormModal = ({ 
    onClose, 
    paymentMethods, 
    onSuccess, 
    formatPrice, 
    getHeaders, 
    API_BASE 
}) => {
    const [formData, setFormData] = useState({
        commande_id: '',
        client_id: '',
        montant: '',
        methode_paiement: '',
        numero_telephone: '',
        est_acompte: false,
        montant_restant: '',
        date_echeance: '',
        commentaire_client: '',
        notes_admin: '',
        // Données carte
        card_number: '',
        card_expiry: '',
        card_cvv: '',
        card_holder_name: ''
    });
    const [errors, setErrors] = useState({});
    const [loading, setLoading] = useState(false);
    const [commandes, setCommandes] = useState([]);
    const [clients, setClients] = useState([]);
    const [loadingCommandes, setLoadingCommandes] = useState(false);
    const [loadingClients, setLoadingClients] = useState(false);

    // Charger les commandes
    const loadCommandes = async () => {
        try {
            setLoadingCommandes(true);
            const response = await fetch(`${API_BASE}/commandes?per_page=100&statut_paiement=impaye,partiel`, {
                headers: getHeaders()
            });
            
            if (!response.ok) throw new Error('Erreur lors du chargement');
            
            const result = await response.json();
            if (result.success) {
                setCommandes(result.data.commandes || []);
            }
        } catch (error) {
            console.error('Erreur:', error);
            toast.error('Erreur lors du chargement des commandes');
        } finally {
            setLoadingCommandes(false);
        }
    };

    // Charger les clients
    const loadClients = async () => {
        try {
            setLoadingClients(true);
            const response = await fetch(`${API_BASE}/clients?per_page=100`, {
                headers: getHeaders()
            });
            
            if (!response.ok) throw new Error('Erreur lors du chargement');
            
            const result = await response.json();
            if (result.success) {
                setClients(result.data.clients || []);
            }
        } catch (error) {
            console.error('Erreur:', error);
            toast.error('Erreur lors du chargement des clients');
        } finally {
            setLoadingClients(false);
        }
    };

    useEffect(() => {
        loadCommandes();
        loadClients();
    }, []);

    // Gérer les changements du formulaire
    const handleChange = (e) => {
        const { name, value, type, checked } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: type === 'checkbox' ? checked : value
        }));

        // Effacer l'erreur du champ modifié
        if (errors[name]) {
            setErrors(prev => ({
                ...prev,
                [name]: null
            }));
        }
    };

    // Soumettre le formulaire
    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setErrors({});

        try {
            const response = await fetch(`${API_BASE}/paiements`, {
                method: 'POST',
                headers: {
                    ...getHeaders(),
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(formData)
            });

            const result = await response.json();
            
            if (result.success) {
                toast.success('Paiement créé avec succès');
                onSuccess();
            } else {
                if (result.errors) {
                    setErrors(result.errors);
                } else {
                    toast.error(result.message || 'Erreur lors de la création');
                }
            }
        } catch (error) {
            console.error('Erreur:', error);
            toast.error('Erreur lors de la création du paiement');
        } finally {
            setLoading(false);
        }
    };

    // Obtenir la commande sélectionnée
    const selectedCommande = commandes.find(c => c.id === parseInt(formData.commande_id));

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
            <div className="bg-white rounded-2xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
                <form onSubmit={handleSubmit} className="p-6">
                    {/* Header */}
                    <div className="flex items-center justify-between mb-6 pb-4 border-b">
                        <div>
                            <h2 className="text-2xl font-bold text-gray-900">Nouveau paiement</h2>
                            <p className="text-gray-600">Créer un nouveau paiement pour une commande</p>
                        </div>
                        <button
                            type="button"
                            onClick={onClose}
                            className="text-gray-400 hover:text-gray-600 p-2 rounded-lg"
                        >
                            <X className="w-6 h-6" />
                        </button>
                    </div>

                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                        {/* Informations de base */}
                        <div className="space-y-4">
                            <h3 className="text-lg font-semibold text-gray-900">Informations de base</h3>
                            
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Commande *
                                </label>
                                <select
                                    name="commande_id"
                                    value={formData.commande_id}
                                    onChange={handleChange}
                                    className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-purple-500 ${
                                        errors.commande_id ? 'border-red-500' : 'border-gray-300'
                                    }`}
                                    required
                                    disabled={loadingCommandes}
                                >
                                    <option value="">
                                        {loadingCommandes ? 'Chargement...' : 'Sélectionner une commande'}
                                    </option>
                                    {commandes.map(commande => (
                                        <option key={commande.id} value={commande.id}>
                                            {commande.numero_commande} - {formatPrice(commande.montant_total)}
                                            {commande.client && ` (${commande.client.nom_complet})`}
                                        </option>
                                    ))}
                                </select>
                                {errors.commande_id && (
                                    <p className="text-red-500 text-sm mt-1">{errors.commande_id}</p>
                                )}
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Client *
                                </label>
                                <select
                                    name="client_id"
                                    value={formData.client_id}
                                    onChange={handleChange}
                                    className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-purple-500 ${
                                        errors.client_id ? 'border-red-500' : 'border-gray-300'
                                    }`}
                                    required
                                    disabled={loadingClients}
                                >
                                    <option value="">
                                        {loadingClients ? 'Chargement...' : 'Sélectionner un client'}
                                    </option>
                                    {clients.map(client => (
                                        <option key={client.id} value={client.id}>
                                            {client.nom} {client.prenom} - {client.telephone}
                                        </option>
                                    ))}
                                </select>
                                {errors.client_id && (
                                    <p className="text-red-500 text-sm mt-1">{errors.client_id}</p>
                                )}
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Montant (XOF) *
                                </label>
                                <input
                                    type="number"
                                    name="montant"
                                    value={formData.montant}
                                    onChange={handleChange}
                                    min="100"
                                    step="1"
                                    className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-purple-500 ${
                                        errors.montant ? 'border-red-500' : 'border-gray-300'
                                    }`}
                                    placeholder="0"
                                    required
                                />
                                {selectedCommande && (
                                    <p className="text-sm text-gray-500 mt-1">
                                        Montant commande: {formatPrice(selectedCommande.montant_total)}
                                    </p>
                                )}
                                {errors.montant && (
                                    <p className="text-red-500 text-sm mt-1">{errors.montant}</p>
                                )}
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Méthode de paiement *
                                </label>
                                <select
                                    name="methode_paiement"
                                    value={formData.methode_paiement}
                                    onChange={handleChange}
                                    className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-purple-500 ${
                                        errors.methode_paiement ? 'border-red-500' : 'border-gray-300'
                                    }`}
                                    required
                                >
                                    <option value="">Sélectionner une méthode</option>
                                    {paymentMethods
                                        .filter(method => method.active)
                                        .map(method => (
                                            <option key={method.value} value={method.value}>
                                                {method.label}
                                                {method.fees > 0 && ` (${method.fees}% de frais)`}
                                            </option>
                                        ))
                                    }
                                </select>
                                {errors.methode_paiement && (
                                    <p className="text-red-500 text-sm mt-1">{errors.methode_paiement}</p>
                                )}
                            </div>

                            {/* Champ téléphone pour Wave/Orange Money */}
                            {(formData.methode_paiement === 'wave' || formData.methode_paiement === 'orange_money') && (
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        Numéro de téléphone *
                                    </label>
                                    <input
                                        type="tel"
                                        name="numero_telephone"
                                        value={formData.numero_telephone}
                                        onChange={handleChange}
                                        className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-purple-500 ${
                                            errors.numero_telephone ? 'border-red-500' : 'border-gray-300'
                                        }`}
                                        placeholder="77 123 45 67"
                                        required
                                    />
                                    {errors.numero_telephone && (
                                        <p className="text-red-500 text-sm mt-1">{errors.numero_telephone}</p>
                                    )}
                                </div>
                            )}
                        </div>

                        {/* Options et détails */}
                        <div className="space-y-4">
                            <h3 className="text-lg font-semibold text-gray-900">Options et détails</h3>
                            
                            {/* Acompte */}
                            <div className="flex items-center">
                                <input
                                    type="checkbox"
                                    name="est_acompte"
                                    checked={formData.est_acompte}
                                    onChange={handleChange}
                                    className="h-4 w-4 text-purple-600 focus:ring-purple-500 border-gray-300 rounded"
                                />
                                <label className="ml-2 text-sm text-gray-700">
                                    Il s'agit d'un acompte (paiement partiel)
                                </label>
                            </div>

                            {formData.est_acompte && (
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        Montant restant (XOF) *
                                    </label>
                                    <input
                                        type="number"
                                        name="montant_restant"
                                        value={formData.montant_restant}
                                        onChange={handleChange}
                                        min="0"
                                        step="1"
                                        className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-purple-500 ${
                                            errors.montant_restant ? 'border-red-500' : 'border-gray-300'
                                        }`}
                                        placeholder="0"
                                        required={formData.est_acompte}
                                    />
                                    {errors.montant_restant && (
                                        <p className="text-red-500 text-sm mt-1">{errors.montant_restant}</p>
                                    )}
                                </div>
                            )}

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Date d'échéance
                                </label>
                                <input
                                    type="date"
                                    name="date_echeance"
                                    value={formData.date_echeance}
                                    onChange={handleChange}
                                    min={new Date().toISOString().split('T')[0]}
                                    className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-purple-500 ${
                                        errors.date_echeance ? 'border-red-500' : 'border-gray-300'
                                    }`}
                                />
                                {errors.date_echeance && (
                                    <p className="text-red-500 text-sm mt-1">{errors.date_echeance}</p>
                                )}
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Commentaire client
                                </label>
                                <textarea
                                    name="commentaire_client"
                                    value={formData.commentaire_client}
                                    onChange={handleChange}
                                    rows="3"
                                    className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-purple-500 ${
                                        errors.commentaire_client ? 'border-red-500' : 'border-gray-300'
                                    }`}
                                    placeholder="Commentaire ou instruction du client..."
                                />
                                {errors.commentaire_client && (
                                    <p className="text-red-500 text-sm mt-1">{errors.commentaire_client}</p>
                                )}
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Notes administratives
                                </label>
                                <textarea
                                    name="notes_admin"
                                    value={formData.notes_admin}
                                    onChange={handleChange}
                                    rows="3"
                                    className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-purple-500 ${
                                        errors.notes_admin ? 'border-red-500' : 'border-gray-300'
                                    }`}
                                    placeholder="Notes internes sur ce paiement..."
                                />
                                {errors.notes_admin && (
                                    <p className="text-red-500 text-sm mt-1">{errors.notes_admin}</p>
                                )}
                            </div>
                        </div>
                    </div>

                    {/* Champs spécifiques carte bancaire */}
                    {formData.methode_paiement === 'carte_bancaire' && (
                        <div className="mt-6 p-4 bg-gray-50 rounded-lg">
                            <h3 className="text-lg font-semibold text-gray-900 mb-4">Informations de la carte</h3>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div className="md:col-span-2">
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        Numéro de carte *
                                    </label>
                                    <input
                                        type="text"
                                        name="card_number"
                                        value={formData.card_number}
                                        onChange={handleChange}
                                        className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-purple-500 ${
                                            errors.card_number ? 'border-red-500' : 'border-gray-300'
                                        }`}
                                        placeholder="1234 5678 9012 3456"
                                        maxLength="19"
                                        required={formData.methode_paiement === 'carte_bancaire'}
                                    />
                                    {errors.card_number && (
                                        <p className="text-red-500 text-sm mt-1">{errors.card_number}</p>
                                    )}
                                </div>
                                
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        Date d'expiration *
                                    </label>
                                    <input
                                        type="text"
                                        name="card_expiry"
                                        value={formData.card_expiry}
                                        onChange={handleChange}
                                        className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-purple-500 ${
                                            errors.card_expiry ? 'border-red-500' : 'border-gray-300'
                                        }`}
                                        placeholder="MM/AA"
                                        maxLength="5"
                                        required={formData.methode_paiement === 'carte_bancaire'}
                                    />
                                    {errors.card_expiry && (
                                        <p className="text-red-500 text-sm mt-1">{errors.card_expiry}</p>
                                    )}
                                </div>
                                
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        Code CVV *
                                    </label>
                                    <input
                                        type="text"
                                        name="card_cvv"
                                        value={formData.card_cvv}
                                        onChange={handleChange}
                                        className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-purple-500 ${
                                            errors.card_cvv ? 'border-red-500' : 'border-gray-300'
                                        }`}
                                        placeholder="123"
                                        maxLength="4"
                                        required={formData.methode_paiement === 'carte_bancaire'}
                                    />
                                    {errors.card_cvv && (
                                        <p className="text-red-500 text-sm mt-1">{errors.card_cvv}</p>
                                    )}
                                </div>
                                
                                <div className="md:col-span-2">
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        Nom du porteur *
                                    </label>
                                    <input
                                        type="text"
                                        name="card_holder_name"
                                        value={formData.card_holder_name}
                                        onChange={handleChange}
                                        className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-purple-500 ${
                                            errors.card_holder_name ? 'border-red-500' : 'border-gray-300'
                                        }`}
                                        placeholder="Nom comme sur la carte"
                                        required={formData.methode_paiement === 'carte_bancaire'}
                                    />
                                    {errors.card_holder_name && (
                                        <p className="text-red-500 text-sm mt-1">{errors.card_holder_name}</p>
                                    )}
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Résumé du paiement */}
                    {formData.montant && (
                        <div className="mt-6 p-4 bg-purple-50 rounded-lg">
                            <h3 className="text-lg font-semibold text-gray-900 mb-2">Résumé du paiement</h3>
                            <div className="space-y-2">
                                <div className="flex justify-between">
                                    <span className="text-gray-600">Montant à payer</span>
                                    <span className="font-bold text-lg">{formatPrice(formData.montant)}</span>
                                </div>
                                {formData.est_acompte && formData.montant_restant && (
                                    <div className="flex justify-between text-sm">
                                        <span className="text-gray-600">Montant restant</span>
                                        <span className="text-orange-600">{formatPrice(formData.montant_restant)}</span>
                                    </div>
                                )}
                                {formData.methode_paiement && (
                                    <div className="flex justify-between text-sm">
                                        <span className="text-gray-600">Méthode</span>
                                        <span className="text-gray-900">
                                            {paymentMethods.find(m => m.value === formData.methode_paiement)?.label}
                                        </span>
                                    </div>
                                )}
                            </div>
                        </div>
                    )}

                    {/* Boutons */}
                    <div className="flex space-x-3 mt-6 pt-4 border-t">
                        <button
                            type="submit"
                            disabled={loading}
                            className="flex-1 bg-purple-600 text-white px-6 py-3 rounded-lg hover:bg-purple-700 flex items-center justify-center space-x-2 disabled:opacity-50"
                        >
                            {loading ? (
                                <>
                                    <RefreshCw className="w-4 h-4 animate-spin" />
                                    <span>Création en cours...</span>
                                </>
                            ) : (
                                <>
                                    <Plus className="w-4 h-4" />
                                    <span>Créer le paiement</span>
                                </>
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

export default Paiements;