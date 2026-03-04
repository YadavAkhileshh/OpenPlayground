import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Keyboard, User, LogOut, LayoutDashboard, Sun, Moon } from 'lucide-react';
import { useState, useEffect } from 'react';

const Navbar = () => {
    const { user, logout } = useAuth();
    const [theme, setTheme] = useState(localStorage.getItem('theme') || 'dark');

    useEffect(() => {
        document.documentElement.setAttribute('data-theme', theme);
        localStorage.setItem('theme', theme);
    }, [theme]);

    const toggleTheme = () => {
        setTheme(theme === 'dark' ? 'light' : 'dark');
    };

    return (
        <header>
            <div className="container" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', width: '100%' }}>
                <Link to="/" className="logo">
                    <Keyboard size={32} />
                    <span>Typemaster</span>
                </Link>
                <nav>
                    <button onClick={toggleTheme} className="theme-toggle" title="Toggle Theme">
                        {theme === 'dark' ? <Sun size={20} /> : <Moon size={20} />}
                    </button>
                    {user ? (
                        <>
                            <Link to="/dashboard" title="Dashboard">
                                <LayoutDashboard size={20} />
                            </Link>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                                <span style={{ color: 'var(--sub-color)', fontWeight: 500 }}>{user.username}</span>
                                <button onClick={logout} className="btn btn-outline" style={{ padding: '0.4rem' }} title="Logout">
                                    <LogOut size={18} />
                                </button>
                            </div>
                        </>
                    ) : (
                        <>
                            <Link to="/login">Login</Link>
                            <Link to="/signup" className="btn btn-primary" style={{ padding: '0.5rem 1rem' }}>Signup</Link>
                        </>
                    )}
                </nav>
            </div>
        </header>
    );
};

export default Navbar;
