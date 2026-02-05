import React, { useState, useEffect } from 'react';

/**
 * Skeleton Loading Component
 * Affiche un squelette de chargement élégant avec animation
 * Disparaît automatiquement après 2 secondes max
 */
export default function SkeletonLoader({ isLoading, children }) {
    const [showContent, setShowContent] = useState(!isLoading);
    const [displaySkeleton, setDisplaySkeleton] = useState(isLoading);

    useEffect(() => {
        if (isLoading) {
            setDisplaySkeleton(true);
            setShowContent(false);

            // Masquer le skeleton après 2 secondes max
            const timer = setTimeout(() => {
                setDisplaySkeleton(false);
                setShowContent(true);
            }, 2000);

            return () => clearTimeout(timer);
        } else {
            setDisplaySkeleton(false);
            setShowContent(true);
        }
    }, [isLoading]);

    if (displaySkeleton) {
        return (
            <div className="space-y-4 p-4">
                {/* Header Skeleton */}
                <div className="animate-pulse">
                    <div className="h-8 bg-gray-200 rounded w-3/4 mb-4"></div>
                    <div className="space-y-3">
                        <div className="h-4 bg-gray-200 rounded"></div>
                        <div className="h-4 bg-gray-200 rounded w-5/6"></div>
                    </div>
                </div>

                {/* Content Skeleton */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {[1, 2, 3, 4, 5, 6].map((i) => (
                        <div key={i} className="animate-pulse">
                            <div className="bg-gray-200 rounded-lg h-48 w-full mb-2"></div>
                            <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
                            <div className="h-4 bg-gray-200 rounded w-1/2"></div>
                        </div>
                    ))}
                </div>

                {/* Footer Skeleton */}
                <div className="animate-pulse space-y-3 mt-8">
                    <div className="h-4 bg-gray-200 rounded"></div>
                    <div className="h-4 bg-gray-200 rounded w-5/6"></div>
                    <div className="h-4 bg-gray-200 rounded w-4/6"></div>
                </div>
            </div>
        );
    }

    return showContent ? children : null;
}
