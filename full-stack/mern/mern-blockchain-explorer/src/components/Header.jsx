import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Database, Sun, Moon, ChevronDown, Pickaxe, RefreshCw } from 'lucide-react';
import { useTheme } from '../context/ThemeContext';
import { useBlockchain } from '../context/BlockchainContext';
import { NETWORKS } from '../utils/web3';
import SearchBar from './SearchBar';
import Glossary from './Glossary';

export default function Header() {
    const { theme, toggle } = useTheme();
    const { network, setNetwork, isSimulated, mineBlock, fetchData, loading } = useBlockchain();
    const location = useLocation();

    return (
        <header style={{
            borderBottom: '1px solid var(--border-color)',
            background: 'var(--bg-secondary)',
            position: 'sticky',
            top: 0,
            zIndex: 100,
            backdropFilter: 'blur(12px)',
            WebkitBackdropFilter: 'blur(12px)',
        }}>
            <div className="app-container" style={{
                display: 'flex',
                alignItems: 'center',
                gap: 16,
                height: 64,
                flexWrap: 'wrap',
            }}>
                {/* Logo */}
                <Link
                    to="/"
                    style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: 10,
                        textDecoration: 'none',
                        color: 'inherit',
                        flexShrink: 0,
                    }}
                >
                    <div style={{
                        padding: 8,
                        background: 'var(--accent-blue)',
                        borderRadius: 10,
                        display: 'flex',
                        boxShadow: '0 4px 12px rgba(59,130,246,.3)',
                    }}>
                        <Database size={18} color="#fff" />
                    </div>
                    <span style={{ fontWeight: 800, fontSize: '1.1rem', letterSpacing: '-0.02em' }}>
                        Block<span className="gradient-text">Pulse</span>
                    </span>
                </Link>

                {/* Search */}
                <div style={{ flex: 1, display: 'flex', justifyContent: 'center', minWidth: 200 }}>
                    <SearchBar />
                </div>

                {/* Right controls */}
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexShrink: 0 }}>
                    {/* Network selector */}
                    <div style={{ position: 'relative' }}>
                        <select
                            value={network}
                            onChange={(e) => setNetwork(e.target.value)}
                            className="btn btn-ghost"
                            style={{
                                appearance: 'none',
                                paddingRight: 28,
                                cursor: 'pointer',
                                fontSize: '0.78rem',
                                background: 'var(--bg-card)',
                            }}
                        >
                            {Object.entries(NETWORKS).map(([key, net]) => (
                                <option key={key} value={key}>{net.name}</option>
                            ))}
                        </select>
                        <ChevronDown
                            size={14}
                            style={{
                                position: 'absolute',
                                right: 8,
                                top: '50%',
                                transform: 'translateY(-50%)',
                                pointerEvents: 'none',
                                color: 'var(--text-muted)',
                            }}
                        />
                    </div>

                    {/* Mine block button (simulated only) */}
                    {isSimulated && (
                        <button
                            onClick={mineBlock}
                            className="btn btn-success"
                            style={{ fontSize: '0.78rem', padding: '6px 12px' }}
                            title="Mine a new block"
                        >
                            <Pickaxe size={14} />
                            Mine
                        </button>
                    )}

                    {/* Refresh */}
                    <button
                        onClick={fetchData}
                        className="btn btn-ghost"
                        disabled={loading}
                        style={{ padding: 8 }}
                        title="Refresh data"
                    >
                        <RefreshCw size={15} style={{ transition: 'transform .3s', transform: loading ? 'rotate(360deg)' : 'none' }} />
                    </button>

                    {/* Glossary */}
                    <Glossary />

                    {/* Theme toggle */}
                    <button
                        onClick={toggle}
                        className="btn btn-ghost"
                        style={{ padding: 8 }}
                        title={`Switch to ${theme === 'dark' ? 'light' : 'dark'} mode`}
                    >
                        {theme === 'dark' ? <Sun size={16} /> : <Moon size={16} />}
                    </button>
                </div>
            </div>

            {/* Mobile responsive overflow */}
            <style>{`
        @media (max-width: 768px) {
          header .app-container {
            height: auto !important;
            padding-top: 12px !important;
            padding-bottom: 12px !important;
            flex-direction: column;
            gap: 10px !important;
          }
          header .app-container > div:nth-child(2) {
            width: 100%;
            order: 3;
          }
        }
      `}</style>
        </header>
    );
}
