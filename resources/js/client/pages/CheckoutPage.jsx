import React, { useState, useEffect } from 'react';
import Navbar from '../components/Navbar';
import { 
  CreditCard, Building2, Smartphone, Lock, ArrowLeft, Check,
  User, Mail, Phone, MapPin, Package, Truck, AlertCircle
} from 'lucide-react';
import api from '../utils/api';

const CheckoutPage = () => {
  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState(false);
  const [cart, setCart] = useState(null);
  const [user, setUser] = useState(null);
  const [paymentMethod, setPaymentMethod] = useState('wave');
  const [deliveryInfo, setDeliveryInfo] = useState({
    nom: '',
    prenom: '',
    telephone: '',
    email: '',
    adresse: '',
    ville: 'Dakar',
    quartier: '',
    indications: ''
  });
  const [cartCount, setCartCount] = useState(0);
  const [wishlistCount, setWishlistCount] = useState(0);
  const [categories, setCategories] = useState([]);

  useEffect(() => {
    loadCheckoutData();
  }, []);

  const loadCheckoutData = async () => {
    if (!api.isAuthenticated()) {
      window.location.href = '/cart';
      return;
    }

    try {
      setLoading(true);
      
      const [cartRes, profileRes, cartCountRes, wishlistRes, catRes] = await Promise.all([
        api.getCart(),
        api.getProfile(),
        api.getCartCount(),
        api.getWishlistCount(),
        api.getCategories()
      ]);
      
      if (cartRes.success) {
        if (!cartRes.data || cartRes.data.count === 0) {
          window.location.href = '/cart';
          return;
        }
        setCart(cartRes.data);
      }
      
      if (profileRes.success) {
        setUser(profileRes.data);
        setDeliveryInfo({
          nom: profileRes.data.client.nom,
          prenom: profileRes.data.client.prenom,
          telephone: profileRes.data.client.telephone,
          email: profileRes.data.user.email,
          adresse: profileRes.data.client.adresse_principale || '',
          ville: profileRes.data.client.ville || 'Dakar',
          quartier: profileRes.data.client.quartier || '',
          indications: profileRes.data.client.indications_livraison || ''
        });
      }
      
      if (cartCountRes.success) setCartCount(cartCountRes.data.count || 0);
      if (wishlistRes.success) setWishlistCount(wishlistRes.data.count || 0);
      if (catRes.success) setCategories(catRes.data || []);
      
    } catch (error) {
      console.error('Erreur:', error);
      window.location.href = '/cart';
    } finally {
      setLoading(false);
    }
  };

  const handlePayment = async () => {
    if (!deliveryInfo.adresse || !deliveryInfo.telephone) {
      alert('Veuillez renseigner votre adresse et téléphone');
      return;
    }

    setProcessing(true);

    try {
      // TODO: Créer l'API pour initier le paiement
      const response = await fetch('/api/client/checkout/process', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${api.getToken()}`,
          'Accept': 'application/json'
        },
        body: JSON.stringify({
          payment_method: paymentMethod,
          delivery_info: deliveryInfo,
          cart_id: cart.id
        })
      });

      const data = await response.json();

      if (data.success) {
        if (paymentMethod === 'wave' || paymentMethod === 'orange' || paymentMethod === 'free') {
          // Redirection vers la page de paiement mobile money
          if (data.data.payment_url) {
            window.location.href = data.data.payment_url;
          } else {
            alert('Commande créée ! Vous recevrez un message pour finaliser le paiement.');
            window.location.href = '/profile';
          }
        } else if (paymentMethod === 'stripe') {
          // Redirection vers Stripe
          if (data.data.checkout_url) {
            window.location.href = data.data.checkout_url;
          }
        } else if (paymentMethod === 'delivery') {
          // Paiement à la livraison
          alert('Commande enregistrée ! Paiement à la livraison.');
          window.location.href = '/profile';
        }
      } else {
        alert(data.message || 'Erreur lors du paiement');
      }
    } catch (error) {
      console.error('Erreur:', error);
      alert('Une erreur est survenue');
    } finally {
      setProcessing(false);
    }
  };

  const handleNavigation = (type, slug = null) => {
    const routes = { home: '/', category: `/categories/${slug}`, product: `/products/${slug}`, cart: '/cart', wishlist: '/wishlist', profile: '/profile' };
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
            <CreditCard className="h-10 w-10 text-white" />
          </div>
          <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-purple-600 mx-auto mb-4"></div>
          <p className="text-gray-600 text-lg">Chargement...</p>
        </div>
      </div>
    );
  }

  if (!cart) return null;

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-purple-50">
      <Navbar cartCount={cartCount} wishlistCount={wishlistCount} categories={categories} onNavigate={handleNavigation} onSearch={handleSearch} />

      <div className="py-8 px-4">
        <div className="max-w-7xl mx-auto">
          {/* Header */}
          <div className="mb-8">
            <button onClick={() => window.location.href = '/cart'} className="flex items-center gap-2 text-purple-600 hover:text-purple-700 font-medium mb-4">
              <ArrowLeft className="h-5 w-5" />
              Retour au panier
            </button>
            <h1 className="text-4xl font-bold text-gray-900 flex items-center gap-3">
              <CreditCard className="h-10 w-10 text-purple-600" />
              Paiement
            </h1>
          </div>

          <div className="grid lg:grid-cols-3 gap-8">
            {/* Formulaire */}
            <div className="lg:col-span-2 space-y-6">
              {/* Informations de livraison */}
              <div className="bg-white rounded-2xl shadow-lg p-6">
                <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center gap-2">
                  <Truck className="h-6 w-6 text-purple-600" />
                  Informations de livraison
                </h2>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Prénom *</label>
                    <input
                      type="text"
                      value={deliveryInfo.prenom}
                      onChange={(e) => setDeliveryInfo({...deliveryInfo, prenom: e.target.value})}
                      className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-purple-500"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Nom *</label>
                    <input
                      type="text"
                      value={deliveryInfo.nom}
                      onChange={(e) => setDeliveryInfo({...deliveryInfo, nom: e.target.value})}
                      className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-purple-500"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Téléphone *</label>
                    <input
                      type="tel"
                      value={deliveryInfo.telephone}
                      onChange={(e) => setDeliveryInfo({...deliveryInfo, telephone: e.target.value})}
                      className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-purple-500"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Email</label>
                    <input
                      type="email"
                      value={deliveryInfo.email}
                      onChange={(e) => setDeliveryInfo({...deliveryInfo, email: e.target.value})}
                      className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-purple-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Ville *</label>
                    <input
                      type="text"
                      value={deliveryInfo.ville}
                      onChange={(e) => setDeliveryInfo({...deliveryInfo, ville: e.target.value})}
                      className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-purple-500"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Quartier</label>
                    <input
                      type="text"
                      value={deliveryInfo.quartier}
                      onChange={(e) => setDeliveryInfo({...deliveryInfo, quartier: e.target.value})}
                      className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-purple-500"
                    />
                  </div>
                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-2">Adresse complète *</label>
                    <textarea
                      value={deliveryInfo.adresse}
                      onChange={(e) => setDeliveryInfo({...deliveryInfo, adresse: e.target.value})}
                      rows="3"
                      className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-purple-500"
                      required
                    />
                  </div>
                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-2">Indications de livraison</label>
                    <textarea
                      value={deliveryInfo.indications}
                      onChange={(e) => setDeliveryInfo({...deliveryInfo, indications: e.target.value})}
                      rows="2"
                      placeholder="Ex: Près de la pharmacie, portail bleu..."
                      className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-purple-500"
                    />
                  </div>
                </div>
              </div>

              {/* Méthode de paiement */}
              <div className="bg-white rounded-2xl shadow-lg p-6">
                <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center gap-2">
                  <CreditCard className="h-6 w-6 text-purple-600" />
                  Méthode de paiement
                </h2>

                <div className="space-y-3">
                  {/* Wave */}
                  <label className={`flex items-center p-4 border-2 rounded-xl cursor-pointer transition-all ${
                    paymentMethod === 'wave' ? 'border-purple-600 bg-purple-50' : 'border-gray-200 hover:border-purple-300'
                  }`}>
                    <input
                      type="radio"
                      name="payment"
                      value="wave"
                      checked={paymentMethod === 'wave'}
                      onChange={(e) => setPaymentMethod(e.target.value)}
                      className="w-5 h-5 text-purple-600"
                    />
                    <Smartphone className="h-6 w-6 text-blue-600 mx-3" />
                    <span className="flex-1 font-medium">Wave</span>
                    {paymentMethod === 'wave' && <Check className="h-5 w-5 text-purple-600" />}
                  </label>

                  {/* Orange Money */}
                  <label className={`flex items-center p-4 border-2 rounded-xl cursor-pointer transition-all ${
                    paymentMethod === 'orange' ? 'border-purple-600 bg-purple-50' : 'border-gray-200 hover:border-purple-300'
                  }`}>
                    <input
                      type="radio"
                      name="payment"
                      value="orange"
                      checked={paymentMethod === 'orange'}
                      onChange={(e) => setPaymentMethod(e.target.value)}
                      className="w-5 h-5 text-purple-600"
                    />
                    <Smartphone className="h-6 w-6 text-orange-600 mx-3" />
                    <span className="flex-1 font-medium">Orange Money</span>
                    {paymentMethod === 'orange' && <Check className="h-5 w-5 text-purple-600" />}
                  </label>

                  {/* Free Money */}
                  <label className={`flex items-center p-4 border-2 rounded-xl cursor-pointer transition-all ${
                    paymentMethod === 'free' ? 'border-purple-600 bg-purple-50' : 'border-gray-200 hover:border-purple-300'
                  }`}>
                    <input
                      type="radio"
                      name="payment"
                      value="free"
                      checked={paymentMethod === 'free'}
                      onChange={(e) => setPaymentMethod(e.target.value)}
                      className="w-5 h-5 text-purple-600"
                    />
                    <Smartphone className="h-6 w-6 text-red-600 mx-3" />
                    <span className="flex-1 font-medium">Free Money</span>
                    {paymentMethod === 'free' && <Check className="h-5 w-5 text-purple-600" />}
                  </label>

                  {/* Stripe (Carte bancaire) */}
                  <label className={`flex items-center p-4 border-2 rounded-xl cursor-pointer transition-all ${
                    paymentMethod === 'stripe' ? 'border-purple-600 bg-purple-50' : 'border-gray-200 hover:border-purple-300'
                  }`}>
                    <input
                      type="radio"
                      name="payment"
                      value="stripe"
                      checked={paymentMethod === 'stripe'}
                      onChange={(e) => setPaymentMethod(e.target.value)}
                      className="w-5 h-5 text-purple-600"
                    />
                    <CreditCard className="h-6 w-6 text-purple-600 mx-3" />
                    <span className="flex-1 font-medium">Carte bancaire (Stripe)</span>
                    {paymentMethod === 'stripe' && <Check className="h-5 w-5 text-purple-600" />}
                  </label>

                  {/* Paiement à la livraison */}
                  <label className={`flex items-center p-4 border-2 rounded-xl cursor-pointer transition-all ${
                    paymentMethod === 'delivery' ? 'border-purple-600 bg-purple-50' : 'border-gray-200 hover:border-purple-300'
                  }`}>
                    <input
                      type="radio"
                      name="payment"
                      value="delivery"
                      checked={paymentMethod === 'delivery'}
                      onChange={(e) => setPaymentMethod(e.target.value)}
                      className="w-5 h-5 text-purple-600"
                    />
                    <Building2 className="h-6 w-6 text-green-600 mx-3" />
                    <span className="flex-1 font-medium">Paiement à la livraison</span>
                    {paymentMethod === 'delivery' && <Check className="h-5 w-5 text-purple-600" />}
                  </label>
                </div>
              </div>
            </div>

            {/* Récapitulatif */}
            <div className="lg:col-span-1">
              <div className="bg-white rounded-2xl shadow-xl p-6 sticky top-24">
                <h2 className="text-2xl font-bold mb-6">Récapitulatif</h2>

                {/* Articles */}
                <div className="space-y-3 mb-6 max-h-60 overflow-y-auto">
                  {cart.items.map((item) => (
                    <div key={item.id} className="flex gap-3 p-3 bg-gray-50 rounded-lg">
                      <img src={item.product.image} alt={item.product.nom} className="w-16 h-16 object-cover rounded-lg" />
                      <div className="flex-1 min-w-0">
                        <p className="font-medium text-sm truncate">{item.product.nom}</p>
                        <p className="text-sm text-gray-600">Qté: {item.quantity}</p>
                        <p className="text-sm font-bold text-purple-600">{item.prix_total.toLocaleString()} F</p>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Totaux */}
                <div className="space-y-3 mb-6 pb-6 border-b-2">
                  <div className="flex justify-between"><span>Sous-total</span><span className="font-semibold">{cart.subtotal.toLocaleString()} F</span></div>
                  {cart.discount > 0 && (
                    <div className="flex justify-between text-green-600">
                      <span>Réduction</span>
                      <span className="font-semibold">-{cart.discount.toLocaleString()} F</span>
                    </div>
                  )}
                  <div className="flex justify-between">
                    <span>Livraison</span>
                    <span className="font-semibold">{cart.has_free_shipping ? <span className="text-green-600">GRATUITE</span> : `${cart.shipping_fee.toLocaleString()} F`}</span>
                  </div>
                </div>

                <div className="flex justify-between items-center mb-6 p-4 bg-gradient-to-r from-purple-50 to-pink-50 rounded-xl">
                  <span className="text-lg font-bold">Total</span>
                  <span className="text-3xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">{cart.total.toLocaleString()} F</span>
                </div>

                <button
                  onClick={handlePayment}
                  disabled={processing}
                  className="w-full bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white py-4 rounded-xl font-bold text-lg flex items-center justify-center gap-2 transition-all shadow-lg disabled:opacity-50"
                >
                  {processing ? (
                    <>
                      <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                      Traitement...
                    </>
                  ) : (
                    <>
                      <Lock className="h-5 w-5" />
                      Payer {cart.total.toLocaleString()} F
                    </>
                  )}
                </button>

                <div className="mt-4 flex items-start gap-2 text-xs text-gray-600">
                  <Lock className="h-4 w-4 flex-shrink-0 mt-0.5" />
                  <p>Paiement 100% sécurisé. Vos données sont protégées.</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CheckoutPage;