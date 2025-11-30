// Version debug pour tester l'API
import React, { useEffect, useState } from "react";
import { createRoot } from "react-dom/client";

const DebugApp = () => {
    const [apiTest, setApiTest] = useState(null);
    const [configTest, setConfigTest] = useState(null);
    const [homeTest, setHomeTest] = useState(null);
    const [loading, setLoading] = useState(true);
    const [errors, setErrors] = useState([]);

    useEffect(() => {
        testAPI();
    }, []);

    const testAPI = async () => {
        const baseURL = window.location.origin + '/api/client';
        const tests = [];

        try {
            // Test 1: Endpoint de test simple
            console.log('🔍 Test 1: API Test endpoint');
            const testResponse = await fetch(`${baseURL}/test`);
            const testData = await testResponse.json();
            setApiTest(testData);
            tests.push({ name: 'API Test', success: testResponse.ok, data: testData });

            // Test 2: Config
            console.log('🔍 Test 2: Config endpoint');
            const configResponse = await fetch(`${baseURL}/config`);
            const configData = await configResponse.json();
            setConfigTest(configData);
            tests.push({ name: 'Config', success: configResponse.ok, data: configData });

            // Test 3: Home data
            console.log('🔍 Test 3: Home data endpoint');
            const homeResponse = await fetch(`${baseURL}/home-test`);
            const homeData = await homeResponse.json();
            setHomeTest(homeData);
            tests.push({ name: 'Home Data', success: homeResponse.ok, data: homeData });

        } catch (error) {
            console.error('❌ Erreur API:', error);
            setErrors(prev => [...prev, error.message]);
        } finally {
            setLoading(false);
        }
    };

    if (loading) {
        return (
            <div style={{ padding: '20px', fontFamily: 'Arial, sans-serif' }}>
                <h1>🔄 Test de l'API en cours...</h1>
                <p>Vérification de la communication avec le backend Laravel.</p>
            </div>
        );
    }

    return (
        <div style={{ padding: '20px', fontFamily: 'Arial, sans-serif', maxWidth: '1200px' }}>
            <h1 style={{ color: '#8B5CF6', marginBottom: '30px' }}>
                🔧 VIVIAS SHOP - Debug API
            </h1>

            {errors.length > 0 && (
                <div style={{ 
                    background: '#FEE2E2', 
                    border: '1px solid #F87171',
                    padding: '15px', 
                    borderRadius: '8px',
                    marginBottom: '20px'
                }}>
                    <h3 style={{ color: '#DC2626', margin: '0 0 10px 0' }}>❌ Erreurs détectées:</h3>
                    {errors.map((error, index) => (
                        <p key={index} style={{ margin: '5px 0', color: '#DC2626' }}>• {error}</p>
                    ))}
                </div>
            )}

            <div style={{ display: 'grid', gap: '20px' }}>
                {/* Test API Simple */}
                <div style={{ 
                    background: apiTest?.success ? '#ECFDF5' : '#FEE2E2', 
                    padding: '20px', 
                    borderRadius: '8px',
                    border: `1px solid ${apiTest?.success ? '#10B981' : '#F87171'}`
                }}>
                    <h3 style={{ 
                        color: apiTest?.success ? '#059669' : '#DC2626',
                        margin: '0 0 15px 0'
                    }}>
                        {apiTest?.success ? '✅' : '❌'} Test API Simple
                    </h3>
                    <p><strong>URL:</strong> /api/client/test</p>
                    <p><strong>Status:</strong> {apiTest?.success ? 'SUCCESS' : 'FAILED'}</p>
                    {apiTest && (
                        <details style={{ marginTop: '10px' }}>
                            <summary style={{ cursor: 'pointer', fontWeight: 'bold' }}>Voir la réponse</summary>
                            <pre style={{ 
                                background: '#F3F4F6', 
                                padding: '10px', 
                                borderRadius: '4px',
                                overflow: 'auto',
                                fontSize: '12px'
                            }}>
                                {JSON.stringify(apiTest, null, 2)}
                            </pre>
                        </details>
                    )}
                </div>

                {/* Test Config */}
                <div style={{ 
                    background: configTest?.success ? '#ECFDF5' : '#FEE2E2', 
                    padding: '20px', 
                    borderRadius: '8px',
                    border: `1px solid ${configTest?.success ? '#10B981' : '#F87171'}`
                }}>
                    <h3 style={{ 
                        color: configTest?.success ? '#059669' : '#DC2626',
                        margin: '0 0 15px 0'
                    }}>
                        {configTest?.success ? '✅' : '❌'} Test Configuration
                    </h3>
                    <p><strong>URL:</strong> /api/client/config</p>
                    <p><strong>Status:</strong> {configTest?.success ? 'SUCCESS' : 'FAILED'}</p>
                    {configTest?.success && (
                        <div style={{ marginTop: '10px' }}>
                            <p><strong>Boutique:</strong> {configTest.data?.company?.name}</p>
                            <p><strong>WhatsApp:</strong> {configTest.data?.company?.whatsapp}</p>
                            <p><strong>Email:</strong> {configTest.data?.company?.email}</p>
                        </div>
                    )}
                </div>

                {/* Test Home Data */}
                <div style={{ 
                    background: homeTest?.success ? '#ECFDF5' : '#FEE2E2', 
                    padding: '20px', 
                    borderRadius: '8px',
                    border: `1px solid ${homeTest?.success ? '#10B981' : '#F87171'}`
                }}>
                    <h3 style={{ 
                        color: homeTest?.success ? '#059669' : '#DC2626',
                        margin: '0 0 15px 0'
                    }}>
                        {homeTest?.success ? '✅' : '❌'} Test Données Accueil
                    </h3>
                    <p><strong>URL:</strong> /api/client/home-test</p>
                    <p><strong>Status:</strong> {homeTest?.success ? 'SUCCESS' : 'FAILED'}</p>
                    {homeTest?.success && (
                        <div style={{ marginTop: '10px' }}>
                            <p><strong>Produits vedettes:</strong> {homeTest.data?.featured_products?.length || 0}</p>
                            <p><strong>Nouveautés:</strong> {homeTest.data?.new_arrivals?.length || 0}</p>
                            <p><strong>Promotions:</strong> {homeTest.data?.products_on_sale?.length || 0}</p>
                            <p><strong>Catégories:</strong> {homeTest.data?.categories_preview?.length || 0}</p>
                        </div>
                    )}
                </div>
            </div>

            <div style={{ 
                marginTop: '30px', 
                padding: '20px', 
                background: '#F3F4F6', 
                borderRadius: '8px' 
            }}>
                <h3>🔧 Actions de debug:</h3>
                <button 
                    onClick={testAPI}
                    style={{
                        background: '#8B5CF6',
                        color: 'white',
                        padding: '10px 20px',
                        border: 'none',
                        borderRadius: '6px',
                        cursor: 'pointer',
                        marginRight: '10px'
                    }}
                >
                    🔄 Relancer les tests
                </button>
                
                <button 
                    onClick={() => window.open('/api/client/test', '_blank')}
                    style={{
                        background: '#059669',
                        color: 'white',
                        padding: '10px 20px',
                        border: 'none',
                        borderRadius: '6px',
                        cursor: 'pointer'
                    }}
                >
                    🌐 Tester API dans nouvel onglet
                </button>
            </div>
        </div>
    );
};

const container = document.getElementById("client-app");
if (container) {
    const root = createRoot(container);
    root.render(<DebugApp />);
    console.log('✅ App debug montée avec succès');
} else {
    console.error('❌ Container #client-app non trouvé');
}
