const { useState, useEffect, useRef, useMemo } = React;

// =============================================
// UTILITIES
// =============================================
const formatTime = (ms) => {
    const totalSeconds = Math.floor(ms / 1000);
    const hours = Math.floor(totalSeconds / 3600);
    const minutes = Math.floor((totalSeconds % 3600) / 60);
    const seconds = totalSeconds % 60;
    const milliseconds = Math.floor((ms % 1000) / 10);

    return {
        h: String(hours).padStart(2, '0'),
        m: String(minutes).padStart(2, '0'),
        s: String(seconds).padStart(2, '0'),
        ms: String(milliseconds).padStart(2, '0')
    };
};

const formatStopwatch = (ms) => {
    const { h, m, s, ms: mil } = formatTime(ms);
    return `${h}:${m}:${s}`;
};

// =============================================
// COMPONENTS
// =============================================

const Sidebar = ({ activeTab, setActiveTab, theme, setTheme }) => (
    <div className="sidebar glass">
        <div className="brand">
            <div style={{
                width: '40px',
                height: '40px',
                background: 'var(--primary)',
                borderRadius: '12px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                boxShadow: '0 8px 16px var(--primary-glow)'
            }}>
                <i className="fas fa-stopwatch" style={{ color: 'white', fontSize: '1.2rem' }}></i>
            </div>
            <span style={{ fontSize: '1.5rem', fontWeight: '800', letterSpacing: '-1px' }}>TimeFlow</span>
        </div>

        <nav style={{ flex: 1 }}>
            <NavItem active={activeTab === 'timer'} icon="fa-stopwatch" label="Timer" onClick={() => setActiveTab('timer')} />
            <NavItem active={activeTab === 'analytics'} icon="fa-chart-pie" label="Analytics" onClick={() => setActiveTab('analytics')} />
            <NavItem active={activeTab === 'projects'} icon="fa-folder-open" label="Projects" onClick={() => setActiveTab('projects')} />
        </nav>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            <div
                className="glass"
                onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
                style={{ padding: '0.75rem', borderRadius: 'var(--radius-md)', cursor: 'pointer', textAlign: 'center' }}
            >
                <i className={`fas fa-${theme === 'dark' ? 'sun' : 'moon'}`}></i>
                <span style={{ marginLeft: '10px' }}>{theme === 'dark' ? 'Light' : 'Dark'} Mode</span>
            </div>

            <div className="glass-highlight" style={{ padding: '1rem', borderRadius: 'var(--radius-md)', textAlign: 'center' }}>
                <p style={{ fontSize: '0.8rem', color: 'var(--text-dim)' }}>Streak: 5 Days 🔥</p>
            </div>
        </div>
    </div>
);

const NavItem = ({ active, icon, label, onClick }) => (
    <div
        className={`nav-item ${active ? 'active' : ''}`}
        onClick={onClick}
        style={{
            padding: '1rem',
            marginBottom: '0.5rem',
            borderRadius: 'var(--radius-md)',
            cursor: 'pointer',
            transition: 'var(--transition)',
            display: 'flex',
            alignItems: 'center',
            gap: '1rem',
            background: active ? 'rgba(99, 102, 241, 0.1)' : 'transparent',
            color: active ? 'var(--primary)' : 'var(--text-dim)'
        }}
    >
        <i className={`fas ${icon}`}></i>
        <span style={{ fontWeight: active ? '600' : '400' }}>{label}</span>
    </div >
);

const MeshBackground = () => (
    <div className="mesh-bg">
        <div className="mesh-circle circle-1"></div>
        <div className="mesh-circle circle-2"></div>
        <div className="mesh-circle circle-3"></div>
    </div>
);

