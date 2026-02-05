import React from 'react';

/**
 * Page Loading Overlay - Affiche par-dessus le contenu pendant les transitions
 * Animation smooth avec gradient et spinner animé
 */
export default function PageLoadingOverlay({ isLoading = false }) {
    if (!isLoading) return null;

    return (
        <div className="fixed inset-0 top-0 left-0 w-full h-full bg-white/80 backdrop-blur-sm z-[9999] flex items-center justify-center pointer-events-none transition-opacity duration-300">
            {/* Spinner Container */}
            <div className="flex flex-col items-center gap-4">
                {/* Animated Spinner */}
                <div className="relative w-16 h-16">
                    {/* Outer rotating ring */}
                    <div 
                        className="absolute inset-0 rounded-full border-4 border-transparent border-t-blue-500 border-r-blue-500"
                        style={{
                            animation: 'spin 1.5s linear infinite'
                        }}>
                    </div>
                    
                    {/* Middle rotating ring */}
                    <div 
                        className="absolute inset-1 rounded-full border-4 border-transparent border-b-purple-500 border-l-purple-500"
                        style={{
                            animation: 'spin 2s linear infinite reverse'
                        }}>
                    </div>
                    
                    {/* Inner pulse */}
                    <div 
                        className="absolute inset-4 rounded-full bg-gradient-to-r from-blue-400 to-purple-500"
                        style={{
                            animation: 'pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite',
                            opacity: 0.3
                        }}>
                    </div>
                </div>

                {/* Loading Text */}
                <div className="text-center">
                    <p className="text-gray-700 font-semibold text-lg">Chargement...</p>
                    <p className="text-gray-500 text-sm mt-1">Patiente un moment</p>
                </div>

                {/* Progress dots */}
                <div className="flex gap-1 mt-2">
                    <div className="w-2 h-2 bg-blue-500 rounded-full animate-bounce" style={{animationDelay: '0s'}}></div>
                    <div className="w-2 h-2 bg-purple-500 rounded-full animate-bounce" style={{animationDelay: '0.2s'}}></div>
                    <div className="w-2 h-2 bg-blue-400 rounded-full animate-bounce" style={{animationDelay: '0.4s'}}></div>
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
                
                @keyframes pulse {
                    0%, 100% {
                        opacity: 0.1;
                        transform: scale(1);
                    }
                    50% {
                        opacity: 0.3;
                        transform: scale(1.1);
                    }
                }
            `}</style>
        </div>
    );
}
