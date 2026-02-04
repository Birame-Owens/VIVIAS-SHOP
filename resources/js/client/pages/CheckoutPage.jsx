import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { CreditCard, Smartphone, User, MapPin, Mail, Phone, Lock, ChevronRight, Check, Loader2, ArrowLeft } from 'lucide-react';
import { useForm } from 'react-hook-form';
import toast from 'react-hot-toast';
import { useAuth } from '../contexts/AuthContext';
import AuthModal from '../components/AuthModal';
import { useCartStore } from '../stores/cartStore';
import Navbar from '../components/Navbar';
import api from '../utils/api';

// Composant Footer Simplifié (ou importez le vôtre)
const SimpleFooter = () => (
  <footer className="bg-stone-100 pt-10 pb-10 text-neutral-600 text-xs border-t border-neutral-200 mt-auto text-center uppercase tracking-widest">
    <p>&copy; {new Date().getFullYear()} VIVIAS SHOP. Tous droits réservés.</p>
  </footer>
);

const CheckoutPage = () => {
  const navigate = useNavigate();
  const { user: authUser, isAuthenticated, checkAuth } = useAuth();
  const { items, total, subtotal, shipping, discount, coupon, syncCart, clearCart } = useCartStore();
  const [isProcessing, setIsProcessing] = useState(false);
  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState('stripe');
  const [authModalOpen, setAuthModalOpen] = useState(false);
  const [errorMessage, setErrorMessage] = useState(null);
  
  // États pour la Navbar
  const [categories, setCategories] = useState([]);
  const [wishlistCount, setWishlistCount] = useState(0);
  const [cartCount, setCartCount] = useState(0);
  const [loadingNav, setLoadingNav] = useState(true);

  const { register, handleSubmit, formState: { errors }, setValue } = useForm();

  // Pré-remplir le formulaire si l'utilisateur est connecté
  useEffect(() => {
    if (isAuthenticated && authUser) {
      // L'API retourne authUser.client avec toutes les données
      const clientData = authUser.client || authUser;
      
      // Nom et prénom
      setValue('nom', clientData.nom || '');
      setValue('prenom', clientData.prenom || '');
      
      // Contact
      setValue('email', clientData.email || authUser.email || '');
      setValue('telephone', clientData.telephone || '');
      
      // Adresse
      setValue('ville', clientData.ville || '');
      setValue('adresse', clientData.adresse_principale || '');
    }
  }, [isAuthenticated, authUser, setValue]);

  // 1. Initialisation et Chargement Navbar
  useEffect(() => {
    syncCart();
    setCartCount(items.length); // Mise à jour locale du compteur

    const initData = async () => {
      try {
        // Chargement Navbar en parallèle
        const [catRes, wishRes] = await Promise.all([
          api.getCategories(),
          api.getWishlistCount()
        ]);

        if (catRes.success) setCategories(catRes.data || []);
        if (wishRes.success) setWishlistCount(wishRes.data.count || 0);

      } catch (error) {
        console.error("Erreur init checkout:", error);
      } finally {
        setLoadingNav(false);
      }
    };

    initData();
  }, [syncCart, items.length, isAuthenticated]);

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

  const onSubmit = async (data) => {
    if (items.length === 0) {
      toast.error('Votre panier est vide');
      return;
    }

    setIsProcessing(true);

    try {
      // Préparer les données de commande
      const orderData = {
        customer: {
          nom: data.nom,
          prenom: data.prenom,
          email: data.email,
          telephone: data.telephone,
          adresse_livraison: data.adresse,
          ville: data.ville,
          code_postal: data.code_postal,
          pays: 'Sénégal'
        },
        items: items.map(item => ({
          product_id: item.product?.id || item.product_id || item.produit_id || item.id,
          quantity: item.quantite || item.quantity || 1,
          options: {
            taille: item.taille,
            couleur: item.couleur,
            ...item.options
          }
        })),
        coupon_code: coupon?.code,
        notes: data.notes
      };

      // Créer la commande
      const orderResponse = await fetch('/api/client/checkout/create-order', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-CSRF-TOKEN': document.querySelector('meta[name="csrf-token"]')?.content
        },
        credentials: 'include',
        body: JSON.stringify(orderData)
      });

      const orderResult = await orderResponse.json();

      if (!orderResult.success) {
        const errorMessage = orderResult.message || 'Erreur lors de la création de la commande';
        const error = new Error(errorMessage);
        error.type = orderResult.type; // 'validation' ou 'server_error'
        throw error;
      }

      const commande = orderResult.data.commande;

      // ✅ Si compte créé automatiquement, stocker le token
      if (orderResult.auth && orderResult.auth.token) {
        localStorage.setItem('auth_token', orderResult.auth.token);
        localStorage.setItem('user', JSON.stringify(orderResult.auth.user));
        
        console.log('✅ Utilisateur connecté automatiquement:', orderResult.auth.user.email);
        
        toast.success('🎉 Compte créé ! Vous êtes maintenant connecté.', { duration: 3000 });
        
        // Vider le panier localement
        clearCart();
        
        // Forcer rechargement pour actualiser le contexte d'authentification
        await checkAuth();
      } else {
        // Vérifier l'authentification
        await checkAuth();
      }

      // Initier le paiement
      const paymentResponse = await fetch(`/api/client/checkout/payment/${commande.numero_commande}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-CSRF-TOKEN': document.querySelector('meta[name="csrf-token"]')?.content
        },
        credentials: 'include',
        body: JSON.stringify({
          provider: selectedPaymentMethod,
          phone: data.telephone
        })
      });

      const paymentResult = await paymentResponse.json();

      if (!paymentResult.success) {
        throw new Error(paymentResult.message || 'Erreur lors du paiement');
      }

      // Rediriger vers la page de paiement
      if (paymentResult.payment_url && paymentResult.payment_url !== '#') {
        window.location.href = paymentResult.payment_url;
      } else {
        toast.success('Commande créée !');
        navigate(`/checkout/success?order=${commande.numero_commande}`);
      }

    } catch (error) {
      console.error('Erreur checkout:', error);
      
      // Vérifier si c'est une erreur "email déjà utilisé"
      if (error.message && error.message.includes('compte existe déjà')) {
        const errorMsg = 'Cet email est déjà utilisé. Veuillez vous connecter ou utilisez un autre email.';
        setErrorMessage(errorMsg);
        
        toast.error(
          <div>
            <p className="font-bold">⚠️ Email déjà utilisé</p>
            <p className="text-sm">Veuillez vous connecter pour continuer votre commande.</p>
          </div>,
          { duration: 8000 }
        );
        
        // Ouvrir la modale de connexion après 2 secondes
        setTimeout(() => {
          setAuthModalOpen(true);
        }, 2000);
      } else {
        const errorMsg = error.message || 'Une erreur est survenue lors de la commande';
        setErrorMessage(errorMsg);
        toast.error(errorMsg, { duration: 6000 });
      }
    } finally {
      setIsProcessing(false);
    }
  };

  // Loader Global
  if (loadingNav) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#FDFBF7]">
        <Loader2 className="w-10 h-10 animate-spin text-neutral-300" />
      </div>
    );
  }

  // Panier vide
  if (items.length === 0) {
    return (
      <div className="min-h-screen bg-[#FDFBF7] flex flex-col">
        <Navbar cartCount={0} wishlistCount={wishlistCount} categories={categories} onNavigate={handleNavigation} />
        <div className="flex-1 flex flex-col items-center justify-center p-4">
          <h2 className="text-xl font-bold uppercase tracking-widest mb-6">Votre panier est vide</h2>
          <button
            onClick={() => navigate('/shop')}
            className="bg-black text-white px-8 py-4 text-xs font-bold uppercase tracking-widest hover:bg-neutral-800"
          >
            Retour à la boutique
          </button>
        </div>
        <SimpleFooter />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#FDFBF7] text-[#1A1A1A] font-sans selection:bg-black selection:text-white flex flex-col">
      <Navbar 
        cartCount={cartCount} 
        wishlistCount={wishlistCount} 
        categories={categories} 
        onNavigate={handleNavigation} 
      />

      <div className="pt-8 pb-4 border-b border-neutral-200">
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex items-center gap-2 text-[10px] md:text-xs uppercase tracking-widest text-neutral-400 mb-2">
            <span className="cursor-pointer hover:text-black" onClick={() => navigate('/cart')}>Panier</span>
            <ChevronRight className="w-3 h-3" />
            <span className="text-black font-bold">Paiement</span>
            <ChevronRight className="w-3 h-3" />
            <span>Confirmation</span>
          </div>
          <h1 className="text-2xl md:text-3xl font-light uppercase tracking-[0.15em]">Validation de commande</h1>
        </div>
      </div>

      <main className="flex-grow max-w-[1400px] mx-auto px-4 md:px-8 py-12 w-full">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-12 xl:gap-20">
          
          {/* GAUCHE : FORMULAIRE */}
          <div className="lg:col-span-2 space-y-12">
            
            {/* Message d'erreur visible */}
            {errorMessage && (
              <div className="bg-red-50 border-2 border-red-500 p-6 rounded-sm">
                <div className="flex items-start gap-3">
                  <div className="flex-shrink-0">
                    <svg className="w-6 h-6 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                    </svg>
                  </div>
                  <div className="flex-1">
                    <h3 className="text-sm font-bold text-red-800 uppercase tracking-wider mb-2">Erreur</h3>
                    <p className="text-sm text-red-700">{errorMessage}</p>
                    {errorMessage.includes('email') && (
                      <button
                        type="button"
                        onClick={() => { setErrorMessage(null); setAuthModalOpen(true); }}
                        className="mt-3 text-xs font-bold uppercase tracking-widest text-red-800 hover:text-red-900 underline"
                      >
                        Se connecter maintenant
                      </button>
                    )}
                  </div>
                  <button
                    type="button"
                    onClick={() => setErrorMessage(null)}
                    className="flex-shrink-0 text-red-500 hover:text-red-700"
                  >
                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>
              </div>
            )}

            {/* Login / Guest Block */}
            {!isAuthenticated && (
              <div className="bg-white border border-neutral-200 p-8 flex flex-col md:flex-row items-center justify-between gap-6">
                <div>
                  <h2 className="text-sm font-bold uppercase tracking-widest mb-1">Déjà client ?</h2>
                  <p className="text-xs text-neutral-500">Connectez-vous pour récupérer vos adresses.</p>
                </div>
                <div className="flex gap-4 w-full md:w-auto">
                  <button
                    type="button"
                    onClick={() => setAuthModalOpen(true)}
                    className="flex-1 md:flex-none px-6 py-3 border border-black text-black text-xs font-bold uppercase tracking-widest hover:bg-black hover:text-white transition-colors touch-manipulation"
                  >
                    Se connecter
                  </button>
                </div>
              </div>
            )}

            <form onSubmit={handleSubmit(onSubmit)} className="space-y-12">
              
              {/* 1. INFORMATIONS PERSONNELLES */}
              <div className="space-y-6">
                <div className="flex items-center gap-3 border-b border-neutral-200 pb-4">
                   <User className="h-5 w-5 text-neutral-400" />
                   <h2 className="text-lg font-bold uppercase tracking-widest">Informations</h2>
                </div>

                {isAuthenticated && (
                  <div className="bg-neutral-50 border border-neutral-200 px-4 py-3 rounded-sm">
                    <p className="text-xs text-neutral-600">
                      <Check className="inline h-3 w-3 mr-1 text-green-600" />
                      Vos informations de compte sont pré-remplies. Pour les modifier, rendez-vous sur votre{' '}
                      <a href="/account" className="underline hover:text-black">profil</a>.
                    </p>
                  </div>
                )}

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <label className="text-[10px] font-bold uppercase tracking-widest text-neutral-500">Nom</label>
                    <input
                      {...register('nom', { required: 'Requis' })}
                      type="text"
                      disabled={isAuthenticated}
                      className="w-full bg-white border border-neutral-200 px-4 py-3 text-sm focus:outline-none focus:border-black transition-colors rounded-none placeholder-neutral-300 disabled:bg-neutral-50 disabled:text-neutral-500"
                      placeholder="DIOP"
                    />
                    {errors.nom && <p className="text-red-500 text-xs mt-1">{errors.nom.message}</p>}
                  </div>

                  <div className="space-y-2">
                    <label className="text-[10px] font-bold uppercase tracking-widest text-neutral-500">Prénom</label>
                    <input
                      {...register('prenom', { required: 'Requis' })}
                      type="text"
                      disabled={isAuthenticated}
                      className="w-full bg-white border border-neutral-200 px-4 py-3 text-sm focus:outline-none focus:border-black transition-colors rounded-none placeholder-neutral-300 disabled:bg-neutral-50 disabled:text-neutral-500"
                      placeholder="Amadou"
                    />
                    {errors.prenom && <p className="text-red-500 text-xs mt-1">{errors.prenom.message}</p>}
                  </div>

                  <div className="space-y-2">
                    <label className="text-[10px] font-bold uppercase tracking-widest text-neutral-500">Email</label>
                    <input
                      {...register('email', { required: 'Requis', pattern: { value: /^\S+@\S+$/i, message: 'Invalide' } })}
                      type="email"
                      disabled={isAuthenticated}
                      className="w-full bg-white border border-neutral-200 px-4 py-3 text-sm focus:outline-none focus:border-black transition-colors rounded-none placeholder-neutral-300 disabled:bg-neutral-50 disabled:text-neutral-500"
                      placeholder="email@exemple.com"
                    />
                    {errors.email && <p className="text-red-500 text-xs mt-1">{errors.email.message}</p>}
                  </div>

                  <div className="space-y-2">
                    <label className="text-[10px] font-bold uppercase tracking-widest text-neutral-500">Téléphone</label>
                    <input
                      {...register('telephone', { required: 'Requis', pattern: { value: /^[0-9+ ]{9,15}$/, message: 'Invalide' } })}
                      type="tel"
                      disabled={isAuthenticated}
                      className="w-full bg-white border border-neutral-200 px-4 py-3 text-sm focus:outline-none focus:border-black transition-colors rounded-none placeholder-neutral-300 disabled:bg-neutral-50 disabled:text-neutral-500"
                      placeholder="77 000 00 00"
                    />
                    {errors.telephone && <p className="text-red-500 text-xs mt-1">{errors.telephone.message}</p>}
                  </div>
                </div>
              </div>

              {/* 2. ADRESSE DE LIVRAISON */}
              <div className="space-y-6">
                <div className="flex items-center gap-3 border-b border-neutral-200 pb-4">
                   <MapPin className="h-5 w-5 text-neutral-400" />
                   <h2 className="text-lg font-bold uppercase tracking-widest">Livraison</h2>
                </div>

                <div className="space-y-6">
                  <div className="space-y-2">
                    <label className="text-[10px] font-bold uppercase tracking-widest text-neutral-500">Adresse complète</label>
                    <textarea
                      {...register('adresse', { required: 'Requis' })}
                      rows={2}
                      className="w-full bg-white border border-neutral-200 px-4 py-3 text-sm focus:outline-none focus:border-black transition-colors rounded-none placeholder-neutral-300"
                      placeholder="Quartier, Rue, Numéro de porte..."
                    />
                    {errors.adresse && <p className="text-red-500 text-xs mt-1">{errors.adresse.message}</p>}
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <label className="text-[10px] font-bold uppercase tracking-widest text-neutral-500">Ville</label>
                      <input
                        {...register('ville', { required: 'Requis' })}
                        type="text"
                        className="w-full bg-white border border-neutral-200 px-4 py-3 text-sm focus:outline-none focus:border-black transition-colors rounded-none"
                        placeholder="Dakar"
                      />
                      {errors.ville && <p className="text-red-500 text-xs mt-1">{errors.ville.message}</p>}
                    </div>
                    <div className="space-y-2">
                      <label className="text-[10px] font-bold uppercase tracking-widest text-neutral-500">Code Postal (Optionnel)</label>
                      <input
                        {...register('code_postal')}
                        type="text"
                        className="w-full bg-white border border-neutral-200 px-4 py-3 text-sm focus:outline-none focus:border-black transition-colors rounded-none"
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <label className="text-[10px] font-bold uppercase tracking-widest text-neutral-500">Note de livraison (Optionnel)</label>
                    <textarea
                      {...register('notes')}
                      rows={2}
                      className="w-full bg-white border border-neutral-200 px-4 py-3 text-sm focus:outline-none focus:border-black transition-colors rounded-none placeholder-neutral-300"
                      placeholder="Instructions spécifiques pour le livreur..."
                    />
                  </div>
                </div>
              </div>

              {/* 3. PAIEMENT */}
              <div className="space-y-6">
                <div className="flex items-center gap-3 border-b border-neutral-200 pb-4">
                   <CreditCard className="h-5 w-5 text-neutral-400" />
                   <h2 className="text-lg font-bold uppercase tracking-widest">Paiement</h2>
                </div>

                <div className="grid grid-cols-1 gap-4">
                  {/* Stripe Card */}
                  <label className={`relative flex items-start gap-4 p-6 border cursor-pointer transition-all ${
                    selectedPaymentMethod === 'stripe' ? 'border-black bg-white shadow-sm' : 'border-neutral-200 bg-white hover:border-neutral-400'
                  }`}>
                    <input
                      type="radio"
                      name="payment"
                      value="stripe"
                      checked={selectedPaymentMethod === 'stripe'}
                      onChange={(e) => setSelectedPaymentMethod(e.target.value)}
                      className="mt-1 w-4 h-4 text-black focus:ring-black border-gray-300"
                    />
                    <div className="flex-1">
                      <div className="flex justify-between items-center mb-1">
                        <span className="font-bold uppercase tracking-wider text-sm">Carte Bancaire</span>
                        <div className="flex gap-2">
                           <img src="/assets/images/visa.png" alt="Visa" className="h-5 object-contain" />
                           <img src="/assets/images/mastercard.jpg" alt="Mastercard" className="h-5 object-contain rounded-sm" />
                        </div>
                      </div>
                      <p className="text-xs text-neutral-500">Paiement sécurisé par Stripe (Visa, Mastercard).</p>
                    </div>
                  </label>

                  {/* Wave */}
                  <label className={`relative flex items-start gap-4 p-6 border cursor-pointer transition-all ${
                    selectedPaymentMethod === 'wave' ? 'border-black bg-white shadow-sm' : 'border-neutral-200 bg-white hover:border-neutral-400'
                  }`}>
                    <input
                      type="radio"
                      name="payment"
                      value="wave"
                      checked={selectedPaymentMethod === 'wave'}
                      onChange={(e) => setSelectedPaymentMethod(e.target.value)}
                      className="mt-1 w-4 h-4 text-black focus:ring-black border-gray-300"
                    />
                    <div className="flex-1">
                      <div className="flex justify-between items-center mb-1">
                        <span className="font-bold uppercase tracking-wider text-sm flex items-center gap-2">
                           Wave
                        </span>
                        <img src="/assets/images/wave logo.png" alt="Wave" className="h-6 object-contain" />
                      </div>
                      <p className="text-xs text-neutral-500">Paiement mobile via application Wave (PayTech).</p>
                    </div>
                  </label>

                  {/* Orange Money */}
                  <label className={`relative flex items-start gap-4 p-6 border cursor-pointer transition-all ${
                    selectedPaymentMethod === 'orange_money' ? 'border-black bg-white shadow-sm' : 'border-neutral-200 bg-white hover:border-neutral-400'
                  }`}>
                    <input
                      type="radio"
                      name="payment"
                      value="orange_money"
                      checked={selectedPaymentMethod === 'orange_money'}
                      onChange={(e) => setSelectedPaymentMethod(e.target.value)}
                      className="mt-1 w-4 h-4 text-black focus:ring-black border-gray-300"
                    />
                    <div className="flex-1">
                      <div className="flex justify-between items-center mb-1">
                        <span className="font-bold uppercase tracking-wider text-sm flex items-center gap-2">
                           Orange Money
                        </span>
                        <img src="/assets/images/orange-money.jpg" alt="Orange Money" className="h-6 object-contain rounded-sm" />
                      </div>
                      <p className="text-xs text-neutral-500">Paiement mobile sécurisé (PayTech).</p>
                    </div>
                  </label>
                </div>
              </div>

              <div className="pt-6">
                <button
                  type="submit"
                  disabled={isProcessing}
                  className="w-full bg-black text-white py-5 text-sm font-bold uppercase tracking-[0.2em] hover:bg-neutral-800 transition-all disabled:opacity-70 disabled:cursor-not-allowed flex items-center justify-center gap-3"
                >
                  {isProcessing ? (
                    <>
                      <Loader2 className="w-5 h-5 animate-spin" />
                      Traitement...
                    </>
                  ) : (
                    <>
                      <Lock className="w-4 h-4" />
                      Payer {total.toLocaleString()} FCFA
                    </>
                  )}
                </button>
                <p className="text-center text-[10px] text-neutral-400 mt-4 uppercase tracking-widest flex items-center justify-center gap-2">
                  <Lock className="w-3 h-3" /> Transaction cryptée SSL
                </p>
              </div>
            </form>
          </div>

          {/* DROITE : RÉCAPITULATIF STICKY */}
          <div className="lg:col-span-1">
            <div className="bg-white border border-neutral-200 p-8 lg:sticky lg:top-24">
              <h3 className="text-sm font-bold uppercase tracking-widest mb-6 pb-4 border-b border-black">
                Votre Commande
              </h3>

              <div className="space-y-4 max-h-[400px] overflow-y-auto pr-2 mb-6 scrollbar-thin">
                {items.map((item) => (
                  <div key={item.id} className="flex gap-4">
                    <div className="w-16 h-20 bg-neutral-100 flex-shrink-0">
                      <img
                        src={item.product?.image || '/images/placeholder-product.jpg'}
                        alt={item.product?.nom}
                        className="w-full h-full object-cover"
                        loading="eager"
                      />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-bold uppercase truncate">{item.product?.nom}</p>
                      <p className="text-[10px] text-neutral-500 uppercase mt-1">
                        Qté: {item.quantite} 
                        {item.options?.taille && ` | ${item.options.taille}`}
                      </p>
                    </div>
                    <div className="text-xs font-medium">
                      {(item.prix_unitaire * item.quantite).toLocaleString()}
                    </div>
                  </div>
                ))}
              </div>

              <div className="space-y-3 pt-4 border-t border-neutral-100 text-xs text-neutral-600">
                <div className="flex justify-between">
                  <span>Sous-total</span>
                  <span>{subtotal.toLocaleString()} FCFA</span>
                </div>
                {discount > 0 && (
                  <div className="flex justify-between text-green-700">
                    <span>Remise</span>
                    <span>- {discount.toLocaleString()} FCFA</span>
                  </div>
                )}
                <div className="flex justify-between items-center">
                  <span>Livraison</span>
                  <span className="uppercase font-bold text-[10px]">{shipping === 0 ? 'Offerte' : `${shipping.toLocaleString()} FCFA`}</span>
                </div>
              </div>

              <div className="flex justify-between items-center text-base font-bold mt-6 pt-6 border-t border-dashed border-neutral-300">
                <span>TOTAL</span>
                <span>{total.toLocaleString()} FCFA</span>
              </div>
              
              <div className="mt-8 pt-6 border-t border-neutral-100">
                 <button onClick={() => navigate('/cart')} className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-widest text-neutral-400 hover:text-black transition-colors">
                    <ArrowLeft className="w-3 h-3" /> Modifier le panier
                 </button>
              </div>
            </div>
          </div>

        </div>
      </main>

      <SimpleFooter />

      {/* Modal d'authentification */}
      <AuthModal 
        isOpen={authModalOpen}
        onClose={() => setAuthModalOpen(false)}
        initialMode="login"
      />
    </div>
  );
};

export default CheckoutPage;