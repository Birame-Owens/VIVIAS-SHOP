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
                          <img src={product.image} alt={product.nom} className="w-12 h-12 object-cover rounded-lg" />
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

              <button onClick={() => onNavigate('profile')} className="p-2 text-gray-600 hover:text-purple-600 transition-all hover:scale-110 hidden sm:block">
                <User className="h-6 w-6" />
              </button>

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
                            {category.image && <img src={category.image} alt={category.nom} className="w-full h-32 object-cover rounded-lg mb-4" />}
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
                                      <img src={product.image} alt={product.nom} className="w-full h-full object-cover hover:scale-110 transition-transform" />
                                      {product.en_promo && (
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
    </>
  );
};

export default Navbar;