import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
    Blocks, Activity, Fuel, Hash, ArrowUpRight, Pickaxe, Zap,
    Send, Plus
} from 'lucide-react';
import { useBlockchain } from '../context/BlockchainContext';
import { formatAddress, formatEther, formatGwei } from '../utils/web3';
import { formatDistanceToNow } from 'date-fns';
import InfoTip from '../components/InfoTip';

const item = {
    hidden: { opacity: 0, y: 12 },
    show: { opacity: 1, y: 0, transition: { duration: 0.3 } },
};

function StatCard({ icon: Icon, iconColor, bg, label, value, sub }) {
    return (
        <motion.div variants={item} className="card" style={{ padding: 20 }}>
            <div style={{ display: 'flex', alignItems: 'flex-start', gap: 14 }}>
                <div style={{
                    padding: 10,
                    borderRadius: 12,
                    background: bg,
                    display: 'flex',
                    flexShrink: 0,
                }}>
                    <Icon size={20} style={{ color: iconColor }} />
                </div>
                <div style={{ minWidth: 0 }}>
                    <div style={{
                        fontSize: '0.75rem',
                        fontWeight: 600,
                        color: 'var(--text-muted)',
                        textTransform: 'uppercase',
                        letterSpacing: '.04em',
                        marginBottom: 4,
                    }}>
                        {label}
                    </div>
                    <div style={{
                        fontSize: '1.3rem',
                        fontWeight: 700,
                        letterSpacing: '-0.02em',
                        lineHeight: 1.2,
                    }}>
                        {value}
                    </div>
                    {sub && (
                        <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: 2 }}>
                            {sub}
                        </div>
                    )}
                </div>
            </div>
        </motion.div>
    );
}

function SimulatorPanel() {
    const { mineBlock, addPendingTx, isSimulated } = useBlockchain();
    const [txFrom, setTxFrom] = useState('');
    const [txTo, setTxTo] = useState('');
    const [txValue, setTxValue] = useState('');
    const [showForm, setShowForm] = useState(false);
    const [status, setStatus] = useState('');

    if (!isSimulated) return null;

    const handleAddTx = () => {
        const val = txValue ? BigInt(Math.floor(parseFloat(txValue) * 1e18)) : undefined;
        addPendingTx(txFrom || undefined, txTo || undefined, val);
        setStatus('Transaction added to pending pool!');
        setTxFrom('');
        setTxTo('');
        setTxValue('');
        setTimeout(() => setStatus(''), 3000);
    };

    const handleMine = () => {
        mineBlock();
        setStatus('New block mined! ⛏️');
        setTimeout(() => setStatus(''), 3000);
    };

    return (
        <motion.div
            variants={item}
            className="card"
            style={{
                padding: 20,
                background: 'var(--accent-green-dim)',
                borderColor: 'var(--accent-green)',
                gridColumn: '1 / -1',
            }}
        >
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12, flexWrap: 'wrap', gap: 10 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <Zap size={18} style={{ color: 'var(--accent-green)' }} />
                    <span style={{ fontWeight: 700, fontSize: '0.92rem' }}>Simulation Control Panel</span>
                    <span className="badge badge-green">Sandbox</span>
                </div>
                <div style={{ display: 'flex', gap: 8 }}>
                    <button onClick={() => setShowForm(!showForm)} className="btn btn-ghost" style={{ fontSize: '0.78rem' }}>
                        <Plus size={14} />
                        {showForm ? 'Hide' : 'New Tx'}
                    </button>
                    <button onClick={handleMine} className="btn btn-success" style={{ fontSize: '0.78rem' }}>
                        <Pickaxe size={14} />
                        Mine Block
                    </button>
                </div>
            </div>

            {status && (
                <div style={{
                    padding: '6px 12px',
                    borderRadius: 'var(--radius)',
                    background: 'var(--accent-green-dim)',
                    color: 'var(--accent-green)',
                    fontSize: '0.82rem',
                    fontWeight: 500,
                    marginBottom: 10,
                }}>
                    {status}
                </div>
            )}

            {showForm && (
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: 10, marginTop: 8 }}>
                    <input className="input-field mono" placeholder="From (optional)" value={txFrom} onChange={(e) => setTxFrom(e.target.value)} style={{ fontSize: '0.78rem' }} />
                    <input className="input-field mono" placeholder="To (optional)" value={txTo} onChange={(e) => setTxTo(e.target.value)} style={{ fontSize: '0.78rem' }} />
                    <input className="input-field" placeholder="Value in ETH (optional)" value={txValue} onChange={(e) => setTxValue(e.target.value)} style={{ fontSize: '0.78rem' }} type="number" step="0.01" />
                    <button onClick={handleAddTx} className="btn btn-primary" style={{ fontSize: '0.78rem' }}>
                        <Send size={14} />
                        Add to Pool
                    </button>
                </div>
            )}

            <p style={{ fontSize: '0.76rem', color: 'var(--text-muted)', marginTop: 8, lineHeight: 1.5 }}>
                You're in simulated mode. Create dummy transactions and mine blocks to see how a blockchain works!
            </p>
        </motion.div>
    );
}

