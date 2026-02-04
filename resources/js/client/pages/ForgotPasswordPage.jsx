import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Mail, ArrowLeft, Loader2, CheckCircle } from 'lucide-react';
import api from '../utils/api';
import toast from 'react-hot-toast';

export default function ForgotPasswordPage() {
    const [email, setEmail] = useState('');
    const [loading, setLoading] = useState(false);
    const [sent, setSent] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);

        try {
            const response = await api.post('/client/password/forgot', { email });
            
            console.log('📧 Réponse mot de passe oublié:', response);
            
            if (response.success) {
                setSent(true);
                toast.success('Email envoyé ! Vérifiez votre boîte de réception.', { duration: 5000 });
            } else {
                toast.error(response.message || 'Impossible d\'envoyer l\'email');
            }
        } catch (error) {
            console.error('❌ Erreur envoi email:', error);
            toast.error(error.message || 'Une erreur est survenue lors de l\'envoi de l\'email');
        } finally {
            setLoading(false);
        }
    };

    if (sent) {
        return (
            <div className="min-h-screen bg-[#FDFBF7] flex items-center justify-center p-4">
                <div className="max-w-md w-full text-center">
                    <CheckCircle className="w-16 h-16 text-green-500 mx-auto mb-4" />
                    <h1 className="text-2xl font-bold uppercase tracking-widest mb-4">Email envoyé</h1>
                    <p className="text-sm text-neutral-600 mb-8">
                        Un lien de réinitialisation a été envoyé à <strong>{email}</strong>.
                        Cliquez sur le lien pour créer un nouveau mot de passe.
                    </p>
                    <p className="text-xs text-neutral-500 mb-8 uppercase tracking-wider">
                        Le lien est valide pendant 60 minutes
                    </p>
                    <Link 
                        to="/login"
                        className="inline-block bg-black text-white px-8 py-3 text-xs uppercase tracking-widest hover:bg-neutral-800 transition"
                    >
                        Retour à la connexion
                    </Link>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-[#FDFBF7] flex items-center justify-center p-4">
            <div className="max-w-md w-full">
                <div className="text-center mb-8">
                    <h1 className="text-3xl font-light uppercase tracking-[0.2em] mb-2">Mot de passe oublié</h1>
                    <p className="text-sm text-neutral-500 uppercase tracking-widest">
                        Entrez votre email pour recevoir un lien
                    </p>
                </div>

                <form onSubmit={handleSubmit} className="bg-white p-8 shadow-sm border border-neutral-100">
                    <div className="mb-6">
                        <label className="block text-xs uppercase tracking-widest text-neutral-700 mb-2">
                            Adresse Email
                        </label>
                        <input
                            type="email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            required
                            className="w-full px-4 py-3 border border-neutral-300 focus:border-black focus:outline-none transition"
                            placeholder="votre@email.com"
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
                                Envoi en cours...
                            </>
                        ) : (
                            <>
                                <Mail className="w-4 h-4" />
                                Envoyer le lien
                            </>
                        )}
                    </button>

                    <div className="mt-6 text-center">
                        <Link 
                            to="/login"
                            className="text-xs uppercase tracking-widest text-neutral-500 hover:text-black transition flex items-center justify-center gap-2"
                        >
                            <ArrowLeft className="w-3 h-3" />
                            Retour à la connexion
                        </Link>
                    </div>
                </form>
            </div>
        </div>
    );
}
