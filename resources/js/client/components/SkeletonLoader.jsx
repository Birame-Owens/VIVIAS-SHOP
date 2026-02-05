import React from 'react';

/**
 * Skeleton Loading Component - Très visible et esthétique
 * Affiche un squelette de chargement avec animation fluide
 */
export default function SkeletonLoader({ isLoading = true }) {
    if (!isLoading) return null;

    return (
        <div className="w-full h-screen bg-gradient-to-b from-white to-gray-50 overflow-hidden">
            {/* Header Navigation Skeleton */}
            <div className="sticky top-0 z-50 bg-white border-b border-gray-100 px-6 py-4">
                <div className="max-w-7xl mx-auto flex justify-between items-center">
                    {/* Logo */}
                    <div className="animate-pulse">
                        <div className="h-8 w-32 bg-gray-300 rounded"></div>
                    </div>
                    {/* Nav items */}
                    <div className="flex gap-8 animate-pulse">
                        <div className="h-4 w-20 bg-gray-300 rounded"></div>
                        <div className="h-4 w-20 bg-gray-300 rounded"></div>
                        <div className="h-4 w-20 bg-gray-300 rounded"></div>
                    </div>
                    {/* Icons */}
                    <div className="flex gap-4 animate-pulse">
                        <div className="h-8 w-8 bg-gray-300 rounded-full"></div>
                        <div className="h-8 w-8 bg-gray-300 rounded-full"></div>
                    </div>
                </div>
            </div>

            {/* Main Content */}
            <div className="container mx-auto px-6 py-8">
                {/* Page Title Skeleton */}
                <div className="mb-8 animate-pulse">
                    <div className="h-10 w-1/3 bg-gray-300 rounded mb-4"></div>
                    <div className="h-5 w-2/3 bg-gray-200 rounded"></div>
                </div>

                {/* Grid Content - 4 cards */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                    {[1, 2, 3, 4].map((i) => (
                        <div key={i} className="animate-pulse">
                            {/* Card Image */}
                            <div className="w-full h-56 bg-gray-300 rounded-lg mb-4 shadow-sm"></div>
                            {/* Card Title */}
                            <div className="h-5 bg-gray-300 rounded w-4/5 mb-3"></div>
                            {/* Card Text */}
                            <div className="space-y-2 mb-4">
                                <div className="h-4 bg-gray-200 rounded w-full"></div>
                                <div className="h-4 bg-gray-200 rounded w-5/6"></div>
                            </div>
                            {/* Price */}
                            <div className="h-6 bg-gray-300 rounded w-1/3"></div>
                        </div>
                    ))}
                </div>

                {/* Pagination Skeleton */}
                <div className="mt-12 flex justify-center gap-2 animate-pulse">
                    <div className="h-10 w-10 bg-gray-300 rounded"></div>
                    <div className="h-10 w-10 bg-gray-300 rounded"></div>
                    <div className="h-10 w-10 bg-gray-300 rounded"></div>
                    <div className="h-10 w-10 bg-gray-300 rounded"></div>
                </div>
            </div>

            {/* Floating Loading Indicator */}
            <div className="fixed bottom-8 right-8 z-50">
                <div className="flex items-center gap-3 bg-white px-6 py-3 rounded-full shadow-lg">
                    <div className="relative w-6 h-6">
                        <div className="absolute inset-0 bg-gradient-to-r from-blue-400 to-purple-500 rounded-full animate-spin" 
                             style={{ borderRadius: '50%', width: '24px', height: '24px', opacity: '0.3' }}>
                        </div>
                        <div className="absolute inset-1 bg-white rounded-full"></div>
                        <div className="absolute inset-1 bg-gradient-to-r from-blue-400 to-purple-500 rounded-full animate-spin"
                             style={{ 
                                 borderRadius: '50%', 
                                 width: '20px', 
                                 height: '20px',
                                 animation: 'spin 2s linear infinite',
                                 borderTop: '2px solid rgb(96 165 250)',
                                 borderRight: '2px solid transparent',
                                 borderBottom: '2px solid rgb(168 85 247)',
                                 borderLeft: '2px solid transparent',
                                 margin: '2px'
                             }}>
                        </div>
                    </div>
                    <span className="text-sm font-medium text-gray-700">Chargement...</span>
                </div>
            </div>

            <style>{`
                @keyframes spin {
                    from {
                        transform: rotate(0deg);
                    }
                    to {
                        transform: rotate(360deg);
                    }
                }
            `}</style>
        </div>
    );
}
