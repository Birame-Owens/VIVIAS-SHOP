import React, { useState, useEffect } from 'react';
import Navbar from '../components/Navbar';
import { 
  User, Mail, Phone, MapPin, Calendar, Edit2, Save, X, 
  Package, Heart, ShoppingBag, LogOut, Lock, Settings,
  TrendingUp, Clock, Award, Gift, ChevronRight, Eye, EyeOff,
  CheckCircle, Truck, AlertCircle
} from 'lucide-react';
import api from '../utils/api';

const ProfilePage = () => {
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState(null);
  const [orders, setOrders] = useState([]);
  const [editing, setEditing] = useState(false);
  const [activeTab, setActiveTab] = useState('profile');
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [editData, setEditData] = useState({});
  const [passwordData, setPasswordData] = useState({
    current_password: '',
    new_password: '',
    confirm_password: ''
  });
  const [showPassword, setShowPassword] = useState({
    current: false,
    new: false,
    confirm: false
  });
  const [cartCount, setCartCount] = useState(0);
  const [wishlistCount, setWishlistCount] = useState(0);
  const [categories, setCategories] = useState([]);

  useEffect(() => {
    loadInitialData();
  }, []);

  const loadInitialData = async () => {
    const token = localStorage.getItem('auth_token');
    
    if (!token) {
      window.location.href = '/';
      return;
    }

    try {
      setLoading(true);
      
      const [profileRes, ordersRes, cartCountRes, wishlistRes, catRes] = await Promise.all([
        api.getProfile(),
        api.getOrders(),
        api.getCartCount(),
        api.getWishlistCount(),
        api.getCategories()
      ]);
      
      if (profileRes.success) {
        const userWithStats = {
          ...profileRes.data,
          stats: {
            commandes_en_cours: profileRes.data.client.nombre_commandes || 0,
            produits_favoris: wishlistRes.success ? wishlistRes.data.count || 0 : 0,
            points_fidelite: profileRes.data.client.score_fidelite || 0
          }
        };
        
        setUser(userWithStats);
        setEditData({
          nom: profileRes.data.client.nom,
          prenom: profileRes.data.client.prenom,
          telephone: profileRes.data.client.telephone,
          email: profileRes.data.user.email,
          ville: profileRes.data.client.ville,
          adresse_principale: profileRes.data.client.adresse_principale || '',
          date_naissance: profileRes.data.client.date_naissance || '',
          genre: profileRes.data.client.genre || '',
          accepte_whatsapp: profileRes.data.client.accepte_whatsapp ?? true,
          accepte_email: profileRes.data.client.accepte_email ?? true,
          accepte_promotions: profileRes.data.client.accepte_promotions ?? true
        });
      } else {
        localStorage.removeItem('auth_token');
        window.location.href = '/';
      }

      if (ordersRes.success) {
        setOrders(ordersRes.data || []);
      }
      
      if (cartCountRes.success) setCartCount(cartCountRes.data.count || 0);
      if (wishlistRes.success) setWishlistCount(wishlistRes.data.count || 0);
      if (catRes.success) setCategories(catRes.data || []);
      
    } catch (error) {
      console.error('Erreur chargement:', error);
      localStorage.removeItem('auth_token');
      window.location.href = '/';
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    try {
      setLoading(true);
      const response = await api.updateProfile(editData);
      
      if (response.success) {
        alert('Profil mis à jour avec succès');
        await loadInitialData();
        setEditing(false);
      } else {
        alert(response.message || 'Erreur lors de la mise à jour');
      }
    } catch (error) {
      console.error('Erreur:', error);
      alert('Erreur lors de la mise à jour');
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    if (confirm('Voulez-vous vraiment vous déconnecter ?')) {
      localStorage.removeItem('auth_token');
      window.location.href = '/';
    }
  };

  const handleChangePassword = async () => {
    if (passwordData.new_password !== passwordData.confirm_password) {
      alert('Les mots de passe ne correspondent pas');
      return;
    }
    
    if (passwordData.new_password.length < 6) {
      alert('Le mot de passe doit contenir au moins 6 caractères');
      return;
    }
    
    // TODO: Implémenter l'appel API pour changer le mot de passe
    console.log('Changement de mot de passe');
    setShowPasswordModal(false);
    setPasswordData({ current_password: '', new_password: '', confirm_password: '' });
  };

  const getStatusBadge = (statut) => {
    const badges = {
      'en_attente': { bg: 'bg-yellow-100', text: 'text-yellow-800', label: 'En attente' },
      'confirmee': { bg: 'bg-blue-100', text: 'text-blue-800', label: 'Confirmée' },
      'en_preparation': { bg: 'bg-purple-100', text: 'text-purple-800', label: 'En préparation' },
      'prete': { bg: 'bg-indigo-100', text: 'text-indigo-800', label: 'Prête' },
      'en_livraison': { bg: 'bg-orange-100', text: 'text-orange-800', label: 'En livraison' },
      'livree': { bg: 'bg-green-100', text: 'text-green-800', label: 'Livrée' },
      'annulee': { bg: 'bg-red-100', text: 'text-red-800', label: 'Annulée' }
    };
    
    const badge = badges[statut] || badges['en_attente'];
    return (
      <span className={`px-3 py-1 rounded-full text-xs font-medium ${badge.bg} ${badge.text}`}>
        {badge.label}
      </span>
    );
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
            <User className="h-10 w-10 text-white" />
          </div>
          <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-purple-600 mx-auto mb-4"></div>
          <p className="text-gray-600 text-lg">Chargement du profil...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <p className="text-gray-600 mb-4">Vous devez être connecté</p>
          <button onClick={() => window.location.href = '/'} className="px-6 py-3 bg-purple-600 text-white rounded-lg">
            Retour à l'accueil
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-purple-50">
      <Navbar cartCount={cartCount} wishlistCount={wishlistCount} categories={categories} onNavigate={handleNavigation} onSearch={handleSearch} />

      {/* Header */}
      <div className="bg-gradient-to-r from-purple-600 to-pink-600 text-white">
        <div className="max-w-7xl mx-auto px-4 py-8">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-6">
              <div className="w-24 h-24 bg-white rounded-full flex items-center justify-center shadow-xl">
                <User className="h-12 w-12 text-purple-600" />
              </div>
              <div>
                <h1 className="text-3xl font-bold mb-1">{user.user.name}</h1>
                <p className="text-purple-100 mb-2">{user.user.email}</p>
                <div className="flex items-center gap-4 text-sm">
                  <span className="flex items-center gap-1">
                    <Award className="h-4 w-4" />
                    Client {user.client.type_client}
                  </span>
                  <span className="flex items-center gap-1">
                    <Gift className="h-4 w-4" />
                    {user.client.score_fidelite} points
                  </span>
                </div>
              </div>
            </div>
            <button onClick={handleLogout} className="flex items-center gap-2 px-6 py-3 bg-white/20 hover:bg-white/30 rounded-lg transition-all">
              <LogOut className="h-5 w-5" />
              Déconnexion
            </button>
          </div>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="max-w-7xl mx-auto px-4 -mt-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
          <div className="bg-white rounded-2xl shadow-lg p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 text-sm">Commandes totales</p>
                <p className="text-3xl font-bold text-purple-600">{orders.length}</p>
              </div>
              <Package className="h-12 w-12 text-purple-600" />
            </div>
          </div>
          <div className="bg-white rounded-2xl shadow-lg p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 text-sm">Total dépensé</p>
                <p className="text-3xl font-bold text-green-600">{user.client.total_depense.toLocaleString()} F</p>
              </div>
              <TrendingUp className="h-12 w-12 text-green-600" />
            </div>
          </div>
          <div className="bg-white rounded-2xl shadow-lg p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 text-sm">Favoris</p>
                <p className="text-3xl font-bold text-pink-600">{user.stats.produits_favoris}</p>
              </div>
              <Heart className="h-12 w-12 text-pink-600" />
            </div>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="max-w-7xl mx-auto px-4 mb-8">
        <div className="bg-white rounded-2xl shadow-lg p-2">
          <div className="flex gap-2">
            {[
              { id: 'profile', label: 'Informations', icon: User },
              { id: 'orders', label: 'Commandes', icon: Package, badge: orders.length },
              { id: 'wishlist', label: 'Favoris', icon: Heart },
              { id: 'settings', label: 'Paramètres', icon: Settings }
            ].map(tab => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex-1 flex items-center justify-center gap-2 px-6 py-3 rounded-xl font-medium transition-all relative ${
                  activeTab === tab.id
                    ? 'bg-gradient-to-r from-purple-600 to-pink-600 text-white shadow-lg'
                    : 'text-gray-600 hover:bg-gray-100'
                }`}
              >
                <tab.icon className="h-5 w-5" />
                {tab.label}
                {tab.badge > 0 && (
                  <span className={`absolute -top-1 -right-1 w-6 h-6 rounded-full text-xs flex items-center justify-center font-bold ${
                    activeTab === tab.id ? 'bg-white text-purple-600' : 'bg-purple-600 text-white'
                  }`}>
                    {tab.badge}
                  </span>
                )}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-7xl mx-auto px-4 pb-12">
        {activeTab === 'profile' && (
          <div className="bg-white rounded-2xl shadow-lg p-8">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold text-gray-900">Informations personnelles</h2>
              {!editing ? (
                <button onClick={() => setEditing(true)} className="flex items-center gap-2 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700">
                  <Edit2 className="h-4 w-4" />
                  Modifier
                </button>
              ) : (
                <div className="flex gap-2">
                  <button onClick={handleSave} className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700">
                    <Save className="h-4 w-4" />
                    Sauvegarder
                  </button>
                  <button onClick={() => { setEditing(false); loadInitialData(); }} className="flex items-center gap-2 px-4 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600">
                    <X className="h-4 w-4" />
                    Annuler
                  </button>
                </div>
              )}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Prénom</label>
                <input
                  type="text"
                  value={editData.prenom}
                  onChange={(e) => setEditData({...editData, prenom: e.target.value})}
                  disabled={!editing}
                  className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-purple-500 disabled:bg-gray-50"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Nom</label>
                <input
                  type="text"
                  value={editData.nom}
                  onChange={(e) => setEditData({...editData, nom: e.target.value})}
                  disabled={!editing}
                  className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-purple-500 disabled:bg-gray-50"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Email</label>
                <input
                  type="email"
                  value={editData.email}
                  onChange={(e) => setEditData({...editData, email: e.target.value})}
                  disabled={!editing}
                  className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-purple-500 disabled:bg-gray-50"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Téléphone</label>
                <input
                  type="tel"
                  value={editData.telephone}
                  onChange={(e) => setEditData({...editData, telephone: e.target.value})}
                  disabled={!editing}
                  className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-purple-500 disabled:bg-gray-50"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Ville</label>
                <input
                  type="text"
                  value={editData.ville}
                  onChange={(e) => setEditData({...editData, ville: e.target.value})}
                  disabled={!editing}
                  className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-purple-500 disabled:bg-gray-50"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Date de naissance</label>
                <input
                  type="date"
                  value={editData.date_naissance}
                  onChange={(e) => setEditData({...editData, date_naissance: e.target.value})}
                  disabled={!editing}
                  className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-purple-500 disabled:bg-gray-50"
                />
              </div>
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-2">Adresse</label>
                <textarea
                  value={editData.adresse_principale}
                  onChange={(e) => setEditData({...editData, adresse_principale: e.target.value})}
                  disabled={!editing}
                  rows="3"
                  className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-purple-500 disabled:bg-gray-50"
                />
              </div>
            </div>

            <div className="mt-8 pt-6 border-t">
              <button onClick={() => setShowPasswordModal(true)} className="flex items-center gap-2 text-purple-600 hover:text-purple-700 font-medium">
                <Lock className="h-5 w-5" />
                Changer le mot de passe
              </button>
            </div>
          </div>
        )}

        {activeTab === 'orders' && (
          <div className="bg-white rounded-2xl shadow-lg p-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">Mes commandes</h2>
            {orders.length === 0 ? (
              <div className="text-center py-12">
                <Package className="h-16 w-16 text-gray-300 mx-auto mb-4" />
                <p className="text-gray-600 text-lg mb-4">Aucune commande pour le moment</p>
                <button onClick={() => window.location.href = '/'} className="px-6 py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700">
                  Commencer mes achats
                </button>
              </div>
            ) : (
              <div className="space-y-4">
                {orders.map(order => (
                  <div key={order.id} className="border-2 border-gray-200 rounded-xl p-6 hover:border-purple-300 transition-all">
                    <div className="flex items-start justify-between mb-4">
                      <div>
                        <p className="font-bold text-lg text-purple-600">{order.numero_commande}</p>
                        <p className="text-sm text-gray-600 flex items-center gap-1 mt-1">
                          <Clock className="h-4 w-4" />
                          {order.date}
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="font-bold text-2xl text-gray-900">{order.montant_total.toLocaleString()} F</p>
                        <div className="flex items-center gap-2 mt-2">
                          {getStatusBadge(order.statut)}
                          {order.est_payee && (
                            <span className="px-3 py-1 bg-green-100 text-green-800 rounded-full text-xs font-medium flex items-center gap-1">
                              <CheckCircle className="h-3 w-3" />
                              Payée
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                    
                    <div className="space-y-2">
                      {order.articles.map((article, idx) => (
                        <div key={idx} className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-all">
                          {article.image && (
                            <img src={article.image} alt={article.nom} className="w-16 h-16 object-cover rounded-lg" />
                          )}
                          <div className="flex-1 min-w-0">
                            <p className="font-medium text-sm truncate">{article.nom}</p>
                            <p className="text-xs text-gray-600">Quantité: {article.quantite}</p>
                          </div>
                          <p className="font-bold text-purple-600 whitespace-nowrap">{(article.prix * article.quantite).toLocaleString()} F</p>
                        </div>
                      ))}
                    </div>

                    <div className="mt-4 pt-4 border-t flex items-center justify-between">
                      <p className="text-sm text-gray-600">{order.nombre_articles} article(s)</p>
                      {!order.est_payee && order.statut === 'en_attente' && (
                        <span className="text-xs text-orange-600 flex items-center gap-1">
                          <AlertCircle className="h-4 w-4" />
                          En attente de paiement
                        </span>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {activeTab === 'wishlist' && (
          <div className="bg-white rounded-2xl shadow-lg p-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">Mes favoris</h2>
            {user.stats.produits_favoris === 0 ? (
              <div className="text-center py-12">
                <Heart className="h-16 w-16 text-gray-300 mx-auto mb-4" />
                <p className="text-gray-600 text-lg mb-4">Aucun favori pour le moment</p>
                <button onClick={() => window.location.href = '/'} className="px-6 py-3 bg-pink-600 text-white rounded-lg hover:bg-pink-700">
                  Découvrir nos produits
                </button>
              </div>
            ) : (
              <p className="text-gray-600">Liste des favoris à implémenter</p>
            )}
          </div>
        )}

        {activeTab === 'settings' && (
          <div className="bg-white rounded-2xl shadow-lg p-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">Paramètres</h2>
            <div className="space-y-4">
              <label className="flex items-center justify-between p-4 border-2 border-gray-200 rounded-xl cursor-pointer hover:bg-gray-50">
                <span className="font-medium">Recevoir les notifications WhatsApp</span>
                <input
                  type="checkbox"
                  checked={editData.accepte_whatsapp}
                  onChange={(e) => setEditData({...editData, accepte_whatsapp: e.target.checked})}
                  className="w-6 h-6 text-purple-600 rounded"
                />
              </label>
              <label className="flex items-center justify-between p-4 border-2 border-gray-200 rounded-xl cursor-pointer hover:bg-gray-50">
                <span className="font-medium">Recevoir les emails</span>
                <input
                  type="checkbox"
                  checked={editData.accepte_email}
                  onChange={(e) => setEditData({...editData, accepte_email: e.target.checked})}
                  className="w-6 h-6 text-purple-600 rounded"
                />
              </label>
              <label className="flex items-center justify-between p-4 border-2 border-gray-200 rounded-xl cursor-pointer hover:bg-gray-50">
                <span className="font-medium">Recevoir les promotions</span>
                <input
                  type="checkbox"
                  checked={editData.accepte_promotions}
                  onChange={(e) => setEditData({...editData, accepte_promotions: e.target.checked})}
                  className="w-6 h-6 text-purple-600 rounded"
                />
              </label>
            </div>
            <button onClick={handleSave} className="mt-6 px-6 py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700">
              Enregistrer les préférences
            </button>
          </div>
        )}
      </div>

      {/* Password Modal */}
      {showPasswordModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl shadow-2xl max-w-md w-full p-8">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-2xl font-bold">Changer le mot de passe</h3>
              <button onClick={() => setShowPasswordModal(false)} className="text-gray-400 hover:text-gray-600">
                <X className="h-6 w-6" />
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Mot de passe actuel</label>
                <div className="relative">
                  <input
                    type={showPassword.current ? 'text' : 'password'}
                    value={passwordData.current_password}
                    onChange={(e) => setPasswordData({...passwordData, current_password: e.target.value})}
                    className="w-full px-4 py-3 pr-12 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-purple-500"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword({...showPassword, current: !showPassword.current})}
                    className="absolute right-4 top-3.5"
                  >
                    {showPassword.current ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                  </button>
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Nouveau mot de passe</label>
                <div className="relative">
                  <input
                    type={showPassword.new ? 'text' : 'password'}
                    value={passwordData.new_password}
                    onChange={(e) => setPasswordData({...passwordData, new_password: e.target.value})}
                    className="w-full px-4 py-3 pr-12 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-purple-500"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword({...showPassword, new: !showPassword.new})}
                    className="absolute right-4 top-3.5"
                  >
                    {showPassword.new ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                  </button>
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Confirmer le mot de passe</label>
                <div className="relative">
                  <input
                    type={showPassword.confirm ? 'text' : 'password'}
                    value={passwordData.confirm_password}
                    onChange={(e) => setPasswordData({...passwordData, confirm_password: e.target.value})}
                    className="w-full px-4 py-3 pr-12 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-purple-500"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword({...showPassword, confirm: !showPassword.confirm})}
                    className="absolute right-4 top-3.5"
                  >
                 {showPassword.confirm ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                  </button>
                </div>
              </div>
            </div>

            <button
              onClick={handleChangePassword}
              className="w-full mt-6 bg-gradient-to-r from-purple-600 to-pink-600 text-white py-4 rounded-xl font-bold hover:from-purple-700 hover:to-pink-700"
            >
              Changer le mot de passe
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default ProfilePage;