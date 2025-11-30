<!DOCTYPE html>
<html lang="fr">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Debug VIVIAS SHOP</title>
    <style>
        body { font-family: Arial, sans-serif; padding: 20px; background: #f5f5f5; }
        .test { background: white; padding: 15px; margin: 10px 0; border-radius: 8px; border-left: 4px solid #8B5CF6; }
        .success { border-left-color: #10B981; }
        .error { border-left-color: #EF4444; }
        .code { background: #f3f4f6; padding: 10px; border-radius: 4px; font-family: monospace; }
    </style>
</head>
<body>
    <h1>🔧 Debug VIVIAS SHOP</h1>
    
    <div class="test">
        <h3>✅ Laravel fonctionne</h3>
        <p>Version: {{ app()->version() }}</p>
        <p>Environnement: {{ app()->environment() }}</p>
        <p>URL: {{ config('app.url') }}</p>
    </div>

    <div class="test">
        <h3>🔍 Test API Direct</h3>
        <p>Cliquez pour tester les endpoints API :</p>
        <button onclick="testAPI('/api/client/test')" style="margin: 5px; padding: 8px 15px; background: #8B5CF6; color: white; border: none; border-radius: 4px; cursor: pointer;">
            Test API Simple
        </button>
        <button onclick="testAPI('/api/client/config')" style="margin: 5px; padding: 8px 15px; background: #059669; color: white; border: none; border-radius: 4px; cursor: pointer;">
            Test Config
        </button>
        <div id="api-results" style="margin-top: 15px;"></div>
    </div>

    <div class="test">
        <h3>📦 Assets Vite</h3>
        <p>Vérification du chargement des assets...</p>
        <div id="vite-status">Chargement...</div>
    </div>

    <div class="test">
        <h3>⚛️ React Test</h3>
        <div id="react-app">
            <p style="color: #EF4444;">React ne s'est pas monté - vérifiez la console</p>
        </div>
    </div>

    {{-- Vite Assets --}}
    @viteReactRefresh
    @vite(['resources/js/client/client.css', 'resources/js/client/app-debug.jsx'])

    <script>
        // Test API
        async function testAPI(endpoint) {
            const resultsDiv = document.getElementById('api-results');
            resultsDiv.innerHTML = '<p>🔄 Test en cours...</p>';
            
            try {
                const response = await fetch(endpoint);
                const data = await response.json();
                
                resultsDiv.innerHTML = `
                    <div class="code">
                        <strong>URL:</strong> ${endpoint}<br>
                        <strong>Status:</strong> ${response.status} ${response.statusText}<br>
                        <strong>Réponse:</strong><br>
                        <pre>${JSON.stringify(data, null, 2)}</pre>
                    </div>
                `;
            } catch (error) {
                resultsDiv.innerHTML = `
                    <div class="code" style="border-left: 4px solid #EF4444;">
                        <strong>Erreur:</strong> ${error.message}
                    </div>
                `;
            }
        }

        // Vérifier les assets Vite
        setTimeout(() => {
            const viteScripts = document.querySelectorAll('script[src*="vite"], script[src*="@vite"]');
            const viteLinks = document.querySelectorAll('link[href*="vite"], link[href*="@vite"]');
            
            document.getElementById('vite-status').innerHTML = `
                <p>Scripts Vite trouvés: ${viteScripts.length}</p>
                <p>CSS Vite trouvés: ${viteLinks.length}</p>
                ${viteScripts.length === 0 ? '<p style="color: #EF4444;">⚠️ Aucun script Vite chargé!</p>' : ''}
            `;
        }, 1000);

        // Test React
        setTimeout(() => {
            const reactContainer = document.getElementById('client-app');
            if (reactContainer && reactContainer.innerHTML.trim() !== '') {
                document.getElementById('react-app').innerHTML = '<p style="color: #10B981;">✅ React monté avec succès!</p>';
            }
        }, 2000);

        // Log de debug
        console.log('🔧 Page debug chargée');
        console.log('🔧 URL actuelle:', window.location.href);
        console.log('🔧 Origin:', window.location.origin);
    </script>

    {{-- Container React (caché) --}}
    <div id="client-app" style="display: none;"></div>
</body>
</html>
