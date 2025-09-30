import React, { useState, useEffect } from 'react';
import Navbar from '../components/Navbar';
import { 
  Filter, Star, Heart, ShoppingCart, X, ChevronDown, Grid, List,
  ArrowUpDown, SlidersHorizontal, Flame, Sparkles, TrendingUp
} from 'lucide-react';
import api from '../utils/api';

const CategoryPage = () => {
  const [category, setCategory] = useState(null);
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [cartCount, setCartCount] = useState(0);
  const [wishlistCount, setWishlistCount] = useState(0);
  const [categories, setCategories] = useState([]);
  const [filtersOpen, setFiltersOpen] = useState(false);
  const [viewMode, setViewMode] = useState('grid');
  const [sortBy, setSortBy] = useState('recent');
  const [filters, setFilters] = useState({
    min_price: '',
    max_price: '',
    on_sale: false
  });

  const slug = window.location.pathname.split('/').pop();

  useEffect(() => {
    loadCategoryData();
    loadNavbarData();
  }, [slug, sortBy, filters]);

  const loadNavbarData = async () => {
    try {
      const [cartRes, wishlistRes, catRes] = await Promise.all([
        api.getCartCount(),
        api.getWishlistCount(),
        api.getCategories()
      ]);
      
      if (cartRes.success) setCartCount(cartRes.data.count || 0);
      if (wishlistRes.success) setWishlistCount(wishlistRes.data.count || 0);
      if (catRes.success) setCategories(catRes.data || []);
    } catch (error) {
      console.error('Erreur navbar:', error);
    }
  };

 const loadCategoryData = async () => {
  try {
    setLoading(true);
    
    const filterParams = {
      sort: sortBy,
      ...filters
    };

    console.log('Chargement catégorie:', slug);
    console.log('Filtres appliqués:', filterParams);

    const [categoryResponse, productsResponse] = await Promise.all([
      api.getCategoryBySlug(slug),
      api.getCategoryProducts(slug, filterParams)
    ]);

    console.log('Réponse catégorie:', categoryResponse);
    console.log('Réponse produits BRUTE:', productsResponse);

    if (productsResponse.success) {
  // Vérifier la structure exacte
  console.log('Structure data:', productsResponse.data);
  
  let productsList = [];
  
  // Si data.products existe
  if (productsResponse.data.products) {
    productsList = productsResponse.data.products;
  } 
  // Si data est directement le tableau
  else if (Array.isArray(productsResponse.data)) {
    productsList = productsResponse.data;
  }
  // Sinon récupérer tout data
  else {
    productsList = productsResponse.data || [];
  }
  
  console.log('✅ Liste finale:', productsList);
  console.log('📊 Nombre:', productsList.length);
  setProducts(productsList);
}
  } catch (error) {
    console.error('Erreur chargement catégorie:', error);
  } finally {
    setLoading(false);
  }
};

  const handleNavigation = (type, slug = null, params = {}) => {
    const routes = {
      home: '/',
      category: `/categories/${slug}`,
      product: `/products/${slug}`,
      cart: '/cart',
      wishlist: '/wishlist',
      search: `/search?q=${encodeURIComponent(params.q)}`
    };
    if (routes[type]) window.location.href = routes[type];
  };

  const handleSearch = async (query) => {
    try {
      const response = await api.quickSearch(query);
      return response.success ? response.data : { produits: [], categories: [] };
    } catch (error) {
      return { produits: [], categories: [] };
    }
  };

  const handleAddToCart = async (productId) => {
    try {
      const response = await api.addToCart(productId, 1);
      if (response.success) {
        setCartCount(prev => prev + 1);
        alert('✅ Produit ajouté au panier !');
      }
    } catch (error) {
      alert('❌ Erreur lors de l\'ajout');
    }
  };

  const handleAddToWishlist = async (productId) => {
    try {
      const response = await api.addToWishlist(productId);
      if (response.success) {
        setWishlistCount(prev => prev + 1);
        alert('❤️ Ajouté aux favoris !');
      }
    } catch (error) {
      console.error('Erreur favoris:', error);
    }
  };

  const applyFilters = (newFilters) => {
    setFilters(prev => ({ ...prev, ...newFilters }));
    setFiltersOpen(false);
  };

  const clearFilters = () => {
    setFilters({
      min_price: '',
      max_price: '',
      on_sale: false
    });
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-purple-50 via-pink-50 to-purple-50">
        <div className="text-center">
          <div className="w-20 h-20 bg-gradient-to-r from-purple-600 to-pink-600 rounded-full flex items-center justify-center mx-auto mb-6 animate-bounce">
            <span className="text-white font-bold text-3xl">V</span>
          </div>
          <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-purple-600 mx-auto mb-4"></div>
          <p className="text-gray-600 text-lg font-medium">Chargement...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-purple-50">
      <Navbar
        cartCount={cartCount}
        wishlistCount={wishlistCount}
        categories={categories}
        onNavigate={handleNavigation}
        onSearch={handleSearch}
      />

      <div className="pt-4">
        {/* Category Header */}
        <div className="bg-gradient-to-r from-purple-600 via-pink-600 to-purple-600 text-white py-12">
          <div className="max-w-7xl mx-auto px-4">
            <div className="flex items-center gap-2 text-sm mb-4 opacity-90">
              <button onClick={() => handleNavigation('home')} className="hover:underline">Accueil</button>
              <span>/</span>
              <span>{category?.nom}</span>
            </div>
            <h1 className="text-4xl md:text-5xl font-bold mb-3">{category?.nom}</h1>
            <p className="text-lg opacity-90 mb-2">{category?.description}</p>
           <p className="text-sm opacity-75">
  {products.length === 0 ? 'Aucun produit disponible' : 
   products.length === 1 ? '1 produit disponible' : 
   `${products.length} produits disponibles`}
</p>
          </div>
        </div>

        {/* Toolbar */}
        <div className="bg-white border-b sticky top-0 z-30 shadow-md">
          <div className="max-w-7xl mx-auto px-4 py-4">
            <div className="flex items-center justify-between flex-wrap gap-4">
              <div className="flex items-center gap-3">
                <button
                  onClick={() => setFiltersOpen(true)}
                  className="flex items-center gap-2 px-4 py-2 border-2 border-gray-300 rounded-xl hover:bg-purple-50 hover:border-purple-600 transition-all"
                >
                  <SlidersHorizontal className="h-5 w-5" />
                  <span className="font-medium">Filtres</span>
                </button>

                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value)}
                  className="px-4 py-2 border-2 border-gray-300 rounded-xl font-medium focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                >
                  <option value="recent">Plus récents</option>
                  <option value="price_asc">Prix croissant</option>
                  <option value="price_desc">Prix décroissant</option>
                  <option value="popular">Plus populaires</option>
                  <option value="rating">Mieux notés</option>
                </select>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => setViewMode('grid')}
                  className={`p-2 rounded-lg transition-all ${viewMode === 'grid' ? 'bg-purple-600 text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}
                >
                  <Grid className="h-5 w-5" />
                </button>
                <button
                  onClick={() => setViewMode('list')}
                  className={`p-2 rounded-lg transition-all ${viewMode === 'list' ? 'bg-purple-600 text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}
                >
                  <List className="h-5 w-5" />
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Products Grid */}
        <div className="max-w-7xl mx-auto px-4 py-8">
          {products.length > 0 ? (
            <div className={viewMode === 'grid' 
              ? 'grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6'
              : 'flex flex-col gap-4'
            }>
              {products.map((product) => (
                <ProductCard
                  key={product.id}
                  product={product}
                  viewMode={viewMode}
                  onNavigate={handleNavigation}
                  onAddToCart={handleAddToCart}
                  onAddToWishlist={handleAddToWishlist}
                />
              ))}
            </div>
          ) : (
            <div className="text-center py-20">
              <div className="w-24 h-24 bg-gray-200 rounded-full flex items-center justify-center mx-auto mb-6">
                <ShoppingCart className="h-12 w-12 text-gray-400" />
              </div>
              <h3 className="text-2xl font-bold text-gray-900 mb-2">Aucun produit trouvé</h3>
              <p className="text-gray-600 mb-6">Essayez de modifier vos filtres</p>
              <button
                onClick={clearFilters}
                className="px-6 py-3 bg-purple-600 text-white rounded-xl hover:bg-purple-700 transition-all font-medium"
              >
                Réinitialiser les filtres
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Filters Sidebar */}
      {filtersOpen && (
        <FiltersSidebar
          filters={filters}
          onClose={() => setFiltersOpen(false)}
          onApply={applyFilters}
          onClear={clearFilters}
        />
      )}

      <style>{`
        .line-clamp-2 {
          display: -webkit-box;
          -webkit-line-clamp: 2;
          -webkit-box-orient: vertical;
          overflow: hidden;
        }
      `}</style>
    </div>
  );
};

