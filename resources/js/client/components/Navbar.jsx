import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  ShoppingBag, Heart, Search, Menu, User, X, ChevronRight, Phone, Loader2, LogOut
} from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import AuthModal from './AuthModal';
import api from '../utils/api';

const Navbar = ({ 
  cartCount = 0, 
  wishlistCount = 0, 
  categories = [],
  config = {}
}) => {
  console.log("🔧 Navbar chargé, cartCount:", cartCount);
  const navigate = useNavigate();
  const { user, isAuthenticated, logout } = useAuth();
  const [isScrolled, setIsScrolled] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState(null);
  const [isSearching, setIsSearching] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [hoveredCategory, setHoveredCategory] = useState(null);
  const [activeCategoryProducts, setActiveCategoryProducts] = useState([]);
  const [logoLoaded, setLogoLoaded] = useState(false);
  const [authModalOpen, setAuthModalOpen] = useState(false);
  const [authModalMode, setAuthModalMode] = useState('login');
  const [showUserMenu, setShowUserMenu] = useState(false);

  const defaultConfig = {
    company: { name: "VIVIAS", whatsapp: "+221 78 466 14 12" },
    currency: "FCFA",
    shipping: { free_threshold: 50000 }
  };

  const mergedConfig = { ...defaultConfig, ...config };
  const searchRef = useRef(null);

  // Prefetching pour navigation instantanée
  const prefetchRoute = (type, slug = null) => {
    try {
      if (type === 'category' && slug) {
        api.getCategoryProducts(slug, { page: 1 });
      } else if (type === 'product' && slug) {
        api.getProductBySlug(slug);
      }
    } catch (error) {
      // Silencieux - juste du prefetch
    }
  };

  // Navigation handler optimisé
  const handleNavigate = (type, slug = null) => {
    setMobileMenuOpen(false);
    setSearchResults(null);
    setSearchQuery('');
    setShowUserMenu(false);
    
    switch(type) {
      case 'home':
        navigate('/');
        break;
      case 'category':
        navigate(`/categories/${slug}`);
        break;
      case 'product':
        navigate(`/products/${slug}`);
        break;
      case 'cart':
        navigate('/cart');
        break;
      case 'wishlist':
        navigate('/wishlist');
        break;
      case 'profile':
        if (isAuthenticated) {
          navigate('/profile');
        } else {
          openAuthModal('login');
        }
        break;
      case 'account':
        if (isAuthenticated) {
          navigate('/account');
        } else {
          openAuthModal('login');
        }
        break;
      default:
        break;
    }
  };

  const openAuthModal = (mode = 'login') => {
    setAuthModalMode(mode);
    setAuthModalOpen(true);
  };

  const handleLogout = async () => {
    setShowUserMenu(false);
    await logout();
    navigate('/');
  };

  // Gestion du scroll pour l'effet sticky
  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 10);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Gestion de la recherche avec Debounce
  useEffect(() => {
    if (searchQuery.length >= 2) {
      setIsSearching(true);
      const timer = setTimeout(async () => {
        try {
          const response = await api.quickSearch(searchQuery);
          setSearchResults(response.data);
        } catch (error) {
          console.error('Erreur recherche:', error);
          setSearchResults({ produits: [], categories: [] });
        } finally {
          setIsSearching(false);
        }
      }, 400);
      return () => clearTimeout(timer);
    } else {
      setSearchResults(null);
      setIsSearching(false);
    }
  }, [searchQuery]);

  // Fermer la recherche et le menu utilisateur si on clique ailleurs
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (searchRef.current && !searchRef.current.contains(event.target)) {
        setSearchResults(null);
      }
      // Fermer le menu utilisateur si clic à l'extérieur
      if (showUserMenu && !event.target.closest('.user-menu-container')) {
        setShowUserMenu(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [showUserMenu]);

  const handleCategoryHover = async (category) => {
    setHoveredCategory(category);
    if (category?.products && category.products.length > 0) {
      setActiveCategoryProducts(category.products.slice(0, 4));
    } else {
      // Charger les produits de la catégorie si pas déjà chargés
      try {
        const response = await api.getCategoryProducts(category.slug, { limit: 4 });
        if (response.success && response.data?.produits) {
          setActiveCategoryProducts(response.data.produits);
        }
      } catch (error) {
        console.error('Erreur chargement produits:', error);
        setActiveCategoryProducts([]);
      }
    }
  };

  return (
    <>
      {/* 1. TOP BAR - Minimaliste Noir */}
      <div className="bg-[#1A1A1A] text-white text-[10px] md:text-xs uppercase tracking-[0.2em] py-2.5 text-center transition-all">
        <div className="max-w-7xl mx-auto px-4 flex justify-between items-center">
          <span className="hidden md:block opacity-70">Service Client : {mergedConfig.company.whatsapp}</span>
          <span className="mx-auto md:mx-0 animate-fade-in">
            Livraison offerte dès {mergedConfig.shipping.free_threshold.toLocaleString()} {mergedConfig.currency}
          </span>
        </div>
      </div>

      {/* 2. MAIN NAVBAR */}
      <nav 
        className={`sticky top-0 z-50 bg-white border-b border-neutral-100 transition-all duration-300 ${
          isScrolled ? 'shadow-sm py-0' : 'py-2'
        }`}
      >
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex items-center justify-between h-16 md:h-20">
            
            {/* A. Mobile Menu Button - Ultra responsive */}
            <button 
              onClick={() => setMobileMenuOpen(true)} 
              className="md:hidden p-2 -ml-2 text-black hover:bg-neutral-100 rounded-full transition-colors touch-manipulation active:scale-90 transition-transform duration-100"
              aria-label="Ouvrir le menu"
            >
              <Menu className="h-6 w-6 stroke-1" />
            </button>

            {/* B. Logo - Optimisé pour mobile */}
            <button 
              onClick={() => handleNavigate('home')} 
              className="flex-shrink-0 group relative z-10 flex items-center min-h-[40px] md:min-h-[48px] touch-manipulation"
            >
              <img 
                src="/assets/images/vivias.jpg" 
                alt="VIVIAS SHOP"
                loading="eager"
                decoding="async"
                className="h-10 md:h-12 w-auto object-contain transition-transform duration-200 group-active:scale-95 md:group-hover:scale-105"
                onLoad={() => setLogoLoaded(true)}
                onError={() => setLogoLoaded(false)}
                style={{ display: logoLoaded ? 'block' : 'none' }}
              />
              {/* Fallback texte instantané */}
              {!logoLoaded && (
                <h1 className="text-lg md:text-2xl font-bold tracking-[0.1em] text-[#1A1A1A] whitespace-nowrap">
                  VIVIAS
                </h1>
              )}
            </button>

            {/* C. Desktop Navigation - Centrée */}
            <div className="hidden md:flex items-center justify-center flex-1 px-8">
              {/* Navigation simplifiée - pas de menu */}
            </div>

            {/* D. Mobile Search Bar - Visible on navbar */}
            <div className="flex md:hidden flex-1 mx-3 relative" ref={searchRef}>
              <div className="relative w-full">
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Rechercher..."
                  className="w-full bg-neutral-100 rounded-full py-2 pl-10 pr-4 text-xs placeholder-neutral-400 focus:outline-none focus:ring-2 focus:ring-neutral-300 transition-shadow"
                />
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-neutral-400 pointer-events-none" />
                {isSearching && (
                  <Loader2 className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 animate-spin text-neutral-400" />
                )}
              </div>

              {/* Mobile Search Results Dropdown */}
              {searchQuery.length >= 2 && searchResults && (
                <div className="absolute top-full left-0 right-0 mt-2 bg-white shadow-xl border border-neutral-100 rounded-lg p-3 max-h-80 overflow-y-auto z-50">
                  {searchResults.produits?.length > 0 && (
                    <div className="space-y-2">
                      <div className="text-[10px] uppercase tracking-widest text-neutral-400 px-2">Produits</div>
                      {searchResults.produits.map(p => (
                        <div 
                          key={p.id} 
                          onClick={() => {
                            handleNavigate('product', p.slug);
                            setSearchQuery('');
                            setSearchResults(null);
                          }} 
                          className="flex gap-3 cursor-pointer hover:bg-neutral-50 p-2 rounded active:scale-95 transition-all"
                        >
                          <img 
                            src={p.image_principale || p.image || '/assets/images/placeholder.jpg'} 
                            alt={p.nom}
                            className="w-12 h-14 object-cover bg-neutral-200 rounded" 
                          />
                          <div className="flex-1">
                            <div className="text-xs font-medium line-clamp-1">{p.nom}</div>
                            <div className="text-xs text-neutral-500 mt-1">{p.prix_affiche?.toLocaleString()} FCFA</div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                  {searchResults.produits?.length === 0 && (
                    <div className="text-xs text-center text-neutral-400 py-4">
                      Aucun résultat trouvé
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* E. Icons & Search */}
            <div className="flex items-center gap-1 md:gap-4">
              
              {/* Search Bar Expandable */}
              <div className="hidden md:block relative" ref={searchRef}>
                <div className="relative group">
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="RECHERCHER"
                    className="w-32 focus:w-64 transition-all duration-300 border-b border-transparent focus:border-black py-1 px-0 text-xs uppercase tracking-wide focus:outline-none placeholder-neutral-400 bg-transparent"
                  />
                  <Search className="absolute right-0 top-1/2 -translate-y-1/2 h-4 w-4 text-neutral-400 pointer-events-none" />
                </div>

                {/* Search Results Dropdown */}
                {searchResults && (
                  <div className="absolute top-full right-0 w-80 bg-white shadow-xl border border-neutral-100 mt-4 p-4 max-h-96 overflow-y-auto">
                    {isSearching && <Loader2 className="w-4 h-4 animate-spin mx-auto my-4" />}
                    
                    {searchResults.produits?.length > 0 && (
                       <div className="space-y-4">
                          <div className="text-[10px] uppercase tracking-widest text-neutral-400">Produits</div>
                          {searchResults.produits.map(p => (
                            <div key={p.id} onClick={() => { handleNavigate('product', p.slug); }} className="flex gap-3 cursor-pointer group hover:bg-neutral-50 p-2 -mx-2 rounded">
                               <img src={p.image_principale || p.image || '/assets/images/placeholder.jpg'} alt="" className="w-10 h-12 object-cover bg-neutral-100" />
                               <div>
                                  <div className="text-xs font-medium group-hover:underline">{p.nom}</div>
                                  <div className="text-xs text-neutral-500">{p.prix_affiche?.toLocaleString()} FCFA</div>
                               </div>
                            </div>
                          ))}
                       </div>
                    )}
                    {searchResults.produits?.length === 0 && !isSearching && (
                      <div className="text-xs text-center text-neutral-400 py-4">Aucun résultat trouvé</div>
                    )}
                  </div>
                )}
              </div>

              {/* Action Icons - Optimisés mobile */}
              <button 
                onClick={() => handleNavigate('wishlist')} 
                className="hidden md:block p-2 hover:text-neutral-500 transition-colors relative touch-manipulation active:scale-95 transition-transform duration-100"
              >
                <Heart className="h-5 w-5 stroke-[1.5]" />
                {wishlistCount > 0 && (
                  <span className="absolute top-1 right-1 w-1.5 h-1.5 bg-red-500 rounded-full" />
                )}
              </button>

              {/* User Menu - Conditionnel selon authentification */}
              {isAuthenticated ? (
                <div className="hidden md:block relative user-menu-container">
                  <button 
                    onClick={() => setShowUserMenu(!showUserMenu)}
                    className="p-2 hover:text-neutral-500 transition-colors touch-manipulation active:scale-95 transition-transform duration-100 flex items-center gap-2"
                  >
                    <User className="h-5 w-5 stroke-[1.5]" />
                  </button>
                  
                  {/* Dropdown Menu */}
                  {showUserMenu && (
                    <div className="absolute right-0 top-full mt-2 w-48 bg-white shadow-xl border border-neutral-100 py-2 z-50 animate-fade-in">
                      <div className="px-4 py-2 border-b border-neutral-100">
                        <p className="text-xs font-bold uppercase tracking-widest truncate">{user?.nom_complet || user?.email}</p>
                        <p className="text-[10px] text-neutral-400 truncate">{user?.email}</p>
                      </div>
                      <button
                        onClick={() => handleNavigate('profile')}
                        className="w-full text-left px-4 py-2 text-xs hover:bg-neutral-50 transition-colors flex items-center gap-2"
                      >
                        <User className="w-3 h-3" />
                        Mon Profil
                      </button>
                      <button
                        onClick={() => handleNavigate('account')}
                        className="w-full text-left px-4 py-2 text-xs hover:bg-neutral-50 transition-colors flex items-center gap-2"
                      >
                        <ShoppingBag className="w-3 h-3" />
                        Mes Commandes
                      </button>
                      <button
                        onClick={handleLogout}
                        className="w-full text-left px-4 py-2 text-xs hover:bg-red-50 text-red-600 transition-colors flex items-center gap-2 border-t border-neutral-100 mt-2"
                      >
                        <LogOut className="w-3 h-3" />
                        Déconnexion
                      </button>
                    </div>
                  )}
                </div>
              ) : (
                <button 
                  onClick={() => openAuthModal('login')}
                  className="hidden md:block p-2 hover:text-neutral-500 transition-colors touch-manipulation active:scale-95 transition-transform duration-100"
                >
                  <User className="h-5 w-5 stroke-[1.5]" />
                </button>
              )}

              <button 
                onClick={() => handleNavigate('cart')} 
                className="p-2 hover:text-neutral-500 transition-colors relative touch-manipulation active:scale-95 transition-transform duration-100"
              >
                <ShoppingBag className="h-5 w-5 stroke-[1.5]" />
                {cartCount > 0 && (
                  <span className="absolute top-0 right-0 bg-black text-white text-[9px] font-bold h-4 w-4 flex items-center justify-center rounded-full">
                    {cartCount}
                  </span>
                )}
              </button>
            </div>
          </div>
        </div>
      </nav>

      {/* 3. MOBILE MENU OVERLAY - Ultra responsive */}
      {mobileMenuOpen && (
        <div className="fixed inset-0 z-[60] flex md:hidden">
          {/* Backdrop */}
          <div 
            className="absolute inset-0 bg-black/50 backdrop-blur-sm"
            onClick={() => setMobileMenuOpen(false)}
          />
          
          {/* Drawer optimisé */}
          <div className="relative w-[80%] max-w-sm bg-white h-full shadow-2xl flex flex-col animate-slide-in-left">
            <div className="p-6 flex justify-between items-center border-b border-neutral-100">
              <img 
                src="/assets/images/vivias.jpg" 
                alt="VIVIAS SHOP"
                loading="eager"
                className="h-10 w-auto object-contain"
              />
              <button 
                onClick={() => setMobileMenuOpen(false)} 
                className="p-2 -mr-2 text-neutral-500 touch-manipulation active:scale-90 transition-transform duration-100"
                aria-label="Fermer le menu"
              >
                <X className="h-6 w-6" />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto py-4 px-6 overscroll-contain">
              <div className="space-y-6">
                {/* Menu de navigation simplifié */}
              </div>
            </div>

            <div className="p-6 bg-neutral-50 space-y-4">
               <button 
                 onClick={() => handleNavigate('wishlist')} 
                 className="flex items-center gap-3 text-xs font-bold uppercase tracking-widest touch-manipulation active:opacity-60 transition-opacity duration-100"
               >
                 <Heart className="w-4 h-4" /> Mes Favoris
               </button>
               
               {isAuthenticated ? (
                 <>
                   <button 
                     onClick={() => handleNavigate('profile')} 
                     className="flex items-center gap-3 text-xs font-bold uppercase tracking-widest touch-manipulation active:opacity-60 transition-opacity duration-100"
                   >
                     <User className="w-4 h-4" /> Mon Profil
                   </button>
                   <button 
                     onClick={() => handleNavigate('account')} 
                     className="flex items-center gap-3 text-xs font-bold uppercase tracking-widest touch-manipulation active:opacity-60 transition-opacity duration-100"
                   >
                     <ShoppingBag className="w-4 h-4" /> Mes Commandes
                   </button>
                   <button 
                     onClick={handleLogout}
                     className="flex items-center gap-3 text-xs font-bold uppercase tracking-widest text-red-600 touch-manipulation active:opacity-60 transition-opacity duration-100 border-t border-neutral-200 pt-4"
                   >
                     <LogOut className="w-4 h-4" /> Déconnexion
                   </button>
                 </>
               ) : (
                 <button 
                   onClick={() => openAuthModal('login')}
                   className="flex items-center gap-3 text-xs font-bold uppercase tracking-widest touch-manipulation active:opacity-60 transition-opacity duration-100"
                 >
                   <User className="w-4 h-4" /> Se Connecter
                 </button>
               )}
            </div>
          </div>
        </div>
      )}

      {/* Modal d'authentification */}
      <AuthModal 
        isOpen={authModalOpen}
        onClose={() => setAuthModalOpen(false)}
        initialMode={authModalMode}
      />
    </>
  );
};

export default Navbar;