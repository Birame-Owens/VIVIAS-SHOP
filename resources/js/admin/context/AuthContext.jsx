// ================================================================
// 📝 FICHIER: resources/js/admin/context/AuthContext.jsx (CORRIGÉ CSRF)
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

    // Fonction pour obtenir le token CSRF
    const getCsrfToken = async () => {
        try {
            // D'abord essayer de récupérer depuis le meta tag
            let csrfToken = document.querySelector('meta[name="csrf-token"]')?.getAttribute('content');
            
            if (!csrfToken) {
                // Si pas de meta tag, faire un appel à /sanctum/csrf-cookie
                await fetch('/sanctum/csrf-cookie', {
                    method: 'GET',
                    credentials: 'same-origin',
                });
                
                // Réessayer de récupérer le token depuis le meta tag
                csrfToken = document.querySelector('meta[name="csrf-token"]')?.getAttribute('content');
            }
            
            return csrfToken;
        } catch (error) {
            console.error('Erreur récupération CSRF token:', error);
            return null;
        }
    };

    useEffect(() => {
        console.log('🚀 AuthProvider monté');
        
        const initializeAuth = async () => {
            const savedToken = localStorage.getItem('admin_token');
            const savedUser = localStorage.getItem('admin_user');
            
            if (savedToken && savedUser) {
                try {
                    // Vérifier que le token est valide en testant avec le backend
                    console.log('🔍 Vérification du token...');
                    const response = await fetch('/api/user', {
                        method: 'GET',
                        headers: {
                            'Authorization': `Bearer ${savedToken}`,
                            'Accept': 'application/json',
                        }
                    });

                    if (response.ok) {
                        // Token valide
                        setToken(savedToken);
                        setUser(JSON.parse(savedUser));
                        console.log('✅ Session restaurée et validée');
                    } else if (response.status === 401) {
                        // Token expiré ou invalide
                        console.log('❌ Token invalide (401) - Nettoyage et redirection vers login');
                        localStorage.removeItem('admin_token');
                        localStorage.removeItem('admin_user');
                        setToken(null);
                        setUser(null);
                    } else {
                        // Autre erreur
                        console.error('⚠️ Erreur vérification token:', response.status);
                        localStorage.clear();
                        setToken(null);
                        setUser(null);
                    }
                } catch (e) {
                    console.error('❌ Erreur session:', e);
                    localStorage.clear();
                    setToken(null);
                    setUser(null);
                }
            }
            
            setLoading(false);
            console.log('✅ Loading terminé');
        };

        initializeAuth();
    }, []);

    const login = async (credentials) => {
        console.log('🔐 Tentative de connexion...', credentials.email);
        
        try {
            // Étape 1: Obtenir le token CSRF
            const csrfToken = await getCsrfToken();
            console.log('🔒 CSRF Token obtenu:', csrfToken ? 'Oui' : 'Non');

            // Étape 2: Préparer les headers
            const headers = {
                'Content-Type': 'application/json',
                'Accept': 'application/json',
                'X-Requested-With': 'XMLHttpRequest',
            };

            // Ajouter le token CSRF s'il existe
            if (csrfToken) {
                headers['X-CSRF-TOKEN'] = csrfToken;
            }

            // Étape 3: Faire la requête de connexion
            const response = await fetch('/api/admin/login', {
                method: 'POST',
                headers: headers,
                credentials: 'same-origin', // Important pour les cookies de session
                body: JSON.stringify(credentials)
            });

            console.log('📡 Statut réponse:', response.status);

            // Gérer les erreurs spécifiques
            if (response.status === 419) {
                console.error('❌ Erreur CSRF 419 - Rechargement de la page recommandé');
                toast.error('Erreur de sécurité. Rechargez la page et réessayez.');
                // Recharger automatiquement après 2 secondes
                setTimeout(() => window.location.reload(), 2000);
                return { success: false, message: 'Erreur CSRF - Page rechargée' };
            }

            if (response.status === 422) {
                const errorData = await response.json();
                console.log('❌ Erreurs de validation:', errorData);
                toast.error('Erreurs de validation. Vérifiez vos données.');
                return { success: false, message: 'Erreurs de validation', errors: errorData.errors };
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

    const logout = async () => {
        console.log('🚪 Déconnexion');
        
        try {
            // Tenter la déconnexion côté serveur si on a un token
            if (token) {
                const csrfToken = await getCsrfToken();
                await fetch('/api/admin/logout', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'Accept': 'application/json',
                        'Authorization': `Bearer ${token}`,
                        'X-Requested-With': 'XMLHttpRequest',
                        ...(csrfToken && { 'X-CSRF-TOKEN': csrfToken }),
                    },
                    credentials: 'same-origin',
                });
            }
        } catch (error) {
            console.warn('Erreur lors de la déconnexion serveur:', error);
        } finally {
            // Nettoyer côté client dans tous les cas
            setUser(null);
            setToken(null);
            localStorage.removeItem('admin_token');
            localStorage.removeItem('admin_user');
            toast.success('Déconnecté avec succès');
        }
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