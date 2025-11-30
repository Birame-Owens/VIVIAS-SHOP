import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import api from '../utils/api';
import Navbar from '../components/Navbar';
import { User, Mail, Phone, MapPin, Package, Receipt, LogOut, Edit, Loader2 } from 'lucide-react';
import toast from 'react-hot-toast';

function AccountPage() {
  const navigate = useNavigate();
  const { user, logout, isAuthenticated } = useAuth();
  const [loading, setLoading] = useState(true);
  const [profile, setProfile] = useState(null);
  const [stats, setStats] = useState({
    totalOrders: 0,
    totalSpent: 0,
    pendingOrders: 0
  });

  useEffect(() => {
    if (!isAuthenticated) {
      navigate('/');
      return;
    }
    loadProfile();
  }, [isAuthenticated]);

  const loadProfile = async () => {
    try {
      setLoading(true);
      const [profileResponse, ordersResponse] = await Promise.all([
        api.getProfile(),
        api.getOrders()
      ]);

      if (profileResponse.success) {
        setProfile(profileResponse.data);
      }

      if (ordersResponse.success) {
        const orders = ordersResponse.data;
        setStats({
          totalOrders: orders.length,
          totalSpent: orders.reduce((sum, order) => sum + parseFloat(order.montant_total || 0), 0),
          pendingOrders: orders.filter(o => ['en_attente', 'confirmee'].includes(o.statut)).length
        });
      }
    } catch (error) {
      console.error('Erreur chargement profil:', error);
      toast.error('Erreur lors du chargement du profil');
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = async () => {
    try {
      await logout();
      navigate('/');
      toast.success('Déconnexion réussie');
    } catch (error) {
      console.error('Erreur déconnexion:', error);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#FDFBF7]">
        <Loader2 className="w-8 h-8 animate-spin text-black" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#FDFBF7]">
      <Navbar />
      
      <div className="py-6 md:py-8 px-4 md:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto">
          {/* Header */}
          <div className="mb-6 md:mb-8">
            <h1 className="text-2xl md:text-3xl font-bold tracking-wide mb-2">MON COMPTE</h1>
            <p className="text-sm md:text-base text-gray-600">Gérez vos informations et commandes</p>
          </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3 md:gap-4 mb-6 md:mb-8">
          <div className="bg-white p-4 md:p-6 rounded-lg shadow-sm border border-gray-100">
            <div className="flex items-center gap-2 md:gap-3 mb-2">
              <Package className="w-4 md:w-5 h-4 md:h-5 text-black" />
              <span className="text-xs md:text-sm text-gray-600 uppercase tracking-wider">Commandes</span>
            </div>
            <p className="text-xl md:text-2xl font-bold">{stats.totalOrders}</p>
          </div>

          <div className="bg-white p-4 md:p-6 rounded-lg shadow-sm border border-gray-100">
            <div className="flex items-center gap-2 md:gap-3 mb-2">
              <Receipt className="w-4 md:w-5 h-4 md:h-5 text-black" />
              <span className="text-xs md:text-sm text-gray-600 uppercase tracking-wider">Total dépensé</span>
            </div>
            <p className="text-xl md:text-2xl font-bold">{stats.totalSpent.toLocaleString('fr-FR')} FCFA</p>
          </div>

          <div className="bg-white p-4 md:p-6 rounded-lg shadow-sm border border-gray-100 sm:col-span-2 md:col-span-1">
            <div className="flex items-center gap-2 md:gap-3 mb-2">
              <Package className="w-4 md:w-5 h-4 md:h-5 text-orange-500" />
              <span className="text-xs md:text-sm text-gray-600 uppercase tracking-wider">En cours</span>
            </div>
            <p className="text-xl md:text-2xl font-bold">{stats.pendingOrders}</p>
          </div>
        </div>

        {/* Profile Information */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-100 p-4 md:p-6 mb-4 md:mb-6">
          <div className="flex items-center justify-between mb-4 md:mb-6">
            <h2 className="text-lg md:text-xl font-bold tracking-wide">INFORMATIONS PERSONNELLES</h2>
          </div>

          <div className="space-y-3 md:space-y-4">
            <div className="flex items-start gap-2 md:gap-3">
              <User className="w-4 md:w-5 h-4 md:h-5 text-gray-400 mt-0.5" />
              <div>
                <p className="text-xs md:text-sm text-gray-600 uppercase tracking-wider mb-1">Nom complet</p>
                <p className="font-medium text-sm md:text-base">{profile?.prenom} {profile?.nom}</p>
              </div>
            </div>

            <div className="flex items-start gap-2 md:gap-3">
              <Mail className="w-4 md:w-5 h-4 md:h-5 text-gray-400 mt-0.5" />
              <div>
                <p className="text-xs md:text-sm text-gray-600 uppercase tracking-wider mb-1">Email</p>
                <p className="font-medium text-sm md:text-base">{profile?.email || 'Non renseigné'}</p>
              </div>
            </div>

            <div className="flex items-start gap-2 md:gap-3">
              <Phone className="w-4 md:w-5 h-4 md:h-5 text-gray-400 mt-0.5" />
              <div>
                <p className="text-xs md:text-sm text-gray-600 uppercase tracking-wider mb-1">Téléphone</p>
                <p className="font-medium text-sm md:text-base">{profile?.telephone}</p>
              </div>
            </div>

            <div className="flex items-start gap-2 md:gap-3">
              <MapPin className="w-4 md:w-5 h-4 md:h-5 text-gray-400 mt-0.5" />
              <div>
                <p className="text-xs md:text-sm text-gray-600 uppercase tracking-wider mb-1">Adresse</p>
                <p className="font-medium text-sm md:text-base">
                  {profile?.adresse_principale || 'Non renseignée'}
                  {profile?.ville && `, ${profile.ville}`}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 md:gap-4 mb-4 md:mb-6">
          <Link
            to="/orders"
            className="bg-black text-white p-3 md:p-4 rounded-lg flex items-center justify-between hover:bg-gray-800 transition-colors"
          >
            <span className="font-medium text-sm md:text-base">MES COMMANDES</span>
            <Package className="w-4 md:w-5 h-4 md:h-5" />
          </Link>

          <button
            onClick={handleLogout}
            className="bg-white border-2 border-black text-black p-3 md:p-4 rounded-lg flex items-center justify-between hover:bg-gray-50 transition-colors"
          >
            <span className="font-medium text-sm md:text-base">SE DÉCONNECTER</span>
            <LogOut className="w-4 md:w-5 h-4 md:h-5" />
          </button>
        </div>

        {/* Client Type Badge */}
        {profile?.type_client && (
          <div className="bg-gradient-to-r from-black to-gray-800 text-white p-4 md:p-5 rounded-lg text-center">
            <p className="text-xs md:text-sm uppercase tracking-wider mb-1">Statut Client</p>
            <p className="text-lg md:text-xl font-bold uppercase">{profile.type_client}</p>
            {profile.score_fidelite > 0 && (
              <p className="text-xs md:text-sm mt-2 opacity-90">{profile.score_fidelite} points de fidélité</p>
            )}
          </div>
        )}
        </div>
      </div>
    </div>
  );
}

export default AccountPage;
