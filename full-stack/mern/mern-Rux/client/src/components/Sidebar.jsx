import React from 'react';
import { Activity, Terminal, Layers, ShieldCheck, BarChart3, Cpu } from 'lucide-react';
import { motion } from 'framer-motion';
import SidebarLink from './SidebarLink';

const Sidebar = () => {
    return (
        <nav className="glass-pane" style={{
            width: '280px',
            margin: '1rem',
            padding: '1.5rem',
            display: 'flex',
            flexDirection: 'column',
            gap: '2rem'
        }}>
            <div className="logo-section" style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                <div style={{
                    width: '40px',
                    height: '40px',
                    background: 'linear-gradient(135deg, hsl(var(--accent-cyan)), hsl(var(--accent-blue)))',
                    borderRadius: '10px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center'
                }}>
                    <Cpu color="black" size={24} />
                </div>
                <h2 style={{ fontSize: '1.5rem', fontWeight: '700' }}>NEXUS</h2>
            </div>

            <div className="nav-links" style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                <SidebarLink to="/" icon={<Activity size={20} />} label="System Health" />
                <SidebarLink to="/terminal" icon={<Terminal size={20} />} label="Command Core" />
                <SidebarLink to="/graph" icon={<Layers size={20} />} label="Knowledge Graph" />
                <SidebarLink to="/vault" icon={<ShieldCheck size={20} />} label="Security Vault" />
                <SidebarLink to="/analytics" icon={<BarChart3 size={20} />} label="Analytics" />
            </div>

            <div style={{ marginTop: 'auto', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                <div className="glass-card" style={{ padding: '1rem', fontSize: '0.85rem' }}>
                    <p style={{ opacity: 0.6, marginBottom: '0.5rem' }}>STORAGE USAGE</p>
                    <div style={{ width: '100%', height: '4px', background: 'rgba(255,255,255,0.1)', borderRadius: '2px' }}>
                        <motion.div
                            initial={{ width: 0 }}
                            animate={{ width: '65%' }}
                            transition={{ duration: 1.5, ease: "easeOut" }}
                            style={{ height: '100%', background: 'hsl(var(--accent-cyan))', borderRadius: '2px' }}
                        />
                    </div>
                </div>
            </div>
        </nav>
    );
};

export default Sidebar;
