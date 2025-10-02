import React, { useState, useEffect } from 'react';
import { 
  ShoppingBag, Heart, Search, Menu, User, ChevronDown, ChevronRight,
  Phone, Mail, Zap, X
} from 'lucide-react';

const Navbar = ({ 
  cartCount = 0, 
  wishlistCount = 0, 
  categories = [],
  config = {},
  onNavigate = () => {},
  onSearch = () => {}
}) => {
  const [isScrolled, setIsScrolled] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState(null);
  const [showSearchDropdown, setShowSearchDropdown] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [hoveredCategory, setHoveredCategory] = useState(null);
  const [categoryProducts, setCategoryProducts] = useState({});
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [authMode, setAuthMode] = useState('login');
  const [authLoading, setAuthLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [user, setUser] = useState(null);
  const [authData, setAuthData] = useState({
    email: '',
    password: '',
    password_confirmation: '',
    nom: '',
    prenom: '',
    telephone: '',
    ville: 'Dakar',
    accepte_conditions: false
  });

  const defaultConfig = {
    company: { name: "VIVIAS SHOP", email: "contact@vivias-shop.com", whatsapp: "+221 77 123 45 67" },
    currency: "FCFA",
    shipping: { free_threshold: 50000 }
  };

  const mergedConfig = { ...defaultConfig, ...config };

  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 50);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    checkAuth();
  }, []);

  useEffect(() => {
    if (searchQuery.length >= 2) {
      const timer = setTimeout(async () => {
        try {
          const results = await onSearch(searchQuery);
          setSearchResults(results);
          setShowSearchDropdown(true);
        } catch (error) {
          console.error('Erreur recherche:', error);
        }
      }, 300);
      return () => clearTimeout(timer);
    } else {
      setShowSearchDropdown(false);
    }
  }, [searchQuery, onSearch]);

  const checkAuth = async () => {
    const token = localStorage.getItem('auth_token');
    if (token) {
      try {
        const response = await fetch('/api/client/auth/profile', {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Accept': 'application/json'
          }
        });
        const data = await response.json();
        if (data.success) {
          setIsAuthenticated(true);
          setUser(data.data);
        } else {
          localStorage.removeItem('auth_token');
          setIsAuthenticated(false);
        }
      } catch (error) {
        localStorage.removeItem('auth_token');
        setIsAuthenticated(false);
      }
    }
  };

  const handleAuth = async (e) => {
    e.preventDefault();
    
    if (authMode === 'register') {
      if (authData.password !== authData.password_confirmation) {
        alert('Les mots de passe ne correspondent pas');
        return;
      }
      
      if (!authData.accepte_conditions) {
        alert('Vous devez accepter les conditions d\'utilisation');
        return;
      }
    }
    
    setAuthLoading(true);
    
    try {
      const endpoint = authMode === 'login' ? '/api/client/auth/login' : '/api/client/auth/register';
      const body = authMode === 'login' 
        ? { email: authData.email, password: authData.password }
        : authData;

      const response = await fetch(endpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        },
        body: JSON.stringify(body)
      });

      const data = await response.json();

      if (data.success && data.data.token) {
        localStorage.setItem('auth_token', data.data.token);
        setIsAuthenticated(true);
        setUser(data.data);
        setShowAuthModal(false);
        alert(authMode === 'login' ? 'Connexion réussie !' : 'Compte créé avec succès !');
        window.location.reload();
      } else {
        alert(data.message || 'Erreur');
      }
    } catch (error) {
      alert('Une erreur est survenue');
    } finally {
      setAuthLoading(false);
    }
  };

  const handleLogout = () => {
    if (confirm('Voulez-vous vraiment vous déconnecter ?')) {
      localStorage.removeItem('auth_token');
      setIsAuthenticated(false);
      setUser(null);
      window.location.href = '/';
    }
  };

  const handleCategoryHover = async (category) => {
    setHoveredCategory(category);
    
    if (!categoryProducts[category.slug]) {
      try {
        if (category.preview_products?.length > 0) {
          setCategoryProducts(prev => ({ ...prev, [category.slug]: category.preview_products }));
        } else {
          const response = await fetch(`/api/client/categories/${category.slug}/products?per_page=6`);
          const data = await response.json();
          if (data.success) {
            setCategoryProducts(prev => ({ ...prev, [category.slug]: data.data.products }));
          }
        }
      } catch (error) {
        console.error('Erreur produits:', error);
      }
    }
  };

  return (
    <>
      {/* Top Bar */}
      <div className="bg-gradient-to-r from-purple-600 via-pink-600 to-purple-600 text-white">
        <div className="max-w-7xl mx-auto px-4 py-2">
          <div className="flex items-center justify-between text-sm">
            <div className="flex items-center gap-4 md:gap-6">
              <div className="flex items-center gap-2">
                <Phone className="h-4 w-4" />
                <span className="hidden md:inline">{mergedConfig.company.whatsapp}</span>
              </div>
              <div className="flex items-center gap-2">
                <Mail className="h-4 w-4" />
                <span className="hidden lg:inline">{mergedConfig.company.email}</span>
              </div>
            </div>
            <div className="flex items-center gap-2 animate-pulse">
              <Zap className="h-4 w-4" />
              <span className="hidden sm:inline">
                Livraison gratuite dès {mergedConfig.shipping.free_threshold.toLocaleString()} {mergedConfig.currency}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Main Navbar */}
      <nav className={`sticky top-0 z-50 transition-all duration-300 ${
        isScrolled ? 'bg-white/98 backdrop-blur-md shadow-xl' : 'bg-white shadow-md'
      }`}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            
            {/* Logo */}
            <button onClick={() => onNavigate('home')} className="flex items-center space-x-3 group">
              <div className="h-12 w-12 bg-gradient-to-br from-purple-600 to-pink-600 rounded-full flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform">
                <span className="text-white font-bold text-xl">V</span>
              </div>
              <div className="hidden sm:block">
                <h1 className="text-2xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
                  {mergedConfig.company.name}
                </h1>
                <p className="text-xs text-gray-500">Mode Africaine</p>
              </div>
            </button>

            {/* Search Bar - Desktop */}
            <div className="flex-1 max-w-2xl mx-8 hidden md:block relative">
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Rechercher des produits, catégories..."
                className="w-full pl-12 pr-4 py-3 border-2 border-gray-200 rounded-full focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all"
              />
              <Search className="absolute left-4 top-3.5 h-5 w-5 text-gray-400" />
              
              {showSearchDropdown && searchResults && (
                <div className="absolute top-full left-0 right-0 bg-white border-2 border-gray-100 rounded-2xl shadow-2xl mt-2 max-h-96 overflow-y-auto z-50">
                  {searchResults.produits?.length > 0 && (
                    <div className="p-4">
                      <h4 className="font-semibold text-gray-700 mb-3">Produits</h4>
                      {searchResults.produits.map((product) => (
                        <button
                          key={product.id}
                          onClick={() => { onNavigate('product', product.slug); setShowSearchDropdown(false); }}
                          className="w-full flex items-center gap-3 p-3 hover:bg-purple-50 rounded-lg"
                        >
                          <img 
                            src={product.image || '/images/placeholder-product.jpg'} 
                            alt={product.nom} 
                            className="w-12 h-12 object-cover rounded-lg"
                            onError={(e) => {
                              e.target.onerror = null;
                              e.target.src = '/images/placeholder-product.jpg';
                            }}
                          />
                          <div className="flex-1 text-left">
                            <p className="font-medium text-gray-900">{product.nom}</p>
                            <p className="text-purple-600 font-semibold">{product.prix_affiche?.toLocaleString()} {mergedConfig.currency}</p>
                          </div>
                        </button>
                      ))}
                    </div>
                  )}
                  {searchResults.categories?.length > 0 && (
                    <div className="p-4 border-t">
                      <h4 className="font-semibold text-gray-700 mb-3">Catégories</h4>
                      {searchResults.categories.map((cat) => (
                        <button
                          key={cat.id}
                          onClick={() => { onNavigate('category', cat.slug); setShowSearchDropdown(false); }}
                          className="w-full p-3 hover:bg-purple-50 rounded-lg flex justify-between items-center"
                        >
                          <span className="font-medium">{cat.nom}</span>
                          <ChevronRight className="h-5 w-5 text-gray-400" />
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Actions */}
            <div className="flex items-center space-x-1">
              <button onClick={() => onNavigate('wishlist')} className="relative p-2 text-gray-600 hover:text-pink-600 transition-all hover:scale-110">
                <Heart className="h-6 w-6" />
                {wishlistCount > 0 && (
                  <span className="absolute -top-1 -right-1 bg-pink-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center font-bold">
                    {wishlistCount > 9 ? '9+' : wishlistCount}
                  </span>
                )}
              </button>

              <button onClick={() => onNavigate('cart')} className="relative p-2 text-gray-600 hover:text-purple-600 transition-all hover:scale-110">
                <ShoppingBag className="h-6 w-6" />
                {cartCount > 0 && (
                  <span className="absolute -top-1 -right-1 bg-purple-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center font-bold animate-bounce">
                    {cartCount > 9 ? '9+' : cartCount}
                  </span>
                )}
              </button>

              {isAuthenticated ? (
                <div className="relative group">
                  <button className="flex items-center gap-2 p-2 text-gray-600 hover:text-purple-600 transition-all hover:scale-110">
                    <div className="w-8 h-8 bg-gradient-to-br from-purple-600 to-pink-600 rounded-full flex items-center justify-center">
                      <span className="text-white font-bold text-sm">{user?.client?.prenom?.charAt(0) || 'U'}</span>
                    </div>
                    <ChevronDown className="h-4 w-4 hidden sm:block" />
                  </button>
                  
                  <div className="absolute right-0 top-full mt-2 w-64 bg-white rounded-2xl shadow-2xl border-2 border-gray-100 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all z-50">
                    <div className="p-4 border-b">
                      <p className="font-bold text-gray-900">{user?.user?.name}</p>
                      <p className="text-sm text-gray-600">{user?.user?.email}</p>
                    </div>
                    <div className="p-2">
                      <button onClick={() => onNavigate('profile')} className="w-full text-left px-4 py-3 hover:bg-purple-50 rounded-lg flex items-center gap-3 transition-colors">
                        <User className="h-5 w-5 text-purple-600" />
                        <span>Mon profil</span>
                      </button>
                      <button onClick={handleLogout} className="w-full text-left px-4 py-3 hover:bg-red-50 rounded-lg flex items-center gap-3 transition-colors text-red-600">
                        <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                        </svg>
                        <span>Déconnexion</span>
                      </button>
                    </div>
                  </div>
                </div>
              ) : (
                <button onClick={() => setShowAuthModal(true)} className="hidden sm:flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-full hover:from-purple-700 hover:to-pink-700 transition-all font-medium shadow-lg hover:scale-105">
                  <User className="h-5 w-5" />
                  <span>Connexion</span>
                </button>
              )}

              <button onClick={() => setMobileMenuOpen(!mobileMenuOpen)} className="md:hidden p-2 text-gray-600 ml-2">
                {mobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
              </button>
            </div>
          </div>
        </div>

        {/* Categories Menu - Desktop */}
        <div className="hidden md:block border-t border-gray-100 bg-gray-50/50">
          <div className="max-w-7xl mx-auto px-4">
            <div className="flex items-center justify-center gap-1 py-1">
              {categories.slice(0, 7).map((category) => (
                <div
                  key={category.id}
                  className="relative group"
                  onMouseEnter={() => handleCategoryHover(category)}
                  onMouseLeave={() => setHoveredCategory(null)}
                >
                  <button
                    onClick={() => onNavigate('category', category.slug)}
                    className="flex items-center gap-1 px-4 py-3 text-gray-700 hover:text-purple-600 font-medium transition-all hover:bg-white rounded-lg"
                  >
                    {category.nom}
                    <ChevronDown className="h-4 w-4 group-hover:rotate-180 transition-transform" />
                  </button>

                  {/* Mega Menu */}
                  {hoveredCategory?.id === category.id && (
                    <div className="absolute left-1/2 -translate-x-1/2 top-full pt-2 w-[700px] z-50">
                      <div className="bg-white rounded-2xl shadow-2xl border-2 border-gray-100 p-6">
                        <div className="flex gap-6">
                          <div className="w-1/3 border-r pr-6">
                            {category.image && (
                              <img 
                                src={category.image} 
                                alt={category.nom} 
                                className="w-full h-32 object-cover rounded-lg mb-4"
                                onError={(e) => {
                                  e.target.onerror = null;
                                  e.target.src = '/images/placeholder-product.jpg';
                                }}
                              />
                            )}
                            <h3 className="font-bold text-lg mb-2">{category.nom}</h3>
                            <p className="text-sm text-gray-600 mb-4">{category.description}</p>
                            <button onClick={() => onNavigate('category', category.slug)} className="flex items-center gap-2 text-sm text-purple-600 font-semibold">
                              Voir tout ({category.produits_count})
                              <ChevronRight className="h-4 w-4" />
                            </button>
                          </div>
                          <div className="w-2/3">
                            <h4 className="font-semibold text-gray-700 mb-3">Produits populaires</h4>
                            {categoryProducts[category.slug]?.length > 0 ? (
                              <div className="grid grid-cols-3 gap-3">
                                {categoryProducts[category.slug].slice(0, 6).map((product) => (
                                  <button key={product.id} onClick={() => onNavigate('product', product.slug)} className="text-left">
                                    <div className="aspect-square bg-gray-100 rounded-xl overflow-hidden mb-2 relative">
                                      <img 
                                        src={product.image || '/images/placeholder-product.jpg'} 
                                        alt={product.nom} 
                                        className="w-full h-full object-cover hover:scale-110 transition-transform"
                                        onError={(e) => {
                                          e.target.onerror = null;
                                          e.target.src = '/images/placeholder-product.jpg';
                                        }}
                                      />
                                      {product.en_promo && product.prix && product.prix_promo && (
                                        <div className="absolute top-2 left-2 bg-red-500 text-white text-xs font-bold px-2 py-1 rounded-full">
                                          -{Math.round(((product.prix - product.prix_promo) / product.prix) * 100)}%
                                        </div>
                                      )}
                                    </div>
                                    <p className="text-xs font-medium truncate">{product.nom}</p>
                                    <p className="text-sm text-purple-600 font-bold">{product.prix_affiche?.toLocaleString()}</p>
                                  </button>
                                ))}
                              </div>
                            ) : (
                              <p className="text-sm text-gray-500 text-center py-8">Chargement...</p>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Mobile Menu */}
        {mobileMenuOpen && (
          <div className="md:hidden bg-white border-t">
            <div className="px-4 py-4">
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Rechercher..."
                className="w-full px-4 py-3 border border-gray-300 rounded-full mb-4"
              />
              
              {!isAuthenticated && (
                <button onClick={() => { setShowAuthModal(true); setMobileMenuOpen(false); }} className="w-full mb-4 flex items-center justify-center gap-2 px-4 py-3 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-full hover:from-purple-700 hover:to-pink-700 transition-all font-medium shadow-lg">
                  <User className="h-5 w-5" />
                  <span>Connexion / Inscription</span>
                </button>
              )}

              {isAuthenticated && (
                <div className="mb-4 p-4 bg-gradient-to-r from-purple-50 to-pink-50 rounded-xl">
                  <p className="font-bold text-gray-900 mb-1">{user?.user?.name}</p>
                  <p className="text-sm text-gray-600 mb-3">{user?.user?.email}</p>
                  <button onClick={() => { onNavigate('profile'); setMobileMenuOpen(false); }} className="w-full mb-2 px-4 py-2 bg-white rounded-lg hover:bg-gray-50 transition-colors flex items-center gap-2">
                    <User className="h-5 w-5 text-purple-600" />
                    <span>Mon profil</span>
                  </button>
                  <button onClick={() => { handleLogout(); setMobileMenuOpen(false); }} className="w-full px-4 py-2 bg-white rounded-lg hover:bg-red-50 transition-colors flex items-center gap-2 text-red-600">
                    <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                    </svg>
                    <span>Déconnexion</span>
                  </button>
                </div>
              )}

              {categories.map((category) => (
                <button
                  key={category.id}
                  onClick={() => { onNavigate('category', category.slug); setMobileMenuOpen(false); }}
                  className="w-full text-left px-4 py-3 hover:bg-purple-50 rounded-lg flex justify-between items-center"
                >
                  <div>
                    <span className="font-medium">{category.nom}</span>
                    <span className="text-sm text-gray-500 ml-2">({category.produits_count})</span>
                  </div>
                  <ChevronRight className="h-5 w-5 text-gray-400" />
                </button>
              ))}
            </div>
          </div>
        )}
      </nav>

      {/* Auth Modal */}
      {showAuthModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl shadow-2xl max-w-md w-full p-8 relative max-h-[90vh] overflow-y-auto">
            <button onClick={() => setShowAuthModal(false)} className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 p-2 rounded-lg hover:bg-gray-100">
              <X className="h-6 w-6" />
            </button>

            <div className="text-center mb-8">
              <div className="w-16 h-16 bg-gradient-to-r from-purple-600 to-pink-600 rounded-full flex items-center justify-center mx-auto mb-4">
                <User className="h-8 w-8 text-white" />
              </div>
              <h2 className="text-3xl font-bold text-gray-900 mb-2">{authMode === 'login' ? 'Connexion' : 'Inscription'}</h2>
              <p className="text-gray-600">{authMode === 'login' ? 'Bon retour parmi nous !' : 'Rejoignez VIVIAS SHOP'}</p>
            </div>

            <form onSubmit={handleAuth} className="space-y-4">
              {authMode === 'register' && (
                <>
                  <div className="grid grid-cols-2 gap-3">
                    <input type="text" placeholder="Prénom" value={authData.prenom} onChange={(e) => setAuthData({...authData, prenom: e.target.value})} required className="px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent" />
                    <input type="text" placeholder="Nom" value={authData.nom} onChange={(e) => setAuthData({...authData, nom: e.target.value})} required className="px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent" />
                  </div>
                  <div className="relative">
                    <Phone className="absolute left-4 top-3.5 h-5 w-5 text-gray-400" />
                    <input type="tel" placeholder="Téléphone (ex: 771234567)" value={authData.telephone} onChange={(e) => setAuthData({...authData, telephone: e.target.value})} required className="w-full pl-12 pr-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent" />
                  </div>
                  <input type="text" placeholder="Ville" value={authData.ville} onChange={(e) => setAuthData({...authData, ville: e.target.value})} className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent" />
                </>
              )}

              <div className="relative">
                <Mail className="absolute left-4 top-3.5 h-5 w-5 text-gray-400" />
                <input type="email" placeholder="Email" value={authData.email} onChange={(e) => setAuthData({...authData, email: e.target.value})} required className="w-full pl-12 pr-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent" />
              </div>

              <div className="relative">
                <svg className="absolute left-4 top-3.5 h-5 w-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                </svg>
                <input type={showPassword ? 'text' : 'password'} placeholder="Mot de passe" value={authData.password} onChange={(e) => setAuthData({...authData, password: e.target.value})} required className="w-full pl-12 pr-12 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent" />
                <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-4 top-3.5 text-gray-400 hover:text-gray-600">
                  {showPassword ? <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" /></svg> : <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" /></svg>}
                </button>
              </div>

              {authMode === 'register' && (
                <>
                  <div className="relative">
                    <svg className="absolute left-4 top-3.5 h-5 w-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                    </svg>
                    <input type={showPassword ? 'text' : 'password'} placeholder="Confirmer le mot de passe" value={authData.password_confirmation} onChange={(e) => setAuthData({...authData, password_confirmation: e.target.value})} required className="w-full pl-12 pr-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent" />
                  </div>
                  
                  <label className="flex items-start gap-2 cursor-pointer">
                    <input type="checkbox" checked={authData.accepte_conditions} onChange={(e) => setAuthData({...authData, accepte_conditions: e.target.checked})} required className="w-5 h-5 text-purple-600 rounded focus:ring-purple-500 mt-0.5" />
                    <span className="text-sm text-gray-700">
                      J'accepte les conditions d'utilisation et la politique de confidentialité
                    </span>
                  </label>
                </>
              )}

              <button type="submit" disabled={authLoading} className="w-full bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white py-4 rounded-xl font-bold text-lg transition-all disabled:opacity-50 shadow-lg">
                {authLoading ? 'Chargement...' : (authMode === 'login' ? 'Se connecter' : 'S\'inscrire')}
              </button>

              <button type="button" onClick={() => { setAuthMode(authMode === 'login' ? 'register' : 'login'); setAuthData({email: '', password: '', password_confirmation: '', nom: '', prenom: '', telephone: '', ville: 'Dakar', accepte_conditions: false}); }} className="w-full text-center text-purple-600 hover:text-purple-700 font-medium">
                {authMode === 'login' ? 'Pas encore de compte ? S\'inscrire' : 'Déjà inscrit ? Se connecter'}
              </button>
            </form>
          </div>
        </div>
      )}
    </>
  );
};

export default Navbar;