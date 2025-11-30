import React, { useState, useEffect } from 'react';
import Navbar from '../components/Navbar';
import { Loader2, ChevronRight, Instagram, Facebook, Mail, Phone, MapPin, Code, Heart } from 'lucide-react';
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

  const handleNavigation = (type, slug = null) => {
    const routes = { 
      home: '/', 
      shop: '/shop', 
      cart: '/cart', 
      wishlist: '/wishlist',
      category: `/categories/${slug}`
    };
    if (routes[type]) window.location.href = routes[type];
  };

  if (loading) {
    return (
      <div className="fixed inset-0 bg-[#FDFBF7] z-50 flex items-center justify-center">
        <Loader2 className="w-10 h-10 animate-spin text-neutral-300" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#FDFBF7] font-sans text-[#1A1A1A] selection:bg-black selection:text-white flex flex-col">
      <Navbar 
        cartCount={cartCount} 
        wishlistCount={wishlistCount}
        categories={categories}
        onNavigate={handleNavigation}
      />

      {/* HEADER PAGE (Style Hero comme HomePage) */}
      <section className="relative h-[40vh] md:h-[50vh] bg-black overflow-hidden">
        <div className="absolute inset-0 bg-black/50 z-10"></div>
        <div className="absolute inset-0">
          <img 
            src="/assets/images/vivia10.jpg" 
            alt="Collections VIVIAS"
            className="w-full h-full object-cover opacity-90 scale-105 animate-slow-zoom"
            onError={(e) => {
              e.target.style.display = 'none';
              e.target.parentElement.style.background = '#1a1a1a';
            }}
          />
        </div>
        <div className="relative z-20 h-full flex flex-col items-center justify-center text-center px-4 animate-fade-in-up">
          <span className="inline-block py-1 px-3 border border-white/30 text-white/80 text-[10px] md:text-xs uppercase tracking-[0.3em] mb-6 backdrop-blur-sm">
            Catalogue Officiel
          </span>
          <h1 className="text-4xl md:text-7xl font-thin text-white mb-6 uppercase tracking-tight leading-none">
            NOS COLLECTIONS
          </h1>
        </div>
      </section>

      {/* BREADCRUMB */}
      <div className="border-b border-neutral-100 bg-white">
        <div className="max-w-7xl mx-auto px-4 md:px-8 py-4">
          <div className="flex items-center gap-2 text-[10px] uppercase tracking-widest text-neutral-400">
            <button onClick={() => handleNavigation('home')} className="hover:text-black transition-colors">
              Accueil
            </button>
            <ChevronRight className="w-3 h-3" />
            <span className="text-black font-bold">Boutique</span>
          </div>
        </div>
      </div>

      {/* CONTENU PRINCIPAL */}
      <main className="flex-grow py-16 md:py-24 px-4 max-w-7xl mx-auto w-full">
        
        <div className="text-center mb-16 max-w-3xl mx-auto">
          <h2 className="text-2xl md:text-3xl font-light uppercase tracking-widest mb-4 text-black">Explorez nos univers</h2>
          <div className="w-12 h-[1px] bg-neutral-300 mx-auto mb-6"></div>
          <p className="text-neutral-500 text-sm font-light leading-relaxed italic">
            Chaque collection est une invitation au voyage, alliant tradition et modernité pour sublimer votre style.
          </p>
        </div>

        {/* --- NOUVELLE GRILLE DE CATÉGORIES RONDES --- */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-x-8 gap-y-16 justify-items-center">
          {categories.map((category) => (
            <div 
              key={category.id}
              onClick={() => handleNavigate(category.slug)}
              className="group cursor-pointer flex flex-col items-center w-full max-w-[240px]"
            >
              {/* Container Cercle Image */}
              <div className="relative w-36 h-36 sm:w-44 sm:h-44 md:w-52 md:h-52 rounded-full overflow-hidden bg-neutral-100 mb-6 border-2 border-transparent group-hover:border-black transition-all duration-500 shadow-sm group-hover:shadow-md">
                <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-all duration-500 z-10"></div>
                
                <img 
                  src={category.image || '/assets/images/placeholder.jpg'}
                  alt={category.nom}
                  className="w-full h-full object-cover transform group-hover:scale-110 transition-transform duration-[1.5s] ease-out"
                  onError={(e) => e.target.src = '/assets/images/placeholder.jpg'}
                />
              </div>

              {/* Info Text Centré */}
              <div className="text-center px-2">
                <h3 className="text-base md:text-lg font-bold uppercase tracking-widest text-black mb-2 group-hover:text-neutral-700 transition-colors">
                  {category.nom}
                </h3>
                <p className="text-[10px] md:text-xs text-neutral-400 uppercase tracking-[0.2em]">
                  {category.produits_count || 0} Modèles
                </p>
              </div>
            </div>
          ))}
        </div>

        {categories.length === 0 && (
          <div className="text-center py-20 text-neutral-400 uppercase tracking-widest text-xs">
            Aucune collection disponible pour le moment.
          </div>
        )}
      </main>

      {/* FOOTER PREMIUM (Identique à HomePage) */}
      <footer className="bg-[#F5F5F5] pt-20 pb-8 text-neutral-600 border-t border-neutral-200">
        <div className="max-w-7xl mx-auto px-4 grid grid-cols-1 md:grid-cols-4 gap-12 mb-16">
          
          {/* Brand */}
          <div className="space-y-6">
            <h3 className="text-black font-bold text-xl tracking-widest">VIVIAS</h3>
            <p className="text-[10px] leading-relaxed max-w-xs">
              L'excellence de la mode africaine. Des pièces uniques conçues pour sublimer votre élégance au quotidien.
            </p>
            <div className="flex gap-4 pt-2">
              <a href="#" className="w-8 h-8 flex items-center justify-center rounded-full bg-white hover:bg-black hover:text-white transition-all shadow-sm">
                <Instagram className="w-4 h-4" />
              </a>
              <a href="#" className="w-8 h-8 flex items-center justify-center rounded-full bg-white hover:bg-black hover:text-white transition-all shadow-sm">
                <Facebook className="w-4 h-4" />
              </a>
            </div>
          </div>

          {/* Navigation */}
          <div>
            <h4 className="text-black text-xs font-bold uppercase tracking-widest mb-6">Boutique</h4>
            <ul className="space-y-3 text-xs">
              <li><button onClick={() => handleNavigation('home')} className="hover:text-black transition-colors">Accueil</button></li>
              <li><button onClick={() => handleNavigation('shop')} className="hover:text-black transition-colors">Collections</button></li>
              <li><button onClick={() => handleNavigation('cart')} className="hover:text-black transition-colors">Panier</button></li>
              <li><button onClick={() => handleNavigation('wishlist')} className="hover:text-black transition-colors">Favoris</button></li>
            </ul>
          </div>

          {/* Service Client */}
          <div>
            <h4 className="text-black text-xs font-bold uppercase tracking-widest mb-6">Aide</h4>
            <ul className="space-y-3 text-xs">
              <li><a href="#" className="hover:text-black transition-colors">Livraisons</a></li>
              <li><a href="#" className="hover:text-black transition-colors">Retours & Échanges</a></li>
              <li><a href="#" className="hover:text-black transition-colors">Guide des tailles</a></li>
              <li><a href="#" className="hover:text-black transition-colors">FAQ</a></li>
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h4 className="text-black text-xs font-bold uppercase tracking-widest mb-6">Contact</h4>
            <ul className="space-y-4 text-xs">
              <li className="flex items-start gap-3">
                <MapPin className="w-4 h-4 mt-0.5" />
                <span>Dakar, Sénégal</span>
              </li>
              <li className="flex items-center gap-3">
                <Phone className="w-4 h-4" />
                <a href="tel:+221771397393" className="hover:text-black transition-colors">+221 77 139 73 93</a>
              </li>
              <li className="flex items-center gap-3">
                <Mail className="w-4 h-4" />
                <a href="mailto:contact@vivias.com" className="hover:text-black transition-colors">contact@vivias.com</a>
              </li>
            </ul>
          </div>
        </div>

        {/* Copyright & Signature Développeur */}
        <div className="border-t border-neutral-200 pt-8 mt-8">
          <div className="max-w-7xl mx-auto px-4 flex flex-col md:flex-row justify-between items-center gap-4 text-[10px] uppercase tracking-widest text-neutral-500">
            <p>&copy; {new Date().getFullYear()} VIVIAS SHOP. Tous droits réservés.</p>
            
            <div className="flex items-center gap-2 group">
              <Code className="w-3 h-3 text-neutral-400 group-hover:text-black transition-colors" />
              <span>Développé avec</span>
              <Heart className="w-3 h-3 text-neutral-400 group-hover:text-red-600 transition-colors" fill="currentColor" />
              <span>par</span>
              <a 
                href="mailto:birameowens29@gmail.com"
                className="text-neutral-600 hover:text-black transition-colors font-bold underline decoration-neutral-300 underline-offset-4"
                title="Développeur Full Stack"
              >
                Birame Owens Diop
              </a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default ShopPage;