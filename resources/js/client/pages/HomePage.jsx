import React, { useState, useEffect } from 'react';
import { 
  ShoppingBag, 
  Heart, 
  Search, 
  Menu, 
  X, 
  ChevronDown,
  Star,
  MessageCircle,
  Eye,
  Plus,
  Minus,
  Filter,
  Grid,
  List,
  ArrowRight,
  Instagram,
  Music,
  Phone,
  Mail,
  MapPin,
  User,
  ShoppingCart,
  Zap,
  TrendingUp,
  Gift,
  Truck,
  Shield,
  Award
} from 'lucide-react';

// Configuration de l'app
const APP_CONFIG = {
  company: {
    name: 'VIVIAS SHOP',
    whatsapp: '+221771397393',
    instagram: 'https://instagram.com/viviasshop',
    tiktok: 'https://tiktok.com/@viviasshop',
    email: 'contact@viviasshop.sn'
  },
  currency: 'F CFA'
};

// Hook pour gérer le panier
const useCart = () => {
  const [cart, setCart] = useState({ items: [], count: 0, total: 0 });
  
  const addToCart = async (productId, quantity = 1, options = {}) => {
    try {
      const response = await fetch('/api/client/cart/add', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ product_id: productId, quantity, ...options })
      });
      const result = await response.json();
      if (result.success) {
        fetchCart();
        showNotification('Produit ajouté au panier !', 'success');
        return { success: true, message: result.message };
      }
      return result;
    } catch (error) {
      return { success: false, message: 'Erreur lors de l\'ajout au panier' };
    }
  };

  const fetchCart = async () => {
    try {
      const response = await fetch('/api/client/cart');
      const data = await response.json();
      if (data.success) {
        setCart(data.data);
      }
    } catch (error) {
      console.error('Erreur chargement panier:', error);
    }
  };

  useEffect(() => {
    fetchCart();
  }, []);

  return { cart, addToCart, fetchCart };
};

// Hook pour gérer les favoris
const useWishlist = () => {
  const [wishlist, setWishlist] = useState({ items: [], count: 0 });
  
  const toggleWishlist = async (productId) => {
    try {
      const response = await fetch('/api/client/wishlist/add', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ product_id: productId })
      });
      const result = await response.json();
      if (result.success) {
        fetchWishlist();
        showNotification('Ajouté aux favoris !', 'success');
      }
      return result;
    } catch (error) {
      return { success: false, message: 'Erreur' };
    }
  };

  const fetchWishlist = async () => {
    try {
      const response = await fetch('/api/client/wishlist');
      const data = await response.json();
      if (data.success) {
        setWishlist(data.data);
      }
    } catch (error) {
      console.error('Erreur chargement favoris:', error);
    }
  };

  useEffect(() => {
    fetchWishlist();
  }, []);

  return { wishlist, toggleWishlist, fetchWishlist };
};

// Système de notifications
const showNotification = (message, type = 'info') => {
  // Implémenter système de toast/notification
  console.log(`${type}: ${message}`);
};

