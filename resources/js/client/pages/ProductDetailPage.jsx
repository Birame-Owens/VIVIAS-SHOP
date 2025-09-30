import React, { useState, useEffect } from 'react';
import Navbar from '../components/Navbar';
import { 
  Heart, ShoppingCart, Star, Truck, Shield, Award, 
  MessageCircle, Check, Sparkles, Flame, Share2, Eye, ZoomIn, X
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

  const colorMap = {
    'noir': '#000000',
    'blanc': '#FFFFFF',
    'rouge': '#EF4444',
    'bleu': '#3B82F6',
    'vert': '#10B981',
    'jaune': '#F59E0B',
    'rose': '#EC4899',
    'violet': '#8B5CF6',
    'orange': '#F97316',
    'marron': '#92400E',
    'gris': '#6B7280',
    'beige': '#D4B896',
    'doré': 'linear-gradient(135deg, #FFD700 0%, #FFA500 100%)',
    'argenté': 'linear-gradient(135deg, #C0C0C0 0%, #808080 100%)',
    'bordeaux': '#800020',
    'turquoise': '#40E0D0',
    'navy': '#000080',
    'kaki': '#8B864E'
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
    } catch (error) {
      console.error('Erreur navbar:', error);
    }
  };

 const loadProductData = async () => {
  try {
    setLoading(true);
    
    // UNE SEULE requête !
    const response = await api.getProductPageData(slug);

    if (response.success) {
      const { product: productData, related_products } = response.data;
      
      setProduct(productData);
      setRelatedProducts(related_products);
      
      // Images
      const gallery = [];
      if (productData.images && productData.images.length > 0) {
        productData.images.forEach(img => {
          gallery.push({ 
            original: img.original, 
            thumbnail: img.thumbnail || img.original
          });
        });
      } else if (productData.image) {
        gallery.push({ 
          original: productData.image, 
          thumbnail: productData.image 
        });
      }
      setImages(gallery);

      // Pré-sélection
      if (productData.couleurs_disponibles?.length > 0) {
        setSelectedColor(productData.couleurs_disponibles[0]);
      }
      if (productData.tailles_disponibles?.length > 0) {
        setSelectedSize(productData.tailles_disponibles[0]);
      }
    }
  } catch (error) {
    console.error('Erreur:', error);
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
      search: `/search?q=${encodeURIComponent(params.q)}`
    };
    if (routes[type]) window.location.href = routes[type];
  };

  const handleSearch = async (query) => {
    try {
      const response = await api.quickSearch(query);
      return response.success ? response.data : { produits: [], categories: [] };
    } catch (error) {
      return { produits: [], categories: [] };
    }
  };

  const handleAddToCart = async () => {
    if (!selectedColor && product.couleurs_disponibles?.length > 0) {
      alert('Veuillez sélectionner une couleur');
      return;
    }
    if (!selectedSize && product.tailles_disponibles?.length > 0) {
      alert('Veuillez sélectionner une taille');
      return;
    }

    try {
      const response = await api.addToCart(product.id, quantity, {
        couleur: selectedColor,
        taille: selectedSize
      });

      if (response.success) {
        setCartCount(prev => prev + 1);
        alert('✅ Produit ajouté au panier !');
      }
    } catch (error) {
      alert('❌ Erreur lors de l\'ajout');
    }
  };

  const handleAddToWishlist = async () => {
    try {
      const response = await api.addToWishlist(product.id);
      if (response.success) {
        setWishlistCount(prev => prev + 1);
        setIsInWishlist(true);
        alert('❤️ Ajouté aux favoris !');
      }
    } catch (error) {
      console.error('Erreur favoris:', error);
    }
  };

  const handleShare = async () => {
    const shareData = {
      title: product.nom,
      text: `Découvrez ${product.nom} sur VIVIAS SHOP`,
      url: window.location.href
    };
    
    try {
      if (navigator.share) {
        await navigator.share(shareData);
      } else {
        await navigator.clipboard.writeText(window.location.href);
        alert('✅ Lien copié dans le presse-papier !');
      }
    } catch (err) {
      console.log('Erreur de partage:', err);
    }
  };

  const getColorStyle = (colorName) => {
    const color = colorName.toLowerCase().trim();
    return colorMap[color] || colorName;
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-purple-50 via-pink-50 to-purple-50">
        <div className="text-center">
          <div className="w-20 h-20 bg-gradient-to-r from-purple-600 to-pink-600 rounded-full flex items-center justify-center mx-auto mb-6 animate-bounce">
            <span className="text-white font-bold text-3xl">V</span>
          </div>
          <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-purple-600 mx-auto mb-4"></div>
          <p className="text-gray-600 text-lg font-medium">Chargement...</p>
        </div>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <p className="text-gray-600 text-lg mb-4">Produit non trouvé</p>
          <button onClick={() => window.location.href = '/'} className="text-purple-600 hover:underline">
            Retour à l'accueil
          </button>
        </div>
      </div>
    );
  }

  const reduction = product.prix_promo 
    ? Math.round(((product.prix - product.prix_promo) / product.prix) * 100)
    : 0;

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-purple-50">
      <Navbar
        cartCount={cartCount}
        wishlistCount={wishlistCount}
        categories={categories}
        onNavigate={handleNavigation}
        onSearch={handleSearch}
      />

      <div className="pt-4">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center gap-2 text-sm mb-6">
            <button onClick={() => handleNavigation('home')} className="text-gray-500 hover:text-purple-600">Accueil</button>
            <span className="text-gray-400">/</span>
            {product.category && (
              <>
                <button onClick={() => handleNavigation('category', product.category.slug)} className="text-gray-500 hover:text-purple-600">
                  {product.category.nom}
                </button>
                <span className="text-gray-400">/</span>
              </>
            )}
            <span className="text-gray-900 font-medium truncate">{product.nom}</span>
          </div>

          <div className="grid lg:grid-cols-2 gap-8 bg-white rounded-3xl shadow-2xl overflow-hidden">
            <div className="relative bg-gradient-to-br from-gray-50 to-gray-100 p-6">
              <div className="absolute top-6 left-6 z-20 flex flex-col gap-2">
                {product.prix_promo && (
                  <div className="bg-red-500 text-white px-4 py-2 rounded-full text-sm font-bold shadow-lg animate-pulse flex items-center gap-1">
                    <Flame className="h-4 w-4" />
                    -{reduction}%
                  </div>
                )}
                {product.est_nouveaute && (
                  <div className="bg-blue-500 text-white px-4 py-2 rounded-full text-sm font-bold shadow-lg flex items-center gap-1">
                    <Sparkles className="h-4 w-4" />
                    NOUVEAU
                  </div>
                )}
                {product.est_populaire && (
                  <div className="bg-yellow-500 text-white px-4 py-2 rounded-full text-sm font-bold shadow-lg flex items-center gap-1">
                    <Flame className="h-4 w-4" />
                    POPULAIRE
                  </div>
                )}
              </div>

              <div className="absolute top-6 right-6 z-20 flex flex-col gap-2">
                <button
                  onClick={handleAddToWishlist}
                  className={`w-12 h-12 rounded-full flex items-center justify-center shadow-lg transition-all transform hover:scale-110 ${
                    isInWishlist ? 'bg-pink-500 text-white' : 'bg-white text-gray-700 hover:bg-pink-50'
                  }`}
                >
                  <Heart className={`h-6 w-6 ${isInWishlist ? 'fill-current' : ''}`} />
                </button>
                <button 
                  onClick={handleShare}
                  className="w-12 h-12 bg-white rounded-full flex items-center justify-center shadow-lg hover:bg-purple-50 transition-all transform hover:scale-110"
                >
                  <Share2 className="h-6 w-6 text-gray-700" />
                </button>
                <button 
                  onClick={() => setShowZoom(true)}
                  className="w-12 h-12 bg-white rounded-full flex items-center justify-center shadow-lg hover:bg-purple-50 transition-all transform hover:scale-110"
                >
                  <ZoomIn className="h-6 w-6 text-gray-700" />
                </button>
              </div>

              <div className="aspect-square rounded-2xl overflow-hidden mb-4 shadow-xl relative group">
                <img
                  src={images[currentImageIndex]?.original || product.image || '/images/placeholder-product.jpg'}
                  alt={product.nom}
                  className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                  onError={(e) => {
                    e.target.onerror = null;
                    e.target.src = '/images/placeholder-product.jpg';
                  }}
                />
                {product.stock_disponible < 5 && product.stock_disponible > 0 && (
                  <div className="absolute bottom-4 left-4 bg-orange-500 text-white px-4 py-2 rounded-full text-sm font-bold">
                    Plus que {product.stock_disponible} en stock !
                  </div>
                )}
              </div>

              {images.length > 1 && (
                <div className="grid grid-cols-4 gap-3">
                  {images.map((image, idx) => (
                    <button
                      key={idx}
                      onClick={() => setCurrentImageIndex(idx)}
                      className={`aspect-square rounded-xl overflow-hidden border-3 transition-all transform hover:scale-105 ${
                        currentImageIndex === idx 
                          ? 'border-purple-600 shadow-lg scale-105' 
                          : 'border-gray-200 hover:border-purple-300'
                      }`}
                    >
                      <img
                        src={image.thumbnail || image.original}
                        alt={`${product.nom} ${idx + 1}`}
                        className="w-full h-full object-cover"
                        onError={(e) => {
                          e.target.onerror = null;
                          e.target.src = image.original || '/images/placeholder-product.jpg';
                        }}
                      />
                    </button>
                  ))}
                </div>
              )}
            </div>

            <div className="p-8 flex flex-col">
              <div className="mb-6">
                {product.category && (
                  <button
                    onClick={() => handleNavigation('category', product.category.slug)}
                    className="inline-flex items-center px-4 py-2 bg-gradient-to-r from-purple-100 to-pink-100 text-purple-700 rounded-full text-sm font-semibold mb-4 hover:from-purple-200 hover:to-pink-200 transition-all"
                  >
                    {product.category.nom}
                  </button>
                )}
                
                <h1 className="text-4xl font-bold text-gray-900 mb-3 leading-tight">{product.nom}</h1>
                
                {product.description_courte && (
                  <p className="text-lg text-gray-600 leading-relaxed">{product.description_courte}</p>
                )}
              </div>

              {product.note_moyenne > 0 && (
                <div className="flex items-center gap-4 mb-6 pb-6 border-b">
                  <div className="flex items-center gap-1">
                    {[...Array(5)].map((_, i) => (
                      <Star
                        key={i}
                        className={`h-6 w-6 ${
                          i < Math.floor(product.note_moyenne) ? 'text-yellow-400 fill-current' : 'text-gray-300'
                        }`}
                      />
                    ))}
                  </div>
                  <span className="text-lg font-semibold text-gray-900">
                    {product.note_moyenne.toFixed(1)}
                  </span>
                  <span className="text-gray-500">({product.nombre_avis} avis)</span>
                  <Eye className="h-5 w-5 text-gray-400 ml-auto" />
                  <span className="text-gray-500">{product.nombre_vues || 0} vues</span>
                </div>
              )}

              <div className="mb-8 p-6 bg-gradient-to-r from-purple-50 to-pink-50 rounded-2xl">
                <div className="flex items-baseline gap-4 flex-wrap mb-2">
                  <span className="text-5xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
                    {(product.prix_promo || product.prix).toLocaleString()} FCFA
                  </span>
                  {product.prix_promo && (
                    <span className="text-2xl text-gray-400 line-through">
                      {product.prix.toLocaleString()} FCFA
                    </span>
                  )}
                </div>
                {product.prix_promo && (
                  <p className="text-green-600 font-semibold flex items-center gap-2">
                    <Check className="h-5 w-5" />
                    Vous économisez {(product.prix - product.prix_promo).toLocaleString()} FCFA
                  </p>
                )}
              </div>

              {product.couleurs_disponibles?.length > 0 && (
                <div className="mb-6">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="font-bold text-lg text-gray-900">
                      Couleur: <span className="text-purple-600">{selectedColor}</span>
                    </h3>
                    <span className="text-sm text-gray-500">
                      {product.couleurs_disponibles.length} disponible{product.couleurs_disponibles.length > 1 ? 's' : ''}
                    </span>
                  </div>
                  <div className="flex flex-wrap gap-3">
                    {product.couleurs_disponibles.map((color, idx) => {
                      const colorStyle = getColorStyle(color);
                      
                      return (
                        <button
                          key={idx}
                          onClick={() => setSelectedColor(color)}
                          className={`group relative transition-all ${
                            selectedColor === color ? 'scale-110' : 'hover:scale-105'
                          }`}
                        >
                          <div
                            className={`w-16 h-16 rounded-xl border-4 transition-all ${
                              selectedColor === color
                                ? 'border-purple-600 shadow-xl'
                                : 'border-gray-200 hover:border-purple-300'
                            }`}
                            style={{ 
                              background: colorStyle,
                              boxShadow: selectedColor === color ? '0 0 0 4px rgba(147, 51, 234, 0.1)' : 'none'
                            }}
                          >
                            {selectedColor === color && (
                              <div className="absolute inset-0 flex items-center justify-center">
                                <div className="w-8 h-8 bg-white rounded-full shadow-lg flex items-center justify-center">
                                  <Check className="w-5 h-5 text-purple-600" />
                                </div>
                              </div>
                            )}
                            {color.toLowerCase() === 'blanc' && (
                              <div className="absolute inset-0 border-2 border-gray-300 rounded-xl"></div>
                            )}
                          </div>
                          <span className={`block mt-2 text-xs font-medium text-center ${
                            selectedColor === color ? 'text-purple-600' : 'text-gray-600'
                          }`}>
                            {color}
                          </span>
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}

              {product.tailles_disponibles?.length > 0 && (
                <div className="mb-6">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="font-bold text-lg text-gray-900">
                      Taille: <span className="text-purple-600">{selectedSize || 'Sélectionner'}</span>
                    </h3>
                    <button className="text-sm text-purple-600 hover:underline font-medium">
                      Guide des tailles
                    </button>
                  </div>
                  <div className="grid grid-cols-4 gap-3">
                    {product.tailles_disponibles.map((size, idx) => (
                      <button
                        key={idx}
                        onClick={() => setSelectedSize(size)}
                        className={`py-4 px-3 border-3 rounded-xl font-bold transition-all transform hover:scale-105 ${
                          selectedSize === size
                            ? 'border-purple-600 bg-purple-50 text-purple-600 shadow-lg scale-105'
                            : 'border-gray-200 hover:border-purple-300 text-gray-700 hover:bg-purple-50'
                        }`}
                      >
                        {size}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              <div className="mb-8">
                <h3 className="font-bold text-lg mb-4 text-gray-900">Quantité</h3>
                <div className="inline-flex items-center border-3 border-gray-200 rounded-xl overflow-hidden shadow-md">
                  <button
                    onClick={() => setQuantity(Math.max(1, quantity - 1))}
                    className="w-14 h-14 flex items-center justify-center hover:bg-purple-50 transition-colors text-2xl font-bold text-gray-700"
                  >
                    −
                  </button>
                  <div className="w-20 h-14 flex items-center justify-center border-x-3 border-gray-200 font-bold text-xl text-gray-900">
                    {quantity}
                  </div>
                  <button
                    onClick={() => setQuantity(quantity + 1)}
                    className="w-14 h-14 flex items-center justify-center hover:bg-purple-50 transition-colors text-2xl font-bold text-gray-700"
                  >
                    +
                  </button>
                </div>
              </div>

              <div className="space-y-3 mb-8">
                <button
                  onClick={handleAddToCart}
                  className="w-full bg-gradient-to-r from-purple-600 via-pink-600 to-purple-600 text-white py-5 px-8 rounded-2xl hover:from-purple-700 hover:via-pink-700 hover:to-purple-700 transition-all duration-300 font-bold text-lg transform hover:scale-105 active:scale-95 flex items-center justify-center gap-3 shadow-2xl animate-gradient bg-[length:200%_200%]"
                >
                  <ShoppingCart className="h-6 w-6" />
                  Ajouter au panier
                </button>

                <button
                  onClick={() => window.open(`https://wa.me/221771397393?text=Je suis intéressé par ${product.nom}`, '_blank')}
                  className="w-full bg-green-500 text-white py-5 px-8 rounded-2xl hover:bg-green-600 transition-all duration-300 font-bold text-lg transform hover:scale-105 flex items-center justify-center gap-3 shadow-xl"
                >
                  <MessageCircle className="h-6 w-6" />
                  Commander via WhatsApp
                </button>
              </div>

              <div className="grid grid-cols-3 gap-4 p-6 bg-gradient-to-br from-purple-50 to-pink-50 rounded-2xl">
                <div className="text-center">
                  <div className="w-14 h-14 bg-white rounded-full flex items-center justify-center mx-auto mb-2 shadow-md">
                    <Truck className="h-7 w-7 text-purple-600" />
                  </div>
                  <p className="text-xs font-semibold text-gray-700">Livraison gratuite</p>
                </div>
                <div className="text-center">
                  <div className="w-14 h-14 bg-white rounded-full flex items-center justify-center mx-auto mb-2 shadow-md">
                    <Shield className="h-7 w-7 text-purple-600" />
                  </div>
                  <p className="text-xs font-semibold text-gray-700">Paiement sécurisé</p>
                </div>
                {product.fait_sur_mesure && (
                  <div className="text-center">
                    <div className="w-14 h-14 bg-white rounded-full flex items-center justify-center mx-auto mb-2 shadow-md">
                      <Award className="h-7 w-7 text-purple-600" />
                    </div>
                    <p className="text-xs font-semibold text-gray-700">Sur mesure</p>
                  </div>
                )}
              </div>
            </div>
          </div>

          {product.description && (
            <div className="mt-8 bg-white rounded-3xl shadow-xl p-8">
              <h2 className="text-3xl font-bold mb-6 text-gray-900">Description</h2>
              <div className="prose prose-lg max-w-none text-gray-700 leading-relaxed">
                {product.description.split('\n').map((line, idx) => (
                  <p key={idx} className="mb-4">{line}</p>
                ))}
              </div>
            </div>
          )}

          {relatedProducts.length > 0 && (
            <div className="mt-12 mb-12">
              <div className="flex items-center justify-between mb-8">
                <h2 className="text-3xl font-bold text-gray-900">Vous aimerez aussi</h2>
                <span className="text-gray-500">{relatedProducts.length} produits</span>
              </div>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                {relatedProducts.map((related) => (
                  <div
                    key={related.id}
                    onClick={() => window.location.href = `/products/${related.slug}`}
                    className="group cursor-pointer bg-white rounded-2xl overflow-hidden shadow-lg hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-2"
                  >
                    <div className="aspect-[3/4] bg-gray-100 overflow-hidden relative">
                      <img
                        src={related.image}
                        alt={related.nom}
                        className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                      />
                      {related.prix_promo && (
                        <div className="absolute top-3 left-3 bg-red-500 text-white text-xs font-bold px-3 py-1 rounded-full shadow-lg">
                          -{Math.round(((related.prix - related.prix_promo) / related.prix) * 100)}%
                        </div>
                      )}
                    </div>
                    <div className="p-4">
                      <h3 className="font-semibold text-gray-900 line-clamp-2 group-hover:text-purple-600 transition-colors mb-2">
                        {related.nom}
                      </h3>
                      <div className="flex items-center gap-2">
                        <span className="text-lg font-bold text-purple-600">
                          {(related.prix_promo || related.prix).toLocaleString()} FCFA
                        </span>
                        {related.prix_promo && (
                          <span className="text-sm text-gray-400 line-through">
                            {related.prix.toLocaleString()}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      {showZoom && (
        <div 
          className="fixed inset-0 bg-black/95 z-50 flex items-center justify-center p-4"
          onClick={() => setShowZoom(false)}
        >
          <button 
            onClick={(e) => {
              e.stopPropagation();
              setShowZoom(false);
            }}
            className="absolute top-4 right-4 w-12 h-12 bg-white rounded-full flex items-center justify-center hover:bg-gray-100 transition-colors z-10"
          >
            <X className="h-6 w-6" />
          </button>
          <img
            src={images[currentImageIndex]?.original || product.image || '/images/placeholder-product.jpg'}
            alt={product.nom}
            className="max-w-full max-h-full object-contain"
            onClick={(e) => e.stopPropagation()}
            onError={(e) => {
              e.target.onerror = null;
              e.target.src = '/images/placeholder-product.jpg';
            }}
          />
        </div>
      )}

      <style>{`
        @keyframes gradient {
          0% { background-position: 0% 50%; }
          50% { background-position: 100% 50%; }
          100% { background-position: 0% 50%; }
        }
        .animate-gradient {
          animation: gradient 3s ease infinite;
        }
        .line-clamp-2 {
          display: -webkit-box;
          -webkit-line-clamp: 2;
          -webkit-box-orient: vertical;
          overflow: hidden;
        }
      `}</style>
    </div>
  );
};

export default ProductDetailPage;