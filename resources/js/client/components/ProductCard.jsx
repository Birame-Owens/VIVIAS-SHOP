/**
 * ⚡ COMPOSANT OPTIMISÉ - PRODUCT CARD
 * - Lazy loading images
 * - Mémorisation complète
 * - Pas de re-renders inutiles
 */

import React, { memo, useState, useCallback } from 'react';
import { Heart, ShoppingCart, Star, Badge } from 'lucide-react';
import OptimizedImage from './OptimizedImage';
import { useCartStore, useWishlistStore } from '../stores/index';

const ProductCard = memo(({
    product,
    onViewDetails,
    showRating = true,
}) => {
    const [isHovered, setIsHovered] = useState(false);
    const addToCart = useCartStore(state => state.addItem);
    const { isInWishlist, addItem, removeItem } = useWishlistStore(
        state => ({
            isInWishlist: () => state.isInWishlist(product.id),
            addItem: state.addItem,
            removeItem: state.removeItem,
        })
    );

    const inWishlist = isInWishlist();

    const handleAddToCart = useCallback((e) => {
        e.stopPropagation();
        addToCart(product, 1);
    }, [product, addToCart]);

    const handleToggleWishlist = useCallback((e) => {
        e.stopPropagation();
        if (inWishlist) {
            removeItem(product.id);
        } else {
            addItem(product);
        }
    }, [product, inWishlist, addItem, removeItem]);

    // 🏷️ Prix avec réduction
    const hasDiscount = product.prix_original && product.prix < product.prix_original;
    const discount = hasDiscount 
        ? Math.round(((product.prix_original - product.prix) / product.prix_original) * 100)
        : 0;

    return (
        <div
            className="bg-white rounded-lg overflow-hidden shadow-md hover:shadow-xl transition-shadow duration-300 cursor-pointer group"
            onMouseEnter={() => setIsHovered(true)}
            onMouseLeave={() => setIsHovered(false)}
            onClick={() => onViewDetails?.(product.id)}
        >
            {/* 🖼️ IMAGE */}
            <div className="relative w-full aspect-square bg-gray-100 overflow-hidden">
                <OptimizedImage
                    src={product.image_principale || product.images?.[0]?.url}
                    alt={product.nom}
                    sizes="small"
                    width="300"
                    height="300"
                    className="w-full h-full"
                    onLoad={() => {}}
                />

                {/* 🏷️ BADGE RÉDUCTION */}
                {hasDiscount && (
                    <div className="absolute top-3 right-3 bg-red-500 text-white px-2 py-1 rounded-full text-xs font-bold">
                        -{discount}%
                    </div>
                )}

                {/* 📌 BADGE STOCK */}
                {product.stock_quantite <= 5 && product.stock_quantite > 0 && (
                    <div className="absolute top-3 left-3 bg-orange-500 text-white px-2 py-1 rounded text-xs">
                        Stock limité
                    </div>
                )}

                {product.stock_quantite === 0 && (
                    <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
                        <span className="text-white font-bold">Rupture de stock</span>
                    </div>
                )}

                {/* 🎯 ACTIONS (Hover) */}
                <div className={`
                    absolute bottom-0 left-0 right-0 bg-white p-3 space-y-2
                    transform transition-transform duration-300
                    ${isHovered ? 'translate-y-0' : 'translate-y-full'}
                `}>
                    <button
                        onClick={handleAddToCart}
                        disabled={product.stock_quantite === 0}
                        className={`
                            w-full py-2 rounded font-semibold flex items-center justify-center gap-2
                            transition-colors duration-200
                            ${product.stock_quantite > 0
                                ? 'bg-purple-600 text-white hover:bg-purple-700'
                                : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                            }
                        `}
                    >
                        <ShoppingCart size={18} />
                        Ajouter
                    </button>
                </div>

                {/* ❤️ WISHLIST BTN */}
                <button
                    onClick={handleToggleWishlist}
                    className={`
                        absolute top-3 left-3 w-10 h-10 rounded-full
                        flex items-center justify-center transition-all duration-200
                        ${inWishlist
                            ? 'bg-red-500 text-white'
                            : 'bg-white text-gray-600 hover:bg-red-50'
                        }
                    `}
                >
                    <Heart 
                        size={20} 
                        fill={inWishlist ? 'currentColor' : 'none'}
                    />
                </button>
            </div>

            {/* 📝 INFOS */}
            <div className="p-4">
                {/* Catégorie */}
                <p className="text-xs text-gray-500 uppercase tracking-wide">
                    {product.category?.nom}
                </p>

                {/* Nom */}
                <h3 className="text-sm font-semibold text-gray-900 line-clamp-2 my-2">
                    {product.nom}
                </h3>

                {/* ⭐ RATING */}
                {showRating && product.note_moyenne > 0 && (
                    <div className="flex items-center gap-1 mb-2">
                        <div className="flex text-yellow-400">
                            {[...Array(5)].map((_, i) => (
                                <Star
                                    key={i}
                                    size={14}
                                    fill={i < Math.round(product.note_moyenne) ? 'currentColor' : 'none'}
                                />
                            ))}
                        </div>
                        <span className="text-xs text-gray-500">
                            ({product.nombre_avis || 0})
                        </span>
                    </div>
                )}

                {/* 💰 PRIX */}
                <div className="flex items-center justify-between">
                    <div>
                        <span className="text-lg font-bold text-purple-600">
                            {product.prix.toLocaleString('fr-FR')} FCFA
                        </span>
                        {hasDiscount && (
                            <span className="text-xs text-gray-400 line-through ml-2">
                                {product.prix_original?.toLocaleString('fr-FR')} FCFA
                            </span>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
});

ProductCard.displayName = 'ProductCard';

export default ProductCard;
