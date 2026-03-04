import React, { useState } from 'react';
import { BookOpen, X } from 'lucide-react';
import { glossaryList } from '../utils/glossary';
import { motion, AnimatePresence } from 'framer-motion';

export default function Glossary() {
    const [open, setOpen] = useState(false);
    const [search, setSearch] = useState('');

    const filtered = glossaryList.filter(item =>
        item.term.toLowerCase().includes(search.toLowerCase()) ||
        item.definition.toLowerCase().includes(search.toLowerCase())
    );

    return (
        <>
            <button
                onClick={() => setOpen(true)}
                className="btn btn-ghost"
                style={{ gap: 6 }}
                title="Blockchain Glossary"
            >
                <BookOpen size={16} />
                <span style={{ fontSize: '0.78rem' }}>Learn</span>
            </button>

            <AnimatePresence>
                {open && (
                    <>
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            onClick={() => setOpen(false)}
                            style={{
                                position: 'fixed',
                                inset: 0,
                                background: 'rgba(0,0,0,.5)',
                                backdropFilter: 'blur(4px)',
                                zIndex: 999,
                            }}
                        />
                        <motion.div
                            initial={{ x: '100%' }}
                            animate={{ x: 0 }}
                            exit={{ x: '100%' }}
                            transition={{ type: 'spring', damping: 30, stiffness: 300 }}
                            style={{
                                position: 'fixed',
                                top: 0,
                                right: 0,
                                bottom: 0,
                                width: '100%',
                                maxWidth: 400,
                                background: 'var(--bg-secondary)',
                                borderLeft: '1px solid var(--border-color)',
                                zIndex: 1000,
                                display: 'flex',
                                flexDirection: 'column',
                                boxShadow: '-8px 0 32px rgba(0,0,0,.2)',
                            }}
                        >
                            <div style={{
                                padding: '20px 20px 16px',
                                borderBottom: '1px solid var(--border-color)',
                                display: 'flex',
                                justifyContent: 'space-between',
                                alignItems: 'center',
                            }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                                    <BookOpen size={18} style={{ color: 'var(--accent-blue)' }} />
                                    <h2 style={{ fontWeight: 700, fontSize: '1.05rem' }}>Blockchain Glossary</h2>
                                </div>
                                <button
                                    onClick={() => setOpen(false)}
                                    style={{
                                        background: 'none',
                                        border: 'none',
                                        color: 'var(--text-muted)',
                                        cursor: 'pointer',
                                        padding: 4,
                                    }}
                                >
                                    <X size={18} />
                                </button>
                            </div>

                            <div style={{ padding: '12px 20px 0' }}>
                                <input
                                    type="text"
                                    placeholder="Search terms..."
                                    className="input-field"
                                    value={search}
                                    onChange={(e) => setSearch(e.target.value)}
                                    style={{ fontSize: '0.82rem' }}
                                />
                            </div>

                            <div style={{ flex: 1, overflow: 'auto', padding: '12px 20px 20px' }}>
                                {filtered.map((item, i) => (
                                    <div key={i} style={{
                                        padding: '14px 0',
                                        borderBottom: '1px solid var(--border-color)',
                                    }}>
                                        <div style={{
                                            fontWeight: 600,
                                            fontSize: '0.88rem',
                                            color: 'var(--accent-blue)',
                                            marginBottom: 4,
                                        }}>
                                            {item.term}
                                        </div>
                                        <div style={{
                                            fontSize: '0.8rem',
                                            color: 'var(--text-secondary)',
                                            lineHeight: 1.5,
                                        }}>
                                            {item.definition}
                                        </div>
                                    </div>
                                ))}
                                {filtered.length === 0 && (
                                    <div style={{ textAlign: 'center', color: 'var(--text-muted)', paddingTop: 40 }}>
                                        No matching terms found.
                                    </div>
                                )}
                            </div>
                        </motion.div>
                    </>
                )}
            </AnimatePresence>
        </>
    );
}
