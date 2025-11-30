import React, { useState, useEffect } from 'react';
import Navbar from '../components/Navbar';
import { 
  Heart, ShoppingBag, Star, Truck, Shield, MessageCircle, 
  Share2, ChevronRight, Minus, Plus, X, ZoomIn, Check, Loader2
} from 'lucide-react';
import api from '../utils/api';

const ProductDetailPage = () => {
  const [product, setProduct] = useState(null);
  const [images, setImages] = useState([]);
  const [relatedProducts, setRelatedProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedColor, setSelectedColor] = useState(null);
  const [selectedSize, setSelectedSize] = useState(null);
  const [quantity, setQuantity] = useState(1);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [cartCount, setCartCount] = useState(0);
  const [wishlistCount, setWishlistCount] = useState(0);
  const [categories, setCategories] = useState([]);
  const [showZoom, setShowZoom] = useState(false);
  const [isInWishlist, setIsInWishlist] = useState(false);

  const slug = window.location.pathname.split('/').pop();

  // Map des couleurs pour l'affichage visuel
  const colorMap = {
    'noir': '#000000', 'blanc': '#FFFFFF', 'rouge': '#EF4444',
    'bleu': '#3B82F6', 'vert': '#10B981', 'jaune': '#F59E0B',
    'rose': '#EC4899', 'violet': '#8B5CF6', 'orange': '#F97316',
    'marron': '#5D4037', 'gris': '#9CA3AF', 'beige': '#D7CCC8',
    'doré': 'linear-gradient(135deg, #FFD700 0%, #FDB931 100%)',
    'argenté': 'linear-gradient(135deg, #E0E0E0 0%, #9E9E9E 100%)',
    'bordeaux': '#800020', 'turquoise': '#40E0D0', 'navy': '#000080', 'kaki': '#556B2F'
  };

  useEffect(() => {
    loadProductData();
    loadNavbarData();
  }, [slug]);

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

  const loadProductData = async () => {
    try {
      setLoading(true);
      const response = await api.getProductPageData(slug);

      if (response.success) {
        const { product: productData, related_products } = response.data;
        setProduct(productData);
        setRelatedProducts(related_products);
        
        // Gestion Images
        const gallery = [];
        if (productData.images?.length > 0) {
          console.log('📸 Images reçues de l\'API:', productData.images);
          productData.images.forEach(img => {
            gallery.push({ 
              original: img.original || '/assets/images/placeholder.jpg', 
              thumbnail: img.thumbnail || img.medium || img.original || '/assets/images/placeholder.jpg',
              alt_text: img.alt_text || productData.nom
            });
          });
        } else if (productData.image) {
          gallery.push({ 
            original: productData.image, 
            thumbnail: productData.image,
            alt_text: productData.nom
          });
        } else {
          // Fallback si aucune image
          gallery.push({
            original: '/assets/images/placeholder.jpg',
            thumbnail: '/assets/images/placeholder.jpg',
            alt_text: productData.nom
          });
        }
        setImages(gallery);
        console.log('✅ Images chargées dans l\'état:', gallery); // Debug

        // Pré-sélection
        if (productData.couleurs_disponibles?.length > 0) setSelectedColor(productData.couleurs_disponibles[0]);
        if (productData.tailles_disponibles?.length > 0) setSelectedSize(productData.tailles_disponibles[0]);
      }
    } catch (error) { console.error('Erreur:', error); } 
    finally { setLoading(false); }
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

  const handleAddToCart = async () => {
    if (!selectedColor && product.couleurs_disponibles?.length > 0) return alert('Veuillez sélectionner une couleur');
    if (!selectedSize && product.tailles_disponibles?.length > 0) return alert('Veuillez sélectionner une taille');

    try {
      const response = await api.addToCart(product.id, quantity, { couleur: selectedColor, taille: selectedSize });
      if (response.success) {
        setCartCount(prev => prev + 1);
        alert('Produit ajouté au panier');
      }
    } catch (error) { alert("Erreur lors de l'ajout"); }
  };

  const handleAddToWishlist = async () => {
    try {
      const response = await api.addToWishlist(product.id);
      if (response.success) {
        setWishlistCount(prev => prev + 1);
        setIsInWishlist(true);
        alert('Ajouté aux favoris');
      }
    } catch (error) { console.error(error); }
  };

  const handleWhatsAppOrder = (productData = null) => {
    const phone = "221784661412";
    const prod = productData || product;
    const text = `Bonjour VIVIAS, je souhaite commander : ${prod.nom} (Prix: ${prod.prix_affiche?.toLocaleString()} FCFA). ${selectedColor ? 'Couleur: ' + selectedColor : ''} ${selectedSize ? 'Taille: ' + selectedSize : ''} ${!productData ? `Quantité: ${quantity}` : ''}`;
    window.open(`https://wa.me/${phone}?text=${encodeURIComponent(text)}`, '_blank');
  };

  const handleRelatedAddToCart = async (productId) => {
    try {
      const response = await api.addToCart(productId, 1);
      if (response.success) {
        setCartCount(prev => prev + 1);
        alert('Produit ajouté au panier');
      }
    } catch (error) { alert("Erreur lors de l'ajout"); }
  };

  if (loading) return <div className="h-screen flex items-center justify-center bg-[#FDFBF7]"><Loader2 className="animate-spin w-8 h-8 text-neutral-400"/></div>;
  if (!product) return null;

  return (
    <div className="min-h-screen bg-[#FDFBF7] text-[#1A1A1A] font-sans selection:bg-black selection:text-white">
      <Navbar 
        cartCount={cartCount} 
        wishlistCount={wishlistCount} 
        categories={categories}
        onNavigate={handleNavigation} 
      />

      {/* BREADCRUMBS Minimaliste */}
      <div className="max-w-[1800px] mx-auto px-4 md:px-8 py-4 text-[10px] md:text-xs uppercase tracking-widest text-neutral-500 border-b border-neutral-100">
        <button onClick={() => handleNavigation('home')} className="hover:text-black">Accueil</button>
        <span className="mx-2">/</span>
        {product.category && (
          <>
            <button onClick={() => handleNavigation('category', product.category.slug)} className="hover:text-black">{product.category.nom}</button>
            <span className="mx-2">/</span>
          </>
        )}
        <span className="text-black font-medium">{product.nom}</span>
      </div>

      <div className="max-w-[1800px] mx-auto px-4 md:px-8 py-8 md:py-12">
        <div className="flex flex-col lg:flex-row gap-8 lg:gap-12 xl:gap-20">
          
          {/* GAUCHE : GALERIE IMAGES (Style Editorial) */}
          <div className="lg:w-3/5">
            <div className="flex flex-col-reverse md:flex-row gap-3 md:gap-4">
              {/* Thumbnails (Horizontal mobile, Vertical desktop) */}
              {images.length > 1 && (
                <div className="flex md:flex-col gap-2 md:gap-3 overflow-x-auto md:overflow-y-auto md:max-h-[700px] scrollbar-hide pb-2 md:pb-0">
                  {images.map((img, idx) => (
                    <button
                      key={idx}
                      onClick={() => setCurrentImageIndex(idx)}
                      className={`relative w-16 h-20 md:w-20 md:h-28 flex-shrink-0 border-2 transition-all rounded overflow-hidden ${
                        currentImageIndex === idx ? 'border-black opacity-100 shadow-md ring-2 ring-black ring-offset-2' : 'border-neutral-200 opacity-60 hover:opacity-100 hover:border-neutral-400'
                      }`}
                    >
                      {img.thumbnail ? (
                        <img 
                          src={img.thumbnail} 
                          alt={img.alt_text || `Image ${idx + 1}`} 
                          className="w-full h-full object-cover rounded"
                          onError={(e) => {
                            console.error('Erreur thumbnail:', img.thumbnail);
                            e.target.src = '/assets/images/placeholder.jpg';
                          }}
                          loading="lazy"
                        />
                      ) : (
                        <div className="w-full h-full bg-neutral-200 flex items-center justify-center">
                          <span className="text-xs text-neutral-400">#{idx + 1}</span>
                        </div>
                      )}
                    </button>
                  ))}
                </div>
              )}

              {/* Image Principale */}
              <div className="flex-1 relative bg-neutral-100 aspect-[3/4] md:aspect-auto md:h-[600px] lg:h-[700px] cursor-zoom-in group rounded-lg overflow-hidden" onClick={() => setShowZoom(true)}>
                <img 
                  src={images[currentImageIndex]?.original || '/assets/images/placeholder.jpg'} 
                  alt={images[currentImageIndex]?.alt_text || product.nom}
                  className="w-full h-full object-cover"
                  onError={(e) => {
                    e.target.src = '/assets/images/placeholder.jpg';
                  }}
                />
                
                {/* Badges Flottants */}
                <div className="absolute top-3 left-3 md:top-4 md:left-4 flex flex-col gap-2 z-10">
                  {product.en_promo && <span className="bg-red-600 text-white text-[9px] md:text-[10px] font-bold px-2 py-1 uppercase tracking-wider shadow-lg rounded">-{product.pourcentage_reduction}%</span>}
                  {product.est_nouveaute && <span className="bg-white text-black text-[9px] md:text-[10px] font-bold px-2 py-1 uppercase tracking-wider shadow-lg rounded">Nouveau</span>}
                  {product.est_populaire && <span className="bg-yellow-400 text-black text-[9px] md:text-[10px] font-bold px-2 py-1 uppercase tracking-wider shadow-lg rounded">⭐ Populaire</span>}
                </div>

                <div className="absolute bottom-3 right-3 md:bottom-4 md:right-4 bg-white/90 p-2 md:p-3 rounded-full opacity-0 group-hover:opacity-100 transition-opacity shadow-lg">
                  <ZoomIn className="w-4 h-4 md:w-5 md:h-5 text-black" />
                </div>
              </div>
            </div>
          </div>

          {/* DROITE : INFORMATIONS (Sticky) */}
          <div className="lg:w-2/5 lg:sticky lg:top-24 h-fit space-y-6 md:space-y-8">
            
            {/* Header Produit */}
            <div className="border-b border-neutral-200 pb-4 md:pb-6">
              <h1 className="text-2xl md:text-3xl lg:text-4xl font-light uppercase tracking-wide mb-3">{product.nom}</h1>
              
              {/* Note et Avis */}
              {product.nombre_avis > 0 && (
                <div className="flex items-center gap-2 mb-3">
                  <div className="flex items-center gap-1">
                    {[...Array(5)].map((_, i) => (
                      <Star key={i} className={`w-4 h-4 ${i < Math.floor(product.note_moyenne) ? 'fill-yellow-400 text-yellow-400' : 'text-neutral-300'}`} />
                    ))}
                  </div>
                  <span className="text-xs text-neutral-600">({product.nombre_avis} avis)</span>
                </div>
              )}
              
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mt-4">
                <div className="flex items-baseline gap-3 md:gap-4">
                  <span className="text-2xl md:text-3xl font-medium">{product.prix_affiche?.toLocaleString()} FCFA</span>
                  {product.en_promo && (
                    <span className="text-base md:text-lg text-neutral-400 line-through font-light">{product.prix?.toLocaleString()} FCFA</span>
                  )}
                </div>
                
                {/* Actions Rapides */}
                <div className="flex gap-2">
                  <button onClick={handleAddToWishlist} className={`p-3 rounded-full border border-neutral-200 hover:border-black transition-colors ${isInWishlist ? 'bg-black text-white' : 'text-black'}`}>
                    <Heart className="w-5 h-5" />
                  </button>
                  <button onClick={() => {
                     if (navigator.share) navigator.share({ title: product.nom, url: window.location.href });
                  }} className="p-3 rounded-full border border-neutral-200 hover:border-black transition-colors text-black">
                    <Share2 className="w-5 h-5" />
                  </button>
                </div>
              </div>
            </div>

            {/* Description courte */}
            {product.description_courte && (
              <div className="text-sm md:text-base text-neutral-600 leading-relaxed">
                {product.description_courte}
              </div>
            )}

            {/* Disponibilité et Stock */}
            <div className="flex items-center gap-4 text-sm">
              {product.en_stock ? (
                <span className="flex items-center gap-2 text-green-600 font-medium">
                  <Check className="w-4 h-4" /> En stock
                </span>
              ) : (
                <span className="text-red-600 font-medium">Rupture de stock</span>
              )}
              {product.fait_sur_mesure && (
                <span className="text-neutral-600">
                  • Fait sur mesure ({product.delai_production_jours} jours)
                </span>
              )}
            </div>

            {/* Sélecteurs */}
            <div className="space-y-5 md:space-y-6">
              {/* Couleurs */}
              {product.couleurs_disponibles?.length > 0 && (
                <div>
                  <span className="text-xs md:text-sm font-bold uppercase tracking-widest block mb-3">Couleur : <span className="text-neutral-600">{selectedColor}</span></span>
                  <div className="flex flex-wrap gap-2 md:gap-3">
                    {product.couleurs_disponibles.map((color, idx) => (
                      <button
                        key={idx}
                        onClick={() => setSelectedColor(color)}
                        className={`w-10 h-10 md:w-12 md:h-12 rounded-full border-2 flex items-center justify-center transition-all ${
                          selectedColor === color ? 'border-black ring-2 ring-black ring-offset-2 scale-110' : 'border-neutral-200 hover:border-neutral-400 hover:scale-105'
                        }`}
                        style={{ background: colorMap[color.toLowerCase()] || '#eee' }}
                        title={color}
                      >
                         {color.toLowerCase() === 'blanc' && <span className="w-8 h-8 border border-neutral-300 rounded-full"></span>}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Tailles */}
              {product.tailles_disponibles?.length > 0 && (
                <div>
                  <div className="flex justify-between items-center mb-3">
                    <span className="text-xs md:text-sm font-bold uppercase tracking-widest">Taille : <span className="text-neutral-600">{selectedSize}</span></span>
                    <button className="text-[10px] md:text-xs underline decoration-neutral-300 hover:text-neutral-500">Guide des tailles</button>
                  </div>
                  <div className="grid grid-cols-4 md:grid-cols-5 lg:grid-cols-6 gap-2">
                    {product.tailles_disponibles.map((size, idx) => (
                      <button
                        key={idx}
                        onClick={() => setSelectedSize(size)}
                        className={`h-10 md:h-12 border-2 text-[10px] md:text-xs font-bold uppercase tracking-widest transition-all rounded ${
                          selectedSize === size 
                            ? 'bg-black text-white border-black scale-105' 
                            : 'bg-white text-neutral-600 border-neutral-200 hover:border-black hover:scale-105'
                        }`}
                      >
                        {size}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Quantité */}
              <div>
                <span className="text-xs md:text-sm font-bold uppercase tracking-widest block mb-3">Quantité</span>
                <div className="flex items-center w-28 md:w-32 border-2 border-neutral-200 h-10 md:h-12 rounded">
                  <button 
                    onClick={() => setQuantity(Math.max(1, quantity - 1))}
                    className="w-8 md:w-10 h-full flex items-center justify-center hover:bg-neutral-50 transition-colors"
                  >
                    <Minus className="w-3 h-3 md:w-4 md:h-4" />
                  </button>
                  <div className="flex-1 h-full flex items-center justify-center text-sm md:text-base font-bold border-x-2 border-neutral-200">
                    {quantity}
                  </div>
                  <button 
                    onClick={() => setQuantity(quantity + 1)}
                    className="w-8 md:w-10 h-full flex items-center justify-center hover:bg-neutral-50 transition-colors"
                  >
                    <Plus className="w-3 h-3 md:w-4 md:h-4" />
                  </button>
                </div>
              </div>
            </div>

            {/* Boutons d'action */}
            <div className="space-y-3 pt-4">
              <button 
                onClick={handleAddToCart}
                disabled={!product.en_stock}
                className="w-full bg-black text-white h-12 md:h-14 text-[10px] md:text-xs font-bold uppercase tracking-widest hover:bg-neutral-800 transition-colors flex items-center justify-center gap-2 disabled:bg-neutral-300 disabled:cursor-not-allowed rounded"
              >
                <ShoppingBag className="w-4 h-4" /> Ajouter au panier
              </button>
              
              <button 
                onClick={() => handleWhatsAppOrder()}
                className="w-full bg-[#25D366] text-white h-12 md:h-14 text-[10px] md:text-xs font-bold uppercase tracking-widest hover:bg-[#128C7E] transition-colors flex items-center justify-center gap-2 rounded"
              >
                <MessageCircle className="w-4 h-4" /> Commander sur WhatsApp
              </button>
            </div>

            {/* Réassurance */}
            <div className="grid grid-cols-2 gap-3 md:gap-4 py-4 md:py-6 border-t border-b border-neutral-100">
               <div className="flex items-center gap-2 md:gap-3">
                 <Truck className="w-4 h-4 md:w-5 md:h-5 text-neutral-400" />
                 <span className="text-[10px] md:text-xs uppercase tracking-wide text-neutral-600">Livraison Rapide</span>
               </div>
               <div className="flex items-center gap-2 md:gap-3">
                 <Shield className="w-4 h-4 md:w-5 md:h-5 text-neutral-400" />
                 <span className="text-[10px] md:text-xs uppercase tracking-wide text-neutral-600">Paiement Sécurisé</span>
               </div>
            </div>

            {/* Description complète */}
            {product.description && (
              <div className="text-xs md:text-sm text-neutral-600 font-light leading-relaxed space-y-3 md:space-y-4">
                 <h3 className="text-black font-bold uppercase tracking-widest text-xs md:text-sm">Détails du produit</h3>
                 <p>{product.description}</p>
              </div>
            )}

            {/* Tags */}
            {product.tags?.length > 0 && (
              <div className="flex flex-wrap gap-2">
                {product.tags.map((tag, idx) => (
                  <span key={idx} className="px-3 py-1 bg-neutral-100 text-neutral-700 text-xs rounded-full">
                    #{tag.trim()}
                  </span>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* RELATED PRODUCTS */}
        {relatedProducts.length > 0 && (
          <div className="mt-16 md:mt-24 border-t border-neutral-200 pt-12 md:pt-16">
            <h2 className="text-xl md:text-2xl lg:text-3xl font-light uppercase tracking-wide text-center mb-8 md:mb-12">Vous aimerez aussi</h2>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6 lg:gap-8">
              {relatedProducts.map(related => (
                <div key={related.id} className="group flex flex-col">
                  <div className="aspect-[3/4] bg-neutral-100 overflow-hidden relative mb-3 md:mb-4 rounded-lg cursor-pointer" onClick={() => window.location.href = `/products/${related.slug}`}>
                    <img 
                      src={related.image} 
                      alt={related.nom} 
                      className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                      onError={(e) => {
                        e.target.src = '/assets/images/placeholder.jpg';
                      }}
                    />
                    {/* Badges */}
                    <div className="absolute top-2 left-2 flex flex-col gap-1">
                      {related.en_promo && <span className="bg-red-600 text-white text-[9px] md:text-[10px] font-bold px-2 py-1 uppercase tracking-wider shadow rounded">Promo</span>}
                      {related.est_nouveaute && <span className="bg-white text-black text-[9px] md:text-[10px] font-bold px-2 py-1 uppercase tracking-wider shadow rounded">New</span>}
                    </div>

                    {/* Boutons d'action au hover */}
                    <div className="absolute bottom-0 left-0 right-0 flex flex-col translate-y-full group-hover:translate-y-0 transition-transform duration-300">
                      <button 
                        onClick={(e) => { e.stopPropagation(); handleRelatedAddToCart(related.id); }}
                        className="bg-white text-black py-2 md:py-3 text-[9px] md:text-[10px] font-bold uppercase tracking-widest hover:bg-black hover:text-white transition-colors border-t border-gray-100 flex items-center justify-center gap-1 md:gap-2"
                      >
                        <ShoppingBag className="w-3 h-3" /> Ajouter
                      </button>
                      <button 
                        onClick={(e) => { e.stopPropagation(); handleWhatsAppOrder(related); }}
                        className="bg-[#25D366] text-white py-2 md:py-3 text-[9px] md:text-[10px] font-bold uppercase tracking-widest hover:bg-[#128C7E] transition-colors flex items-center justify-center gap-1 md:gap-2"
                      >
                        <MessageCircle className="w-3 h-3" /> WhatsApp
                      </button>
                    </div>
                  </div>
                  
                  <div className="text-center" onClick={() => window.location.href = `/products/${related.slug}`}>
                    <h3 className="text-xs md:text-sm font-medium uppercase tracking-wide text-black mb-1 line-clamp-1 cursor-pointer hover:underline">{related.nom}</h3>
                    <div className="text-xs md:text-sm">
                      {related.en_promo ? (
                        <>
                          <span className="text-red-600 font-bold mr-2">{related.prix_affiche?.toLocaleString()} FCFA</span>
                          <span className="text-neutral-400 line-through text-xs">{related.prix?.toLocaleString()}</span>
                        </>
                      ) : (
                        <span className="font-bold text-black">{related.prix_affiche?.toLocaleString()} FCFA</span>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* ZOOM MODAL */}
      {showZoom && (
        <div className="fixed inset-0 z-[100] bg-white flex items-center justify-center" onClick={() => setShowZoom(false)}>
          <button className="absolute top-8 right-8 p-2 hover:bg-neutral-100 rounded-full">
            <X className="w-8 h-8 text-black" />
          </button>
          <img 
            src={images[currentImageIndex]?.original} 
            alt="Zoom" 
            className="max-w-full max-h-[90vh] object-contain cursor-zoom-out"
          />
        </div>
      )}
    </div>
  );
};

export default ProductDetailPage;