import React, { useState, useEffect } from 'react';
import Navbar from '../components/Navbar';
import { 
  ShoppingBag, Heart, Star, Zap, Gift, Truck, Shield, Award, Eye, ShoppingCart,
  Phone, Mail, MapPin, ChevronLeft, ChevronRight, ArrowRight, Package,
  Sparkles, Crown, Flame, Instagram, Facebook, Twitter, X, Clock, User, Tag
} from 'lucide-react';
import api from '../utils/api';

const HomePage = () => {
  const [homeData, setHomeData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [cartCount, setCartCount] = useState(0);
  const [wishlistCount, setWishlistCount] = useState(0);

  useEffect(() => {
    loadHomeData();
  }, []);

  const loadHomeData = async () => {
    try {
      setLoading(true);
      
      const [homeResponse, cartResponse, wishlistResponse] = await Promise.all([
        api.getHomeData(),
        api.getCartCount(),
        api.getWishlistCount()
      ]);

      if (homeResponse.success) {
        setHomeData(homeResponse.data);
      }
      
      if (cartResponse.success) setCartCount(cartResponse.data.count || 0);
      if (wishlistResponse.success) setWishlistCount(wishlistResponse.data.count || 0);
    } catch (error) {
      console.error('Erreur chargement:', error);
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
      search: `/search?q=${encodeURIComponent(params.q)}`,
      profile: '/profile',
      promotions: '/promotions'
    };
    if (routes[type]) window.location.href = routes[type];
  };

  const handleAddToCart = async (productId, options = {}) => {
    try {
      const response = await api.addToCart(productId, 1, options);
      if (response.success) {
        setCartCount(prev => prev + 1);
        showNotification('✅ Produit ajouté au panier !', 'success');
      } else {
        showNotification('❌ ' + (response.message || 'Erreur'), 'error');
      }
    } catch (error) {
      showNotification('❌ Erreur lors de l\'ajout', 'error');
    }
  };

  const handleAddToWishlist = async (productId) => {
    try {
      const response = await api.addToWishlist(productId);
      if (response.success) {
        setWishlistCount(prev => prev + 1);
        showNotification('❤️ Ajouté aux favoris !', 'success');
      } else {
        showNotification('❌ ' + (response.message || 'Erreur'), 'error');
      }
    } catch (error) {
      showNotification('❌ Erreur lors de l\'ajout', 'error');
    }
  };

  const handleSearch = async (query) => {
    try {
      const response = await api.quickSearch(query);
      return response.success ? response.data : { produits: [], categories: [] };
    } catch (error) {
      return { produits: [], categories: [] };
    }
  };

  const showNotification = (message, type) => {
    // Simple notification (à remplacer par un vrai système de toast)
    alert(message);
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-purple-50 via-pink-50 to-purple-50">
        <div className="text-center">
          <div className="w-20 h-20 bg-gradient-to-r from-purple-600 to-pink-600 rounded-full flex items-center justify-center mx-auto mb-6 animate-bounce">
            <span className="text-white font-bold text-3xl">V</span>
          </div>
          <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-purple-600 mx-auto mb-4"></div>
          <p className="text-gray-600 text-lg font-medium">Chargement de VIVIAS SHOP...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white">
      <Navbar
        cartCount={cartCount}
        wishlistCount={wishlistCount}
        categories={homeData?.categories_preview || []}
        onNavigate={handleNavigation}
        onSearch={handleSearch}
      />

      <HeroCarousel heroData={homeData?.hero_banner} onNavigate={handleNavigation} />

      {homeData?.active_promotions?.length > 0 && (
        <PromotionBanner promotions={homeData.active_promotions} onNavigate={handleNavigation} />
      )}

      <FeaturesSection />

      {homeData?.categories_preview?.length > 0 && (
        <CategoriesSection categories={homeData.categories_preview} onNavigate={handleNavigation} />
      )}

      {homeData?.featured_products?.length > 0 && (
        <ProductsSection
          title="Produits en Vedette"
          subtitle="Découvrez nos pièces les plus appréciées"
          icon={Sparkles}
          products={homeData.featured_products}
          onAddToCart={handleAddToCart}
          onAddToWishlist={handleAddToWishlist}
          onNavigate={handleNavigation}
        />
      )}

      {homeData?.new_arrivals?.length > 0 && (
        <ProductsSection
          title="Nouveautés"
          subtitle="Les dernières créations de nos artisans"
          icon={Flame}
          products={homeData.new_arrivals}
          onAddToCart={handleAddToCart}
          onAddToWishlist={handleAddToWishlist}
          onNavigate={handleNavigation}
          bgClass="bg-gradient-to-br from-purple-50 to-pink-50"
        />
      )}

      {homeData?.products_on_sale?.length > 0 && (
        <ProductsSection
          title="Promotions"
          subtitle="Profitez de nos meilleures offres"
          icon={Tag}
          products={homeData.products_on_sale}
          onAddToCart={handleAddToCart}
          onAddToWishlist={handleAddToWishlist}
          onNavigate={handleNavigation}
        />
      )}

      <StatsSection stats={homeData?.shop_stats} />
      <NewsletterSection />
      <Footer onNavigate={handleNavigation} />

      {/* WhatsApp Floating Button */}
      <a
        href={`https://wa.me/221771397393`}
        target="_blank"
        rel="noopener noreferrer"
        className="fixed bottom-6 right-6 w-16 h-16 bg-green-500 hover:bg-green-600 text-white rounded-full shadow-2xl flex items-center justify-center transition-all hover:scale-110 z-40 animate-bounce"
      >
        <Phone className="h-8 w-8" />
      </a>
    </div>
  );
};

// Hero Carousel Component
const HeroCarousel = ({ heroData, onNavigate }) => {
  const [currentSlide, setCurrentSlide] = useState(0);

  const slides = heroData?.promotion ? [
    {
      image: heroData.promotion.image || "/assets/images/hero1.jpg",
      title: heroData.promotion.nom,
      subtitle: heroData.promotion.description,
      promo: heroData.promotion,
      hasPromo: true
    }
  ] : [
    {
      image: "/assets/images/hero1.jpg",
      title: "Collection Exclusive 2024",
      subtitle: "Élégance et Tradition Africaine",
      hasPromo: false
    }
  ];

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % slides.length);
    }, 5000);
    return () => clearInterval(timer);
  }, [slides.length]);

  return (
    <section className="relative h-[600px] md:h-screen overflow-hidden bg-gradient-to-br from-purple-50 to-pink-50">
      {slides.map((slide, index) => (
        <div
          key={index}
          className={`absolute inset-0 transition-all duration-1000 ${
            index === currentSlide ? 'opacity-100 scale-100' : 'opacity-0 scale-105'
          }`}
        >
          <img src={slide.image} alt={slide.title} className="w-full h-full object-cover" />
          <div className="absolute inset-0 bg-gradient-to-r from-black/70 via-black/40 to-transparent"></div>
        </div>
      ))}

      <div className="relative z-10 h-full flex items-center">
        <div className="max-w-7xl mx-auto px-4 w-full">
          <div className="max-w-3xl text-white">
            {slides[currentSlide].hasPromo && (
              <div className="inline-flex items-center gap-2 bg-red-500 text-white px-4 py-2 rounded-full mb-4 animate-bounce">
                <Flame className="h-5 w-5" />
                <span className="font-bold">PROMOTION EN COURS</span>
              </div>
            )}
            
            <h1 className="text-4xl md:text-7xl font-bold mb-4 md:mb-6">{slides[currentSlide].title}</h1>
            <p className="text-lg md:text-2xl mb-6 md:mb-8 opacity-90">{slides[currentSlide].subtitle}</p>

            {slides[currentSlide].hasPromo && slides[currentSlide].promo && (
              <div className="flex flex-wrap items-center gap-4 mb-8">
                <div className="bg-white/20 backdrop-blur-md rounded-2xl px-8 py-4 border-2 border-white/30">
                  <span className="text-sm opacity-90 block mb-1">Économisez jusqu'à</span>
                  <div className="font-bold text-4xl md:text-5xl">{slides[currentSlide].promo.valeur}%</div>
                </div>
                
                {slides[currentSlide].promo.code && (
                  <div className="bg-white/20 backdrop-blur-md rounded-2xl px-8 py-4 border-2 border-white/30">
                    <span className="text-sm opacity-90 block mb-1">Code promo</span>
                    <div className="font-bold text-2xl md:text-3xl">{slides[currentSlide].promo.code}</div>
                  </div>
                )}
              </div>
            )}

            <div className="flex flex-wrap gap-4">
              <button 
                onClick={() => onNavigate('shop')}
                className="bg-white text-purple-600 font-semibold px-8 py-4 rounded-full hover:bg-gray-100 transition-all transform hover:scale-105 shadow-xl flex items-center gap-2"
              >
                Découvrir la Collection
                <ArrowRight className="h-5 w-5" />
              </button>
            </div>
          </div>
        </div>
      </div>

      <button
        onClick={() => setCurrentSlide((prev) => (prev - 1 + slides.length) % slides.length)}
        className="absolute left-4 top-1/2 -translate-y-1/2 z-20 w-14 h-14 bg-white/30 backdrop-blur-sm rounded-full flex items-center justify-center hover:bg-white/50"
      >
        <ChevronLeft className="h-7 w-7 text-white" />
      </button>
      
      <button
        onClick={() => setCurrentSlide((prev) => (prev + 1) % slides.length)}
        className="absolute right-4 top-1/2 -translate-y-1/2 z-20 w-14 h-14 bg-white/30 backdrop-blur-sm rounded-full flex items-center justify-center hover:bg-white/50"
      >
        <ChevronRight className="h-7 w-7 text-white" />
      </button>

      <div className="absolute bottom-8 left-1/2 -translate-x-1/2 z-20 flex space-x-3">
        {slides.map((_, index) => (
          <button
            key={index}
            onClick={() => setCurrentSlide(index)}
            className={`h-3 rounded-full transition-all ${index === currentSlide ? 'bg-white w-12' : 'bg-white/50 w-3'}`}
          />
        ))}
      </div>
    </section>
  );
};

