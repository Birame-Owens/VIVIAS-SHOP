import React, { useState, useEffect } from 'react';
import Navbar from '../components/Navbar';
import { 
  Filter, Star, Heart, ShoppingBag, X, ChevronDown, Grid, List,
  SlidersHorizontal, Check, Loader2, ArrowDownWideNarrow
} from 'lucide-react';
import api from '../utils/api';

console.log('📂 CategoryPage.jsx chargé');

// Footer Amélioré avec liens et réseaux sociaux
const EnhancedFooter = () => {
  const navigate = (path) => {
    window.location.href = path;
  };

  return (
    <footer className="bg-gradient-to-b from-stone-50 to-stone-100 border-t border-neutral-200 mt-auto">
      <div className="max-w-7xl mx-auto px-4 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
          {/* À propos */}
          <div>
            <h3 className="text-sm font-bold uppercase tracking-widest mb-4 text-neutral-800">VIVIAS SHOP</h3>
            <p className="text-xs text-neutral-600 leading-relaxed">
              Votre destination privilégiée pour la mode africaine authentique et contemporaine au Sénégal.
            </p>
          </div>

          {/* Navigation */}
          <div>
            <h3 className="text-sm font-bold uppercase tracking-widest mb-4 text-neutral-800">Navigation</h3>
            <ul className="space-y-2 text-xs text-neutral-600">
              <li><a href="/" className="hover:text-neutral-900 transition-colors cursor-pointer">Accueil</a></li>
              <li><a href="/categories/robes-traditionnelles" className="hover:text-neutral-900 transition-colors cursor-pointer">Robes</a></li>
              <li><a href="/categories/owens-kid" className="hover:text-neutral-900 transition-colors cursor-pointer">Enfants</a></li>
              <li><a href="/categories/montre" className="hover:text-neutral-900 transition-colors cursor-pointer">Montres</a></li>
            </ul>
          </div>

          {/* Service Client */}
          <div>
            <h3 className="text-sm font-bold uppercase tracking-widest mb-4 text-neutral-800">Service Client</h3>
            <ul className="space-y-2 text-xs text-neutral-600">
              <li><a href="https://wa.me/221784661412" target="_blank" rel="noopener noreferrer" className="hover:text-neutral-900 transition-colors">WhatsApp: +221 78 466 14 12</a></li>
              <li><a href="mailto:contact@viviasshop.sn" className="hover:text-neutral-900 transition-colors">Email: contact@viviasshop.sn</a></li>
              <li><span className="text-neutral-600">Livraison à Dakar</span></li>
              <li><span className="text-neutral-600">Paiement sécurisé</span></li>
            </ul>
          </div>

          {/* Réseaux Sociaux */}
          <div>
            <h3 className="text-sm font-bold uppercase tracking-widest mb-4 text-neutral-800">Suivez-nous</h3>
            <div className="flex gap-3">
              <a 
                href="https://instagram.com/viviasshop" 
                target="_blank" 
                rel="noopener noreferrer"
                className="w-9 h-9 border border-neutral-300 rounded-full flex items-center justify-center hover:bg-neutral-900 hover:text-white hover:border-neutral-900 transition-all"
                aria-label="Instagram"
              >
                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/>
                </svg>
              </a>
              <a 
                href="https://tiktok.com/@viviasshop" 
                target="_blank" 
                rel="noopener noreferrer"
                className="w-9 h-9 border border-neutral-300 rounded-full flex items-center justify-center hover:bg-neutral-900 hover:text-white hover:border-neutral-900 transition-all"
                aria-label="TikTok"
              >
                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-5.2 1.74 2.89 2.89 0 0 1 2.31-4.64 2.93 2.93 0 0 1 .88.13V9.4a6.84 6.84 0 0 0-1-.05A6.33 6.33 0 0 0 5 20.1a6.34 6.34 0 0 0 10.86-4.43v-7a8.16 8.16 0 0 0 4.77 1.52v-3.4a4.85 4.85 0 0 1-1-.1z"/>
                </svg>
              </a>
              <a 
                href="https://wa.me/221784661412" 
                target="_blank" 
                rel="noopener noreferrer"
                className="w-9 h-9 border border-neutral-300 rounded-full flex items-center justify-center hover:bg-green-500 hover:text-white hover:border-green-500 transition-all"
                aria-label="WhatsApp"
              >
                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.890-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
                </svg>
              </a>
            </div>
          </div>
        </div>

        {/* Copyright */}
        <div className="pt-8 border-t border-neutral-300">
          <p className="text-center text-[10px] uppercase tracking-[0.3em] text-neutral-500">
            &copy; {new Date().getFullYear()} VIVIAS SHOP. Tous droits réservés.
          </p>
        </div>
      </div>
    </footer>
  );
};

