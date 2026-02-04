import React, { useState } from 'react';
import { X, Mail, Lock, User as UserIcon, Phone, Loader2 } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';

const AuthModal = ({ isOpen, onClose, initialMode = 'login' }) => {
  const { login, register } = useAuth();
  const [mode, setMode] = useState(initialMode); // 'login' | 'register'
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  
  const [loginData, setLoginData] = useState({
    email: '',
    password: ''
  });

  const [registerData, setRegisterData] = useState({
    nom: '',
    prenom: '',
    email: '',
    telephone: '',
    password: '',
    password_confirmation: '',
    accepte_conditions: false
  });

  const handleLogin = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const result = await login(loginData.email, loginData.password);
      
      if (result.success) {
        onClose();
        // Recharger la page pour mettre à jour le state global
        window.location.reload();
      } else {
        setError(result.message || 'Email ou mot de passe incorrect');
      }
    } catch (err) {
      setError(err.message || 'Email ou mot de passe incorrect');
    } finally {
      setLoading(false);
    }
  };

  const handleRegister = async (e) => {
    e.preventDefault();
    setError('');

    // Validation
    if (registerData.password !== registerData.password_confirmation) {
      setError('Les mots de passe ne correspondent pas');
      return;
    }

    if (registerData.password.length < 8) {
      setError('Le mot de passe doit contenir au moins 8 caractères');
      return;
    }

    setLoading(true);

    try {
      console.log('📤 Données envoyées:', registerData);
      const result = await register(registerData);
      console.log('📥 Résultat reçu:', result);
      
      if (result.success) {
        onClose();
        window.location.reload();
      } else {
        setError(result.message || 'Une erreur est survenue');
      }
    } catch (err) {
      console.error('❌ Erreur complète:', err);
      // Afficher le message d'erreur spécifique du serveur
      const errorMessage = err.response?.data?.message || err.message || 'Une erreur est survenue';
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center px-4">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-black/60 backdrop-blur-sm"
        onClick={onClose}
      />
      
      {/* Modal */}
      <div className="relative bg-white w-full max-w-md shadow-2xl animate-fade-in">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-neutral-100">
          <h2 className="text-xl font-bold uppercase tracking-widest">
            {mode === 'login' ? 'Connexion' : 'Inscription'}
          </h2>
          <button 
            onClick={onClose}
            className="p-2 hover:bg-neutral-100 rounded-full transition-colors touch-manipulation"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6">
          {error && (
            <div className="mb-4 p-3 bg-red-50 border border-red-200 text-red-700 text-xs rounded">
              {error}
            </div>
          )}

          {mode === 'login' ? (
            <form onSubmit={handleLogin} className="space-y-4">
              <div>
                <label className="block text-xs uppercase tracking-widest font-bold mb-2">
                  Email
                </label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-400" />
                  <input
                    type="email"
                    required
                    value={loginData.email}
                    onChange={(e) => setLoginData({ ...loginData, email: e.target.value })}
                    className="w-full pl-10 pr-4 py-3 border border-neutral-200 focus:border-black focus:outline-none text-sm"
                    placeholder="votre@email.com"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs uppercase tracking-widest font-bold mb-2">
                  Mot de passe
                </label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-400" />
                  <input
                    type="password"
                    required
                    value={loginData.password}
                    onChange={(e) => setLoginData({ ...loginData, password: e.target.value })}
                    className="w-full pl-10 pr-4 py-3 border border-neutral-200 focus:border-black focus:outline-none text-sm"
                    placeholder="••••••••"
                  />
                </div>
              </div>

              <div className="text-right">
                <a 
                  href="/forgot-password"
                  className="text-xs text-neutral-500 hover:text-black uppercase tracking-widest transition-colors"
                  onClick={(e) => {
                    e.preventDefault();
                    onClose();
                    window.location.href = '/forgot-password';
                  }}
                >
                  Mot de passe oublié ?
                </a>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full bg-black text-white py-3 text-xs uppercase tracking-widest font-bold hover:bg-neutral-800 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                {loading ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Connexion...
                  </>
                ) : (
                  'Se connecter'
                )}
              </button>
            </form>
          ) : (
            <form onSubmit={handleRegister} className="space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs uppercase tracking-widest font-bold mb-2">
                    Nom
                  </label>
                  <input
                    type="text"
                    required
                    value={registerData.nom}
                    onChange={(e) => setRegisterData({ ...registerData, nom: e.target.value })}
                    className="w-full px-4 py-3 border border-neutral-200 focus:border-black focus:outline-none text-sm"
                    placeholder="Diop"
                  />
                </div>
                <div>
                  <label className="block text-xs uppercase tracking-widest font-bold mb-2">
                    Prénom
                  </label>
                  <input
                    type="text"
                    required
                    value={registerData.prenom}
                    onChange={(e) => setRegisterData({ ...registerData, prenom: e.target.value })}
                    className="w-full px-4 py-3 border border-neutral-200 focus:border-black focus:outline-none text-sm"
                    placeholder="Birame"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs uppercase tracking-widest font-bold mb-2">
                  Email
                </label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-400" />
                  <input
                    type="email"
                    required
                    value={registerData.email}
                    onChange={(e) => setRegisterData({ ...registerData, email: e.target.value })}
                    className="w-full pl-10 pr-4 py-3 border border-neutral-200 focus:border-black focus:outline-none text-sm"
                    placeholder="votre@email.com"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs uppercase tracking-widest font-bold mb-2">
                  Téléphone
                </label>
                <div className="relative">
                  <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-400" />
                  <input
                    type="tel"
                    required
                    value={registerData.telephone}
                    onChange={(e) => setRegisterData({ ...registerData, telephone: e.target.value })}
                    className="w-full pl-10 pr-4 py-3 border border-neutral-200 focus:border-black focus:outline-none text-sm"
                    placeholder="+221 77 123 45 67"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs uppercase tracking-widest font-bold mb-2">
                  Mot de passe
                </label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-400" />
                  <input
                    type="password"
                    required
                    value={registerData.password}
                    onChange={(e) => setRegisterData({ ...registerData, password: e.target.value })}
                    className="w-full pl-10 pr-4 py-3 border border-neutral-200 focus:border-black focus:outline-none text-sm"
                    placeholder="••••••••"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs uppercase tracking-widest font-bold mb-2">
                  Confirmer le mot de passe
                </label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-400" />
                  <input
                    type="password"
                    required
                    value={registerData.password_confirmation}
                    onChange={(e) => setRegisterData({ ...registerData, password_confirmation: e.target.value })}
                    className="w-full pl-10 pr-4 py-3 border border-neutral-200 focus:border-black focus:outline-none text-sm"
                    placeholder="••••••••"
                  />
                </div>
              </div>

              <div className="flex items-start gap-2">
                <input
                  type="checkbox"
                  id="accepte_conditions"
                  required
                  checked={registerData.accepte_conditions}
                  onChange={(e) => setRegisterData({ ...registerData, accepte_conditions: e.target.checked })}
                  className="mt-1"
                />
                <label htmlFor="accepte_conditions" className="text-xs text-gray-600">
                  J'accepte les conditions générales d'utilisation
                </label>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full bg-black text-white py-3 text-xs uppercase tracking-widest font-bold hover:bg-neutral-800 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                {loading ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Inscription...
                  </>
                ) : (
                  'S\'inscrire'
                )}
              </button>
            </form>
          )}

          {/* Toggle mode */}
          <div className="mt-6 text-center text-xs text-neutral-500">
            {mode === 'login' ? (
              <p>
                Pas encore de compte ?{' '}
                <button
                  onClick={() => {
                    setMode('register');
                    setError('');
                  }}
                  className="text-black font-bold hover:underline"
                >
                  S'inscrire
                </button>
              </p>
            ) : (
              <p>
                Déjà un compte ?{' '}
                <button
                  onClick={() => {
                    setMode('login');
                    setError('');
                  }}
                  className="text-black font-bold hover:underline"
                >
                  Se connecter
                </button>
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default AuthModal;
