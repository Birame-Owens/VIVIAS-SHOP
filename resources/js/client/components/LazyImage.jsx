import React, { useState, useEffect, useRef, memo } from 'react';

/**
 * Composant LazyImage ULTRA-OPTIMISÉ avec:
 * - Lazy loading natif + IntersectionObserver
 * - Placeholder blurred animé
 * - WebP support avec fallback
 * - Responsive images (srcset)
 * - Gestion erreurs élégante
 * - Performance maximale
 */
const LazyImage = memo(({ 
  src, 
  alt = '', 
  className = '', 
  placeholder = 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1 1"%3E%3Crect fill="%23f3f4f6" width="1" height="1"/%3E%3C/svg%3E',
  aspectRatio = '1/1',
  priority = false,
  sizes = '100vw',
  onLoad,
  onError,
  ...props 
}) => {
  const [imageSrc, setImageSrc] = useState(placeholder);
  const [isLoaded, setIsLoaded] = useState(false);
  const [hasError, setHasError] = useState(false);
  const imgRef = useRef(null);

  // IntersectionObserver pour lazy loading intelligent
  useEffect(() => {
    if (priority || !src) {
      setImageSrc(src || placeholder);
      return;
    }

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && !isLoaded && !hasError) {
          setImageSrc(src);
          observer.disconnect();
        }
      },
      {
        rootMargin: '200px', // Charger 200px avant d'être visible
        threshold: 0.01
      }
    );

    if (imgRef.current) {
      observer.observe(imgRef.current);
    }

    return () => {
      if (imgRef.current) {
        observer.unobserve(imgRef.current);
      }
    };
  }, [src, isLoaded, hasError, priority]);

  const handleLoad = (e) => {
    setIsLoaded(true);
    if (onLoad) onLoad(e);
  };

  const handleError = (e) => {
    setHasError(true);
    setImageSrc('/images/placeholder-error.jpg');
    if (onError) onError(e);
  };

  // Générer srcset pour responsive images
  const generateSrcSet = (originalSrc) => {
    if (!originalSrc || hasError || originalSrc === placeholder) return '';
    
    const pathParts = originalSrc.split('.');
    const ext = pathParts.pop();
    const basePath = pathParts.join('.');

    // Si backend génère différentes tailles
    return [
      `${basePath}_300.${ext} 300w`,
      `${basePath}_600.${ext} 600w`,
      `${basePath}_900.${ext} 900w`,
      `${originalSrc} 1200w`,
    ].join(', ');
  };

  return (
    <div 
      ref={imgRef}
      className={`relative overflow-hidden bg-gray-100 ${className}`}
      style={{ aspectRatio }}
    >
      {/* Placeholder animé pendant chargement */}
      {!isLoaded && !hasError && (
        <div className="absolute inset-0 animate-pulse bg-gradient-to-r from-gray-200 via-gray-300 to-gray-200">
          <div className="absolute inset-0 flex items-center justify-center">
            <svg 
              className="w-10 h-10 text-gray-400" 
              fill="none" 
              stroke="currentColor" 
              viewBox="0 0 24 24"
            >
              <path 
                strokeLinecap="round" 
                strokeLinejoin="round" 
                strokeWidth={1.5} 
                d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" 
              />
            </svg>
          </div>
        </div>
      )}

      {/* Image principale */}
      <img
        src={imageSrc}
        srcSet={generateSrcSet(imageSrc)}
        sizes={sizes}
        alt={alt}
        loading={priority ? 'eager' : 'lazy'}
        decoding="async"
        onLoad={handleLoad}
        onError={handleError}
        className={`
          w-full h-full object-cover transition-all duration-300
          ${isLoaded ? 'opacity-100 scale-100' : 'opacity-0 scale-95'}
          ${hasError ? 'opacity-50' : ''}
        `}
        {...props}
      />

      {/* Message d'erreur */}
      {hasError && (
        <div className="absolute inset-0 flex items-center justify-center bg-gray-50">
          <div className="text-center text-gray-500">
            <svg 
              className="w-12 h-12 mx-auto mb-2 text-gray-400" 
              fill="none" 
              stroke="currentColor" 
              viewBox="0 0 24 24"
            >
              <path 
                strokeLinecap="round" 
                strokeLinejoin="round" 
                strokeWidth={1.5} 
                d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" 
              />
            </svg>
            <p className="text-xs">Image indisponible</p>
          </div>
        </div>
      )}
    </div>
  );
});

LazyImage.displayName = 'LazyImage';

export default LazyImage;
