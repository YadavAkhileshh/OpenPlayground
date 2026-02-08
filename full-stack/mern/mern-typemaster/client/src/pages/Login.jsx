import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const Login = () => {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const { login } = useAuth();
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        const success = await login(username, password);
        if (success) navigate('/');
    };

    return (
        <div className="container">
            <form className="auth-form" onSubmit={handleSubmit}>
                <h2 style={{ marginBottom: '2rem', textAlign: 'center' }}>Welcome Back</h2>
                <div className="form-group">
                    <label>Username</label>
                    <input
                        type="text"
                        placeholder="Enter your username"
                        value={username}
                        onChange={(e) => setUsername(e.target.value)}
                        required
                    />
                </div>
                <div className="form-group">
                    <label>Password</label>
                    <input
                        type="password"
                        placeholder="••••••••"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        required
                    />
                </div>
                <button type="submit" className="btn btn-primary" style={{ width: '100%', marginTop: '1rem' }}>
                    Login
                </button>
                <p style={{ marginTop: '1.5rem', textAlign: 'center', color: 'var(--sub-color)', fontSize: '0.9rem' }}>
                    Don't have an account? <Link to="/signup" style={{ color: 'var(--main-color)', fontWeight: 600 }}>Sign up</Link>
                </p>
            </form>
        </div>
    );
};

export default Login;
