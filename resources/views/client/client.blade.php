<!DOCTYPE html>
<html lang="fr">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>{{ $title ?? 'VIVIAS SHOP - Mode Africaine Authentique' }}</title>
    
    {{-- Meta tags --}}
    <meta name="description" content="VIVIAS SHOP - Mode africaine authentique au Sénégal">
    <meta name="keywords" content="mode africaine, vêtements traditionnels, Sénégal">
    
    {{-- Fonts --}}
    <link rel="preconnect" href="https://fonts.googleapis.com">
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
    <link href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&display=swap" rel="stylesheet">
    
    {{-- Vite avec le bon chemin CSS --}}
    @viteReactRefresh
    @vite(['resources/js/client/client.css', 'resources/js/client/app.jsx'])
</head>
<body class="bg-gray-50 font-sans antialiased">
    <div id="client-app"></div>
    
    <script>
        window.appConfig = {
            apiUrl: '/api',
            whatsappNumber: '+221771234567',
            currency: 'F CFA',
            companyName: 'VIVIAS SHOP'
        };
    </script>
</body>
</html>
