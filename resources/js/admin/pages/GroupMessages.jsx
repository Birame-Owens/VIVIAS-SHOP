import React, { useState, useEffect } from 'react';
import { toast } from 'react-hot-toast';
import { Send, Users, Mail, MessageCircle, Loader2, CheckCircle, AlertCircle } from 'lucide-react';

// Fonction helper pour les requêtes API
const apiRequest = async (url, options = {}) => {
    const token = localStorage.getItem('admin_token');
    const response = await fetch(`/api${url}`, {
        ...options,
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`,
            'X-CSRF-TOKEN': document.querySelector('meta[name="csrf-token"]')?.content,
            ...options.headers,
        },
        credentials: 'include',
    });

    if (!response.ok) {
        const error = await response.json().catch(() => ({ message: 'Erreur réseau' }));
        throw new Error(error.message || 'Erreur lors de la requête');
    }

    return response.json();
};

const GroupMessages = () => {
    const [loading, setLoading] = useState(true);
    const [sending, setSending] = useState(false);
    const [groups, setGroups] = useState([]);
    const [stats, setStats] = useState({});
    const [selectedGroup, setSelectedGroup] = useState('');
    const [channel, setChannel] = useState('email');
    const [subject, setSubject] = useState('');
    const [message, setMessage] = useState('');
    const [previewClients, setPreviewClients] = useState([]);
    const [loadingPreview, setLoadingPreview] = useState(false);

    useEffect(() => {
        loadGroups();
    }, []);

    useEffect(() => {
        if (selectedGroup) {
            loadGroupClients(selectedGroup);
        }
    }, [selectedGroup]);

    const loadGroups = async () => {
        try {
            setLoading(true);
            const response = await apiRequest('/admin/messages/groups');
            
            if (response.success) {
                setGroups(response.data.groups);
                setStats(response.data.stats);
            }
        } catch (error) {
            console.error('Erreur chargement groupes:', error);
            toast.error('Erreur lors du chargement des groupes');
        } finally {
            setLoading(false);
        }
    };

    const loadGroupClients = async (groupId) => {
        try {
            setLoadingPreview(true);
            const response = await apiRequest(`/admin/messages/clients?group_id=${groupId}`);
            
            if (response.success) {
                setPreviewClients(response.data.clients.slice(0, 5)); // Afficher 5 premiers
            }
        } catch (error) {
            console.error('Erreur chargement clients:', error);
        } finally {
            setLoadingPreview(false);
        }
    };

    const handleSendMessage = async (e) => {
        e.preventDefault();

        if (!selectedGroup) {
            toast.error('Veuillez sélectionner un groupe');
            return;
        }

        if (!message.trim()) {
            toast.error('Veuillez entrer un message');
            return;
        }

        if (channel === 'email' && !subject.trim()) {
            toast.error('Veuillez entrer un sujet pour l\'email');
            return;
        }

        try {
            setSending(true);

            const response = await apiRequest('/admin/messages/send', {
                method: 'POST',
                body: JSON.stringify({
                    group_id: selectedGroup,
                    channel,
                    subject: subject || 'Message de VIVIAS SHOP',
                    message
                })
            });

            if (response.success) {
                toast.success(`Message envoyé à ${response.data.recipients_count} client(s) !`);
                
                // Réinitialiser le formulaire
                setSubject('');
                setMessage('');
                setSelectedGroup('');
                setPreviewClients([]);
            }
        } catch (error) {
            console.error('Erreur envoi message:', error);
            toast.error(error.message || 'Erreur lors de l\'envoi');
        } finally {
            setSending(false);
        }
    };

    const selectedGroupData = groups.find(g => g.id === selectedGroup);
    const recipientCount = selectedGroupData?.count || 0;

    if (loading) {
        return (
            <div className="min-h-screen bg-[#FDFBF7] flex items-center justify-center">
                <Loader2 className="w-8 h-8 animate-spin" />
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-[#FDFBF7] p-6">
            {/* Header */}
            <div className="max-w-7xl mx-auto mb-8">
                <div className="flex items-center gap-3 mb-2">
                    <Send className="w-8 h-8" />
                    <h1 className="text-3xl font-light tracking-tight">Messages Groupés</h1>
                </div>
                <p className="text-neutral-500 text-sm">
                    Envoyez des messages en masse à vos clients par email ou WhatsApp
                </p>
            </div>

            <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Statistiques */}
                <div className="lg:col-span-3 grid grid-cols-2 md:grid-cols-5 gap-4 mb-6">
                    {groups.map((group) => (
                        <div
                            key={group.id}
                            className={`bg-white rounded-lg p-4 border-2 transition-all cursor-pointer ${
                                selectedGroup === group.id
                                    ? 'border-black shadow-lg'
                                    : 'border-neutral-200 hover:border-neutral-300'
                            }`}
                            onClick={() => setSelectedGroup(group.id)}
                        >
                            <div className="flex items-center gap-2 mb-2">
                                <Users className="w-4 h-4 text-neutral-400" />
                                <span className="text-xs text-neutral-500 uppercase tracking-wide">
                                    {group.name}
                                </span>
                            </div>
                            <p className="text-2xl font-bold">{group.count.toLocaleString()}</p>
                        </div>
                    ))}
                </div>

                {/* Formulaire */}
                <div className="lg:col-span-2 space-y-6">
                    <div className="bg-white rounded-lg shadow-sm border border-neutral-200 p-6">
                        <h2 className="text-xl font-semibold mb-6">Composer le message</h2>

                        <form onSubmit={handleSendMessage} className="space-y-6">
                            {/* Sélection du groupe */}
                            <div>
                                <label className="block text-sm font-medium mb-2">
                                    Groupe de destinataires *
                                </label>
                                <select
                                    value={selectedGroup}
                                    onChange={(e) => setSelectedGroup(e.target.value)}
                                    className="w-full px-4 py-3 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-black focus:border-transparent"
                                    required
                                >
                                    <option value="">-- Sélectionner un groupe --</option>
                                    {groups.map((group) => (
                                        <option key={group.id} value={group.id}>
                                            {group.name} ({group.count} clients)
                                        </option>
                                    ))}
                                </select>
                            </div>

                            {/* Canal */}
                            <div>
                                <label className="block text-sm font-medium mb-2">
                                    Canal de communication *
                                </label>
                                <div className="grid grid-cols-3 gap-3">
                                    <button
                                        type="button"
                                        onClick={() => setChannel('email')}
                                        className={`flex items-center justify-center gap-2 px-4 py-3 rounded-lg border-2 transition-all ${
                                            channel === 'email'
                                                ? 'border-black bg-black text-white'
                                                : 'border-neutral-300 hover:border-neutral-400'
                                        }`}
                                    >
                                        <Mail className="w-4 h-4" />
                                        <span className="text-sm font-medium">Email</span>
                                    </button>

                                    <button
                                        type="button"
                                        onClick={() => setChannel('whatsapp')}
                                        className={`flex items-center justify-center gap-2 px-4 py-3 rounded-lg border-2 transition-all ${
                                            channel === 'whatsapp'
                                                ? 'border-black bg-black text-white'
                                                : 'border-neutral-300 hover:border-neutral-400'
                                        }`}
                                    >
                                        <MessageCircle className="w-4 h-4" />
                                        <span className="text-sm font-medium">WhatsApp</span>
                                    </button>

                                    <button
                                        type="button"
                                        onClick={() => setChannel('both')}
                                        className={`flex items-center justify-center gap-2 px-4 py-3 rounded-lg border-2 transition-all ${
                                            channel === 'both'
                                                ? 'border-black bg-black text-white'
                                                : 'border-neutral-300 hover:border-neutral-400'
                                        }`}
                                    >
                                        <span className="text-sm font-medium">Les deux</span>
                                    </button>
                                </div>
                            </div>

                            {/* Sujet (si email) */}
                            {(channel === 'email' || channel === 'both') && (
                                <div>
                                    <label className="block text-sm font-medium mb-2">
                                        Sujet de l'email *
                                    </label>
                                    <input
                                        type="text"
                                        value={subject}
                                        onChange={(e) => setSubject(e.target.value)}
                                        placeholder="Ex: Offre exclusive pour nos clients VIP"
                                        className="w-full px-4 py-3 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-black focus:border-transparent"
                                        required={channel === 'email' || channel === 'both'}
                                    />
                                </div>
                            )}

                            {/* Message */}
                            <div>
                                <label className="block text-sm font-medium mb-2">
                                    Message *
                                </label>
                                <textarea
                                    value={message}
                                    onChange={(e) => setMessage(e.target.value)}
                                    placeholder="Rédigez votre message ici..."
                                    rows={8}
                                    maxLength={5000}
                                    className="w-full px-4 py-3 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-black focus:border-transparent resize-none"
                                    required
                                />
                                <p className="text-xs text-neutral-500 mt-1">
                                    {message.length} / 5000 caractères
                                </p>
                            </div>

                            {/* Bouton d'envoi */}
                            <button
                                type="submit"
                                disabled={sending || !selectedGroup}
                                className="w-full bg-black text-white py-4 rounded-lg font-medium hover:bg-neutral-800 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                            >
                                {sending ? (
                                    <>
                                        <Loader2 className="w-5 h-5 animate-spin" />
                                        Envoi en cours...
                                    </>
                                ) : (
                                    <>
                                        <Send className="w-5 h-5" />
                                        Envoyer à {recipientCount} client(s)
                                    </>
                                )}
                            </button>
                        </form>
                    </div>
                </div>

                {/* Prévisualisation */}
                <div className="lg:col-span-1">
                    <div className="bg-white rounded-lg shadow-sm border border-neutral-200 p-6 sticky top-6">
                        <h3 className="text-lg font-semibold mb-4">Aperçu des destinataires</h3>

                        {!selectedGroup ? (
                            <div className="text-center py-8 text-neutral-400">
                                <Users className="w-12 h-12 mx-auto mb-2 opacity-50" />
                                <p className="text-sm">Sélectionnez un groupe</p>
                            </div>
                        ) : loadingPreview ? (
                            <div className="text-center py-8">
                                <Loader2 className="w-6 h-6 animate-spin mx-auto" />
                            </div>
                        ) : (
                            <>
                                <div className="mb-4 p-3 bg-neutral-50 rounded-lg">
                                    <div className="flex items-center justify-between">
                                        <span className="text-sm text-neutral-600">Total</span>
                                        <span className="text-lg font-bold">{recipientCount}</span>
                                    </div>
                                </div>

                                <div className="space-y-2">
                                    <p className="text-xs text-neutral-500 uppercase tracking-wide mb-3">
                                        Exemples de clients
                                    </p>
                                    {previewClients.map((client, index) => (
                                        <div
                                            key={client.id}
                                            className="p-3 border border-neutral-200 rounded-lg"
                                        >
                                            <p className="font-medium text-sm">
                                                {client.prenom} {client.nom}
                                            </p>
                                            <p className="text-xs text-neutral-500">{client.email}</p>
                                        </div>
                                    ))}
                                    {recipientCount > 5 && (
                                        <p className="text-xs text-neutral-400 text-center py-2">
                                            + {recipientCount - 5} autre(s) client(s)
                                        </p>
                                    )}
                                </div>

                                {/* Infos canal */}
                                <div className="mt-4 pt-4 border-t border-neutral-200">
                                    <div className="flex items-center gap-2 text-sm text-neutral-600">
                                        {channel === 'email' && (
                                            <>
                                                <Mail className="w-4 h-4" />
                                                <span>Envoi par email</span>
                                            </>
                                        )}
                                        {channel === 'whatsapp' && (
                                            <>
                                                <MessageCircle className="w-4 h-4" />
                                                <span>Envoi par WhatsApp</span>
                                            </>
                                        )}
                                        {channel === 'both' && (
                                            <>
                                                <CheckCircle className="w-4 h-4" />
                                                <span>Email + WhatsApp</span>
                                            </>
                                        )}
                                    </div>
                                </div>
                            </>
                        )}
                    </div>

                    {/* Conseils */}
                    <div className="mt-6 bg-blue-50 rounded-lg border border-blue-200 p-4">
                        <div className="flex items-start gap-2">
                            <AlertCircle className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
                            <div>
                                <h4 className="font-medium text-blue-900 text-sm mb-1">Conseils</h4>
                                <ul className="text-xs text-blue-800 space-y-1">
                                    <li>• Personnalisez vos messages</li>
                                    <li>• Évitez le spam</li>
                                    <li>• Testez avec un petit groupe d'abord</li>
                                    <li>• Vérifiez l'orthographe</li>
                                </ul>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default GroupMessages;
