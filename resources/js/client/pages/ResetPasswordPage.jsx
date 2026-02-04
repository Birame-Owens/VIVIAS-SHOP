import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams, Link } from 'react-router-dom';
import { Lock, Loader2, CheckCircle } from 'lucide-react';
import api from '../utils/api';
import toast from 'react-hot-toast';

export default function ResetPasswordPage() {
    const navigate = useNavigate();
    const [searchParams] = useSearchParams();
    const [validating, setValidating] = useState(true);
    const [tokenValid, setTokenValid] = useState(false);
    const [password, setPassword] = useState('');
    const [passwordConfirmation, setPasswordConfirmation] = useState('');
    const [loading, setLoading] = useState(false);

    const token = searchParams.get('token');
    const email = searchParams.get('email');

    useEffect(() => {
        validateToken();
    }, []);

    const validateToken = async () => {
        if (!token || !email) {
            toast.error('Lien invalide');
            setValidating(false);
            return;
        }

        try {
            const response = await api.post('/client/password/validate-token', {
                email,
                token
            });

            if (response.success) {
                setTokenValid(true);
            } else {
                toast.error(response.message || 'Token invalide ou expiré');
            }
        } catch (error) {
            toast.error('Token invalide ou expiré');
        } finally {
            setValidating(false);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (password !== passwordConfirmation) {
            toast.error('Les mots de passe ne correspondent pas');
            return;
        }

        if (password.length < 8) {
            toast.error('Le mot de passe doit contenir au moins 8 caractères');
            return;
        }

        setLoading(true);

        try {
            const response = await api.post('/client/password/reset', {
                email,
                token,
                password,
                password_confirmation: passwordConfirmation
            });

            if (response.success) {
                toast.success('Mot de passe réinitialisé avec succès !');
                setTimeout(() => navigate('/login'), 2000);
            }
        } catch (error) {
            toast.error(error.message || 'Erreur lors de la réinitialisation');
        } finally {
            setLoading(false);
        }
    };

    if (validating) {
        return (
            <div className="min-h-screen bg-[#FDFBF7] flex items-center justify-center">
                <div className="flex flex-col items-center gap-4">
                    <Loader2 className="w-8 h-8 animate-spin text-neutral-300" />
                    <span className="text-xs uppercase tracking-widest text-neutral-400">
                        Validation du lien...
                    </span>
                </div>
            </div>
        );
    }

    if (!tokenValid) {
        return (
            <div className="min-h-screen bg-[#FDFBF7] flex items-center justify-center p-4">
                <div className="max-w-md w-full text-center">
                    <div className="w-16 h-16 border-2 border-red-200 bg-red-50 rounded-full flex items-center justify-center mx-auto mb-4">
                        <span className="text-2xl">⚠️</span>
                    </div>
                    <h1 className="text-2xl font-bold uppercase tracking-widest mb-4">Lien invalide</h1>
                    <p className="text-sm text-neutral-600 mb-8">
                        Ce lien est invalide ou a expiré. Les liens de réinitialisation sont valides pendant 60 minutes.
                    </p>
                    <Link 
                        to="/forgot-password"
                        className="inline-block bg-black text-white px-8 py-3 text-xs uppercase tracking-widest hover:bg-neutral-800 transition"
                    >
                        Demander un nouveau lien
                    </Link>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-[#FDFBF7] flex items-center justify-center p-4">
            <div className="max-w-md w-full">
                <div className="text-center mb-8">
                    <h1 className="text-3xl font-light uppercase tracking-[0.2em] mb-2">Nouveau mot de passe</h1>
                    <p className="text-sm text-neutral-500 uppercase tracking-widest">
                        Choisissez un mot de passe sécurisé
                    </p>
                </div>

                <form onSubmit={handleSubmit} className="bg-white p-8 shadow-sm border border-neutral-100">
                    <div className="mb-4">
                        <label className="block text-xs uppercase tracking-widest text-neutral-700 mb-2">
                            Nouveau mot de passe
                        </label>
                        <input
                            type="password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            required
                            minLength={8}
                            className="w-full px-4 py-3 border border-neutral-300 focus:border-black focus:outline-none transition"
                            placeholder="Minimum 8 caractères"
                        />
                    </div>

                    <div className="mb-6">
                        <label className="block text-xs uppercase tracking-widest text-neutral-700 mb-2">
                            Confirmer le mot de passe
                        </label>
                        <input
                            type="password"
                            value={passwordConfirmation}
                            onChange={(e) => setPasswordConfirmation(e.target.value)}
                            required
                            minLength={8}
                            className="w-full px-4 py-3 border border-neutral-300 focus:border-black focus:outline-none transition"
                            placeholder="Retapez votre mot de passe"
                        />
                    </div>

                    <button
                        type="submit"
                        disabled={loading}
                        className="w-full bg-black text-white py-3 text-xs uppercase tracking-widest hover:bg-neutral-800 transition flex items-center justify-center gap-2 disabled:opacity-50"
                    >
                        {loading ? (
                            <>
                                <Loader2 className="w-4 h-4 animate-spin" />
                                Réinitialisation...
                            </>
                        ) : (
                            <>
                                <Lock className="w-4 h-4" />
                                Réinitialiser
                            </>
                        )}
                    </button>
                </form>
            </div>
        </div>
    );
}
