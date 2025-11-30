import React, { useState, useEffect } from 'react';
import Navbar from '../components/Navbar';
import { 
  User, Mail, Phone, MapPin, Calendar, Package, FileText, 
  Edit2, Save, X, LogOut, ChevronRight, Loader2, ShoppingBag, Heart
} from 'lucide-react';
import toast from 'react-hot-toast';
import api from '../utils/api';

// Footer Simple
const SimpleFooter = () => (
  <footer className="bg-stone-100 pt-16 pb-8 text-neutral-500 text-xs border-t border-neutral-200 mt-auto text-center uppercase tracking-widest">
    <p>&copy; {new Date().getFullYear()} VIVIAS SHOP. Tous droits réservés.</p>
  </footer>
);

const ProfilePage = () => {
  // États Globaux
  const [isLoading, setIsLoading] = useState(true);
  const [profile, setProfile] = useState(null);
  
  // États Navbar
  const [cartCount, setCartCount] = useState(0);
  const [wishlistCount, setWishlistCount] = useState(0);
  const [categories, setCategories] = useState([]);

  // États Formulaire
  const [isEditing, setIsEditing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [formData, setFormData] = useState({
    nom: '', prenom: '', email: '', telephone: '',
    adresse: '', ville: '', code_postal: '',
  });

  useEffect(() => {
    loadPageData();
  }, []);

  const loadPageData = async () => {
    try {
      setIsLoading(true);
      
      // Chargement parallèle : Profil + Données Navbar
      const [profileRes, cartRes, wishRes, catRes] = await Promise.all([
        api.getProfile(),
        api.getCartCount(),
        api.getWishlistCount(),
        api.getCategories()
      ]);

      // Gestion Profil
      if (profileRes.success) {
        setProfile(profileRes.data);
        setFormData({
          nom: profileRes.data.nom || '',
          prenom: profileRes.data.prenom || '',
          email: profileRes.data.email || '',
          telephone: profileRes.data.telephone || '',
          adresse: profileRes.data.adresse || '',
          ville: profileRes.data.ville || '',
          code_postal: profileRes.data.code_postal || '',
        });
      }

      // Gestion Navbar
      if (cartRes.success) setCartCount(cartRes.data.count || 0);
      if (wishRes.success) setWishlistCount(wishRes.data.count || 0);
      if (catRes.success) setCategories(catRes.data || []);

    } catch (error) {
      console.error('Erreur chargement:', error);
      toast.error('Impossible de charger les données');
    } finally {
      setIsLoading(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSave = async () => {
    try {
      setIsSaving(true);
      const response = await api.updateProfile(formData);
      if (response.success) {
        setProfile(response.data);
        setIsEditing(false);
        toast.success('Profil mis à jour');
      }
    } catch (error) {
      toast.error('Erreur mise à jour');
    } finally {
      setIsSaving(false);
    }
  };

  const handleCancel = () => {
    setFormData({
      nom: profile.nom || '',
      prenom: profile.prenom || '',
      email: profile.email || '',
      telephone: profile.telephone || '',
      adresse: profile.adresse || '',
      ville: profile.ville || '',
      code_postal: profile.code_postal || '',
    });
    setIsEditing(false);
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

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#FDFBF7]">
        <Loader2 className="w-10 h-10 animate-spin text-neutral-300" />
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

      {/* HEADER MON COMPTE */}
      <div className="pt-12 pb-8 border-b border-neutral-200 bg-white">
        <div className="max-w-7xl mx-auto px-4 md:px-8 text-center">
          <div className="w-20 h-20 bg-neutral-100 rounded-full flex items-center justify-center mx-auto mb-4 text-2xl font-bold text-neutral-400">
             {profile?.prenom?.[0]}{profile?.nom?.[0]}
          </div>
          <h1 className="text-3xl md:text-4xl font-light uppercase tracking-widest mb-2">
            Bonjour, {profile?.prenom}
          </h1>
          <p className="text-xs text-neutral-400 uppercase tracking-widest">Membre depuis {new Date(profile?.created_at).getFullYear()}</p>
        </div>
      </div>

      <main className="flex-grow max-w-7xl mx-auto px-4 md:px-8 py-12 w-full">
        <div className="flex flex-col md:flex-row gap-12">
          
          {/* SIDEBAR CLIENT (Menu de Gauche) */}
          <aside className="md:w-64 flex-shrink-0">
            <nav className="space-y-1 sticky top-24">
              <button className="w-full flex items-center justify-between px-4 py-3 bg-black text-white text-xs font-bold uppercase tracking-widest">
                <span>Mon Profil</span>
                <ChevronRight className="w-4 h-4" />
              </button>
              <button className="w-full flex items-center justify-between px-4 py-3 bg-white border border-neutral-200 text-neutral-500 text-xs font-bold uppercase tracking-widest hover:border-black hover:text-black transition-colors">
                <span>Mes Commandes</span>
                <span className="bg-neutral-100 text-black px-2 py-0.5 rounded-full text-[10px]">{profile?.total_commandes || 0}</span>
              </button>
              <button className="w-full flex items-center justify-between px-4 py-3 bg-white border border-neutral-200 text-neutral-500 text-xs font-bold uppercase tracking-widest hover:border-black hover:text-black transition-colors">
                <span>Mes Favoris</span>
                <Heart className="w-4 h-4" />
              </button>
              <button className="w-full flex items-center justify-between px-4 py-3 bg-white border border-neutral-200 text-red-400 text-xs font-bold uppercase tracking-widest hover:border-red-400 hover:text-red-600 transition-colors mt-8">
                <span>Déconnexion</span>
                <LogOut className="w-4 h-4" />
              </button>
            </nav>
          </aside>

          {/* CONTENU PRINCIPAL */}
          <div className="flex-1 space-y-12">
            
            {/* STATS RAPIDES */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="bg-white p-6 border border-neutral-100 text-center">
                <Package className="w-8 h-8 mx-auto mb-4 text-neutral-300" />
                <div className="text-2xl font-bold mb-1">{profile?.total_commandes || 0}</div>
                <div className="text-[10px] uppercase tracking-widest text-neutral-500">Commandes</div>
              </div>
              <div className="bg-white p-6 border border-neutral-100 text-center">
                <ShoppingBag className="w-8 h-8 mx-auto mb-4 text-neutral-300" />
                <div className="text-2xl font-bold mb-1">{cartCount}</div>
                <div className="text-[10px] uppercase tracking-widest text-neutral-500">Dans le panier</div>
              </div>
              <div className="bg-white p-6 border border-neutral-100 text-center">
                <Calendar className="w-8 h-8 mx-auto mb-4 text-neutral-300" />
                <div className="text-2xl font-bold mb-1">{new Date().getDate()}</div>
                <div className="text-[10px] uppercase tracking-widest text-neutral-500">Jours actifs</div>
              </div>
            </div>

            {/* FORMULAIRE */}
            <div className="bg-white border border-neutral-200 p-8">
              <div className="flex items-center justify-between mb-8 pb-4 border-b border-neutral-100">
                <h2 className="text-lg font-bold uppercase tracking-widest flex items-center gap-3">
                  <User className="w-5 h-5" /> Informations Personnelles
                </h2>
                {!isEditing ? (
                  <button 
                    onClick={() => setIsEditing(true)}
                    className="flex items-center gap-2 text-xs font-bold uppercase tracking-widest border-b border-black pb-1 hover:text-neutral-500 hover:border-neutral-500 transition-colors"
                  >
                    <Edit2 className="w-3 h-3" /> Modifier
                  </button>
                ) : (
                  <div className="flex gap-4">
                    <button 
                      onClick={handleCancel}
                      className="text-xs font-bold uppercase tracking-widest text-neutral-400 hover:text-black"
                    >
                      Annuler
                    </button>
                    <button 
                      onClick={handleSave}
                      disabled={isSaving}
                      className="flex items-center gap-2 bg-black text-white px-4 py-2 text-xs font-bold uppercase tracking-widest hover:bg-neutral-800"
                    >
                      {isSaving ? <Loader2 className="w-3 h-3 animate-spin" /> : <Save className="w-3 h-3" />}
                      Enregistrer
                    </button>
                  </div>
                )}
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                {/* Prénom */}
                <div className="space-y-2">
                  <label className="text-[10px] font-bold uppercase tracking-widest text-neutral-500 flex items-center gap-2">
                    Prénom
                  </label>
                  {isEditing ? (
                    <input
                      name="prenom"
                      value={formData.prenom}
                      onChange={handleInputChange}
                      className="w-full border border-neutral-200 p-3 text-sm focus:border-black focus:outline-none transition-colors rounded-none placeholder-neutral-300"
                    />
                  ) : (
                    <p className="text-sm font-medium py-2 border-b border-transparent">{profile?.prenom}</p>
                  )}
                </div>

                {/* Nom */}
                <div className="space-y-2">
                  <label className="text-[10px] font-bold uppercase tracking-widest text-neutral-500">Nom</label>
                  {isEditing ? (
                    <input
                      name="nom"
                      value={formData.nom}
                      onChange={handleInputChange}
                      className="w-full border border-neutral-200 p-3 text-sm focus:border-black focus:outline-none transition-colors rounded-none"
                    />
                  ) : (
                    <p className="text-sm font-medium py-2">{profile?.nom}</p>
                  )}
                </div>

                {/* Email */}
                <div className="space-y-2">
                  <label className="text-[10px] font-bold uppercase tracking-widest text-neutral-500 flex items-center gap-2">
                    <Mail className="w-3 h-3" /> Email
                  </label>
                  {isEditing ? (
                    <input
                      name="email"
                      value={formData.email}
                      onChange={handleInputChange}
                      className="w-full border border-neutral-200 p-3 text-sm focus:border-black focus:outline-none transition-colors rounded-none"
                    />
                  ) : (
                    <p className="text-sm font-medium py-2">{profile?.email}</p>
                  )}
                </div>

                {/* Téléphone */}
                <div className="space-y-2">
                  <label className="text-[10px] font-bold uppercase tracking-widest text-neutral-500 flex items-center gap-2">
                    <Phone className="w-3 h-3" /> Téléphone
                  </label>
                  {isEditing ? (
                    <input
                      name="telephone"
                      value={formData.telephone}
                      onChange={handleInputChange}
                      className="w-full border border-neutral-200 p-3 text-sm focus:border-black focus:outline-none transition-colors rounded-none"
                    />
                  ) : (
                    <p className="text-sm font-medium py-2">{profile?.telephone || '—'}</p>
                  )}
                </div>

                {/* Adresse Complète */}
                <div className="md:col-span-2 space-y-2">
                  <label className="text-[10px] font-bold uppercase tracking-widest text-neutral-500 flex items-center gap-2">
                    <MapPin className="w-3 h-3" /> Adresse de livraison
                  </label>
                  {isEditing ? (
                    <input
                      name="adresse"
                      value={formData.adresse}
                      onChange={handleInputChange}
                      placeholder="Adresse, Quartier..."
                      className="w-full border border-neutral-200 p-3 text-sm focus:border-black focus:outline-none transition-colors rounded-none"
                    />
                  ) : (
                    <p className="text-sm font-medium py-2">{profile?.adresse || '—'}</p>
                  )}
                </div>

                {/* Ville & Code Postal */}
                <div className="space-y-2">
                  <label className="text-[10px] font-bold uppercase tracking-widest text-neutral-500">Ville</label>
                  {isEditing ? (
                    <input
                      name="ville"
                      value={formData.ville}
                      onChange={handleInputChange}
                      className="w-full border border-neutral-200 p-3 text-sm focus:border-black focus:outline-none transition-colors rounded-none"
                    />
                  ) : (
                    <p className="text-sm font-medium py-2">{profile?.ville || '—'}</p>
                  )}
                </div>

                <div className="space-y-2">
                  <label className="text-[10px] font-bold uppercase tracking-widest text-neutral-500">Code Postal</label>
                  {isEditing ? (
                    <input
                      name="code_postal"
                      value={formData.code_postal}
                      onChange={handleInputChange}
                      className="w-full border border-neutral-200 p-3 text-sm focus:border-black focus:outline-none transition-colors rounded-none"
                    />
                  ) : (
                    <p className="text-sm font-medium py-2">{profile?.code_postal || '—'}</p>
                  )}
                </div>
              </div>
            </div>

          </div>
        </div>
      </main>

      <SimpleFooter />
    </div>
  );
};

export default ProfilePage;