const CategoryPage = () => {
  console.log('🏷️ CategoryPage component rendu');
  
  const [category, setCategory] = useState(null);
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [cartCount, setCartCount] = useState(0);
  const [wishlistCount, setWishlistCount] = useState(0);
  const [categories, setCategories] = useState([]);
  
  // UI States
  const [filtersOpen, setFiltersOpen] = useState(false);
  const [viewMode, setViewMode] = useState('grid'); // 'grid' | 'list'
  const [sortBy, setSortBy] = useState('recent');
  
  // Filter States
  const [filters, setFilters] = useState({
    min_price: '',
    max_price: '',
    on_sale: false
  });

  const slug = window.location.pathname.split('/').pop();

  // 1. Chargement Initial
  useEffect(() => {
    loadCategoryData();
    loadNavbarData();
  }, [slug, sortBy, filters]); // Rechargement si les filtres changent

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
    } catch (error) { console.error(error); }
  };

  const loadCategoryData = async () => {
    try {
      setLoading(true);
      
      // Nettoyer les filtres - ne pas envoyer on_sale si false
      const filterParams = { sort: sortBy };
      
      if (filters.min_price) filterParams.min_price = filters.min_price;
      if (filters.max_price) filterParams.max_price = filters.max_price;
      if (filters.on_sale === true) filterParams.on_sale = true; // Uniquement si vraiment true

      console.log('🔍 Filtres envoyés:', filterParams);

      const [categoryResponse, productsResponse] = await Promise.all([
        api.getCategoryBySlug(slug),
        api.getCategoryProducts(slug, filterParams)
      ]);

      if (categoryResponse.success) setCategory(categoryResponse.data);

      // Gestion flexible de la réponse produit (tableau ou objet paginé)
      if (productsResponse.success) {
        let productsList = [];
        if (productsResponse.data.products) productsList = productsResponse.data.products;
        else if (Array.isArray(productsResponse.data)) productsList = productsResponse.data;
        else productsList = productsResponse.data || [];
        setProducts(productsList);
      }
    } catch (error) {
      console.error('Erreur:', error);
      setProducts([]);
    } finally {
      setLoading(false);
    }
  };

  const handleNavigation = (type, slug = null) => {
    const routes = {
      home: '/',
      category: `/categories/${slug}`,
      product: `/products/${slug}`,
      cart: '/cart',
      wishlist: '/wishlist'
    };
    if (routes[type]) window.location.href = routes[type];
  };

  const handleAddToCart = async (productId) => {
    try {
      const response = await api.addToCart(productId, 1);
      if (response.success) {
        setCartCount(prev => prev + 1);
        alert('Produit ajouté'); // À remplacer par un Toast
      }
    } catch (error) { alert('Erreur ajout panier'); }
  };

  const handleAddToWishlist = async (productId) => {
    try {
      const response = await api.addToWishlist(productId);
      if (response.success) {
        setWishlistCount(prev => prev + 1);
        alert('Ajouté aux favoris');
      }
    } catch (error) { console.error(error); }
  };

  const applyFilters = (newFilters) => {
    setFilters(prev => ({ ...prev, ...newFilters }));
    setFiltersOpen(false);
  };

  const clearFilters = () => {
    setFilters({ min_price: '', max_price: '', on_sale: false });
  };

  if (loading && !category) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#FDFBF7]">
        <Loader2 className="w-10 h-10 animate-spin text-neutral-300" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#FDFBF7] text-[#1A1A1A] font-sans selection:bg-black selection:text-white flex flex-col">
      <Navbar
        cartCount={cartCount}
        wishlistCount={wishlistCount}
        categories={categories}
        onNavigate={handleNavigation}
      />

      {/* HEADER CATÉGORIE */}
      <header className="relative pt-12 pb-12 md:pt-20 md:pb-16 text-center border-b border-neutral-200 bg-white">
        {/* Si l'API renvoie une image de bannière, on peut l'utiliser en background. Sinon, style minimaliste */}
        <div className="max-w-4xl mx-auto px-4">
          <div className="text-[10px] uppercase tracking-[0.2em] text-neutral-400 mb-4">
            <span className="cursor-pointer hover:text-black" onClick={() => handleNavigation('home')}>Accueil</span>
            <span className="mx-2">/</span>
            <span className="text-black">Collection</span>
          </div>
          
          <h1 className="text-4xl md:text-6xl font-light uppercase tracking-widest mb-6">
            {category?.nom || 'Collection'}
          </h1>
          
          {category?.description && (
            <p className="text-sm text-neutral-500 font-light max-w-2xl mx-auto leading-relaxed">
              {category.description}
            </p>
          )}
        </div>
      </header>

      {/* TOOLBAR (Sticky) */}
      <div className="sticky top-0 z-40 bg-[#FDFBF7]/95 backdrop-blur-md border-b border-neutral-200">
        <div className="max-w-[1800px] mx-auto px-4 md:px-8 py-3 flex justify-between items-center">
          
          {/* Gauche : Filtres & Compteur */}
          <div className="flex items-center gap-6">
            <button 
              onClick={() => setFiltersOpen(true)}
              className="flex items-center gap-2 text-xs font-bold uppercase tracking-widest hover:text-neutral-500 transition-colors"
            >
              <SlidersHorizontal className="w-4 h-4" />
              Filtres
              {(filters.min_price || filters.max_price || filters.on_sale) && (
                <span className="w-1.5 h-1.5 bg-black rounded-full ml-1" />
              )}
            </button>
            <span className="hidden md:inline text-[10px] text-neutral-400 uppercase tracking-widest border-l border-neutral-300 pl-6">
              {products.length} Produits
            </span>
          </div>

          {/* Droite : Tri & Vue */}
          <div className="flex items-center gap-6">
            <div className="relative group flex items-center gap-2 cursor-pointer">
              <span className="text-xs font-bold uppercase tracking-widest">Trier par</span>
              <ChevronDown className="w-3 h-3" />
              
              {/* Dropdown Tri personnalisé */}
              <select 
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="absolute inset-0 opacity-0 cursor-pointer"
              >
                <option value="recent">Nouveautés</option>
                <option value="price_asc">Prix croissant</option>
                <option value="price_desc">Prix décroissant</option>
                <option value="popular">Popularité</option>
              </select>
            </div>

            <div className="flex items-center gap-2 border-l border-neutral-300 pl-6">
              <button 
                onClick={() => setViewMode('grid')}
                className={`p-1 hover:text-black transition-colors ${viewMode === 'grid' ? 'text-black' : 'text-neutral-400'}`}
              >
                <Grid className="w-4 h-4" />
              </button>
              <button 
                onClick={() => setViewMode('list')}
                className={`p-1 hover:text-black transition-colors ${viewMode === 'list' ? 'text-black' : 'text-neutral-400'}`}
              >
                <List className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* CONTENU PRINCIPAL */}
      <main className="flex-grow max-w-[1800px] mx-auto px-4 md:px-8 py-8 w-full">
        
        {products.length > 0 ? (
          <div className={
            viewMode === 'grid' 
              ? "grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-x-4 gap-y-10 md:gap-x-8 md:gap-y-16"
              : "flex flex-col gap-8 max-w-4xl mx-auto"
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
          <div className="py-32 text-center">
            <p className="text-sm uppercase tracking-widest text-neutral-400 mb-6">Aucun produit ne correspond à votre recherche</p>
            <button 
              onClick={clearFilters}
              className="border-b border-black text-xs font-bold uppercase tracking-widest pb-1 hover:opacity-60"
            >
              Effacer les filtres
            </button>
          </div>
        )}
      </main>

      {/* DRAWER FILTRES */}
      {filtersOpen && (
        <FilterDrawer 
          filters={filters}
          onClose={() => setFiltersOpen(false)}
          onApply={applyFilters}
          onClear={clearFilters}
        />
      )}

      <EnhancedFooter />
    </div>
  );
};

