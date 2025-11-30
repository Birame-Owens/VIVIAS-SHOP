import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import api from '../utils/api';
import Navbar from '../components/Navbar';
import { ArrowLeft, Package, Clock, CheckCircle, XCircle, Truck, MapPin, Phone, User, Loader2 } from 'lucide-react';
import toast from 'react-hot-toast';

export default function OrderDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();
  const [loading, setLoading] = useState(true);
  const [order, setOrder] = useState(null);

  useEffect(() => {
    if (!isAuthenticated) {
      navigate('/');
      return;
    }
    loadOrderDetails();
  }, [id, isAuthenticated]);

  const loadOrderDetails = async () => {
    try {
      setLoading(true);
      const response = await api.getOrderDetails(id);
      
      if (response.success) {
        setOrder(response.data);
      } else {
        toast.error('Commande non trouvée');
        navigate('/orders');
      }
    } catch (error) {
      console.error('Erreur chargement détails commande:', error);
      toast.error('Erreur lors du chargement de la commande');
      navigate('/orders');
    } finally {
      setLoading(false);
    }
  };

  const getStatusConfig = (status) => {
    const configs = {
      'en_attente': { 
        color: 'bg-yellow-100 text-yellow-800 border-yellow-200', 
        icon: Clock, 
        label: 'En attente',
        description: 'Votre commande est en attente de confirmation'
      },
      'confirmee': { 
        color: 'bg-blue-100 text-blue-800 border-blue-200', 
        icon: CheckCircle, 
        label: 'Confirmée',
        description: 'Votre commande a été confirmée'
      },
      'en_preparation': { 
        color: 'bg-purple-100 text-purple-800 border-purple-200', 
        icon: Package, 
        label: 'En préparation',
        description: 'Votre commande est en cours de préparation'
      },
      'en_cours_livraison': { 
        color: 'bg-indigo-100 text-indigo-800 border-indigo-200', 
        icon: Truck, 
        label: 'En livraison',
        description: 'Votre commande est en cours de livraison'
      },
      'livree': { 
        color: 'bg-green-100 text-green-800 border-green-200', 
        icon: CheckCircle, 
        label: 'Livrée',
        description: 'Votre commande a été livrée'
      },
      'annulee': { 
        color: 'bg-red-100 text-red-800 border-red-200', 
        icon: XCircle, 
        label: 'Annulée',
        description: 'Cette commande a été annulée'
      }
    };
    return configs[status] || configs['en_attente'];
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#FDFBF7]">
        <Loader2 className="w-8 h-8 animate-spin text-black" />
      </div>
    );
  }

  if (!order) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#FDFBF7]">
        <div className="text-center">
          <Package className="w-16 h-16 text-gray-300 mx-auto mb-4" />
          <p className="text-gray-600 mb-4">Commande non trouvée</p>
          <Link to="/orders" className="text-black underline">
            Retour aux commandes
          </Link>
        </div>
      </div>
    );
  }

  const statusConfig = getStatusConfig(order.statut);
  const StatusIcon = statusConfig.icon;
  const orderDate = new Date(order.created_at);

  return (
    <div className="min-h-screen bg-[#FDFBF7]">
      <Navbar />
      
      <div className="py-6 md:py-8 px-4 md:px-6 lg:px-8">
        <div className="max-w-5xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <Link 
            to="/orders" 
            className="inline-flex items-center gap-2 text-gray-600 hover:text-black mb-4"
          >
            <ArrowLeft className="w-4 h-4" />
            Retour aux commandes
          </Link>
          
          <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
            <div>
              <h1 className="text-2xl md:text-3xl font-bold tracking-wide mb-2">
                Commande #{order.numero_commande}
              </h1>
              <p className="text-sm md:text-base text-gray-600">
                {orderDate.toLocaleDateString('fr-FR', { 
                  day: 'numeric', 
                  month: 'long', 
                  year: 'numeric',
                  hour: '2-digit',
                  minute: '2-digit'
                })}
              </p>
            </div>
            <div className={`flex items-center gap-2 px-3 md:px-4 py-1.5 md:py-2 rounded-full border ${statusConfig.color}`}>
              <StatusIcon className="w-4 md:w-5 h-4 md:h-5" />
              <span className="text-sm md:text-base font-medium">{statusConfig.label}</span>
            </div>
          </div>
        </div>

        <div className="grid lg:grid-cols-3 gap-6">
          {/* Colonne principale */}
          <div className="lg:col-span-2 space-y-6">
            {/* Articles */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-100 p-4 md:p-6">
              <h2 className="text-lg md:text-xl font-bold mb-4">Articles commandés</h2>
              <div className="space-y-4">
                {order.articles?.map((article, idx) => (
                  <div key={idx} className="flex gap-3 md:gap-4 pb-4 border-b border-gray-100 last:border-0">
                    {/* Image */}
                    <div className="flex-shrink-0">
                      {article.produit?.image ? (
                        <img
                          src={article.produit.image}
                          alt={article.produit.nom}
                          className="w-20 h-20 md:w-24 md:h-24 object-cover rounded"
                          loading="lazy"
                          onError={(e) => {
                            e.target.onerror = null;
                            e.target.style.display = 'none';
                            e.target.nextSibling.style.display = 'flex';
                          }}
                        />
                      ) : (
                        <div className="w-20 h-20 md:w-24 md:h-24 bg-gray-100 rounded flex items-center justify-center">
                          <Package className="w-8 h-8 text-gray-400" />
                        </div>
                      )}
                      <div className="w-20 h-20 md:w-24 md:h-24 bg-gray-100 rounded items-center justify-center hidden">
                        <Package className="w-8 h-8 text-gray-400" />
                      </div>
                    </div>

                    {/* Détails */}
                    <div className="flex-1 min-w-0">
                      <h3 className="font-semibold text-base md:text-lg mb-1 truncate">
                        {article.produit?.nom || 'Produit'}
                      </h3>
                      <div className="text-xs md:text-sm text-gray-600 space-y-1">
                        {article.taille && (
                          <p>Taille: <span className="font-medium">{article.taille}</span></p>
                        )}
                        {article.couleur && (
                          <p>Couleur: <span className="font-medium">{article.couleur}</span></p>
                        )}
                        <p>Quantité: <span className="font-medium">{article.quantite}</span></p>
                      </div>
                    </div>

                    {/* Prix */}
                    <div className="text-right">
                      <p className="font-bold text-base md:text-lg">
                        {parseFloat(article.prix_unitaire * article.quantite).toLocaleString('fr-FR')} FCFA
                      </p>
                      <p className="text-xs md:text-sm text-gray-500">
                        {parseFloat(article.prix_unitaire).toLocaleString('fr-FR')} FCFA × {article.quantite}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Informations de livraison */}
            {order.adresse_livraison && (
              <div className="bg-white rounded-lg shadow-sm border border-gray-100 p-4 md:p-6">
                <h2 className="text-lg md:text-xl font-bold mb-4">Informations de livraison</h2>
                <div className="space-y-3">
                  {order.nom_destinataire && (
                    <div className="flex items-start gap-3">
                      <User className="w-5 h-5 text-gray-400 mt-0.5" />
                      <div>
                        <p className="text-sm text-gray-600">Destinataire</p>
                        <p className="font-medium">{order.nom_destinataire}</p>
                      </div>
                    </div>
                  )}
                  {order.telephone_livraison && (
                    <div className="flex items-start gap-3">
                      <Phone className="w-5 h-5 text-gray-400 mt-0.5" />
                      <div>
                        <p className="text-sm text-gray-600">Téléphone</p>
                        <p className="font-medium">{order.telephone_livraison}</p>
                      </div>
                    </div>
                  )}
                  <div className="flex items-start gap-3">
                    <MapPin className="w-5 h-5 text-gray-400 mt-0.5" />
                    <div>
                      <p className="text-sm text-gray-600">Adresse</p>
                      <p className="font-medium">{order.adresse_livraison}</p>
                    </div>
                  </div>
                  {order.instructions_livraison && (
                    <div className="mt-4 p-4 bg-gray-50 rounded-lg">
                      <p className="text-sm text-gray-600 mb-1">Instructions</p>
                      <p className="text-sm">{order.instructions_livraison}</p>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>

          {/* Colonne latérale - Résumé */}
          <div className="space-y-4 md:space-y-6">
            {/* Statut */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-100 p-4 md:p-6">
              <h3 className="font-bold mb-3 text-base md:text-lg">Statut de la commande</h3>
              <p className="text-sm text-gray-600">{statusConfig.description}</p>
              
              {order.date_livraison_prevue && order.statut !== 'livree' && (
                <div className="mt-4 p-3 bg-blue-50 rounded-lg">
                  <p className="text-sm text-gray-600">Livraison prévue</p>
                  <p className="font-medium">
                    {new Date(order.date_livraison_prevue).toLocaleDateString('fr-FR', {
                      day: 'numeric',
                      month: 'long',
                      year: 'numeric'
                    })}
                  </p>
                </div>
              )}
              
              {order.date_livraison_reelle && (
                <div className="mt-4 p-3 bg-green-50 rounded-lg">
                  <p className="text-sm text-gray-600">Livrée le</p>
                  <p className="font-medium">
                    {new Date(order.date_livraison_reelle).toLocaleDateString('fr-FR', {
                      day: 'numeric',
                      month: 'long',
                      year: 'numeric'
                    })}
                  </p>
                </div>
              )}
            </div>

            {/* Récapitulatif */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-100 p-4 md:p-6">
              <h3 className="font-bold mb-4 text-base md:text-lg">Récapitulatif</h3>
              <div className="space-y-3">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Sous-total</span>
                  <span className="font-medium">
                    {parseFloat(order.sous_total || 0).toLocaleString('fr-FR')} FCFA
                  </span>
                </div>
                
                {order.frais_livraison > 0 && (
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Frais de livraison</span>
                    <span className="font-medium">
                      {parseFloat(order.frais_livraison).toLocaleString('fr-FR')} FCFA
                    </span>
                  </div>
                )}
                
                {order.remise > 0 && (
                  <div className="flex justify-between text-sm text-green-600">
                    <span>Réduction</span>
                    <span className="font-medium">
                      -{parseFloat(order.remise).toLocaleString('fr-FR')} FCFA
                    </span>
                  </div>
                )}
                
                {order.montant_tva > 0 && (
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">TVA</span>
                    <span className="font-medium">
                      {parseFloat(order.montant_tva).toLocaleString('fr-FR')} FCFA
                    </span>
                  </div>
                )}
                
                <div className="pt-3 border-t border-gray-200">
                  <div className="flex justify-between items-center">
                    <span className="font-bold text-base md:text-lg">Total</span>
                    <span className="font-bold text-lg md:text-xl">
                      {parseFloat(order.montant_total || 0).toLocaleString('fr-FR')} FCFA
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Paiements */}
            {order.paiements && order.paiements.length > 0 && (
              <div className="bg-white rounded-lg shadow-sm border border-gray-100 p-4 md:p-6">
                <h3 className="font-bold mb-4 text-base md:text-lg">Paiements</h3>
                <div className="space-y-3">
                  {order.paiements.map((paiement, idx) => (
                    <div key={idx} className="p-3 bg-gray-50 rounded-lg">
                      <div className="flex justify-between items-start mb-1">
                        <span className="text-sm font-medium">{paiement.mode_paiement}</span>
                        <span className="text-sm font-bold">
                          {parseFloat(paiement.montant).toLocaleString('fr-FR')} FCFA
                        </span>
                      </div>
                      <p className="text-xs text-gray-500">
                        {new Date(paiement.created_at).toLocaleDateString('fr-FR')}
                      </p>
                      {paiement.statut && (
                        <span className={`inline-block mt-2 text-xs px-2 py-1 rounded ${
                          paiement.statut === 'reussi' 
                            ? 'bg-green-100 text-green-700' 
                            : 'bg-yellow-100 text-yellow-700'
                        }`}>
                          {paiement.statut}
                        </span>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
    </div>
  );
}
