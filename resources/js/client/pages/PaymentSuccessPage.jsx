// src/pages/PaymentSuccessPage.jsx
import React, { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { CheckCircle, Loader, Package } from 'lucide-react';
import api from '../utils/api';

const PaymentSuccessPage = () => {
  const [loading, setLoading] = useState(true);
  const [paymentStatus, setPaymentStatus] = useState(null);
  const location = useLocation();

  useEffect(() => {
    verifyPayment();
  }, []);

  const verifyPayment = async () => {
    const params = new URLSearchParams(location.search);
    const sessionId = params.get('session_id');

    if (!sessionId) {
      setPaymentStatus({ success: false, message: 'Session invalide' });
      setLoading(false);
      return;
    }

    try {
      // Vérifier le statut du paiement
      const response = await api.verifyStripePayment(sessionId);
      
      if (response.success) {
        setPaymentStatus({
          success: true,
          commande: response.data.commande,
          message: 'Paiement confirmé avec succès !'
        });

        // Recharger le nombre d'articles dans le panier (devrait être 0)
        await api.getCartCount();
      } else {
        setPaymentStatus({
          success: false,
          message: response.message || 'Erreur lors de la vérification du paiement'
        });
      }
    } catch (error) {
      console.error('Erreur vérification paiement:', error);
      setPaymentStatus({
        success: false,
        message: 'Erreur lors de la vérification du paiement'
      });
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-purple-50 to-pink-50">
        <div className="text-center">
          <Loader className="h-16 w-16 text-purple-600 animate-spin mx-auto mb-4" />
          <p className="text-gray-600 text-lg">Vérification du paiement...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-purple-50 to-pink-50 p-4">
      <div className="max-w-md w-full">
        {paymentStatus?.success ? (
          <div className="bg-white rounded-2xl shadow-xl p-8 text-center">
            <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <CheckCircle className="h-12 w-12 text-green-600" />
            </div>
            
            <h1 className="text-3xl font-bold text-gray-900 mb-4">
              Paiement réussi !
            </h1>
            
            <p className="text-gray-600 mb-6">
              Votre commande <span className="font-bold text-purple-600">
                {paymentStatus.commande?.numero_commande}
              </span> a été confirmée et est maintenant en préparation.
            </p>

            <div className="bg-purple-50 rounded-xl p-4 mb-6">
              <div className="flex items-center justify-center gap-2 text-purple-700 mb-2">
                <Package className="h-5 w-5" />
                <span className="font-semibold">Prochaine étape</span>
              </div>
              <p className="text-sm text-purple-600">
                Vous recevrez une notification lorsque votre commande sera prête pour la livraison.
              </p>
            </div>

            <div className="space-y-3">
              <button
                onClick={() => window.location.href = '/profile'}
                className="w-full bg-gradient-to-r from-purple-600 to-pink-600 text-white py-3 rounded-xl font-semibold hover:from-purple-700 hover:to-pink-700 transition-all"
              >
                Voir mes commandes
              </button>
              
              <button
                onClick={() => window.location.href = '/'}
                className="w-full bg-gray-100 text-gray-700 py-3 rounded-xl font-semibold hover:bg-gray-200 transition-all"
              >
                Retour à l'accueil
              </button>
            </div>
          </div>
        ) : (
          <div className="bg-white rounded-2xl shadow-xl p-8 text-center">
            <div className="w-20 h-20 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <svg className="h-12 w-12 text-red-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </div>
            
            <h1 className="text-3xl font-bold text-gray-900 mb-4">
              Erreur de paiement
            </h1>
            
            <p className="text-gray-600 mb-6">
              {paymentStatus?.message}
            </p>

            <button
              onClick={() => window.location.href = '/checkout'}
              className="w-full bg-gradient-to-r from-purple-600 to-pink-600 text-white py-3 rounded-xl font-semibold hover:from-purple-700 hover:to-pink-700 transition-all"
            >
              Réessayer
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default PaymentSuccessPage;