/* --- SOUS-COMPOSANTS --- */

const ProductCard = ({ product, viewMode, onNavigate, onAddToCart, onAddToWishlist }) => {
  // Calcul réduction
  const reduction = product.prix_promo 
    ? Math.round(((product.prix - product.prix_promo) / product.prix) * 100)
    : 0;

  // Vue LISTE (Horizontale)
  if (viewMode === 'list') {
    return (
      <div 
        className="flex gap-6 group cursor-pointer border-b border-neutral-100 pb-6" 
        onClick={() => onNavigate('product', product.slug)}
        onMouseEnter={() => api.getProductBySlug(product.slug).catch(() => {})}
        onTouchStart={() => api.getProductBySlug(product.slug).catch(() => {})}
      >
        <div className="w-32 h-40 md:w-48 md:h-64 bg-neutral-100 overflow-hidden relative shrink-0">
          <img 
            src={product.image} 
            alt={product.nom}
            loading="lazy"
            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
          />
        </div>
        <div className="flex-1 flex flex-col justify-center items-start">
          <div className="mb-2 flex gap-2">
             {product.est_nouveaute && <span className="text-[9px] uppercase font-bold tracking-widest bg-black text-white px-2 py-1">New</span>}
             {reduction > 0 && <span className="text-[9px] uppercase font-bold tracking-widest bg-red-600 text-white px-2 py-1">-{reduction}%</span>}
          </div>
          <h3 className="text-sm md:text-base font-bold uppercase tracking-wide mb-1">{product.nom}</h3>
          <div className="flex gap-3 text-xs md:text-sm mb-4">
            {product.prix_promo ? (
              <>
                <span className="font-medium">{product.prix_promo.toLocaleString()} FCFA</span>
                <span className="text-neutral-400 line-through decoration-neutral-300">{product.prix.toLocaleString()}</span>
              </>
            ) : (
              <span className="font-medium">{product.prix.toLocaleString()} FCFA</span>
            )}
          </div>
          <p className="text-xs text-neutral-500 line-clamp-2 mb-4 font-light max-w-md hidden md:block">
            {product.description_courte || product.description}
          </p>
          <button 
            onClick={(e) => { e.stopPropagation(); onAddToCart(product.id); }}
            className="text-xs font-bold uppercase tracking-widest border-b border-black pb-1 hover:text-neutral-600 hover:border-neutral-600 transition-colors"
          >
            Ajouter au panier
          </button>
        </div>
      </div>
    );
  }

  // Vue GRILLE (Verticale - Standard)
  return (
    <div 
      className="group cursor-pointer flex flex-col" 
      onClick={() => onNavigate('product', product.slug)}
      onMouseEnter={() => api.getProductBySlug(product.slug).catch(() => {})}
      onTouchStart={() => api.getProductBySlug(product.slug).catch(() => {})}
    >
      <div className="relative aspect-[3/4] bg-neutral-100 overflow-hidden mb-4">
        <img 
          src={product.image} 
          alt={product.nom}
          loading="lazy"
          className="w-full h-full object-cover transition-transform duration-700 ease-out group-hover:scale-105"
        />
        
        {/* Badges */}
        <div className="absolute top-2 left-2 flex flex-col gap-1">
          {product.est_nouveaute && <span className="bg-white text-black text-[9px] font-bold px-2 py-1 uppercase tracking-widest">New</span>}
          {reduction > 0 && <span className="bg-red-600 text-white text-[9px] font-bold px-2 py-1 uppercase tracking-widest">-{reduction}%</span>}
        </div>

        {/* Actions Overlay (Desktop) */}
        <div className="absolute bottom-0 left-0 w-full p-4 translate-y-full group-hover:translate-y-0 transition-transform duration-300 hidden md:flex flex-col gap-2 bg-gradient-to-t from-black/50 to-transparent pt-12">
           <button 
             onClick={(e) => { e.stopPropagation(); onAddToCart(product.id); }}
             className="w-full bg-white text-black py-3 text-[10px] font-bold uppercase tracking-widest hover:bg-black hover:text-white transition-colors"
           >
             Ajouter
           </button>
        </div>

        {/* Mobile Wishlist Icon */}
        <button 
          onClick={(e) => { e.stopPropagation(); onAddToWishlist(product.id); }}
          className="absolute top-2 right-2 p-2 bg-white/80 rounded-full md:hidden"
        >
          <Heart className="w-4 h-4" />
        </button>
      </div>

      <div className="space-y-1">
        <div className="flex justify-between items-start">
          <h3 className="text-xs font-bold uppercase tracking-wide text-black line-clamp-1 group-hover:underline underline-offset-4 decoration-neutral-300">
            {product.nom}
          </h3>
          <button 
            onClick={(e) => { e.stopPropagation(); onAddToWishlist(product.id); }}
            className="hidden md:block hover:text-red-600 transition-colors"
          >
            <Heart className="w-3 h-3 stroke-2" />
          </button>
        </div>
        
        <div className="flex gap-3 text-xs">
          {product.prix_promo ? (
            <>
              <span className="font-medium text-red-700">{product.prix_promo.toLocaleString()} FCFA</span>
              <span className="text-neutral-400 line-through">{product.prix.toLocaleString()}</span>
            </>
          ) : (
            <span className="font-medium text-neutral-800">{product.prix.toLocaleString()} FCFA</span>
          )}
        </div>
      </div>
    </div>
  );
};

