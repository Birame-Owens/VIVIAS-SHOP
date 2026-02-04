import React, { useState, useEffect } from 'react';
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
    CheckCircle,
    Calendar,
    DollarSign,
    ShoppingCart,
    Tag
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
    const [existingImages, setExistingImages] = useState([]); // Images déjà enregistrées
    const [imagesToDelete, setImagesToDelete] = useState([]); // IDs des images à supprimer
    const [imageInputKey, setImageInputKey] = useState(Date.now());

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
    // Remplacez cette fonction dans Products.jsx :
const loadCategories = async () => {
    try {
        console.log('🔍 Chargement des catégories...');
        // Changez l'URL pour utiliser la même que la page Catégories
        const response = await fetch(`${API_BASE}/categories`, {
            headers: getHeaders()
        });

        console.log('📡 Réponse categories:', response.status);

        if (!response.ok) throw new Error('Erreur lors du chargement');

        const result = await response.json();
        console.log('📋 Données catégories:', result);
        
        if (result.success) {
            // Extraire seulement les données nécessaires pour le select
            const categoriesForSelect = result.data.categories.map(cat => ({
                id: cat.id,
                nom: cat.nom
            }));
            setCategories(categoriesForSelect);
            console.log('✅ Catégories chargées:', categoriesForSelect);
        }
    } catch (error) {
        console.error('❌ Erreur catégories:', error);
        toast.error('Erreur lors du chargement des catégories');
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
   // Modifiez la fonction openModal
const openModal = async (product = null) => {
    if (product) {
        try {
            // Charger les détails complets du produit avec les images
            console.log('🔄 Chargement des détails du produit:', product.id);
            const response = await fetch(`${API_BASE}/produits/${product.id}`, {
                headers: getHeaders()
            });
            
            if (!response.ok) throw new Error('Erreur lors du chargement du produit');
            
            const result = await response.json();
            if (!result.success) throw new Error(result.message);
            
            const productDetails = result.data.produit;
            console.log('📦 Produit complet chargé:', productDetails);
            
            setEditingProduct(productDetails);
            setFormData({
                nom: productDetails.nom || '',
                description: productDetails.description || '',
                description_courte: productDetails.description_courte || '',
                prix: productDetails.prix?.toString() || '',
                prix_promo: productDetails.prix_promo?.toString() || '',
                debut_promo: productDetails.debut_promo || '',
                fin_promo: productDetails.fin_promo || '',
                categorie_id: productDetails.categorie?.id?.toString() || '',
                stock_disponible: productDetails.stock_disponible?.toString() || '0',
                seuil_alerte: productDetails.seuil_alerte?.toString() || '5',
                gestion_stock: productDetails.gestion_stock ?? true,
                fait_sur_mesure: productDetails.fait_sur_mesure ?? false,
                delai_production_jours: productDetails.delai_production_jours?.toString() || '',
                cout_production: productDetails.cout_production?.toString() || '',
                tailles_disponibles: Array.isArray(productDetails.tailles_disponibles) ? productDetails.tailles_disponibles : [],
                couleurs_disponibles: Array.isArray(productDetails.couleurs_disponibles) ? productDetails.couleurs_disponibles : [],
                materiaux_necessaires: Array.isArray(productDetails.materiaux_necessaires) ? productDetails.materiaux_necessaires : [],
                est_visible: productDetails.est_visible ?? true,
                est_populaire: productDetails.est_populaire ?? false,
                est_nouveaute: productDetails.est_nouveaute ?? false,
                ordre_affichage: productDetails.ordre_affichage || 0,
                meta_titre: productDetails.meta_titre || '',
                meta_description: productDetails.meta_description || '',
                tags: productDetails.tags || ''
            });
            
            // Précharger l'image existante
            if (productDetails.image_principale) {
                setImagePreview(productDetails.image_principale);
            }
            
            // Charger les images supplémentaires existantes
            console.log('🖼️ Product images:', productDetails.images);
            console.log('📊 Total images:', productDetails.images?.length);
            if (productDetails.images && productDetails.images.length > 0) {
                // Afficher TOUTES les images pour le debug
                console.log('✅ Toutes les images:', productDetails.images);
                // Filtrer pour enlever l'image principale (on la montre déjà en haut)
                const supplementaryImages = productDetails.images.filter(img => !img.est_principale);
                console.log('📋 Images supplémentaires filtrées:', supplementaryImages);
                console.log('🔢 Nombre d\'images supplémentaires:', supplementaryImages.length);
                
                // Si aucune image après filtrage, afficher toutes les images
                if (supplementaryImages.length === 0 && productDetails.images.length > 0) {
                    console.warn('⚠️ Aucune image avec est_principale=false, affichage de toutes les images');
                    setExistingImages(productDetails.images);
                } else {
                    setExistingImages(supplementaryImages);
                }
            } else {
                console.log('⚠️ Aucune image trouvée pour ce produit');
                setExistingImages([]);
            }
        } catch (error) {
            console.error('❌ Erreur chargement produit:', error);
            toast.error('Erreur lors du chargement des détails du produit');
            return;
        }
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
        setImagePreview(null);
        setImageInputKey(Date.now());
        setExistingImages([]);
        setImagesToDelete([]);
    }
    setFormErrors({});
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
        setExistingImages([]);
        setImagesToDelete([]);
        setImageInputKey(Date.now());
    };

    // Gérer les changements du formulaire
    const handleFormChange = (e) => {
        const { name, value, type, checked, files } = e.target;
        
        if (type === 'file') {
            if (name === 'image_principale') {
                const file = files[0];
                if (file) {
                    console.log('📸 Nouvelle image sélectionnée:', file.name);
                    setFormData(prev => ({ ...prev, image_principale: file }));
                    
                    const reader = new FileReader();
                    reader.onloadend = () => {
                        console.log('✅ Image chargée pour preview');
                        setImagePreview(reader.result);
                        setImageInputKey(Date.now()); // Reset l'input
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
   // Modifiez la fonction handleSubmit dans Products.jsx
const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setFormErrors({});

    try {
        const formDataToSend = new FormData();
        
        // Ajouter le token CSRF
        const csrfToken = document.querySelector('meta[name="csrf-token"]')?.getAttribute('content');
        if (csrfToken) {
            formDataToSend.append('_token', csrfToken);
        }
        
        // Traitement spécial pour chaque champ
        Object.keys(formData).forEach(key => {
            const value = formData[key];
            
            if (value !== null && value !== undefined && value !== '') {
                // Arrays - les envoyer comme chaînes séparées par virgules
                if (key === 'tailles_disponibles' || key === 'couleurs_disponibles' || key === 'materiaux_necessaires') {
                    if (Array.isArray(value) && value.length > 0) {
                        const cleanArray = value.filter(item => item !== '' && item !== null);
                        if (cleanArray.length > 0) {
                            // Les envoyer un par un avec des indices
                            cleanArray.forEach((item, index) => {
                                formDataToSend.append(`${key}[${index}]`, item);
                            });
                        }
                    }
                } else if (key === 'image_principale' && value instanceof File) {
                    formDataToSend.append(key, value);
                } else if (key === 'images' && Array.isArray(value)) {
                    value.forEach(file => {
                        formDataToSend.append('images[]', file);
                    });
                } else {
                    // Champs normaux - s'assurer qu'ils sont des chaînes
                    formDataToSend.append(key, value.toString());
                }
            }
        });
        
        // Ajouter les IDs des images à supprimer
        if (imagesToDelete.length > 0) {
            imagesToDelete.forEach((imageId) => {
                formDataToSend.append('images_to_delete[]', imageId);
            });
        }

        // Pour la mise à jour
        if (editingProduct) {
            formDataToSend.append('_method', 'PUT');
        }

        const url = editingProduct 
            ? `${API_BASE}/produits/${editingProduct.id}`
            : `${API_BASE}/produits`;

        const response = await fetch(url, {
            method: 'POST',
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
                console.log('❌ Erreurs de validation détaillées:');
                Object.keys(result.errors).forEach(field => {
                    console.log(`${field}:`, result.errors[field]);
                });
                setFormErrors(result.errors);
                
                // Afficher la première erreur
                const firstError = Object.values(result.errors)[0];
                toast.error(Array.isArray(firstError) ? firstError[0] : firstError);
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
        const formData = new FormData();
        const csrfToken = document.querySelector('meta[name="csrf-token"]')?.getAttribute('content');
        
        if (csrfToken) {
            formData.append('_token', csrfToken);
        }

        const response = await fetch(`${API_BASE}/produits/${product.id}/toggle-status`, {
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
    // Dupliquer un produit
const duplicateProduct = async (product) => {
    try {
        const formData = new FormData();
        const csrfToken = document.querySelector('meta[name="csrf-token"]')?.getAttribute('content');
        
        if (csrfToken) {
            formData.append('_token', csrfToken);
        }

        const response = await fetch(`${API_BASE}/produits/${product.id}/duplicate`, {
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
        const csrfToken = document.querySelector('meta[name="csrf-token"]')?.getAttribute('content');
        
        const headers = {
            'Authorization': `Bearer ${token}`,
            'Accept': 'application/json'
        };

        if (csrfToken) {
            headers['X-CSRF-TOKEN'] = csrfToken;
        }

        const response = await fetch(`${API_BASE}/produits/${product.id}`, {
            method: 'DELETE',
            headers: headers
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
        <div className="p-3 md:p-6">
            {/* Header */}
            <div className="mb-4 md:mb-6">
                <div className="flex flex-col md:flex-row md:items-center md:justify-between space-y-3 md:space-y-0">
                    <div>
                        <h1 className="text-xl md:text-2xl font-bold text-gray-900">Produits</h1>
                        <p className="text-sm text-gray-600 hidden md:block">Gérez votre catalogue de produits</p>
                    </div>
                    <button
                        onClick={() => openModal()}
                        className="bg-purple-600 text-white px-3 md:px-4 py-2 rounded-lg hover:bg-purple-700 flex items-center justify-center space-x-2 text-sm md:text-base"
                    >
                        <Plus className="w-4 h-4" />
                        <span>Nouveau produit</span>
                    </button>
                </div>
            </div>

            {/* Filtres et recherche */}
            <div className="bg-white rounded-lg shadow-sm border mb-4 md:mb-6 p-3 md:p-4">
                <div className="flex flex-col space-y-3 md:space-y-4">
                    <div className="flex flex-col md:flex-row md:items-center md:justify-between space-y-3 md:space-y-0">
                        {/* Recherche */}
                        <div className="relative flex-1 md:max-w-md">
                            <Search className="w-4 h-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                            <input
                                type="text"
                                placeholder="Rechercher..."
                                value={searchTerm}
                                onChange={handleSearch}
                                className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent w-full text-sm"
                            />
                        </div>
                        
                        {/* Actions rapides mobile */}
                        <div className="flex items-center space-x-2">
                            <button
                                onClick={loadProducts}
                                className="p-2 hover:bg-gray-100 rounded-lg"
                                title="Actualiser"
                            >
                                <RefreshCw className="w-4 h-4 text-gray-600" />
                            </button>
                        </div>
                    </div>
                    
                    {/* Filtres - 2ème ligne */}
                    <div className="flex flex-col sm:flex-row sm:items-center space-y-2 sm:space-y-0 sm:space-x-3">
                        <select
                            value={categoryFilter}
                            onChange={(e) => {
                                setCategoryFilter(e.target.value);
                                setCurrentPage(1);
                            }}
                            className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent text-sm"
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

            {/* Liste des produits */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {loading ? (
                    // Squelettes de chargement
                    Array.from({ length: 8 }).map((_, index) => (
                        <div key={index} className="bg-white rounded-lg shadow-sm border overflow-hidden animate-pulse">
                            <div className="h-48 bg-gray-200"></div>
                            <div className="p-4">
                                <div className="h-4 bg-gray-200 rounded mb-2"></div>
                                <div className="h-3 bg-gray-200 rounded mb-4 w-3/4"></div>
                                <div className="flex justify-between items-center">
                                    <div className="h-5 bg-gray-200 rounded w-20"></div>
                                    <div className="h-4 bg-gray-200 rounded w-16"></div>
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
                                     className="w-full h-full object-cover object-center group-hover:scale-105 transition-transform duration-200"
                                     style={{ objectPosition: 'center top' }} // Cadrer vers le haut
                                 />
                                ) : (
                                    <div className="w-full h-full flex items-center justify-center">
                                     <Image className="w-12 h-12 text-gray-400" />
                                     </div>
                                )}
                                
                                {/* Badges */}
                                <div className="absolute top-2 left-2 flex flex-col space-y-1">
                                    {product.est_nouveaute && (
                                        <span className="bg-green-500 text-white text-xs px-2 py-1 rounded-full">
                                            Nouveau
                                        </span>
                                    )}
                                    {product.est_populaire && (
                                        <span className="bg-yellow-500 text-white text-xs px-2 py-1 rounded-full flex items-center">
                                            <Star className="w-3 h-3 mr-1" />
                                            Populaire
                                        </span>
                                    )}
                                    {product.en_promo && (
                                        <span className="bg-red-500 text-white text-xs px-2 py-1 rounded-full">
                                            Promo
                                        </span>
                                    )}
                                </div>

                                {/* Statut de visibilité */}
                                <div className="absolute top-2 right-2">
                                    <button
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            toggleStatus(product);
                                        }}
                                        className={`p-1 rounded-full ${
                                            product.est_visible 
                                                ? 'bg-green-100 text-green-600' 
                                                : 'bg-gray-100 text-gray-400'
                                        }`}
                                        title={product.est_visible ? 'Visible' : 'Masqué'}
                                    >
                                        {product.est_visible ? (
                                            <Eye className="w-4 h-4" />
                                        ) : (
                                            <EyeOff className="w-4 h-4" />
                                        )}
                                    </button>
                                </div>
                            </div>

                            {/* Contenu */}
                            <div className="p-4">
                                <div className="flex items-start justify-between mb-2">
                                    <h3 className="font-semibold text-gray-900 truncate flex-1 mr-2">
                                        {product.nom}
                                    </h3>
                                    <div className="flex items-center">
                                        {getStockIcon(product.stock_status)}
                                    </div>
                                </div>

                                {/* Catégorie */}
                                {product.categorie && (
                                    <div className="flex items-center text-sm text-gray-500 mb-2">
                                        <Tag className="w-3 h-3 mr-1" />
                                        {product.categorie.nom}
                                    </div>
                                )}

                                {/* Prix */}
                                <div className="flex items-center space-x-2 mb-3">
                                    {product.en_promo ? (
                                        <>
                                            <span className="text-lg font-bold text-red-600">
                                                {formatPrice(product.prix_actuel)}
                                            </span>
                                            <span className="text-sm text-gray-500 line-through">
                                                {formatPrice(product.prix)}
                                            </span>
                                        </>
                                    ) : (
                                        <span className="text-lg font-bold text-gray-900">
                                            {formatPrice(product.prix)}
                                        </span>
                                    )}
                                </div>

                                {/* Stock */}
                                <div className="flex items-center justify-between text-sm text-gray-500 mb-3">
                                    <span>Stock: {product.stock_disponible}</span>
                                    <span className="flex items-center">
                                        <ShoppingCart className="w-3 h-3 mr-1" />
                                        {product.nombre_ventes} ventes
                                    </span>
                                </div>

                                {/* Description courte */}
                                {product.description_courte && (
                                    <p className="text-sm text-gray-600 mb-3 line-clamp-2">
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

            {/* Pagination */}
            {pagination.last_page > 1 && (
                <div className="mt-6 flex items-center justify-between">
                    <div className="text-sm text-gray-700">
                        Affichage de {((currentPage - 1) * pagination.per_page) + 1} à{' '}
                        {Math.min(currentPage * pagination.per_page, pagination.total)} sur{' '}
                        {pagination.total} résultats
                    </div>
                    
                    <div className="flex items-center space-x-2">
                        <button
                            onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                            disabled={currentPage === 1}
                            className="px-3 py-2 text-sm bg-white border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            Précédent
                        </button>
                        
                        <div className="flex items-center space-x-1">
                            {Array.from({ length: Math.min(5, pagination.last_page) }, (_, i) => {
                                const page = i + 1;
                                return (
                                    <button
                                        key={page}
                                        onClick={() => setCurrentPage(page)}
                                        className={`px-3 py-2 text-sm rounded-lg ${
                                            currentPage === page
                                                ? 'bg-purple-600 text-white'
                                                : 'bg-white border border-gray-300 hover:bg-gray-50'
                                        }`}
                                    >
                                        {page}
                                    </button>
                                );
                            })}
                        </div>
                        
                        <button
                            onClick={() => setCurrentPage(prev => Math.min(prev + 1, pagination.last_page))}
                            disabled={currentPage === pagination.last_page}
                            className="px-3 py-2 text-sm bg-white border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            Suivant
                        </button>
                    </div>
                </div>
            )}

            {/* Modal de création/édition */}
            {showModal && (
                <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
                    <div className="bg-white rounded-2xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
                        <form onSubmit={handleSubmit} className="p-6">
                            {/* Header du modal */}
                            <div className="flex items-center justify-between mb-6 pb-4 border-b">
                                <h2 className="text-2xl font-bold text-gray-900">
                                    {editingProduct ? 'Modifier le produit' : 'Nouveau produit'}
                                </h2>
                                <button
                                    type="button"
                                    onClick={closeModal}
                                    className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                                >
                                    <X className="w-5 h-5" />
                                </button>
                            </div>

                            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                                {/* Colonne gauche - Informations principales */}
                                <div className="space-y-6">
                                    {/* Informations de base */}
                                    <div className="bg-gray-50 rounded-lg p-4">
                                        <h3 className="text-lg font-semibold text-gray-900 mb-4">Informations de base</h3>
                                        
                                        <div className="space-y-4">
                                            <div>
                                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                                    Nom du produit *
                                                </label>
                                                <input
                                                    type="text"
                                                    name="nom"
                                                    value={formData.nom}
                                                    onChange={handleFormChange}
                                                    required
                                                    className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent ${
                                                        formErrors.nom ? 'border-red-500' : 'border-gray-300'
                                                    }`}
                                                    placeholder="Entrez le nom du produit"
                                                />
                                                {formErrors.nom && (
                                                    <p className="text-red-500 text-sm mt-1">{formErrors.nom}</p>
                                                )}
                                            </div>

                                            <div>
                                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                                    Description courte
                                                </label>
                                                <input
                                                    type="text"
                                                    name="description_courte"
                                                    value={formData.description_courte}
                                                    onChange={handleFormChange}
                                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                                                    placeholder="Résumé en une ligne"
                                                    maxLength="150"
                                                />
                                            </div>

                                            <div>
                                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                                    Description complète *
                                                </label>
                                                <textarea
                                                    name="description"
                                                    value={formData.description}
                                                    onChange={handleFormChange}
                                                    required
                                                    rows="4"
                                                    className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent ${
                                                        formErrors.description ? 'border-red-500' : 'border-gray-300'
                                                    }`}
                                                    placeholder="Description détaillée du produit"
                                                />
                                                {formErrors.description && (
                                                    <p className="text-red-500 text-sm mt-1">{formErrors.description}</p>
                                                )}
                                            </div>

                                            <div>
                                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                                    Catégorie *
                                                </label>
                                                <select
                                                    name="categorie_id"
                                                    value={formData.categorie_id}
                                                    onChange={handleFormChange}
                                                    required
                                                    className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent ${
                                                        formErrors.categorie_id ? 'border-red-500' : 'border-gray-300'
                                                    }`}
                                                >
                                                    <option value="">Sélectionnez une catégorie</option>
                                                    {categories.map(category => (
                                                        <option key={category.id} value={category.id}>
                                                            {category.nom}
                                                        </option>
                                                    ))}
                                                </select>
                                                {formErrors.categorie_id && (
                                                    <p className="text-red-500 text-sm mt-1">{formErrors.categorie_id}</p>
                                                )}
                                            </div>
                                        </div>
                                    </div>

                                    {/* Prix et promotion */}
                                    <div className="bg-gray-50 rounded-lg p-4">
                                        <h3 className="text-lg font-semibold text-gray-900 mb-4">Prix et promotion</h3>
                                        
                                        <div className="space-y-4">
                                            <div className="grid grid-cols-2 gap-4">
                                                <div>
                                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                                        Prix normal (XOF) *
                                                    </label>
                                                    <input
                                                        type="number"
                                                        name="prix"
                                                        value={formData.prix}
                                                        onChange={handleFormChange}
                                                        required
                                                        min="0"
                                                        step="1"
                                                        className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent ${
                                                            formErrors.prix ? 'border-red-500' : 'border-gray-300'
                                                        }`}
                                                        placeholder="0"
                                                    />
                                                    {formErrors.prix && (
                                                        <p className="text-red-500 text-sm mt-1">{formErrors.prix}</p>
                                                    )}
                                                </div>

                                                <div>
                                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                                        Prix promotionnel (XOF)
                                                    </label>
                                                    <input
                                                        type="number"
                                                        name="prix_promo"
                                                        value={formData.prix_promo}
                                                        onChange={handleFormChange}
                                                        min="0"
                                                        step="1"
                                                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                                                        placeholder="0"
                                                    />
                                                </div>
                                            </div>

                                            {formData.prix_promo && (
                                                <div className="grid grid-cols-2 gap-4">
                                                    <div>
                                                        <label className="block text-sm font-medium text-gray-700 mb-1">
                                                            Début de la promotion
                                                        </label>
                                                        <input
                                                            type="datetime-local"
                                                            name="debut_promo"
                                                            value={formData.debut_promo}
                                                            onChange={handleFormChange}
                                                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                                                        />
                                                    </div>

                                                    <div>
                                                        <label className="block text-sm font-medium text-gray-700 mb-1">
                                                            Fin de la promotion
                                                        </label>
                                                        <input
                                                            type="datetime-local"
                                                            name="fin_promo"
                                                            value={formData.fin_promo}
                                                            onChange={handleFormChange}
                                                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                                                        />
                                                    </div>
                                                </div>
                                            )}
                                        </div>
                                    </div>

                                    {/* Stock */}
                                    <div className="bg-gray-50 rounded-lg p-4">
                                        <h3 className="text-lg font-semibold text-gray-900 mb-4">Gestion du stock</h3>
                                        
                                        <div className="space-y-4">
                                            <div className="flex items-center">
                                                <input
                                                    type="checkbox"
                                                    name="gestion_stock"
                                                    checked={formData.gestion_stock}
                                                    onChange={handleFormChange}
                                                    className="h-4 w-4 text-purple-600 focus:ring-purple-500 border-gray-300 rounded"
                                                />
                                                <label className="ml-2 text-sm text-gray-700">
                                                    Gérer le stock pour ce produit
                                                </label>
                                            </div>

                                            {formData.gestion_stock && (
                                                <div className="grid grid-cols-2 gap-4">
                                                    <div>
                                                        <label className="block text-sm font-medium text-gray-700 mb-1">
                                                            Stock disponible
                                                        </label>
                                                        <input
                                                            type="number"
                                                            name="stock_disponible"
                                                            value={formData.stock_disponible}
                                                            onChange={handleFormChange}
                                                            min="0"
                                                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                                                            placeholder="0"
                                                        />
                                                    </div>

                                                    <div>
                                                        <label className="block text-sm font-medium text-gray-700 mb-1">
                                                            Seuil d'alerte
                                                        </label>
                                                        <input
                                                            type="number"
                                                            name="seuil_alerte"
                                                            value={formData.seuil_alerte}
                                                            onChange={handleFormChange}
                                                            min="0"
                                                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                                                            placeholder="5"
                                                        />
                                                    </div>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                </div>

                                {/* Colonne droite - Images et options */}
                                <div className="space-y-6">
                                    {/* Images */}
                                    <div className="bg-gray-50 rounded-lg p-4">
                                        <h3 className="text-lg font-semibold text-gray-900 mb-4">Images</h3>
                                        
                                        <div className="space-y-4">
                                            {/* Image principale */}
                                            <div>
                                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                                    Image principale <span className="text-red-500">*</span>
                                                </label>
                                                {formErrors.image_principale && (
                                                    <p className="text-sm text-red-600 mb-2">
                                                        {formErrors.image_principale[0]}
                                                    </p>
                                                )}
                                                <div className="mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-gray-300 border-dashed rounded-lg hover:border-purple-400 transition-colors">
                                                    <div className="space-y-1 text-center">
                                                        {imagePreview ? (
                                                            <div className="space-y-4">
                                                                <div className="relative">
                                                                    <img
                                                                        src={imagePreview}
                                                                        alt="Aperçu"
                                                                        className="mx-auto h-32 w-32 object-cover rounded-lg"
                                                                    />
                                                                    <button
                                                                        type="button"
                                                                        onClick={() => {
                                                                            setImagePreview(null);
                                                                            setFormData(prev => ({ ...prev, image_principale: null }));
                                                                            setImageInputKey(Date.now());
                                                                        }}
                                                                        className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 hover:bg-red-600"
                                                                    >
                                                                        <X className="w-3 h-3" />
                                                                    </button>
                                                                </div>
                                                                <div className="text-center">
                                                                    <label className="relative cursor-pointer bg-purple-600 text-white px-4 py-2 rounded-md font-medium hover:bg-purple-700 inline-block">
                                                                        <span>Changer l'image</span>
                                                                        <input
                                                                            key={imageInputKey}
                                                                            type="file"
                                                                            name="image_principale"
                                                                            accept="image/*"
                                                                            onChange={handleFormChange}
                                                                            className="sr-only"
                                                                        />
                                                                    </label>
                                                                </div>
                                                            </div>
                                                        ) : (
                                                            <>
                                                                <Upload className="mx-auto h-12 w-12 text-gray-400" />
                                                                <div className="flex text-sm text-gray-600">
                                                                    <label className="relative cursor-pointer bg-white rounded-md font-medium text-purple-600 hover:text-purple-500 focus-within:outline-none focus-within:ring-2 focus-within:ring-offset-2 focus-within:ring-purple-500">
                                                                        <span>Télécharger une image</span>
                                                                        <input
                                                                            type="file"
                                                                            name="image_principale"
                                                                            accept="image/*"
                                                                            onChange={handleFormChange}
                                                                            className="sr-only"
                                                                        />
                                                                    </label>
                                                                    <p className="pl-1">ou glisser-déposer</p>
                                                                </div>
                                                                <p className="text-xs text-gray-500">
                                                                    PNG, JPG, GIF jusqu'à 10MB
                                                                </p>
                                                            </>
                                                        )}
                                                    </div>
                                                </div>
                                            </div>

                                            {/* Images multiples */}
                                            <div>
                                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                                    Images supplémentaires
                                                </label>
                                                
                                                {/* Images existantes */}
                                                {existingImages.length > 0 && (
                                                    <div className="mb-3">
                                                        <p className="text-xs text-gray-500 mb-2">Images actuelles :</p>
                                                        <div className="grid grid-cols-4 gap-2">
                                                            {existingImages.map((image) => (
                                                                <div key={image.id} className="relative group">
                                                                    <img
                                                                        src={image.url_miniature || image.url_originale}
                                                                        alt={image.alt_text || 'Image produit'}
                                                                        className="h-20 w-20 object-cover rounded"
                                                                    />
                                                                    <button
                                                                        type="button"
                                                                        onClick={() => {
                                                                            // Ajouter l'ID à la liste de suppression
                                                                            setImagesToDelete(prev => [...prev, image.id]);
                                                                            // Retirer de la liste des images existantes
                                                                            setExistingImages(prev => prev.filter(img => img.id !== image.id));
                                                                        }}
                                                                        className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 hover:bg-red-600 opacity-0 group-hover:opacity-100 transition-opacity"
                                                                    >
                                                                        <X className="w-3 h-3" />
                                                                    </button>
                                                                </div>
                                                            ))}
                                                        </div>
                                                    </div>
                                                )}
                                                
                                                {/* Nouvelles images à ajouter */}
                                                <input
                                                    type="file"
                                                    name="images"
                                                    multiple
                                                    accept="image/*"
                                                    onChange={handleFormChange}
                                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                                                />
                                                {multipleImages.length > 0 && (
                                                    <div className="mt-2">
                                                        <p className="text-xs text-gray-500 mb-2">Nouvelles images à ajouter :</p>
                                                        <div className="grid grid-cols-4 gap-2">
                                                            {multipleImages.map((image, index) => (
                                                                <div key={index} className="relative group">
                                                                    <img
                                                                        src={image}
                                                                        alt={`Aperçu ${index + 1}`}
                                                                        className="h-20 w-20 object-cover rounded"
                                                                    />
                                                                    <button
                                                                        type="button"
                                                                        onClick={() => {
                                                                            setMultipleImages(prev => prev.filter((_, i) => i !== index));
                                                                            // Aussi retirer du formData
                                                                            setFormData(prev => ({
                                                                                ...prev,
                                                                                images: prev.images?.filter((_, i) => i !== index) || []
                                                                            }));
                                                                        }}
                                                                        className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 hover:bg-red-600 opacity-0 group-hover:opacity-100 transition-opacity"
                                                                    >
                                                                        <X className="w-3 h-3" />
                                                                    </button>
                                                                </div>
                                                            ))}
                                                        </div>
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    </div>

                                    {/* Options avancées */}
                                    <div className="bg-gray-50 rounded-lg p-4">
                                        <h3 className="text-lg font-semibold text-gray-900 mb-4">Options</h3>
                                        
                                        <div className="space-y-4">
                                            <div className="flex items-center">
                                                <input
                                                    type="checkbox"
                                                    name="fait_sur_mesure"
                                                    checked={formData.fait_sur_mesure}
                                                    onChange={handleFormChange}
                                                    className="h-4 w-4 text-purple-600 focus:ring-purple-500 border-gray-300 rounded"
                                                />
                                                <label className="ml-2 text-sm text-gray-700">
                                                    Produit fait sur mesure
                                                </label>
                                            </div>

                                            {formData.fait_sur_mesure && (
                                                <div className="grid grid-cols-2 gap-4">
                                                    <div>
                                                        <label className="block text-sm font-medium text-gray-700 mb-1">
                                                            Délai de production (jours)
                                                        </label>
                                                        <input
                                                            type="number"
                                                            name="delai_production_jours"
                                                            value={formData.delai_production_jours}
                                                            onChange={handleFormChange}
                                                            min="1"
                                                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                                                            placeholder="7"
                                                        />
                                                    </div>

                                                    <div>
                                                        <label className="block text-sm font-medium text-gray-700 mb-1">
                                                            Coût de production (XOF)
                                                        </label>
                                                        <input
                                                            type="number"
                                                            name="cout_production"
                                                            value={formData.cout_production}
                                                            onChange={handleFormChange}
                                                            min="0"
                                                            step="1"
                                                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                                                            placeholder="0"
                                                        />
                                                    </div>
                                                </div>
                                            )}

                                            <div className="flex items-center">
                                                <input
                                                    type="checkbox"
                                                    name="est_visible"
                                                    checked={formData.est_visible}
                                                    onChange={handleFormChange}
                                                    className="h-4 w-4 text-purple-600 focus:ring-purple-500 border-gray-300 rounded"
                                                />
                                                <label className="ml-2 text-sm text-gray-700">
                                                    Produit visible sur le site
                                                </label>
                                            </div>

                                            <div className="flex items-center">
                                                <input
                                                    type="checkbox"
                                                    name="est_populaire"
                                                    checked={formData.est_populaire}
                                                    onChange={handleFormChange}
                                                    className="h-4 w-4 text-purple-600 focus:ring-purple-500 border-gray-300 rounded"
                                                />
                                                <label className="ml-2 text-sm text-gray-700">
                                                    Marquer comme populaire
                                                </label>
                                            </div>

                                            <div className="flex items-center">
                                                <input
                                                    type="checkbox"
                                                    name="est_nouveaute"
                                                    checked={formData.est_nouveaute}
                                                    onChange={handleFormChange}
                                                    className="h-4 w-4 text-purple-600 focus:ring-purple-500 border-gray-300 rounded"
                                                />
                                                <label className="ml-2 text-sm text-gray-700">
                                                    Marquer comme nouveauté
                                                </label>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Variantes */}
                                    <div className="bg-gray-50 rounded-lg p-4">
                                        <h3 className="text-lg font-semibold text-gray-900 mb-4">Variantes</h3>
                                        
                                        <div className="space-y-4">
                                            {/* Tailles */}
                                            <div>
                                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                                    Tailles disponibles
                                                </label>
                                                <div className="space-y-2">
                                                    {formData.tailles_disponibles.map((taille, index) => (
                                                        <div key={index} className="flex items-center space-x-2">
                                                            <input
                                                                type="text"
                                                                value={taille}
                                                                onChange={(e) => handleArrayChange('tailles_disponibles', index, e.target.value)}
                                                                className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                                                                placeholder="Ex: S, M, L, XL"
                                                            />
                                                            <button
                                                                type="button"
                                                                onClick={() => removeArrayItem('tailles_disponibles', index)}
                                                                className="text-red-600 hover:text-red-800"
                                                            >
                                                                <X className="w-4 h-4" />
                                                            </button>
                                                        </div>
                                                    ))}
                                                    <button
                                                        type="button"
                                                        onClick={() => addArrayItem('tailles_disponibles')}
                                                        className="text-purple-600 hover:text-purple-800 text-sm"
                                                    >
                                                        + Ajouter une taille
                                                    </button>
                                                </div>
                                            </div>

                                            {/* Couleurs */}
                                            <div>
                                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                                    Couleurs disponibles
                                                </label>
                                                <div className="space-y-2">
                                                    {formData.couleurs_disponibles.map((couleur, index) => (
                                                        <div key={index} className="flex items-center space-x-2">
                                                            <input
                                                                type="text"
                                                                value={couleur}
                                                                onChange={(e) => handleArrayChange('couleurs_disponibles', index, e.target.value)}
                                                                className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                                                                placeholder="Ex: Rouge, Bleu, Vert"
                                                            />
                                                            <button
                                                                type="button"
                                                                onClick={() => removeArrayItem('couleurs_disponibles', index)}
                                                                className="text-red-600 hover:text-red-800"
                                                            >
                                                                <X className="w-4 h-4" />
                                                            </button>
                                                        </div>
                                                    ))}
                                                    <button
                                                        type="button"
                                                        onClick={() => addArrayItem('couleurs_disponibles')}
                                                        className="text-purple-600 hover:text-purple-800 text-sm"
                                                    >
                                                        + Ajouter une couleur
                                                    </button>
                                                </div>
                                            </div>

                                            {/* Matériaux */}
                                            <div>
                                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                                    Matériaux nécessaires
                                                </label>
                                                <div className="space-y-2">
                                                    {formData.materiaux_necessaires.map((materiau, index) => (
                                                        <div key={index} className="flex items-center space-x-2">
                                                            <input
                                                                type="text"
                                                                value={materiau}
                                                                onChange={(e) => handleArrayChange('materiaux_necessaires', index, e.target.value)}
                                                                className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                                                                placeholder="Ex: Coton, Soie, Polyester"
                                                            />
                                                            <button
                                                                type="button"
                                                                onClick={() => removeArrayItem('materiaux_necessaires', index)}
                                                                className="text-red-600 hover:text-red-800"
                                                            >
                                                                <X className="w-4 h-4" />
                                                            </button>
                                                        </div>
                                                    ))}
                                                    <button
                                                        type="button"
                                                        onClick={() => addArrayItem('materiaux_necessaires')}
                                                        className="text-purple-600 hover:text-purple-800 text-sm"
                                                    >
                                                        + Ajouter un matériau
                                                    </button>
                                                </div>
                                            </div>
                                        </div>
                                    </div>

                                    {/* SEO */}
                                    <div className="bg-gray-50 rounded-lg p-4">
                                        <h3 className="text-lg font-semibold text-gray-900 mb-4">SEO</h3>
                                        
                                        <div className="space-y-4">
                                            <div>
                                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                                    Titre SEO
                                                </label>
                                                <input
                                                    type="text"
                                                    name="meta_titre"
                                                    value={formData.meta_titre}
                                                    onChange={handleFormChange}
                                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                                                    placeholder="Titre pour les moteurs de recherche"
                                                    maxLength="60"
                                                />
                                            </div>

                                            <div>
                                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                                    Description SEO
                                                </label>
                                                <textarea
                                                    name="meta_description"
                                                    value={formData.meta_description}
                                                    onChange={handleFormChange}
                                                    rows="3"
                                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                                                    placeholder="Description pour les moteurs de recherche"
                                                    maxLength="160"
                                                />
                                            </div>

                                            <div>
                                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                                    Tags (séparés par des virgules)
                                                </label>
                                                <input
                                                    type="text"
                                                    name="tags"
                                                    value={formData.tags}
                                                    onChange={handleFormChange}
                                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                                                    placeholder="mode, vêtements, femme, tendance"
                                                />
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Boutons d'action */}
                            <div className="flex items-center justify-end space-x-4 pt-6 mt-6 border-t">
                                <button
                                    type="button"
                                    onClick={closeModal}
                                    className="px-6 py-2 text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                                >
                                    Annuler
                                </button>
                                <button
                                    type="submit"
                                    disabled={submitting}
                                    className="px-6 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2 transition-colors"
                                >
                                    {submitting && <RefreshCw className="w-4 h-4 animate-spin" />}
                                    <span>
                                        {submitting 
                                            ? 'Sauvegarde...' 
                                            : (editingProduct ? 'Modifier le produit' : 'Créer le produit')
                                        }
                                    </span>
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Products;