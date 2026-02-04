import React, { useState, useEffect } from 'react';
import Navbar from '../components/Navbar';
import { 
  ShoppingBag, Heart, Phone, ArrowRight, 
  Check, Loader2, MessageCircle, ChevronRight,
  Mail, MapPin
} from 'lucide-react';
import api from '../utils/api';

const HomePage = () => {
  console.log("🏠 HomePage chargée");
  const [homeData, setHomeData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [cartCount, setCartCount] = useState(0);
  const [wishlistCount, setWishlistCount] = useState(0);
  const [showPreloader, setShowPreloader] = useState(true);

  useEffect(() => {
    const initData = async () => {
      try {
        setLoading(true);
        const [homeRes, cartRes, wishlistRes] = await Promise.all([
          api.getHomeData(),
          api.getCartCount(),
          api.getWishlistCount()
        ]);

        if (homeRes.success) {
          setHomeData(homeRes.data);
        } else {
          // Données par défaut si l'API échoue
          setHomeData({
            categories_preview: [],
            new_arrivals: [],
            featured_products: [],
            active_promotions: [],
            testimonials: [],
            hero_banner: {
              has_promotion: false,
              default_message: {
                titre: "L'ÉLÉGANCE VIVIAS",
                sous_titre: "Mode Africaine Authentique",
                cta: "DÉCOUVRIR LA COLLECTION"
              }
            }
          });
        }
        if (cartRes.success) setCartCount(cartRes.data.count || 0);
        if (wishlistRes.success) setWishlistCount(wishlistRes.data.count || 0);
      } catch (err) {
        // En cas d'erreur, afficher des données par défaut
        setHomeData({
          categories_preview: [],
          new_arrivals: [],
          featured_products: [],
          active_promotions: [],
          testimonials: [],
          hero_banner: {
            has_promotion: false,
            default_message: {
              titre: "L'ÉLÉGANCE VIVIAS",
              sous_titre: "Mode Africaine Authentique",
              cta: "DÉCOUVRIR LA COLLECTION"
            }
          }
        });
      } finally {
        setLoading(false);
        setTimeout(() => setShowPreloader(false), 1500);
      }
    };
    
    const preloaderTimer = setTimeout(() => setShowPreloader(false), 2000);
    initData();
    return () => clearTimeout(preloaderTimer);
  }, []);

  const handleNavigation = (type, slug = null) => {
    const routes = {
      category: `/categories/${slug}`,
      product: `/products/${slug}`,
      shop: '/shop',
      promotions: '/promotions'
    };
    if (routes[type]) window.location.href = routes[type];
  };

  const handleAddToCart = async (productId) => {
    try {
      const res = await api.addToCart(productId, 1);
      if (res.success) {
        setCartCount(prev => prev + 1);
        alert("Produit ajouté au panier"); 
      }
    } catch (e) { console.error(e); }
  };

  const handleWhatsAppOrder = (product) => {
    const phone = "221784661412"; 
    const message = `Bonjour VIVIAS, je souhaite commander ce produit : ${product.nom} (Prix: ${product.prix_affiche} FCFA). Est-il disponible ?`;
    const url = `https://wa.me/${phone}?text=${encodeURIComponent(message)}`;
    window.open(url, '_blank');
  };

  if (showPreloader && loading) return <Preloader />;

  return (
    <div className="min-h-screen bg-[#FDFBF7] font-sans text-[#1A1A1A] selection:bg-black selection:text-white">
      
      <Navbar 
        cartCount={cartCount} 
        wishlistCount={wishlistCount}
        categories={homeData?.categories_preview || []}
        onNavigate={handleNavigation}
      />

      {/* 1. HERO SECTION */}
      <HeroSection 
        data={homeData?.hero_banner} 
        onNavigate={handleNavigation} 
      />

      {/* 2. NOS COLLECTIONS (Style Cercles uniquement) */}
      {homeData?.categories_preview?.length > 0 ? (
        <section className="py-8 bg-white border-b border-neutral-100">
          <div className="max-w-7xl mx-auto px-4 mb-6 text-center md:text-left">
             <h2 className="text-xl md:text-2xl font-light text-black uppercase tracking-tight">
               Nos Collections
             </h2>
          </div>
          <CategoryCircleRow categories={homeData.categories_preview} onNavigate={handleNavigation} />
        </section>
      ) : (
        <section className="py-16 bg-white border-b border-neutral-100">
          <div className="max-w-7xl mx-auto px-4 text-center">
            <div className="text-neutral-400 space-y-4">
              <h2 className="text-xl md:text-2xl font-light text-neutral-600 uppercase tracking-tight">
                Nos Collections
              </h2>
              <p className="text-sm">Découvrez bientôt nos collections exclusives</p>
            </div>
          </div>
        </section>
      )}

      {/* Bandeau Services */}
      <ServiceStrip />

      {/* 3. NOUVEAUTÉS */}
      {homeData?.new_arrivals?.length > 0 ? (
        <ProductShowcase 
          title="Nouveautés" 
          subtitle="Les dernières créations de l'atelier"
          products={homeData.new_arrivals}
          onAddToCart={handleAddToCart}
          onWhatsApp={handleWhatsAppOrder}
          onNavigate={handleNavigation}
        />
      ) : (
        <section className="py-20">
          <div className="max-w-7xl mx-auto px-4 text-center">
            <h2 className="text-3xl font-light uppercase tracking-widest text-neutral-600 mb-4">Nouveautés</h2>
            <p className="text-neutral-500 text-sm">De nouvelles créations arrivent bientôt</p>
          </div>
        </section>
      )}

      {/* PROMO BANNER */}
      {homeData?.active_promotions?.length > 0 && (
        <PromoBanner promo={homeData.active_promotions[0]} onNavigate={handleNavigation} />
      )}

      {/* 4. BEST SELLERS */}
      {homeData?.featured_products?.length > 0 ? (
        <ProductShowcase 
          title="Sélection VIVIAS" 
          subtitle="Vos pièces favorites"
          products={homeData.featured_products}
          onAddToCart={handleAddToCart}
          onWhatsApp={handleWhatsAppOrder}
          onNavigate={handleNavigation}
          bgClass="bg-white"
        />
      ) : (
        <section className="py-20 bg-white">
          <div className="max-w-7xl mx-auto px-4 text-center">
            <h2 className="text-3xl font-light uppercase tracking-widest text-neutral-600 mb-4">Sélection VIVIAS</h2>
            <p className="text-neutral-500 text-sm">Nos coups de cœur arrivent bientôt</p>
          </div>
        </section>
      )}

      {/* 5. TÉMOIGNAGES CLIENTS */}
      {homeData?.testimonials?.length > 0 && (
        <TestimonialsSection testimonials={homeData.testimonials} />
      )}

      <Newsletter />
      <Footer onNavigate={handleNavigation} />

      {/* Bouton WhatsApp Flottant */}
      <a
        href="https://wa.me/221784661412"
        target="_blank"
        rel="noopener noreferrer"
        className="fixed bottom-6 right-6 z-40 bg-[#25D366] text-white p-4 rounded-full shadow-2xl hover:scale-110 transition-transform duration-300 flex items-center justify-center"
        style={{ width: '56px', height: '56px' }}
      >
        <Phone className="w-6 h-6 fill-current" />
      </a>
    </div>
  );
};

/* --- SOUS-COMPOSANTS --- */

const Preloader = () => (
  <div className="fixed inset-0 bg-white z-[9999] flex flex-col items-center justify-center">
    <Loader2 className="w-10 h-10 animate-spin text-neutral-300" />
  </div>
);

// --- CERCLES DE CATÉGORIES (Style Image 2) ---
const CategoryCircleRow = ({ categories, onNavigate }) => {
  return (
    <div className="max-w-7xl mx-auto px-4 overflow-x-auto scrollbar-hide">
      <div className="flex gap-8 md:gap-12 min-w-max justify-start md:justify-center px-2 pb-4">
        {categories.map((cat) => (
          <div 
            key={cat.id} 
            onClick={() => onNavigate('category', cat.slug)}
            className="group flex flex-col items-center cursor-pointer min-w-[80px]"
          >
            <div className="w-20 h-20 md:w-24 md:h-24 rounded-full overflow-hidden border-2 border-transparent group-hover:border-black transition-all duration-300 mb-3 shadow-sm bg-neutral-100">
              <img 
                src={cat.image || '/assets/images/placeholder.jpg'} 
                alt={cat.nom} 
                className="w-full h-full object-cover transform group-hover:scale-110 transition-transform duration-500"
                onError={(e) => e.target.src = '/assets/images/placeholder.jpg'}
              />
            </div>
            <span className="text-xs font-bold uppercase tracking-widest text-center group-hover:text-black text-neutral-600 transition-colors truncate w-full">
              {cat.nom}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
};

// LE COMPOSANT CollectionsGrid A ÉTÉ SUPPRIMÉ ICI COMME DEMANDÉ

const HeroSection = ({ data, onNavigate }) => {
  const hasPromotion = data?.has_promotion;
  const promotion = data?.promotion;
  const defaultMessage = data?.default_message;
  
  const title = hasPromotion ? promotion?.nom : defaultMessage?.titre;
  const subtitle = hasPromotion ? promotion?.description : defaultMessage?.sous_titre;
  const ctaText = hasPromotion ? `PROFITER DE -${promotion?.valeur}${promotion?.type === 'pourcentage' ? '%' : ' FCFA'}` : defaultMessage?.cta;
  const heroImage = promotion?.image || "/assets/images/vivia10.jpg";

  return (
    <section className="relative h-[75vh] w-full overflow-hidden bg-gray-900">
      <div className="absolute inset-0">
         <img 
           src={heroImage} 
           alt={title} 
           className="w-full h-full object-cover opacity-90 transition-transform duration-[20s] ease-out scale-100 hover:scale-105"
           onError={(e) => { e.target.src = "/assets/images/vivia10.jpg"; }}
         />
         <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent" />
      </div>

      <div className="absolute inset-0 flex items-center justify-center text-center px-4">
        <div className="max-w-4xl animate-fade-in-up pt-16">
          <span className="inline-block py-1 px-3 border border-white/40 text-white text-[10px] md:text-xs uppercase tracking-[0.3em] mb-6 backdrop-blur-sm">
            {hasPromotion ? `CODE: ${promotion.code}` : "Nouvelle Collection"}
          </span>
          <h1 className="text-4xl md:text-7xl font-thin text-white mb-6 leading-none tracking-tight">
            {title || "L'ÉLÉGANCE VIVIAS"}
          </h1>
        </div>
      </div>
    </section>
  );
};

const ServiceStrip = () => (
  <div className="border-t border-b border-neutral-100 bg-white py-4">
    <div className="max-w-7xl mx-auto px-4 flex flex-wrap justify-center md:justify-between gap-6 text-[10px] font-bold uppercase tracking-widest text-neutral-400">
      <div className="flex items-center gap-2"><Check className="w-3 h-3 text-black" /> Qualité Premium</div>
      <div className="flex items-center gap-2"><Check className="w-3 h-3 text-black" /> Livraison Rapide</div>
      <div className="flex items-center gap-2"><Check className="w-3 h-3 text-black" /> Paiement Sécurisé</div>
    </div>
  </div>
);

const ProductShowcase = ({ title, subtitle, products, onAddToCart, onWhatsApp, onNavigate, bgClass = "" }) => (
  <section className={`py-20 ${bgClass}`}>
    <div className="max-w-7xl mx-auto px-4">
      <div className="text-center mb-12">
        <h2 className="text-3xl font-light uppercase tracking-widest text-[#1A1A1A] mb-2">{title}</h2>
        <p className="text-neutral-500 text-xs italic">{subtitle}</p>
      </div>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-x-4 gap-y-10 md:gap-x-8">
        {products.map((product) => (
          <ProductCard key={product.id} product={product} onAddToCart={onAddToCart} onWhatsApp={onWhatsApp} onNavigate={onNavigate} />
        ))}
      </div>
    </div>
  </section>
);

const ProductCard = ({ product, onAddToCart, onWhatsApp, onNavigate }) => {
  return (
    <div className="group cursor-pointer flex flex-col h-full" onClick={() => onNavigate('product', product.slug)}>
      <div className="relative aspect-[3/4] overflow-hidden bg-neutral-100 mb-4">
        <img 
          src={product.image} alt={product.nom} 
          className="w-full h-full object-cover transition-transform duration-700 ease-in-out group-hover:scale-105"
          onError={(e) => { e.target.src = '/assets/images/placeholder.jpg'; }}
        />
        <div className="absolute top-2 left-2 flex flex-col gap-1 z-10">
          {product.en_promo && <span className="bg-red-600 text-white text-[9px] font-bold px-2 py-1 uppercase tracking-wider">- Promo -</span>}
          {product.est_nouveaute && <span className="bg-white text-black text-[9px] font-bold px-2 py-1 uppercase tracking-wider shadow-sm">New</span>}
        </div>
        
        {/* 📌 BADGE STOCK - Seuil d'alerte */}
        {product.stock_quantite !== undefined && product.stock_quantite > 0 && product.stock_quantite <= 5 && (
          <div className="absolute top-2 right-2 bg-orange-500 text-white text-[9px] font-bold px-2 py-1 uppercase tracking-wider z-10">
            Plus que {product.stock_quantite}
          </div>
        )}
        
        {/* 🚫 BADGE RUPTURE DE STOCK */}
        {product.stock_quantite === 0 && (
          <div className="absolute inset-0 bg-black/60 flex items-center justify-center z-20">
            <span className="bg-red-600 text-white text-xs font-bold px-4 py-2 uppercase tracking-wider">Rupture de stock</span>
          </div>
        )}
        <div className="absolute bottom-0 left-0 right-0 flex flex-col translate-y-full group-hover:translate-y-0 transition-transform duration-300 z-20">
            <button 
              onClick={(e) => { e.stopPropagation(); if (product.stock_quantite > 0) onAddToCart(product.id); }} 
              disabled={product.stock_quantite === 0}
              className={`py-3 text-[10px] font-bold uppercase tracking-widest transition-colors border-t border-gray-100 flex items-center justify-center gap-2 ${
                product.stock_quantite === 0 
                  ? 'bg-gray-300 text-gray-500 cursor-not-allowed' 
                  : 'bg-white text-black hover:bg-black hover:text-white'
              }`}
            >
              <ShoppingBag className="w-3 h-3" /> {product.stock_quantite === 0 ? 'Indisponible' : 'Ajouter'}
            </button>
            <button onClick={(e) => { e.stopPropagation(); onWhatsApp(product); }} className="bg-[#25D366] text-white py-3 text-[10px] font-bold uppercase tracking-widest hover:bg-[#128C7E] transition-colors flex items-center justify-center gap-2">
              <MessageCircle className="w-3 h-3" /> WhatsApp
            </button>
        </div>
      </div>
      <div className="text-center mt-auto">
        <h3 className="text-xs font-bold text-[#1A1A1A] line-clamp-1 group-hover:underline underline-offset-4 decoration-neutral-300 uppercase tracking-wide">{product.nom}</h3>
        <div className="flex justify-center items-center gap-2 mt-1 text-xs">
          {product.en_promo ? (
            <>
              <span className="font-bold text-red-600">{product.prix_affiche?.toLocaleString()} FCFA</span>
              <span className="text-neutral-400 line-through">{product.prix?.toLocaleString()}</span>
            </>
          ) : (
            <span className="font-bold text-black">{product.prix_affiche?.toLocaleString()} FCFA</span>
          )}
        </div>
      </div>
    </div>
  );
};

const PromoBanner = ({ promo, onNavigate }) => {
  if (!promo) return null;
  return (
    <section className="relative py-20 bg-[#1A1A1A] text-white overflow-hidden text-center">
      <div className="relative z-10 max-w-4xl mx-auto px-4">
        <span className="inline-block border border-white/20 px-4 py-1 mb-6 text-[10px] uppercase tracking-[0.3em] text-neutral-300">Offre Limitée</span>
        <h2 className="text-5xl md:text-7xl font-thin mb-4 tracking-tighter">{promo.valeur ? `-${promo.valeur}%` : "VENTE PRIVÉE"}</h2>
        <p className="text-sm font-light text-neutral-400 mb-8 max-w-lg mx-auto">{promo.description}</p>
        <button onClick={() => onNavigate('promotions')} className="bg-white text-black px-10 py-3 text-xs font-bold uppercase tracking-widest hover:scale-105 transition-transform duration-300">En Profiter</button>
      </div>
    </section>
  );
};

const Newsletter = () => (
  <section className="py-20 bg-white border-t border-stone-100">
    <div className="max-w-md mx-auto px-4 text-center">
      <h2 className="text-xl font-light mb-3 uppercase tracking-wide">La Newsletter</h2>
      <p className="text-neutral-500 text-[10px] mb-6">Inscrivez-vous pour recevoir les nouveautés.</p>
      <form className="flex flex-col gap-3">
        <input type="email" placeholder="VOTRE EMAIL" className="w-full bg-transparent border-b border-neutral-300 py-2 text-center text-sm focus:border-black focus:outline-none placeholder-neutral-400 uppercase tracking-wide" />
        <button type="button" className="bg-black text-white py-3 text-xs font-bold uppercase tracking-widest hover:bg-neutral-800 transition-colors">S'inscrire</button>
      </form>
    </div>
  </section>
);

const TestimonialsSection = ({ testimonials }) => (
  <section className="py-20 bg-neutral-50">
    <div className="max-w-7xl mx-auto px-4">
      <div className="text-center mb-12">
        <h2 className="text-3xl font-light uppercase tracking-widest text-[#1A1A1A] mb-2">Ils Nous Font Confiance</h2>
        <p className="text-neutral-500 text-xs italic">Ce que nos clients disent de nous</p>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        {testimonials.map((testimonial, index) => (
          <div key={index} className="bg-white p-6 shadow-sm hover:shadow-md transition-shadow duration-300 border border-neutral-100">
            <div className="flex items-center gap-1 mb-4">
              {[...Array(5)].map((_, i) => (
                <svg key={i} className={`w-4 h-4 ${i < testimonial.note ? 'text-yellow-400 fill-current' : 'text-gray-300'}`} viewBox="0 0 20 20">
                  <path d="M10 15l-5.878 3.09 1.123-6.545L.489 6.91l6.572-.955L10 0l2.939 5.955 6.572.955-4.756 4.635 1.123 6.545z"/>
                </svg>
              ))}
            </div>
            <p className="text-sm text-neutral-700 italic mb-4 line-clamp-4">"{testimonial.commentaire}"</p>
            <div className="flex items-center justify-between pt-4 border-t border-neutral-100">
              <div>
                <p className="text-xs font-bold text-black uppercase tracking-wide">{testimonial.nom_client}</p>
                <p className="text-[10px] text-neutral-400">{testimonial.produit_nom}</p>
              </div>
              {testimonial.avis_verifie && (
                <div className="flex items-center gap-1 text-green-600">
                  <Check className="w-3 h-3" />
                  <span className="text-[9px] uppercase font-bold">Vérifié</span>
                </div>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  </section>
);

const Footer = ({ onNavigate }) => {
  const currentYear = new Date().getFullYear();
  
  return (
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
              >
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/></svg>
              </a>
              <a 
                href="https://facebook.com/viviasshop" 
                target="_blank" 
                rel="noopener noreferrer"
                className="w-10 h-10 bg-neutral-800 hover:bg-blue-600 rounded-full flex items-center justify-center transition-all duration-300 hover:scale-110"
              >
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/></svg>
              </a>
            </div>
          </div>

          {/* Navigation rapide */}
          <div>
            <h3 className="text-white font-semibold text-lg mb-4">Navigation</h3>
            <ul className="space-y-3">
              <li>
                <button onClick={() => onNavigate?.('home')} className="text-neutral-400 hover:text-white transition-colors duration-200 text-sm hover:translate-x-1 transition-transform inline-block">
                  Accueil
                </button>
              </li>
              <li>
                <button onClick={() => onNavigate?.('shop')} className="text-neutral-400 hover:text-white transition-colors duration-200 text-sm hover:translate-x-1 transition-transform inline-block">
                  Boutique
                </button>
              </li>
              <li>
                <button onClick={() => onNavigate?.('category', null)} className="text-neutral-400 hover:text-white transition-colors duration-200 text-sm hover:translate-x-1 transition-transform inline-block">
                  Catégories
                </button>
              </li>
              <li>
                <button onClick={() => onNavigate?.('account')} className="text-neutral-400 hover:text-white transition-colors duration-200 text-sm hover:translate-x-1 transition-transform inline-block">
                  Mon Compte
                </button>
              </li>
            </ul>
          </div>

          {/* Informations légales */}
          <div>
            <h3 className="text-white font-semibold text-lg mb-4">Informations</h3>
            <ul className="space-y-3">
              <li className="text-neutral-400 text-sm hover:text-white cursor-pointer transition-colors">Conditions générales</li>
              <li className="text-neutral-400 text-sm hover:text-white cursor-pointer transition-colors">Politique de confidentialité</li>
              <li className="text-neutral-400 text-sm hover:text-white cursor-pointer transition-colors">Livraison & Retours</li>
              <li className="text-neutral-400 text-sm hover:text-white cursor-pointer transition-colors">FAQ</li>
              <li className="text-neutral-400 text-sm hover:text-white cursor-pointer transition-colors">Guide des tailles</li>
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h3 className="text-white font-semibold text-lg mb-4">Contact</h3>
            <ul className="space-y-3">
              <li className="flex items-start gap-3 text-neutral-400 text-sm">
                <Phone className="w-4 h-4 mt-0.5 flex-shrink-0" />
                <div>
                  <a href="tel:+221784661412" className="hover:text-white transition-colors">+221 78 466 14 12</a>
                  <p className="text-xs text-neutral-500 mt-1">Lun - Sam : 9h - 18h</p>
                </div>
              </li>
              <li className="flex items-start gap-3 text-neutral-400 text-sm">
                <Mail className="w-4 h-4 mt-0.5 flex-shrink-0" />
                <div>
                  <a href="mailto:contact@viviasshop.sn" className="hover:text-white transition-colors">contact@viviasshop.sn</a>
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
              © {currentYear} VIVIAS SHOP. Tous droits réservés.
            </p>
            
            {/* Signature du développeur - Birame Owens Diop */}
            <div className="flex items-center gap-2 text-neutral-500 group">
              <svg className="w-3 h-3 text-neutral-400 group-hover:text-blue-400 transition-colors" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M12.316 3.051a1 1 0 01.633 1.265l-4 12a1 1 0 11-1.898-.632l4-12a1 1 0 011.265-.633zM5.707 6.293a1 1 0 010 1.414L3.414 10l2.293 2.293a1 1 0 11-1.414 1.414l-3-3a1 1 0 010-1.414l3-3a1 1 0 011.414 0zm8.586 0a1 1 0 011.414 0l3 3a1 1 0 010 1.414l-3 3a1 1 0 11-1.414-1.414L16.586 10l-2.293-2.293a1 1 0 010-1.414z" clipRule="evenodd"/>
              </svg>
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
  );
};

export default HomePage;