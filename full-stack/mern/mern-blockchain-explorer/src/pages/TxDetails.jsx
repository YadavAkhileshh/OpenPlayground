import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowLeft, CheckCircle, XCircle } from 'lucide-react';
import { useBlockchain } from '../context/BlockchainContext';
import { formatEther, formatGwei } from '../utils/web3';
import InfoTip from '../components/InfoTip';

export default function TxDetails() {
    const { hash } = useParams();
    const { getTransaction } = useBlockchain();
    const [tx, setTx] = useState(null);
    const [receipt, setReceipt] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        (async () => {
            setLoading(true);
            const result = await getTransaction(hash);
            setTx(result.tx);
            setReceipt(result.receipt);
            setLoading(false);
        })();
    }, [hash, getTransaction]);

    if (loading) {
        return (
            <div className="app-container" style={{ paddingTop: 28 }}>
                <div className="card" style={{ padding: 32 }}>
                    {Array.from({ length: 8 }).map((_, i) => (
                        <div key={i} style={{ marginBottom: 16 }}>
                            <div className="skeleton" style={{ height: 14, width: '25%', marginBottom: 6 }} />
                            <div className="skeleton" style={{ height: 18, width: '70%' }} />
                        </div>
                    ))}
                </div>
            </div>
        );
    }

    if (!tx) {
        return (
            <div className="app-container" style={{ paddingTop: 28 }}>
                <div className="card" style={{ padding: 40, textAlign: 'center' }}>
                    <h2 style={{ fontSize: '1.2rem', fontWeight: 700, marginBottom: 8 }}>Transaction Not Found</h2>
                    <p style={{ color: 'var(--text-muted)', marginBottom: 16 }}>
                        We couldn't find this transaction. It may not exist on this network.
                    </p>
                    <Link to="/" className="btn btn-primary">← Back to Dashboard</Link>
                </div>
            </div>
        );
    }

    const status = receipt ? Number(receipt.status) : null;
    const gasUsed = receipt ? receipt.gasUsed : tx.gas;
    const txFee = gasUsed && tx.gasPrice
        ? (Number(gasUsed) * Number(tx.gasPrice)) / 1e18
        : null;

    const fields = [
        { label: 'Transaction Hash', value: tx.hash, mono: true, field: 'txHash' },
        {
            label: 'Status',
            field: 'txStatus',
            custom: status !== null ? (
                status === 1 ? (
                    <span className="badge badge-green" style={{ fontSize: '0.78rem' }}>
                        <CheckCircle size={12} /> Success
                    </span>
                ) : (
                    <span className="badge badge-red" style={{ fontSize: '0.78rem' }}>
                        <XCircle size={12} /> Failed
                    </span>
                )
            ) : (
                <span className="badge badge-amber">Pending</span>
            ),
        },
        {
            label: 'Block',
            value: tx.blockNumber?.toString() || 'Pending',
            link: tx.blockNumber ? `/block/${tx.blockNumber.toString()}` : null,
            field: 'blockNumber',
        },
        { label: 'From', value: tx.from, mono: true, addressLink: true, field: 'from' },
        { label: 'To', value: tx.to || 'Contract Creation', mono: !!tx.to, addressLink: !!tx.to, isContract: !tx.to, field: 'to' },
        { label: 'Value', value: `${formatEther(tx.value)} ETH`, field: 'txValue' },
        { label: 'Gas Price', value: `${Number(formatGwei(tx.gasPrice)).toFixed(2)} Gwei`, field: 'gasPrice' },
        { label: 'Gas Used', value: gasUsed ? Number(gasUsed).toLocaleString() : '—', field: 'gasUsed' },
        { label: 'Transaction Fee', value: txFee !== null ? `${txFee.toFixed(8)} ETH` : '—', field: 'txFee' },
        { label: 'Nonce', value: tx.nonce?.toString() || '—', field: 'nonce' },
    ];

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
                    <h1 style={{ fontWeight: 800, fontSize: '1.3rem' }}>Transaction Details</h1>
                </div>

                {/* Tx Info */}
                <div className="card" style={{ padding: 0, marginBottom: 24 }}>
                    {fields.map((f, i) => (
                        <div key={i} style={{
                            display: 'flex',
                            flexWrap: 'wrap',
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
                                {f.custom ? f.custom : f.addressLink ? (
                                    <Link to={`/address/${f.value}`} style={{ color: 'var(--accent-blue)' }}>
                                        {f.value}
                                    </Link>
                                ) : f.link ? (
                                    <Link to={f.link} style={{ color: 'var(--accent-blue)' }}>
                                        {f.value}
                                    </Link>
                                ) : f.isContract ? (
                                    <span>
                                        {f.value}
                                        <span className="badge badge-amber" style={{ marginLeft: 8 }}>Contract Creation</span>
                                    </span>
                                ) : (
                                    f.value
                                )}
                            </div>
                        </div>
                    ))}
                </div>

                {/* Input Data */}
                {tx.input && tx.input !== '0x' && (
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
                            Input Data
                            <InfoTip field="inputData" />
                        </div>
                        <div style={{
                            padding: 20,
                            fontFamily: 'var(--font-mono)',
                            fontSize: '0.75rem',
                            color: 'var(--text-secondary)',
                            wordBreak: 'break-all',
                            maxHeight: 200,
                            overflow: 'auto',
                            background: 'var(--bg-input)',
                            margin: 12,
                            borderRadius: 'var(--radius)',
                            lineHeight: 1.6,
                        }}>
                            {tx.input}
                        </div>
                    </div>
                )}
            </motion.div>
        </div>
    );
}
