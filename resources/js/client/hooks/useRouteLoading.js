import { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';

/**
 * Hook pour gérer le skeleton loading lors des changements de route
 * Affiche le squelette pendant 2 secondes max ou jusqu'au chargement complet
 */
export function useRouteLoading() {
    const [isLoading, setIsLoading] = useState(false);
    const location = useLocation();

    useEffect(() => {
        // Afficher le skeleton quand la route change
        setIsLoading(true);

        // Masquer après 2 secondes max (même si le contenu n'est pas chargé)
        const timer = setTimeout(() => {
            setIsLoading(false);
        }, 1500);

        return () => clearTimeout(timer);
    }, [location.pathname]);

    const finishLoading = () => {
        setIsLoading(false);
    };

    return { isLoading, finishLoading };
}
