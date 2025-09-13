import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const AdminLogin = () => {
    const [formData, setFormData] = useState({
        email: '',
        password: '',
        remember: false
    });
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();
    const { login, user, isAuthenticated } = useAuth();

    // Rediriger si déjà connecté
    useEffect(() => {
        if (isAuthenticated()) {
            console.log('✅ Utilisateur déjà connecté, redirection...');
            navigate('/admin/dashboard');
        }
    }, [user, isAuthenticated, navigate]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);

        console.log('🔐 Tentative de connexion depuis Login.jsx...', formData.email);

        try {
            const result = await login(formData);

            if (result.success) {
                console.log('✅ Connexion réussie, redirection vers dashboard');
                navigate('/admin/dashboard');
            } else {
                console.log('❌ Échec de connexion:', result.message);
            }
        } catch (error) {
            console.error('❌ Erreur lors de la connexion:', error);
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

    const fillTestCredentials = (userType) => {
        if (userType === 'admin1') {
            setFormData({
                email: 'admin@vivias-shop.com',
                password: 'amina123',
                remember: false
            });
        } else if (userType === 'admin2') {
            setFormData({
                email: 'diopbirame8@gmail.com',
                password: 'vivias2024',
                remember: false
            });
        }
    };

    return (
        <div className="min-h-screen bg-gray-100 flex items-center justify-center p-4">
            <div className="w-full max-w-sm">
                
                {/* Bloc principal compact */}
                <div className="bg-white rounded-lg shadow-lg p-6">
                    
                    {/* Logo large */}
                    <div className="text-center mb-6">
                        <img 
                            src="/assets/images/vivias.jpg" 
                            alt="VIVIA'S SHOP Logo" 
                            className="w-32 h-32 object-cover rounded-full mx-auto mb-3 shadow-lg"
                        />
                        <p className="text-gray-600 text-sm mb-1">
                            Administration
                        </p>
                    </div>

                    {/* Formulaire compact */}
                    <form className="space-y-4" onSubmit={handleSubmit}>
                        
                        {/* Email */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                Adresse email
                            </label>
                            <input
                                name="email"
                                type="email"
                                value={formData.email}
                                onChange={handleChange}
                                required
                                className="w-full px-3 py-2 border border-gray-300 rounded-md bg-gray-50 focus:bg-white focus:border-purple-500 focus:outline-none transition-all text-sm"
                                placeholder="exemple@vivias-shop.com"
                            />
                        </div>

                        {/* Mot de passe */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                Mot de passe
                            </label>
                            <input
                                name="password"
                                type="password"
                                value={formData.password}
                                onChange={handleChange}
                                required
                                className="w-full px-3 py-2 border border-gray-300 rounded-md bg-gray-50 focus:bg-white focus:border-purple-500 focus:outline-none transition-all text-sm"
                                placeholder="Votre mot de passe"
                            />
                        </div>

                        {/* Se souvenir + Mot de passe oublié */}
                        <div className="flex items-center justify-between text-sm">
                            <label className="flex items-center">
                                <input
                                    name="remember"
                                    type="checkbox"
                                    checked={formData.remember}
                                    onChange={handleChange}
                                    className="h-4 w-4 text-purple-600 focus:ring-purple-500 border-gray-300 rounded mr-2"
                                />
                                Se souvenir de moi
                            </label>
                            <a href="#" className="text-purple-600 hover:text-purple-800">
                                Mot de passe oublié ?
                            </a>
                        </div>

                        {/* Bouton connexion */}
                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full bg-purple-600 hover:bg-purple-700 text-white font-medium py-2.5 px-4 rounded-md transition-colors duration-200 disabled:opacity-50 text-sm"
                        >
                            {loading ? 'Connexion en cours...' : 'Se connecter'}
                        </button>
                    </form>

                    {/* Comptes de test - version compacte */}
                    <div className="mt-6 pt-4 border-t border-gray-200">
                        <p className="text-xs text-gray-600 text-center mb-3">
                            Comptes de démonstration
                        </p>
                        
                        <div className="space-y-2">
                            <button
                                type="button"
                                onClick={() => fillTestCredentials('admin1')}
                                className="w-full text-left p-2 bg-gray-50 hover:bg-purple-50 border border-gray-200 hover:border-purple-200 rounded text-xs transition-colors duration-200"
                            >
                                <div className="font-medium text-gray-900">Administrateur Principal</div>
                                <div className="text-gray-600">admin@vivias-shop.com</div>
                            </button>

                            <button
                                type="button"
                                onClick={() => fillTestCredentials('admin2')}
                                className="w-full text-left p-2 bg-gray-50 hover:bg-purple-50 border border-gray-200 hover:border-purple-200 rounded text-xs transition-colors duration-200"
                            >
                                <div className="font-medium text-gray-900">Administrateur Birame</div>
                                <div className="text-gray-600">diopbirame8@gmail.com</div>
                            </button>
                        </div>
                    </div>
                </div>

                {/* Footer compact */}
                <div className="text-center mt-4">
                    <p className="text-xs text-gray-600">
                        © 2024 VIVIA'S SHOP. Tous droits réservés.
                    </p>
                </div>
            </div>
        </div>
    );
};

export default AdminLogin;