// Composant Navbar Dynamique
const DynamicNavbar = ({ onCartOpen, onWishlistOpen }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState(null);
  const [showSearch, setShowSearch] = useState(false);
  const [categories, setCategories] = useState([]);
  const [hoveredCategory, setHoveredCategory] = useState(null);
  const [categoryPreview, setCategoryPreview] = useState(null);
  const [isScrolled, setIsScrolled] = useState(false);
  
  const { cart } = useCart();
  const { wishlist } = useWishlist();

  // Gérer le scroll pour navbar sticky
  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 50);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Charger les catégories
  useEffect(() => {
    fetch('/api/client/navigation/menu')
      .then(res => res.json())
      .then(data => {
        if (data.success) setCategories(data.data);
      });
  }, []);

  // Recherche en temps réel
  useEffect(() => {
    if (searchQuery.length >= 2) {
      const timer = setTimeout(() => {
        fetch(`/api/client/search/suggestions?q=${encodeURIComponent(searchQuery)}`)
          .then(res => res.json())
          .then(data => {
            if (data.success) {
              setSearchResults(data.data);
              setShowSearch(true);
            }
          });
      }, 300);
      return () => clearTimeout(timer);
    } else {
      setShowSearch(false);
    }
  }, [searchQuery]);

  // Aperçu catégorie au survol
  const handleCategoryHover = async (slug) => {
    if (hoveredCategory !== slug) {
      setHoveredCategory(slug);
      try {
        const response = await fetch(`/api/client/navigation/categories/${slug}/preview`);
        const data = await response.json();
        if (data.success) {
          setCategoryPreview(data.data);
        }
      } catch (error) {
        console.error('Erreur aperçu catégorie:', error);
      }
    }
  };

  return (
    <nav className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
      isScrolled ? 'bg-white/95 backdrop-blur-md shadow-lg' : 'bg-white'
    }`}>
      {/* Barre du haut avec offres spéciales */}
      <div className="bg-gradient-to-r from-purple-600 to-pink-600 text-white py-2 px-4 text-center text-sm">
        <div className="flex items-center justify-center space-x-4">
          <Zap className="h-4 w-4" />
          <span>Livraison gratuite à partir de 50 000 F CFA</span>
          <Gift className="h-4 w-4" />
          <span>10% de réduction sur votre première commande</span>
        </div>
      </div>

      {/* Navbar principale */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <div className="flex items-center space-x-4">
            <div className="h-10 w-10 bg-gradient-to-r from-purple-600 to-pink-600 rounded-full flex items-center justify-center transform hover:scale-110 transition-transform">
              <span className="text-white font-bold text-lg">V</span>
            </div>
            <h1 className="text-2xl font-bold gradient-text hidden sm:block">
              {APP_CONFIG.company.name}
            </h1>
          </div>

          {/* Menu catégories desktop */}
          <div className="hidden lg:flex items-center space-x-8">
            {categories.map((category) => (
              <div
                key={category.id}
                className="relative group"
                onMouseEnter={() => handleCategoryHover(category.slug)}
                onMouseLeave={() => setHoveredCategory(null)}
              >
                <button className="flex items-center space-x-1 py-2 px-3 rounded-lg hover:bg-purple-50 transition-colors">
                  <span className="font-medium text-gray-700 group-hover:text-purple-600">
                    {category.nom}
                  </span>
                  <ChevronDown className="h-4 w-4 text-gray-400 group-hover:text-purple-600 transform group-hover:rotate-180 transition-transform" />
                </button>

                {/* Mega menu au survol */}
                {hoveredCategory === category.slug && categoryPreview && (
                  <div className="absolute top-full left-0 w-96 bg-white rounded-xl shadow-2xl border p-6 mt-2 animate-fade-in">
                    <div className="mb-4">
                      <h3 className="font-semibold text-lg text-gray-900">{categoryPreview.category?.nom}</h3>
                      <p className="text-sm text-gray-600">{categoryPreview.category?.description}</p>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      {categoryPreview.products?.slice(0, 4).map((product) => (
                        <div key={product.id} className="group cursor-pointer">
                          <div className="aspect-square bg-gray-100 rounded-lg overflow-hidden mb-2">
                            <img
                              src={product.image}
                              alt={product.nom}
                              className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                            />
                          </div>
                          <h4 className="text-sm font-medium text-gray-900 truncate">{product.nom}</h4>
                          <p className="text-sm text-purple-600 font-semibold">
                            {product.prix_affiche.toLocaleString()} {APP_CONFIG.currency}
                          </p>
                        </div>
                      ))}
                    </div>
                    <button className="w-full mt-4 bg-purple-600 text-white py-2 rounded-lg hover:bg-purple-700 transition-colors">
                      Voir tous les produits
                    </button>
                  </div>
                )}
              </div>
            ))}
          </div>

          {/* Barre de recherche */}
          <div className="flex-1 max-w-lg mx-8 relative hidden md:block">
            <div className="relative">
              <input
                type="text"
                placeholder="Rechercher des produits..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-full focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all"
              />
              <Search className="absolute left-3 top-2.5 h-5 w-5 text-gray-400" />
            </div>
            
            {/* Résultats de recherche */}
            {showSearch && searchResults && (
              <div className="absolute top-full left-0 right-0 bg-white border border-gray-200 rounded-lg shadow-xl mt-1 z-50 animate-slide-up">
                <div className="p-4">
                  <h4 className="font-semibold text-sm text-gray-700 mb-2">Suggestions</h4>
                  {searchResults.slice(0, 5).map((suggestion, index) => (
                    <div key={index} className="py-2 px-3 hover:bg-gray-50 rounded cursor-pointer">
                      <span className="text-sm">{suggestion}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Actions utilisateur */}
          <div className="flex items-center space-x-4">
            {/* Favoris */}
            <button 
              onClick={onWishlistOpen}
              className="relative p-2 text-gray-600 hover:text-purple-600 transition-colors group"
            >
              <Heart className="h-6 w-6 group-hover:scale-110 transition-transform" />
              {wishlist.count > 0 && (
                <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center animate-pulse">
                  {wishlist.count}
                </span>
              )}
            </button>

            {/* Panier */}
            <button 
              onClick={onCartOpen}
              className="relative p-2 text-gray-600 hover:text-purple-600 transition-colors group"
            >
              <ShoppingBag className="h-6 w-6 group-hover:scale-110 transition-transform" />
              {cart.count > 0 && (
                <span className="absolute -top-2 -right-2 bg-purple-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center animate-bounce">
                  {cart.count}
                </span>
              )}
            </button>

            {/* Compte utilisateur */}
            <button className="p-2 text-gray-600 hover:text-purple-600 transition-colors">
              <User className="h-6 w-6" />
            </button>

            {/* Menu mobile */}
            <button
              onClick={() => setIsOpen(!isOpen)}
              className="md:hidden p-2 text-gray-600 hover:text-purple-600 transition-colors"
            >
              {isOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Menu mobile */}
      {isOpen && (
        <div className="md:hidden bg-white border-t animate-slide-up">
          <div className="px-4 py-4 space-y-4">
            {/* Recherche mobile */}
            <div className="relative">
              <input
                type="text"
                placeholder="Rechercher..."
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-full focus:ring-2 focus:ring-purple-500"
              />
              <Search className="absolute left-3 top-2.5 h-5 w-5 text-gray-400" />
            </div>

            {/* Catégories mobile */}
            {categories.map((category) => (
              <button
                key={category.id}
                className="block w-full text-left py-2 px-4 text-gray-700 hover:bg-purple-50 rounded-lg transition-colors"
              >
                {category.nom}
              </button>
            ))}
          </div>
        </div>
      )}
    </nav>
  );
};

// Composant Hero Section
const HeroSection = () => {
  const [currentSlide, setCurrentSlide] = useState(0);
  const [heroData, setHeroData] = useState(null);

  useEffect(() => {
    fetch('/api/client/home')
      .then(res => res.json())
      .then(data => {
        if (data.success) {
          setHeroData(data.data.hero_banner);
        }
      });
  }, []);

  const slides = [
    {
      image: "https://images.unsplash.com/photo-1594633312681-425c7b97ccd1?w=1200",
      title: "Collection Été 2024",
      subtitle: "Découvrez nos dernières créations",
      cta: "Explorer maintenant"
    },
    {
      image: "https://images.unsplash.com/photo-1583743089695-4b12ffe5c75f?w=1200",
      title: "Mode Africaine Authentique",
      subtitle: "Tradition et modernité",
      cta: "Voir la collection"
    }
  ];

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % slides.length);
    }, 5000);
    return () => clearInterval(timer);
  }, []);

  return (
    <section className="relative h-screen flex items-center justify-center overflow-hidden">
      {/* Slider d'images */}
      <div className="absolute inset-0">
        {slides.map((slide, index) => (
          <div
            key={index}
            className={`absolute inset-0 transition-opacity duration-1000 ${
              index === currentSlide ? 'opacity-100' : 'opacity-0'
            }`}
          >
            <img
              src={slide.image}
              alt={slide.title}
              className="w-full h-full object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-r from-black/50 via-black/25 to-transparent"></div>
          </div>
        ))}
      </div>

      {/* Contenu */}
      <div className="relative z-10 text-center text-white max-w-4xl mx-auto px-4">
        {heroData?.has_promotion ? (
          <div className="space-y-8 animate-fade-in">
            <div className="inline-flex items-center px-6 py-3 bg-white/20 backdrop-blur-sm rounded-full">
              <Zap className="h-5 w-5 mr-2" />
              <span className="font-semibold">Promotion Spéciale</span>
            </div>
            <h1 className="text-6xl md:text-8xl font-bold mb-6">
              {heroData.promotion.nom}
            </h1>
            <p className="text-xl md:text-2xl opacity-90 mb-8">
              {heroData.promotion.description}
            </p>
            <div className="flex items-center justify-center space-x-8 mb-8">
              <div className="bg-white/20 backdrop-blur-sm rounded-xl px-6 py-4">
                <span className="text-sm opacity-75 block">Économisez</span>
                <div className="font-bold text-3xl">{heroData.promotion.valeur}%</div>
              </div>
              <div className="bg-white/20 backdrop-blur-sm rounded-xl px-6 py-4">
                <span className="text-sm opacity-75 block">Code</span>
                <div className="font-bold text-2xl">{heroData.promotion.code}</div>
              </div>
              <div className="bg-white/20 backdrop-blur-sm rounded-xl px-6 py-4">
                <span className="text-sm opacity-75 block">Temps restant</span>
                <div className="font-bold text-2xl">{heroData.promotion.jours_restants}j</div>
              </div>
            </div>
          </div>
        ) : (
          <div className="space-y-8 animate-fade-in">
            <h1 className="text-6xl md:text-8xl font-bold mb-6">
              {APP_CONFIG.company.name}
            </h1>
            <p className="text-xl md:text-2xl opacity-90 mb-8">
              Mode Africaine Authentique - Tradition et Élégance
            </p>
          </div>
        )}

        <button className="bg-white text-purple-600 font-semibold px-8 py-4 rounded-full hover:bg-gray-100 transition-all duration-300 transform hover:scale-105 inline-flex items-center group">
          <span>Découvrir la Collection</span>
          <ArrowRight className="ml-2 h-5 w-5 group-hover:translate-x-2 transition-transform" />
        </button>
      </div>

      {/* Indicateurs de slide */}
      <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 flex space-x-2">
        {slides.map((_, index) => (
          <button
            key={index}
            onClick={() => setCurrentSlide(index)}
            className={`w-3 h-3 rounded-full transition-all ${
              index === currentSlide ? 'bg-white' : 'bg-white/50'
            }`}
          />
        ))}
      </div>
    </section>
  );
};

// Composant ProductCard avec animations
const ProductCard = ({ product, onAddToCart, onAddToWishlist }) => {
  const [isHovered, setIsHovered] = useState(false);
  const [showQuickView, setShowQuickView] = useState(false);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);

  const handleWhatsApp = async () => {
    try {
      const response = await fetch(`/api/client/products/${product.id}/whatsapp-data`);
      const data = await response.json();
      if (data.success) {
        window.open(data.data.url, '_blank');
      }
    } catch (error) {
      console.error('Erreur WhatsApp:', error);
    }
  };

  return (
    <div 
      className="group relative bg-white rounded-2xl shadow-lg overflow-hidden hover:shadow-2xl transition-all duration-500 transform hover:-translate-y-2"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* Badge */}
      {product.badge && (
        <div className={`absolute top-4 left-4 z-10 px-3 py-1 rounded-full text-xs font-semibold ${
          product.badge.color === 'red' ? 'bg-red-500 text-white' : 
          product.badge.color === 'blue' ? 'bg-blue-500 text-white' : 
          'bg-yellow-500 text-white'
        } animate-pulse`}>
          {product.badge.text}
        </div>
      )}

      {/* Actions rapides */}
      <div className={`absolute top-4 right-4 z-10 flex flex-col space-y-2 transition-all duration-300 ${
        isHovered ? 'opacity-100 translate-x-0' : 'opacity-0 translate-x-4'
      }`}>
        <button
          onClick={() => onAddToWishlist(product.id)}
          className="w-10 h-10 bg-white/90 backdrop-blur-sm rounded-full flex items-center justify-center hover:bg-red-500 hover:text-white transition-all duration-300 transform hover:scale-110"
        >
          <Heart className="h-5 w-5" />
        </button>
        <button
          onClick={() => setShowQuickView(true)}
          className="w-10 h-10 bg-white/90 backdrop-blur-sm rounded-full flex items-center justify-center hover:bg-purple-500 hover:text-white transition-all duration-300 transform hover:scale-110"
        >
          <Eye className="h-5 w-5" />
        </button>
        <button
          onClick={handleWhatsApp}
          className="w-10 h-10 bg-white/90 backdrop-blur-sm rounded-full flex items-center justify-center hover:bg-green-500 hover:text-white transition-all duration-300 transform hover:scale-110"
        >
          <MessageCircle className="h-5 w-5" />
        </button>
      </div>

      {/* Image du produit */}
      <div className="aspect-square overflow-hidden relative">
        <img
          src={product.image}
          alt={product.nom}
          className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
        />
        {/* Overlay gradient au survol */}
        <div className={`absolute inset-0 bg-gradient-to-t from-black/50 to-transparent transition-opacity duration-300 ${
          isHovered ? 'opacity-100' : 'opacity-0'
        }`} />
      </div>

      {/* Informations produit */}
      <div className="p-6">
        {product.categorie && (
          <span className="text-xs text-purple-600 font-medium uppercase tracking-wide">
            {product.categorie.nom}
          </span>
        )}
        
        <h3 className="font-semibold text-gray-900 mt-2 mb-3 line-clamp-2 group-hover:text-purple-600 transition-colors">
          {product.nom}
        </h3>
        
        {/* Prix */}
        <div className="flex items-center space-x-2 mb-4">
          <span className="text-xl font-bold text-gray-900">
            {product.prix_affiche?.toLocaleString()} {APP_CONFIG.currency}
          </span>
          {product.en_promo && (
            <span className="text-sm text-gray-500 line-through">
              {product.prix?.toLocaleString()} {APP_CONFIG.currency}
            </span>
          )}
        </div>
        
        {/* Note et avis */}
        {product.note_moyenne > 0 && (
          <div className="flex items-center space-x-1 mb-4">
            <div className="flex items-center">
              {[...Array(5)].map((_, i) => (
                <Star
                  key={i}
                  className={`h-4 w-4 ${i < Math.floor(product.note_moyenne) ? 'text-yellow-400 fill-current' : 'text-gray-300'}`}
                />
              ))}
            </div>
            <span className="text-sm text-gray-600">({product.nombre_avis})</span>
          </div>
        )}
        
        {/* Actions */}
        <div className="flex space-x-2">
          <button 
            onClick={() => onAddToCart(product.id)}
            className="flex-1 bg-purple-600 text-white py-3 px-4 rounded-xl hover:bg-purple-700 transition-all duration-300 font-medium transform hover:scale-105 active:scale-95"
          >
            Ajouter au panier
          </button>
        </div>
      </div>

      {/* Quick View Modal */}
      {showQuickView && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4" onClick={() => setShowQuickView(false)}>
          <div className="bg-white rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto" onClick={e => e.stopPropagation()}>
            <div className="p-6">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-2xl font-bold">{product.nom}</h2>
                <button onClick={() => setShowQuickView(false)} className="p-2 hover:bg-gray-100 rounded-full">
                  <X className="h-6 w-6" />
                </button>
              </div>
              <div className="grid md:grid-cols-2 gap-6">
                <div className="aspect-square bg-gray-100 rounded-xl overflow-hidden">
                  <img src={product.image} alt={product.nom} className="w-full h-full object-cover" />
                </div>
                <div>
                  <p className="text-gray-600 mb-4">{product.description_courte}</p>
                  <div className="text-2xl font-bold text-purple-600 mb-4">
                    {product.prix_affiche?.toLocaleString()} {APP_CONFIG.currency}
                  </div>
                  <button 
                    onClick={() => {
                      onAddToCart(product.id);
                      setShowQuickView(false);
                    }}
                    className="w-full bg-purple-600 text-white py-3 rounded-xl hover:bg-purple-700 transition-colors"
                  >
                    Ajouter au panier
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

// Composant Section Produits
const ProductSection = ({ title, subtitle, products, onAddToCart, onAddToWishlist }) => {
  return (
    <section className="py-16 bg-gradient-to-br from-gray-50 to-purple-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h2 className="text-4xl font-bold text-gray-900 mb-4">{title}</h2>
          <p className="text-xl text-gray-600">{subtitle}</p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {products?.map((product) => (
            <ProductCard 
              key={product.id} 
              product={product} 
              onAddToCart={onAddToCart}
              onAddToWishlist={onAddToWishlist}
            />
          ))}
        </div>
        
        <div className="text-center mt-12">
          <button className="bg-purple-600 text-white px-8 py-4 rounded-xl hover:bg-purple-700 transition-all duration-300 transform hover:scale-105 inline-flex items-center group">
            <span>Voir tous les produits</span>
            <ArrowRight className="ml-2 h-5 w-5 group-hover:translate-x-2 transition-transform" />
          </button>
        </div>
      </div>
    </section>
  );
};

// Composant Footer
const Footer = () => {
  return (
    <footer className="bg-gray-900 text-white">
      {/* Newsletter */}
      <div className="bg-gradient-to-r from-purple-600 to-pink-600 py-16">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="mb-8">
            <Gift className="h-12 w-12 mx-auto mb-4" />
            <h2 className="text-3xl font-bold mb-4">Restez Informé(e)</h2>
            <p className="text-xl opacity-90">
              Inscrivez-vous à notre newsletter et recevez nos dernières nouveautés et promotions exclusives
            </p>
          </div>
          <form className="flex flex-col sm:flex-row gap-4 max-w-md mx-auto">
            <input
              type="email"
              placeholder="Votre adresse email"
              className="flex-1 px-4 py-3 rounded-lg text-gray-900 placeholder-gray-500 focus:ring-2 focus:ring-white focus:ring-offset-2 focus:ring-offset-purple-600"
            />
            <button
              type="submit"
              className="bg-white text-purple-600 font-semibold px-6 py-3 rounded-lg hover:bg-gray-100 transition-colors"
            >
              S'inscrire
            </button>
          </form>
          <p className="mt-4 text-sm opacity-75">
            10% de réduction sur votre première commande !
          </p>
        </div>
      </div>

      {/* Footer principal */}
      <div className="py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-4 gap-8">
            {/* À propos */}
            <div className="col-span-2">
              <div className="flex items-center space-x-3 mb-4">
                <div className="h-10 w-10 bg-gradient-to-r from-purple-600 to-pink-600 rounded-full flex items-center justify-center">
                  <span className="text-white font-bold text-lg">V</span>
                </div>
                <h3 className="text-2xl font-bold">{APP_CONFIG.company.name}</h3>
              </div>
              <p className="text-gray-400 mb-6 leading-relaxed">
                Votre boutique de mode africaine authentique. Nous proposons des vêtements traditionnels 
                et modernes de haute qualité, conçus avec passion au Sénégal.
              </p>
              {/* Réseaux sociaux */}
              <div className="flex space-x-4">
                <a 
                  href={APP_CONFIG.company.instagram}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-10 h-10 bg-gradient-to-r from-pink-500 to-purple-500 rounded-full flex items-center justify-center hover:scale-110 transition-transform"
                >
                  <Instagram className="h-5 w-5" />
                </a>
                <a 
                  href={APP_CONFIG.company.tiktok}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-10 h-10 bg-black rounded-full flex items-center justify-center hover:scale-110 transition-transform"
                >
                  <Music className="h-5 w-5" />
                </a>
                <a 
                  href={`https://wa.me/${APP_CONFIG.company.whatsapp}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-10 h-10 bg-green-500 rounded-full flex items-center justify-center hover:scale-110 transition-transform"
                >
                  <MessageCircle className="h-5 w-5" />
                </a>
              </div>
            </div>
            
            {/* Navigation */}
            <div>
              <h4 className="font-semibold mb-4 text-lg">Navigation</h4>
              <ul className="space-y-3 text-gray-400">
                <li><a href="#" className="hover:text-white transition-colors">Accueil</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Produits</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Catégories</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Promotions</a></li>
                <li><a href="#" className="hover:text-white transition-colors">À propos</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Contact</a></li>
              </ul>
            </div>
            
            {/* Contact */}
            <div>
              <h4 className="font-semibold mb-4 text-lg">Contact</h4>
              <ul className="space-y-3 text-gray-400">
                <li className="flex items-center space-x-3">
                  <Mail className="h-5 w-5 text-purple-400" />
                  <span>{APP_CONFIG.company.email}</span>
                </li>
                <li className="flex items-center space-x-3">
                  <Phone className="h-5 w-5 text-purple-400" />
                  <span>{APP_CONFIG.company.whatsapp}</span>
                </li>
                <li className="flex items-center space-x-3">
                  <MapPin className="h-5 w-5 text-purple-400" />
                  <span>Dakar, Sénégal</span>
                </li>
                <li className="flex items-center space-x-3">
                  <Shield className="h-5 w-5 text-purple-400" />
                  <span>Lun-Sam: 8h-18h</span>
                </li>
              </ul>
            </div>
          </div>
          
          {/* Barre de séparation */}
          <div className="border-t border-gray-800 mt-8 pt-8">
            <div className="flex flex-col md:flex-row justify-between items-center">
              <p className="text-gray-400 text-center md:text-left">
                © 2024 {APP_CONFIG.company.name}. Tous droits réservés.
              </p>
              <div className="flex items-center space-x-6 mt-4 md:mt-0">
                <div className="flex items-center space-x-2 text-gray-400">
                  <Truck className="h-5 w-5" />
                  <span>Livraison gratuite +50k FCFA</span>
                </div>
                <div className="flex items-center space-x-2 text-gray-400">
                  <Shield className="h-5 w-5" />
                  <span>Paiement sécurisé</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};

