// ================================================================
// 📝 FICHIER: resources/js/admin/app.jsx (VERSION COMPLÈTE CORRIGÉE AVEC COMMANDES)
// ================================================================

import React, { Suspense } from 'react';
import { createRoot } from 'react-dom/client';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { AuthProvider } from './context/AuthContext';
import ProtectedRoute from './components/ProtectedRoute';
import AdminLogin from './pages/Login';
import Dashboard from './pages/Dashboard';
import Categories from './pages/Categories';
import Products from './pages/Products';
import Paiements from './pages/Paiements';
import Commands from './pages/Commands'; // ← AJOUTER CETTE LIGNE
import Clients from './pages/Clients'; // ou le bon chemin
import Promotions from './pages/Promotions';
import Sidebar from './components/Sidebar';
import './admin.css';

// Layout principal pour les pages admin
const AdminLayout = ({ children }) => {
    const [sidebarOpen, setSidebarOpen] = React.useState(false);

    return (
        <div className="min-h-screen bg-gray-50 flex">
            <Sidebar isOpen={sidebarOpen} setIsOpen={setSidebarOpen} />
            <div className="flex-1 min-w-0 lg:ml-64">
                {children}
            </div>
        </div>
    );
};

// Composant de chargement
const LoadingScreen = () => (
    <div className="min-h-screen bg-gradient-to-br from-purple-600 via-blue-600 to-indigo-700 flex items-center justify-center">
        <div className="text-center">
            <div className="bg-white p-4 rounded-full inline-block mb-4 shadow-2xl">
                <svg className="w-10 h-10 text-purple-600 animate-pulse" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/>
                </svg>
            </div>
            <h1 className="text-2xl font-bold text-white mb-2">VIVIAS SHOP</h1>
            <p className="text-blue-100">Chargement de l'administration...</p>
            <div className="mt-4">
                <div className="w-8 h-8 border-4 border-white border-t-transparent rounded-full animate-spin mx-auto"></div>
            </div>
        </div>
    </div>
);

// Composant d'erreur
class ErrorBoundary extends React.Component {
    constructor(props) {
        super(props);
        this.state = { hasError: false, error: null };
    }

    static getDerivedStateFromError(error) {
        return { hasError: true, error };
    }

    componentDidCatch(error, errorInfo) {
        console.error('Erreur dans l\'application admin:', error, errorInfo);
    }

    render() {
        if (this.state.hasError) {
            return (
                <div className="min-h-screen bg-red-50 flex items-center justify-center p-4">
                    <div className="bg-white rounded-2xl shadow-lg p-8 max-w-md w-full text-center">
                        <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                            <svg className="w-8 h-8 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
                            </svg>
                        </div>
                        <h2 className="text-xl font-bold text-gray-900 mb-2">Erreur de l'application</h2>
                        <p className="text-gray-600 mb-4">Une erreur s'est produite lors du chargement de l'administration.</p>
                        <button 
                            onClick={() => window.location.reload()}
                            className="bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 transition-colors"
                        >
                            Recharger la page
                        </button>
                        <details className="mt-4 text-left">
                            <summary className="cursor-pointer text-sm text-gray-500">Détails de l'erreur</summary>
                            <pre className="mt-2 text-xs text-gray-400 bg-gray-100 p-2 rounded overflow-auto">
                                {this.state.error?.toString()}
                            </pre>
                        </details>
                    </div>
                </div>
            );
        }

        return this.props.children;
    }
}

