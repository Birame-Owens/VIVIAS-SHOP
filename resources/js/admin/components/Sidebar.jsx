// ================================================================
// 📝 FICHIER: resources/js/admin/components/Sidebar.jsx (VERSION FINALE)
// ================================================================

import React, { useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const Sidebar = ({ isOpen, setIsOpen }) => {
    const location = useLocation();
    const navigate = useNavigate();
    const { logout, user } = useAuth();
    const [isCollapsed, setIsCollapsed] = useState(false);

    // Icônes SVG intégrées
    const Icons = {
        LayoutDashboard: () => (
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2H5a2 2 0 00-2-2z" />
            </svg>
        ),
        Package: () => (
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
            </svg>
        ),
        ShoppingCart: () => (
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h2l.4 2M7 13h10l4-8H5.4m0 0L7 13m0 0l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17M17 13v6a2 2 0 01-2 2H9a2 2 0 01-2-2v-6m8 0V9a2 2 0 00-2-2H9a2 2 0 00-2 2v4.01" />
            </svg>
        ),
        Users: () => (
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.25 2.25 0 11-4.5 0 2.25 2.25 0 014.5 0z" />
            </svg>
        ),
        Scissors: () => (
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.828 14.828a4 4 0 01-5.656 0M9 10h1m4 0h1m-6 4h1m4 0h1" />
            </svg>
        ),
        Warehouse: () => (
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-7-4-7 4v10a2 2 0 002 2h10a2 2 0 002-2V7z" />
            </svg>
        ),
        Tag: () => (
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
            </svg>
        ),
        CreditCard: () => (
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
            </svg>
        ),
        Percent: () => (
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 8l3-3 3 3m0 13l-3-3-3 3M9 21h6a2 2 0 002-2V5a2 2 0 00-2-2H9a2 2 0 00-2 2v14a2 2 0 002 2z" />
            </svg>
        ),
        Star: () => (
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />
            </svg>
        ),
        BarChart3: () => (
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
            </svg>
        ),
        Settings: () => (
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
        ),
        ChevronLeft: () => (
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
        ),
        ChevronRight: () => (
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
        ),
        X: () => (
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
        ),
        LogOut: () => (
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
            </svg>
        )
    };

    const menuItems = [
        {
            name: 'Dashboard',
            icon: Icons.LayoutDashboard,
            path: '/admin/dashboard',
            color: 'text-blue-400',
            implemented: true
        },
        {
            name: 'Catégories',
            icon: Icons.Tag,
            path: '/admin/categories',
            color: 'text-cyan-400',
            implemented: true
        },
        {
            name: 'Produits',
            icon: Icons.Package,
            path: '/admin/produits',
            color: 'text-purple-400',
            implemented: true
        },
        {
            name: 'Commandes',
            icon: Icons.ShoppingCart,
            path: '/admin/commandes',
            color: 'text-green-400',
            implemented: false
        },
        {
            name: 'Clients',
            icon: Icons.Users,
            path: '/admin/clients',
            color: 'text-indigo-400',
            implemented: false
        },
        {
            name: 'Tailleurs',
            icon: Icons.Scissors,
            path: '/admin/tailleurs',
            color: 'text-amber-400',
            implemented: false
        },
        {
            name: 'Stock',
            icon: Icons.Warehouse,
            path: '/admin/stock',
            color: 'text-red-400',
            implemented: false
        },
        {
            name: 'Paiements',
            icon: Icons.CreditCard,
            path: '/admin/paiements',
            color: 'text-emerald-400',
            implemented: false
        },
        {
            name: 'Promotions',
            icon: Icons.Percent,
            path: '/admin/promotions',
            color: 'text-orange-400',
            implemented: false
        },
        {
            name: 'Avis Clients',
            icon: Icons.Star,
            path: '/admin/avis',
            color: 'text-yellow-400',
            implemented: false
        },
        {
            name: 'Rapports',
            icon: Icons.BarChart3,
            path: '/admin/rapports',
            color: 'text-pink-400',
            implemented: false
        },
        {
            name: 'Paramètres',
            icon: Icons.Settings,
            path: '/admin/parametres',
            color: 'text-gray-400',
            implemented: false
        }
    ];

    const handleMenuClick = (path, name, implemented) => {
        if (implemented) {
            navigate(path);
        } else {
            // Pour les pages non implémentées, afficher un message temporaire
            alert(`Navigation vers ${name} - Sera implémenté prochainement`);
        }
        
        // Fermer le sidebar sur mobile
        if (window.innerWidth < 1024) {
            setIsOpen(false);
        }
    };

    const handleLogout = async () => {
        try {
            await logout();
        } catch (error) {
            console.error('Erreur déconnexion:', error);
            await logout();
        }
    };

    const toggleCollapse = () => {
        setIsCollapsed(!isCollapsed);
    };

    // Largeur dynamique
    const sidebarWidth = isCollapsed ? 'w-20' : 'w-64';
    const sidebarTransform = isOpen ? 'translate-x-0' : '-translate-x-full';

    return (
        <>
            {/* Overlay pour mobile */}
            {isOpen && (
                <div 
                    className="fixed inset-0 bg-black bg-opacity-50 z-40 lg:hidden"
                    onClick={() => setIsOpen(false)}
                />
            )}

            {/* Sidebar */}
            <div className={`
                fixed top-0 left-0 h-screen bg-gradient-to-b from-slate-900 via-purple-900 to-slate-900 
                text-white z-50 transition-all duration-300 ease-in-out
                lg:${sidebarWidth} lg:translate-x-0
                ${sidebarWidth} ${sidebarTransform}
                shadow-2xl border-r border-gray-700/50
                flex flex-col
            `}>
                {/* Header - Hauteur fixe */}
                <div className="flex-shrink-0 flex items-center justify-between p-4 border-b border-gray-700/50">
                    {!isCollapsed && (
                        <div className="flex items-center space-x-3">
                            <div className="w-10 h-10 bg-gradient-to-br from-purple-500 to-pink-500 rounded-xl flex items-center justify-center">
                                <span className="text-white font-bold text-lg">V</span>
                            </div>
                            <div>
                                <h1 className="text-lg font-bold">Vivias Shop</h1>
                                <p className="text-gray-400 text-xs">Admin</p>
                            </div>
                        </div>
                    )}

                    {/* Boutons de contrôle */}
                    <div className="flex items-center space-x-1">
                        {/* Bouton collapse (desktop uniquement) */}
                        <button
                            onClick={toggleCollapse}
                            className="hidden lg:flex p-2 rounded-lg bg-gray-800/50 hover:bg-gray-700/50 transition-colors"
                            title={isCollapsed ? 'Étendre' : 'Réduire'}
                        >
                            {isCollapsed ? <Icons.ChevronRight /> : <Icons.ChevronLeft />}
                        </button>

                        {/* Bouton fermer (mobile uniquement) */}
                        <button
                            onClick={() => setIsOpen(false)}
                            className="lg:hidden p-2 rounded-lg bg-gray-800/50 hover:bg-gray-700/50 transition-colors"
                        >
                            <Icons.X />
                        </button>
                    </div>
                </div>

                {/* Navigation - Zone scrollable */}
                <nav className="flex-1 overflow-hidden">
                    <div className="h-full overflow-y-auto p-2 scrollbar-thin scrollbar-track-gray-800 scrollbar-thumb-purple-500 hover:scrollbar-thumb-purple-400">
                        <div className="space-y-1 pb-4">
                            {menuItems.map((item) => {
                                const Icon = item.icon;
                                const isActive = location.pathname === item.path;
                                
                                return (
                                    <div key={item.name} className="relative">
                                        <button
                                            onClick={() => handleMenuClick(item.path, item.name, item.implemented)}
                                            className={`
                                                w-full flex items-center px-3 py-3 rounded-lg transition-all duration-200 text-left
                                                ${isActive 
                                                    ? 'bg-gradient-to-r from-purple-500/20 to-pink-500/20 border border-purple-500/30 text-white shadow-lg transform scale-[0.98]' 
                                                    : 'hover:bg-gray-800/30 text-gray-300 hover:text-white hover:transform hover:scale-[0.98]'
                                                }
                                                ${!item.implemented ? 'opacity-75' : ''}
                                                group relative
                                            `}
                                            title={isCollapsed ? item.name : ''}
                                        >
                                            {/* Icône */}
                                            <div className={`
                                                flex items-center justify-center w-8 h-8 rounded-lg transition-all duration-200
                                                ${isActive ? 'bg-purple-500/20' : 'bg-gray-700/30 group-hover:bg-gray-700/50'}
                                                ${isCollapsed ? 'mx-auto' : 'mr-3'}
                                            `}>
                                                <div className={`transition-all duration-200 ${isActive ? 'text-purple-400 scale-110' : item.color}`}>
                                                    <Icon />
                                                </div>
                                            </div>

                                            {/* Texte */}
                                            {!isCollapsed && (
                                                <div className="flex-1 flex items-center justify-between">
                                                    <span className="font-medium text-sm transition-all duration-200">{item.name}</span>
                                                    
                                                    {/* Indicateurs */}
                                                    <div className="flex items-center space-x-2">
                                                        {/* Badge implémenté */}
                                                        {item.implemented && isActive && (
                                                            <div className="w-2 h-2 bg-purple-400 rounded-full animate-pulse" />
                                                        )}
                                                        
                                                        {/* Badge non implémenté */}
                                                        {!item.implemented && (
                                                            <div className="text-xs px-1.5 py-0.5 bg-gray-700 text-gray-400 rounded text-[10px]">
                                                                Bientôt
                                                            </div>
                                                        )}
                                                    </div>
                                                </div>
                                            )}

                                            {/* Tooltip pour mode collapsed */}
                                            {isCollapsed && (
                                                <div className="absolute left-full ml-2 px-3 py-2 bg-gray-900 text-white text-sm rounded-lg opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none whitespace-nowrap z-50 border border-gray-700 shadow-xl">
                                                    <div className="flex items-center space-x-2">
                                                        <span>{item.name}</span>
                                                        {!item.implemented && (
                                                            <span className="text-xs text-gray-400">(Bientôt)</span>
                                                        )}
                                                    </div>
                                                    {/* Flèche du tooltip */}
                                                    <div className="absolute top-1/2 -left-1 transform -translate-y-1/2 w-2 h-2 bg-gray-900 rotate-45 border-l border-b border-gray-700"></div>
                                                </div>
                                            )}
                                        </button>
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                </nav>

                {/* Footer avec profil utilisateur et déconnexion */}
                <div className="flex-shrink-0 p-4 border-t border-gray-700/50">
                    {!isCollapsed ? (
                        <div className="space-y-3">
                            {/* Profil utilisateur */}
                            <div className="flex items-center p-3 rounded-lg bg-gray-800/30">
                                <div className="w-10 h-10 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full flex items-center justify-center mr-3">
                                    <span className="text-white text-sm font-bold">
                                        {user?.name?.charAt(0) || 'A'}
                                    </span>
                                </div>
                                <div className="flex-1 min-w-0">
                                    <div className="font-medium text-white text-sm truncate">
                                        {user?.name || 'Administrateur'}
                                    </div>
                                    <div className="text-gray-400 text-xs">
                                        {user?.email || 'admin@vivias-shop.com'}
                                    </div>
                                </div>
                            </div>
                            
                            {/* Bouton de déconnexion */}
                            <button
                                onClick={handleLogout}
                                className="w-full flex items-center px-3 py-2 rounded-lg bg-red-500/10 border border-red-500/20 text-red-300 hover:bg-red-500/20 hover:text-red-200 transition-all duration-200 group"
                            >
                                <div className="w-8 h-8 rounded-lg bg-red-500/20 flex items-center justify-center mr-3 group-hover:bg-red-500/30 transition-colors">
                                    <Icons.LogOut />
                                </div>
                                <span className="text-sm font-medium">Déconnexion</span>
                            </button>
                        </div>
                    ) : (
                        <div className="flex flex-col space-y-2">
                            {/* Avatar utilisateur en mode collapsed */}
                            <div className="relative group">
                                <div className="w-10 h-10 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full flex items-center justify-center mx-auto">
                                    <span className="text-white text-sm font-bold">
                                        {user?.name?.charAt(0) || 'A'}
                                    </span>
                                </div>
                                
                                {/* Tooltip utilisateur */}
                                <div className="absolute left-full ml-2 px-3 py-2 bg-gray-900 text-white text-sm rounded-lg opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none whitespace-nowrap z-50 border border-gray-700 shadow-xl">
                                    <div>{user?.name || 'Administrateur'}</div>
                                    <div className="text-xs text-gray-400">{user?.email}</div>
                                    <div className="absolute top-1/2 -left-1 transform -translate-y-1/2 w-2 h-2 bg-gray-900 rotate-45 border-l border-b border-gray-700"></div>
                                </div>
                            </div>
                            
                            {/* Bouton déconnexion en mode collapsed */}
                            <div className="relative group">
                                <button
                                    onClick={handleLogout}
                                    className="w-10 h-10 rounded-lg bg-red-500/10 border border-red-500/20 text-red-300 hover:bg-red-500/20 hover:text-red-200 transition-all duration-200 flex items-center justify-center mx-auto"
                                    title="Déconnexion"
                                >
                                    <Icons.LogOut />
                                </button>
                                
                                {/* Tooltip déconnexion */}
                                <div className="absolute left-full ml-2 px-3 py-2 bg-gray-900 text-white text-sm rounded-lg opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none whitespace-nowrap z-50 border border-gray-700 shadow-xl">
                                    Déconnexion
                                    <div className="absolute top-1/2 -left-1 transform -translate-y-1/2 w-2 h-2 bg-gray-900 rotate-45 border-l border-b border-gray-700"></div>
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </>
    );
};

export default Sidebar;