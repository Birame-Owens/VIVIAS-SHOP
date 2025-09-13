// ================================================================
// 📝 FICHIER: resources/js/admin/pages/Login.jsx
// ================================================================

import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-hot-toast';

const AdminLogin = () => {
    const [formData, setFormData] = useState({
        email: '',
        password: '',
        remember: false
    });
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);

        try {
            const response = await fetch('/api/admin/login', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Accept': 'application/json',
                },
                body: JSON.stringify(formData)
            });

            const data = await response.json();

            if (data.success) {
                // Stocker le token
                localStorage.setItem('admin_token', data.data.token);
                localStorage.setItem('admin_user', JSON.stringify(data.data.user));
                
                toast.success(data.message);
                
                // Rediriger vers le dashboard
                navigate('/admin/dashboard');
            } else {
                toast.error(data.message || 'Erreur de connexion');
            }
        } catch (error) {
            console.error('Erreur de connexion:', error);
            toast.error('Erreur de connexion. Veuillez réessayer.');
        } finally {
            setLoading(false);
        }
    };

    const handleChange = (e) => {
        const { name, value, type, checked } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: type === 'checkbox' ? checked : value
        }));
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-purple-600 via-blue-600 to-indigo-700 flex items-center justify-center p-4">
            <div className="max-w-md w-full">
                {/* Logo et titre */}
                <div className="text-center mb-8">
                    <div className="bg-white p-3 rounded-full inline-block mb-4 shadow-lg">
                        <svg className="w-8 h-8 text-purple-600" fill="currentColor" viewBox="0 0 24 24">
                            <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5"/>
                        </svg>
                    </div>
                    <h1 className="text-3xl font-bold text-white mb-2">VIVIAS SHOP</h1>
                    <p className="text-blue-100">Administration</p>
                </div>

                {/* Formulaire de connexion */}
                <div className="bg-white rounded-2xl shadow-2xl p-8">
                    <h2 className="text-2xl font-bold text-gray-800 mb-6 text-center">
                        Connexion Administrateur
                    </h2>

                    <form onSubmit={handleSubmit} className="space-y-6">
                        {/* Email */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Adresse email
                            </label>
                            <div className="relative">
                                <input
                                    type="email"
                                    name="email"
                                    value={formData.email}
                                    onChange={handleChange}
                                    required
                                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all duration-200 pl-12"
                                    placeholder="admin@vivias-shop.com"
                                />
                                <div className="absolute inset-y-0 left-0 pl-3 flex items-center">
                                    <svg className="w-5 h-5 text-gray-400" fill="currentColor" viewBox="0 0 24 24">
                                        <path d="M20 4H4c-1.1 0-1.99.9-1.99 2L2 18c0 1.1.89 2 2 2h16c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2zm0 4l-8 5-8-5V6l8 5 8-5v2z"/>
                                    </svg>
                                </div>
                            </div>
                        </div>

                        {/* Mot de passe */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Mot de passe
                            </label>
                            <div className="relative">
                                <input
                                    type="password"
                                    name="password"
                                    value={formData.password}
                                    onChange={handleChange}
                                    required
                                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all duration-200 pl-12"
                                    placeholder="••••••••"
                                />
                                <div className="absolute inset-y-0 left-0 pl-3 flex items-center">
                                    <svg className="w-5 h-5 text-gray-400" fill="currentColor" viewBox="0 0 24 24">
                                        <path d="M18,8h-1V6c0-2.76-2.24-5-5-5S7,3.24,7,6v2H6c-1.1,0-2,0.9-2,2v10c0,1.1,0.9,2,2,2h12c1.1,0,2-0.9,2-2V10C20,8.9,19.1,8,18,8z M12,17c-1.1,0-2-0.9-2-2s0.9-2,2-2s2,0.9,2,2S13.1,17,12,17z M15.1,8H8.9V6c0-1.71,1.39-3.1,3.1-3.1s3.1,1.39,3.1,3.1V8z"/>
                                    </svg>
                                </div>
                            </div>
                        </div>

                        {/* Se souvenir de moi */}
                        <div className="flex items-center">
                            <input
                                type="checkbox"
                                name="remember"
                                checked={formData.remember}
                                onChange={handleChange}
                                className="h-4 w-4 text-purple-600 focus:ring-purple-500 border-gray-300 rounded"
                            />
                            <label className="ml-2 block text-sm text-gray-700">
                                Se souvenir de moi
                            </label>
                        </div>

                        {/* Bouton de connexion */}
                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full bg-gradient-to-r from-purple-600 to-indigo-600 text-white py-3 px-4 rounded-lg font-semibold shadow-lg hover:from-purple-700 hover:to-indigo-700 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-offset-2 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            {loading ? (
                                <div className="flex items-center justify-center">
                                    <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" fill="none" viewBox="0 0 24 24">
                                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
                                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"/>
                                    </svg>
                                    Connexion en cours...
                                </div>
                            ) : (
                                'Se connecter'
                            )}
                        </button>
                    </form>

                    {/* Informations de test */}
                    <div className="mt-6 p-4 bg-gray-50 rounded-lg">
                        <p className="text-sm text-gray-600 text-center mb-2">
                            <strong>Comptes de test :</strong>
                        </p>
                        <div className="text-xs text-gray-500 space-y-1">
                            <p>📧 admin@vivias-shop.com</p>
                            <p>🔑 password123</p>
                            <hr className="my-2" />
                            <p>📧 diopbirame8@gmail.com</p>
                            <p>🔑 vivias2024</p>
                        </div>
                    </div>
                </div>

                {/* Footer */}
                <div className="text-center mt-8">
                    <p className="text-blue-100 text-sm">
                        © 2024 VIVIAS SHOP - Boutique de mode sénégalaise
                    </p>
                </div>
            </div>
        </div>
    );
};

export default AdminLogin;