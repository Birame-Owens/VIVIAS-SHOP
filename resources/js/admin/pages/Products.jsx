
import { useAuth } from '../context/AuthContext';
import { 
    Plus, 
    Search, 
    Edit, 
    Trash2, 
    Eye, 
    EyeOff,
    Image,
    Copy,
    ArrowUpDown,
    Filter,
    RefreshCw,
    X,
    Upload,
    Star,
    Package,
    AlertTriangle,
    CheckCircle
} from 'lucide-react';
import { toast } from 'react-hot-toast';

const Products = () => {
    const { token } = useAuth();
    const [products, setProducts] = useState([]);
    const [categories, setCategories] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [categoryFilter, setCategoryFilter] = useState('');
    const [statusFilter, setStatusFilter] = useState('all');
    const [sortBy, setSortBy] = useState('created_at');
    const [sortDirection, setSortDirection] = useState('desc');
    const [currentPage, setCurrentPage] = useState(1);
    const [pagination, setPagination] = useState({});
    const [showModal, setShowModal] = useState(false);
    const [editingProduct, setEditingProduct] = useState(null);
    const [formData, setFormData] = useState({
        nom: '',
        description: '',
        description_courte: '',
        prix: '',
        prix_promo: '',
        debut_promo: '',
        fin_promo: '',
        categorie_id: '',
        stock_disponible: '',
        seuil_alerte: '',
        gestion_stock: true,
        fait_sur_mesure: false,
        delai_production_jours: '',
        cout_production: '',
        tailles_disponibles: [],
        couleurs_disponibles: [],
        materiaux_necessaires: [],
        est_visible: true,
        est_populaire: false,
        est_nouveaute: false,
        ordre_affichage: 0,
        meta_titre: '',
        meta_description: '',
        tags: ''
    });
    const [formErrors, setFormErrors] = useState({});
    const [submitting, setSubmitting] = useState(false);
    const [imagePreview, setImagePreview] = useState(null);
    const [multipleImages, setMultipleImages] = useState([]);

    const API_BASE = '/api/admin';
    const getHeaders = () => ({
        'Authorization': `Bearer ${token}`,
        'Accept': 'application/json'
    });

    // Charger les produits
    const loadProducts = async () => {
        try {
            setLoading(true);
            const params = new URLSearchParams({
                page: currentPage,
                per_page: 15,
                search: searchTerm,
                sort: sortBy,
                direction: sortDirection
            });

            if (categoryFilter) params.append('category_id', categoryFilter);
            if (statusFilter !== 'all') params.append('status', statusFilter);

            const response = await fetch(`${API_BASE}/produits?${params}`, {
                headers: getHeaders()
            });

            if (!response.ok) throw new Error('Erreur lors du chargement');

            const result = await response.json();
            if (result.success) {
                setProducts(result.data.produits);
                setPagination(result.data.pagination);
            }
        } catch (error) {
            console.error('Erreur:', error);
            toast.error('Erreur lors du chargement des produits');
        } finally {
            setLoading(false);
        }
    };

    // Charger les catégories
    const loadCategories = async () => {
        try {
            const response = await fetch(`${API_BASE}/categories/options`, {
                headers: getHeaders()
            });

            if (!response.ok) throw new Error('Erreur lors du chargement');

            const result = await response.json();
            if (result.success) {
                setCategories(result.data);
            }
        } catch (error) {
            console.error('Erreur:', error);
        }
    };

    useEffect(() => {
        loadProducts();
    }, [currentPage, searchTerm, categoryFilter, statusFilter, sortBy, sortDirection]);

    useEffect(() => {
        loadCategories();
    }, []);

    // Gérer la recherche
    const handleSearch = (e) => {
        setSearchTerm(e.target.value);
        setCurrentPage(1);
    };

    // Gérer le tri
    const handleSort = (field) => {
        if (sortBy === field) {
            setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
        } else {
            setSortBy(field);
            setSortDirection('asc');
        }
        setCurrentPage(1);
    };

    // Ouvrir le modal
    const openModal = (product = null) => {
        if (product) {
            setEditingProduct(product);
            setFormData({
                nom: product.nom,
                description: product.description,
                description_courte: product.description_courte || '',
                prix: product.prix.toString(),
                prix_promo: product.prix_promo?.toString() || '',
                debut_promo: product.debut_promo || '',
                fin_promo: product.fin_promo || '',
                categorie_id: product.categorie?.id || '',
                stock_disponible: product.stock_disponible.toString(),
                seuil_alerte: product.seuil_alerte.toString(),
                gestion_stock: product.gestion_stock,
                fait_sur_mesure: product.fait_sur_mesure,
                delai_production_jours: product.delai_production_jours?.toString() || '',
                cout_production: product.cout_production?.toString() || '',
                tailles_disponibles: product.tailles_disponibles || [],
                couleurs_disponibles: product.couleurs_disponibles || [],
                materiaux_necessaires: product.materiaux_necessaires || [],
                est_visible: product.est_visible,
                est_populaire: product.est_populaire,
                est_nouveaute: product.est_nouveaute,
                ordre_affichage: product.ordre_affichage,
                meta_titre: product.meta_titre || '',
                meta_description: product.meta_description || '',
                tags: product.tags || ''
            });
        } else {
            setEditingProduct(null);
            setFormData({
                nom: '',
                description: '',
                description_courte: '',
                prix: '',
                prix_promo: '',
                debut_promo: '',
                fin_promo: '',
                categorie_id: '',
                stock_disponible: '0',
                seuil_alerte: '5',
                gestion_stock: true,
                fait_sur_mesure: false,
                delai_production_jours: '',
                cout_production: '',
                tailles_disponibles: [],
                couleurs_disponibles: [],
                materiaux_necessaires: [],
                est_visible: true,
                est_populaire: false,
                est_nouveaute: false,
                ordre_affichage: 0,
                meta_titre: '',
                meta_description: '',
                tags: ''
            });
        }
        setFormErrors({});
        setImagePreview(null);
        setMultipleImages([]);
        setShowModal(true);
    };

    // Fermer le modal
    const closeModal = () => {
        setShowModal(false);
        setEditingProduct(null);
        setFormData({});
        setFormErrors({});
        setImagePreview(null);
        setMultipleImages([]);
    };

    // Gérer les changements du formulaire
    const handleFormChange = (e) => {
        const { name, value, type, checked, files } = e.target;
        
        if (type === 'file') {
            if (name === 'image_principale') {
                const file = files[0];
                if (file) {
                    setFormData(prev => ({ ...prev, image_principale: file }));
                    
                    const reader = new FileReader();
                    reader.onloadend = () => {
                        setImagePreview(reader.result);
                    };
                    reader.readAsDataURL(file);
                }
            } else if (name === 'images') {
                const fileArray = Array.from(files);
                setFormData(prev => ({ ...prev, images: fileArray }));
                
                // Aperçu des images multiples
                const previews = [];
                fileArray.forEach(file => {
                    const reader = new FileReader();
                    reader.onloadend = () => {
                        previews.push(reader.result);
                        if (previews.length === fileArray.length) {
                            setMultipleImages(previews);
                        }
                    };
                    reader.readAsDataURL(file);
                });
            }
        } else if (type === 'checkbox') {
            setFormData(prev => ({ ...prev, [name]: checked }));
        } else {
            setFormData(prev => ({ ...prev, [name]: value }));
        }

        // Nettoyer l'erreur correspondante
        if (formErrors[name]) {
            setFormErrors(prev => ({ ...prev, [name]: null }));
        }
    };

    // Gérer les arrays (tailles, couleurs, matériaux)
    const handleArrayChange = (arrayName, index, value) => {
        setFormData(prev => {
            const newArray = [...prev[arrayName]];
            newArray[index] = value;
            return { ...prev, [arrayName]: newArray };
        });
    };

    const addArrayItem = (arrayName) => {
        setFormData(prev => ({
            ...prev,
            [arrayName]: [...prev[arrayName], '']
        }));
    };

    const removeArrayItem = (arrayName, index) => {
        setFormData(prev => {
            const newArray = [...prev[arrayName]];
            newArray.splice(index, 1);
            return { ...prev, [arrayName]: newArray };
        });
    };

    // Soumettre le formulaire
    const handleSubmit = async (e) => {
        e.preventDefault();
        setSubmitting(true);
        setFormErrors({});

        try {
            const formDataToSend = new FormData();
            
            // Ajouter tous les champs du formulaire
            Object.keys(formData).forEach(key => {
                if (formData[key] !== null && formData[key] !== undefined && formData[key] !== '') {
                    if (Array.isArray(formData[key])) {
                        // Pour les arrays, les envoyer comme JSON ou individuellement
                        if (key === 'images') {
                            formData[key].forEach(file => {
                                formDataToSend.append('images[]', file);
                            });
                        } else {
                            formDataToSend.append(key, JSON.stringify(formData[key]));
                        }
                    } else {
                        formDataToSend.append(key, formData[key]);
                    }
                }
            });

            const url = editingProduct 
                ? `${API_BASE}/produits/${editingProduct.id}`
                : `${API_BASE}/produits`;
            
            const method = 'POST';
            
            // Pour la mise à jour, ajouter _method: PUT
            if (editingProduct) {
                formDataToSend.append('_method', 'PUT');
            }

            const response = await fetch(url, {
                method,
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Accept': 'application/json'
                },
                body: formDataToSend
            });

            const result = await response.json();

            if (result.success) {
                toast.success(result.message);
                closeModal();
                loadProducts();
            } else {
                if (result.errors) {
                    setFormErrors(result.errors);
                } else {
                    toast.error(result.message);
                }
            }
        } catch (error) {
            console.error('Erreur:', error);
            toast.error('Erreur lors de la sauvegarde');
        } finally {
            setSubmitting(false);
        }
    };

    // Basculer le statut
    const toggleStatus = async (product) => {
        try {
            const response = await fetch(`${API_BASE}/produits/${product.id}/toggle-status`, {
                method: 'POST',
                headers: getHeaders()
            });

            const result = await response.json();
            if (result.success) {
                toast.success(result.message);
                loadProducts();
            } else {
                toast.error(result.message);
            }
        } catch (error) {
            console.error('Erreur:', error);
            toast.error('Erreur lors du changement de statut');
        }
    };

    // Dupliquer un produit
    const duplicateProduct = async (product) => {
        try {
            const response = await fetch(`${API_BASE}/produits/${product.id}/duplicate`, {
                method: 'POST',
                headers: getHeaders()
            });

            const result = await response.json();
            if (result.success) {
                toast.success(result.message);
                loadProducts();
            } else {
                toast.error(result.message);
            }
        } catch (error) {
            console.error('Erreur:', error);
            toast.error('Erreur lors de la duplication');
        }
    };

    // Supprimer un produit
    const deleteProduct = async (product) => {
        if (!confirm(`Êtes-vous sûr de vouloir supprimer le produit "${product.nom}" ?`)) {
            return;
        }

        try {
            const response = await fetch(`${API_BASE}/produits/${product.id}`, {
                method: 'DELETE',
                headers: getHeaders()
            });

            const result = await response.json();
            if (result.success) {
                toast.success(result.message);
                loadProducts();
            } else {
                toast.error(result.message);
            }
        } catch (error) {
            console.error('Erreur:', error);
            toast.error('Erreur lors de la suppression');
        }
    };

    // Formater le prix
    const formatPrice = (price) => {
        return new Intl.NumberFormat('fr-SN', {
            style: 'currency',
            currency: 'XOF',
            minimumFractionDigits: 0
        }).format(price);
    };

    // Obtenir l'icône de statut du stock
    const getStockIcon = (stockStatus) => {
        switch (stockStatus.status) {
            case 'out_of_stock':
                return <AlertTriangle className="w-4 h-4 text-red-500" />;
            case 'low_stock':
                return <AlertTriangle className="w-4 h-4 text-orange-500" />;
            case 'in_stock':
                return <CheckCircle className="w-4 h-4 text-green-500" />;
            default:
                return <Package className="w-4 h-4 text-blue-500" />;
        }
    };

    return (
        <div className="p-6">
            {/* Header */}
            <div className="mb-6">
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-2xl font-bold text-gray-900">Produits</h1>
                        <p className="text-gray-600">Gérez votre catalogue de produits</p>
                    </div>
                    <button
                        onClick={() => openModal()}
                        className="bg-purple-600 text-white px-4 py-2 rounded-lg hover:bg-purple-700 flex items-center space-x-2"
                    >
                        <Plus className="w-4 h-4" />
                        <span>Nouveau produit</span>
                    </button>
                </div>
            </div>

            {/* Filtres et recherche */}
            <div className="bg-white rounded-lg shadow-sm border mb-6 p-4">
                <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between space-y-4 lg:space-y-0">
                    <div className="flex flex-col md:flex-row md:items-center space-y-4 md:space-y-0 md:space-x-4">
                        <div className="relative">
                            <Search className="w-4 h-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                            <input
                                type="text"
                                placeholder="Rechercher un produit..."
                                value={searchTerm}
                                onChange={handleSearch}
                                className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent w-full md:w-80"
                            />
                        </div>
                        
                        <select
                            value={categoryFilter}
                            onChange={(e) => {
                                setCategoryFilter(e.target.value);
                                setCurrentPage(1);
                            }}
                            className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                        >
                            <option value="">Toutes les catégories</option>
                            {categories.map(category => (
                                <option key={category.id} value={category.id}>
                                    {category.nom}
                                </option>
                            ))}
                        </select>

                        <select
                            value={statusFilter}
                            onChange={(e) => {
                                setStatusFilter(e.target.value);
                                setCurrentPage(1);
                            }}
                            className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                        >
                            <option value="all">Tous les statuts</option>
                            <option value="visible">Visibles</option>
                            <option value="hidden">Masqués</option>
                        </select>
                        
                        <button
                            onClick={loadProducts}
                            className="p-2 border border-gray-300 rounded-lg hover:bg-gray-50"
                            title="Actualiser"
                        >
                            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
                        </button>
                    </div>

                    <div className="flex items-center space-x-2">
                        <span className="text-sm text-gray-500">
                            {pagination.total || 0} produit(s)
                        </span>
                    </div>
                </div>
            </div>

           {/* Grille des produits */}
<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
    {loading ? (
        // Loading skeleton
        [...Array(8)].map((_, i) => (
            <div key={i} className="bg-white rounded-lg shadow-sm border p-4">
                <div className="w-full h-48 bg-gray-200 rounded-lg animate-pulse mb-4"></div>
                <div className="space-y-2">
                    <div className="h-4 bg-gray-200 rounded animate-pulse"></div>
                    <div className="h-4 bg-gray-200 rounded animate-pulse w-3/4"></div>
                    <div className="h-6 bg-gray-200 rounded animate-pulse w-1/2"></div>
                    <div className="flex justify-between items-center">
                        <div className="h-4 bg-gray-200 rounded animate-pulse w-1/3"></div>
                        <div className="flex space-x-1">
                            <div className="w-8 h-8 bg-gray-200 rounded animate-pulse"></div>
                            <div className="w-8 h-8 bg-gray-200 rounded animate-pulse"></div>
                            <div className="w-8 h-8 bg-gray-200 rounded animate-pulse"></div>
                        </div>
                    </div>
                </div>
            </div>
        ))
    ) : products.length === 0 ? (
        // État vide
        <div className="col-span-full text-center py-12">
            <Package className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-gray-900 mb-2">Aucun produit trouvé</h3>
            <p className="text-gray-500 mb-6">
                {searchTerm || categoryFilter || statusFilter !== 'all' 
                    ? 'Aucun produit ne correspond à vos critères de recherche.'
                    : 'Commencez par créer votre premier produit pour alimenter votre catalogue.'
                }
            </p>
            {(!searchTerm && !categoryFilter && statusFilter === 'all') && (
                <button
                    onClick={() => openModal()}
                    className="bg-purple-600 text-white px-6 py-3 rounded-lg hover:bg-purple-700 transition-colors flex items-center space-x-2 mx-auto"
                >
                    <Plus className="w-5 h-5" />
                    <span>Créer mon premier produit</span>
                </button>
            )}
        </div>
    ) : (
        // Liste des produits
        products.map((product) => (
            <div key={product.id} className="bg-white rounded-lg shadow-sm border overflow-hidden hover:shadow-lg transition-all duration-200 group">
                {/* Image du produit */}
                <div className="relative h-48 bg-gray-100 overflow-hidden">
                    {product.image_principale ? (
                        <img
                            src={product.image_principale}
                            alt={product.nom}
                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                        />
                    ) : (
                        <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-gray-100 to-gray-200">
                            <Image className="w-12 h-12 text-gray-400" />
                        </div>
                    )}
                    
                    {/* Badges de statut */}
                    <div className="absolute top-3 left-3 flex flex-col space-y-1">
                        {!product.est_visible && (
                            <span className="px-2 py-1 bg-red-500 text-white text-xs font-medium rounded-full shadow-sm">
                                Masqué
                            </span>
                        )}
                        {product.est_nouveaute && (
                            <span className="px-2 py-1 bg-green-500 text-white text-xs font-medium rounded-full shadow-sm">
                                Nouveau
                            </span>
                        )}
                        {product.est_populaire && (
                            <span className="px-2 py-1 bg-purple-500 text-white text-xs font-medium rounded-full shadow-sm">
                                Populaire
                            </span>
                        )}
                        {product.en_promo && (
                            <span className="px-2 py-1 bg-orange-500 text-white text-xs font-medium rounded-full shadow-sm">
                                Promo
                            </span>
                        )}
                    </div>

                    {/* Actions rapides (visibles au hover) */}
                    <div className="absolute top-3 right-3 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                        <button
                            onClick={(e) => {
                                e.stopPropagation();
                                toggleStatus(product);
                            }}
                            className={`p-2 rounded-full backdrop-blur-sm ${
                                product.est_visible 
                                    ? 'bg-white/90 text-gray-700 hover:bg-white' 
                                    : 'bg-green-500/90 text-white hover:bg-green-500'
                            } transition-colors shadow-sm`}
                            title={product.est_visible ? 'Masquer le produit' : 'Afficher le produit'}
                        >
                            {product.est_visible ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                        </button>
                    </div>

                    {/* Indicateur de stock */}
                    {product.gestion_stock && (
                        <div className="absolute bottom-3 left-3">
                            <div className={`px-2 py-1 rounded-full text-xs font-medium backdrop-blur-sm ${
                                product.stock_status?.status === 'out_of_stock' 
                                    ? 'bg-red-500/90 text-white'
                                    : product.stock_status?.status === 'low_stock'
                                    ? 'bg-orange-500/90 text-white'
                                    : 'bg-green-500/90 text-white'
                            }`}>
                                {product.stock_disponible} en stock
                            </div>
                        </div>
                    )}
                </div>

                {/* Contenu de la carte */}
                <div className="p-4">
                    {/* En-tête : titre et catégorie */}
                    <div className="mb-3">
                        <h3 className="font-semibold text-gray-900 text-lg leading-tight mb-1 line-clamp-2" title={product.nom}>
                            {product.nom}
                        </h3>
                        {product.categorie && (
                            <p className="text-sm text-gray-500 font-medium">{product.categorie.nom}</p>
                        )}
                    </div>

                    {/* Prix */}
                    <div className="mb-4">
                        {product.en_promo ? (
                            <div className="flex items-baseline space-x-2">
                                <span className="text-xl font-bold text-green-600">
                                    {formatPrice(product.prix_actuel)}
                                </span>
                                <span className="text-sm text-gray-500 line-through">
                                    {formatPrice(product.prix)}
                                </span>
                                <span className="text-xs bg-orange-100 text-orange-800 px-2 py-1 rounded-full font-medium">
                                    -{Math.round(((product.prix - product.prix_actuel) / product.prix) * 100)}%
                                </span>
                            </div>
                        ) : (
                            <span className="text-xl font-bold text-gray-900">
                                {formatPrice(product.prix)}
                            </span>
                        )}
                    </div>

                    {/* Métriques */}
                    <div className="flex items-center justify-between text-sm text-gray-500 mb-4">
                        <div className="flex items-center space-x-1">
                            {getStockIcon(product.stock_status)}
                            <span className="font-medium">
                                {product.gestion_stock ? product.stock_disponible : '∞'}
                            </span>
                        </div>
                        
                        <div className="flex items-center space-x-4">
                            <div className="flex items-center space-x-1">
                                <Package className="w-3 h-3" />
                                <span>{product.nombre_ventes || 0}</span>
                            </div>
                            {product.note_moyenne > 0 && (
                                <div className="flex items-center space-x-1">
                                    <Star className="w-3 h-3 fill-current text-yellow-400" />
                                    <span>{product.note_moyenne.toFixed(1)}</span>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Description courte */}
                    {product.description_courte && (
                        <p className="text-sm text-gray-600 mb-4 line-clamp-2">
                            {product.description_courte}
                        </p>
                    )}

                    {/* Actions */}
                    <div className="flex items-center justify-between pt-4 border-t border-gray-100">
                        <div className="flex items-center space-x-1">
                            <button
                                onClick={(e) => {
                                    e.stopPropagation();
                                    openModal(product);
                                }}
                                className="p-2 text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors"
                                title="Modifier le produit"
                            >
                                <Edit className="w-4 h-4" />
                            </button>
                            
                            <button
                                onClick={(e) => {
                                    e.stopPropagation();
                                    duplicateProduct(product);
                                }}
                                className="p-2 text-green-600 hover:bg-green-50 rounded-lg transition-colors"
                                title="Dupliquer le produit"
                            >
                                <Copy className="w-4 h-4" />
                            </button>
                            
                            <button
                                onClick={(e) => {
                                    e.stopPropagation();
                                    deleteProduct(product);
                                }}
                                className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                                title="Supprimer le produit"
                            >
                                <Trash2 className="w-4 h-4" />
                            </button>
                        </div>

                        <div className="text-xs text-gray-400">
                            Modifié le {product.updated_at}
                        </div>
                    </div>
                </div>
            </div>
        ))
    )}
</div>