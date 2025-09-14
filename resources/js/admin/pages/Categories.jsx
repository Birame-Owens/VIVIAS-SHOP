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
    Package,
    ArrowUpDown,
    Filter,
    RefreshCw,
    X
} from 'lucide-react';
import { toast } from 'react-hot-toast';

const Categories = () => {
    const { token } = useAuth();
    const [categories, setCategories] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [sortBy, setSortBy] = useState('ordre_affichage');
    const [sortDirection, setSortDirection] = useState('asc');
    const [currentPage, setCurrentPage] = useState(1);
    const [pagination, setPagination] = useState({});
    const [showModal, setShowModal] = useState(false);
    const [editingCategory, setEditingCategory] = useState(null);
    const [formData, setFormData] = useState({
        nom: '',
        description: '',
        parent_id: '',
        ordre_affichage: 0,
        est_active: true,
        est_populaire: false,
        couleur_theme: '#6366f1'
    });
    const [formErrors, setFormErrors] = useState({});
    const [submitting, setSubmitting] = useState(false);
    const [imagePreview, setImagePreview] = useState(null);

    const API_BASE = '/api/admin';
    const getHeaders = () => ({
        'Authorization': `Bearer ${token}`,
        'Accept': 'application/json'
    });

    // Charger les catégories
    const loadCategories = async () => {
        try {
            setLoading(true);
            const params = new URLSearchParams({
                page: currentPage,
                per_page: 10,
                search: searchTerm,
                sort: sortBy,
                direction: sortDirection
            });

            const response = await fetch(`${API_BASE}/categories?${params}`, {
                headers: getHeaders()
            });

            if (!response.ok) throw new Error('Erreur lors du chargement');

            const result = await response.json();
            if (result.success) {
                setCategories(result.data.categories);
                setPagination(result.data.pagination);
            }
        } catch (error) {
            console.error('Erreur:', error);
            toast.error('Erreur lors du chargement des catégories');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        loadCategories();
    }, [currentPage, searchTerm, sortBy, sortDirection]);

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
    const openModal = (category = null) => {
        if (category) {
            setEditingCategory(category);
            setFormData({
                nom: category.nom,
                description: category.description || '',
                parent_id: category.parent_id || '',
                ordre_affichage: category.ordre_affichage,
                est_active: category.est_active,
                est_populaire: category.est_populaire,
                couleur_theme: category.couleur_theme || '#6366f1'
            });
        } else {
            setEditingCategory(null);
            setFormData({
                nom: '',
                description: '',
                parent_id: '',
                ordre_affichage: 0,
                est_active: true,
                est_populaire: false,
                couleur_theme: '#6366f1'
            });
        }
        setFormErrors({});
        setImagePreview(null);
        setShowModal(true);
    };

    // Fermer le modal
    const closeModal = () => {
        setShowModal(false);
        setEditingCategory(null);
        setFormData({});
        setFormErrors({});
        setImagePreview(null);
    };

    // Gérer les changements du formulaire
    const handleFormChange = (e) => {
        const { name, value, type, checked, files } = e.target;
        
        if (type === 'file') {
            const file = files[0];
            if (file) {
                setFormData(prev => ({ ...prev, image: file }));
                
                // Aperçu de l'image
                const reader = new FileReader();
                reader.onloadend = () => {
                    setImagePreview(reader.result);
                };
                reader.readAsDataURL(file);
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

    // Soumettre le formulaire
    const handleSubmit = async (e) => {
        e.preventDefault();
        setSubmitting(true);
        setFormErrors({});

        try {
            const formDataToSend = new FormData();
            
            Object.keys(formData).forEach(key => {
                if (formData[key] !== null && formData[key] !== undefined) {
                    formDataToSend.append(key, formData[key]);
                }
            });

            const url = editingCategory 
                ? `${API_BASE}/categories/${editingCategory.id}`
                : `${API_BASE}/categories`;
            
            const method = editingCategory ? 'POST' : 'POST';
            
            // Pour la mise à jour, ajouter _method: PUT
            if (editingCategory) {
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
                loadCategories();
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
    const toggleStatus = async (category) => {
        try {
            const response = await fetch(`${API_BASE}/categories/${category.id}/toggle-status`, {
                method: 'POST',
                headers: getHeaders()
            });

            const result = await response.json();
            if (result.success) {
                toast.success(result.message);
                loadCategories();
            } else {
                toast.error(result.message);
            }
        } catch (error) {
            console.error('Erreur:', error);
            toast.error('Erreur lors du changement de statut');
        }
    };

    // Supprimer une catégorie
    const deleteCategory = async (category) => {
        if (!confirm(`Êtes-vous sûr de vouloir supprimer la catégorie "${category.nom}" ?`)) {
            return;
        }

        try {
            const response = await fetch(`${API_BASE}/categories/${category.id}`, {
                method: 'DELETE',
                headers: getHeaders()
            });

            const result = await response.json();
            if (result.success) {
                toast.success(result.message);
                loadCategories();
            } else {
                toast.error(result.message);
            }
        } catch (error) {
            console.error('Erreur:', error);
            toast.error('Erreur lors de la suppression');
        }
    };

    return (
        <div className="p-6">
            {/* Header */}
            <div className="mb-6">
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-2xl font-bold text-gray-900">Catégories</h1>
                        <p className="text-gray-600">Gérez les catégories de produits</p>
                    </div>
                    <button
                        onClick={() => openModal()}
                        className="bg-purple-600 text-white px-4 py-2 rounded-lg hover:bg-purple-700 flex items-center space-x-2"
                    >
                        <Plus className="w-4 h-4" />
                        <span>Nouvelle catégorie</span>
                    </button>
                </div>
            </div>

            {/* Filtres et recherche */}
            <div className="bg-white rounded-lg shadow-sm border mb-6 p-4">
                <div className="flex flex-col md:flex-row md:items-center md:justify-between space-y-4 md:space-y-0">
                    <div className="flex items-center space-x-4">
                        <div className="relative">
                            <Search className="w-4 h-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                            <input
                                type="text"
                                placeholder="Rechercher une catégorie..."
                                value={searchTerm}
                                onChange={handleSearch}
                                className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                            />
                        </div>
                        
                        <button
                            onClick={loadCategories}
                            className="p-2 border border-gray-300 rounded-lg hover:bg-gray-50"
                            title="Actualiser"
                        >
                            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
                        </button>
                    </div>

                    <div className="flex items-center space-x-2">
                        <span className="text-sm text-gray-500">
                            {pagination.total || 0} catégorie(s)
                        </span>
                    </div>
                </div>
            </div>

            {/* Tableau des catégories */}
            <div className="bg-white rounded-lg shadow-sm border overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full">
                        <thead className="bg-gray-50">
                            <tr>
                                <th 
                                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                                    onClick={() => handleSort('nom')}
                                >
                                    <div className="flex items-center space-x-1">
                                        <span>Nom</span>
                                        <ArrowUpDown className="w-3 h-3" />
                                    </div>
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Image
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Description
                                </th>
                                <th 
                                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                                    onClick={() => handleSort('produits_count')}
                                >
                                    <div className="flex items-center space-x-1">
                                        <span>Produits</span>
                                        <ArrowUpDown className="w-3 h-3" />
                                    </div>
                                </th>
                                <th 
                                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                                    onClick={() => handleSort('ordre_affichage')}
                                >
                                    <div className="flex items-center space-x-1">
                                        <span>Ordre</span>
                                        <ArrowUpDown className="w-3 h-3" />
                                    </div>
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Statut
                                </th>
                                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Actions
                                </th>
                            </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                            {loading ? (
                                // Loading skeleton
                                [...Array(5)].map((_, i) => (
                                    <tr key={i}>
                                        <td className="px-6 py-4">
                                            <div className="h-4 bg-gray-200 rounded animate-pulse"></div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="w-10 h-10 bg-gray-200 rounded animate-pulse"></div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="h-4 bg-gray-200 rounded animate-pulse"></div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="h-4 bg-gray-200 rounded animate-pulse w-16"></div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="h-4 bg-gray-200 rounded animate-pulse w-8"></div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="h-6 bg-gray-200 rounded-full animate-pulse w-16"></div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="flex space-x-2">
                                                <div className="w-8 h-8 bg-gray-200 rounded animate-pulse"></div>
                                                <div className="w-8 h-8 bg-gray-200 rounded animate-pulse"></div>
                                                <div className="w-8 h-8 bg-gray-200 rounded animate-pulse"></div>
                                            </div>
                                        </td>
                                    </tr>
                                ))
                            ) : categories.length === 0 ? (
                                <tr>
                                    <td colSpan="7" className="px-6 py-8 text-center text-gray-500">
                                        {searchTerm ? 'Aucune catégorie trouvée pour cette recherche' : 'Aucune catégorie disponible'}
                                    </td>
                                </tr>
                            ) : (
                                categories.map((category) => (
                                    <tr key={category.id} className="hover:bg-gray-50">
                                        <td className="px-6 py-4">
                                            <div className="flex items-center">
                                                {category.couleur_theme && (
                                                    <div 
                                                        className="w-3 h-3 rounded-full mr-3"
                                                        style={{ backgroundColor: category.couleur_theme }}
                                                    ></div>
                                                )}
                                                <div>
                                                    <div className="font-medium text-gray-900">{category.nom}</div>
                                                    <div className="text-sm text-gray-500">#{category.slug}</div>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            {category.image ? (
                                                <img
                                                    src={category.image}
                                                    alt={category.nom}
                                                    className="w-10 h-10 rounded-lg object-cover"
                                                />
                                            ) : (
                                                <div className="w-10 h-10 rounded-lg bg-gray-100 flex items-center justify-center">
                                                    <Image className="w-4 h-4 text-gray-400" />
                                                </div>
                                            )}
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="text-sm text-gray-900">
                                                {category.description ? (
                                                    category.description.length > 50 
                                                        ? category.description.substring(0, 50) + '...'
                                                        : category.description
                                                ) : (
                                                    <span className="text-gray-400 italic">Aucune description</span>
                                                )}
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="flex items-center text-sm text-gray-900">
                                                <Package className="w-4 h-4 mr-1" />
                                                {category.produits_count}
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 text-sm text-gray-900">
                                            {category.ordre_affichage}
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="flex items-center space-x-2">
                                                <span className={`px-2 py-1 text-xs rounded-full ${
                                                    category.est_active 
                                                        ? 'bg-green-100 text-green-800' 
                                                        : 'bg-red-100 text-red-800'
                                                }`}>
                                                    {category.est_active ? 'Actif' : 'Inactif'}
                                                </span>
                                                {category.est_populaire && (
                                                    <span className="px-2 py-1 text-xs rounded-full bg-purple-100 text-purple-800">
                                                        Populaire
                                                    </span>
                                                )}
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 text-right">
                                            <div className="flex items-center justify-end space-x-2">
                                                <button
                                                    onClick={() => toggleStatus(category)}
                                                    className={`p-2 rounded-lg ${
                                                        category.est_active 
                                                            ? 'text-gray-600 hover:bg-gray-100' 
                                                            : 'text-green-600 hover:bg-green-50'
                                                    }`}
                                                    title={category.est_active ? 'Désactiver' : 'Activer'}
                                                >
                                                    {category.est_active ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                                                </button>
                                                
                                                <button
                                                    onClick={() => openModal(category)}
                                                    className="p-2 text-indigo-600 hover:bg-indigo-50 rounded-lg"
                                                    title="Modifier"
                                                >
                                                    <Edit className="w-4 h-4" />
                                                </button>
                                                
                                                <button
                                                    onClick={() => deleteCategory(category)}
                                                    className="p-2 text-red-600 hover:bg-red-50 rounded-lg"
                                                    title="Supprimer"
                                                >
                                                    <Trash2 className="w-4 h-4" />
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>

                {/* Pagination */}
                {pagination.total > pagination.per_page && (
                    <div className="px-6 py-3 bg-gray-50 border-t flex items-center justify-between">
                        <div className="text-sm text-gray-700">
                            Affichage de {((pagination.current_page - 1) * pagination.per_page) + 1} à{' '}
                            {Math.min(pagination.current_page * pagination.per_page, pagination.total)} sur{' '}
                            {pagination.total} résultats
                        </div>
                        <div className="flex space-x-2">
                            <button
                                onClick={() => setCurrentPage(pagination.current_page - 1)}
                                disabled={pagination.current_page <= 1}
                                className="px-3 py-1 border border-gray-300 rounded-lg text-sm disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
                            >
                                Précédent
                            </button>
                            <button
                                onClick={() => setCurrentPage(pagination.current_page + 1)}
                                disabled={pagination.current_page >= pagination.last_page}
                                className="px-3 py-1 border border-gray-300 rounded-lg text-sm disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
                            >
                                Suivant
                            </button>
                        </div>
                    </div>
                )}
            </div>

            {/* Modal de création/édition */}
            {showModal && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
                    <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
                        <div className="flex items-center justify-between p-6 border-b">
                            <h2 className="text-xl font-bold text-gray-900">
                                {editingCategory ? 'Modifier la catégorie' : 'Nouvelle catégorie'}
                            </h2>
                            <button
                                onClick={closeModal}
                                className="p-2 hover:bg-gray-100 rounded-lg"
                            >
                                <X className="w-5 h-5" />
                            </button>
                        </div>

                        <form onSubmit={handleSubmit} className="p-6 space-y-6">
                            {/* Nom */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Nom de la catégorie *
                                </label>
                                <input
                                    type="text"
                                    name="nom"
                                    value={formData.nom}
                                    onChange={handleFormChange}
                                    className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent ${
                                        formErrors.nom ? 'border-red-500' : 'border-gray-300'
                                    }`}
                                    placeholder="Ex: Robes traditionnelles"
                                />
                                {formErrors.nom && (
                                    <p className="mt-1 text-sm text-red-600">{formErrors.nom[0]}</p>
                                )}
                            </div>

                            {/* Description */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Description
                                </label>
                                <textarea
                                    name="description"
                                    value={formData.description}
                                    onChange={handleFormChange}
                                    rows={4}
                                    className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent ${
                                        formErrors.description ? 'border-red-500' : 'border-gray-300'
                                    }`}
                                    placeholder="Description de la catégorie..."
                                />
                                {formErrors.description && (
                                    <p className="mt-1 text-sm text-red-600">{formErrors.description[0]}</p>
                                )}
                            </div>

                            {/* Image */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Image de la catégorie
                                </label>
                                <div className="flex items-center space-x-4">
                                    <input
                                        type="file"
                                        name="image"
                                        accept="image/*"
                                        onChange={handleFormChange}
                                        className="hidden"
                                        id="category-image"
                                    />
                                    <label
                                        htmlFor="category-image"
                                        className="flex items-center px-4 py-2 border border-gray-300 rounded-lg cursor-pointer hover:bg-gray-50"
                                    >
                                        <Image className="w-4 h-4 mr-2" />
                                        Choisir une image
                                    </label>
                                    {imagePreview && (
                                        <img
                                            src={imagePreview}
                                            alt="Aperçu"
                                            className="w-16 h-16 rounded-lg object-cover"
                                        />
                                    )}
                                    {editingCategory?.image && !imagePreview && (
                                        <img
                                            src={editingCategory.image}
                                            alt="Image actuelle"
                                            className="w-16 h-16 rounded-lg object-cover"
                                        />
                                    )}
                                </div>
                                {formErrors.image && (
                                    <p className="mt-1 text-sm text-red-600">{formErrors.image[0]}</p>
                                )}
                            </div>

                            {/* Paramètres */}
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                {/* Ordre d'affichage */}
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Ordre d'affichage
                                    </label>
                                    <input
                                        type="number"
                                        name="ordre_affichage"
                                        value={formData.ordre_affichage}
                                        onChange={handleFormChange}
                                        min="0"
                                        className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent ${
                                            formErrors.ordre_affichage ? 'border-red-500' : 'border-gray-300'
                                        }`}
                                    />
                                    {formErrors.ordre_affichage && (
                                        <p className="mt-1 text-sm text-red-600">{formErrors.ordre_affichage[0]}</p>
                                    )}
                                </div>

                                {/* Couleur thème */}
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Couleur thème
                                    </label>
                                    <div className="flex items-center space-x-2">
                                        <input
                                            type="color"
                                            name="couleur_theme"
                                            value={formData.couleur_theme}
                                            onChange={handleFormChange}
                                            className="w-12 h-10 border border-gray-300 rounded-lg cursor-pointer"
                                        />
                                        <input
                                            type="text"
                                            value={formData.couleur_theme}
                                            onChange={(e) => setFormData(prev => ({ ...prev, couleur_theme: e.target.value }))}
                                            className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                                            placeholder="#6366f1"
                                        />
                                    </div>
                                    {formErrors.couleur_theme && (
                                        <p className="mt-1 text-sm text-red-600">{formErrors.couleur_theme[0]}</p>
                                    )}
                                </div>
                            </div>

                            {/* Options */}
                            <div className="space-y-4">
                                <h3 className="text-lg font-medium text-gray-900">Options</h3>
                                
                                <div className="space-y-3">
                                    <label className="flex items-center">
                                        <input
                                            type="checkbox"
                                            name="est_active"
                                            checked={formData.est_active}
                                            onChange={handleFormChange}
                                            className="h-4 w-4 text-purple-600 focus:ring-purple-500 border-gray-300 rounded"
                                        />
                                        <span className="ml-2 text-sm text-gray-700">Catégorie active</span>
                                    </label>

                                    <label className="flex items-center">
                                        <input
                                            type="checkbox"
                                            name="est_populaire"
                                            checked={formData.est_populaire}
                                            onChange={handleFormChange}
                                            className="h-4 w-4 text-purple-600 focus:ring-purple-500 border-gray-300 rounded"
                                        />
                                        <span className="ml-2 text-sm text-gray-700">Catégorie populaire</span>
                                    </label>
                                </div>
                            </div>

                            {/* Boutons */}
                            <div className="flex items-center justify-end space-x-4 pt-6 border-t">
                                <button
                                    type="button"
                                    onClick={closeModal}
                                    className="px-4 py-2 text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50"
                                >
                                    Annuler
                                </button>
                                <button
                                    type="submit"
                                    disabled={submitting}
                                    className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2"
                                >
                                    {submitting && <RefreshCw className="w-4 h-4 animate-spin" />}
                                    <span>{submitting ? 'Sauvegarde...' : (editingCategory ? 'Modifier' : 'Créer')}</span>
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Categories;