export default function Dashboard() {
    const {
        loading, error, latestBlockNumber, latestBlocks,
        latestTransactions, gasPrice, networkInfo, isSimulated,
    } = useBlockchain();

    const containerAnim = {
        hidden: {},
        show: { transition: { staggerChildren: 0.06 } },
    };

    return (
        <div className="app-container" style={{ paddingTop: 28, paddingBottom: 40 }}>
            <motion.div
                variants={containerAnim}
                initial="hidden"
                animate="show"
                style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: 16, marginBottom: 28 }}
            >
                <StatCard
                    icon={Blocks}
                    iconColor="var(--accent-blue)"
                    bg="var(--accent-blue-dim)"
                    label="Latest Block"
                    value={latestBlockNumber !== null ? latestBlockNumber.toString() : '—'}
                    sub={networkInfo.name}
                />
                <StatCard
                    icon={Fuel}
                    iconColor="var(--accent-purple)"
                    bg="var(--accent-purple-dim)"
                    label="Gas Price"
                    value={gasPrice ? `${Number(formatGwei(gasPrice)).toFixed(1)} Gwei` : '—'}
                />
                <StatCard
                    icon={Activity}
                    iconColor="var(--accent-green)"
                    bg="var(--accent-green-dim)"
                    label="Last Block Txns"
                    value={latestBlocks[0] ? latestBlocks[0].transactions.length.toString() : '—'}
                />
            </motion.div>

            {error && (
                <div className="card" style={{
                    padding: 16,
                    marginBottom: 20,
                    background: 'var(--accent-red-dim)',
                    borderColor: 'var(--accent-red)',
                    color: 'var(--accent-red)',
                    fontSize: '0.85rem',
                }}>
                    ⚠️ {error}. {!isSimulated && 'Try switching to "Simulated Mode" for a guaranteed experience.'}
                </div>
            )}

            <motion.div
                variants={containerAnim}
                initial="hidden"
                animate="show"
                style={{ display: 'grid', gridTemplateColumns: '1fr', gap: 16 }}
            >
                <SimulatorPanel />
            </motion.div>

            <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 450px), 1fr))',
                gap: 20,
                marginTop: isSimulated ? 20 : 0,
            }}>
                {/* Latest Blocks */}
                <motion.div
                    variants={containerAnim}
                    initial="hidden"
                    animate="show"
                    className="card"
                    style={{ padding: 0, overflow: 'hidden' }}
                >
                    <div style={{
                        padding: '16px 20px',
                        borderBottom: '1px solid var(--border-color)',
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                    }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                            <Blocks size={16} style={{ color: 'var(--accent-blue)' }} />
                            <span style={{ fontWeight: 700, fontSize: '0.92rem' }}>Latest Blocks</span>
                            <InfoTip field="block" />
                        </div>
                    </div>
                    <div style={{ maxHeight: 480, overflow: 'auto' }}>
                        {loading && !latestBlocks.length && Array.from({ length: 6 }).map((_, i) => (
                            <div key={i} style={{ padding: '14px 20px', borderBottom: '1px solid var(--border-color)' }}>
                                <div className="skeleton" style={{ height: 16, width: '60%', marginBottom: 6 }} />
                                <div className="skeleton" style={{ height: 12, width: '40%' }} />
                            </div>
                        ))}
                        {latestBlocks.map((block, idx) => (
                            <motion.div key={block.number.toString()} variants={item}>
                                <Link
                                    to={`/block/${block.number.toString()}`}
                                    style={{
                                        display: 'flex',
                                        justifyContent: 'space-between',
                                        alignItems: 'center',
                                        padding: '12px 20px',
                                        borderBottom: '1px solid var(--border-color)',
                                        textDecoration: 'none',
                                        color: 'inherit',
                                        transition: 'background var(--transition)',
                                    }}
                                    onMouseEnter={(e) => e.currentTarget.style.background = 'var(--bg-card-hover)'}
                                    onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}
                                >
                                    <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                                        <div style={{
                                            padding: 8,
                                            borderRadius: 8,
                                            background: 'var(--accent-blue-dim)',
                                            display: 'flex',
                                        }}>
                                            <Hash size={14} style={{ color: 'var(--accent-blue)' }} />
                                        </div>
                                        <div>
                                            <div style={{ fontWeight: 600, fontSize: '0.88rem', color: 'var(--accent-blue)' }}>
                                                {block.number.toString()}
                                            </div>
                                            <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>
                                                {formatDistanceToNow(new Date(Number(block.timestamp) * 1000))} ago
                                            </div>
                                        </div>
                                    </div>
                                    <div style={{ textAlign: 'right' }}>
                                        <div style={{ fontSize: '0.78rem', color: 'var(--text-secondary)' }}>
                                            <span className="mono">{formatAddress(block.miner)}</span>
                                        </div>
                                        <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>
                                            {block.transactions.length} txns
                                        </div>
                                    </div>
                                </Link>
                            </motion.div>
                        ))}
                    </div>
                </motion.div>

                {/* Latest Transactions */}
                <motion.div
                    variants={containerAnim}
                    initial="hidden"
                    animate="show"
                    className="card"
                    style={{ padding: 0, overflow: 'hidden' }}
                >
                    <div style={{
                        padding: '16px 20px',
                        borderBottom: '1px solid var(--border-color)',
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                    }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                            <Activity size={16} style={{ color: 'var(--accent-purple)' }} />
                            <span style={{ fontWeight: 700, fontSize: '0.92rem' }}>Latest Transactions</span>
                        </div>
                    </div>
                    <div style={{ maxHeight: 480, overflow: 'auto' }}>
                        {loading && !latestTransactions.length && Array.from({ length: 6 }).map((_, i) => (
                            <div key={i} style={{ padding: '14px 20px', borderBottom: '1px solid var(--border-color)' }}>
                                <div className="skeleton" style={{ height: 16, width: '70%', marginBottom: 6 }} />
                                <div className="skeleton" style={{ height: 12, width: '50%' }} />
                            </div>
                        ))}
                        {latestTransactions.map((tx) => (
                            <motion.div key={tx.hash} variants={item}>
                                <Link
                                    to={`/tx/${tx.hash}`}
                                    style={{
                                        display: 'flex',
                                        justifyContent: 'space-between',
                                        alignItems: 'center',
                                        padding: '12px 20px',
                                        borderBottom: '1px solid var(--border-color)',
                                        textDecoration: 'none',
                                        color: 'inherit',
                                        transition: 'background var(--transition)',
                                    }}
                                    onMouseEnter={(e) => e.currentTarget.style.background = 'var(--bg-card-hover)'}
                                    onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}
                                >
                                    <div style={{ display: 'flex', alignItems: 'center', gap: 12, minWidth: 0 }}>
                                        <div style={{
                                            padding: 8,
                                            borderRadius: 8,
                                            background: 'var(--accent-purple-dim)',
                                            display: 'flex',
                                            flexShrink: 0,
                                        }}>
                                            <ArrowUpRight size={14} style={{ color: 'var(--accent-purple)' }} />
                                        </div>
                                        <div style={{ minWidth: 0 }}>
                                            <div className="mono" style={{
                                                fontWeight: 500,
                                                fontSize: '0.82rem',
                                                color: 'var(--accent-blue)',
                                                overflow: 'hidden',
                                                textOverflow: 'ellipsis',
                                                whiteSpace: 'nowrap',
                                                maxWidth: 160,
                                            }}>
                                                {tx.hash}
                                            </div>
                                            <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>
                                                {formatAddress(tx.from)} → {formatAddress(tx.to)}
                                            </div>
                                        </div>
                                    </div>
                                    <div style={{
                                        fontWeight: 600,
                                        fontSize: '0.82rem',
                                        flexShrink: 0,
                                        color: 'var(--text-primary)',
                                    }}>
                                        {Number(formatEther(tx.value)).toFixed(4)} ETH
                                    </div>
                                </Link>
                            </motion.div>
                        ))}
                    </div>
                </motion.div>
            </div>
        </div>
    );
}
