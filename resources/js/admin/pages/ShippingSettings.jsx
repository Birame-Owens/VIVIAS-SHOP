import React, { useState, useEffect } from 'react';
import { Truck, Save, AlertCircle, CheckCircle2 } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

const ShippingSettings = () => {
    const { token } = useAuth();
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState(null);
    const [success, setSuccess] = useState(null);
    
    const [settings, setSettings] = useState({
        default_cost: 2500,
        free_threshold: 50000,
        is_enabled: true
    });

    const API_BASE = '/api/admin';
    
    const getHeaders = () => {
        const headers = {
            'Authorization': `Bearer ${token}`,
            'Accept': 'application/json',
            'Content-Type': 'application/json'
        };

        const csrfToken = document.querySelector('meta[name="csrf-token"]')?.getAttribute('content');
        if (csrfToken) {
            headers['X-CSRF-TOKEN'] = csrfToken;
        }

        return headers;
    };

    useEffect(() => {
        loadSettings();
    }, []);

    const loadSettings = async () => {
        try {
            setLoading(true);
            const response = await fetch(`${API_BASE}/shipping-settings`, {
                headers: getHeaders()
            });
            
            if (!response.ok) throw new Error('Erreur lors du chargement');
            
            const result = await response.json();
            if (result.success) {
                setSettings(result.data);
            }
        } catch (err) {
            setError('Erreur lors du chargement des paramètres');
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError(null);
        setSuccess(null);
        setSaving(true);

        try {
            const response = await fetch(`${API_BASE}/shipping-settings`, {
                method: 'PUT',
                headers: getHeaders(),
                body: JSON.stringify(settings)
            });
            
            if (!response.ok) throw new Error('Erreur lors de la sauvegarde');
            
            const result = await response.json();
            if (result.success) {
                setSuccess('Paramètres enregistrés avec succès !');
                setSettings(result.data);
                setTimeout(() => setSuccess(null), 3000);
            }
        } catch (err) {
            setError(err.message || 'Erreur lors de la sauvegarde');
            console.error(err);
        } finally {
            setSaving(false);
        }
    };

    const handleChange = (field, value) => {
        setSettings(prev => ({
            ...prev,
            [field]: value
        }));
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center h-screen">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50 py-8 px-4 sm:px-6 lg:px-8">
            <div className="max-w-2xl mx-auto">
                {/* Header */}
                <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
                    <div className="flex items-center gap-3">
                        <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                            <Truck className="h-6 w-6 text-blue-600" />
                        </div>
                        <div>
                            <h1 className="text-2xl font-bold text-gray-900">Paramètres de Livraison</h1>
                            <p className="text-sm text-gray-600">Gérez les frais de livraison de votre boutique</p>
                        </div>
                    </div>
                </div>

                {/* Card principale */}
                <div className="bg-white rounded-lg shadow-sm">
                    <div className="p-6">
                        {/* Alertes */}
                        {error && (
                            <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-lg flex items-start gap-3">
                                <AlertCircle className="h-5 w-5 text-red-600 flex-shrink-0 mt-0.5" />
                                <span className="text-red-700">{error}</span>
                            </div>
                        )}
                        
                        {success && (
                            <div className="mb-4 p-4 bg-green-50 border border-green-200 rounded-lg flex items-start gap-3">
                                <CheckCircle2 className="h-5 w-5 text-green-600 flex-shrink-0 mt-0.5" />
                                <span className="text-green-700">{success}</span>
                            </div>
                        )}

                        <form onSubmit={handleSubmit} className="space-y-6">
                            {/* Activer/Désactiver la livraison */}
                            <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg border border-gray-200">
                                <div className="flex-1">
                                    <label className="text-base font-semibold text-gray-900 block mb-1">
                                        Activer la livraison
                                    </label>
                                    <p className="text-sm text-gray-600">
                                        Désactiver supprime les frais de livraison sur toutes les commandes
                                    </p>
                                </div>
                                <label className="relative inline-flex items-center cursor-pointer ml-4">
                                    <input
                                        type="checkbox"
                                        className="sr-only peer"
                                        checked={settings.is_enabled}
                                        onChange={(e) => handleChange('is_enabled', e.target.checked)}
                                    />
                                    <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                                </label>
                            </div>

                            {/* Frais de livraison par défaut */}
                            <div className="space-y-2">
                                <label htmlFor="default_cost" className="block text-sm font-medium text-gray-900">
                                    Frais de livraison par défaut (FCFA)
                                </label>
                                <input
                                    id="default_cost"
                                    type="number"
                                    min="0"
                                    step="100"
                                    value={settings.default_cost}
                                    onChange={(e) => handleChange('default_cost', parseFloat(e.target.value) || 0)}
                                    disabled={!settings.is_enabled}
                                    className="w-full px-4 py-2 text-lg border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:bg-gray-100 disabled:cursor-not-allowed"
                                />
                                <p className="text-sm text-gray-600">
                                    Montant appliqué si le seuil de livraison gratuite n'est pas atteint
                                </p>
                            </div>

                            {/* Seuil livraison gratuite */}
                            <div className="space-y-2">
                                <label htmlFor="free_threshold" className="block text-sm font-medium text-gray-900">
                                    Seuil de livraison gratuite (FCFA)
                                </label>
                                <input
                                    id="free_threshold"
                                    type="number"
                                    min="0"
                                    step="1000"
                                    value={settings.free_threshold}
                                    onChange={(e) => handleChange('free_threshold', parseFloat(e.target.value) || 0)}
                                    disabled={!settings.is_enabled}
                                    className="w-full px-4 py-2 text-lg border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:bg-gray-100 disabled:cursor-not-allowed"
                                />
                                <p className="text-sm text-gray-600">
                                    Montant du panier à partir duquel la livraison devient gratuite
                                </p>
                            </div>

                            {/* Récapitulatif */}
                            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                                <h4 className="font-semibold text-blue-900 mb-3 flex items-center gap-2">
                                    <span>📋</span>
                                    <span>Récapitulatif</span>
                                </h4>
                                <ul className="space-y-2 text-sm text-blue-800">
                                    {settings.is_enabled ? (
                                        <>
                                            <li className="flex items-center gap-2">
                                                <span className="text-green-600">✅</span>
                                                <span>Livraison activée</span>
                                            </li>
                                            <li className="flex items-center gap-2">
                                                <span>💰</span>
                                                <span>Frais: <strong>{settings.default_cost.toLocaleString()} FCFA</strong></span>
                                            </li>
                                            <li className="flex items-center gap-2">
                                                <span>🎁</span>
                                                <span>Gratuit dès: <strong>{settings.free_threshold.toLocaleString()} FCFA</strong></span>
                                            </li>
                                        </>
                                    ) : (
                                        <li className="flex items-center gap-2">
                                            <span className="text-red-600">❌</span>
                                            <span>Livraison désactivée (frais = 0 FCFA)</span>
                                        </li>
                                    )}
                                </ul>
                            </div>

                            {/* Bouton de sauvegarde */}
                            <button
                                type="submit"
                                disabled={saving}
                                className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white font-semibold py-3 px-6 rounded-lg flex items-center justify-center gap-2 transition-colors"
                            >
                                {saving ? (
                                    <>
                                        <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                                        <span>Enregistrement...</span>
                                    </>
                                ) : (
                                    <>
                                        <Save className="h-5 w-5" />
                                        <span>Enregistrer les paramètres</span>
                                    </>
                                )}
                            </button>
                        </form>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ShippingSettings;
