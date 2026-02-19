import React, { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, Clock, X } from 'lucide-react';
import { useBlockchain } from '../context/BlockchainContext';

export default function SearchBar() {
    const [query, setQuery] = useState('');
    const [focused, setFocused] = useState(false);
    const [error, setError] = useState('');
    const navigate = useNavigate();
    const { addSearch, recentSearches } = useBlockchain();
    const inputRef = useRef(null);
    const wrapperRef = useRef(null);

    // Close dropdown on outside click
    useEffect(() => {
        const handler = (e) => {
            if (wrapperRef.current && !wrapperRef.current.contains(e.target)) {
                setFocused(false);
            }
        };
        document.addEventListener('mousedown', handler);
        return () => document.removeEventListener('mousedown', handler);
    }, []);

    const handleSearch = (value) => {
        const q = (value || query).trim();
        if (!q) return;
        setError('');

        addSearch(q);

        // Block number
        if (/^\d+$/.test(q)) {
            navigate(`/block/${q}`);
        }
        // Transaction hash (66 chars)
        else if (q.length === 66 && q.startsWith('0x')) {
            navigate(`/tx/${q}`);
        }
        // Address (42 chars)
        else if (q.length === 42 && q.startsWith('0x')) {
            navigate(`/address/${q}`);
        }
        // Block hash? Try as block
        else if (q.startsWith('0x')) {
            navigate(`/tx/${q}`);
        }
        else {
            setError('Invalid input. Enter a block number, tx hash, or address.');
            return;
        }

        setQuery('');
        setFocused(false);
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        handleSearch();
    };

    return (
        <div ref={wrapperRef} style={{ position: 'relative', width: '100%', maxWidth: 540 }}>
            <form onSubmit={handleSubmit} style={{ position: 'relative' }}>
                <Search
                    size={16}
                    style={{
                        position: 'absolute',
                        left: 14,
                        top: '50%',
                        transform: 'translateY(-50%)',
                        color: 'var(--text-muted)',
                        pointerEvents: 'none',
                    }}
                />
                <input
                    ref={inputRef}
                    type="text"
                    placeholder="Search by Address / Tx Hash / Block Number"
                    className="input-field"
                    value={query}
                    onChange={(e) => { setQuery(e.target.value); setError(''); }}
                    onFocus={() => setFocused(true)}
                    style={{ paddingLeft: 40, paddingRight: 80 }}
                />
                <button
                    type="submit"
                    className="btn btn-primary"
                    style={{
                        position: 'absolute',
                        right: 4,
                        top: '50%',
                        transform: 'translateY(-50%)',
                        padding: '5px 14px',
                        fontSize: '0.75rem',
                    }}
                >
                    Search
                </button>
            </form>

            {error && (
                <div style={{
                    marginTop: 6,
                    padding: '6px 12px',
                    borderRadius: 'var(--radius)',
                    background: 'var(--accent-red-dim)',
                    color: 'var(--accent-red)',
                    fontSize: '0.78rem',
                    display: 'flex',
                    alignItems: 'center',
                    gap: 6,
                }}>
                    <X size={14} />
                    {error}
                </div>
            )}

            {focused && recentSearches.length > 0 && !query && (
                <div style={{
                    position: 'absolute',
                    top: 'calc(100% + 4px)',
                    left: 0,
                    right: 0,
                    background: 'var(--bg-secondary)',
                    border: '1px solid var(--border-color)',
                    borderRadius: 'var(--radius)',
                    boxShadow: 'var(--shadow)',
                    zIndex: 50,
                    padding: '8px 0',
                    maxHeight: 300,
                    overflow: 'auto',
                }}>
                    <div style={{
                        padding: '4px 14px 8px',
                        fontSize: '0.72rem',
                        fontWeight: 600,
                        color: 'var(--text-muted)',
                        textTransform: 'uppercase',
                        letterSpacing: '.05em',
                    }}>
                        Recent Searches
                    </div>
                    {recentSearches.map((s, i) => (
                        <button
                            key={i}
                            onClick={() => { setQuery(s); handleSearch(s); }}
                            style={{
                                display: 'flex',
                                alignItems: 'center',
                                gap: 8,
                                width: '100%',
                                padding: '8px 14px',
                                background: 'none',
                                border: 'none',
                                color: 'var(--text-secondary)',
                                fontSize: '0.82rem',
                                fontFamily: 'var(--font-mono)',
                                cursor: 'pointer',
                                textAlign: 'left',
                            }}
                            onMouseEnter={(e) => e.target.style.background = 'var(--bg-card)'}
                            onMouseLeave={(e) => e.target.style.background = 'none'}
                        >
                            <Clock size={12} style={{ opacity: 0.5, flexShrink: 0 }} />
                            <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{s}</span>
                        </button>
                    ))}
                </div>
            )}
        </div>
    );
}
