import { defineConfig } from 'vite';
import laravel from 'laravel-vite-plugin';
import react from '@vitejs/plugin-react';

export default defineConfig({
    plugins: [
        laravel({
            input: [
                // Partie Admin (SÉPARÉE)
                'resources/js/admin/app.jsx',
                
                // Partie Client (SÉPARÉE)
                'resources/js/client/app.jsx',
            ],
            refresh: true,
        }),
        react(),
    ],
    server: {
        host: '0.0.0.0',
        port: 5173,
        strictPort: false,
        hmr: {
            host: '192.168.1.11',
            port: 5173,
        },
        cors: {
            origin: ['http://192.168.1.11:8000', 'http://localhost:8000'],
            credentials: true,
        },
    },
    resolve: {
        alias: {
            '@': '/resources/js',
            '@admin': '/resources/js/admin',
            '@client': '/resources/js/client',
            'es-toolkit': 'lodash-es',
            'es-toolkit/compat/get': 'lodash-es/get',
            'es-toolkit/compat/uniqBy': 'lodash-es/uniqBy',
            'es-toolkit/compat/sortBy': 'lodash-es/sortBy',
            'es-toolkit/compat/last': 'lodash-es/last',
            'es-toolkit/compat/range': 'lodash-es/range',
            'es-toolkit/compat/omit': 'lodash-es/omit',
            'es-toolkit/compat/maxBy': 'lodash-es/maxBy',
            'es-toolkit/compat/sumBy': 'lodash-es/sumBy',
        },
    },
    build: {
        // ⚡ OPTIMISATION: Augmenter taille chunk pour meilleure compression
        reportCompressedSize: false, // Plus rapide build
        chunkSizeWarningLimit: 1000, // Limite élevée pour éviter warnings
        
        rollupOptions: {
            output: {
                // ⚡ STRATÉGIE: Séparer en chunks optimaux
                manualChunks(id) {
                    // ===== VENDORS CRITIQUES =====
                    if (id.includes('node_modules/react/')) {
                        return 'react-core';
                    }
                    if (id.includes('node_modules/react-dom/')) {
                        return 'react-core';
                    }
                    
                    // ===== ROUTING =====
                    if (id.includes('node_modules/react-router-dom/')) {
                        return 'router';
                    }
                    
                    // ===== STATE & FORM =====
                    if (id.includes('node_modules/zustand/') ||
                        id.includes('node_modules/react-hook-form/') ||
                        id.includes('node_modules/@hookform/')) {
                        return 'state-form';
                    }
                    
                    // ===== PAYMENT LIBRARIES (Lazy load) =====
                    if (id.includes('node_modules/@stripe/') ||
                        id.includes('node_modules/stripe/')) {
                        return 'payment-stripe';
                    }
                    
                    // ===== UI & ICONS =====
                    if (id.includes('node_modules/lucide-react/')) {
                        return 'icons';
                    }
                    if (id.includes('node_modules/@headlessui/')) {
                        return 'ui-components';
                    }
                    
                    // ===== UTILITIES =====
                    if (id.includes('node_modules/axios/') ||
                        id.includes('node_modules/react-hot-toast/')) {
                        return 'utils';
                    }
                    
                    // ===== DATE & CHARTS (Heavy, lazy load) =====
                    if (id.includes('node_modules/date-fns/') ||
                        id.includes('node_modules/recharts/') ||
                        id.includes('node_modules/chart.js/') ||
                        id.includes('node_modules/react-chartjs-2/')) {
                        return 'charts-dates';
                    }
                    
                    // ===== ADMIN CODE (Chunk séparé) =====
                    if (id.includes('/resources/js/admin/')) {
                        return 'admin-app';
                    }
                    
                    // ===== CLIENT CODE (Chunk séparé) =====
                    if (id.includes('/resources/js/client/')) {
                        // Séparer par pages pour lazy loading
                        if (id.includes('/pages/')) {
                            return 'client-pages';
                        }
                        if (id.includes('/components/')) {
                            return 'client-components';
                        }
                        return 'client-core';
                    }
                },
                
                // ⚡ Optimisation nommage chunks
                entryFileNames: 'assets/[name].[hash].js',
                chunkFileNames: 'assets/[name].[hash].js',
                assetFileNames: 'assets/[name].[hash][extname]',
            },
        },
        
        // ⚡ MINIFICATION AGRESSIF
        minify: 'terser',
        terserOptions: {
            compress: {
                drop_console: true,
                drop_debugger: true,
                dead_code: true,
                unused: true,
                passes: 2, // Passer 2x pour meilleure compression
            },
            format: {
                comments: false,
            },
            mangle: true,
        },
    },
    
    // ⚡ PRE-BUNDLING: Optimiser les dépendances
    optimizeDeps: {
        include: [
            'react',
            'react-dom',
            'react-router-dom',
            'react-hot-toast',
            'lucide-react',
            'zustand',
            'react-hook-form',
            'recharts', // Include recharts to pre-bundle with aliases
        ],
        esbuildOptions: {
            alias: {
                'es-toolkit': 'lodash-es',
                'es-toolkit/compat/get': 'lodash-es/get',
                'es-toolkit/compat/uniqBy': 'lodash-es/uniqBy',
                'es-toolkit/compat/sortBy': 'lodash-es/sortBy',
                'es-toolkit/compat/last': 'lodash-es/last',
                'es-toolkit/compat/range': 'lodash-es/range',
                'es-toolkit/compat/omit': 'lodash-es/omit',
                'es-toolkit/compat/maxBy': 'lodash-es/maxBy',
                'es-toolkit/compat/sumBy': 'lodash-es/sumBy',
            },
        },
        // Exclure les heavy deps (lazy load)
        exclude: [
            '@stripe/react-stripe-js',
            'chart.js',
            'react-chartjs-2',
        ],
    },
});