<!DOCTYPE html>
<html lang="fr">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <meta name="csrf-token" content="{{ csrf_token() }}">
    <title>{{ $title ?? 'VIVIAS SHOP - Mode Africaine Authentique' }}</title>
    
    {{-- SEO Meta tags --}}
    <meta name="description" content="VIVIAS SHOP - Découvrez notre collection exclusive de mode africaine authentique au Sénégal. Robes, boubous, tissus wax et bien plus encore.">
    <meta name="keywords" content="mode africaine, boubou, dashiki, wax, kaftan, bazin, vêtements traditionnels, Sénégal, Dakar">
    <meta name="author" content="VIVIAS SHOP">
    
    {{-- Open Graph / Facebook --}}
    <meta property="og:type" content="website">
    <meta property="og:url" content="{{ url()->current() }}">
    <meta property="og:title" content="VIVIAS SHOP - Mode Africaine Authentique">
    <meta property="og:description" content="Découvrez notre collection exclusive de vêtements traditionnels et modernes">
    <meta property="og:image" content="{{ asset('images/og-image.jpg') }}">

    {{-- Twitter --}}
    <meta property="twitter:card" content="summary_large_image">
    <meta property="twitter:url" content="{{ url()->current() }}">
    <meta property="twitter:title" content="VIVIAS SHOP - Mode Africaine Authentique">
    <meta property="twitter:description" content="Découvrez notre collection exclusive de vêtements traditionnels et modernes">
    <meta property="twitter:image" content="{{ asset('images/twitter-image.jpg') }}">

    {{-- Favicon --}}
    <link rel="icon" type="image/png" href="{{ asset('favicon.png') }}">
    <link rel="apple-touch-icon" href="{{ asset('apple-touch-icon.png') }}">

    {{-- Fonts --}}
    <link rel="preconnect" href="https://fonts.googleapis.com">
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
    <link href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800&display=swap" rel="stylesheet">
    
    {{-- Vite Assets --}}
    @viteReactRefresh
    @vite(['resources/js/client/client.css', 'resources/js/client/app.jsx'])

    <style>
        body {
            font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
        }
    </style>
</head>
<body class="antialiased">
    {{-- React Root --}}
    <div id="client-app"></div>
    
    {{-- Configuration globale --}}
    <script>
        window.appConfig = {
            apiUrl: '/api',
            whatsappNumber: '{{ config("app.whatsapp_number", "+221771397393") }}',
            currency: 'F CFA',
            companyName: 'VIVIAS SHOP',
            instagram: '{{ config("app.instagram_url", "https://instagram.com/viviasshop") }}',
            tiktok: '{{ config("app.tiktok_url", "https://tiktok.com/@viviasshop") }}',
            email: '{{ config("app.contact_email", "contact@viviasshop.sn") }}'
        };
    </script>

    {{-- Fallback si JavaScript désactivé --}}
    <noscript>
        <div style="padding: 2rem; text-align: center; background: #fef2f2; color: #991b1b; margin: 2rem;">
            <h2 style="margin-bottom: 1rem;">JavaScript requis</h2>
            <p>Veuillez activer JavaScript dans votre navigateur pour utiliser VIVIAS SHOP.</p>
        </div>
    </noscript>

    {{-- WhatsApp Float Button --}}
    <a 
        href="https://wa.me/{{ config('app.whatsapp_number', '221771397393') }}" 
        target="_blank"
        rel="noopener noreferrer"
        class="fixed bottom-6 right-6 z-50 w-14 h-14 bg-green-500 rounded-full flex items-center justify-center shadow-lg hover:bg-green-600 transition-all hover:scale-110"
        style="text-decoration: none;"
        aria-label="Contacter sur WhatsApp"
    >
        <svg class="w-8 h-8 text-white" fill="currentColor" viewBox="0 0 24 24">
            <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.890-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
        </svg>
    </a>

    {{-- Cookie Consent (optionnel) --}}
    <div id="cookie-consent" class="fixed bottom-0 left-0 right-0 bg-gray-900 text-white p-4 z-40" style="display: none;">
        <div class="max-w-7xl mx-auto flex items-center justify-between flex-wrap gap-4">
            <p class="text-sm">
                Nous utilisons des cookies pour améliorer votre expérience. En continuant, vous acceptez notre politique de cookies.
            </p>
            <button 
                onclick="acceptCookies()"
                class="bg-purple-600 hover:bg-purple-700 text-white px-6 py-2 rounded-lg text-sm font-medium transition-colors"
            >
                J'accepte
            </button>
        </div>
    </div>

    <script>
        // Gestion du consentement cookies
        function acceptCookies() {
            localStorage.setItem('cookieConsent', 'true');
            document.getElementById('cookie-consent').style.display = 'none';
        }

        // Afficher le consentement si non accepté
        setTimeout(() => {
            if (!localStorage.getItem('cookieConsent')) {
                document.getElementById('cookie-consent').style.display = 'block';
            }
        }, 2000);
    </script>
</body>
</html>