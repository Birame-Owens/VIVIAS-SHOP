import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import api from '../utils/api';
import Navbar from '../components/Navbar';
import { Package, Clock, CheckCircle, XCircle, Truck, ChevronRight, Loader2, ArrowLeft } from 'lucide-react';
import toast from 'react-hot-toast';

export default function OrdersPage() {
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();
  const [loading, setLoading] = useState(true);
  const [orders, setOrders] = useState([]);
  const [filter, setFilter] = useState('all');

  useEffect(() => {
    if (!isAuthenticated) {
      navigate('/');
      return;
    }
    loadOrders();
  }, [isAuthenticated]);

  const loadOrders = async () => {
    try {
      setLoading(true);
      const response = await api.getOrders();
      
      if (response.success) {
        setOrders(response.data);
      } else {
        toast.error('Erreur lors du chargement des commandes');
      }
    } catch (error) {
      console.error('Erreur chargement commandes:', error);
      toast.error('Erreur lors du chargement des commandes');
    } finally {
      setLoading(false);
    }
  };

  const getStatusConfig = (status) => {
    const configs = {
      'en_attente': { 
        color: 'bg-yellow-100 text-yellow-800 border-yellow-200', 
        icon: Clock, 
        label: 'En attente' 
      },
      'confirmee': { 
        color: 'bg-blue-100 text-blue-800 border-blue-200', 
        icon: CheckCircle, 
        label: 'Confirmée' 
      },
      'en_preparation': { 
        color: 'bg-purple-100 text-purple-800 border-purple-200', 
        icon: Package, 
        label: 'En préparation' 
      },
      'en_cours_livraison': { 
        color: 'bg-indigo-100 text-indigo-800 border-indigo-200', 
        icon: Truck, 
        label: 'En livraison' 
      },
      'livree': { 
        color: 'bg-green-100 text-green-800 border-green-200', 
        icon: CheckCircle, 
        label: 'Livrée' 
      },
      'annulee': { 
        color: 'bg-red-100 text-red-800 border-red-200', 
        icon: XCircle, 
        label: 'Annulée' 
      }
    };
    return configs[status] || configs['en_attente'];
  };

  const filteredOrders = filter === 'all' 
    ? orders 
    : orders.filter(order => order.statut === filter);

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
        <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <Link 
            to="/account" 
            className="inline-flex items-center gap-2 text-gray-600 hover:text-black mb-4"
          >
            <ArrowLeft className="w-4 h-4" />
            Retour au compte
          </Link>
          <h1 className="text-2xl md:text-3xl font-bold tracking-wide mb-2">MES COMMANDES</h1>
          <p className="text-gray-600 text-sm md:text-base">{orders.length} commande{orders.length > 1 ? 's' : ''} au total</p>
        </div>

        {/* Filters */}
        <div className="flex gap-2 mb-6 overflow-x-auto pb-2">
          <button
            onClick={() => setFilter('all')}
            className={`px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-colors ${
              filter === 'all' 
                ? 'bg-black text-white' 
                : 'bg-white border border-gray-200 text-gray-700 hover:border-black'
            }`}
          >
            Toutes ({orders.length})
          </button>
          <button
            onClick={() => setFilter('en_attente')}
            className={`px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-colors ${
              filter === 'en_attente' 
                ? 'bg-black text-white' 
                : 'bg-white border border-gray-200 text-gray-700 hover:border-black'
            }`}
          >
            En attente ({orders.filter(o => o.statut === 'en_attente').length})
          </button>
          <button
            onClick={() => setFilter('en_cours_livraison')}
            className={`px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-colors ${
              filter === 'en_cours_livraison' 
                ? 'bg-black text-white' 
                : 'bg-white border border-gray-200 text-gray-700 hover:border-black'
            }`}
          >
            En livraison ({orders.filter(o => o.statut === 'en_cours_livraison').length})
          </button>
          <button
            onClick={() => setFilter('livree')}
            className={`px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-colors ${
              filter === 'livree' 
                ? 'bg-black text-white' 
                : 'bg-white border border-gray-200 text-gray-700 hover:border-black'
            }`}
          >
            Livrées ({orders.filter(o => o.statut === 'livree').length})
          </button>
        </div>

        {/* Orders List */}
        {filteredOrders.length === 0 ? (
          <div className="text-center py-12 bg-white rounded-lg border border-gray-100">
            <Package className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <p className="text-gray-600 text-lg mb-2">Aucune commande</p>
            <p className="text-gray-400">Vous n'avez pas encore passé de commande</p>
            <Link 
              to="/" 
              className="inline-block mt-6 bg-black text-white px-6 py-3 rounded-lg hover:bg-gray-800 transition-colors"
            >
              Découvrir la collection
            </Link>
          </div>
        ) : (
          <div className="space-y-4">
            {filteredOrders.map((order) => {
              const statusConfig = getStatusConfig(order.statut);
              const StatusIcon = statusConfig.icon;
              const orderDate = new Date(order.created_at);
              
              return (
                <Link
                  key={order.id}
                  to={`/orders/${order.id}`}
                  className="block bg-white rounded-lg shadow-sm border border-gray-100 p-6 hover:shadow-md transition-shadow"
                >
                  <div className="flex items-start justify-between mb-4">
                    <div>
                      <p className="text-sm text-gray-600 mb-1">
                        Commande #{order.numero_commande}
                      </p>
                      <p className="text-xs text-gray-400">
                        {orderDate.toLocaleDateString('fr-FR', { 
                          day: 'numeric', 
                          month: 'long', 
                          year: 'numeric' 
                        })}
                      </p>
                    </div>
                    <div className={`flex items-center gap-2 px-3 py-1.5 rounded-full border ${statusConfig.color}`}>
                      <StatusIcon className="w-4 h-4" />
                      <span className="text-sm font-medium">{statusConfig.label}</span>
                    </div>
                  </div>

                  {/* Products Preview */}
                  <div className="flex gap-2 md:gap-3 mb-4 overflow-x-auto pb-2">
                    {order.articles?.slice(0, 3).map((article, idx) => (
                      <div key={idx} className="flex-shrink-0">
                        {article.produit?.image ? (
                          <img
                            src={article.produit.image}
                            alt={article.produit.nom}
                            className="w-14 h-14 md:w-16 md:h-16 object-cover rounded"
                            loading="lazy"
                            onError={(e) => {
                              e.target.onerror = null;
                              e.target.style.display = 'none';
                              e.target.nextSibling.style.display = 'flex';
                            }}
                          />
                        ) : (
                          <div className="w-14 h-14 md:w-16 md:h-16 bg-gray-100 rounded flex items-center justify-center">
                            <Package className="w-6 h-6 text-gray-400" />
                          </div>
                        )}
                        <div className="w-14 h-14 md:w-16 md:h-16 bg-gray-100 rounded items-center justify-center hidden">
                          <Package className="w-6 h-6 text-gray-400" />
                        </div>
                      </div>
                    ))}
                    {order.articles?.length > 3 && (
                      <div className="flex-shrink-0 w-14 h-14 md:w-16 md:h-16 bg-gray-100 rounded flex items-center justify-center">
                        <span className="text-xs md:text-sm text-gray-600 font-medium">+{order.articles.length - 3}</span>
                      </div>
                    )}
                  </div>

                  <div className="flex items-center justify-between flex-wrap gap-2">
                    <div>
                      <p className="text-xs md:text-sm text-gray-600">
                        {order.articles?.length || 0} article{order.articles?.length > 1 ? 's' : ''}
                      </p>
                      <p className="text-lg md:text-xl font-bold mt-1">
                        {parseFloat(order.montant_total || 0).toLocaleString('fr-FR')} FCFA
                      </p>
                    </div>
                    <ChevronRight className="w-5 h-5 text-gray-400" />
                  </div>
                </Link>
              );
            })}
          </div>
        )}
      </div>
    </div>
    </div>
  );
}
