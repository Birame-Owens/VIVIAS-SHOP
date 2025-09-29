// ================================================================
// 📝 FICHIER: resources/js/client/app.jsx (MISE À JOUR)
// ================================================================
import React from "react";
import { createRoot } from "react-dom/client";
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import HomePage from "./pages/HomePage";

// IMPORT DU CSS CLIENT
import "./client.css";

const AppClient = () => {
    return (
        <Router>
            <Routes>
                <Route path="/client/home" element={<HomePage />} />
                <Route path="/client" element={<Navigate to="/client/home" replace />} />
                {/* Routes futures pour l'expansion */}
                {/* <Route path="/client/products" element={<ProductsPage />} /> */}
                {/* <Route path="/client/categories/:slug" element={<CategoryPage />} /> */}
                {/* <Route path="/client/product/:slug" element={<ProductDetailPage />} /> */}
                {/* <Route path="/client/cart" element={<CartPage />} /> */}
            </Routes>
        </Router>
    );
};

// Configuration globale pour l'application
window.appConfig = {
    apiUrl: '/api',
    whatsappNumber: '+221771234567',
    currency: 'F CFA',
    companyName: 'VIVIAS SHOP'
};

const container = document.getElementById("client-app");
if (container) {
    const root = createRoot(container);
    root.render(<AppClient />);
} else {
    console.error("❌ Element #client-app non trouvé dans le DOM");
}

export default AppClient;