// Product Card Component
const ProductCard = ({ product, viewMode, onNavigate, onAddToCart, onAddToWishlist }) => {
  const [isHovered, setIsHovered] = useState(false);

  const reduction = product.prix_promo 
    ? Math.round(((product.prix - product.prix_promo) / product.prix) * 100)
    : 0;

  if (viewMode === 'list') {
    return (
      <div
        onClick={() => onNavigate('product', product.slug)}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
        className="bg-white rounded-2xl overflow-hidden shadow-md hover:shadow-2xl transition-all duration-300 cursor-pointer flex"
      >
        <div className="w-48 h-48 relative flex-shrink-0">
          <img
            src={product.image || '/images/placeholder-product.jpg'}
            alt={product.nom}
            className="w-full h-full object-cover"
            onError={(e) => {
              e.target.onerror = null;
              e.target.src = '/images/placeholder-product.jpg';
            }}
          />
          {product.prix_promo && (
            <div className="absolute top-3 left-3 bg-red-500 text-white px-3 py-1 rounded-full text-xs font-bold">
              -{reduction}%
            </div>
          )}
        </div>
        <div className="flex-1 p-6 flex flex-col justify-between">
          <div>
            <h3 className="text-xl font-bold text-gray-900 mb-2">{product.nom}</h3>
            {product.description_courte && (
              <p className="text-gray-600 text-sm mb-4 line-clamp-2">{product.description_courte}</p>
            )}
            {product.note_moyenne > 0 && (
              <div className="flex items-center gap-2 mb-4">
                <div className="flex">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} className={`h-4 w-4 ${i < Math.floor(product.note_moyenne) ? 'text-yellow-400 fill-current' : 'text-gray-300'}`} />
                  ))}
                </div>
                <span className="text-sm text-gray-600">({product.nombre_avis})</span>
              </div>
            )}
          </div>
          <div className="flex items-center justify-between">
            <div>
              <span className="text-2xl font-bold text-purple-600">{(product.prix_promo || product.prix).toLocaleString()} FCFA</span>
              {product.prix_promo && (
                <span className="text-sm text-gray-400 line-through ml-2">{product.prix.toLocaleString()}</span>
              )}
            </div>
            <div className="flex gap-2">
              <button
                onClick={(e) => { e.stopPropagation(); onAddToWishlist(product.id); }}
                className="p-3 bg-pink-50 rounded-full hover:bg-pink-100 transition-all"
              >
                <Heart className="h-5 w-5 text-pink-600" />
              </button>
              <button
                onClick={(e) => { e.stopPropagation(); onAddToCart(product.id); }}
                className="px-6 py-3 bg-purple-600 text-white rounded-full hover:bg-purple-700 transition-all flex items-center gap-2"
              >
                <ShoppingCart className="h-5 w-5" />
                Ajouter
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div
      onClick={() => onNavigate('product', product.slug)}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      className="group bg-white rounded-2xl overflow-hidden shadow-lg hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-2 cursor-pointer"
    >
      <div className="relative aspect-[3/4] bg-gray-100 overflow-hidden">
        <img
          src={product.image || '/images/placeholder-product.jpg'}
          alt={product.nom}
          className={`w-full h-full object-cover transition-transform duration-500 ${isHovered ? 'scale-110' : 'scale-100'}`}
          onError={(e) => {
            e.target.onerror = null;
            e.target.src = '/images/placeholder-product.jpg';
          }}
        />
        
        <div className="absolute top-3 left-3 flex flex-col gap-2">
          {product.prix_promo && (
            <span className="bg-red-500 text-white px-3 py-1 rounded-full text-xs font-bold shadow-lg">
              -{reduction}%
            </span>
          )}
          {product.est_nouveaute && (
            <span className="bg-blue-500 text-white px-3 py-1 rounded-full text-xs font-bold shadow-lg flex items-center gap-1">
              <Sparkles className="h-3 w-3" />
              NEW
            </span>
          )}
          {product.est_populaire && (
            <span className="bg-yellow-500 text-white px-3 py-1 rounded-full text-xs font-bold shadow-lg flex items-center gap-1">
              <Flame className="h-3 w-3" />
              HOT
            </span>
          )}
        </div>

        <button
          onClick={(e) => { e.stopPropagation(); onAddToWishlist(product.id); }}
          className={`absolute top-3 right-3 w-10 h-10 bg-white rounded-full flex items-center justify-center shadow-lg transition-all ${isHovered ? 'opacity-100 scale-100' : 'opacity-0 scale-75'}`}
        >
          <Heart className="h-5 w-5 text-gray-600 hover:text-pink-500" />
        </button>

        <div className={`absolute bottom-0 left-0 right-0 bg-purple-600 text-white py-3 text-center font-medium transition-transform duration-300 ${isHovered ? 'translate-y-0' : 'translate-y-full'}`}
          onClick={(e) => { e.stopPropagation(); onAddToCart(product.id); }}
        >
          <div className="flex items-center justify-center gap-2">
            <ShoppingCart className="h-4 w-4" />
            <span>Ajouter au panier</span>
          </div>
        </div>
      </div>

      <div className="p-4">
        <h3 className="font-semibold text-gray-900 line-clamp-2 mb-2 group-hover:text-purple-600 transition-colors">
          {product.nom}
        </h3>

        {product.note_moyenne > 0 && (
          <div className="flex items-center gap-1 mb-2">
            <div className="flex">
              {[...Array(5)].map((_, i) => (
                <Star key={i} className={`h-4 w-4 ${i < Math.floor(product.note_moyenne) ? 'text-yellow-400 fill-current' : 'text-gray-300'}`} />
              ))}
            </div>
            <span className="text-xs text-gray-600">({product.nombre_avis})</span>
          </div>
        )}

        <div className="flex items-center gap-2">
          <span className="text-lg font-bold text-purple-600">
            {(product.prix_promo || product.prix).toLocaleString()} FCFA
          </span>
          {product.prix_promo && (
            <span className="text-sm text-gray-400 line-through">
              {product.prix.toLocaleString()}
            </span>
          )}
        </div>
      </div>
    </div>
  );
};

