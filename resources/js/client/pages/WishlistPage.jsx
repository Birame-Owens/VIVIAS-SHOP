import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Heart, ShoppingCart, Trash2, Loader2, ArrowLeft } from 'lucide-react';
import toast from 'react-hot-toast';
import LazyImage from '../components/LazyImage';
import Navbar from '../components/Navbar';
import api from '../utils/api';

const SimpleFooter = ({ onNavigate }) => (
  <footer className="bg-stone-100 pt-20 pb-10 text-neutral-600 text-sm border-t border-neutral-200 mt-auto">
    <div className="max-w-7xl mx-auto px-4 text-center">
      <p>&copy; {new Date().getFullYear()} VIVIAS SHOP. Tous droits réservés.</p>
    </div>
  </footer>
);

const WishlistPage = () => {
  const navigate = useNavigate();
  
  const [wishlistItems, setWishlistItems] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isProcessing, setIsProcessing] = useState(false);
  
  // États pour la Navbar
  const [categories, setCategories] = useState([]);
  const [cartCount, setCartCount] = useState(0);
  const [navLoading, setNavLoading] = useState(true);

  // Charger la wishlist
  useEffect(() => {
    loadWishlist();
  }, []);

  // Chargement des données pour la Navbar
  useEffect(() => {
    const loadNavData = async () => {
      try {
        const [catRes, cartRes] = await Promise.all([
          api.getCategories(),
          api.getCartCount()
        ]);
        if (catRes.success) setCategories(catRes.data || []);
        if (cartRes.success) setCartCount(cartRes.data.count || 0);
      } catch (error) {
        console.error("Erreur chargement nav:", error);
      } finally {
        setNavLoading(false);
      }
    };
    loadNavData();
  }, []);

  const loadWishlist = async () => {
    try {
      setIsLoading(true);
      const response = await api.getWishlist();
      if (response.success) {
        setWishlistItems(response.data.items || []);
      }
    } catch (error) {
      console.error("Erreur chargement wishlist:", error);
      toast.error("Erreur lors du chargement");
    } finally {
      setIsLoading(false);
    }
  };

  const handleNavigation = (type, slug = null) => {
    const routes = {
      home: '/',
      category: `/categories/${slug}`,
      product: `/products/${slug}`,
      cart: '/cart',
      wishlist: '/wishlist',
      shop: '/shop'
    };
    if (routes[type]) window.location.href = routes[type];
  };

  const handleRemoveItem = async (productId) => {
    if (!window.confirm("Retirer cet article de vos favoris ?")) return;
    
    try {
      setIsProcessing(true);
      const response = await api.removeFromWishlist(productId);
      if (response.success) {
        setWishlistItems(prev => prev.filter(item => item.product.id !== productId));
        toast.success('Article retiré des favoris');
      }
    } catch (error) {
      toast.error('Erreur lors de la suppression');
    } finally {
      setIsProcessing(false);
    }
  };

  const handleMoveToCart = async (productId) => {
    try {
      setIsProcessing(true);
      const response = await api.moveWishlistItemToCart(productId);
      if (response.success) {
        setWishlistItems(prev => prev.filter(item => item.product.id !== productId));
        setCartCount(prev => prev + 1);
        toast.success('Article ajouté au panier');
      }
    } catch (error) {
      toast.error('Erreur lors de l\'ajout au panier');
    } finally {
      setIsProcessing(false);
    }
  };

  const handleClearWishlist = async () => {
    if (!window.confirm("Vider tous vos favoris ?")) return;
    
    try {
      setIsProcessing(true);
      const response = await api.clearWishlist();
      if (response.success) {
        setWishlistItems([]);
        toast.success('Favoris vidés');
      }
    } catch (error) {
      toast.error('Erreur');
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-neutral-50">
      <Navbar
        categories={categories}
        cartCount={cartCount}
        wishlistCount={wishlistItems.length}
        onNavigate={handleNavigation}
        loading={navLoading}
      />

      <main className="flex-grow">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {/* En-tête */}
          <div className="mb-8">
            <button
              onClick={() => navigate(-1)}
              className="flex items-center gap-2 text-neutral-600 hover:text-neutral-900 mb-4 transition-colors"
            >
              <ArrowLeft size={20} />
              <span>Retour</span>
            </button>
            
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
              <div>
                <h1 className="text-2xl sm:text-3xl font-bold text-neutral-900">Mes Favoris</h1>
                <p className="text-sm sm:text-base text-neutral-600 mt-1 sm:mt-2">
                  {wishlistItems.length} {wishlistItems.length > 1 ? 'articles' : 'article'}
                </p>
              </div>

              {wishlistItems.length > 0 && (
                <button
                  onClick={handleClearWishlist}
                  disabled={isProcessing}
                  className="w-full sm:w-auto px-4 py-2 text-sm text-red-600 hover:bg-red-50 rounded-lg transition-colors disabled:opacity-50"
                >
                  Tout vider
                </button>
              )}
            </div>
          </div>

          {/* Chargement */}
          {isLoading ? (
            <div className="flex justify-center items-center py-20">
              <Loader2 className="animate-spin text-neutral-400" size={48} />
            </div>
          ) : wishlistItems.length === 0 ? (
            /* Wishlist vide */
            <div className="bg-white rounded-lg shadow-sm p-12 text-center">
              <Heart size={64} className="mx-auto text-neutral-300 mb-4" />
              <h2 className="text-2xl font-semibold text-neutral-900 mb-2">
                Votre liste de favoris est vide
              </h2>
              <p className="text-neutral-600 mb-6">
                Ajoutez vos articles préférés pour les retrouver facilement
              </p>
              <button
                onClick={() => handleNavigation('shop')}
                className="px-6 py-3 bg-neutral-900 text-white rounded-lg hover:bg-neutral-800 transition-colors"
              >
                Découvrir nos produits
              </button>
            </div>
          ) : (
            /* Liste des favoris */
            <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-4 md:gap-6">
              {wishlistItems.map((item) => (
                <div
                  key={item.product.id}
                  className="bg-white rounded-lg shadow-sm overflow-hidden hover:shadow-md transition-shadow group"
                >
                  {/* Image */}
                  <div
                    className="relative aspect-square cursor-pointer overflow-hidden bg-neutral-100"
                    onClick={() => handleNavigation('product', item.product.slug)}
                  >
                    <LazyImage
                      src={item.product.image}
                      alt={item.product.nom}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                    
                    {/* Badge promo */}
                    {item.product.prix_promo && (
                      <div className="absolute top-2 right-2 bg-red-500 text-white px-2 py-0.5 sm:px-3 sm:py-1 rounded-full text-xs sm:text-sm font-semibold">
                        -{Math.round(((item.product.prix - item.product.prix_promo) / item.product.prix) * 100)}%
                      </div>
                    )}
                  </div>

                  {/* Informations */}
                  <div className="p-3 sm:p-4">
                    <h3
                      className="font-semibold text-sm sm:text-base text-neutral-900 mb-2 line-clamp-2 cursor-pointer hover:text-neutral-700"
                      onClick={() => handleNavigation('product', item.product.slug)}
                    >
                      {item.product.nom}
                    </h3>

                    {/* Prix */}
                    <div className="mb-3 sm:mb-4">
                      {item.product.prix_promo ? (
                        <div className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-2">
                          <span className="text-base sm:text-lg font-bold text-red-600">
                            {item.product.prix_promo.toLocaleString()} F
                          </span>
                          <span className="text-xs sm:text-sm text-neutral-500 line-through">
                            {item.product.prix.toLocaleString()} F
                          </span>
                        </div>
                      ) : (
                        <span className="text-base sm:text-lg font-bold text-neutral-900">
                          {item.product.prix.toLocaleString()} FCFA
                        </span>
                      )}
                    </div>

                    {/* Actions */}
                    <div className="flex flex-col sm:flex-row gap-2">
                      <button
                        onClick={() => handleMoveToCart(item.product.id)}
                        disabled={isProcessing || !item.product.en_stock}
                        className="flex-1 flex items-center justify-center gap-2 px-3 sm:px-4 py-2 bg-neutral-900 text-white rounded-lg hover:bg-neutral-800 transition-colors disabled:opacity-50 disabled:cursor-not-allowed text-xs sm:text-sm"
                      >
                        <ShoppingCart size={16} className="sm:w-[18px] sm:h-[18px]" />
                        <span className="font-medium">
                          {item.product.en_stock ? 'Ajouter' : 'Rupture'}
                        </span>
                      </button>
                      
                      <button
                        onClick={() => handleRemoveItem(item.product.id)}
                        disabled={isProcessing}
                        className="sm:flex-shrink-0 p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors disabled:opacity-50"
                        title="Retirer des favoris"
                      >
                        <Trash2 size={18} className="sm:w-5 sm:h-5" />
                      </button>
                    </div>

                    {/* Date d'ajout */}
                    <p className="text-xs text-neutral-500 mt-2">
                      Ajouté le {new Date(item.added_at).toLocaleDateString('fr-FR')}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </main>

      <SimpleFooter onNavigate={handleNavigation} />
    </div>
  );
};

export default WishlistPage;
