import React, { useState, useEffect } from 'react';
import Navbar from '../components/Navbar';
import { Loader2, ChevronRight, Heart, Instagram, Facebook, Mail, Phone, MapPin, Code } from 'lucide-react';
import api from '../utils/api';

const ShopPage = () => {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [cartCount, setCartCount] = useState(0);
  const [wishlistCount, setWishlistCount] = useState(0);

  useEffect(() => {
    const initData = async () => {
      try {
        const [categoriesRes, cartRes, wishlistRes] = await Promise.all([
          api.getCategories(),
          api.getCartCount(),
          api.getWishlistCount()
        ]);

        console.log('📦 ShopPage - Réponse catégories:', categoriesRes);
        if (categoriesRes.success) setCategories(categoriesRes.data || []);
        if (cartRes.success) setCartCount(cartRes.data.count || 0);
        if (wishlistRes.success) setWishlistCount(wishlistRes.data.count || 0);
      } catch (err) {
        console.error("❌ Erreur API:", err);
      } finally {
        setLoading(false);
      }
    };

    initData();
  }, []);

  const handleNavigate = (slug) => {
    window.location.href = `/categories/${slug}`;
  };

  const handleNavigation = (type) => {
    const routes = { home: '/', shop: '/shop', cart: '/cart', wishlist: '/wishlist', contact: '/contact' };
    if (routes[type]) window.location.href = routes[type];
  };

  if (loading) {
    return (
      <div className="fixed inset-0 bg-white z-50 flex items-center justify-center">
        <Loader2 className="w-10 h-10 animate-spin text-neutral-300" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#FDFBF7] font-sans selection:bg-black selection:text-white">
      <Navbar 
        cartCount={cartCount} 
        wishlistCount={wishlistCount}
        categories={categories}
        onNavigate={handleNavigation}
      />

      {/* Hero Section - Style Editorial Minimaliste */}
      <section className="relative h-[50vh] md:h-[60vh] bg-black overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-black/40 via-black/20 to-black/60 z-10"></div>
        <div className="absolute inset-0">
          <img 
            src="/assets/images/vivia10.jpg" 
            alt="Collections VIVIAS"
            className="w-full h-full object-cover opacity-70"
            onError={(e) => {
              e.target.style.display = 'none';
              e.target.parentElement.style.background = 'linear-gradient(135deg, #1a1a1a 0%, #2d2d2d 100%)';
            }}
          />
        </div>
        <div className="relative z-20 h-full flex items-center justify-center text-center px-4">
          <div className="max-w-4xl">
            <p className="text-white/60 text-xs md:text-sm uppercase tracking-[0.3em] mb-4 font-light">
              VIVIAS SHOP
            </p>
            <h1 className="text-4xl sm:text-5xl md:text-7xl lg:text-8xl font-thin text-white mb-6 tracking-tight uppercase leading-none">
              Collections
            </h1>
            <p className="text-white/80 text-sm md:text-base max-w-2xl mx-auto font-light leading-relaxed">
              Découvrez l'élégance africaine authentique à travers nos collections exclusives
            </p>
            <div className="mt-8 flex justify-center">
              <div className="w-12 h-[1px] bg-white/40"></div>
            </div>
          </div>
        </div>
      </section>

      {/* Breadcrumb */}
      <div className="bg-white border-b border-neutral-100">
        <div className="max-w-7xl mx-auto px-4 md:px-8 py-3">
          <div className="flex items-center gap-2 text-xs uppercase tracking-widest text-neutral-500">
            <button onClick={() => handleNavigation('home')} className="hover:text-black transition-colors">
              Accueil
            </button>
            <ChevronRight className="w-3 h-3" />
            <span className="text-black font-medium">Collections</span>
          </div>
        </div>
      </div>

      {/* Collections Grid - Design Premium */}
      <section className="py-16 md:py-24 bg-white">
        <div className="max-w-7xl mx-auto px-4 md:px-8">
          
          {/* Header Section */}
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-5xl font-thin uppercase tracking-tight text-black mb-4">
              Explorez Nos Collections
            </h2>
            <p className="text-neutral-500 text-sm md:text-base max-w-2xl mx-auto">
              Chaque collection raconte une histoire unique d'élégance et d'authenticité
            </p>
          </div>

          {/* Categories Grid - Responsive */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 md:gap-8">
            {categories.map((category) => (
              <div 
                key={category.id}
                onClick={() => handleNavigate(category.slug)}
                className="group cursor-pointer"
              >
                {/* Image Container */}
                <div className="relative aspect-[3/4] overflow-hidden bg-neutral-50 mb-4 rounded-sm">
                  <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-all duration-500 z-10"></div>
                  <img 
                    src={category.image || '/assets/images/placeholder.jpg'}
                    alt={category.nom}
                    className="w-full h-full object-cover transform group-hover:scale-105 transition-transform duration-700"
                    onError={(e) => e.target.src = '/assets/images/placeholder.jpg'}
                  />
                  
                  {/* Overlay Info */}
                  <div className="absolute bottom-0 left-0 right-0 p-4 bg-gradient-to-t from-black/80 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 z-20">
                    <p className="text-white text-xs font-light">
                      {category.produits_count || 0} produit{category.produits_count > 1 ? 's' : ''}
                    </p>
                  </div>
                </div>

                {/* Category Info */}
                <div className="space-y-2">
                  <h3 className="text-base md:text-lg font-semibold uppercase tracking-wide text-black group-hover:underline underline-offset-4 decoration-1 transition-all">
                    {category.nom}
                  </h3>
                  {category.description && (
                    <p className="text-xs md:text-sm text-neutral-500 line-clamp-2 leading-relaxed">
                      {category.description}
                    </p>
                  )}
                  <button className="inline-flex items-center gap-2 text-xs uppercase tracking-widest text-black font-medium opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                    Découvrir
                    <ChevronRight className="w-3 h-3" />
                  </button>
                </div>
              </div>
            ))}
          </div>

          {/* Empty State */}
          {categories.length === 0 && (
            <div className="text-center py-20">
              <div className="max-w-md mx-auto">
                <div className="w-16 h-16 mx-auto mb-6 rounded-full bg-neutral-100 flex items-center justify-center">
                  <Heart className="w-8 h-8 text-neutral-300" />
                </div>
                <h3 className="text-xl font-semibold text-black mb-2">Aucune collection disponible</h3>
                <p className="text-neutral-500 text-sm">
                  Nos nouvelles collections arrivent bientôt. Restez connectés !
                </p>
              </div>
            </div>
          )}
        </div>
      </section>

      {/* Footer Premium - Comme HomePage */}
      <footer className="bg-gradient-to-b from-neutral-900 to-black text-neutral-200">
        {/* Section principale */}
        <div className="max-w-7xl mx-auto px-4 py-16">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12">
            
            {/* À propos */}
            <div>
              <h3 className="text-white font-bold text-xl mb-4 tracking-wide">VIVIAS SHOP</h3>
              <p className="text-neutral-400 text-sm leading-relaxed mb-4">
                Votre destination pour la mode africaine authentique et élégante au Sénégal. 
                Des créations uniques alliant tradition et modernité.
              </p>
              <div className="flex gap-4 mt-6">
                <a 
                  href="https://instagram.com/viviasshop" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="w-10 h-10 bg-neutral-800 hover:bg-gradient-to-r hover:from-purple-600 hover:to-pink-600 rounded-full flex items-center justify-center transition-all duration-300 hover:scale-110"
                  aria-label="Instagram"
                >
                  <Instagram className="w-5 h-5" />
                </a>
                <a 
                  href="https://facebook.com/viviasshop" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="w-10 h-10 bg-neutral-800 hover:bg-blue-600 rounded-full flex items-center justify-center transition-all duration-300 hover:scale-110"
                  aria-label="Facebook"
                >
                  <Facebook className="w-5 h-5" />
                </a>
              </div>
            </div>

            {/* Navigation rapide */}
            <div>
              <h3 className="text-white font-semibold text-lg mb-4">Navigation</h3>
              <ul className="space-y-3">
                <li>
                  <button 
                    onClick={() => handleNavigation('home')}
                    className="text-neutral-400 hover:text-white transition-colors duration-200 text-sm hover:translate-x-1 transition-transform inline-block"
                  >
                    Accueil
                  </button>
                </li>
                <li>
                  <button 
                    onClick={() => handleNavigation('shop')}
                    className="text-neutral-400 hover:text-white transition-colors duration-200 text-sm hover:translate-x-1 transition-transform inline-block"
                  >
                    Collections
                  </button>
                </li>
                <li>
                  <button 
                    onClick={() => handleNavigation('cart')}
                    className="text-neutral-400 hover:text-white transition-colors duration-200 text-sm hover:translate-x-1 transition-transform inline-block"
                  >
                    Panier
                  </button>
                </li>
                <li>
                  <button 
                    onClick={() => handleNavigation('wishlist')}
                    className="text-neutral-400 hover:text-white transition-colors duration-200 text-sm hover:translate-x-1 transition-transform inline-block"
                  >
                    Favoris
                  </button>
                </li>
              </ul>
            </div>

            {/* Informations */}
            <div>
              <h3 className="text-white font-semibold text-lg mb-4">Informations</h3>
              <ul className="space-y-3 text-sm text-neutral-400">
                <li>Paiement sécurisé</li>
                <li>Livraison à Dakar</li>
                <li>Retours sous 7 jours</li>
                <li>Support client 24/7</li>
              </ul>
            </div>

            {/* Contact */}
            <div>
              <h3 className="text-white font-semibold text-lg mb-4">Contact</h3>
              <ul className="space-y-3">
                <li className="flex items-start gap-3 text-neutral-400 text-sm">
                  <Phone className="w-4 h-4 mt-0.5 flex-shrink-0" />
                  <div>
                    <a href="tel:+221784661412" className="hover:text-white transition-colors">
                      +221 78 466 14 12
                    </a>
                    <p className="text-xs text-neutral-500 mt-1">Lun - Sam : 9h - 18h</p>
                  </div>
                </li>
                <li className="flex items-start gap-3 text-neutral-400 text-sm">
                  <Mail className="w-4 h-4 mt-0.5 flex-shrink-0" />
                  <div>
                    <a href="mailto:contact@viviasshop.sn" className="hover:text-white transition-colors">
                      contact@viviasshop.sn
                    </a>
                    <p className="text-xs text-neutral-500 mt-1">Réponse sous 24h</p>
                  </div>
                </li>
                <li className="flex items-start gap-3 text-neutral-400 text-sm">
                  <MapPin className="w-4 h-4 mt-0.5 flex-shrink-0" />
                  <span>Dakar, Sénégal</span>
                </li>
              </ul>
            </div>
          </div>
        </div>

        {/* Barre de copyright */}
        <div className="border-t border-neutral-800">
          <div className="max-w-7xl mx-auto px-4 py-6">
            <div className="flex flex-col md:flex-row justify-between items-center gap-4 text-sm">
              <p className="text-neutral-500 text-center md:text-left">
                © {new Date().getFullYear()} VIVIAS SHOP. Tous droits réservés.
              </p>
              
              {/* Signature du développeur */}
              <div className="flex items-center gap-2 text-neutral-500 group">
                <Code className="w-3 h-3 text-neutral-400 group-hover:text-blue-400 transition-colors" />
                <span className="text-xs">Développé avec</span>
                <Heart className="w-3 h-3 text-red-500 group-hover:scale-110 transition-transform" fill="currentColor" />
                <span className="text-xs">par</span>
                <a 
                  href="mailto:birameowens29@gmail.com"
                  className="text-neutral-400 hover:text-white transition-colors font-medium underline decoration-dotted underline-offset-2"
                  title="Birame Owens Diop - Développeur Full Stack"
                >
                  Birame Owens Diop
                </a>
              </div>
            </div>
          </div>
        </div>

        {/* Méthodes de paiement */}
        <div className="border-t border-neutral-800 bg-black">
          <div className="max-w-7xl mx-auto px-4 py-4">
            <div className="flex flex-wrap justify-center items-center gap-6 text-xs text-neutral-600">
              <span>Paiements sécurisés</span>
              <div className="flex gap-4">
                <span className="px-3 py-1 bg-neutral-900 rounded">WAVE</span>
                <span className="px-3 py-1 bg-neutral-900 rounded">ORANGE MONEY</span>
                <span className="px-3 py-1 bg-neutral-900 rounded">STRIPE</span>
                <span className="px-3 py-1 bg-neutral-900 rounded">ESPÈCES</span>
              </div>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default ShopPage;
