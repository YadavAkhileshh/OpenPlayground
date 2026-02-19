import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowLeft, Hash, Clock, Fuel, User, ArrowUpRight } from 'lucide-react';
import { useBlockchain } from '../context/BlockchainContext';
import { formatAddress, formatEther, formatGwei } from '../utils/web3';
import { formatDistanceToNow } from 'date-fns';
import InfoTip from '../components/InfoTip';

export default function BlockDetails() {
    const { id } = useParams();
    const { getBlock } = useBlockchain();
    const [block, setBlock] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        (async () => {
            setLoading(true);
            const b = await getBlock(id);
            setBlock(b);
            setLoading(false);
        })();
    }, [id, getBlock]);

    if (loading) {
        return (
            <div className="app-container" style={{ paddingTop: 28 }}>
                <div className="card" style={{ padding: 32 }}>
                    {Array.from({ length: 8 }).map((_, i) => (
                        <div key={i} style={{ marginBottom: 16 }}>
                            <div className="skeleton" style={{ height: 14, width: '25%', marginBottom: 6 }} />
                            <div className="skeleton" style={{ height: 18, width: '60%' }} />
                        </div>
                    ))}
                </div>
            </div>
        );
    }

    if (!block) {
        return (
            <div className="app-container" style={{ paddingTop: 28 }}>
                <div className="card" style={{ padding: 40, textAlign: 'center' }}>
                    <h2 style={{ fontSize: '1.2rem', fontWeight: 700, marginBottom: 8 }}>Block Not Found</h2>
                    <p style={{ color: 'var(--text-muted)', marginBottom: 16 }}>
                        We couldn't find block "{id}". It may not exist on this network.
                    </p>
                    <Link to="/" className="btn btn-primary">← Back to Dashboard</Link>
                </div>
            </div>
        );
    }

    const gasPercent = block.gasLimit > 0
        ? ((Number(block.gasUsed) / Number(block.gasLimit)) * 100).toFixed(1)
        : 0;

    const fields = [
        { label: 'Block Height', value: block.number.toString(), field: 'blockNumber' },
        { label: 'Hash', value: block.hash, mono: true, field: 'hash' },
        { label: 'Parent Hash', value: block.parentHash, mono: true, link: block.parentHash !== '0x0000000000000000000000000000000000000000000000000000000000000000', field: 'parentHash' },
        { label: 'Timestamp', value: `${new Date(Number(block.timestamp) * 1000).toLocaleString()} (${formatDistanceToNow(new Date(Number(block.timestamp) * 1000))} ago)`, field: 'timestamp' },
        { label: 'Fee Recipient', value: block.miner, mono: true, addressLink: true, field: 'miner' },
        { label: 'Transactions', value: `${Array.isArray(block.transactions) ? block.transactions.length : 0} transactions`, field: 'block' },
        { label: 'Gas Used', value: `${Number(block.gasUsed).toLocaleString()} (${gasPercent}%)`, field: 'gasUsed', showBar: true },
        { label: 'Gas Limit', value: Number(block.gasLimit).toLocaleString(), field: 'gasLimit' },
    ];

    const transactions = Array.isArray(block.transactions)
        ? block.transactions.filter(tx => typeof tx === 'object')
        : [];

    return (
        <div className="app-container" style={{ paddingTop: 28, paddingBottom: 40 }}>
            <motion.div
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3 }}
            >
                {/* Header */}
                <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 20 }}>
                    <Link to="/" className="btn btn-ghost" style={{ padding: 8 }}>
                        <ArrowLeft size={18} />
                    </Link>
                    <div>
                        <h1 style={{ fontWeight: 800, fontSize: '1.3rem' }}>
                            Block <span style={{ color: 'var(--accent-blue)' }}>#{block.number.toString()}</span>
                        </h1>
                    </div>
                </div>

                {/* Block Info */}
                <div className="card" style={{ padding: 0, marginBottom: 24 }}>
                    {fields.map((f, i) => (
                        <div key={i} style={{
                            display: 'flex',
                            flexDirection: window.innerWidth < 768 ? 'column' : 'row',
                            padding: '14px 20px',
                            borderBottom: i < fields.length - 1 ? '1px solid var(--border-color)' : 'none',
                            gap: 8,
                        }}>
                            <div style={{
                                width: 180,
                                flexShrink: 0,
                                color: 'var(--text-muted)',
                                fontSize: '0.82rem',
                                fontWeight: 500,
                                display: 'flex',
                                alignItems: 'center',
                                gap: 4,
                            }}>
                                {f.label}
                                <InfoTip field={f.field} />
                            </div>
                            <div style={{
                                flex: 1,
                                fontSize: '0.88rem',
                                wordBreak: 'break-all',
                                fontFamily: f.mono ? 'var(--font-mono)' : 'inherit',
                            }}>
                                {f.addressLink ? (
                                    <Link to={`/address/${f.value}`} style={{ color: 'var(--accent-blue)' }}>
                                        {f.value}
                                    </Link>
                                ) : f.link ? (
                                    <Link to={`/block/${f.value}`} style={{ color: 'var(--accent-blue)' }}>
                                        {f.value}
                                    </Link>
                                ) : f.value}
                                {f.showBar && (
                                    <div className="progress-bar" style={{ marginTop: 8, maxWidth: 300 }}>
                                        <div className="progress-fill" style={{ width: `${gasPercent}%` }} />
                                    </div>
                                )}
                            </div>
                        </div>
                    ))}
                </div>

                {/* Transactions in this block */}
                {transactions.length > 0 && (
                    <div className="card" style={{ padding: 0 }}>
                        <div style={{
                            padding: '16px 20px',
                            borderBottom: '1px solid var(--border-color)',
                            fontWeight: 700,
                            fontSize: '0.92rem',
                            display: 'flex',
                            alignItems: 'center',
                            gap: 8,
                        }}>
                            <ArrowUpRight size={16} style={{ color: 'var(--accent-purple)' }} />
                            Transactions ({transactions.length})
                        </div>
                        <div style={{ maxHeight: 400, overflow: 'auto' }}>
                            {transactions.slice(0, 50).map((tx) => (
                                <Link
                                    key={tx.hash}
                                    to={`/tx/${tx.hash}`}
                                    style={{
                                        display: 'flex',
                                        justifyContent: 'space-between',
                                        alignItems: 'center',
                                        padding: '10px 20px',
                                        borderBottom: '1px solid var(--border-color)',
                                        textDecoration: 'none',
                                        color: 'inherit',
                                        transition: 'background var(--transition)',
                                    }}
                                    onMouseEnter={(e) => e.currentTarget.style.background = 'var(--bg-card-hover)'}
                                    onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}
                                >
                                    <div style={{ minWidth: 0 }}>
                                        <div className="mono" style={{
                                            fontSize: '0.8rem',
                                            color: 'var(--accent-blue)',
                                            overflow: 'hidden',
                                            textOverflow: 'ellipsis',
                                            whiteSpace: 'nowrap',
                                            maxWidth: 200,
                                        }}>
                                            {tx.hash}
                                        </div>
                                        <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>
                                            {formatAddress(tx.from)} → {formatAddress(tx.to)}
                                        </div>
                                    </div>
                                    <div className="mono" style={{ fontSize: '0.82rem', flexShrink: 0, fontWeight: 500 }}>
                                        {Number(formatEther(tx.value)).toFixed(4)} ETH
                                    </div>
                                </Link>
                            ))}
                        </div>
                    </div>
                )}
            </motion.div>
        </div>
    );
}
