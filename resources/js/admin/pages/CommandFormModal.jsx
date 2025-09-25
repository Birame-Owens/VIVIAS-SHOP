import React from 'react';
import { 
    X,
    User,
    MapPin,
    Package,
    Plus,
    Trash2,
    Save,
    RefreshCw,
    Ruler
} from 'lucide-react';

const CommandFormModal = ({ 
    formData, 
    setFormData, 
    clients, 
    produits, 
    selectedClient, 
    onClientChange, 
    onProduitChange, 
    onAddArticle, 
    onUpdateArticle, 
    onRemoveArticle, 
    onSubmit, 
    onClose, 
    updating,
    formatPrice,
    isEditing
}) => {
    return (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
            <div className="relative top-10 mx-auto p-5 border w-11/12 max-w-6xl shadow-lg rounded-md bg-white mb-10">
                <div className="flex items-center justify-between mb-4">
                    <h3 className="text-lg font-bold text-gray-900">
                        {isEditing ? 'Modifier la commande' : 'Nouvelle commande'}
                    </h3>
                    <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
                        <X className="w-6 h-6" />
                    </button>
                </div>

                <form onSubmit={onSubmit} className="space-y-6">
                    {/* Sélection client */}
                    <div className="bg-gray-50 p-4 rounded-lg">
                        <h4 className="font-semibold mb-3 flex items-center">
                            <User className="w-5 h-5 mr-2" />
                            Sélection du client
                        </h4>
                        <select
                            value={formData.client_id}
                            onChange={(e) => onClientChange(e.target.value)}
                            className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                            required
                        >
                            <option value="">-- Sélectionner un client --</option>
                            {clients.map(client => (
                                <option key={client.id} value={client.id}>
                                    {client.nom_complet} - {client.telephone}
                                    {client.a_mesures && ' ✓ (mesures disponibles)'}
                                </option>
                            ))}
                        </select>

                        {selectedClient?.mesures && (
                            <div className="mt-3 bg-blue-50 p-3 rounded border border-blue-200">
                                <p className="text-sm font-medium text-blue-900 mb-2 flex items-center">
                                    <Ruler className="w-4 h-4 mr-1" />
                                    Mesures disponibles pour ce client
                                </p>
                                <div className="grid grid-cols-4 gap-2 text-xs">
                                    {Object.entries(selectedClient.mesures).map(([key, value]) => {
                                        if (value && !['id', 'client_id', 'created_at', 'updated_at'].includes(key)) {
                                            return (
                                                <div key={key} className="text-blue-800">
                                                    <span className="font-medium">{key.replace(/_/g, ' ')}:</span>
                                                    <span className="ml-1">{value}cm</span>
                                                </div>
                                            );
                                        }
                                        return null;
                                    })}
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Informations livraison */}
                    <div className="bg-gray-50 p-4 rounded-lg">
                        <h4 className="font-semibold mb-3 flex items-center">
                            <MapPin className="w-5 h-5 mr-2" />
                            Informations de livraison
                        </h4>
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Nom destinataire *
                                </label>
                                <input
                                    type="text"
                                    value={formData.nom_destinataire}
                                    onChange={(e) => setFormData({...formData, nom_destinataire: e.target.value})}
                                    className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                                    required
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Téléphone *
                                </label>
                                <input
                                    type="tel"
                                    value={formData.telephone_livraison}
                                    onChange={(e) => setFormData({...formData, telephone_livraison: e.target.value})}
                                    className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                                    required
                                />
                            </div>
                            <div className="col-span-2">
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Adresse de livraison *
                                </label>
                                <textarea
                                    value={formData.adresse_livraison}
                                    onChange={(e) => setFormData({...formData, adresse_livraison: e.target.value})}
                                    className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                                    rows="2"
                                    required
                                />
                            </div>
                            <div className="col-span-2">
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Instructions de livraison
                                </label>
                                <textarea
                                    value={formData.instructions_livraison}
                                    onChange={(e) => setFormData({...formData, instructions_livraison: e.target.value})}
                                    className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                                    rows="2"
                                    placeholder="Instructions spéciales pour la livraison..."
                                />
                            </div>
                        </div>
                    </div>

                    {/* Articles */}
                    <div>
                        <div className="flex justify-between items-center mb-3">
                            <h4 className="font-semibold flex items-center">
                                <Package className="w-5 h-5 mr-2" />
                                Articles à commander
                            </h4>
                            <button
                                type="button"
                                onClick={onAddArticle}
                                className="text-purple-600 hover:text-purple-700 flex items-center text-sm bg-purple-50 px-3 py-1 rounded-lg"
                            >
                                <Plus className="w-4 h-4 mr-1" />
                                Ajouter un article
                            </button>
                        </div>

                        {formData.articles.length === 0 ? (
                            <div className="text-center py-8 bg-gray-50 rounded-lg">
                                <Package className="w-12 h-12 text-gray-400 mx-auto mb-2" />
                                <p className="text-gray-500">Aucun article ajouté</p>
                                <p className="text-sm text-gray-400">Cliquez sur "Ajouter un article" pour commencer</p>
                            </div>
                        ) : (
                            formData.articles.map((article, index) => (
                                <ArticleFormItem
                                    key={index}
                                    article={article}
                                    index={index}
                                    produits={produits}
                                    selectedClient={selectedClient}
                                    onProduitChange={onProduitChange}
                                    onUpdateArticle={onUpdateArticle}
                                    onRemoveArticle={onRemoveArticle}
                                    formatPrice={formatPrice}
                                />
                            ))
                        )}
                    </div>

                    {/* Options de la commande */}
                    <div className="bg-gray-50 p-4 rounded-lg">
                        <h4 className="font-semibold mb-3">Options de la commande</h4>
                        
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Date de livraison prévue
                                </label>
                                <input
                                    type="date"
                                    value={formData.date_livraison_prevue}
                                    onChange={(e) => setFormData({...formData, date_livraison_prevue: e.target.value})}
                                    min={new Date().toISOString().split('T')[0]}
                                    className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                                />
                            </div>
                            
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Priorité
                                </label>
                                <select
                                    value={formData.priorite}
                                    onChange={(e) => setFormData({...formData, priorite: e.target.value})}
                                    className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                                >
                                    <option value="normale">Normale</option>
                                    <option value="urgente">Urgente</option>
                                    <option value="tres_urgente">Très urgente</option>
                                </select>
                            </div>
                            
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Frais de livraison (FCFA)
                                </label>
                                <input
                                    type="number"
                                    min="0"
                                    step="100"
                                    value={formData.frais_livraison}
                                    onChange={(e) => setFormData({...formData, frais_livraison: parseFloat(e.target.value) || 0})}
                                    className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                                />
                            </div>
                            
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Remise (FCFA)
                                </label>
                                <input
                                    type="number"
                                    min="0"
                                    step="100"
                                    value={formData.remise}
                                    onChange={(e) => setFormData({...formData, remise: parseFloat(e.target.value) || 0})}
                                    className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                                />
                            </div>
                            
                            <div className="md:col-span-2">
                                <label className="flex items-center">
                                    <input
                                        type="checkbox"
                                        checked={formData.est_cadeau}
                                        onChange={(e) => setFormData({...formData, est_cadeau: e.target.checked})}
                                        className="mr-2"
                                    />
                                    <span className="text-sm font-medium text-gray-700">
                                        C'est un cadeau
                                    </span>
                                </label>
                            </div>
                            
                            {formData.est_cadeau && (
                                <div className="md:col-span-2">
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        Message cadeau *
                                    </label>
                                    <textarea
                                        value={formData.message_cadeau}
                                        onChange={(e) => setFormData({...formData, message_cadeau: e.target.value})}
                                        className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                                        rows="2"
                                        placeholder="Message à joindre au cadeau..."
                                        required={formData.est_cadeau}
                                    />
                                </div>
                            )}

                            <div className="md:col-span-2">
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Notes administratives
                                </label>
                                <textarea
                                    value={formData.notes_admin}
                                    onChange={(e) => setFormData({...formData, notes_admin: e.target.value})}
                                    className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                                    rows="2"
                                    placeholder="Notes internes pour l'équipe..."
                                />
                            </div>
                        </div>
                    </div>

                    {/* Résumé de la commande */}
                    {formData.articles.length > 0 && (
                        <div className="bg-purple-50 p-4 rounded-lg border border-purple-200">
                            <h4 className="font-semibold text-purple-900 mb-3">Résumé de la commande</h4>
                            <div className="space-y-2 text-sm">
                                <div className="flex justify-between">
                                    <span>Sous-total ({formData.articles.reduce((acc, art) => acc + (art.quantite || 0), 0)} articles)</span>
                                    <span>{formatPrice(formData.articles.reduce((acc, art) => acc + ((art.quantite || 0) * (art.prix_unitaire || 0)), 0))}</span>
                                </div>
                                {formData.frais_livraison > 0 && (
                                    <div className="flex justify-between">
                                        <span>Frais de livraison</span>
                                        <span>{formatPrice(formData.frais_livraison)}</span>
                                    </div>
                                )}
                                {formData.remise > 0 && (
                                    <div className="flex justify-between text-red-600">
                                        <span>Remise</span>
                                        <span>-{formatPrice(formData.remise)}</span>
                                    </div>
                                )}
                                <div className="border-t pt-2">
                                    <div className="flex justify-between font-bold text-lg text-purple-900">
                                        <span>Total à payer</span>
                                        <span>{formatPrice(
                                            Math.max(0, 
                                                formData.articles.reduce((acc, art) => acc + ((art.quantite || 0) * (art.prix_unitaire || 0)), 0) +
                                                formData.frais_livraison - 
                                                formData.remise
                                            )
                                        )}</span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Boutons d'action */}
                    <div className="flex justify-end space-x-3 pt-4 border-t">
                        <button
                            type="button"
                            onClick={onClose}
                            disabled={updating}
                            className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 disabled:opacity-50"
                        >
                            Annuler
                        </button>
                        <button
                            type="submit"
                            disabled={updating || formData.articles.length === 0}
                            className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 disabled:opacity-50 flex items-center space-x-2"
                        >
                            {updating ? (
                                <>
                                    <RefreshCw className="w-4 h-4 animate-spin" />
                                    <span>{isEditing ? 'Modification...' : 'Création...'}</span>
                                </>
                            ) : (
                                <>
                                    <Save className="w-4 h-4" />
                                    <span>{isEditing ? 'Modifier la commande' : 'Créer la commande'}</span>
                                </>
                            )}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

// Composant pour un article dans le formulaire
const ArticleFormItem = ({ 
    article, 
    index, 
    produits, 
    selectedClient, 
    onProduitChange, 
    onUpdateArticle, 
    onRemoveArticle, 
    formatPrice 
}) => {
    return (
        <div className="border rounded-lg p-4 mb-4 bg-white shadow-sm">
            <div className="flex justify-between items-start mb-4">
                <h5 className="font-medium text-lg text-gray-900">Article {index + 1}</h5>
                <button
                    type="button"
                    onClick={() => onRemoveArticle(index)}
                    className="text-red-500 hover:text-red-700 p-1"
                >
                    <Trash2 className="w-4 h-4" />
                </button>
            </div>

            {/* Sélection produit et détails de base */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                <div className="md:col-span-3">
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                        Produit *
                    </label>
                    <select
                        value={article.produit_id}
                        onChange={(e) => onProduitChange(index, e.target.value)}
                        className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                        required
                    >
                        <option value="">-- Sélectionner un produit --</option>
                        {produits.map(p => (
                            <option key={p.id} value={p.id}>
                                {p.nom} - {formatPrice(p.prix_promo || p.prix)}
                                {p.gestion_stock && ` (Stock: ${p.stock_disponible})`}
                            </option>
                        ))}
                    </select>
                </div>
                
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                        Quantité *
                    </label>
                    <input
                        type="number"
                        min="1"
                        value={article.quantite}
                        onChange={(e) => onUpdateArticle(index, 'quantite', parseInt(e.target.value))}
                        className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                        required
                    />
                </div>
                
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                        Prix unitaire (FCFA) *
                    </label>
                    <input
                        type="number"
                        min="0"
                        step="100"
                        value={article.prix_unitaire}
                        onChange={(e) => onUpdateArticle(index, 'prix_unitaire', parseFloat(e.target.value))}
                        className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                        required
                    />
                </div>
                
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                        Couleur
                    </label>
                    <input
                        type="text"
                        placeholder="Ex: Rouge, Bleu..."
                        value={article.couleur || ''}
                        onChange={(e) => onUpdateArticle(index, 'couleur', e.target.value)}
                        className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                    />
                </div>
            </div>

            {/* Options de taille et mesures */}
            <div className="bg-gray-50 rounded-lg p-4 mb-4">
                <h6 className="font-medium text-gray-900 mb-3">Taille et mesures</h6>
                
                <div className="space-y-3">
                    {/* Option taille standard */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            Taille standard
                        </label>
                        <select
                            value={article.taille || ''}
                            onChange={(e) => {
                                onUpdateArticle(index, 'taille', e.target.value);
                                // Si une taille est sélectionnée, effacer les mesures
                                if (e.target.value) {
                                    onUpdateArticle(index, 'mesures', {});
                                    onUpdateArticle(index, 'utilise_mesures_client', false);
                                }
                            }}
                            className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                        >
                            <option value="">-- Sélectionner une taille ou utiliser des mesures --</option>
                            <option value="XS">XS</option>
                            <option value="S">S</option>
                            <option value="M">M</option>
                            <option value="L">L</option>
                            <option value="XL">XL</option>
                            <option value="XXL">XXL</option>
                            <option value="XXXL">XXXL</option>
                        </select>
                    </div>

                    {/* Options de mesures (seulement si pas de taille standard) */}
                    {!article.taille && (
                        <div className="space-y-3">
                            {/* Utiliser mesures du client */}
                            {selectedClient?.mesures && (
                                <label className="flex items-center">
                                    <input
                                        type="checkbox"
                                        checked={article.utilise_mesures_client || false}
                                        onChange={(e) => {
                                            onUpdateArticle(index, 'utilise_mesures_client', e.target.checked);
                                            if (e.target.checked) {
                                                onUpdateArticle(index, 'mesures', {});
                                            }
                                        }}
                                        className="mr-2"
                                    />
                                    <span className="text-sm">Utiliser les mesures du client</span>
                                </label>
                            )}

                            {/* Mesures personnalisées */}
                            {!article.utilise_mesures_client && (
                                <div>
                                    <p className="text-sm font-medium text-gray-700 mb-2">
                                        Mesures personnalisées (en centimètres)
                                    </p>
                                    <div className="grid grid-cols-3 gap-3">
                                        {[
                                            { key: 'epaule', label: 'Épaule' },
                                            { key: 'poitrine', label: 'Poitrine' },
                                            { key: 'taille', label: 'Taille' },
                                            { key: 'longueur_robe', label: 'Long. robe' },
                                            { key: 'tour_bras', label: 'Tour bras' },
                                            { key: 'tour_cuisses', label: 'Tour cuisses' },
                                            { key: 'longueur_jupe', label: 'Long. jupe' },
                                            { key: 'ceinture', label: 'Ceinture' },
                                            { key: 'tour_fesses', label: 'Tour fesses' },
                                            { key: 'buste', label: 'Buste' },
                                            { key: 'longueur_manches_longues', label: 'Manches L' },
                                            { key: 'longueur_manches_courtes', label: 'Manches C' }
                                        ].map(({ key, label }) => (
                                            <div key={key}>
                                                <label className="block text-xs text-gray-600 mb-1">{label}</label>
                                                <input
                                                    type="number"
                                                    step="0.5"
                                                    min="0"
                                                    max="200"
                                                    placeholder="cm"
                                                    value={article.mesures?.[key] || ''}
                                                    onChange={(e) => {
                                                        const mesures = { ...article.mesures };
                                                        if (e.target.value) {
                                                            mesures[key] = parseFloat(e.target.value);
                                                        } else {
                                                            delete mesures[key];
                                                        }
                                                        onUpdateArticle(index, 'mesures', mesures);
                                                    }}
                                                    className="w-full px-2 py-1 border rounded text-sm focus:ring-1 focus:ring-purple-500 focus:border-transparent"
                                                />
                                            </div>
                                        ))}
                                    </div>
                                    <p className="text-xs text-gray-500 mt-2">
                                        💡 Ces mesures seront automatiquement sauvegardées pour ce client
                                    </p>
                                </div>
                            )}

                            {/* Aperçu des mesures du client si sélectionnées */}
                            {article.utilise_mesures_client && selectedClient?.mesures && (
                                <div className="bg-blue-50 p-3 rounded border border-blue-200">
                                    <p className="text-xs font-medium text-blue-900 mb-2">
                                        Mesures du client qui seront utilisées :
                                    </p>
                                    <div className="grid grid-cols-4 gap-1 text-xs">
                                        {Object.entries(selectedClient.mesures).map(([key, value]) => {
                                            if (value && !['id', 'client_id', 'created_at', 'updated_at', 'deleted_at'].includes(key)) {
                                                return (
                                                    <div key={key} className="text-blue-800">
                                                        <span className="font-medium">{key.replace(/_/g, ' ')}:</span> {value}cm
                                                    </div>
                                                );
                                            }
                                            return null;
                                        })}
                                    </div>
                                </div>
                            )}
                        </div>
                    )}
                </div>
            </div>

            {/* Instructions spéciales */}
            <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                    Instructions spéciales / Personnalisations
                </label>
                <textarea
                    value={article.instructions || ''}
                    onChange={(e) => onUpdateArticle(index, 'instructions', e.target.value)}
                    placeholder="Ex: Ajouter des perles, broderie spéciale, modification du col..."
                    className="w-full px-3 py-2 border rounded-lg text-sm focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                    rows="2"
                />
            </div>

            {/* Total pour cet article */}
            <div className="mt-3 pt-3 border-t">
                <div className="text-right">
                    <span className="text-sm text-gray-600">Total cet article: </span>
                    <span className="font-bold text-lg text-purple-600">
                        {formatPrice((article.quantite || 0) * (article.prix_unitaire || 0))}
                    </span>
                </div>
            </div>
        </div>
    );
};

export default CommandFormModal;