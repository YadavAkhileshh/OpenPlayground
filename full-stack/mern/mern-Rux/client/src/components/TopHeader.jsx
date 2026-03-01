import React from 'react';
import { Search, Bell, Settings } from 'lucide-react';

const TopHeader = () => {
    return (
        <header style={{ display: 'flex', justifyContent: 'flex-end', alignItems: 'center', marginBottom: '3rem', gap: '1rem' }}>
            <div className="glass-pane" style={{ padding: '0.5rem 1rem', display: 'flex', alignItems: 'center', gap: '1rem' }}>
                <Search size={18} opacity={0.5} />
                <span style={{ fontSize: '0.9rem', opacity: 0.5 }}>Search commands...</span>
                <kbd style={{
                    background: 'rgba(255,255,255,0.1)',
                    padding: '2px 6px',
                    borderRadius: '4px',
                    fontSize: '0.75rem'
                }}>⌘K</kbd>
            </div>
            <button style={{ padding: '0.75rem', borderRadius: '50%' }}><Bell size={20} /></button>
            <button style={{ padding: '0.75rem', borderRadius: '50%' }}><Settings size={20} /></button>
            <div style={{ width: '1px', height: '24px', background: 'var(--border-glass)', margin: '0 0.5rem' }} />
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                <div style={{ textAlign: 'right' }}>
                    <p style={{ fontSize: '0.85rem', fontWeight: '600' }}>Operator Vishnu</p>
                    <p style={{ fontSize: '0.7rem', opacity: 0.5 }}>Level 4 Access</p>
                </div>
                <div style={{ width: '40px', height: '40px', borderRadius: '50%', background: 'rgba(255,255,255,0.1)', border: '1px solid var(--border-glass)' }} />
            </div>
        </header>
    );
};

export default TopHeader;