const Timer = ({ onSave, projects, selectedProject, setSelectedProject }) => {
    const [ms, setMs] = useState(0);
    const [isActive, setIsActive] = useState(false);
    const [mode, setMode] = useState('focus'); // focus, pomodoro
    const [sessionNote, setSessionNote] = useState('');
    const [ambientSound, setAmbientSound] = useState('none');
    const [volume, setVolume] = useState(0.5);
    const audioRef = useRef(null);
    const requestRef = useRef();
    const startTimeRef = useRef();

    const sounds = {
        lofi: 'https://assets.mixkit.co/music/preview/mixkit-lofi-night-chill-background-music-1143.mp3',
        rain: 'https://assets.mixkit.co/active_storage/sfx/2358/2358-preview.mp3',
        forest: 'https://assets.mixkit.co/active_storage/sfx/2437/2437-preview.mp3'
    };

    useEffect(() => {
        if (isActive && ambientSound !== 'none') {
            if (!audioRef.current) {
                audioRef.current = new Audio(sounds[ambientSound]);
                audioRef.current.loop = true;
            }
            audioRef.current.src = sounds[ambientSound];
            audioRef.current.volume = volume;
            audioRef.current.play().catch(e => console.log("Audio play blocked"));
        } else {
            audioRef.current?.pause();
        }
    }, [isActive, ambientSound]);

    useEffect(() => {
        if (audioRef.current) audioRef.current.volume = volume;
    }, [volume]);

    const animate = (time) => {
        const now = Date.now();
        const elapsed = now - startTimeRef.current;

        if (mode === 'pomodoro') {
            const target = 25 * 60 * 1000;
            const remaining = target - elapsed;
            if (remaining <= 0) {
                setMs(0);
                setIsActive(false);
                cancelAnimationFrame(requestRef.current);
                onSave(target, selectedProject, sessionNote || 'Pomodoro Session');
                setSessionNote('');
                new Audio('https://assets.mixkit.co/active_storage/sfx/2869/2869-preview.mp3').play();
                alert("Pomodoro Complete! Time for a break.");
                return;
            }
            setMs(remaining);
        } else {
            setMs(elapsed);
        }
        requestRef.current = requestAnimationFrame(animate);
    };

    const toggleTimer = () => {
        if (!isActive) {
            if (mode === 'pomodoro' && ms === 0) {
                startTimeRef.current = Date.now();
            } else if (mode === 'pomodoro') {
                startTimeRef.current = Date.now() - (25 * 60 * 1000 - ms);
            } else {
                startTimeRef.current = Date.now() - ms;
            }
            requestRef.current = requestAnimationFrame(animate);
        } else {
            cancelAnimationFrame(requestRef.current);
        }
        setIsActive(!isActive);
    };

    const handleModeSwitch = (newMode) => {
        resetTimer();
        setMode(newMode);
        if (newMode === 'pomodoro') setMs(25 * 60 * 1000);
        else setMs(0);
    };

    const resetTimer = () => {
        cancelAnimationFrame(requestRef.current);
        setIsActive(false);
        setMs(0);
    };

    const stopAndSave = () => {
        if (ms > 0) {
            onSave(ms, selectedProject, sessionNote || 'Focus Session');
            setSessionNote('');
            resetTimer();
        }
    };

    const timeValues = formatTime(ms);

    return (
        <div className="timer-card glass" style={{ padding: '4rem 2rem' }}>
            <div style={{ position: 'absolute', top: '1.5rem', left: '1.5rem', display: 'flex', gap: '1rem', alignItems: 'center' }}>
                <select
                    className="glass"
                    style={{ background: 'var(--glass-bg)', padding: '0.6rem 1rem', borderRadius: 'var(--radius-md)', color: 'white', border: '1px solid var(--glass-border)', cursor: 'pointer' }}
                    value={selectedProject}
                    onChange={(e) => setSelectedProject(e.target.value)}
                >
                    {projects.map(p => <option key={p.id} value={p.id} style={{ background: 'var(--bg-surface)' }}>{p.name}</option>)}
                </select>

                <div className="glass" style={{ display: 'flex', borderRadius: 'var(--radius-md)', overflow: 'hidden', padding: '2px' }}>
                    <button
                        onClick={() => handleModeSwitch('focus')}
                        className={`btn-mode ${mode === 'focus' ? 'active' : ''}`}
                    >Focus</button>
                    <button
                        onClick={() => handleModeSwitch('pomodoro')}
                        className={`btn-mode ${mode === 'pomodoro' ? 'active' : ''}`}
                    >Pomodoro</button>
                </div>
            </div>

            <div style={{ position: 'absolute', top: '1.5rem', right: '1.5rem', display: 'flex', gap: '1rem', alignItems: 'center' }}>
                <div className="focus-mixer glass" style={{ padding: '0.6rem 1rem', borderRadius: 'var(--radius-md)', display: 'flex', gap: '1rem', alignItems: 'center' }}>
                    <div style={{ display: 'flex', gap: '0.5rem' }}>
                        {Object.keys(sounds).map(s => (
                            <button
                                key={s}
                                onClick={() => setAmbientSound(ambientSound === s ? 'none' : s)}
                                className={`mixer-btn ${ambientSound === s ? 'active' : ''}`}
                                title={s.toUpperCase()}
                            >
                                <i className={`fas fa-${s === 'lofi' ? 'music' : s === 'rain' ? 'cloud-showers-heavy' : 'tree'}`}></i>
                            </button>
                        ))}
                    </div>
                    {ambientSound !== 'none' && (
                        <input
                            type="range"
                            min="0" max="1" step="0.01"
                            value={volume}
                            onChange={(e) => setVolume(e.target.value)}
                            style={{ width: '60px', accentColor: 'var(--primary)' }}
                        />
                    )}
                </div>
            </div>

            <div style={{ marginTop: '2rem' }}>
                <input
                    type="text"
                    placeholder="What are you working on?"
                    value={sessionNote}
                    onChange={(e) => setSessionNote(e.target.value)}
                    className="session-input"
                />
            </div>

            <div className="time-display" style={{ margin: '1rem 0' }}>
                {timeValues.h}:{timeValues.m}:{timeValues.s}
                <span className="time-ms">.{timeValues.ms}</span>
            </div>

            <div className="controls">
                <button className={`btn btn-main ${isActive ? 'active' : ''}`} onClick={toggleTimer}>
                    <i className={`fas ${isActive ? 'fa-pause' : 'fa-play'}`}></i>
                    {isActive ? 'Pause' : 'Start'}
                </button>
                <button className="btn btn-icon" onClick={resetTimer}>
                    <i className="fas fa-rotate-right"></i>
                </button>
                <button className="btn btn-stop" onClick={stopAndSave}>
                    <i className="fas fa-check"></i>
                    Finish
                </button>
            </div>
        </div>
    );
};

