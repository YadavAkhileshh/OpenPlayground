import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Activity, Zap } from 'lucide-react';
import { fetchSystemHealth, fetchActivityFeed } from '../api';

const SystemHealth = () => {
    const [healthData, setHealthData] = useState(null);
    const [activities, setActivities] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchData = async () => {
            const [health, activity] = await Promise.all([
                fetchSystemHealth(),
                fetchActivityFeed()
            ]);
            if (health) setHealthData(health);
            if (activity) setActivities(activity);
            setLoading(false);
        };
        fetchData();
        const interval = setInterval(fetchData, 5000);
        return () => clearInterval(interval);
    }, []);

    return (
        <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}
        >
            <header>
                <h1 style={{ fontSize: '2.5rem' }}>System <span className="text-gradient">Health</span></h1>
                <p style={{ color: 'hsla(var(--text-secondary))', marginTop: '0.5rem' }}>Real-time infrastructure and service monitoring.</p>
            </header>

            <div className="dashboard-grid" style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(350px, 1fr))',
                gap: '1.5rem'
            }}>
                <div className="glass-card">
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1.5rem' }}>
                        <h3 style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                            <Activity size={20} className="text-gradient" /> Metrics
                        </h3>
                    </div>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                        <StatusStat label="Status" value={healthData?.status || 'Searching...'} color={healthData ? '#00ff7f' : '#ffaa00'} />
                        <StatusStat label="Latency" value={healthData?.latency || '---'} color="hsl(var(--accent-cyan))" />
                        <StatusStat label="Uptime" value={healthData ? `${Math.floor(healthData.uptime)}s` : '---'} color="hsl(var(--accent-blue))" />
                        <StatusStat label="Clusters" value="12 Active" color="hsl(var(--accent-purple))" />
                    </div>
                </div>

                <div className="glass-card">
                    <h3 style={{ marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                        <Zap size={20} style={{ color: '#ffcc00' }} /> Incident Activity
                    </h3>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                        {activities.map(activity => (
                            <div key={activity.id} style={{
                                display: 'flex',
                                gap: '1rem',
                                padding: '1rem',
                                background: 'rgba(255,255,255,0.03)',
                                borderRadius: 'var(--radius-sm)',
                                borderLeft: activity.type === 'ALERT' ? '3px solid #ff4444' : '3px solid hsl(var(--accent-cyan))'
                            }}>
                                <div style={{ flex: 1 }}>
                                    <p style={{ fontSize: '0.9rem', fontWeight: '500' }}>{activity.message}</p>
                                    <p style={{ fontSize: '0.75rem', opacity: 0.5, marginTop: '0.25rem' }}>{activity.time} • {activity.type}</p>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </motion.div>
    );
};

const StatusStat = ({ label, value, color }) => (
    <div style={{ padding: '1rem', background: 'rgba(255,255,255,0.02)', borderRadius: 'var(--radius-sm)' }}>
        <p style={{ fontSize: '0.75rem', opacity: 0.5, marginBottom: '0.25rem' }}>{label.toUpperCase()}</p>
        <p style={{ fontSize: '1.1rem', fontWeight: '600', color: color }}>{value}</p>
    </div>
);

export default SystemHealth;
