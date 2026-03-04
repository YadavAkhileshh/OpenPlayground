import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Terminal as TerminalIcon, Play, Save, Trash2, Command } from 'lucide-react';

const CommandCore = () => {
    const [command, setCommand] = useState('');
    const [history, setHistory] = useState([
        { id: 1, cmd: 'nexus status', output: 'System Optimal. 12 clusters active.', time: '10:45 AM' },
        { id: 2, cmd: 'nexus deploy --edge', output: 'Deploying to edge nodes... Done.', time: '11:02 AM' }
    ]);

    const handleRun = () => {
        if (!command) return;
        const cmd = command.toLowerCase().trim();
        let output = '';

        switch (cmd) {
            case 'clear':
                setHistory([]);
                setCommand('');
                return;
            case 'help':
                output = 'Available commands: help, clear, status, scan, whoami, version';
                break;
            case 'status':
                output = 'System: Optimal | Nodes: 12 Active | Latency: 14ms';
                break;
            case 'scan':
                output = 'Scanning network assets... [||||||||||] 100% complete. No threats detected.';
                break;
            case 'whoami':
                output = 'User: Operator Vishnu | Access Level: 4 | Workspace: Nexus-Alpha';
                break;
            case 'version':
                output = 'Nexus-Terminal v1.0.4 (stable-build-774)';
                break;
            default:
                output = `Command not found: ${cmd}. Type 'help' for available commands.`;
        }

        setHistory([{
            id: Date.now(),
            cmd: command,
            output: output,
            time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        }, ...history]);
        setCommand('');
    };

    return (
        <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            style={{ display: 'flex', flexDirection: 'column', gap: '2rem', height: 'calc(100vh - 12rem)' }}
        >
            <header>
                <h1 style={{ fontSize: '2.5rem' }}>Command <span className="text-gradient">Core</span></h1>
                <p style={{ color: 'hsla(var(--text-secondary))', marginTop: '0.5rem' }}>Unified terminal for cloud orchestration.</p>
            </header>

            <div className="glass-pane" style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
                <div style={{ padding: '1rem', borderBottom: '1px solid var(--border-glass)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: 'rgba(0,0,0,0.2)' }}>
                    <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center', fontSize: '0.85rem' }}>
                        <TerminalIcon size={16} className="text-gradient" />
                        <span style={{ opacity: 0.6 }}>nexus-terminal-v1.0.4</span>
                    </div>
                    <div style={{ display: 'flex', gap: '1rem' }}>
                        <Save size={16} style={{ cursor: 'pointer', opacity: 0.5 }} />
                        <Trash2 size={16} style={{ cursor: 'pointer', opacity: 0.5 }} onClick={() => setHistory([])} />
                    </div>
                </div>

                <div style={{ flex: 1, padding: '1.5rem', overflowY: 'auto', fontFamily: 'monospace', display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                    {history.map(item => (
                        <div key={item.id} style={{ fontSize: '0.95rem' }}>
                            <div style={{ color: 'hsl(var(--accent-cyan))', display: 'flex', gap: '0.5rem', marginBottom: '0.25rem' }}>
                                <span>&gt;</span>
                                <span style={{ fontWeight: '600' }}>{item.cmd}</span>
                                <span style={{ marginLeft: 'auto', opacity: 0.3, fontSize: '0.75rem' }}>{item.time}</span>
                            </div>
                            <div style={{ color: 'white', opacity: 0.8, paddingLeft: '1.25rem' }}>
                                {item.output}
                            </div>
                        </div>
                    ))}
                </div>

                <div style={{ padding: '1.5rem', background: 'rgba(0,0,0,0.3)', display: 'flex', gap: '1rem', alignItems: 'center' }}>
                    <div style={{ flex: 1, display: 'flex', alignItems: 'center', gap: '1rem', background: 'rgba(255,255,255,0.03)', padding: '0.75rem 1rem', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border-glass)' }}>
                        <Command size={18} opacity={0.4} />
                        <input
                            type="text"
                            placeholder="Type a command..."
                            value={command}
                            onChange={(e) => setCommand(e.target.value)}
                            onKeyDown={(e) => e.key === 'Enter' && handleRun()}
                            style={{ background: 'transparent', border: 'none', color: 'white', outline: 'none', width: '100%', fontSize: '1rem', fontFamily: 'monospace' }}
                        />
                    </div>
                    <button className="primary" onClick={handleRun} style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
                        <Play size={16} fill="black" /> RUN
                    </button>
                </div>
            </div>
        </motion.div>
    );
};

export default CommandCore;