const Dashboard = ({ entries, projects }) => {
    useEffect(() => {
        // Calculate last 7 days of activity
        const last7Days = [...Array(7)].map((_, i) => {
            const d = new Date();
            d.setDate(d.getDate() - (6 - i));
            return d.toISOString().split('T')[0];
        });

        const dailyData = last7Days.map(date => {
            const dayEntries = entries.filter(e => e.date.startsWith(date));
            const totalMs = dayEntries.reduce((acc, curr) => acc + curr.duration, 0);
            return Math.round(totalMs / 60000); // Minutes
        });

        // Area Chart - Trends
        const areaOptions = {
            series: [{
                name: 'Minutes',
                data: dailyData
            }],
            chart: {
                height: 300,
                type: 'area',
                toolbar: { show: false },
                background: 'transparent',
                foreColor: '#94a3b8',
                animations: { enabled: true }
            },
            colors: ['#6366f1'],
            stroke: { curve: 'smooth', width: 3 },
            fill: {
                type: 'gradient',
                gradient: { shadeIntensity: 1, opacityFrom: 0.5, opacityTo: 0.1 }
            },
            xaxis: {
                categories: last7Days.map(d => {
                    const days = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
                    return days[new Date(d).getDay()];
                })
            },
            grid: { borderColor: 'rgba(255,255,255,0.05)' }
        };

        // Pie Chart - Projects
        const projectData = projects.map(p => {
            const time = entries.filter(e => e.projectId === p.id).reduce((acc, curr) => acc + curr.duration, 0);
            return Math.round(time / 60000); // Minutes
        });

        const pieOptions = {
            series: projectData.length > 0 ? projectData : [1],
            labels: projectData.length > 0 ? projects.map(p => p.name) : ['No Data'],
            chart: { type: 'donut', height: 300 },
            colors: projectData.length > 0 ? projects.map(p => p.color) : ['#334155'],
            stroke: { show: false },
            legend: { position: 'bottom', labels: { colors: '#94a3b8' } },
            plotOptions: {
                pie: {
                    donut: {
                        size: '75%',
                        labels: {
                            show: true,
                            total: {
                                show: true,
                                label: 'Total Min',
                                color: '#f8fafc',
                                formatter: () => projectData.reduce((a, b) => a + b, 0)
                            }
                        }
                    }
                }
            }
        };

        const areaChart = new ApexCharts(document.querySelector("#area-chart"), areaOptions);
        const pieChart = new ApexCharts(document.querySelector("#pie-chart"), pieOptions);

        areaChart.render();
        pieChart.render();

        return () => { areaChart.destroy(); pieChart.destroy(); };
    }, [entries, projects]);

    const calculateStreak = () => {
        if (entries.length === 0) return 0;
        const dates = [...new Set(entries.map(e => e.date.split('T')[0]))].sort().reverse();
        let streak = 0;
        let today = new Date().toISOString().split('T')[0];
        let yesterday = new Date();
        yesterday.setDate(yesterday.getDate() - 1);
        yesterday = yesterday.toISOString().split('T')[0];

        if (dates[0] !== today && dates[0] !== yesterday) return 0;

        let current = new Date(dates[0]);
        for (let i = 0; i < dates.length; i++) {
            const d = new Date(dates[i]);
            const diff = (current - d) / (1000 * 60 * 60 * 24);
            if (diff <= 1) {
                streak++;
                current = d;
            } else break;
        }
        return streak;
    };

    const totalTime = entries.reduce((acc, curr) => acc + curr.duration, 0);
    const streak = calculateStreak();

    return (
        <div style={{ marginTop: '1rem' }}>
            <div className="dashboard-grid">
                <div className="stat-card glass animate-fade">
                    <div className="stat-icon" style={{ color: 'var(--primary)', boxShadow: '0 0 20px var(--primary-glow)' }}>
                        <i className="fas fa-bolt"></i>
                    </div>
                    <div className="stat-info">
                        <p>Total Focus</p>
                        <h3>{formatStopwatch(totalTime)}</h3>
                    </div>
                </div>
                <div className="stat-card glass animate-fade" style={{ animationDelay: '0.1s' }}>
                    <div className="stat-icon" style={{ color: 'var(--success)', boxShadow: '0 0 20px rgba(16, 185, 129, 0.2)' }}>
                        <i className="fas fa-check-double"></i>
                    </div>
                    <div className="stat-info">
                        <p>Sessions</p>
                        <h3>{entries.length}</h3>
                    </div>
                </div>
                <div className="stat-card glass animate-fade" style={{ animationDelay: '0.2s' }}>
                    <div className="stat-icon" style={{ color: 'var(--accent)', boxShadow: '0 0 20px var(--accent-glow)' }}>
                        <i className="fas fa-fire"></i>
                    </div>
                    <div className="stat-info">
                        <p>Focus Streak</p>
                        <h3>{streak} {streak === 1 ? 'Day' : 'Days'}</h3>
                    </div>
                </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(400px, 1fr))', gap: '1.5rem', marginTop: '1.5rem' }}>
                <div className="glass animate-fade" style={{ padding: '2rem', animationDelay: '0.3s' }}>
                    <h3 style={{ marginBottom: '1.5rem' }}>Productivity Trends</h3>
                    <div id="area-chart"></div>
                </div>
                <div className="glass animate-fade" style={{ padding: '2rem', animationDelay: '0.4s' }}>
                    <h3 style={{ marginBottom: '1.5rem' }}>Project Distribution</h3>
                    <div id="pie-chart"></div>
                </div>
            </div>
        </div>
    );
};

