import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ShoppingBag, Trash2, Plus, Minus, Tag, Truck, ArrowRight, ArrowLeft, Loader2, Check } from 'lucide-react';
import toast from 'react-hot-toast';
import { useCartStore } from '../stores/cartStore';
import LazyImage from '../components/LazyImage';
import Navbar from '../components/Navbar';

import api from '../utils/api';

// Si le Footer n'est pas exporté séparément, on utilise une version simplifiée ici pour l'exemple
// (Assurez-vous d'importer votre vrai composant Footer si vous l'avez séparé)
const SimpleFooter = ({ onNavigate }) => (
  <footer className="bg-stone-100 pt-20 pb-10 text-neutral-600 text-sm border-t border-neutral-200 mt-auto">
    <div className="max-w-7xl mx-auto px-4 text-center">
      <p>&copy; {new Date().getFullYear()} VIVIAS SHOP. Tous droits réservés.</p>
    </div>
  </footer>
);

const CartPage = () => {
  const navigate = useNavigate();
  
  // Store du panier
  const {
    items,
    count,
    subtotal,
    discount,
    shipping,
    total,
    coupon,
    isLoading,
    syncCart,
    updateItem,
    removeItem,
    applyCoupon,
    removeCoupon,
  } = useCartStore();

  const [couponCode, setCouponCode] = useState('');
  const [isApplyingCoupon, setIsApplyingCoupon] = useState(false);
  
  // États pour la Navbar (Catégories & Wishlist)
  const [categories, setCategories] = useState([]);
  const [wishlistCount, setWishlistCount] = useState(0);
  const [navLoading, setNavLoading] = useState(true);

  // Synchronisation Panier
  useEffect(() => {
    syncCart();
  }, [syncCart]);

  // Chargement des données pour la Navbar (Categories, Wishlist)
  useEffect(() => {
    const loadNavData = async () => {
      try {
        const [catRes, wishRes] = await Promise.all([
          api.getCategories(),
          api.getWishlistCount()
        ]);
        if (catRes.success) setCategories(catRes.data || []);
        if (wishRes.success) setWishlistCount(wishRes.data.count || 0);
      } catch (error) {
        console.error("Erreur chargement nav:", error);
      } finally {
        setNavLoading(false);
      }
    };
    loadNavData();
  }, []);

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

  const handleUpdateQuantity = async (itemId, currentQty, change) => {
    const newQty = currentQty + change;
    if (newQty < 1) return;
    try {
      await updateItem(itemId, newQty);
      // Toast supprimé pour plus de fluidité ou remplacé par un mini feedback visuel
    } catch (error) {
      toast.error('Erreur lors de la mise à jour');
    }
  };

  const handleRemoveItem = async (itemId) => {
    if(window.confirm("Voulez-vous retirer cet article ?")) {
      try {
        await removeItem(itemId);
        toast.success('Article retiré');
      } catch (error) {
        toast.error('Erreur lors de la suppression');
      }
    }
  };

  const handleApplyCoupon = async () => {
    if (!couponCode.trim()) return toast.error('Entrez un code');
    setIsApplyingCoupon(true);
    try {
      const response = await applyCoupon(couponCode);
      if (response.success) {
        toast.success('Code promo appliqué !');
        setCouponCode('');
      } else {
        toast.error(response.message || 'Code invalide');
      }
    } catch (error) {
      toast.error('Erreur code promo');
    } finally {
      setIsApplyingCoupon(false);
    }
  };

  const handleRemoveCoupon = async () => {
    try {
      await removeCoupon();
      toast.success('Code promo retiré');
    } catch (error) { toast.error('Erreur'); }
  };

  // Loader Global
  if ((isLoading && items.length === 0) || navLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#FDFBF7]">
        <Loader2 className="w-10 h-10 animate-spin text-neutral-300" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#FDFBF7] text-[#1A1A1A] font-sans selection:bg-black selection:text-white flex flex-col">
      
      {/* 1. NAVBAR (Intégrée avec les données du store pour le panier) */}
      <Navbar 
        cartCount={count} // Vient directement du store useCartStore
        wishlistCount={wishlistCount}
        categories={categories}
        onNavigate={handleNavigation}
      />

      {/* TITRE DE PAGE */}
      <div className="pt-8 pb-4 border-b border-neutral-200">
        <div className="max-w-7xl mx-auto px-4 text-center">
          <h1 className="text-2xl md:text-3xl font-light uppercase tracking-[0.2em]">
            Mon Panier <span className="text-neutral-400 text-lg align-top">({count})</span>
          </h1>
        </div>
      </div>

      <main className="flex-grow max-w-[1400px] mx-auto px-4 md:px-8 py-12 w-full">
        
        {/* CAS : PANIER VIDE */}
        {items.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 animate-fade-in">
            <ShoppingBag className="h-16 w-16 text-neutral-200 mb-6 stroke-1" />
            <h2 className="text-xl font-bold uppercase tracking-widest mb-4">Votre panier est vide</h2>
            <p className="text-neutral-500 mb-8 font-light">Il semblerait que vous n'ayez pas encore fait votre choix.</p>
            <button
              onClick={() => navigate('/')}
              className="bg-black text-white px-10 py-4 text-xs font-bold uppercase tracking-widest hover:bg-neutral-800 transition-all"
            >
              Commencer le shopping
            </button>
          </div>
        ) : (
          /* CAS : PANIER REMPLI */
          <div className="flex flex-col lg:flex-row gap-12 xl:gap-20">
            
            {/* GAUCHE : LISTE DES ARTICLES */}
            <div className="flex-1 space-y-8">
              {items.map((item) => (
                <div key={item.id} className="group flex gap-6 py-6 border-b border-neutral-100 last:border-0 relative">
                  
                  {/* Image Produit */}
                  <div className="w-28 h-36 md:w-36 md:h-48 flex-shrink-0 bg-neutral-100 overflow-hidden cursor-pointer" onClick={() => navigate(`/products/${item.product?.slug}`)}>
                    <LazyImage
                      src={item.product?.image || '/images/placeholder-product.jpg'}
                      alt={item.product?.nom}
                      className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                    />
                  </div>

                  {/* Détails */}
                  <div className="flex-1 flex flex-col justify-between">
                    <div>
                      <div className="flex justify-between items-start mb-2">
                        <h3 className="font-bold uppercase tracking-wide text-sm md:text-base cursor-pointer hover:underline underline-offset-4" onClick={() => navigate(`/products/${item.product?.slug}`)}>
                          {item.product?.nom}
                        </h3>
                        <div className="font-medium text-sm md:text-base">
                          {((item.prix_unitaire || item.product?.prix || 0) * item.quantite).toLocaleString()} FCFA
                        </div>
                      </div>

                      <div className="text-xs text-neutral-500 space-y-1 font-light uppercase tracking-wide mb-4">
                        {item.options?.taille && <p>Taille : <span className="text-black font-medium">{item.options.taille}</span></p>}
                        {item.options?.couleur && <p>Couleur : <span className="text-black font-medium">{item.options.couleur}</span></p>}
                      </div>
                    </div>

                    <div className="flex items-center justify-between">
                      {/* Sélecteur Quantité Minimaliste */}
                      <div className="flex items-center border border-neutral-200 h-10 w-28">
                        <button
                          onClick={() => handleUpdateQuantity(item.id, item.quantite, -1)}
                          disabled={item.quantite <= 1}
                          className="w-8 h-full flex items-center justify-center hover:bg-neutral-50 disabled:opacity-30 transition-colors"
                        >
                          <Minus className="h-3 w-3" />
                        </button>
                        <div className="flex-1 text-center text-sm font-bold">{item.quantite}</div>
                        <button
                          onClick={() => handleUpdateQuantity(item.id, item.quantite, 1)}
                          className="w-8 h-full flex items-center justify-center hover:bg-neutral-50 transition-colors"
                        >
                          <Plus className="h-3 w-3" />
                        </button>
                      </div>

                      <button
                        onClick={() => handleRemoveItem(item.id)}
                        className="text-[10px] uppercase font-bold tracking-widest text-neutral-400 hover:text-red-600 transition-colors border-b border-transparent hover:border-red-600 pb-0.5"
                      >
                        Supprimer
                      </button>
                    </div>
                  </div>
                </div>
              ))}
              
              <button 
                 onClick={() => navigate('/')}
                 className="flex items-center gap-2 text-xs font-bold uppercase tracking-widest hover:text-neutral-500 mt-8"
              >
                 <ArrowLeft className="w-4 h-4" /> Continuer mes achats
              </button>
            </div>

            {/* DROITE : RÉSUMÉ (Sticky) */}
            <div className="lg:w-[400px] flex-shrink-0">
               <div className="bg-white p-8 border border-neutral-100 lg:sticky lg:top-24">
                  <h2 className="text-lg font-bold uppercase tracking-widest mb-8 pb-4 border-b border-black">Résumé</h2>

                  {/* Code Promo */}
                  <div className="mb-8">
                     <p className="text-xs uppercase font-bold tracking-widest mb-3 text-neutral-500">Code Promotionnel</p>
                     {!coupon ? (
                        <div className="flex gap-2">
                           <input
                             type="text"
                             value={couponCode}
                             onChange={(e) => setCouponCode(e.target.value)}
                             placeholder="CODE"
                             className="flex-1 bg-neutral-50 border border-neutral-200 px-4 py-3 text-xs uppercase focus:outline-none focus:border-black transition-colors"
                           />
                           <button 
                             onClick={handleApplyCoupon}
                             disabled={isApplyingCoupon}
                             className="bg-black text-white px-4 py-3 text-xs font-bold uppercase tracking-widest hover:bg-neutral-800 disabled:opacity-50"
                           >
                              OK
                           </button>
                        </div>
                     ) : (
                        <div className="flex items-center justify-between bg-green-50 px-4 py-3 border border-green-100">
                           <div className="flex items-center gap-2 text-green-800 text-xs font-bold uppercase">
                              <Tag className="w-3 h-3" /> {coupon.code}
                           </div>
                           <button onClick={handleRemoveCoupon} className="text-green-800 hover:text-red-600">
                              <Trash2 className="w-3 h-3" />
                           </button>
                        </div>
                     )}
                  </div>

                  {/* Totaux */}
                  <div className="space-y-4 text-sm mb-8">
                     <div className="flex justify-between text-neutral-600">
                        <span>Sous-total</span>
                        <span>{subtotal.toLocaleString()} FCFA</span>
                     </div>
                     
                     {discount > 0 && (
                        <div className="flex justify-between text-green-600">
                           <span>Remise</span>
                           <span>- {discount.toLocaleString()} FCFA</span>
                        </div>
                     )}

                     <div className="flex justify-between text-neutral-600 items-center">
                        <span className="flex items-center gap-2"><Truck className="w-4 h-4" /> Livraison</span>
                        <span className="uppercase text-xs font-bold">
                           {shipping === 0 ? 'Gratuite' : `${shipping.toLocaleString()} FCFA`}
                        </span>
                     </div>
                  </div>

                  <div className="flex justify-between items-center text-lg font-bold border-t border-dashed border-neutral-300 pt-6 mb-8">
                     <span>Total</span>
                     <span>{total.toLocaleString()} FCFA</span>
                  </div>

                  {/* Bouton Checkout */}
                  <button
                    onClick={() => navigate('/checkout')}
                    className="w-full bg-black text-white py-4 text-xs font-bold uppercase tracking-[0.2em] hover:bg-neutral-800 transition-all flex items-center justify-center gap-4 group"
                  >
                    Paiement <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                  </button>

                  <div className="mt-6 flex flex-col gap-3 text-[10px] text-neutral-400 uppercase tracking-widest text-center">
                     <span className="flex items-center justify-center gap-2"><Check className="w-3 h-3" /> Paiement Sécurisé</span>
                     <span className="flex items-center justify-center gap-2"><Check className="w-3 h-3" /> Retours sous 30 jours</span>
                  </div>
               </div>
            </div>

          </div>
        )}
      </main>

      {/* FOOTER */}
      {/* Remplacez SimpleFooter par votre composant Footer réel importé en haut */}
      <SimpleFooter onNavigate={handleNavigation} />
    </div>
  );
};

export default CartPage;