import { Link, useLocation } from 'react-router-dom';
import {
    LayoutDashboard,
    Package,
    ShoppingCart,
    Users,
    BarChart3,
    LogOut,
    Settings
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';

const Sidebar = () => {
    const location = useLocation();
    const { logout, user } = useAuth();

    const menuItems = [
        { icon: <LayoutDashboard size={20} />, label: 'Dashboard', path: '/' },
        { icon: <Package size={20} />, label: 'Products', path: '/products' },
        { icon: <ShoppingCart size={20} />, label: 'Orders', path: '/orders' },
        { icon: <Users size={20} />, label: 'Suppliers', path: '/suppliers', roles: ['Admin', 'Manager'] },
        { icon: <BarChart3 size={20} />, label: 'Reports', path: '/reports' },
    ];

    const filteredMenu = menuItems.filter(item => !item.roles || item.roles.includes(user?.role));

    return (
        <aside className="w-64 bg-slate-900 text-white h-screen fixed left-0 top-0 flex flex-col border-r border-slate-800">
            <div className="p-6 flex items-center gap-3">
                <div className="w-10 h-10 bg-primary-600 rounded-lg flex items-center justify-center">
                    <Package className="text-white" />
                </div>
                <span className="text-xl font-bold tracking-tight">InvenFlow</span>
            </div>

            <nav className="flex-1 px-4 py-4 space-y-1">
                {filteredMenu.map((item) => (
                    <Link
                        key={item.path}
                        to={item.path}
                        className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${location.pathname === item.path
                                ? 'bg-primary-600 text-white shadow-lg shadow-primary-900/20'
                                : 'text-slate-400 hover:bg-slate-800 hover:text-white'
                            }`}
                    >
                        {item.icon}
                        <span className="font-medium">{item.label}</span>
                    </Link>
                ))}
            </nav>

            <div className="p-4 border-t border-slate-800">
                <div className="flex items-center gap-3 px-4 py-3 mb-2">
                    <div className="w-8 h-8 rounded-full bg-slate-700 flex items-center justify-center text-xs font-bold text-primary-400">
                        {user?.name?.charAt(0)}
                    </div>
                    <div className="flex-1 truncate">
                        <p className="text-sm font-semibold truncate">{user?.name}</p>
                        <p className="text-xs text-slate-500 truncate">{user?.role}</p>
                    </div>
                </div>
                <button
                    onClick={logout}
                    className="w-full flex items-center gap-3 px-4 py-3 text-slate-400 hover:bg-red-500/10 hover:text-red-500 rounded-lg transition-colors"
                >
                    <LogOut size={20} />
                    <span className="font-medium">Logout</span>
                </button>
            </div>
        </aside>
    );
};

export default Sidebar;