const FilterDrawer = ({ filters, onClose, onApply, onClear }) => {
  const [localFilters, setLocalFilters] = useState(filters);

  return (
    <div className="fixed inset-0 z-50 flex justify-end">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/30 backdrop-blur-sm" onClick={onClose}></div>
      
      {/* Panel */}
      <div className="relative w-full max-w-md bg-white h-full shadow-2xl flex flex-col animate-slide-in-right">
        <div className="flex items-center justify-between p-6 border-b border-neutral-100">
          <h2 className="text-lg font-bold uppercase tracking-widest">Filtres</h2>
          <button onClick={onClose}>
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-6 space-y-8">
          {/* Prix */}
          <div>
            <h3 className="text-xs font-bold uppercase tracking-widest text-neutral-500 mb-4">Prix (FCFA)</h3>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-[10px] uppercase font-bold text-neutral-400">Min</label>
                <input
                  type="number"
                  placeholder="0"
                  value={localFilters.min_price}
                  onChange={(e) => setLocalFilters({...localFilters, min_price: e.target.value})}
                  className="w-full border border-neutral-200 p-3 text-sm focus:outline-none focus:border-black transition-colors rounded-none placeholder-neutral-300"
                />
              </div>
              <div className="space-y-2">
                <label className="text-[10px] uppercase font-bold text-neutral-400">Max</label>
                <input
                  type="number"
                  placeholder="illimité"
                  value={localFilters.max_price}
                  onChange={(e) => setLocalFilters({...localFilters, max_price: e.target.value})}
                  className="w-full border border-neutral-200 p-3 text-sm focus:outline-none focus:border-black transition-colors rounded-none placeholder-neutral-300"
                />
              </div>
            </div>
          </div>

          {/* Promotions */}
          <div className="flex items-center justify-between border-t border-neutral-100 pt-6">
            <span className="text-sm font-bold uppercase tracking-wide">Uniquement Promotions</span>
            <label className="relative inline-flex items-center cursor-pointer">
              <input 
                type="checkbox" 
                className="sr-only peer"
                checked={localFilters.on_sale}
                onChange={(e) => setLocalFilters({...localFilters, on_sale: e.target.checked})}
              />
              <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-black"></div>
            </label>
          </div>
        </div>

        <div className="p-6 border-t border-neutral-100 flex gap-4">
          <button 
            onClick={() => { onClear(); setLocalFilters({min_price:'', max_price:'', on_sale:false}); }}
            className="flex-1 py-4 border border-neutral-200 text-xs font-bold uppercase tracking-widest hover:border-black transition-colors"
          >
            Réinitialiser
          </button>
          <button 
            onClick={() => onApply(localFilters)}
            className="flex-1 py-4 bg-black text-white text-xs font-bold uppercase tracking-widest hover:bg-neutral-800 transition-colors"
          >
            Voir les résultats
          </button>
        </div>
      </div>
    </div>
  );
};

export default CategoryPage;