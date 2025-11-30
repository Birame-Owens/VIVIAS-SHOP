import React, { useState } from 'react';
import { CreditCard, Wallet, Smartphone } from 'lucide-react';

const PaymentMethodSelector = ({ onSelectMethod }) => {
  const [selectedMethod, setSelectedMethod] = useState('stripe');

  const paymentMethods = [
    {
      id: 'stripe',
      name: 'Carte Bancaire',
      description: 'Visa, Mastercard, American Express',
      icon: CreditCard,
      color: 'blue',
    },
    {
      id: 'wave',
      name: 'Wave',
      description: 'Paiement mobile Wave',
      icon: Wallet,
      color: 'indigo',
      logo: 'https://wave.com/static/logo.svg', // URL du logo Wave
    },
    {
      id: 'orange_money',
      name: 'Orange Money',
      description: 'Paiement mobile Orange',
      icon: Smartphone,
      color: 'orange',
    },
  ];

  const handleSelect = (methodId) => {
    setSelectedMethod(methodId);
    if (onSelectMethod) {
      onSelectMethod(methodId);
    }
  };

  return (
    <div className="space-y-4">
      <h3 className="text-lg font-semibold text-gray-900">
        Choisissez votre méthode de paiement
      </h3>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        {paymentMethods.map((method) => {
          const Icon = method.icon;
          const isSelected = selectedMethod === method.id;

          return (
            <button
              key={method.id}
              onClick={() => handleSelect(method.id)}
              className={`
                relative flex flex-col items-center p-6 rounded-lg border-2 transition-all
                ${
                  isSelected
                    ? `border-${method.color}-500 bg-${method.color}-50 ring-2 ring-${method.color}-500`
                    : 'border-gray-200 bg-white hover:border-gray-300'
                }
              `}
            >
              {/* Badge "Sélectionné" */}
              {isSelected && (
                <div className={`absolute top-2 right-2 bg-${method.color}-500 text-white text-xs px-2 py-1 rounded-full`}>
                  ✓ Sélectionné
                </div>
              )}

              {/* Icône ou Logo */}
              <div className={`mb-3 ${isSelected ? `text-${method.color}-600` : 'text-gray-400'}`}>
                {method.logo ? (
                  <img src={method.logo} alt={method.name} className="w-12 h-12" />
                ) : (
                  <Icon className="w-12 h-12" />
                )}
              </div>

              {/* Nom */}
              <div className={`text-base font-semibold ${isSelected ? `text-${method.color}-700` : 'text-gray-900'}`}>
                {method.name}
              </div>

              {/* Description */}
              <div className="text-sm text-gray-500 text-center mt-1">
                {method.description}
              </div>
            </button>
          );
        })}
      </div>

      {/* Informations supplémentaires selon la méthode */}
      {selectedMethod === 'wave' && (
        <div className="bg-indigo-50 border border-indigo-200 rounded-lg p-4 mt-4">
          <p className="text-sm text-indigo-800">
            💡 Vous serez redirigé vers Wave pour scanner le QR Code ou payer directement depuis votre application.
          </p>
        </div>
      )}

      {selectedMethod === 'orange_money' && (
        <div className="bg-orange-50 border border-orange-200 rounded-lg p-4 mt-4">
          <p className="text-sm text-orange-800">
            💡 Vous recevrez un code USSD à composer sur votre téléphone ou pourrez scanner un QR Code.
          </p>
        </div>
      )}

      {selectedMethod === 'stripe' && (
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mt-4">
          <p className="text-sm text-blue-800">
            💡 Paiement sécurisé par carte bancaire. Vos informations sont protégées.
          </p>
        </div>
      )}
    </div>
  );
};

export default PaymentMethodSelector;
