// ================================================================
// 📝 FICHIER: AuthContext.jsx (CORRECTION CSRF)
// ================================================================

import React, { createContext, useContext, useState, useEffect } from 'react';
import { toast } from 'react-hot-toast';

const AuthContext = createContext();

export const useAuth = () => {
    const context = useContext(AuthContext);
    if (!context) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
};

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);
    const [token, setToken] = useState(null);

    useEffect(() => {
        console.log('🚀 AuthProvider monté');
        
        const savedToken = localStorage.getItem('admin_token');
        const savedUser = localStorage.getItem('admin_user');
        
        if (savedToken && savedUser) {
            try {
                setToken(savedToken);
                setUser(JSON.parse(savedUser));
                console.log('✅ Session restaurée');
            } catch (e) {
                console.error('❌ Erreur session:', e);
                localStorage.clear();
            }
        }
        
        setLoading(false);
        console.log('✅ Loading terminé');
    }, []);

    const login = async (credentials) => {
        console.log('🔐 Tentative de connexion...', credentials.email);
        
        try {
            // Obtenir le token CSRF depuis le meta tag
            const csrfToken = document.querySelector('meta[name="csrf-token"]')?.getAttribute('content');
            console.log('🔒 CSRF Token trouvé:', csrfToken ? 'Oui' : 'Non');

            const response = await fetch('/api/admin/login', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Accept': 'application/json',
                    'X-Requested-With': 'XMLHttpRequest',
                    // Envoyer le token CSRF dans le header
                    ...(csrfToken && { 'X-CSRF-TOKEN': csrfToken }),
                },
                credentials: 'same-origin', // Important pour les cookies de session
                body: JSON.stringify(credentials)
            });

            console.log('📡 Statut réponse:', response.status);

            if (response.status === 419) {
                console.error('❌ Erreur CSRF 419');
                toast.error('Erreur de sécurité. Rechargez la page et réessayez.');
                return { success: false, message: 'Erreur CSRF' };
            }

            const data = await response.json();
            console.log('📋 Réponse:', data);

            if (response.ok && data.success) {
                console.log('✅ Connexion réussie !');
                setUser(data.data.user);
                setToken(data.data.token);
                localStorage.setItem('admin_token', data.data.token);
                localStorage.setItem('admin_user', JSON.stringify(data.data.user));
                toast.success('Connexion réussie !');
                return { success: true, data: data.data };
            } else {
                console.log('❌ Échec connexion:', data.message);
                toast.error(data.message || 'Identifiants incorrects');
                return { success: false, message: data.message };
            }
        } catch (error) {
            console.error('❌ Erreur réseau:', error);
            toast.error('Erreur de connexion réseau');
            return { success: false, message: 'Erreur réseau' };
        }
    };

    const logout = () => {
        console.log('🚪 Déconnexion');
        setUser(null);
        setToken(null);
        localStorage.removeItem('admin_token');
        localStorage.removeItem('admin_user');
        toast.success('Déconnecté avec succès');
    };

    const isAuthenticated = () => !!(user && token);
    const isAdmin = () => user?.role === 'admin';

    return (
        <AuthContext.Provider value={{
            user,
            token,
            loading,
            login,
            logout,
            isAuthenticated,
            isAdmin
        }}>
            {children}
        </AuthContext.Provider>
    );
};