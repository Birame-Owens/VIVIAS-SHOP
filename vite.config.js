import { defineConfig } from 'vite';
import laravel from 'laravel-vite-plugin';
import react from '@vitejs/plugin-react';

export default defineConfig({
    plugins: [
        laravel({
            input: [
                // Partie Admin (existante)
                'resources/css/app.css',
                'resources/js/app.js',
                'resources/js/admin/app.jsx',
                
                // Partie Client - CHEMIN CORRIGÉ
                'resources/js/client/client.css',
                'resources/js/client/app.jsx',
            ],
            refresh: true,
        }),
        react(),
    ],
    server: {
        host: '0.0.0.0',
        port: 5173,
        strictPort: true,
        hmr: {
            host: '192.168.1.5',
        },
    },
    resolve: {
        alias: {
            '@': '/resources/js',
            '@admin': '/resources/js/admin',
            '@client': '/resources/js/client',
        },
    },
    build: {
        rollupOptions: {
            external: [],
            output: {
                manualChunks: {
                    // Séparer React dans son propre chunk
                    'react-vendor': ['react', 'react-dom', 'react-router-dom'],
                    // Séparer les icônes
                    'icons': ['lucide-react'],
                    // Séparer les utilitaires
                    'utils': ['react-hot-toast', 'axios'],
                },
            },
        },
        commonjsOptions: {
            include: [/node_modules/],
        },
        chunkSizeWarningLimit: 600, // Augmenter légèrement la limite
        minify: 'terser', // Meilleure compression
        terserOptions: {
            compress: {
                drop_console: true, // Retirer les console.log en production
                drop_debugger: true,
            },
        },
    },
    optimizeDeps: {
        include: ['react', 'react-dom', 'react-router-dom', 'react-hot-toast', 'lucide-react'],
    },
});