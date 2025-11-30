import React from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { 
  LayoutDashboard, Package, ShoppingCart, Users, Tag, CreditCard, 
  Percent, Star, BarChart3, LogOut, X, Menu, Send
} from 'lucide-react';

const Sidebar = ({ isOpen, setIsOpen }) => {
    const location = useLocation();
    const navigate = useNavigate();
    const { logout, user } = useAuth();

    const menuItems = [
        { name: 'Dashboard', icon: LayoutDashboard, path: '/admin/dashboard', active: true },
        { name: 'Catégories', icon: Tag, path: '/admin/categories', active: true },
        { name: 'Produits', icon: Package, path: '/admin/produits', active: true },
        { name: 'Commandes', icon: ShoppingCart, path: '/admin/commandes', active: true },
        { name: 'Clients', icon: Users, path: '/admin/clients', active: true },
        { name: 'Paiements', icon: CreditCard, path: '/admin/paiements', active: true },
        { name: 'Promotions', icon: Percent, path: '/admin/promotions', active: true },
        { name: 'Avis Clients', icon: Star, path: '/admin/avis-clients', active: true },
        { name: 'Messages', icon: Send, path: '/admin/messages', active: true },
        { name: 'Rapports', icon: BarChart3, path: '/admin/rapports', active: true },
    ];

    const handleLogout = async () => {
        await logout();
        navigate('/admin/login');
    };

    const isActive = (path) => location.pathname === path;

    return (
        <>
            {/* Mobile Overlay */}
            {isOpen && (
                <div 
                    className="fixed inset-0 bg-black/50 backdrop-blur-sm z-40 lg:hidden"
                    onClick={() => setIsOpen(false)}
                />
            )}

            {/* Sidebar */}
            <aside className={`
                fixed top-0 left-0 z-50 h-full
                w-64 bg-white border-r border-neutral-100
                transform transition-transform duration-300 ease-in-out
                lg:translate-x-0
                ${isOpen ? 'translate-x-0' : '-translate-x-full'}
            `}>
                {/* Header */}
                <div className="h-20 border-b border-neutral-100 flex items-center justify-between px-6">
                    <button onClick={() => navigate('/admin/dashboard')} className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-black rounded-full flex items-center justify-center">
                            <span className="text-white font-bold text-sm">V</span>
                        </div>
                        <div>
                            <h1 className="font-bold text-lg tracking-tight">VIVIAS</h1>
                            <p className="text-[10px] text-neutral-400 uppercase tracking-widest">Admin</p>
                        </div>
                    </button>
                    <button 
                        onClick={() => setIsOpen(false)}
                        className="lg:hidden p-2 hover:bg-neutral-100 rounded-full transition-colors"
                    >
                        <X className="w-5 h-5" />
                    </button>
                </div>

                {/* Navigation */}
                <nav className="flex-1 overflow-y-auto p-4 space-y-1">
                    {menuItems.map((item) => {
                        const Icon = item.icon;
                        const active = isActive(item.path);
                        
                        return (
                            <button
                                key={item.path}
                                onClick={() => {
                                    if (item.active) {
                                        navigate(item.path);
                                        setIsOpen(false);
                                    }
                                }}
                                disabled={!item.active}
                                className={`
                                    w-full flex items-center gap-3 px-4 py-3 rounded-lg
                                    text-sm font-medium tracking-wide uppercase
                                    transition-all duration-200
                                    ${active 
                                        ? 'bg-black text-white' 
                                        : item.active
                                            ? 'text-neutral-600 hover:bg-neutral-50 hover:text-black'
                                            : 'text-neutral-300 cursor-not-allowed'
                                    }
                                `}
                            >
                                <Icon className="w-4 h-4 flex-shrink-0" strokeWidth={1.5} />
                                <span className="text-xs">{item.name}</span>
                            </button>
                        );
                    })}
                </nav>

                {/* User Profile & Logout */}
                <div className="border-t border-neutral-100 p-4">
                    <div className="bg-neutral-50 rounded-lg p-3 mb-2">
                        <p className="text-xs font-bold uppercase tracking-wide text-black truncate">
                            {user?.nom || 'Admin'}
                        </p>
                        <p className="text-[10px] text-neutral-400 truncate">
                            {user?.email || 'admin@vivias.shop'}
                        </p>
                    </div>
                    <button
                        onClick={handleLogout}
                        className="w-full flex items-center gap-2 px-4 py-3 text-xs font-medium uppercase tracking-wide
                                 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                    >
                        <LogOut className="w-4 h-4" strokeWidth={1.5} />
                        Déconnexion
                    </button>
                </div>
            </aside>

            {/* Mobile Menu Button */}
            <button
                onClick={() => setIsOpen(true)}
                className="fixed top-4 left-4 z-30 lg:hidden p-3 bg-black text-white rounded-full shadow-lg"
            >
                <Menu className="w-5 h-5" />
            </button>
        </>
    );
};

export default Sidebar;
