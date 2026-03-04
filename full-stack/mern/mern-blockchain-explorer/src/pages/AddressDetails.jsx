import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowLeft, ArrowDownLeft, ArrowUpRight, Wallet, Filter } from 'lucide-react';
import { useBlockchain } from '../context/BlockchainContext';
import { formatEther, formatAddress } from '../utils/web3';
import InfoTip from '../components/InfoTip';

export default function AddressDetails() {
    const { address } = useParams();
    const { getAddressInfo, isSimulated } = useBlockchain();
    const [info, setInfo] = useState(null);
    const [loading, setLoading] = useState(true);
    const [filter, setFilter] = useState('all'); // all, incoming, outgoing

    useEffect(() => {
        (async () => {
            setLoading(true);
            const result = await getAddressInfo(address);
            setInfo(result);
            setLoading(false);
        })();
    }, [address, getAddressInfo]);

    if (loading) {
        return (
            <div className="app-container" style={{ paddingTop: 28 }}>
                <div className="card" style={{ padding: 32 }}>
                    {Array.from({ length: 4 }).map((_, i) => (
                        <div key={i} style={{ marginBottom: 16 }}>
                            <div className="skeleton" style={{ height: 14, width: '25%', marginBottom: 6 }} />
                            <div className="skeleton" style={{ height: 18, width: '50%' }} />
                        </div>
                    ))}
                </div>
            </div>
        );
    }

    const filteredTxs = (info?.transactions || []).filter(tx => {
        const addr = address.toLowerCase();
        if (filter === 'incoming') return tx.to && tx.to.toLowerCase() === addr;
        if (filter === 'outgoing') return tx.from.toLowerCase() === addr;
        return true;
    });

    const isContract = info?.transactions?.some(tx => tx.to === null && tx.from.toLowerCase() !== address.toLowerCase());

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
                        <h1 style={{ fontWeight: 800, fontSize: '1.3rem' }}>Address</h1>
                        <div className="mono" style={{ fontSize: '0.78rem', color: 'var(--text-muted)', wordBreak: 'break-all' }}>
                            {address}
                        </div>
                    </div>
                </div>

                {/* Stats */}
                <div style={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
                    gap: 16,
                    marginBottom: 24,
                }}>
                    <div className="card" style={{ padding: 20 }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 12 }}>
                            <div style={{ padding: 8, borderRadius: 10, background: 'var(--accent-blue-dim)', display: 'flex' }}>
                                <Wallet size={16} style={{ color: 'var(--accent-blue)' }} />
                            </div>
                            <span style={{ fontSize: '0.78rem', fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase' }}>
                                ETH Balance <InfoTip field="balance" />
                            </span>
                        </div>
                        <div style={{ fontSize: '1.4rem', fontWeight: 700 }}>
                            {info ? Number(formatEther(info.balance)).toFixed(6) : '0'} ETH
                        </div>
                    </div>

                    <div className="card" style={{ padding: 20 }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 12 }}>
                            <div style={{ padding: 8, borderRadius: 10, background: 'var(--accent-purple-dim)', display: 'flex' }}>
                                <ArrowUpRight size={16} style={{ color: 'var(--accent-purple)' }} />
                            </div>
                            <span style={{ fontSize: '0.78rem', fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase' }}>
                                Tx Count <InfoTip field="txCount" />
                            </span>
                        </div>
                        <div style={{ fontSize: '1.4rem', fontWeight: 700 }}>
                            {info ? info.txCount.toString() : '0'}
                        </div>
                    </div>

                    {isContract && (
                        <div className="card" style={{ padding: 20, borderColor: 'var(--accent-amber)' }}>
                            <span className="badge badge-amber">📄 This is a Contract Address</span>
                            <p style={{ fontSize: '0.78rem', color: 'var(--text-muted)', marginTop: 8 }}>
                                This address has smart contract code deployed.
                            </p>
                        </div>
                    )}
                </div>

                {/* Transaction history (simulated mode) */}
                {isSimulated && info?.transactions?.length > 0 && (
                    <div className="card" style={{ padding: 0 }}>
                        <div style={{
                            padding: '16px 20px',
                            borderBottom: '1px solid var(--border-color)',
                            display: 'flex',
                            justifyContent: 'space-between',
                            alignItems: 'center',
                            flexWrap: 'wrap',
                            gap: 10,
                        }}>
                            <span style={{ fontWeight: 700, fontSize: '0.92rem' }}>
                                Transaction History
                            </span>
                            <div style={{ display: 'flex', gap: 6 }}>
                                {['all', 'incoming', 'outgoing'].map(f => (
                                    <button
                                        key={f}
                                        onClick={() => setFilter(f)}
                                        className={`btn ${filter === f ? 'btn-primary' : 'btn-ghost'}`}
                                        style={{ fontSize: '0.72rem', padding: '4px 10px', textTransform: 'capitalize' }}
                                    >
                                        {f === 'incoming' && <ArrowDownLeft size={12} />}
                                        {f === 'outgoing' && <ArrowUpRight size={12} />}
                                        {f === 'all' && <Filter size={12} />}
                                        {f}
                                    </button>
                                ))}
                            </div>
                        </div>
                        <div style={{ maxHeight: 500, overflow: 'auto' }}>
                            {filteredTxs.length === 0 && (
                                <div style={{ padding: 32, textAlign: 'center', color: 'var(--text-muted)' }}>
                                    No {filter !== 'all' ? filter : ''} transactions found.
                                </div>
                            )}
                            {filteredTxs.map(tx => {
                                const isIncoming = tx.to && tx.to.toLowerCase() === address.toLowerCase();
                                return (
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
                                        <div style={{ display: 'flex', alignItems: 'center', gap: 10, minWidth: 0 }}>
                                            <div style={{
                                                padding: 6,
                                                borderRadius: 8,
                                                background: isIncoming ? 'var(--accent-green-dim)' : 'var(--accent-red-dim)',
                                                display: 'flex',
                                            }}>
                                                {isIncoming
                                                    ? <ArrowDownLeft size={14} style={{ color: 'var(--accent-green)' }} />
                                                    : <ArrowUpRight size={14} style={{ color: 'var(--accent-red)' }} />
                                                }
                                            </div>
                                            <div style={{ minWidth: 0 }}>
                                                <div className="mono" style={{
                                                    fontSize: '0.78rem',
                                                    color: 'var(--accent-blue)',
                                                    overflow: 'hidden',
                                                    textOverflow: 'ellipsis',
                                                    whiteSpace: 'nowrap',
                                                    maxWidth: 160,
                                                }}>
                                                    {tx.hash}
                                                </div>
                                                <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>
                                                    {isIncoming ? 'From' : 'To'}: {formatAddress(isIncoming ? tx.from : tx.to)}
                                                </div>
                                            </div>
                                        </div>
                                        <div style={{ textAlign: 'right', flexShrink: 0 }}>
                                            <div style={{
                                                fontSize: '0.82rem',
                                                fontWeight: 600,
                                                color: isIncoming ? 'var(--accent-green)' : 'var(--accent-red)',
                                            }}>
                                                {isIncoming ? '+' : '-'}{Number(formatEther(tx.value)).toFixed(4)} ETH
                                            </div>
                                            <span className={`badge ${isIncoming ? 'badge-green' : 'badge-red'}`} style={{ fontSize: '0.65rem' }}>
                                                {isIncoming ? 'IN' : 'OUT'}
                                            </span>
                                        </div>
                                    </Link>
                                );
                            })}
                        </div>
                    </div>
                )}

                {!isSimulated && (
                    <div className="card" style={{ padding: 32, textAlign: 'center' }}>
                        <p style={{ color: 'var(--text-muted)', fontSize: '0.88rem' }}>
                            💡 Transaction history is available in <strong>Simulated Mode</strong>.
                            For live networks, visit{' '}
                            <a href={`https://etherscan.io/address/${address}`} target="_blank" rel="noopener noreferrer">
                                Etherscan
                            </a>{' '}
                            for full history.
                        </p>
                    </div>
                )}
            </motion.div>
        </div>
    );
}
