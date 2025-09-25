import React from 'react';
import { 
    X,
    User,
    Package,
    Ruler,
    CreditCard,
    Calendar,
    MapPin,
    Phone,
    Mail,
    AlertTriangle,
    CheckCircle,
    Clock,
    Truck
} from 'lucide-react';

const CommandDetailsModal = ({ 
    command, 
    onClose, 
    onUpdateStatus, 
    formatPrice, 
    getStatusColor, 
    getStatusIcon,
    updating 
}) => {
    const getStatutLabel = (statut) => {
        const labels = {
            'en_attente': 'En attente',
            'confirmee': 'Confirmée',
            'en_preparation': 'En préparation',
            'prete': 'Prête',
            'en_livraison': 'En livraison',
            'livree': 'Livrée',
            'annulee': 'Annulée'
        };
        return labels[statut] || statut;
    };

    const renderMesuresDetails = (mesures) => {
        if (!mesures || Object.keys(mesures).length === 0) {
            return null;
        }

        return (
            <div className="bg-blue-50 p-3 rounded border border-blue-200">
                <p className="text-sm font-medium text-blue-900 mb-2 flex items-center">
                    <Ruler className="w-4 h-4 mr-1" />
                    Mesures utilisées (en cm)
                </p>
                <div className="grid grid-cols-3 gap-2 text-sm">
                    {Object.entries(mesures).map(([key, value]) => (
                        value && (
                            <div key={key} className="text-blue-800">
                                <span className="font-medium">{key.replace(/_/g, ' ')}:</span>
                                <span className="ml-1">{value}cm</span>
                            </div>
                        )
                    ))}
                </div>
            </div>
        );
    };

    const renderClientMesures = (clientDetails) => {
        if (!clientDetails?.mesures_client?.mesures) {
            return null;
        }

        return (
            <div className="mt-3 bg-green-50 p-3 rounded border border-green-200">
                <p className="text-sm font-medium text-green-900 mb-2 flex items-center">
                    <User className="w-4 h-4 mr-1" />
                    Mesures du client
                    {clientDetails.mesures_client.date_prise && (
                        <span className="ml-2 text-xs text-green-700">
                            (Prises le {clientDetails.mesures_client.date_prise})
                        </span>
                    )}
                </p>
                <div className="grid grid-cols-4 gap-2 text-xs">
                    {Object.entries(clientDetails.mesures_client.mesures).map(([key, value]) => (
                        value && (
                            <div key={key} className="text-green-800">
                                <span className="font-medium">{key.replace(/_/g, ' ')}:</span>
                                <span className="ml-1">{value}cm</span>
                            </div>
                        )
                    ))}
                </div>
                {clientDetails.mesures_client.notes_mesures && (
                    <p className="mt-2 text-xs text-green-700 italic">
                        Note: {clientDetails.mesures_client.notes_mesures}
                    </p>
                )}
            </div>
        );
    };

    return (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
            <div className="relative top-20 mx-auto p-5 border w-11/12 max-w-6xl shadow-lg rounded-md bg-white">
                <div className="flex items-center justify-between mb-4">
                    <h3 className="text-lg font-bold text-gray-900">
                        Détails de la commande {command.numero_commande}
                    </h3>
                    <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
                        <X className="w-6 h-6" />
                    </button>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    {/* Colonne principale */}
                    <div className="lg:col-span-2 space-y-6">
                        {/* Informations client */}
                        <div className="bg-gray-50 p-4 rounded-lg">
                            <h4 className="font-semibold text-gray-900 mb-3 flex items-center">
                                <User className="w-5 h-5 mr-2" />
                                Informations client et livraison
                            </h4>
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="text-sm text-gray-600">Destinataire</label>
                                    <p className="font-medium">{command.nom_destinataire}</p>
                                </div>
                                <div>
                                    <label className="text-sm text-gray-600">Téléphone</label>
                                    <p className="font-medium flex items-center">
                                        <Phone className="w-4 h-4 mr-1" />
                                        {command.telephone_livraison}
                                    </p>
                                </div>
                                {command.client_details && (
                                    <div className="col-span-2">
                                        <label className="text-sm text-gray-600">Client enregistré</label>
                                        <p className="font-medium flex items-center">
                                            <User className="w-4 h-4 mr-1" />
                                            {command.client_details.nom_complet}
                                            {command.client_details.email && (
                                                <span className="ml-2 text-sm text-gray-500 flex items-center">
                                                    <Mail className="w-3 h-3 mr-1" />
                                                    {command.client_details.email}
                                                </span>
                                            )}
                                        </p>
                                    </div>
                                )}
                                <div className="col-span-2">
                                    <label className="text-sm text-gray-600">Adresse de livraison</label>
                                    <p className="font-medium flex items-start">
                                        <MapPin className="w-4 h-4 mr-1 mt-0.5" />
                                        {command.adresse_livraison}
                                    </p>
                                </div>
                                {command.instructions_livraison && (
                                    <div className="col-span-2">
                                        <label className="text-sm text-gray-600">Instructions de livraison</label>
                                        <p className="text-sm bg-yellow-50 p-2 rounded border border-yellow-200">
                                            {command.instructions_livraison}
                                        </p>
                                    </div>
                                )}
                            </div>

                            {/* Affichage des mesures du client si disponibles */}
                            {command.client_details?.mesures_client && renderClientMesures(command.client_details)}
                        </div>

                        {/* Articles avec mesures détaillées */}
                        <div>
                            <h4 className="font-semibold text-gray-900 mb-3 flex items-center">
                                <Package className="w-5 h-5 mr-2" />
                                Articles commandés ({command.articles?.length || 0})
                            </h4>
                            <div className="space-y-4">
                                {command.articles?.map((article, index) => (
                                    <div key={index} className="border rounded-lg p-4 bg-white shadow-sm">
                                        <div className="flex justify-between items-start mb-3">
                                            <div className="flex-1">
                                                <div className="flex items-center space-x-3">
                                                    {article.produit.image && (
                                                        <img 
                                                            src={article.produit.image} 
                                                            alt={article.produit.nom}
                                                            className="w-16 h-16 object-cover rounded border"
                                                        />
                                                    )}
                                                    <div>
                                                        <p className="font-medium text-lg">{article.produit.nom}</p>
                                                        <p className="text-sm text-gray-600">{article.produit.categorie}</p>
                                                        {article.produit.fait_sur_mesure && (
                                                            <span className="inline-flex items-center px-2 py-1 rounded-full text-xs bg-purple-100 text-purple-800 mt-1">
                                                                <Ruler className="w-3 h-3 mr-1" />
                                                                Sur mesure
                                                            </span>
                                                        )}
                                                    </div>
                                                </div>
                                                
                                                <div className="mt-3 grid grid-cols-2 gap-4 text-sm">
                                                    <div>
                                                        <span className="text-gray-600">Quantité:</span>
                                                        <span className="font-medium ml-2">{article.quantite}</span>
                                                    </div>
                                                    <div>
                                                        <span className="text-gray-600">Prix unitaire:</span>
                                                        <span className="font-medium ml-2">{formatPrice(article.prix_unitaire)}</span>
                                                    </div>
                                                    {article.taille_choisie && (
                                                        <div>
                                                            <span className="text-gray-600">Taille:</span>
                                                            <span className="font-medium ml-2 px-2 py-1 bg-gray-100 rounded text-xs">
                                                                {article.taille_choisie}
                                                            </span>
                                                        </div>
                                                    )}
                                                    {article.couleur_choisie && (
                                                        <div>
                                                            <span className="text-gray-600">Couleur:</span>
                                                            <span className="font-medium ml-2">{article.couleur_choisie}</span>
                                                        </div>
                                                    )}
                                                </div>

                                                {/* Type de confection et mesures */}
                                                <div className="mt-3">
                                                    {article.type_confection === 'taille_standard' && (
                                                        <div className="bg-gray-50 p-2 rounded border">
                                                            <p className="text-sm font-medium text-gray-700">
                                                                Confection en taille standard: {article.taille_choisie}
                                                            </p>
                                                        </div>
                                                    )}

                                                    {article.type_confection === 'mesures_specifiques' && article.mesures_utilisees && (
                                                        <div>
                                                            <p className="text-sm font-medium text-gray-700 mb-2">
                                                                Confection sur mesure - {article.source_mesures}
                                                            </p>
                                                            {renderMesuresDetails(article.mesures_utilisees)}
                                                        </div>
                                                    )}
                                                </div>
                                                
                                                {/* Instructions spéciales */}
                                                {article.demandes_personnalisation && (
                                                    <div className="mt-3 bg-yellow-50 p-3 rounded border border-yellow-200">
                                                        <p className="text-sm font-medium text-yellow-900 mb-1">Instructions spéciales:</p>
                                                        <p className="text-sm text-yellow-800">{article.demandes_personnalisation}</p>
                                                    </div>
                                                )}
                                            </div>
                                            <div className="text-right">
                                                <p className="font-bold text-lg">{formatPrice(article.prix_total)}</p>
                                                <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium mt-2 ${
                                                    article.statut_production === 'termine' ? 'bg-green-100 text-green-800' :
                                                    article.statut_production === 'en_cours' ? 'bg-blue-100 text-blue-800' :
                                                    article.statut_production === 'pret' ? 'bg-purple-100 text-purple-800' :
                                                    'bg-gray-100 text-gray-800'
                                                }`}>
                                                    {article.statut_production_label || article.statut_production}
                                                </span>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* Informations de production */}
                        {command.production_info && (
                            <div className="bg-purple-50 p-4 rounded-lg border border-purple-200">
                                <h4 className="font-semibold text-purple-900 mb-3">Informations de production</h4>
                                <div className="grid grid-cols-2 gap-4 text-sm">
                                    <div>
                                        <span className="text-purple-700">Articles sur mesure:</span>
                                        <span className="font-medium ml-2">{command.production_info.articles_avec_mesures}</span>
                                    </div>
                                    <div>
                                        <span className="text-purple-700">Articles taille standard:</span>
                                        <span className="font-medium ml-2">{command.production_info.articles_taille_standard}</span>
                                    </div>
                                    <div>
                                        <span className="text-purple-700">Délai estimé:</span>
                                        <span className="font-medium ml-2">{command.production_info.delai_production_estime} jour(s)</span>
                                    </div>
                                    <div>
                                        <span className="text-purple-700">Difficulté:</span>
                                        <span className={`font-medium ml-2 px-2 py-1 rounded text-xs ${
                                            command.production_info.difficulte_globale === 'facile' ? 'bg-green-100 text-green-800' :
                                            command.production_info.difficulte_globale === 'moyen' ? 'bg-yellow-100 text-yellow-800' :
                                            'bg-red-100 text-red-800'
                                        }`}>
                                            {command.production_info.difficulte_globale}
                                        </span>
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Sidebar */}
                    <div className="space-y-4">
                        {/* Statut et actions */}
                        <div className="bg-white border rounded-lg p-4">
                            <h4 className="font-semibold text-gray-900 mb-3">Statut & Actions</h4>
                            <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium mb-4 ${getStatusColor(command.statut)}`}>
                                {getStatusIcon(command.statut)}
                                <span className="ml-1">{command.statut_label}</span>
                            </span>

                            {/* Actions de changement de statut */}
                            {!['livree', 'annulee'].includes(command.statut) && (
                                <div className="space-y-2">
                                    {command.statut === 'en_attente' && (
                                        <button
                                            onClick={() => onUpdateStatus(command.id, 'confirmee')}
                                            disabled={updating}
                                            className="w-full bg-blue-600 text-white px-3 py-2 rounded text-sm hover:bg-blue-700 disabled:opacity-50"
                                        >
                                            Confirmer la commande
                                        </button>
                                    )}
                                    {command.statut === 'confirmee' && (
                                        <button
                                            onClick={() => onUpdateStatus(command.id, 'en_preparation')}
                                            disabled={updating}
                                            className="w-full bg-orange-600 text-white px-3 py-2 rounded text-sm hover:bg-orange-700 disabled:opacity-50"
                                        >
                                            Mettre en préparation
                                        </button>
                                    )}
                                    {command.statut === 'en_preparation' && (
                                        <button
                                            onClick={() => onUpdateStatus(command.id, 'prete')}
                                            disabled={updating}
                                            className="w-full bg-purple-600 text-white px-3 py-2 rounded text-sm hover:bg-purple-700 disabled:opacity-50"
                                        >
                                            Marquer comme prête
                                        </button>
                                    )}
                                    {command.statut === 'prete' && (
                                        <button
                                            onClick={() => onUpdateStatus(command.id, 'en_livraison')}
                                            disabled={updating}
                                            className="w-full bg-indigo-600 text-white px-3 py-2 rounded text-sm hover:bg-indigo-700 disabled:opacity-50"
                                        >
                                            Expédier
                                        </button>
                                    )}
                                    {command.statut === 'en_livraison' && (
                                        <button
                                            onClick={() => onUpdateStatus(command.id, 'livree')}
                                            disabled={updating}
                                            className="w-full bg-green-600 text-white px-3 py-2 rounded text-sm hover:bg-green-700 disabled:opacity-50"
                                        >
                                            Marquer comme livrée
                                        </button>
                                    )}
                                </div>
                            )}
                        </div>

                        {/* Résumé financier */}
                        <div className="bg-white border rounded-lg p-4">
                            <h4 className="font-semibold text-gray-900 mb-3">Résumé financier</h4>
                            <div className="space-y-2 text-sm">
                                <div className="flex justify-between">
                                    <span>Sous-total</span>
                                    <span>{formatPrice(command.sous_total)}</span>
                                </div>
                                {command.frais_livraison > 0 && (
                                    <div className="flex justify-between">
                                        <span>Frais de livraison</span>
                                        <span>{formatPrice(command.frais_livraison)}</span>
                                    </div>
                                )}
                                {command.remise > 0 && (
                                    <div className="flex justify-between text-red-600">
                                        <span>Remise</span>
                                        <span>-{formatPrice(command.remise)}</span>
                                    </div>
                                )}
                                <div className="border-t pt-2">
                                    <div className="flex justify-between font-bold text-lg">
                                        <span>Total</span>
                                        <span>{formatPrice(command.montant_total)}</span>
                                    </div>
                                </div>
                                
                                {/* État des paiements */}
                                <div className="mt-4 pt-4 border-t">
                                    <div className="flex justify-between text-sm">
                                        <span>Montant payé</span>
                                        <span className="text-green-600 font-medium">{formatPrice(command.montant_paye || 0)}</span>
                                    </div>
                                    {command.montant_restant > 0 && (
                                        <div className="flex justify-between text-sm">
                                            <span>Montant restant</span>
                                            <span className="text-red-600 font-medium">{formatPrice(command.montant_restant)}</span>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>

                        {/* Paiements */}
                      
<div className="border-t pt-4">
    <h4 className="font-semibold text-gray-900 mb-3 flex items-center">
        <CreditCard className="w-4 h-4 mr-2" />
        Paiements ({command.paiements?.length || 0})
    </h4>
    
    {command.paiements && command.paiements.length > 0 ? (
        <div className="space-y-3">
            {command.paiements.map((paiement, index) => (
                <div key={paiement.id} className="bg-gray-50 p-3 rounded-lg">
                    <div className="flex justify-between items-start">
                        <div>
                            <p className="font-medium text-green-600">
                                {formatPrice(paiement.montant)}
                            </p>
                            <p className="text-sm text-gray-600">
                                {paiement.methode} • {paiement.date}
                            </p>
                            {paiement.reference && (
                                <p className="text-xs text-gray-500">
                                    Réf: {paiement.reference}
                                </p>
                            )}
                        </div>
                        <span className={`px-2 py-1 rounded-full text-xs ${
                            paiement.statut === 'valide' 
                                ? 'bg-green-100 text-green-800' 
                                : 'bg-yellow-100 text-yellow-800'
                        }`}>
                            {paiement.statut}
                        </span>
                    </div>
                </div>
            ))}
            
            {/* Résumé des paiements */}
            <div className="bg-blue-50 p-3 rounded-lg border border-blue-200">
                <div className="flex justify-between text-sm">
                    <span>Total payé:</span>
                    <span className="font-medium text-green-600">
                        {formatPrice(command.montant_paye)}
                    </span>
                </div>
                <div className="flex justify-between text-sm">
                    <span>Montant restant:</span>
                    <span className={`font-medium ${
                        command.montant_restant > 0 ? 'text-orange-600' : 'text-green-600'
                    }`}>
                        {formatPrice(command.montant_restant)}
                    </span>
                </div>
                <div className="flex justify-between text-sm font-semibold border-t border-blue-300 pt-2 mt-2">
                    <span>Total commande:</span>
                    <span>{formatPrice(command.montant_total)}</span>
                </div>
            </div>
            
            {/* Bouton pour ajouter un paiement depuis le modal */}
            {command.montant_restant > 0 && (
                <button
                    onClick={() => {
                        onClose();
                        markAsPaid(command.id, command.montant_restant);
                    }}
                    className="w-full mt-2 bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700"
                >
                    Ajouter un paiement ({formatPrice(command.montant_restant)} restant)
                </button>
            )}
        </div>
    ) : (
        <div className="text-center py-4 text-gray-500">
            <CreditCard className="w-8 h-8 mx-auto mb-2 opacity-50" />
            <p>Aucun paiement enregistré</p>
            <button
                onClick={() => {
                    onClose();
                    markAsPaid(command.id, command.montant_total);
                }}
                className="mt-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
            >
                Enregistrer le premier paiement
            </button>
        </div>
    )}
</div>

                        {/* Informations complémentaires */}
                        <div className="bg-white border rounded-lg p-4">
                            <h4 className="font-semibold text-gray-900 mb-3">Informations</h4>
                            <div className="space-y-2 text-sm">
                                <div>
                                    <span className="text-gray-600">Priorité:</span>
                                    <span className={`ml-2 px-2 py-1 rounded-full text-xs ${
                                        command.priorite === 'urgente' ? 'bg-orange-100 text-orange-800' :
                                        command.priorite === 'tres_urgente' ? 'bg-red-100 text-red-800' :
                                        'bg-gray-100 text-gray-800'
                                    }`}>
                                        {command.priorite === 'normale' ? 'Normale' :
                                         command.priorite === 'urgente' ? 'Urgente' : 'Très urgente'}
                                    </span>
                                </div>
                                <div>
                                    <span className="text-gray-600">Mode de livraison:</span>
                                    <span className="ml-2 font-medium">{command.mode_livraison}</span>
                                </div>
                                <div>
                                    <span className="text-gray-600">Source:</span>
                                    <span className="ml-2 font-medium">{command.source}</span>
                                </div>
                                {command.date_livraison_prevue && (
                                    <div>
                                        <span className="text-gray-600 flex items-center">
                                            <Calendar className="w-4 h-4 mr-1" />
                                            Livraison prévue:
                                        </span>
                                        <span className="ml-2 font-medium">{command.date_livraison_prevue}</span>
                                    </div>
                                )}
                                {command.est_cadeau && (
                                    <div>
                                        <span className="text-gray-600">Cadeau:</span>
                                        <span className="ml-2 text-pink-600">Oui</span>
                                        {command.message_cadeau && (
                                            <p className="mt-1 text-xs bg-pink-50 p-2 rounded italic">
                                                "{command.message_cadeau}"
                                            </p>
                                        )}
                                    </div>
                                )}
                                {command.code_promo && (
                                    <div>
                                        <span className="text-gray-600">Code promo:</span>
                                        <span className="ml-2 font-medium bg-green-100 text-green-800 px-2 py-1 rounded text-xs">
                                            {command.code_promo}
                                        </span>
                                    </div>
                                )}
                                {command.notes_admin && (
                                    <div>
                                        <span className="text-gray-600">Notes admin:</span>
                                        <p className="mt-1 text-xs bg-gray-50 p-2 rounded">{command.notes_admin}</p>
                                    </div>
                                )}
                                {command.notes_client && (
                                    <div>
                                        <span className="text-gray-600">Notes client:</span>
                                        <p className="mt-1 text-xs bg-blue-50 p-2 rounded">{command.notes_client}</p>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                </div>

                <div className="flex justify-end mt-6 pt-4 border-t">
                    <button
                        onClick={onClose}
                        className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50"
                    >
                        Fermer
                    </button>
                </div>
            </div>
        </div>
    );
};

export default CommandDetailsModal;