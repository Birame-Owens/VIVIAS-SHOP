/**
 * ⚡ PAGE PRODUIT OPTIMISÉE
 * - Lazy loading images avec blur hash
 * - Prefetch related products
 * - State management optimal
 * - Pas de N+1 queries
 */

import React, { useEffect, useState, useCallback, useMemo, Suspense, lazy } from 'react';
import { useParams } from 'react-router-dom';
import { Heart, ShoppingCart, Star, Truck, Shield, TrendingUp, Loader } from 'lucide-react';
import OptimizedImage from '../components/OptimizedImage';
import ProductCard from '../components/ProductCard';
import { useCartStore, useWishlistStore, useProductStore } from '../stores/index';
import { useOptimizedImages, useData } from '../hooks/useOptimization';
import api from '../services/OptimizedApiService';

// Lazy load heavy components
const ReviewsSection = lazy(() => import('../components/ReviewsSection'));
const SizeGuide = lazy(() => import('../components/SizeGuide'));

const PageLoader = () => (
    <div className="flex items-center justify-center h-64">
        <Loader className="animate-spin w-8 h-8 text-purple-600" />
    </div>
);

export default function ProductDetailPage() {
    const { id } = useParams();
    const [selectedSize, setSelectedSize] = useState(null);
    const [quantity, setQuantity] = useState(1);
    const [activeImageIndex, setActiveImageIndex] = useState(0);

    // ✅ Stores
    const addToCart = useCartStore(state => state.addItem);
    const { isInWishlist, addItem: addToWishlist, removeItem: removeFromWishlist } = useWishlistStore(
        state => ({
            isInWishlist: () => state.isInWishlist(parseInt(id)),
            addItem: state.addItem,
            removeItem: state.removeItem,
        })
    );
    const inWishlist = isInWishlist();

    // ✅ Charger produit avec caching
    const { data: product, loading: productLoading } = useData(
        `product_${id}`,
        () => api.getProduct(id),
        {
            cacheDuration: 5 * 60 * 1000, // 5 min
            cacheType: 'product',
        }
    );

    // ✅ Charger produits similaires (with prefetch)
    const { data: similarProducts } = useData(
        `similar_${id}`,
        async () => {
            const response = await api.request('GET', `/products/${id}/similar`);
            return response.data || [];
        },
        {
            cacheDuration: 30 * 60 * 1000, // 30 min
            enabled: !!product,
        }
    );

    // ✅ Charger images optimisées
    const { images } = useOptimizedImages(id);

    // 🖼️ Galerie d'images
    const gallery = useMemo(() => {
        if (images?.length > 0) return images;
        if (product?.images?.length > 0) {
            return product.images.map(img => ({
                url: img.url,
                thumbnail: img.thumbnail_url,
            }));
        }
        return [{
            url: product?.image_principale,
            thumbnail: product?.image_principale,
        }];
    }, [images, product]);

    // 💰 Calcul prix
    const hasDiscount = product?.prix_original && product?.prix < product?.prix_original;
    const discountPercent = useMemo(() => {
        if (!hasDiscount) return 0;
        return Math.round(((product.prix_original - product.prix) / product.prix_original) * 100);
    }, [product?.prix, product?.prix_original, hasDiscount]);

    const totalPrice = useMemo(() => {
        return (product?.prix || 0) * quantity;
    }, [product?.prix, quantity]);

    // 🛒 Handlers
    const handleAddToCart = useCallback(() => {
        addToCart({
            id: product.id,
            nom: product.nom,
            prix: product.prix,
            image_principale: product.image_principale,
            taille: selectedSize,
        }, quantity);
        
        // Toast notification (à ajouter)
    }, [product, selectedSize, quantity, addToCart]);

    const handleToggleWishlist = useCallback(() => {
        if (inWishlist) {
            removeFromWishlist(product.id);
        } else {
            addToWishlist(product);
        }
    }, [product, inWishlist, addToWishlist, removeFromWishlist]);

    // 🚀 Prefetch images suivante/précédente
    useEffect(() => {
        if (gallery[activeImageIndex + 1]) {
            // Preload next image
            const img = new Image();
            img.src = gallery[activeImageIndex + 1].url;
        }
    }, [activeImageIndex, gallery]);

    // ⏱️ Analytics
    useEffect(() => {
        api.request('POST', `/products/${id}/view`, {}, { skipCache: true });
    }, [id]);

    if (productLoading) return <PageLoader />;
    if (!product) return <div className="text-center py-12 text-red-600">Produit non trouvé</div>;

    return (
        <div className="min-h-screen bg-gray-50">
            {/* LAYOUT: 2 colonnes */}
            <div className="max-w-7xl mx-auto px-4 py-8 grid grid-cols-1 lg:grid-cols-2 gap-8">

                {/* 🖼️ SECTION IMAGES */}
                <section className="space-y-4">
                    {/* Image principale */}
                    <div className="relative w-full aspect-square bg-white rounded-lg overflow-hidden shadow-lg">
                        <OptimizedImage
                            src={gallery[activeImageIndex]?.url}
                            alt={`${product.nom} - Image ${activeImageIndex + 1}`}
                            sizes="large"
                            width="600"
                            height="600"
                            className="w-full h-full"
                            objectFit="cover"
                        />

                        {/* Badge réduction */}
                        {hasDiscount && (
                            <div className="absolute top-4 right-4 bg-red-500 text-white px-4 py-2 rounded-full font-bold">
                                -{discountPercent}%
                            </div>
                        )}

                        {/* Navigation flèches */}
                        {gallery.length > 1 && (
                            <>
                                <button
                                    onClick={() => setActiveImageIndex(Math.max(0, activeImageIndex - 1))}
                                    className="absolute left-4 top-1/2 -translate-y-1/2 bg-white/80 hover:bg-white w-10 h-10 rounded-full flex items-center justify-center shadow-lg"
                                >
                                    ←
                                </button>
                                <button
                                    onClick={() => setActiveImageIndex(Math.min(gallery.length - 1, activeImageIndex + 1))}
                                    className="absolute right-4 top-1/2 -translate-y-1/2 bg-white/80 hover:bg-white w-10 h-10 rounded-full flex items-center justify-center shadow-lg"
                                >
                                    →
                                </button>
                            </>
                        )}
                    </div>

                    {/* Miniatures */}
                    {gallery.length > 1 && (
                        <div className="flex gap-3 overflow-x-auto pb-2">
                            {gallery.map((img, idx) => (
                                <button
                                    key={idx}
                                    onClick={() => setActiveImageIndex(idx)}
                                    className={`
                                        flex-shrink-0 w-20 h-20 rounded-lg overflow-hidden
                                        transition-all border-2
                                        ${activeImageIndex === idx
                                            ? 'border-purple-600'
                                            : 'border-gray-200 hover:border-gray-300'
                                        }
                                    `}
                                >
                                    <OptimizedImage
                                        src={img.thumbnail}
                                        alt={`Thumbnail ${idx}`}
                                        sizes="thumbnail"
                                        width="80"
                                        height="80"
                                        className="w-full h-full"
                                        objectFit="cover"
                                    />
                                </button>
                            ))}
                        </div>
                    )}
                </section>

                {/* 📝 SECTION INFOS */}
                <section className="space-y-6">
                    {/* Breadcrumb */}
                    <div className="text-sm text-gray-600">
                        <span>Accueil</span>
                        {' > '}
                        <span>{product.category?.nom}</span>
                        {' > '}
                        <span className="text-gray-900 font-semibold">{product.nom}</span>
                    </div>

                    {/* Titre */}
                    <div>
                        <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-3">
                            {product.nom}
                        </h1>

                        {/* Rating */}
                        {product.note_moyenne > 0 && (
                            <div className="flex items-center gap-2 mb-4">
                                <div className="flex text-yellow-400">
                                    {[...Array(5)].map((_, i) => (
                                        <Star
                                            key={i}
                                            size={18}
                                            fill={i < Math.round(product.note_moyenne) ? 'currentColor' : 'none'}
                                        />
                                    ))}
                                </div>
                                <span className="text-gray-600">
                                    {product.note_moyenne.toFixed(1)} ({product.nombre_avis} avis)
                                </span>
                            </div>
                        )}
                    </div>

                    {/* Prix */}
                    <div className="bg-purple-50 p-6 rounded-lg">
                        <div className="flex items-baseline gap-3">
                            <span className="text-4xl font-bold text-purple-600">
                                {product.prix.toLocaleString('fr-FR')}
                            </span>
                            {hasDiscount && (
                                <span className="text-xl text-gray-400 line-through">
                                    {product.prix_original.toLocaleString('fr-FR')}
                                </span>
                            )}
                            <span className="text-gray-600">FCFA</span>
                        </div>
                        {quantity > 1 && (
                            <div className="text-sm text-gray-600 mt-2">
                                Total: {totalPrice.toLocaleString('fr-FR')} FCFA
                            </div>
                        )}
                    </div>

                    {/* Sélection taille */}
                    {product.tailles?.length > 0 && (
                        <div>
                            <label className="block text-sm font-semibold text-gray-900 mb-3">
                                Taille
                            </label>
                            <div className="grid grid-cols-5 gap-2">
                                {product.tailles.map(taille => (
                                    <button
                                        key={taille}
                                        onClick={() => setSelectedSize(taille)}
                                        className={`
                                            py-2 rounded font-semibold transition-all
                                            ${selectedSize === taille
                                                ? 'bg-purple-600 text-white'
                                                : 'bg-gray-200 text-gray-900 hover:bg-gray-300'
                                            }
                                        `}
                                    >
                                        {taille}
                                    </button>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* Quantité */}
                    <div>
                        <label className="block text-sm font-semibold text-gray-900 mb-3">
                            Quantité
                        </label>
                        <div className="flex items-center border border-gray-300 rounded-lg w-fit">
                            <button
                                onClick={() => setQuantity(Math.max(1, quantity - 1))}
                                className="px-4 py-2 hover:bg-gray-100"
                            >
                                −
                            </button>
                            <span className="px-6 py-2 border-l border-r border-gray-300">
                                {quantity}
                            </span>
                            <button
                                onClick={() => setQuantity(quantity + 1)}
                                className="px-4 py-2 hover:bg-gray-100"
                            >
                                +
                            </button>
                        </div>
                    </div>

                    {/* Actions */}
                    <div className="flex gap-4">
                        <button
                            onClick={handleAddToCart}
                            disabled={product.stock_quantite === 0}
                            className={`
                                flex-1 py-3 rounded-lg font-bold flex items-center justify-center gap-2
                                transition-all
                                ${product.stock_quantite > 0
                                    ? 'bg-purple-600 text-white hover:bg-purple-700'
                                    : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                                }
                            `}
                        >
                            <ShoppingCart size={20} />
                            {product.stock_quantite > 0 ? 'Ajouter au panier' : 'Rupture de stock'}
                        </button>
                        <button
                            onClick={handleToggleWishlist}
                            className={`
                                px-6 py-3 rounded-lg font-bold flex items-center justify-center gap-2
                                transition-all border-2
                                ${inWishlist
                                    ? 'bg-red-50 border-red-300 text-red-600 hover:bg-red-100'
                                    : 'bg-white border-gray-300 text-gray-600 hover:border-gray-400'
                                }
                            `}
                        >
                            <Heart size={20} fill={inWishlist ? 'currentColor' : 'none'} />
                        </button>
                    </div>

                    {/* Infos avantages */}
                    <div className="space-y-3 pt-6 border-t border-gray-200">
                        <div className="flex items-center gap-3">
                            <Truck className="text-purple-600" size={20} />
                            <span>Livraison gratuite à partir de 50000 FCFA</span>
                        </div>
                        <div className="flex items-center gap-3">
                            <Shield className="text-purple-600" size={20} />
                            <span>100% Authentique garantie</span>
                        </div>
                    </div>
                </section>
            </div>

            {/* SECTIONS LAZY-LOADED */}
            <div className="max-w-7xl mx-auto px-4 py-12 space-y-12">
                {/* Description */}
                <section className="bg-white rounded-lg p-8">
                    <h2 className="text-2xl font-bold text-gray-900 mb-4">Description</h2>
                    <div className="text-gray-700 whitespace-pre-wrap">
                        {product.description}
                    </div>
                </section>

                {/* Avis (lazy loaded) */}
                <Suspense fallback={<PageLoader />}>
                    <ReviewsSection productId={id} />
                </Suspense>

                {/* Guide des tailles (lazy loaded) */}
                {product.guide_tailles && (
                    <Suspense fallback={<PageLoader />}>
                        <SizeGuide guide={product.guide_tailles} />
                    </Suspense>
                )}

                {/* Produits similaires */}
                {similarProducts?.length > 0 && (
                    <section>
                        <h2 className="text-2xl font-bold text-gray-900 mb-6">
                            <TrendingUp className="inline mr-2" size={28} />
                            Produits similaires
                        </h2>
                        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                            {similarProducts.map(prod => (
                                <ProductCard
                                    key={prod.id}
                                    product={prod}
                                    onViewDetails={(prodId) => window.location.href = `/produit/${prodId}`}
                                />
                            ))}
                        </div>
                    </section>
                )}
            </div>
        </div>
    );
}
