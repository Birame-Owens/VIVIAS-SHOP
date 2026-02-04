import React, { createContext, useContext, useState, useEffect } from 'react';
import api from '../utils/api';
import { useCartStore } from '../stores/cartStore';

const AuthContext = createContext(null);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  // Vérifier l'authentification au chargement
  useEffect(() => {
    checkAuth();
  }, []);

  const checkAuth = async () => {
    try {
      // Vérifier si un token existe en localStorage
      const token = localStorage.getItem('auth_token');
      
      if (token) {
        // Vérifier la validité du token auprès du serveur
        const response = await api.getCurrentUser();
        
        if (response.success && response.data) {
          setUser(response.data);
          setIsAuthenticated(true);
        } else {
          // Token invalide, nettoyer
          localStorage.removeItem('auth_token');
          setUser(null);
          setIsAuthenticated(false);
        }
      }
    } catch (error) {
      console.error('Erreur vérification auth:', error);
      localStorage.removeItem('auth_token');
      setUser(null);
      setIsAuthenticated(false);
    } finally {
      setLoading(false);
    }
  };

  const login = async (email, password) => {
    try {
      const response = await api.login({ email, password });
      
      if (response.success) {
        const { user: userData, token } = response.data;
        
        // Stocker le token
        localStorage.setItem('auth_token', token);
        
        // Mettre à jour l'état
        setUser(userData);
        setIsAuthenticated(true);
        
        // Recharger pour migrer le panier (délai court pour UX)
        setTimeout(() => window.location.reload(), 50);
        
        return { success: true, user: userData };
      } else {
        return { 
          success: false, 
          message: response.message || 'Identifiants incorrects' 
        };
      }
    } catch (error) {
      // Ne pas logger les erreurs de connexion (sécurité et UX)
      return { 
        success: false, 
        message: error.message || 'Email ou mot de passe incorrect' 
      };
    }
  };

  const register = async (userData) => {
    try {
      const response = await api.register(userData);
      console.log('✅ Register API response:', response);
      
      if (response.success) {
        const { user: newUser, token } = response.data;
        
        // Stocker le token
        localStorage.setItem('auth_token', token);
        
        // Mettre à jour l'état
        setUser(newUser);
        setIsAuthenticated(true);
        
        return { success: true, user: newUser };
      } else {
        console.log('⚠️ Register failed:', response.message);
        return { 
          success: false, 
          message: response.message || 'Erreur lors de l\'inscription' 
        };
      }
    } catch (error) {
      console.error('❌ Register error caught:', {
        status: error.response?.status,
        data: error.response?.data,
        message: error.message,
        fullError: error
      });
      
      // Gérer les erreurs de validation (422)
      if (error.response?.status === 422 && error.response?.data?.errors) {
        const errors = error.response.data.errors;
        console.log('📋 Validation errors:', errors);
        // Récupérer le premier message d'erreur
        const firstError = Object.values(errors)[0];
        const errorMessage = Array.isArray(firstError) ? firstError[0] : firstError;
        console.log('📝 First error message:', errorMessage);
        return { 
          success: false, 
          message: errorMessage
        };
      }
      
      // Sinon utiliser le message de la réponse
      const errorMessage = error.response?.data?.message || error.message || 'Erreur lors de l\'inscription';
      console.log('📝 Final error message:', errorMessage);
      return { 
        success: false, 
        message: errorMessage
      };
    }
  };

  const logout = async () => {
    try {
      // 1. Vider immédiatement le store (UX responsive)
      useCartStore.getState().resetStore();
      
      // 2. Nettoyer localStorage
      localStorage.removeItem('auth_token');
      localStorage.removeItem('vivias-cart-storage');
      
      // 3. Mettre à jour état
      setUser(null);
      setIsAuthenticated(false);
      
      // 4. Appel API logout (en arrière-plan)
      await api.logout();
      
      // 5. Redirection vers home
      window.location.href = '/';
    } catch (error) {
      // Même en cas d'erreur API, on déconnecte côté client
      console.error('Erreur logout:', error);
      window.location.href = '/';
    }
  };

  const value = {
    user,
    isAuthenticated,
    loading,
    login,
    register,
    logout,
    checkAuth
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};