// Composant principal de la page d'accueil
const ViviasShopHomepage = () => {
  const [homeData, setHomeData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showCart, setShowCart] = useState(false);
  const [showWishlist, setShowWishlist] = useState(false);
  
  const { cart, addToCart } = useCart();
  const { wishlist, toggleWishlist } = useWishlist();

  // Charger les données de la page d'accueil
  useEffect(() => {
    fetch('/api/client/home')
      .then(res => res.json())
      .then(data => {
        if (data.success) {
          setHomeData(data.data);
        }
      })
      .catch(error => console.error('Erreur chargement accueil:', error))
      .finally(() => setLoading(false));
  }, []);

  const handleAddToCart = async (productId, options = {}) => {
    const result = await addToCart(productId, 1, options);
    if (result.success) {
      showNotification('Produit ajouté au panier !', 'success');
    } else {
      showNotification(result.message, 'error');
    }
  };

  const handleAddToWishlist = async (productId) => {
    const result = await toggleWishlist(productId);
    if (result.success) {
      showNotification('Ajouté aux favoris !', 'success');
    } else {
      showNotification(result.message, 'error');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-50 to-pink-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-purple-600 mx-auto mb-4"></div>
          <p className="text-gray-600 text-lg">Chargement de {APP_CONFIG.company.name}...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white">
      {/* Navbar */}
      <DynamicNavbar 
        onCartOpen={() => setShowCart(true)}
        onWishlistOpen={() => setShowWishlist(true)}
      />

      {/* Hero Section */}
      <HeroSection />

      {/* Section Catégories */}
      {homeData?.categories_preview && (
        <section className="py-16 bg-white">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-12">
              <h2 className="text-4xl font-bold text-gray-900 mb-4">Nos Collections</h2>
              <p className="text-xl text-gray-600">Découvrez nos différentes catégories de mode africaine</p>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-6">
              {homeData.categories_preview.map((category) => (
                <div key={category.id} className="group cursor-pointer">
                  <div className="aspect-square bg-gradient-to-br from-purple-100 to-pink-100 rounded-2xl shadow-lg overflow-hidden hover:shadow-2xl transition-all duration-500 transform hover:scale-105">
                    <img
                      src={category.image || '/api/placeholder/300/300'}
                      alt={category.nom}
                      className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                    />
                  </div>
                  <div className="mt-4 text-center">
                    <h3 className="font-semibold text-gray-900 group-hover:text-purple-600 transition-colors">{category.nom}</h3>
                    <p className="text-sm text-gray-500">{category.produits_count} produits</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Produits en vedette */}
      {homeData?.featured_products && (
        <ProductSection
          title="Produits en Vedette"
          subtitle="Nos pièces les plus appréciées par nos clients"
          products={homeData.featured_products}
          onAddToCart={handleAddToCart}
          onAddToWishlist={handleAddToWishlist}
        />
      )}

      {/* Nouveautés */}
      {homeData?.new_arrivals && (
        <ProductSection
          title="Nouveautés"
          subtitle="Découvrez nos dernières créations"
          products={homeData.new_arrivals}
          onAddToCart={handleAddToCart}
          onAddToWishlist={handleAddToWishlist}
        />
      )}

      {/* Statistiques boutique */}
      {homeData?.shop_stats && (
        <section className="py-16 bg-gradient-to-r from-purple-600 to-pink-600 text-white">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-12">
              <h2 className="text-4xl font-bold">Pourquoi Choisir {APP_CONFIG.company.name} ?</h2>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
              <div className="text-center group">
                <div className="w-16 h-16 bg-white/20 rounded-full flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform">
                  <ShoppingBag className="h-8 w-8" />
                </div>
                <div className="text-3xl font-bold mb-2">{homeData.shop_stats.produits_disponibles}</div>
                <div className="text-sm opacity-75">Produits disponibles</div>
              </div>
              <div className="text-center group">
                <div className="w-16 h-16 bg-white/20 rounded-full flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform">
                  <User className="h-8 w-8" />
                </div>
                <div className="text-3xl font-bold mb-2">{homeData.shop_stats.clients_satisfaits}</div>
                <div className="text-sm opacity-75">Clients satisfaits</div>
              </div>
              <div className="text-center group">
                <div className="w-16 h-16 bg-white/20 rounded-full flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform">
                  <Award className="h-8 w-8" />
                </div>
                <div className="text-3xl font-bold mb-2">{homeData.shop_stats.note_moyenne}/5</div>
                <div className="text-sm opacity-75">Note moyenne</div>
              </div>
              <div className="text-center group">
                <div className="w-16 h-16 bg-white/20 rounded-full flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform">
                  <Truck className="h-8 w-8" />
                </div>
                <div className="text-3xl font-bold mb-2">{homeData.shop_stats.commandes_livrees}</div>
                <div className="text-sm opacity-75">Commandes livrées</div>
              </div>
            </div>
          </div>
        </section>
      )}

      {/* Footer */}
      <Footer />

      {/* Styles CSS personnalisés */}
      <style jsx>{`
        .gradient-text {
          background: linear-gradient(135deg, #7c3aed 0%, #ec4899 100%);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
        }

        .animate-fade-in {
          animation: fadeIn 0.8s ease-out;
        }

        .animate-slide-up {
          animation: slideUp 0.3s ease-out;
        }

        .line-clamp-2 {
          overflow: hidden;
          display: -webkit-box;
          -webkit-box-orient: vertical;
          -webkit-line-clamp: 2;
        }

        @keyframes fadeIn {
          from {
            opacity: 0;
            transform: translateY(30px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        @keyframes slideUp {
          from {
            opacity: 0;
            transform: translateY(20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
      `}</style>
    </div>
  );
};

export default ViviasShopHomepage;