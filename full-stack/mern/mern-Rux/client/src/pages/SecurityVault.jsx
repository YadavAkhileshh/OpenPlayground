import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { ShieldCheck, Lock, Eye, EyeOff, Copy, RefreshCw, Key, ShieldAlert } from 'lucide-react';

const SecurityVault = () => {
    const [revealId, setRevealId] = useState(null);
    const [secrets] = useState([
        { id: 1, key: 'AWS_ACCESS_KEY', value: 'AKIA6PV7HI3R7EXAMPLE', lastUsed: '2h ago' },
        { id: 2, key: 'STRIPE_SECRET_KEY', value: 'sk_test_51Mz9VCEvG8EXAMPLE', lastUsed: '5d ago' },
        { id: 3, key: 'DATABASE_URL', value: 'postgresql://admin:nexus_vault_pass@localhost:5432/core', lastUsed: '1h ago' }
    ]);

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}
        >
            <header style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div>
                    <h1 style={{ fontSize: '2.5rem' }}>Security <span className="text-gradient">Vault</span></h1>
                    <p style={{ color: 'hsla(var(--text-secondary))', marginTop: '0.5rem' }}>Confidential environment variables and key management.</p>
                </div>
                <div style={{ display: 'flex', gap: '1rem' }}>
                    <div className="glass-pane" style={{ padding: '0.5rem 1rem', display: 'flex', gap: '0.75rem', alignItems: 'center', fontSize: '0.85rem', color: '#00ff7f', border: '1px solid rgba(0, 255, 127, 0.2)' }}>
                        <ShieldCheck size={16} /> 256-bit AES Encryption Active
                    </div>
                </div>
            </header>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 300px', gap: '1.5rem', alignItems: 'start' }}>
                <div className="glass-pane" style={{ padding: '0' }}>
                    <div style={{ padding: '1.5rem', borderBottom: '1px solid var(--border-glass)', display: 'grid', gridTemplateColumns: '1fr 1fr 150px', fontSize: '0.85rem', opacity: 0.5, letterSpacing: '0.05em' }}>
                        <span>SECRET KEY</span>
                        <span>VALUE</span>
                        <span>LAST ACCESSED</span>
                    </div>
                    {secrets.map(secret => (
                        <div key={secret.id} style={{ padding: '1.5rem', borderBottom: '1px solid var(--border-glass)', display: 'grid', gridTemplateColumns: '1fr 1fr 150px', alignItems: 'center' }}>
                            <span style={{ fontWeight: '600', display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                                <Key size={14} opacity={0.5} /> {secret.key}
                            </span>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', fontFamily: 'monospace', fontSize: '0.9rem' }}>
                                <span style={{ opacity: revealId === secret.id ? 1 : 0.3 }}>
                                    {revealId === secret.id ? secret.value : '••••••••••••••••••••'}
                                </span>
                                {revealId === secret.id ?
                                    <EyeOff size={16} style={{ cursor: 'pointer', opacity: 0.5 }} onClick={() => setRevealId(null)} /> :
                                    <Eye size={16} style={{ cursor: 'pointer', opacity: 0.5 }} onClick={() => setRevealId(secret.id)} />
                                }
                                <Copy size={16} style={{ cursor: 'pointer', opacity: 0.5 }} />
                            </div>
                            <span style={{ fontSize: '0.85rem', opacity: 0.6 }}>{secret.lastUsed}</span>
                        </div>
                    ))}
                    <div style={{ padding: '1.5rem', textAlign: 'center' }}>
                        <button style={{ background: 'transparent', border: '1px dashed var(--border-glass)', width: '100%', padding: '1rem' }}>
                            + Add New Secret
                        </button>
                    </div>
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                    <div className="glass-card" style={{ border: '1px solid rgba(255, 68, 68, 0.2)' }}>
                        <h4 style={{ color: '#ff4444', display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1rem' }}>
                            <ShieldAlert size={18} /> Compliance Alert
                        </h4>
                        <p style={{ fontSize: '0.85rem', opacity: 0.7, lineHeight: '1.6' }}>
                            Detected 2 keys that haven't been rotated in over 90 days. We recommend updating AWS_ACCESS_KEY.
                        </p>
                        <button style={{ marginTop: '1.5rem', width: '100%', background: 'rgba(255, 68, 68, 0.1)', color: '#ff4444', border: '1px solid rgba(255, 68, 68, 0.2)' }}>
                            Fix Compliance Issues
                        </button>
                    </div>

                    <div className="glass-card">
                        <h4 style={{ marginBottom: '1rem' }}>Audit Log</h4>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', fontSize: '0.8rem' }}>
                            <AuditItem user="vishnu" action="revealed" target="AWS_ACCESS_KEY" time="2m ago" />
                            <AuditItem user="sys-admin" action="rotated" target="STRIPE_KEY" time="1h ago" />
                            <AuditItem user="vishnu" action="created" target="DB_URL" time="5h ago" />
                        </div>
                    </div>
                </div>
            </div>
        </motion.div>
    );
};

const AuditItem = ({ user, action, target, time }) => (
    <div style={{ opacity: 0.7 }}>
        <span style={{ fontWeight: '600', color: 'hsl(var(--accent-cyan))' }}>{user}</span> {action} <span style={{ opacity: 1, color: 'white' }}>{target}</span>
        <div style={{ fontSize: '0.7rem', opacity: 0.5, marginTop: '2px' }}>{time}</div>
    </div>
);

export default SecurityVault;