// Promotion Banner
const PromotionBanner = ({ promotions, onNavigate }) => (
  <section className="py-12 bg-gradient-to-r from-red-500 via-pink-500 to-purple-500">
    <div className="max-w-7xl mx-auto px-4">
      <div className="flex flex-col md:flex-row items-center justify-between text-white">
        <div className="mb-6 md:mb-0 text-center md:text-left">
          <div className="flex items-center justify-center md:justify-start gap-3 mb-3">
            <Flame className="h-8 w-8 animate-bounce" />
            <h3 className="text-3xl md:text-4xl font-bold">Promotions en cours !</h3>
          </div>
          <p className="text-lg opacity-90">{promotions[0].description}</p>
        </div>
        <div className="flex flex-col sm:flex-row items-center gap-4">
          <div className="bg-white/20 backdrop-blur-md rounded-2xl px-8 py-4 border-2 border-white/30">
            <span className="text-sm block mb-1">Jusqu'à</span>
            <div className="font-bold text-5xl">-{promotions[0].valeur}%</div>
          </div>
          <button
            onClick={() => onNavigate('promotions')}
            className="bg-white text-red-600 font-bold px-8 py-4 rounded-full hover:bg-gray-100 transition-all transform hover:scale-105 shadow-xl"
          >
            Voir les offres
          </button>
        </div>
      </div>
    </div>
  </section>
);

