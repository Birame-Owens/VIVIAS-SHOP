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
        },
        commonjsOptions: {
            include: [/node_modules/],
        },
    },
    optimizeDeps: {
        include: ['react', 'react-dom', 'react-router-dom', 'react-hot-toast', 'lucide-react'],
    },
});