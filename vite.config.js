// ================================================================
// 📝 FICHIER: vite.config.js (à modifier)
// ================================================================

import { defineConfig } from 'vite';
import laravel from 'laravel-vite-plugin';
import react from '@vitejs/plugin-react';

export default defineConfig({
    plugins: [
        laravel({
            input: [
                'resources/css/app.css',
                'resources/js/app.js',
                'resources/js/admin/app.jsx', // Entrée admin
            ],
            refresh: true,
        }),
        react(),
    ],
    resolve: {
        alias: {
            '@': '/resources/js',
            '@admin': '/resources/js/admin',
        },
    },
});