const App = () => {
    console.log('Application admin se charge...');
    
    return (
        <ErrorBoundary>
            <AuthProvider>
                <Router>
                    <div className="min-h-screen">
                        <Suspense fallback={<LoadingScreen />}>
                            <Routes>
                                {/* Route de connexion */}
                                <Route path="/admin/login" element={<AdminLogin />} />
                                
                                {/* Routes protégées avec layout */}
                                <Route path="/admin/dashboard" element={
                                    <ProtectedRoute>
                                        <AdminLayout>
                                            <Dashboard />
                                        </AdminLayout>
                                    </ProtectedRoute>
                                } />

                                <Route path="/admin/categories" element={
                                    <ProtectedRoute>
                                        <AdminLayout>
                                            <Categories />
                                        </AdminLayout>
                                    </ProtectedRoute>
                                } />

                                <Route path="/admin/produits" element={
                                    <ProtectedRoute>
                                        <AdminLayout>
                                            <Products />
                                        </AdminLayout>
                                    </ProtectedRoute>
                                } />

                                {/* AJOUTER CETTE ROUTE POUR LES COMMANDES */}
                                <Route path="/admin/commandes" element={
                                    <ProtectedRoute>
                                        <AdminLayout>
                                            <Suspense fallback={<LoadingScreen />}>
                                                <Commands />
                                            </Suspense>
                                        </AdminLayout>
                                    </ProtectedRoute>
                                } />

                                <Route path="/admin/clients" element={
                                    <ProtectedRoute>
                                      <AdminLayout>
                                        <Clients />
                                      </AdminLayout>
                                     </ProtectedRoute>
                               } />
                               <Route  path="/admin/paiements"  element={
                                  <ProtectedRoute>
                                    <AdminLayout>
                                     <Suspense fallback={<LoadingScreen />}>
                                     <Paiements />
                                    </Suspense>
                                   </AdminLayout>
                                  </ProtectedRoute>
                                }  />

                                   <Route   path="/admin/promotions"    element={
                                     <ProtectedRoute>
                                          <AdminLayout>
                                             <Suspense fallback={<LoadingScreen />}>
                                               <Promotions />
                                            </Suspense>
                                          </AdminLayout>
                                   </ProtectedRoute>
                                 } />
                                
                                {/* Redirection par défaut */}
                                <Route path="/admin" element={<Navigate to="/admin/dashboard" replace />} />
                                <Route path="*" element={<Navigate to="/admin/login" replace />} />
                            </Routes>
                        </Suspense>
                        
                        {/* Notifications toast */}
                        <Toaster
                            position="top-right"
                            toastOptions={{
                                duration: 4000,
                                style: {
                                    background: '#363636',
                                    color: '#fff',
                                    borderRadius: '10px',
                                    padding: '16px',
                                    fontSize: '14px',
                                },
                                success: {
                                    iconTheme: {
                                        primary: '#10b981',
                                        secondary: '#fff',
                                    },
                                },
                                error: {
                                    iconTheme: {
                                        primary: '#ef4444',
                                        secondary: '#fff',
                                    },
                                },
                            }}
                        />
                    </div>
                </Router>
            </AuthProvider>
        </ErrorBoundary>
    );
};

// Montage de l'application avec vérifications
const container = document.getElementById('admin-app');
if (container) {
    console.log('Container trouvé, montage de l\'application React...');
    const root = createRoot(container);
    root.render(<App />);
    
    // Masquer le loader initial après le montage
    setTimeout(() => {
        const loader = document.getElementById('initial-loader');
        if (loader) {
            loader.style.opacity = '0';
            setTimeout(() => loader.remove(), 300);
        }
    }, 500);
} else {
    console.error('❌ Element #admin-app non trouvé dans le DOM');
    
    // Afficher un message d'erreur à l'utilisateur
    document.body.innerHTML = `
        <div style="display: flex; justify-content: center; align-items: center; min-height: 100vh; background: #f3f4f6; font-family: system-ui;">
            <div style="text-align: center; background: white; padding: 2rem; border-radius: 1rem; box-shadow: 0 10px 25px rgba(0,0,0,0.1);">
                <h1 style="color: #dc2626; margin-bottom: 1rem;">Erreur de chargement</h1>
                <p style="color: #6b7280; margin-bottom: 1rem;">L'élément #admin-app n'a pas été trouvé dans le DOM.</p>
                <p style="color: #6b7280; font-size: 0.875rem;">Vérifiez que le template Blade charge correctement l'application React.</p>
                <button onclick="window.location.reload()" style="margin-top: 1rem; background: #dc2626; color: white; padding: 0.5rem 1rem; border: none; border-radius: 0.5rem; cursor: pointer;">
                    Recharger la page
                </button>
            </div>
        </div>
    `;
}

export default App;