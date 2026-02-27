import React from 'react';
import { Terminal, Home, Star, Folder, Hash, Info, Zap, Sparkles } from 'lucide-react';
import { Link, useLocation } from 'react-router-dom';

const SidebarLink = ({ to, icon: Icon, label, badge }) => {
    const location = useLocation();
    const isActive = location.pathname === to;

    return (
        <Link
            to={to}
            className={`flex items-center justify-between px-4 py-3 rounded-xl transition-all duration-300 group ${isActive
                ? 'bg-primary/20 text-primary shadow-lg shadow-primary/10'
                : 'text-text-muted hover:bg-white/5 hover:text-white'
                }`}
        >
            <div className="flex items-center gap-3">
                <Icon className={`w-5 h-5 transition-transform group-hover:scale-110 ${isActive ? 'text-primary' : ''}`} />
                <span className="font-medium">{label}</span>
            </div>
            {badge && (
                <span className="bg-primary/20 text-primary text-[10px] px-2 py-0.5 rounded-full font-bold">
                    {badge}
                </span>
            )}
        </Link>
    );
};

const Sidebar = () => {
    return (
        <aside className="fixed left-0 top-0 h-screen w-72 glass border-r border-white/5 p-6 flex flex-col hidden lg:flex">
            <div className="flex items-center gap-3 mb-10 px-2">
                <div className="p-2.5 bg-gradient-to-br from-primary to-secondary rounded-xl shadow-lg shadow-primary/20">
                    <Terminal className="w-6 h-6 text-white" />
                </div>
                <h1 className="text-2xl font-bold tracking-tight">Code<span className="gradient-text">Vault</span></h1>
            </div>

            <nav className="flex-1 space-y-2">
                <div className="text-[10px] uppercase tracking-widest text-text-muted font-bold mb-4 px-4 opacity-50">Main Menu</div>
                <SidebarLink to="/" icon={Home} label="All Snippets" />
                <SidebarLink to="/favorites" icon={Star} label="Important" />
                <SidebarLink to="/collections" icon={Folder} label="Collections" />

                <div className="pt-8 text-[10px] uppercase tracking-widest text-text-muted font-bold mb-4 px-4 opacity-50">Knowledge</div>
                <SidebarLink to="/tags" icon={Hash} label="Tags Explorer" />
                <SidebarLink to="/help" icon={Info} label="Documentation" />
            </nav>

            <div className="mt-auto pt-6 border-t border-white/5">
                <div className="bg-gradient-to-br from-primary/10 to-secondary/10 p-4 rounded-2xl border border-white/5 relative overflow-hidden group hover:border-primary/30 transition-colors cursor-pointer">
                    <div className="absolute -right-4 -bottom-4 opacity-10 group-hover:scale-125 transition-transform">
                        <Zap className="w-20 h-20 text-primary" />
                    </div>
                    <h4 className="font-bold text-sm mb-1 flex items-center gap-2">
                        Vault Pro <Sparkles className="w-3 h-3 text-secondary" />
                    </h4>
                    <p className="text-[10px] text-text-muted">Cloud sync enabled</p>
                </div>
            </div>
        </aside>
    );
};

export default Sidebar;