// Filters Sidebar
const FiltersSidebar = ({ filters, onClose, onApply, onClear }) => {
  const [localFilters, setLocalFilters] = useState(filters);

  return (
    <div className="fixed inset-0 z-50 flex items-end md:items-center justify-center bg-black/50" onClick={onClose}>
      <div className="bg-white rounded-t-3xl md:rounded-3xl w-full md:max-w-md max-h-[80vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
        <div className="p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold">Filtres</h2>
            <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-full">
              <X className="h-6 w-6" />
            </button>
          </div>

          <div className="space-y-6">
            <div>
              <h3 className="font-semibold mb-3">Prix</h3>
              <div className="grid grid-cols-2 gap-3">
                <input
                  type="number"
                  placeholder="Min"
                  value={localFilters.min_price}
                  onChange={(e) => setLocalFilters({...localFilters, min_price: e.target.value})}
                  className="px-4 py-3 border-2 border-gray-300 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                />
                <input
                  type="number"
                  placeholder="Max"
                  value={localFilters.max_price}
                  onChange={(e) => setLocalFilters({...localFilters, max_price: e.target.value})}
                  className="px-4 py-3 border-2 border-gray-300 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                />
              </div>
            </div>

            <div>
              <label className="flex items-center gap-3 cursor-pointer">
                <input
                  type="checkbox"
                  checked={localFilters.on_sale}
                  onChange={(e) => setLocalFilters({...localFilters, on_sale: e.target.checked})}
                  className="w-5 h-5 text-purple-600 rounded focus:ring-purple-500"
                />
                <span className="font-medium">Uniquement en promotion</span>
              </label>
            </div>
          </div>

          <div className="mt-8 flex gap-3">
            <button
              onClick={onClear}
              className="flex-1 px-6 py-4 border-2 border-gray-300 rounded-xl font-semibold hover:bg-gray-50 transition-all"
            >
              Réinitialiser
            </button>
            <button
              onClick={() => onApply(localFilters)}
              className="flex-1 px-6 py-4 bg-purple-600 text-white rounded-xl font-semibold hover:bg-purple-700 transition-all"
            >
              Appliquer
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CategoryPage;