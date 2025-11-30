// Version simplifiée pour test
import React from "react";
import { createRoot } from "react-dom/client";

const SimpleApp = () => {
    return (
        <div style={{ padding: '20px', fontFamily: 'Arial, sans-serif' }}>
            <h1 style={{ color: '#8B5CF6' }}>✅ VIVIAS SHOP - Test Réussi!</h1>
            <p>Si vous voyez ce message, React fonctionne correctement.</p>
            <div style={{ 
                background: '#F3F4F6', 
                padding: '15px', 
                borderRadius: '8px',
                marginTop: '20px'
            }}>
                <h3>Diagnostics:</h3>
                <ul>
                    <li>✅ React: Monté correctement</li>
                    <li>✅ Vite: Assets chargés</li>
                    <li>✅ CSS: Styles appliqués</li>
                </ul>
            </div>
            
            <button 
                onClick={() => alert('JavaScript fonctionne!')}
                style={{
                    background: '#8B5CF6',
                    color: 'white',
                    padding: '10px 20px',
                    border: 'none',
                    borderRadius: '6px',
                    marginTop: '20px',
                    cursor: 'pointer'
                }}
            >
                Tester JavaScript
            </button>
        </div>
    );
};

const container = document.getElementById("client-app");
if (container) {
    const root = createRoot(container);
    root.render(<SimpleApp />);
    console.log('✅ App simple montée avec succès');
} else {
    console.error('❌ Container #client-app non trouvé');
}