// Features Section
const FeaturesSection = () => {
  const features = [
    { icon: Truck, title: "Livraison Rapide", description: "Livraison gratuite dès 50 000 FCFA" },
    { icon: Shield, title: "Paiement Sécurisé", description: "Transactions 100% sécurisées" },
    { icon: Package, title: "Retours Faciles", description: "30 jours pour changer d'avis" },
    { icon: Award, title: "Qualité Garantie", description: "Produits authentiques certifiés" }
  ];

  return (
    <section className="py-16 bg-white">
      <div className="max-w-7xl mx-auto px-4">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
          {features.map((feature, index) => (
            <div key={index} className="text-center group">
              <div className="w-16 h-16 bg-gradient-to-br from-purple-100 to-pink-100 rounded-2xl flex items-center justify-center mx-auto mb-4 group-hover:scale-110 group-hover:shadow-lg transition-all">
                <feature.icon className="h-8 w-8 text-purple-600" />
              </div>
              <h3 className="font-bold text-gray-900 mb-2">{feature.title}</h3>
              <p className="text-sm text-gray-600">{feature.description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

// Categories Section
const CategoriesSection = ({ categories, onNavigate }) => (
  <section className="py-20 bg-gradient-to-br from-gray-50 via-purple-50 to-pink-50">
    <div className="max-w-7xl mx-auto px-4">
      <div className="text-center mb-12">
        <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">Nos Collections</h2>
        <p className="text-xl text-gray-600">Découvrez notre sélection de mode africaine authentique</p>
      </div>
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6">
        {categories.map((category) => (
          <button
            key={category.id}
            onClick={() => onNavigate('category', category.slug)}
            className="group cursor-pointer"
          >
            <div className="relative aspect-square bg-gradient-to-br from-purple-100 to-pink-100 rounded-2xl overflow-hidden shadow-lg hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-2">
              {category.image && (
                <img
                  src={category.image}
                  alt={category.nom}
                  className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                />
              )}
              <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent group-hover:from-black/80 transition-all">
                <div className="absolute bottom-0 left-0 right-0 p-6 text-white">
                  <h3 className="font-bold text-xl mb-1">{category.nom}</h3>
                  <p className="text-sm opacity-90">{category.produits_count} produits</p>
                </div>
              </div>
              {category.est_populaire && (
                <div className="absolute top-3 right-3 bg-red-500 text-white px-3 py-1 rounded-full text-xs font-bold flex items-center gap-1 animate-pulse">
                  <Crown className="h-3 w-3" />
                  TOP
                </div>
              )}
            </div>
          </button>
        ))}
      </div>
    </div>
  </section>
);

// Products Section (réutilisable)
const ProductsSection = ({ title, subtitle, icon: Icon, products, onAddToCart, onAddToWishlist, onNavigate, bgClass = "bg-white" }) => (
  <section className={`py-20 ${bgClass}`}>
    <div className="max-w-7xl mx-auto px-4">
      <div className="text-center mb-12">
        <div className="inline-flex items-center gap-2 bg-gradient-to-r from-purple-100 to-pink-100 text-purple-700 px-6 py-2 rounded-full mb-4">
          <Icon className="h-5 w-5" />
          <span className="font-semibold">{title.toUpperCase()}</span>
        </div>
        <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">{title}</h2>
        <p className="text-xl text-gray-600">{subtitle}</p>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {products.map((product) => (
          <ProductCard
            key={product.id}
            product={product}
            onAddToCart={onAddToCart}
            onAddToWishlist={onAddToWishlist}
            onNavigate={onNavigate}
          />
        ))}
      </div>
    </div>
  </section>
);

// Product Card Component
const ProductCard = ({ product, onAddToCart, onAddToWishlist, onNavigate }) => {
  const [isHovered, setIsHovered] = useState(false);
  const [selectedColor, setSelectedColor] = useState(product.couleurs_disponibles?.[0] || null);
  const [selectedSize, setSelectedSize] = useState(product.tailles_disponibles?.[0] || null);

  const reduction = product.prix_promo 
    ? Math.round(((product.prix - product.prix_promo) / product.prix) * 100)
    : 0;

  const handleAddToCart = (e) => {
    e.stopPropagation();
    if (product.couleurs_disponibles?.length > 0 && !selectedColor) {
      alert('Veuillez sélectionner une couleur');
      return;
    }
    if (product.tailles_disponibles?.length > 0 && !selectedSize) {
      alert('Veuillez sélectionner une taille');
      return;
    }
    onAddToCart(product.id, { taille: selectedSize, couleur: selectedColor });
  };

  return (
    <div
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      className="group bg-white rounded-2xl overflow-hidden shadow-md hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-2 relative"
    >
      {/* Badges */}
      <div className="absolute top-3 left-3 z-10 flex flex-col gap-2">
        {product.prix_promo && (
          <span className="bg-red-500 text-white text-xs font-bold px-3 py-1 rounded-full shadow-lg">
            -{reduction}%
          </span>
        )}
        {product.est_nouveaute && (
          <span className="bg-blue-500 text-white text-xs font-bold px-3 py-1 rounded-full shadow-lg flex items-center gap-1">
            <Sparkles className="h-3 w-3" />
            NEW
          </span>
        )}
        {product.est_populaire && (
          <span className="bg-yellow-500 text-white text-xs font-bold px-3 py-1 rounded-full shadow-lg flex items-center gap-1">
            <Flame className="h-3 w-3" />
            HOT
          </span>
        )}
      </div>

      {/* Quick Actions */}
      <div className={`absolute top-3 right-3 z-10 flex flex-col gap-2 transition-all duration-300 ${
        isHovered ? 'opacity-100 translate-x-0' : 'opacity-0 translate-x-4'
      }`}>
        <button
          onClick={(e) => { e.stopPropagation(); onAddToWishlist(product.id); }}
          className="w-11 h-11 bg-white/95 backdrop-blur-sm rounded-full flex items-center justify-center hover:bg-pink-500 hover:text-white transition-all shadow-lg"
        >
          <Heart className="h-5 w-5" />
        </button>
        <button
          onClick={(e) => { e.stopPropagation(); onNavigate('product', product.slug); }}
          className="w-11 h-11 bg-white/95 backdrop-blur-sm rounded-full flex items-center justify-center hover:bg-purple-500 hover:text-white transition-all shadow-lg"
        >
          <Eye className="h-5 w-5" />
        </button>
      </div>

      {/* Product Image - Cliquable pour aller vers la page détail */}
      <div 
        onClick={() => onNavigate('product', product.slug)}
        className="relative aspect-[3/4] overflow-hidden cursor-pointer bg-gray-100"
      >
        <img
          src={product.image}
          alt={product.nom}
          className={`w-full h-full object-cover transition-transform duration-700 ${
            isHovered ? 'scale-110' : 'scale-100'
          }`}
        />
      </div>

      {/* Product Info */}
      <div className="p-4">
        <h3 
          onClick={() => onNavigate('product', product.slug)}
          className="font-semibold text-gray-900 mb-2 line-clamp-2 group-hover:text-purple-600 transition-colors cursor-pointer"
        >
          {product.nom}
        </h3>

        {/* Rating */}
        {product.note_moyenne > 0 && (
          <div className="flex items-center gap-2 mb-2">
            <div className="flex">
              {[...Array(5)].map((_, i) => (
                <Star
                  key={i}
                  className={`h-4 w-4 ${
                    i < Math.floor(product.note_moyenne) ? 'text-yellow-400 fill-current' : 'text-gray-300'
                  }`}
                />
              ))}
            </div>
            <span className="text-xs text-gray-600">({product.nombre_avis})</span>
          </div>
        )}

        {/* Price */}
        <div className="flex items-center gap-2 mb-3">
          <span className="text-xl font-bold text-gray-900">
            {product.prix_affiche?.toLocaleString()} FCFA
          </span>
          {product.prix_promo && (
            <span className="text-sm text-gray-400 line-through">
              {product.prix?.toLocaleString()}
            </span>
          )}
        </div>

        {/* Color Selection */}
        {product.couleurs_disponibles?.length > 0 && (
          <div className="mb-3">
            <p className="text-xs text-gray-600 mb-2">Couleurs:</p>
            <div className="flex gap-2 flex-wrap">
              {product.couleurs_disponibles.slice(0, 5).map((couleur, idx) => (
                <button
                  key={idx}
                  onClick={(e) => { e.stopPropagation(); setSelectedColor(couleur); }}
                  className={`w-6 h-6 rounded-full border-2 transition-all ${
                    selectedColor === couleur ? 'border-purple-600 scale-110' : 'border-gray-300'
                  }`}
                  style={{ backgroundColor: couleur.toLowerCase() }}
                  title={couleur}
                />
              ))}
            </div>
          </div>
        )}

        {/* Size Selection */}
        {product.tailles_disponibles?.length > 0 && (
          <div className="mb-4">
            <p className="text-xs text-gray-600 mb-2">Tailles:</p>
            <div className="flex gap-2 flex-wrap">
              {product.tailles_disponibles.map((taille, idx) => (
                <button
                  key={idx}
                  onClick={(e) => { e.stopPropagation(); setSelectedSize(taille); }}
                  className={`px-3 py-1 text-xs font-medium rounded-lg transition-all ${
                    selectedSize === taille
                      ? 'bg-purple-600 text-white'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  {taille}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Add to Cart Button */}
        <button 
          onClick={handleAddToCart}
          className="w-full bg-gradient-to-r from-purple-600 to-pink-600 text-white py-3 rounded-xl hover:from-purple-700 hover:to-pink-700 transition-all duration-300 font-semibold transform hover:scale-105 active:scale-95 flex items-center justify-center gap-2 shadow-lg"
        >
          <ShoppingCart className="h-5 w-5" />
          Ajouter au panier
        </button>
      </div>
    </div>
  );
};

// Stats Section
const StatsSection = ({ stats }) => {
  const defaultStats = {
    produits_disponibles: 500,
    clients_satisfaits: 2500,
    note_moyenne: 4.8,
    commandes_livrees: 5000
  };

  const displayStats = stats || defaultStats;

  return (
    <section className="py-20 bg-gradient-to-r from-purple-600 via-pink-600 to-purple-600 text-white relative overflow-hidden">
      <div className="absolute inset-0 opacity-10">
        <div className="absolute top-0 left-0 w-96 h-96 bg-white rounded-full blur-3xl"></div>
        <div className="absolute bottom-0 right-0 w-96 h-96 bg-white rounded-full blur-3xl"></div>
      </div>
      
      <div className="max-w-7xl mx-auto px-4 relative z-10">
        <h2 className="text-4xl md:text-5xl font-bold text-center mb-4">Pourquoi VIVIAS SHOP ?</h2>
        <p className="text-center text-xl opacity-90 mb-12">Votre destination pour la mode africaine authentique</p>
        
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
          <div className="text-center">
            <Package className="h-10 w-10 mx-auto mb-4" />
            <div className="text-4xl md:text-5xl font-bold mb-2">{displayStats.produits_disponibles}+</div>
            <div className="text-sm md:text-base opacity-90">Produits disponibles</div>
          </div>
          <div className="text-center">
            <User className="h-10 w-10 mx-auto mb-4" />
            <div className="text-4xl md:text-5xl font-bold mb-2">{displayStats.clients_satisfaits}+</div>
            <div className="text-sm md:text-base opacity-90">Clients satisfaits</div>
          </div>
          <div className="text-center">
            <Star className="h-10 w-10 mx-auto mb-4" />
            <div className="text-4xl md:text-5xl font-bold mb-2">{displayStats.note_moyenne}/5</div>
            <div className="text-sm md:text-base opacity-90">Note moyenne</div>
          </div>
          <div className="text-center">
            <Truck className="h-10 w-10 mx-auto mb-4" />
            <div className="text-4xl md:text-5xl font-bold mb-2">{displayStats.commandes_livrees}+</div>
            <div className="text-sm md:text-base opacity-90">Commandes livrées</div>
          </div>
        </div>
      </div>
    </section>
  );
};

// Newsletter Section
const NewsletterSection = () => {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!email) return;

    setLoading(true);
    try {
      const response = await fetch('/api/client/newsletter/subscribe', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-CSRF-TOKEN': document.querySelector('meta[name="csrf-token"]')?.content
        },
        body: JSON.stringify({ email })
      });

      const result = await response.json();
      setMessage(result.success ? 'Merci pour votre inscription !' : 'Erreur. Réessayez.');
      if (result.success) setEmail('');
    } catch (error) {
      setMessage('Erreur. Réessayez.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <section className="py-20 bg-gradient-to-r from-purple-600 to-pink-600">
      <div className="max-w-4xl mx-auto px-4 text-center text-white">
        <Gift className="h-16 w-16 mx-auto mb-6" />
        <h2 className="text-4xl md:text-5xl font-bold mb-4">Restez Informé(e)</h2>
        <p className="text-xl md:text-2xl opacity-90 mb-8">
          Inscrivez-vous et recevez 10% de réduction sur votre première commande
        </p>
        
        <div className="max-w-md mx-auto">
          <div className="flex flex-col sm:flex-row gap-3">
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Votre adresse email"
              className="flex-1 px-6 py-4 rounded-full text-gray-900 focus:outline-none focus:ring-4 focus:ring-white/50"
            />
            <button
              onClick={handleSubmit}
              disabled={loading}
              className="bg-white text-purple-600 font-bold px-8 py-4 rounded-full hover:bg-gray-100 transition-all transform hover:scale-105 disabled:opacity-50 shadow-xl"
            >
              {loading ? 'Envoi...' : "S'inscrire"}
            </button>
          </div>
          {message && (
            <p className="mt-4 text-sm bg-white/20 backdrop-blur-sm py-2 px-4 rounded-full">
              {message}
            </p>
          )}
        </div>
      </div>
    </section>
  );
};

// Footer
const Footer = ({ onNavigate }) => (
  <footer className="bg-gray-900 text-white">
    <div className="py-16">
      <div className="max-w-7xl mx-auto px-4 grid md:grid-cols-4 gap-8">
        <div className="col-span-2">
          <div className="flex items-center space-x-3 mb-4">
            <div className="h-12 w-12 bg-gradient-to-r from-purple-600 to-pink-600 rounded-full flex items-center justify-center">
              <span className="text-white font-bold text-xl">V</span>
            </div>
            <h3 className="text-2xl font-bold">VIVIAS SHOP</h3>
          </div>
          <p className="text-gray-400 mb-6">Votre boutique de mode africaine authentique</p>
          <div className="flex gap-4">
            <button className="w-10 h-10 bg-gray-800 hover:bg-purple-600 rounded-full flex items-center justify-center transition-colors">
              <Instagram className="h-5 w-5" />
            </button>
            <button className="w-10 h-10 bg-gray-800 hover:bg-purple-600 rounded-full flex items-center justify-center transition-colors">
              <Facebook className="h-5 w-5" />
            </button>
            <button className="w-10 h-10 bg-gray-800 hover:bg-purple-600 rounded-full flex items-center justify-center transition-colors">
              <Twitter className="h-5 w-5" />
            </button>
          </div>
        </div>
        
        <div>
          <h4 className="font-bold text-lg mb-4">Navigation</h4>
          <ul className="space-y-3">
            <li><button onClick={() => onNavigate('home')} className="text-gray-400 hover:text-white transition-colors">Accueil</button></li>
            <li><button onClick={() => onNavigate('shop')} className="text-gray-400 hover:text-white transition-colors">Boutique</button></li>
            <li><button onClick={() => onNavigate('promotions')} className="text-gray-400 hover:text-white transition-colors">Promotions</button></li>
            <li><button onClick={() => onNavigate('contact')} className="text-gray-400 hover:text-white transition-colors">Contact</button></li>
          </ul>
        </div>
        
        <div>
          <h4 className="font-bold text-lg mb-4">Contact</h4>
          <ul className="space-y-3 text-gray-400">
            <li className="flex items-start gap-3">
              <Mail className="h-5 w-5 mt-0.5 flex-shrink-0" />
              <span>contact@vivias-shop.com</span>
            </li>
            <li className="flex items-start gap-3">
              <Phone className="h-5 w-5 mt-0.5 flex-shrink-0" />
              <span>+221 77 123 45 67</span>
            </li>
            <li className="flex items-start gap-3">
              <MapPin className="h-5 w-5 mt-0.5 flex-shrink-0" />
              <span>Dakar, Sénégal</span>
            </li>
          </ul>
        </div>
      </div>
    </div>
    
    <div className="border-t border-gray-800 py-6">
      <div className="max-w-7xl mx-auto px-4 text-center text-gray-400">
        <p>&copy; 2024 VIVIAS SHOP. Tous droits réservés.</p>
      </div>
    </div>
  </footer>
);

export default HomePage;