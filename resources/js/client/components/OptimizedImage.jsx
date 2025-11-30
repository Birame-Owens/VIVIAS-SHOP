/**
 * ⚡ COMPOSANT IMAGE OPTIMISÉ - LAZY LOADING + BLUR HASH
 * Charge progressivement: blur -> low-res -> high-res
 */

import React, { useState, useEffect, useRef } from 'react';

export const OptimizedImage = ({
    src,
    alt = 'Image',
    sizes = 'thumbnail',
    blur = true,
    width,
    height,
    className = '',
    onLoad = () => {},
    objectFit = 'cover'
}) => {
    const [isLoaded, setIsLoaded] = useState(false);
    const [currentSrc, setCurrentSrc] = useState(blur ? null : src);
    const imgRef = useRef(null);

    useEffect(() => {
        // ✅ Si blur activé: charger version basse qualité d'abord
        if (blur && sizes === 'medium' || sizes === 'large') {
            setCurrentSrc(src.replace(`_${sizes}.webp`, '_small.webp'));
            
            // ✅ Remplacer par version haute qualité après
            setTimeout(() => {
                setCurrentSrc(src);
            }, 100);
        } else {
            setCurrentSrc(src);
        }
    }, [src, sizes, blur]);

    const handleLoad = () => {
        setIsLoaded(true);
        onLoad();
    };

    return (
        <div
            className={`relative bg-gray-100 overflow-hidden ${className}`}
            style={{ width, height }}
        >
            {/* 📦 SKELETON LOADER */}
            {!isLoaded && (
                <div className="absolute inset-0 bg-gradient-to-r from-gray-200 via-gray-100 to-gray-200 animate-shimmer" />
            )}

            {/* 🖼️ IMAGE PRINCIPALE */}
            <img
                ref={imgRef}
                src={currentSrc}
                alt={alt}
                width={width}
                height={height}
                loading="lazy"
                decoding="async"
                className={`
                    w-full h-full transition-opacity duration-300
                    ${isLoaded ? 'opacity-100' : 'opacity-0'}
                `}
                style={{ objectFit }}
                onLoad={handleLoad}
                onError={(e) => {
                    e.target.src = '/images/placeholder.webp';
                    setIsLoaded(true);
                }}
            />
        </div>
    );
};

export default OptimizedImage;
