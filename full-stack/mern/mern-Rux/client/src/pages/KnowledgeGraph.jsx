import React, { useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import { Layers, Share2, ZoomIn, ZoomOut, Maximize } from 'lucide-react';

const KnowledgeGraph = () => {
    const canvasRef = useRef(null);

    useEffect(() => {
        const ctx = canvasRef.current.getContext('2d');
        let animationFrameId;

        const nodes = [
            { id: 1, x: 100, y: 100, vx: Math.random() * 0.2 - 0.1, vy: Math.random() * 0.2 - 0.1, label: 'Auth-Service', color: 'var(--accent-cyan)' },
            { id: 2, x: 300, y: 150, vx: Math.random() * 0.2 - 0.1, vy: Math.random() * 0.2 - 0.1, label: 'User-DB', color: 'var(--accent-blue)' },
            { id: 3, x: 200, y: 300, vx: Math.random() * 0.2 - 0.1, vy: Math.random() * 0.2 - 0.1, label: 'Cache-Layer', color: 'var(--accent-purple)' },
            { id: 4, x: 500, y: 250, vx: Math.random() * 0.2 - 0.1, vy: Math.random() * 0.2 - 0.1, label: 'API-Gateway', color: 'var(--accent-cyan)' },
            { id: 5, x: 450, y: 400, vx: Math.random() * 0.2 - 0.1, vy: Math.random() * 0.2 - 0.1, label: 'CDN-Edge', color: 'var(--accent-blue)' },
        ];

        const connections = [
            [1, 2], [1, 3], [4, 1], [4, 2], [3, 5], [2, 5]
        ];

        const render = () => {
            if (!canvasRef.current) return;
            ctx.clearRect(0, 0, canvasRef.current.width, canvasRef.current.height);

            // Update nodes
            nodes.forEach(node => {
                node.x += node.vx;
                node.y += node.vy;

                if (node.x < 50 || node.x > 950) node.vx *= -1;
                if (node.y < 50 || node.y > 550) node.vy *= -1;
            });

            // Draw connections
            ctx.strokeStyle = 'rgba(255, 255, 255, 0.1)';
            ctx.lineWidth = 1;
            connections.forEach(([sId, eId]) => {
                const s = nodes.find(n => n.id === sId);
                const e = nodes.find(n => n.id === eId);
                ctx.beginPath();
                ctx.moveTo(s.x, s.y);
                ctx.lineTo(e.x, e.y);
                ctx.stroke();
            });

            // Draw nodes
            nodes.forEach(node => {
                ctx.beginPath();
                ctx.arc(node.x, node.y, 6, 0, Math.PI * 2);
                ctx.shadowBlur = 15;
                const hColor = node.color === 'var(--accent-cyan)' ? '180, 100%, 50%' : node.color === 'var(--accent-blue)' ? '210, 100%, 60%' : '270, 100%, 60%';
                ctx.shadowColor = `hsl(${hColor})`;
                ctx.fillStyle = `hsl(${hColor})`;
                ctx.fill();

                ctx.shadowBlur = 0;
                ctx.fillStyle = 'rgba(255,255,255,0.7)';
                ctx.font = '12px Inter';
                ctx.fillText(node.label, node.x + 15, node.y + 5);
            });

            animationFrameId = requestAnimationFrame(render);
        };

        render();
        return () => cancelAnimationFrame(animationFrameId);
    }, []);

    return (
        <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            style={{ display: 'flex', flexDirection: 'column', gap: '2rem', height: '100%' }}
        >
            <header style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div>
                    <h1 style={{ fontSize: '2.5rem' }}>Knowledge <span className="text-gradient">Graph</span></h1>
                    <p style={{ color: 'hsla(var(--text-secondary))', marginTop: '0.5rem' }}>Visual dependency and architecture mapping.</p>
                </div>
                <div style={{ display: 'flex', gap: '1rem' }}>
                    <button style={{ padding: '0.5rem 1rem', display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
                        <Share2 size={16} /> Export
                    </button>
                    <button className="primary">Re-scan Architecture</button>
                </div>
            </header>

            <div className="glass-pane" style={{ flex: 1, position: 'relative', overflow: 'hidden', background: 'rgba(0,0,0,0.4)' }}>
                <canvas
                    ref={canvasRef}
                    width={1000}
                    height={600}
                    style={{ width: '100%', height: '100%' }}
                />

                {/* Graph Controls */}
                <div style={{ position: 'absolute', bottom: '2rem', right: '2rem', display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                    <div className="glass-pane" style={{ padding: '0.5rem', display: 'flex', flexDirection: 'column', gap: '0.5rem', borderRadius: 'var(--radius-sm)' }}>
                        <button style={{ padding: '0.5rem', border: 'none', background: 'transparent' }}><ZoomIn size={18} /></button>
                        <button style={{ padding: '0.5rem', border: 'none', background: 'transparent' }}><ZoomOut size={18} /></button>
                        <div style={{ width: '100%', height: '1px', background: 'var(--border-glass)' }} />
                        <button style={{ padding: '0.5rem', border: 'none', background: 'transparent' }}><Maximize size={18} /></button>
                    </div>
                </div>

                {/* Legend */}
                <div style={{ position: 'absolute', top: '2rem', left: '2rem' }}>
                    <div className="glass-card" style={{ padding: '1rem', background: 'rgba(0,0,0,0.5)' }}>
                        <h4 style={{ marginBottom: '0.75rem', fontSize: '0.85rem', opacity: 0.6 }}>LEGEND</h4>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                            <LegendItem color="var(--accent-cyan)" label="Service" />
                            <LegendItem color="var(--accent-blue)" label="Storage" />
                            <LegendItem color="var(--accent-purple)" label="Utility" />
                        </div>
                    </div>
                </div>
            </div>
        </motion.div>
    );
};

const LegendItem = ({ color, label }) => (
    <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', fontSize: '0.85rem' }}>
        <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: `hsl(${color === 'var(--accent-cyan)' ? '180, 100%, 50%' : color === 'var(--accent-blue)' ? '210, 100%, 60%' : '270, 100%, 60%'})` }} />
        <span>{label}</span>
    </div>
);

export default KnowledgeGraph;
