// resources/js/client/hooks/usePreloader.js
import { useEffect, useRef } from 'react';
import api from '../utils/api';

/**
 * ✅ HOOK PERSONNALISÉ POUR PRELOADING INTELLIGENT
 * 
 * Précharge les données des pages probablement visitées
 * pour une navigation ultra-rapide
 */

const usePreloader = () => {
    const preloadedPages = useRef(new Set());
    const preloadTimeout = useRef(null);

    // ✅ Preload une page spécifique
    const preloadPage = async (type, identifier = null) => {
        const pageKey = `${type}_${identifier || 'default'}`;
        
        // Éviter les doublons
        if (preloadedPages.current.has(pageKey)) return;
        
        try {
            switch (type) {
                case 'product':
                    if (identifier) {
                        await api.getProductPageData(identifier);
                        preloadedPages.current.add(pageKey);
                    }
                    break;
                    
                case 'category':
                    if (identifier) {
                        await api.getCategoryBySlug(identifier);
                        preloadedPages.current.add(pageKey);
                    }
                    break;
                    
                case 'home':
                    await api.getHomePageData();
                    preloadedPages.current.add(pageKey);
                    break;
                    
                default:
                    console.warn(`Type de preload non supporté: ${type}`);
            }
        } catch (error) {
            // Échec silencieux du preload
            console.debug(`Preload échoué pour ${pageKey}:`, error.message);
        }
    };

    // ✅ Preload avec délai (pour éviter de surcharger)
    const preloadWithDelay = (type, identifier = null, delay = 1000) => {
        if (preloadTimeout.current) {
            clearTimeout(preloadTimeout.current);
        }
        
        preloadTimeout.current = setTimeout(() => {
            preloadPage(type, identifier);
        }, delay);
    };

    // ✅ Preload au survol (hover)
    const preloadOnHover = (type, identifier) => {
        return {
            onMouseEnter: () => preloadWithDelay(type, identifier, 300),
            onMouseLeave: () => {
                if (preloadTimeout.current) {
                    clearTimeout(preloadTimeout.current);
                }
            }
        };
    };

    // ✅ Preload automatique des pages populaires
    useEffect(() => {
        // Preload la page d'accueil après 2 secondes
        const homeTimeout = setTimeout(() => {
            preloadPage('home');
        }, 2000);

        // Preload les catégories populaires après 5 secondes
        const categoriesTimeout = setTimeout(async () => {
            try {
                const categories = await api.getCategoriesPreview();
                if (categories.success && categories.data) {
                    // Preload les 3 premières catégories
                    categories.data.slice(0, 3).forEach((category, index) => {
                        setTimeout(() => {
                            preloadPage('category', category.slug);
                        }, index * 1000); // Étaler sur 3 secondes
                    });
                }
            } catch (error) {
                console.debug('Preload catégories échoué:', error.message);
            }
        }, 5000);

        return () => {
            clearTimeout(homeTimeout);
            clearTimeout(categoriesTimeout);
            if (preloadTimeout.current) {
                clearTimeout(preloadTimeout.current);
            }
        };
    }, []);

    // ✅ Preload basé sur le scroll (intersection observer)
    const preloadOnVisible = (type, identifier) => {
        const elementRef = useRef(null);

        useEffect(() => {
            const element = elementRef.current;
            if (!element) return;

            const observer = new IntersectionObserver(
                ([entry]) => {
                    if (entry.isIntersecting) {
                        preloadWithDelay(type, identifier, 500);
                        observer.disconnect(); // Une seule fois
                    }
                },
                { rootMargin: '100px' } // Preload 100px avant d'être visible
            );

            observer.observe(element);

            return () => observer.disconnect();
        }, [type, identifier]);

        return elementRef;
    };

    // ✅ Statistiques de preload (debug)
    const getPreloadStats = () => ({
        preloadedCount: preloadedPages.current.size,
        preloadedPages: Array.from(preloadedPages.current)
    });

    return {
        preloadPage,
        preloadWithDelay,
        preloadOnHover,
        preloadOnVisible,
        getPreloadStats
    };
};

export default usePreloader;
