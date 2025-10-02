import React, { useState, useEffect } from 'react';
import Navbar from '../components/Navbar';
import { 
  ShoppingCart, Trash2, Plus, Minus, Tag, Truck, Gift, AlertCircle, 
  CheckCircle, MessageCircle, X, Package, Lock, Mail, Eye, EyeOff, Phone
} from 'lucide-react';
import api from '../utils/api';

const CartPage = () => {
  const [cart, setCart] = useState(null);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState({});
  const [cartCount, setCartCount] = useState(0);
  const [wishlistCount, setWishlistCount] = useState(0);
  const [categories, setCategories] = useState([]);
  const [couponCode, setCouponCode] = useState('');
  const [couponLoading, setCouponLoading] = useState(false);
  const [couponMessage, setCouponMessage] = useState(null);
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [authMode, setAuthMode] = useState('login');
  const [authLoading, setAuthLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [authData, setAuthData] = useState({
    email: '',
    password: '',
    password_confirmation: '',
    nom: '',
    prenom: '',
    telephone: '',
    accepte_conditions: false
  });

  useEffect(() => {
    loadInitialData();
  }, []);

  const loadInitialData = async () => {
    try {
      setLoading(true);
      const [cartRes, cartCountRes, wishlistRes, catRes] = await Promise.all([
        api.getCart(),
        api.getCartCount(),
        api.getWishlistCount(),
        api.getCategories()
      ]);
      
      if (cartRes.success) setCart(cartRes.data);
      if (cartCountRes.success) setCartCount(cartCountRes.data.count || 0);
      if (wishlistRes.success) setWishlistCount(wishlistRes.data.count || 0);
      if (catRes.success) setCategories(catRes.data || []);
    } catch (error) {
      console.error('Erreur:', error);
    } finally {
      setLoading(false);
    }
  };

  const updateQuantity = async (itemId, newQuantity) => {
    if (newQuantity < 1) { removeItem(itemId); return; }
    
    setUpdating(prev => ({ ...prev, [itemId]: true }));
    const oldCart = { ...cart };
    const updatedItems = cart.items.map(item => 
      item.id === itemId ? { ...item, quantity: newQuantity, prix_total: item.product.prix_unitaire * newQuantity } : item
    );
    
    const newSubtotal = updatedItems.reduce((sum, item) => sum + item.prix_total, 0);
    const newShippingFee = newSubtotal >= 50000 ? 0 : 2500;
    const newTotal = newSubtotal - (cart.discount || 0) + newShippingFee;
    
    setCart({
      ...cart, items: updatedItems, subtotal: newSubtotal,
      shipping_fee: newShippingFee, total: newTotal, has_free_shipping: newSubtotal >= 50000
    });
    
    try {
      const response = await api.updateCartItem(itemId, newQuantity);
      if (!response.success) setCart(oldCart);
    } catch (error) {
      setCart(oldCart);
    } finally {
      setUpdating(prev => ({ ...prev, [itemId]: false }));
    }
  };

  const removeItem = async (itemId) => {
    const oldCart = { ...cart };
    const updatedItems = cart.items.filter(item => item.id !== itemId);
    
    if (updatedItems.length === 0) {
      setCart({ items: [], count: 0, subtotal: 0, discount: 0, shipping_fee: 0, total: 0, coupon: null, has_free_shipping: false });
      setCartCount(0);
    } else {
      const newSubtotal = updatedItems.reduce((sum, item) => sum + item.prix_total, 0);
      const newShippingFee = newSubtotal >= 50000 ? 0 : 2500;
      const newTotal = newSubtotal - (cart.discount || 0) + newShippingFee;
      
      setCart({
        ...cart, items: updatedItems, count: updatedItems.length, subtotal: newSubtotal,
        shipping_fee: newShippingFee, total: newTotal, has_free_shipping: newSubtotal >= 50000
      });
      setCartCount(updatedItems.length);
    }
    
    try {
      await api.removeCartItem(itemId);
    } catch (error) {
      setCart(oldCart);
    }
  };

  const clearCart = async () => {
    if (!confirm('Vider tout le panier ?')) return;
    const oldCart = { ...cart };
    setCart({ items: [], count: 0, subtotal: 0, discount: 0, shipping_fee: 0, total: 0, coupon: null, has_free_shipping: false });
    setCartCount(0);
    try { await api.clearCart(); } catch (error) { setCart(oldCart); }
  };

  const applyCoupon = async () => {
    if (!couponCode.trim()) return;
    setCouponLoading(true);
    setCouponMessage(null);
    
    try {
      const response = await api.applyCoupon(couponCode);
      if (response.success) {
        setCouponMessage({ type: 'success', text: response.message });
        setCouponCode('');
        const cartRes = await api.getCart();
        if (cartRes.success) setCart(cartRes.data);
      } else {
        setCouponMessage({ type: 'error', text: response.message });
      }
    } catch (error) {
      setCouponMessage({ type: 'error', text: 'Code invalide' });
    } finally {
      setCouponLoading(false);
    }
  };

  const removeCoupon = async () => {
    try {
      await api.removeCoupon();
      const cartRes = await api.getCart();
      if (cartRes.success) setCart(cartRes.data);
    } catch (error) {
      console.error('Erreur:', error);
    }
  };

  const handleWhatsAppCheckout = async () => {
    try {
      const response = await api.generateCartWhatsAppMessage();
      if (response.success) window.open(response.data.url, '_blank');
    } catch (error) {
      console.error('Erreur:', error);
    }
  };

  const handleAuth = async (e) => {
  e.preventDefault();
  
  if (authMode === 'register' && authData.password !== authData.password_confirmation) {
    alert('Les mots de passe ne correspondent pas');
    return;
  }
  
  if (authMode === 'register' && !authData.accepte_conditions) {
    alert('Vous devez accepter les conditions d\'utilisation');
    return;
  }
  
  setAuthLoading(true);
  
  try {
    if (authMode === 'login') {
      const response = await api.login(authData.email, authData.password);
      if (response.success) {
        // Plus besoin de localStorage.setItem, api.login le fait automatiquement
        setShowAuthModal(false);
        window.location.href = '/checkout';
      } else {
        alert(response.message || 'Identifiants incorrects');
      }
    } else {
      const response = await api.register(authData);
      if (response.success) {
        // Plus besoin de localStorage.setItem, api.register le fait automatiquement
        setShowAuthModal(false);
        window.location.href = '/checkout';
      } else {
        alert(response.message || 'Erreur inscription');
      }
    }
  } catch (error) {
    alert('Une erreur est survenue');
  } finally {
    setAuthLoading(false);
  }
};

const handleCheckout = () => {
  if (!api.isAuthenticated()) { // Utiliser la méthode isAuthenticated
    setShowAuthModal(true);
  } else {
    window.location.href = '/checkout';
  }
};

  const handleNavigation = (type, slug = null) => {
    const routes = { home: '/', category: `/categories/${slug}`, product: `/products/${slug}`, cart: '/cart', wishlist: '/wishlist' };
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

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-purple-50 to-pink-50">
        <div className="text-center">
          <div className="w-20 h-20 bg-gradient-to-r from-purple-600 to-pink-600 rounded-full flex items-center justify-center mx-auto mb-6 animate-bounce">
            <ShoppingCart className="h-10 w-10 text-white" />
          </div>
          <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-purple-600 mx-auto mb-4"></div>
          <p className="text-gray-600 text-lg">Chargement...</p>
        </div>
      </div>
    );
  }

  if (!cart || cart.count === 0) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-purple-50">
        <Navbar cartCount={0} wishlistCount={wishlistCount} categories={categories} onNavigate={handleNavigation} onSearch={handleSearch} />
        <div className="py-20 px-4">
          <div className="max-w-2xl mx-auto text-center">
            <div className="bg-white rounded-3xl shadow-2xl p-12">
              <div className="w-32 h-32 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-6">
                <ShoppingCart className="h-16 w-16 text-gray-400" />
              </div>
              <h2 className="text-4xl font-bold text-gray-900 mb-4">Panier vide</h2>
              <p className="text-gray-600 mb-8 text-lg">Découvrez nos créations</p>
              <button onClick={() => handleNavigation('home')} className="inline-flex items-center gap-2 bg-gradient-to-r from-purple-600 to-pink-600 text-white px-8 py-4 rounded-full hover:from-purple-700 hover:to-pink-700 transition-all font-semibold text-lg shadow-xl">
                <ShoppingCart className="h-5 w-5" />
                Découvrir
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-purple-50">
      <Navbar cartCount={cartCount} wishlistCount={wishlistCount} categories={categories} onNavigate={handleNavigation} onSearch={handleSearch} />

      <div className="py-8 px-4">
        <div className="max-w-7xl mx-auto">
          <div className="mb-8">
            <div className="flex items-center justify-between mb-4">
              <h1 className="text-4xl font-bold text-gray-900 flex items-center gap-3">
                <ShoppingCart className="h-10 w-10 text-purple-600" />
                Mon Panier
              </h1>
              <button onClick={clearCart} className="text-red-600 hover:text-red-700 font-medium flex items-center gap-2 px-4 py-2 rounded-lg hover:bg-red-50 transition-all">
                <Trash2 className="h-5 w-5" />
                Vider
              </button>
            </div>
            <div className="flex items-center gap-4">
              <span className="text-gray-600 text-lg">{cart.count} article{cart.count > 1 ? 's' : ''}</span>
              <span className="text-gray-400">•</span>
              <span className="text-purple-600 font-semibold">{cart.total.toLocaleString()} FCFA</span>
            </div>
          </div>

          <div className="grid lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2 space-y-4">
              {cart.items.map((item) => (
                <div key={item.id} className="bg-white rounded-2xl shadow-md overflow-hidden hover:shadow-xl transition-all">
                  <div className="p-6">
                    <div className="flex gap-6">
                      <div onClick={() => window.location.href = `/products/${item.product.slug}`} className="w-32 h-32 flex-shrink-0 bg-gray-100 rounded-xl overflow-hidden cursor-pointer group">
                        <img src={item.product.image} alt={item.product.nom} className="w-full h-full object-cover group-hover:scale-110 transition-transform" onError={(e) => e.target.src = '/images/placeholder-product.jpg'} />
                      </div>

                      <div className="flex-1 min-w-0">
                        <div className="flex justify-between gap-4 mb-3">
                          <h3 onClick={() => window.location.href = `/products/${item.product.slug}`} className="text-xl font-bold text-gray-900 cursor-pointer hover:text-purple-600 transition-colors line-clamp-2">
                            {item.product.nom}
                          </h3>
                          <button onClick={() => removeItem(item.id)} className="text-red-500 hover:text-red-700 p-2 rounded-lg hover:bg-red-50 transition-all flex-shrink-0">
                            <Trash2 className="h-5 w-5" />
                          </button>
                        </div>

                        {(item.taille || item.couleur) && (
                          <div className="flex gap-4 mb-4 text-sm">
                            {item.taille && (
                              <span className="flex items-center gap-1 px-3 py-1 bg-gray-100 rounded-full">
                                <Package className="h-4 w-4" />
                                {item.taille}
                              </span>
                            )}
                            {item.couleur && (
                              <span className="flex items-center gap-2 px-3 py-1 bg-gray-100 rounded-full">
                                <div className="w-4 h-4 rounded-full border-2 border-white shadow-sm" style={{ backgroundColor: item.couleur.toLowerCase() }} />
                                {item.couleur}
                              </span>
                            )}
                          </div>
                        )}

                        <div className="flex items-center justify-between flex-wrap gap-4">
                          <div className="flex items-center border-2 border-gray-200 rounded-xl overflow-hidden">
                            <button onClick={() => updateQuantity(item.id, item.quantity - 1)} disabled={updating[item.id]} className="w-10 h-10 flex items-center justify-center hover:bg-purple-50 transition-colors disabled:opacity-50">
                              <Minus className="h-4 w-4" />
                            </button>
                            <span className="w-12 h-10 flex items-center justify-center font-bold text-lg border-x-2">{item.quantity}</span>
                            <button onClick={() => updateQuantity(item.id, item.quantity + 1)} disabled={updating[item.id]} className="w-10 h-10 flex items-center justify-center hover:bg-purple-50 transition-colors disabled:opacity-50">
                              <Plus className="h-4 w-4" />
                            </button>
                          </div>

                          <div className="text-right">
                            <div className="text-2xl font-bold text-purple-600">{item.prix_total.toLocaleString()} FCFA</div>
                            {item.product.prix_promo && (
                              <div className="text-sm text-gray-500">{item.product.prix_unitaire.toLocaleString()} FCFA / unité</div>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            <div className="lg:col-span-1">
              <div className="bg-white rounded-2xl shadow-xl p-6 sticky top-24">
                <h2 className="text-2xl font-bold mb-6">Récapitulatif</h2>

                <div className="mb-6">
                  <label className="block text-sm font-medium text-gray-700 mb-2">Code promo</label>
                  {cart.coupon ? (
                    <div className="flex items-center justify-between p-4 bg-green-50 rounded-xl border-2 border-green-200">
                      <div className="flex items-center gap-2">
                        <CheckCircle className="h-5 w-5 text-green-600" />
                        <span className="font-semibold text-green-900">{cart.coupon.code}</span>
                      </div>
                      <button onClick={removeCoupon} className="text-red-500 hover:text-red-700">
                        <X className="h-5 w-5" />
                      </button>
                    </div>
                  ) : (
                    <div className="flex gap-2">
                      <input type="text" value={couponCode} onChange={(e) => setCouponCode(e.target.value.toUpperCase())} onKeyPress={(e) => e.key === 'Enter' && applyCoupon()} placeholder="PROMO2024" className="flex-1 px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent" />
                      <button onClick={applyCoupon} disabled={couponLoading} className="px-6 py-3 bg-purple-600 text-white rounded-xl hover:bg-purple-700 transition-all disabled:opacity-50 font-semibold">
                        {couponLoading ? '...' : 'OK'}
                      </button>
                    </div>
                  )}
                  {couponMessage && (
                    <div className={`mt-2 p-3 rounded-lg text-sm ${couponMessage.type === 'success' ? 'bg-green-50 text-green-800' : 'bg-red-50 text-red-800'}`}>
                      {couponMessage.text}
                    </div>
                  )}
                </div>

                <div className="space-y-3 mb-6 pb-6 border-b-2">
                  <div className="flex justify-between"><span>Sous-total</span><span className="font-semibold">{cart.subtotal.toLocaleString()} FCFA</span></div>
                  {cart.discount > 0 && (
                    <div className="flex justify-between text-green-600">
                      <span className="flex items-center gap-1"><Tag className="h-4 w-4" />Réduction</span>
                      <span className="font-semibold">-{cart.discount.toLocaleString()} FCFA</span>
                    </div>
                  )}
                  <div className="flex justify-between">
                    <span className="flex items-center gap-1"><Truck className="h-4 w-4" />Livraison</span>
                    <span className="font-semibold">{cart.has_free_shipping ? <span className="text-green-600">GRATUITE</span> : `${cart.shipping_fee.toLocaleString()} FCFA`}</span>
                  </div>
                </div>

                <div className="flex justify-between items-center mb-6 p-4 bg-gradient-to-r from-purple-50 to-pink-50 rounded-xl">
                  <span className="text-lg font-bold">Total</span>
                  <span className="text-3xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">{cart.total.toLocaleString()} FCFA</span>
                </div>

                {!cart.has_free_shipping && cart.subtotal < 50000 && (
                  <div className="mb-6 p-4 bg-blue-50 border-2 border-blue-200 rounded-xl">
                    <div className="flex items-start gap-2">
                      <AlertCircle className="h-5 w-5 text-blue-600 flex-shrink-0 mt-0.5" />
                      <p className="text-sm text-blue-900">Plus que <span className="font-bold">{(50000 - cart.subtotal).toLocaleString()} FCFA</span> pour la livraison gratuite !</p>
                    </div>
                  </div>
                )}

                <div className="space-y-3">
                  <button onClick={handleCheckout} className="w-full bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white py-4 rounded-xl font-bold text-lg flex items-center justify-center gap-2 transition-all shadow-lg transform hover:scale-105">
                    <Lock className="h-5 w-5" />
                    Passer commande
                  </button>
                  <button onClick={handleWhatsAppCheckout} className="w-full bg-green-500 hover:bg-green-600 text-white py-4 rounded-xl font-bold text-lg flex items-center justify-center gap-2 transition-all shadow-lg">
                    <MessageCircle className="h-5 w-5" />
                    WhatsApp
                  </button>
                </div>

                <div className="mt-6 pt-6 border-t-2">
                  <div className="grid grid-cols-2 gap-4 text-center text-sm">
                    <div><Truck className="h-6 w-6 text-purple-600 mx-auto mb-2" /><p className="font-medium">Livraison rapide</p></div>
                    <div><Gift className="h-6 w-6 text-purple-600 mx-auto mb-2" /><p className="font-medium">Retours faciles</p></div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {showAuthModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl shadow-2xl max-w-md w-full p-8 relative max-h-[90vh] overflow-y-auto">
            <button onClick={() => setShowAuthModal(false)} className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 p-2 rounded-lg hover:bg-gray-100">
              <X className="h-6 w-6" />
            </button>

            <div className="text-center mb-8">
              <div className="w-16 h-16 bg-gradient-to-r from-purple-600 to-pink-600 rounded-full flex items-center justify-center mx-auto mb-4">
                <Lock className="h-8 w-8 text-white" />
              </div>
              <h2 className="text-3xl font-bold text-gray-900 mb-2">{authMode === 'login' ? 'Connexion' : 'Inscription'}</h2>
              <p className="text-gray-600">{authMode === 'login' ? 'Connectez-vous pour continuer' : 'Créez votre compte'}</p>
            </div>

            <div className="space-y-4">
              {authMode === 'register' && (
                <>
                  <div className="grid grid-cols-2 gap-3">
                    <input type="text" placeholder="Prénom" value={authData.prenom} onChange={(e) => setAuthData({...authData, prenom: e.target.value})} required className="px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent" />
                    <input type="text" placeholder="Nom" value={authData.nom} onChange={(e) => setAuthData({...authData, nom: e.target.value})} required className="px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent" />
                  </div>
                  <div className="relative">
                    <Phone className="absolute left-4 top-3.5 h-5 w-5 text-gray-400" />
                    <input type="tel" placeholder="Téléphone (ex: 771234567)" value={authData.telephone} onChange={(e) => setAuthData({...authData, telephone: e.target.value})} required className="w-full pl-12 pr-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent" />
                  </div>
                </>
              )}

              <div className="relative">
                <Mail className="absolute left-4 top-3.5 h-5 w-5 text-gray-400" />
                <input type="email" placeholder="Email" value={authData.email} onChange={(e) => setAuthData({...authData, email: e.target.value})} required className="w-full pl-12 pr-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent" />
              </div>

              <div className="relative">
                <Lock className="absolute left-4 top-3.5 h-5 w-5 text-gray-400" />
                <input type={showPassword ? 'text' : 'password'} placeholder="Mot de passe" value={authData.password} onChange={(e) => setAuthData({...authData, password: e.target.value})} required className="w-full pl-12 pr-12 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent" />
                <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-4 top-3.5 text-gray-400 hover:text-gray-600">
                  {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                </button>
              </div>

              {authMode === 'register' && (
                <>
                  <div className="relative">
                    <Lock className="absolute left-4 top-3.5 h-5 w-5 text-gray-400" />
                    <input type={showPassword ? 'text' : 'password'} placeholder="Confirmer le mot de passe" value={authData.password_confirmation} onChange={(e) => setAuthData({...authData, password_confirmation: e.target.value})} required className="w-full pl-12 pr-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent" />
                  </div>
                  
                  <label className="flex items-start gap-2 cursor-pointer">
                    <input type="checkbox" checked={authData.accepte_conditions} onChange={(e) => setAuthData({...authData, accepte_conditions: e.target.checked})} required className="w-5 h-5 text-purple-600 rounded focus:ring-purple-500 mt-0.5" />
                    <span className="text-sm text-gray-700">
                      J'accepte les conditions d'utilisation et la politique de confidentialité
                    </span>
                  </label>
                </>
              )}

              <button onClick={handleAuth} disabled={authLoading} className="w-full bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white py-4 rounded-xl font-bold text-lg transition-all disabled:opacity-50 shadow-lg">
                {authLoading ? 'Chargement...' : (authMode === 'login' ? 'Se connecter' : 'S\'inscrire')}
              </button>

              <button type="button" onClick={() => { setAuthMode(authMode === 'login' ? 'register' : 'login'); setAuthData({email: '', password: '', password_confirmation: '', nom: '', prenom: '', telephone: '', accepte_conditions: false}); }} className="w-full text-center text-purple-600 hover:text-purple-700 font-medium">
                {authMode === 'login' ? 'Créer un compte' : 'Déjà inscrit ? Se connecter'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default CartPage;