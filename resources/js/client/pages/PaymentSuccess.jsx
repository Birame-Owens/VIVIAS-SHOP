import React, { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Check, Package, ArrowLeft, Download, Loader2, Printer, Home } from 'lucide-react';
import { motion } from 'framer-motion';
import api from '../utils/api';
import Navbar from '../components/Navbar';
import { useCartStore } from '../stores/cartStore';

// Footer Simplifié pour la cohérence
const SimpleFooter = () => (
  <footer className="bg-stone-100 py-8 text-neutral-500 text-[10px] border-t border-neutral-200 mt-auto text-center uppercase tracking-widest">
    <p>&copy; {new Date().getFullYear()} VIVIAS SHOP. Tous droits réservés.</p>
  </footer>
);

export default function PaymentSuccess() {
    const navigate = useNavigate();
    const [searchParams] = useSearchParams();
    const [commande, setCommande] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const { clearCart, items } = useCartStore();

    // Navbar States (Mock pour l'affichage)
    const [cartCount, setCartCount] = useState(0);
    const [wishlistCount, setWishlistCount] = useState(0);
    const [categories, setCategories] = useState([]);
    const [testimonials, setTestimonials] = useState([]);

    const orderNumber = searchParams.get('order');
    const sessionId = searchParams.get('session_id');
    const simulated = searchParams.get('simulated');

    // 1. Chargement Initial
    useEffect(() => {
        const initData = async () => {
            try {
                // Charger la Navbar (optionnel mais mieux pour l'UX)
                const [catRes, homeRes] = await Promise.all([
                    api.getCategories(),
                    api.getHomeData()
                ]);
                if (catRes.success) setCategories(catRes.data || []);
                if (homeRes.success && homeRes.data.testimonials) {
                    setTestimonials(homeRes.data.testimonials.slice(0, 3)); // 3 avis seulement
                }

                // Logique de commande - charger immédiatement sans attendre
                if (orderNumber) {
                    await loadOrderDetails();
                } else {
                    setError('Numéro de commande manquant');
                    setLoading(false);
                }
            } catch (e) {
                console.error(e);
                setLoading(false);
            }
        };
        initData();
    }, [orderNumber, sessionId]);

    // 2. Polling pour vérifier la confirmation PayTech
    useEffect(() => {
        if (!commande || !orderNumber) return;
        
        // Si la commande est déjà confirmée, pas besoin de polling
        if (commande.statut === 'confirmee' || commande.statut === 'paye') {
            console.log('✅ Commande déjà confirmée, pas de polling');
            return;
        }

        console.log('🔄 Démarrage polling statut commande...');
        let pollCount = 0;
        const maxPolls = 30; // 30 tentatives = 1 minute (2s interval)

        const pollInterval = setInterval(async () => {
            pollCount++;
            console.log(`🔄 Polling ${pollCount}/${maxPolls}...`);

            try {
                const response = await api.get(`/client/commandes/${orderNumber}`);
                if (response && response.success && response.data) {
                    const updatedCommande = response.data;
                    
                    // Vérifier si le statut a changé
                    if (updatedCommande.statut === 'confirmee' || updatedCommande.statut === 'paye') {
                        console.log('🎉 Commande confirmée par webhook!');
                        setCommande(updatedCommande);
                        clearInterval(pollInterval);
                    } else if (pollCount >= maxPolls) {
                        console.log('⏱️ Timeout polling - webhook non reçu');
                        clearInterval(pollInterval);
                    }
                }
            } catch (err) {
                console.error('❌ Erreur polling:', err);
            }
        }, 2000); // Vérifier toutes les 2 secondes

        // Cleanup
        return () => clearInterval(pollInterval);
    }, [commande, orderNumber]);

    const confirmPaymentAndLoadOrder = async () => {
        try {
            setLoading(true);
            console.log('🔍 Confirmation paiement:', { orderNumber, sessionId });
            
            const response = await api.get(`/client/checkout/success?order=${orderNumber}&session_id=${sessionId}`);
            console.log('✅ Réponse API success COMPLÈTE:', response);
            
            // response est déjà l'objet {success: true, data: {...}}
            if (response && response.success) {
                // Extraire la commande de la réponse
                const commandeData = response.data?.commande || response.data;
                
                if (commandeData && commandeData.numero_commande) {
                    console.log('✅ Commande confirmée:', commandeData.numero_commande);
                    setCommande(commandeData);
                    clearCart();
                    setCartCount(0);
                    
                    // 🔥 NOUVEAU : Vérifier si l'utilisateur est maintenant connecté après checkout invité
                    try {
                        const authResponse = await api.get('/client/auth/user');
                        console.log('🔐 Vérification authentification:', authResponse);
                        
                        if (authResponse.success && authResponse.data) {
                            console.log('✅ Utilisateur auto-connecté:', authResponse.data.email);
                            
                            // Stocker les infos utilisateur
                            localStorage.setItem('user', JSON.stringify(authResponse.data));
                            
                            // Afficher un message pour informer l'utilisateur
                            if (authResponse.data.is_new_account) {
                                console.log('🎉 Nouveau compte créé pour:', authResponse.data.email);
                                // Vous pouvez afficher un toast ici si vous le souhaitez
                            }
                        }
                    } catch (authErr) {
                        console.log('ℹ️ Pas de session créée (checkout sans compte invité)');
                    }
                    
                    setError(null);
                } else {
                    console.warn('⚠️ Pas de données commande, tentative de rechargement');
                    await loadOrderDetails();
                }
            } else {
                console.warn('⚠️ Réponse invalide, rechargement commande');
                await loadOrderDetails();
            }
        } catch (err) {
            console.error('❌ Erreur confirmation:', err);
            console.log('🔄 Tentative de rechargement de la commande...');
            // En cas d'erreur, essayer de charger quand même la commande
            await loadOrderDetails();
        } finally {
            setLoading(false);
        }
    };

    const loadOrderDetails = async () => {
        try {
            console.log('🔍 Chargement commande:', orderNumber);
            
            const response = await api.get(`/client/commandes/${orderNumber}`);
            console.log('📦 Réponse API:', response);
            
            if (response && response.success && response.data) {
                setCommande(response.data);
                clearCart();
                setCartCount(0);
                setError(null);
                setLoading(false);
                console.log('✅ Commande chargée:', response.data.numero_commande);
                console.log('📊 Statut:', response.data.statut);
                return true;
            } else {
                console.error('❌ Réponse invalide');
                setError('Commande introuvable');
                setLoading(false);
                return false;
            }
        } catch (err) {
            console.error('❌ Erreur chargement commande:', err);
            setError('Impossible de charger les détails de la commande');
            setLoading(false);
            return false;
        }
    };

    // Loader Luxe
    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-[#FDFBF7]">
                <div className="flex flex-col items-center gap-4">
                    <Loader2 className="w-8 h-8 animate-spin text-neutral-300" />
                    <span className="text-[10px] uppercase tracking-[0.3em] text-neutral-400">Confirmation en cours...</span>
                </div>
            </div>
        );
    }

    // Écran d'Erreur
    if (error) {
        return (
            <div className="min-h-screen bg-[#FDFBF7] flex flex-col">
                <Navbar cartCount={0} wishlistCount={0} categories={categories} onNavigate={(path) => navigate(path === 'home' ? '/' : path)} />
                <div className="flex-1 flex flex-col items-center justify-center p-4 text-center">
                    <div className="w-16 h-16 border border-red-200 bg-red-50 rounded-full flex items-center justify-center mb-6">
                        <span className="text-2xl">⚠️</span>
                    </div>
                    <h2 className="text-xl font-bold uppercase tracking-widest mb-2">Une erreur est survenue</h2>
                    <p className="text-sm text-neutral-500 mb-8 max-w-md font-light">{error}</p>
                    <button
                        onClick={() => navigate('/')}
                        className="bg-black text-white px-8 py-4 text-xs font-bold uppercase tracking-widest hover:bg-neutral-800 transition-colors"
                    >
                        Retour à l'accueil
                    </button>
                </div>
                <SimpleFooter />
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-[#FDFBF7] text-[#1A1A1A] font-sans selection:bg-black selection:text-white flex flex-col">
            <Navbar 
                cartCount={cartCount} 
                wishlistCount={wishlistCount} 
                categories={categories} 
                onNavigate={(type) => type === 'home' ? navigate('/') : null} 
            />

            <main className="flex-grow w-full px-4 py-12 md:py-20">
                <motion.div 
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6, ease: "easeOut" }}
                    className="max-w-2xl mx-auto"
                >
                    {/* EN-TÊTE SUCCÈS */}
                    <div className="text-center mb-12">
                        <div className="inline-flex items-center justify-center w-16 h-16 border-2 border-black rounded-full mb-6">
                            <Check className="w-8 h-8 text-black" strokeWidth={1.5} />
                        </div>
                        <h1 className="text-3xl md:text-4xl font-light uppercase tracking-[0.2em] mb-4">
                            Merci {commande?.client?.prenom || commande?.prenom || commande?.nom_destinataire?.split(' ')[1] || 'Cher client'}
                        </h1>
                        <p className="text-sm text-neutral-500 uppercase tracking-widest font-medium">
                            {commande?.statut === 'confirmee' || commande?.statut === 'paye' 
                                ? 'Votre commande a été confirmée' 
                                : 'Votre commande est enregistrée'}
                        </p>
                        {(commande?.statut === 'en_attente' || commande?.statut === 'pending') && (
                            <div className="mt-4 space-y-2">
                                <div className="flex items-center justify-center gap-2">
                                    <Loader2 className="w-4 h-4 animate-spin text-neutral-400" />
                                    <span className="text-[10px] uppercase tracking-widest text-neutral-400">
                                        Vérification du paiement...
                                    </span>
                                </div>
                                <p className="text-[9px] text-neutral-400 max-w-md mx-auto">
                                    Votre paiement a été effectué. La confirmation finale peut prendre quelques instants. 
                                    Vous recevrez un email de confirmation dès validation.
                                </p>
                            </div>
                        )}
                        {simulated && (
                            <span className="inline-block mt-4 px-3 py-1 bg-neutral-100 text-[10px] uppercase tracking-widest text-neutral-500">
                                Mode Test
                            </span>
                        )}
                    </div>

                    {/* TICKET DE CAISSE / DÉTAILS */}
                    <div className="bg-white p-8 md:p-12 shadow-sm border border-neutral-100 relative overflow-hidden">
                        {/* Effet dentelé haut (Optionnel via CSS clip-path, ici simple bordure) */}
                        
                        <div className="flex flex-col md:flex-row justify-between items-start border-b border-neutral-100 pb-8 mb-8 gap-6">
                            <div>
                                <p className="text-[10px] text-neutral-400 uppercase tracking-widest mb-1">Numéro de commande</p>
                                <p className="text-lg font-bold uppercase tracking-widest">#{commande?.numero_commande}</p>
                            </div>
                            <div className="text-left md:text-right">
                                <p className="text-[10px] text-neutral-400 uppercase tracking-widest mb-1">Date</p>
                                <p className="text-sm font-medium">
                                    {new Date().toLocaleDateString('fr-FR', { year: 'numeric', month: 'long', day: 'numeric' })}
                                </p>
                            </div>
                        </div>

                        {/* Liste Articles */}
                        <div className="space-y-6 mb-8">
                            {commande?.articles?.map((item, index) => (
                                <div key={index} className="flex justify-between items-start group">
                                    <div>
                                        <p className="text-sm font-bold uppercase tracking-wide">
                                            {item.nom_produit || item.produit?.nom || 'Produit'}
                                        </p>
                                        <p className="text-[10px] text-neutral-500 uppercase mt-1">
                                            Qté: {item.quantite} 
                                            {item.taille_choisie && ` | ${item.taille_choisie}`} 
                                            {item.couleur_choisie && ` | ${item.couleur_choisie}`}
                                        </p>
                                    </div>
                                    <p className="text-sm font-medium">
                                        {(item.prix_total_article || (item.prix_unitaire * item.quantite)).toLocaleString()} FCFA
                                    </p>
                                </div>
                            ))}
                        </div>

                        {/* Totaux */}
                        <div className="bg-[#FDFBF7] p-6 -mx-8 md:-mx-12 mb-8 border-y border-neutral-100 space-y-3">
                            <div className="flex justify-between text-xs text-neutral-600 uppercase tracking-wide">
                                <span>Sous-total</span>
                                <span>{commande?.sous_total?.toLocaleString()} FCFA</span>
                            </div>
                            {commande?.frais_livraison > 0 && (
                                <div className="flex justify-between text-xs text-neutral-600 uppercase tracking-wide">
                                    <span>Livraison</span>
                                    <span>{commande.frais_livraison.toLocaleString()} FCFA</span>
                                </div>
                            )}
                            <div className="flex justify-between text-lg font-bold border-t border-neutral-200 pt-3 mt-3">
                                <span>TOTAL</span>
                                <span>{commande?.montant_total?.toLocaleString()} FCFA</span>
                            </div>
                        </div>

                        {/* Informations Livraison */}
                        <div className="grid md:grid-cols-2 gap-8 text-xs">
                            <div>
                                <h3 className="font-bold uppercase tracking-widest mb-3 text-neutral-900">Livraison</h3>
                                <p className="text-neutral-600 leading-relaxed">
                                    {commande?.adresse_livraison || 'Adresse non spécifiée'}<br />
                                    {(commande?.ville || commande?.client?.ville) && (
                                        <>{commande?.ville || commande?.client?.ville}<br /></>
                                    )}
                                    {commande?.telephone_livraison || commande?.client?.telephone || 'Téléphone non spécifié'}
                                </p>
                            </div>
                            <div>
                                <h3 className="font-bold uppercase tracking-widest mb-3 text-neutral-900">Méthode</h3>
                                <p className="text-neutral-600 leading-relaxed">
                                    Livraison Standard<br />
                                    2 - 5 Jours ouvrés
                                </p>
                            </div>
                        </div>
                    </div>

                    {/* ACTIONS */}
                    <div className="mt-8 flex flex-col md:flex-row gap-4">
                        <button
                            onClick={() => navigate('/')}
                            className="flex-1 py-4 bg-black text-white text-xs font-bold uppercase tracking-[0.15em] hover:bg-neutral-800 transition-all flex items-center justify-center gap-2"
                        >
                            <Home className="w-4 h-4" /> Retour Boutique
                        </button>
                        
                        {commande?.numero_commande && (
                            <button
                                onClick={() => navigate(`/orders/${commande.numero_commande}`)}
                                className="flex-1 py-4 border border-black text-black text-xs font-bold uppercase tracking-[0.15em] hover:bg-black hover:text-white transition-all flex items-center justify-center gap-2"
                            >
                                <Package className="w-4 h-4" /> Suivre commande
                            </button>
                        )}
                    </div>

                    <p className="text-center text-[10px] text-neutral-400 uppercase tracking-widest mt-8">
                        Un email de confirmation a été envoyé à {commande?.client?.email || commande?.email || 'votre adresse email'}
                    </p>

                </motion.div>

                {/* SECTION AVIS CLIENTS */}
                {testimonials.length > 0 && (
                    <motion.div
                        initial={{ opacity: 0, y: 30 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.6, delay: 0.3 }}
                        className="max-w-5xl mx-auto mt-16"
                    >
                        <div className="text-center mb-8">
                            <h2 className="text-2xl font-light uppercase tracking-[0.2em] mb-2">
                                Ils Nous Font Confiance
                            </h2>
                            <p className="text-xs text-neutral-500 uppercase tracking-widest">
                                Ce que disent nos clients
                            </p>
                        </div>

                        <div className="grid md:grid-cols-3 gap-6">
                            {testimonials.map((testimonial, index) => (
                                <div 
                                    key={index}
                                    className="bg-white p-6 border border-neutral-100 hover:shadow-lg transition-shadow duration-300"
                                >
                                    {/* Étoiles */}
                                    <div className="flex items-center gap-1 mb-4">
                                        {[...Array(5)].map((_, i) => (
                                            <svg 
                                                key={i} 
                                                className={`w-4 h-4 ${i < testimonial.note ? 'text-black fill-current' : 'text-neutral-200'}`} 
                                                viewBox="0 0 20 20"
                                            >
                                                <path d="M10 15l-5.878 3.09 1.123-6.545L.489 6.91l6.572-.955L10 0l2.939 5.955 6.572.955-4.756 4.635 1.123 6.545z"/>
                                            </svg>
                                        ))}
                                    </div>

                                    {/* Commentaire */}
                                    <p className="text-sm text-neutral-700 italic mb-6 line-clamp-4 leading-relaxed">
                                        "{testimonial.commentaire}"
                                    </p>

                                    {/* Client Info */}
                                    <div className="flex items-center justify-between pt-4 border-t border-neutral-100">
                                        <div>
                                            <p className="text-xs font-bold text-black uppercase tracking-wide">
                                                {testimonial.nom_client}
                                            </p>
                                            <p className="text-[10px] text-neutral-400 mt-1">
                                                {testimonial.produit_nom}
                                            </p>
                                        </div>
                                        {testimonial.avis_verifie && (
                                            <div className="flex items-center gap-1 text-green-600">
                                                <Check className="w-3 h-3" />
                                                <span className="text-[9px] uppercase font-bold">Vérifié</span>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            ))}
                        </div>
                    </motion.div>
                )}

            </main>

            <SimpleFooter />
        </div>
    );
}