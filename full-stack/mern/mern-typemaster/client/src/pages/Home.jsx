import { useState, useEffect } from 'react';
import axios from 'axios';
import TypingEngine from '../components/TypingEngine';
import { Trophy, Target, TrendingUp, Zap, Award, Star } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

const Home = () => {
    const { token, user } = useAuth();
    const [stats, setStats] = useState({
        testsToday: 0,
        bestWpm: 0,
        achievements: []
    });

    const fetchStats = async () => {
        if (!token) return;
        try {
            const res = await axios.get('http://localhost:5000/api/results/stats', {
                headers: {
                    'x-auth-token': token
                }
            });
            setStats(res.data);
        } catch (err) {
            console.error('Error fetching stats', err);
        }
    };

    useEffect(() => {
        fetchStats();
    }, [token]);

    const getIcon = (iconName) => {
        const icons = { Trophy, Zap, Award, Target, Star };
        const IconComponent = icons[iconName] || Star;
        return <IconComponent size={20} />;
    };

    return (
        <div className="home-page">
            <div className="main-grid">
                <main>
                    <TypingEngine onFinish={fetchStats} />

                    <div className="card" style={{ marginTop: '2rem' }}>
                        <h3 className="sidebar-title" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                            <TrendingUp size={18} /> Performance Insights
                        </h3>
                        {token ? (
                            <p style={{ color: 'var(--sub-color)', fontSize: '0.9rem' }}>
                                Your best speed so far is <b style={{ color: 'var(--main-color)' }}>{stats.bestWpm} WPM</b>.
                                {stats.testsToday > 0
                                    ? ` You've completed ${stats.testsToday} tests today. Keep it up!`
                                    : " Haven't finished any tests today yet. Let's start typing!"}
                            </p>
                        ) : (
                            <p style={{ color: 'var(--sub-color)', fontSize: '0.9rem' }}>
                                Login to track your progress and see performance insights.
                            </p>
                        )}
                    </div>
                </main>

                <aside>
                    <div className="card" style={{ marginBottom: '2rem' }}>
                        <span className="sidebar-title">Daily Goals</span>
                        <div className="achievement-item" style={{ opacity: token ? 1 : 0.5 }}>
                            <div className="achievement-icon"><Target size={20} /></div>
                            <div className="achievement-info">
                                <div className="name">Focus Flow</div>
                                <div className="desc">{token ? `${stats.testsToday}/10 tests today` : 'Login to track'}</div>
                                {token && (
                                    <div style={{ width: '100%', height: '4px', background: 'rgba(255,255,255,0.1)', marginTop: '0.5rem', borderRadius: '2px' }}>
                                        <div style={{ width: `${Math.min((stats.testsToday / 10) * 100, 100)}%`, height: '100%', background: 'var(--main-color)', borderRadius: '2px', transition: 'width 1s ease' }}></div>
                                    </div>
                                )}
                            </div>
                        </div>
                        <div className="achievement-item" style={{ opacity: token ? 1 : 0.5 }}>
                            <div className="achievement-icon"><Zap size={20} /></div>
                            <div className="achievement-info">
                                <div className="name">Speed Demon</div>
                                <div className="desc">{token ? (stats.bestWpm >= 60 ? 'Goal Reached! (60+)' : `High: ${stats.bestWpm} WPM`) : 'Target: 60+ WPM'}</div>
                            </div>
                        </div>
                    </div>

                    <div className="card">
                        <span className="sidebar-title">Achievements</span>
                        {token && stats.achievements.length > 0 ? (
                            stats.achievements.map((ach) => (
                                <div key={ach.id} className="achievement-item">
                                    <div className="achievement-icon" style={{ color: 'var(--success-color)' }}>{getIcon(ach.icon)}</div>
                                    <div className="achievement-info">
                                        <div className="name">{ach.name}</div>
                                        <div className="desc">{ach.desc}</div>
                                    </div>
                                </div>
                            ))
                        ) : (
                            <div className="achievement-item" style={{ opacity: 0.5 }}>
                                <div className="achievement-icon"><Star size={20} /></div>
                                <div className="achievement-info">
                                    <div className="name">No achievements yet</div>
                                    <div className="desc">Start typing to unlock!</div>
                                </div>
                            </div>
                        )}
                    </div>
                </aside>
            </div>

            <div style={{ marginTop: '4rem', color: 'var(--sub-color)', textAlign: 'center', padding: '2rem' }}>
                <p>Hotkey: Press <span style={{ color: 'var(--main-color)', fontWeight: 600 }}>Tab + Enter</span> to quickly restart the test</p>
            </div>
        </div>
    );
};

export default Home;
