// resources/js/client/pages/CategoryPage.jsx
import React, { useState, useEffect, useContext } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ChevronLeft, Filter, Star, Heart, ShoppingCart, X, ChevronDown } from 'lucide-react';
import { AppContext } from '../app';
import api from '../utils/api';

// Product Card - Style Shein
const ProductCard = ({ product, onClick, onAddToCart, onAddToWishlist }) => {
  const { config } = useContext(AppContext);
  const [isHovered, setIsHovered] = useState(false);

  const reduction = product.prix_promo 
    ? Math.round(((product.prix - product.prix_promo) / product.prix) * 100)
    : 0;

  return (
    <div
      className="group relative bg-white rounded-lg overflow-hidden cursor-pointer transition-all duration-300 hover:shadow-xl"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      onClick={onClick}
    >
      {/* Badges */}
      <div className="absolute top-2 left-2 z-10 flex flex-col gap-1">
        {product.prix_promo && (
          <span className="bg-red-500 text-white text-xs font-bold px-2 py-1 rounded">
            -{reduction}%
          </span>
        )}
        {product.est_nouveaute && (
          <span className="bg-blue-500 text-white text-xs font-bold px-2 py-1 rounded">
            NEW
          </span>
        )}
        {product.est_populaire && (
          <span className="bg-yellow-500 text-white text-xs font-bold px-2 py-1 rounded">
            HOT
          </span>
        )}
      </div>

      {/* Wishlist button */}
      <button
        onClick={(e) => {
          e.stopPropagation();
          onAddToWishlist(product.id);
        }}
        className="absolute top-2 right-2 z-10 w-8 h-8 bg-white rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity shadow-md hover:bg-red-50"
      >
        <Heart className="h-4 w-4 text-gray-600 hover:text-red-500" />
      </button>

      {/* Image */}
      <div className="relative aspect-[3/4] bg-gray-100 overflow-hidden">
        <img
          src={product.image_principale || '/images/placeholder.jpg'}
          alt={product.nom}
          className={`w-full h-full object-cover transition-transform duration-500 ${
            isHovered ? 'scale-110' : 'scale-100'
          }`}
        />

        {/* Quick add to cart */}
        <div className={`absolute bottom-0 left-0 right-0 bg-purple-600 text-white py-3 text-center font-medium transition-transform duration-300 ${
          isHovered ? 'translate-y-0' : 'translate-y-full'
        }`}
          onClick={(e) => {
            e.stopPropagation();
            onAddToCart(product.id);
          }}
        >
          <div className="flex items-center justify-center gap-2">
            <ShoppingCart className="h-4 w-4" />
            <span>Ajouter au panier</span>
          </div>
        </div>
      </div>

      {/* Product Info */}
      <div className="p-3">
        <h3 className="text-sm font-medium text-gray-900 line-clamp-2 mb-2 group-hover:text-purple-600 transition-colors">
          {product.nom}
        </h3>

        {/* Rating */}
        {product.note_moyenne > 0 && (
          <div className="flex items-center gap-1 mb-2">
            <div className="flex">
              {[...Array(5)].map((_, i) => (
                <Star
                  key={i}
                  className={`h-3 w-3 ${
                    i < Math.floor(product.note_moyenne)
                      ? 'text-yellow-400 fill-current'
                      : 'text-gray-300'
                  }`}
                />
              ))}
            </div>
            <span className="text-xs text-gray-600">({product.nombre_avis})</span>
          </div>
        )}

        {/* Price */}
        <div className="flex items-center gap-2">
          <span className="text-lg font-bold text-gray-900">
            {(product.prix_promo || product.prix).toLocaleString()} {config?.currency}
          </span>
          {product.prix_promo && (
            <span className="text-sm text-gray-400 line-through">
              {product.prix.toLocaleString()}
            </span>
          )}
        </div>

        {/* Colors available */}
        {product.couleurs_disponibles && product.couleurs_disponibles.length > 0 && (
          <div className="flex items-center gap-1 mt-2">
            {product.couleurs_disponibles.slice(0, 5).map((couleur, idx) => (
              <div
                key={idx}
                className="w-4 h-4 rounded-full border border-gray-300"
                style={{ backgroundColor: couleur.toLowerCase() }}
                title={couleur}
              />
            ))}
            {product.couleurs_disponibles.length > 5 && (
              <span className="text-xs text-gray-500">
                +{product.couleurs_disponibles.length - 5}
              </span>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

// Filters Sidebar
const FiltersSidebar = ({ isOpen, onClose, onFilterChange }) => {
  const [expandedSections, setExpandedSections] = useState({
    price: true,
    size: true,
    color: true
  });
  const [minPrice, setMinPrice] = useState('');
  const [maxPrice, setMaxPrice] = useState('');

  const toggleSection = (section) => {
    setExpandedSections(prev => ({
      ...prev,
      [section]: !prev[section]
    }));
  };

  const applyPriceFilter = () => {
    onFilterChange({
      min_price: minPrice,
      max_price: maxPrice
    });
  };

  return (
    <div className={`fixed lg:relative inset-y-0 left-0 z-40 w-80 bg-white shadow-xl lg:shadow-none transform transition-transform duration-300 ${
      isOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
    } overflow-y-auto`}>
      <div className="p-6">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-bold text-gray-900">Filtres</h2>
          <button onClick={onClose} className="lg:hidden p-2 hover:bg-gray-100 rounded-full">
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Price Range */}
        <div className="mb-6">
          <button
            onClick={() => toggleSection('price')}
            className="flex items-center justify-between w-full mb-3"
          >
            <h3 className="font-semibold text-gray-900">Prix</h3>
            <ChevronDown className={`h-5 w-5 transition-transform ${expandedSections.price ? 'rotate-180' : ''}`} />
          </button>

          {expandedSections.price && (
            <div className="space-y-3">
              <div className="grid grid-cols-2 gap-3">
                <input
                  type="number"
                  placeholder="Min"
                  value={minPrice}
                  onChange={(e) => setMinPrice(e.target.value)}
                  className="px-3 py-2 border border-gray-300 rounded-lg text-sm"
                />
                <input
                  type="number"
                  placeholder="Max"
                  value={maxPrice}
                  onChange={(e) => setMaxPrice(e.target.value)}
                  className="px-3 py-2 border border-gray-300 rounded-lg text-sm"
                />
              </div>
              <button 
                onClick={applyPriceFilter}
                className="w-full bg-purple-600 text-white py-2 rounded-lg text-sm font-medium hover:bg-purple-700 transition-colors"
              >
                Appliquer
              </button>
            </div>
          )}
        </div>

        {/* Sizes */}
        <div className="mb-6 border-t pt-6">
          <button
            onClick={() => toggleSection('size')}
            className="flex items-center justify-between w-full mb-3"
          >
            <h3 className="font-semibold text-gray-900">Taille</h3>
            <ChevronDown className={`h-5 w-5 transition-transform ${expandedSections.size ? 'rotate-180' : ''}`} />
          </button>

          {expandedSections.size && (
            <div className="grid grid-cols-4 gap-2">
              {['XS', 'S', 'M', 'L', 'XL', 'XXL'].map((size) => (
                <button
                  key={size}
                  onClick={() => onFilterChange({ size })}
                  className="px-3 py-2 border border-gray-300 rounded-lg text-sm font-medium hover:border-purple-600 hover:text-purple-600 transition-colors"
                >
                  {size}
                </button>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

// Category Page
const CategoryPage = () => {
  const { slug } = useParams();
  const navigate = useNavigate();
  const { config } = useContext(AppContext);
  
  const [category, setCategory] = useState(null);
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filtersOpen, setFiltersOpen] = useState(false);
  const [filters, setFilters] = useState({});
  const [pagination, setPagination] = useState(null);

  useEffect(() => {
    loadCategoryData();
  }, [slug, filters]);

  const loadCategoryData = async () => {
    try {
      setLoading(true);
      const [categoryResponse, productsResponse] = await Promise.all([
        api.getCategoryBySlug(slug),
        api.getCategoryProducts(slug, filters)
      ]);

      if (categoryResponse.success) {
        setCategory(categoryResponse.data);
      }

      if (productsResponse.success) {
        setProducts(productsResponse.data.products || []);
        setPagination(productsResponse.data.pagination);
      }
    } catch (error) {
      console.error('Erreur chargement catégorie:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleAddToCart = async (productId) => {
    try {
      const response = await api.addToCart(productId, 1);
      if (response.success) {
        alert('Produit ajouté au panier !');
      }
    } catch (error) {
      console.error('Erreur ajout panier:', error);
    }
  };

  const handleAddToWishlist = async (productId) => {
    try {
      const response = await api.addToWishlist(productId);
      if (response.success) {
        alert('Ajouté aux favoris !');
      }
    } catch (error) {
      console.error('Erreur ajout favoris:', error);
    }
  };

  const handleFilterChange = (newFilters) => {
    setFilters(prev => ({ ...prev, ...newFilters }));
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-purple-600 mx-auto mb-4"></div>
          <p className="text-gray-600 text-lg">Chargement...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 pt-20">
      {/* Header */}
      <div className="bg-white border-b sticky top-0 z-30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <button
                onClick={() => navigate('/client/home')}
                className="p-2 hover:bg-gray-100 rounded-full transition-colors"
              >
                <ChevronLeft className="h-5 w-5" />
              </button>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">{category?.nom}</h1>
                <p className="text-sm text-gray-600">{products.length} produits</p>
              </div>
            </div>

            <button
              onClick={() => setFiltersOpen(true)}
              className="lg:hidden flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
            >
              <Filter className="h-5 w-5" />
              <span>Filtres</span>
            </button>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex gap-8">
          {/* Filters Sidebar */}
          <FiltersSidebar
            isOpen={filtersOpen}
            onClose={() => setFiltersOpen(false)}
            onFilterChange={handleFilterChange}
          />

          {/* Products Grid */}
          <div className="flex-1">
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {products.map((product) => (
                <ProductCard
                  key={product.id}
                  product={product}
                  onClick={() => navigate(`/products/${product.slug}`)}
                  onAddToCart={handleAddToCart}
                  onAddToWishlist={handleAddToWishlist}
                />
              ))}
            </div>

            {products.length === 0 && (
              <div className="text-center py-12">
                <p className="text-gray-500">Aucun produit trouvé</p>
              </div>
            )}
          </div>
        </div>
      </div>

      <style>{`
        .line-clamp-2 {
          overflow: hidden;
          display: -webkit-box;
          -webkit-box-orient: vertical;
          -webkit-line-clamp: 2;
        }
      `}</style>
    </div>
  );
};

export default CategoryPage;