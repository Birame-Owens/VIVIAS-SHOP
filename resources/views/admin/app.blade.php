<!DOCTYPE html>
<html lang="fr">
<head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <meta name="csrf-token" content="{{ csrf_token() }}">
    
    <title>VIVIAS SHOP - Administration</title>
    
    <!-- Favicon -->
    <link rel="icon" type="image/svg+xml" href="/favicon.svg">
    
    <!-- Fonts -->
    <link rel="preconnect" href="https://fonts.bunny.net">
    <link href="https://fonts.bunny.net/css?family=inter:400,500,600,700,800&display=swap" rel="stylesheet" />
    
    <!-- Meta tags pour PWA (future) -->
    <meta name="theme-color" content="#7c3aed">
    <meta name="description" content="Administration VIVIAS SHOP - Boutique de mode sénégalaise">
    
    <!-- Styles -->
     @viteReactRefresh
    @vite(['resources/css/app.css', 'resources/js/admin/app.jsx'])

</head>
<body class="font-sans antialiased">
    <!-- Point de montage pour l'application React admin -->
    <div id="admin-app"></div>
    
    <!-- Chargement initial -->
    <div id="initial-loader" class="fixed inset-0 bg-gradient-to-br from-purple-600 via-blue-600 to-indigo-700 flex items-center justify-center z-50">
        <div class="text-center">
            <div class="bg-white p-4 rounded-full inline-block mb-4 shadow-2xl">
                <svg class="w-10 h-10 text-purple-600 animate-pulse" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/>
                </svg>
            </div>
            <h1 class="text-2xl font-bold text-white mb-2">VIVIAS SHOP</h1>
            <p class="text-blue-100">Chargement de l'administration...</p>
            <div class="mt-4">
                <div class="w-8 h-8 border-4 border-white border-t-transparent rounded-full animate-spin mx-auto"></div>
            </div>
        </div>
    </div>
    
    <!-- Debug info (à supprimer en production) -->
    <script>
        console.log('🚀 Page admin chargée');
        console.log('📍 URL actuelle:', window.location.href);
        console.log('🔒 CSRF Token:', document.querySelector('meta[name="csrf-token"]')?.getAttribute('content'));
        
        // Vérifier que l'élément admin-app existe
        const adminApp = document.getElementById('admin-app');
        if (adminApp) {
            console.log('✅ Élément #admin-app trouvé');
        } else {
            console.error('❌ Élément #admin-app non trouvé');
        }
    </script>
</body>
</html>