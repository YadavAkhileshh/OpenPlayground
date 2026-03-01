import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { BarChart3, TrendingUp, Users, Globe, Download, Calendar } from 'lucide-react';

const Analytics = () => {
    return (
        <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}
        >
            <header style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div>
                    <h1 style={{ fontSize: '2.5rem' }}>Business <span className="text-gradient">Analytics</span></h1>
                    <p style={{ color: 'hsla(var(--text-secondary))', marginTop: '0.5rem' }}>Cross-platform performance and user growth metrics.</p>
                </div>
                <div style={{ display: 'flex', gap: '1rem' }}>
                    <button style={{ padding: '0.5rem 1rem', display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
                        <Calendar size={16} /> Last 30 Days
                    </button>
                    <button className="primary" style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
                        <Download size={16} /> Export Data
                    </button>
                </div>
            </header>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '1.5rem' }}>
                <AnalyticCard icon={<TrendingUp size={20} color="#00ff7f" />} label="Total Revenue" value="$242,500" change="+12.5%" />
                <AnalyticCard icon={<Users size={20} color="hsl(var(--accent-cyan))" />} label="Active Operators" value="8,402" change="+3.2%" />
                <AnalyticCard icon={<Globe size={20} color="hsl(var(--accent-blue))" />} label="Global Reach" value="42 Countries" change="Static" />
                <AnalyticCard icon={<BarChart3 size={20} color="hsl(var(--accent-purple))" />} label="API Calls" value="1.2M / day" change="+18%" />
            </div>

            <div className="glass-pane" style={{ padding: '2rem', height: '400px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <div style={{ textAlign: 'center', opacity: 0.5 }}>
                    <BarChart3 size={48} style={{ marginBottom: '1rem', margin: '0 auto' }} />
                    <p>Real-time Charting Engine Initializing...</p>
                    <div style={{ marginTop: '2rem', display: 'flex', gap: '1rem', justifyContent: 'center' }}>
                        {[40, 70, 45, 90, 65, 80, 55].map((h, i) => (
                            <motion.div
                                key={i}
                                initial={{ height: 0 }}
                                animate={{ height: h }}
                                transition={{ delay: i * 0.1, duration: 1 }}
                                style={{ width: '30px', background: 'linear-gradient(to top, hsla(var(--accent-blue) / 0.5), hsl(var(--accent-cyan)))', borderRadius: '4px 4px 0 0' }}
                            />
                        ))}
                    </div>
                </div>
            </div>
        </motion.div>
    );
};

const AnalyticCard = ({ icon, label, value, change }) => (
    <div className="glass-card">
        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1rem' }}>
            {icon}
            <span style={{ fontSize: '0.75rem', color: change.startsWith('+') ? '#00ff7f' : 'inherit', opacity: 0.8 }}>{change}</span>
        </div>
        <p style={{ fontSize: '0.85rem', opacity: 0.6, marginBottom: '0.25rem' }}>{label}</p>
        <h2 style={{ fontSize: '1.75rem' }}>{value}</h2>
    </div>
);

export default Analytics;
