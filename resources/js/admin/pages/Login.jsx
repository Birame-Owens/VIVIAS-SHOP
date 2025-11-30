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
        <div className="min-h-screen bg-[#FDFBF7] flex items-center justify-center p-4">
            <div className="w-full max-w-md">
                
                {/* Bloc principal */}
                <div className="bg-white border border-neutral-100 p-8">
                    
                    {/* Logo */}
                    <div className="text-center mb-8">
                        <div className="w-20 h-20 bg-black rounded-full flex items-center justify-center mx-auto mb-4">
                            <span className="text-white font-bold text-3xl">V</span>
                        </div>
                        <h1 className="text-2xl font-light uppercase tracking-[0.2em] mb-1">VIVIAS SHOP</h1>
                        <p className="text-xs text-neutral-400 uppercase tracking-widest">Administration</p>
                    </div>

                    {/* Formulaire */}
                    <form className="space-y-6" onSubmit={handleSubmit}>
                        
                        {/* Email */}
                        <div>
                            <label className="block text-[10px] font-bold uppercase tracking-widest text-neutral-600 mb-2">
                                Adresse email
                            </label>
                            <input
                                name="email"
                                type="email"
                                value={formData.email}
                                onChange={handleChange}
                                required
                                className="w-full px-4 py-3 border border-neutral-200 bg-white focus:border-black focus:outline-none transition-all text-sm"
                                placeholder="exemple@vivias-shop.com"
                            />
                        </div>

                        {/* Mot de passe */}
                        <div>
                            <label className="block text-[10px] font-bold uppercase tracking-widest text-neutral-600 mb-2">
                                Mot de passe
                            </label>
                            <input
                                name="password"
                                type="password"
                                value={formData.password}
                                onChange={handleChange}
                                required
                                className="w-full px-4 py-3 border border-neutral-200 bg-white focus:border-black focus:outline-none transition-all text-sm"
                                placeholder="Votre mot de passe"
                            />
                        </div>

                        {/* Se souvenir */}
                        <div className="flex items-center text-xs">
                            <label className="flex items-center">
                                <input
                                    name="remember"
                                    type="checkbox"
                                    checked={formData.remember}
                                    onChange={handleChange}
                                    className="h-4 w-4 text-black focus:ring-black border-neutral-300 rounded mr-2"
                                />
                                <span className="uppercase tracking-wide">Se souvenir de moi</span>
                            </label>
                        </div>

                        {/* Bouton connexion */}
                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full bg-black hover:bg-neutral-800 text-white font-bold py-4 px-4 transition-colors duration-200 disabled:opacity-50 text-xs uppercase tracking-widest"
                        >
                            {loading ? 'Connexion...' : 'Se connecter'}
                        </button>
                    </form>

                    {/* Comptes de test */}
                    <div className="mt-8 pt-6 border-t border-neutral-100">
                        <p className="text-[10px] text-neutral-400 uppercase tracking-widest text-center mb-4">
                            Comptes de test
                        </p>
                        
                        <div className="space-y-2">
                            <button
                                type="button"
                                onClick={() => fillTestCredentials('admin1')}
                                className="w-full text-left p-3 bg-neutral-50 hover:bg-black hover:text-white border border-neutral-100 transition-all duration-200"
                            >
                                <div className="font-bold text-xs uppercase tracking-wide">Admin Principal</div>
                                <div className="text-[10px] text-neutral-400 mt-1">admin@vivias-shop.com</div>
                            </button>

                            <button
                                type="button"
                                onClick={() => fillTestCredentials('admin2')}
                                className="w-full text-left p-3 bg-neutral-50 hover:bg-black hover:text-white border border-neutral-100 transition-all duration-200"
                            >
                                <div className="font-bold text-xs uppercase tracking-wide">Admin Birame</div>
                                <div className="text-[10px] text-neutral-400 mt-1">diopbirame8@gmail.com</div>
                            </button>
                        </div>
                    </div>
                </div>

                {/* Footer */}
                <div className="text-center mt-8">
                    <p className="text-[10px] text-neutral-400 uppercase tracking-widest">
                        © 2024 VIVIAS SHOP. Tous droits réservés.
                    </p>
                </div>
            </div>
        </div>
    );
};

export default AdminLogin;