// =============================================
// MAIN APP
// =============================================

const App = () => {
    const [activeTab, setActiveTab] = useState('timer');
    const [theme, setTheme] = useState(() => localStorage.getItem('timeflow_theme') || 'dark');
    const [projects, setProjects] = useState(() => {
        const saved = localStorage.getItem('timeflow_projects');
        return saved ? JSON.parse(saved) : [{ id: 'default', name: 'General', color: '#6366f1' }];
    });

    useEffect(() => {
        document.documentElement.setAttribute('data-theme', theme);
        localStorage.setItem('timeflow_theme', theme);
    }, [theme]);

    useEffect(() => {
        localStorage.setItem('timeflow_projects', JSON.stringify(projects));
    }, [projects]);

    const [selectedProject, setSelectedProject] = useState(() => projects[0]?.id || 'default');
    const [entries, setEntries] = useState(() => {
        const saved = localStorage.getItem('timeflow_entries');
        return saved ? JSON.parse(saved) : [];
    });

    useEffect(() => {
        localStorage.setItem('timeflow_entries', JSON.stringify(entries));
    }, [entries]);

    const saveEntry = (duration, projectId, note) => {
        const proj = projects.find(p => p.id === projectId);
        const newEntry = {
            id: Date.now(),
            duration,
            date: new Date().toISOString(),
            projectId,
            projectName: proj ? proj.name : 'Unknown',
            description: note
        };
        setEntries([newEntry, ...entries]);
    };

    const exportCSV = () => {
        const rows = [
            ["Project", "Description", "Duration (ms)", "Duration (formatted)", "Date"],
            ...entries.map(e => [e.projectName, e.description || '', e.duration, formatStopwatch(e.duration), e.date])
        ];
        const csvContent = "data:text/csv;charset=utf-8," + rows.map(r => r.join(",")).join("\n");
        const encodedUri = encodeURI(csvContent);
        const link = document.createElement("a");
        link.setAttribute("href", encodedUri);
        link.setAttribute("download", `timeflow_export_${new Date().toISOString().split('T')[0]}.csv`);
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    return (
        <div className="app-container">
            <MeshBackground />
            <Sidebar activeTab={activeTab} setActiveTab={setActiveTab} theme={theme} setTheme={setTheme} />

            <main>
                <header style={{ marginBottom: '2rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div>
                        <h1 className="text-gradient" style={{ fontSize: '2.5rem' }}>
                            {activeTab.charAt(0).toUpperCase() + activeTab.slice(1)}
                        </h1>
                        <p style={{ color: 'var(--text-dim)', fontWeight: 500 }}>
                            {new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}
                        </p>
                    </div>
                </header>

                {activeTab === 'timer' && (
                    <div className="animate-fade">
                        <Timer
                            onSave={saveEntry}
                            projects={projects}
                            selectedProject={selectedProject}
                            setSelectedProject={setSelectedProject}
                        />
                        <div className="glass history-list" style={{ marginTop: '2rem' }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', padding: '1.5rem', borderBottom: '1px solid var(--glass-border)', alignItems: 'center' }}>
                                <h3 style={{ margin: 0 }}>Recent Activities</h3>
                                <button className="btn btn-primary" onClick={exportCSV} style={{ padding: '0.6rem 1.2rem', fontSize: '0.85rem' }}>
                                    <i className="fas fa-file-export"></i> Export Data
                                </button>
                            </div>
                            <div style={{ maxHeight: '400px', overflowY: 'auto' }}>
                                {entries.slice(0, 10).map(entry => (
                                    <div key={entry.id} className="history-item">
                                        <div style={{ display: 'flex', gap: '1.25rem', alignItems: 'center' }}>
                                            <div style={{
                                                width: '12px',
                                                height: '12px',
                                                borderRadius: '50%',
                                                background: projects.find(p => p.id === entry.projectId)?.color || 'var(--primary)',
                                                boxShadow: `0 0 10px ${projects.find(p => p.id === entry.projectId)?.color || 'var(--primary)'}`
                                            }}></div>
                                            <div>
                                                <div style={{ fontWeight: '700', fontSize: '1rem' }}>{entry.description || 'Focus Session'}</div>
                                                <div style={{ fontSize: '0.8rem', color: 'var(--text-dim)', marginTop: '2px' }}>
                                                    {entry.projectName} • {new Date(entry.date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                                </div>
                                            </div>
                                        </div>
                                        <div style={{ textAlign: 'right' }}>
                                            <div style={{ fontWeight: '800', fontSize: '1.1rem', color: 'var(--primary)' }}>{formatStopwatch(entry.duration)}</div>
                                            <div className="project-tag" style={{ marginTop: '4px' }}>{new Date(entry.date).toLocaleDateString()}</div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                            {entries.length === 0 && <div style={{ padding: '4rem', textAlign: 'center', opacity: 0.5 }}>
                                <i className="fas fa-clock-rotate-left" style={{ fontSize: '3rem', marginBottom: '1rem', display: 'block' }}></i>
                                <p>Start your first session to see history.</p>
                            </div>}
                        </div>
                    </div>
                )}

                {activeTab === 'analytics' && (
                    <div className="animate-fade">
                        <Dashboard entries={entries} projects={projects} />
                    </div>
                )}

                {activeTab === 'projects' && (
                    <div className="animate-fade">
                        <div className="glass" style={{ padding: '2rem', marginBottom: '1.5rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                            <div>
                                <h3 style={{ margin: 0 }}>Project Ecosystem</h3>
                                <p style={{ color: 'var(--text-dim)', margin: 0 }}>Create and manage your focus categories.</p>
                            </div>
                            <div style={{ display: 'flex', gap: '1rem' }}>
                                <button className="btn btn-secondary" onClick={() => {
                                    if (confirm("Reset everything? All your focus history and projects will be deleted forever.")) {
                                        localStorage.clear();
                                        window.location.reload();
                                    }
                                }} style={{ color: 'var(--danger)', border: '1px solid var(--danger)', padding: '0.6rem 1.2rem' }}>
                                    <i className="fas fa-trash-can"></i> Master Reset
                                </button>
                                <button className="btn btn-primary" onClick={() => {
                                    const name = prompt("Project Name:");
                                    if (name) setProjects([...projects, { id: Date.now().toString(), name, color: '#' + Math.floor(Math.random() * 16777215).toString(16).padStart(6, '0') }]);
                                }}>
                                    <i className="fas fa-plus"></i> New Project
                                </button>
                            </div>
                        </div>

                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '1.5rem' }}>
                            {projects.map(p => {
                                const projEntries = entries.filter(e => e.projectId === p.id);
                                const totalMs = projEntries.reduce((a, b) => a + b.duration, 0);
                                return (
                                    <div key={p.id} className="glass" style={{ padding: '1.5rem', position: 'relative' }}>
                                        <div style={{ position: 'absolute', top: '1.5rem', right: '1.5rem' }}>
                                            <button
                                                onClick={() => {
                                                    if (confirm(`Delete "${p.name}"? This will not delete past entries but they will show as Unknown.`)) {
                                                        setProjects(projects.filter(proj => proj.id !== p.id));
                                                        if (selectedProject === p.id) setSelectedProject(projects[0]?.id || 'default');
                                                    }
                                                }}
                                                className="mixer-btn"
                                                style={{ color: 'var(--danger)', fontSize: '0.8rem' }}
                                            >
                                                <i className="fas fa-trash"></i>
                                            </button>
                                        </div>

                                        <div style={{
                                            width: '40px',
                                            height: '4px',
                                            background: p.color,
                                            borderRadius: '2px',
                                            marginBottom: '1rem',
                                            boxShadow: `0 2px 10px ${p.color}66`
                                        }}></div>

                                        <h4 style={{ fontSize: '1.25rem', marginBottom: '0.5rem' }}>{p.name}</h4>

                                        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
                                            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem' }}>
                                                <span style={{ color: 'var(--text-dim)' }}>Sessions</span>
                                                <span style={{ fontWeight: '700' }}>{projEntries.length}</span>
                                            </div>
                                            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem' }}>
                                                <span style={{ color: 'var(--text-dim)' }}>Total Time</span>
                                                <span style={{ fontWeight: '700', color: 'var(--primary)' }}>{formatStopwatch(totalMs)}</span>
                                            </div>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                )}
            </main>

            <style>{`
                @keyframes fadeIn {
                    from { opacity: 0; transform: translateY(10px); }
                    to { opacity: 1; transform: translateY(0); }
                }
                .nav-item:hover {
                    background: rgba(255, 255, 255, 0.05);
                }
            `}</style>
        </div>
    );
};

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(<App />);
