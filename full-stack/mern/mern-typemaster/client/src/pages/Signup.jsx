import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const Signup = () => {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const { signup } = useAuth();
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        const success = await signup(username, password);
        if (success) navigate('/');
    };

    return (
        <div className="container">
            <form className="auth-form" onSubmit={handleSubmit}>
                <h2 style={{ marginBottom: '2rem', textAlign: 'center' }}>Create Account</h2>
                <div className="form-group">
                    <label>Username</label>
                    <input
                        type="text"
                        placeholder="Pick a username"
                        value={username}
                        onChange={(e) => setUsername(e.target.value)}
                        required
                    />
                </div>
                <div className="form-group">
                    <label>Password</label>
                    <input
                        type="password"
                        placeholder="Minimum 6 characters"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        required
                        minLength="6"
                    />
                </div>
                <button type="submit" className="btn btn-primary" style={{ width: '100%', marginTop: '1rem' }}>
                    Sign Up
                </button>
                <p style={{ marginTop: '1.5rem', textAlign: 'center', color: 'var(--sub-color)', fontSize: '0.9rem' }}>
                    Already have an account? <Link to="/login" style={{ color: 'var(--main-color)', fontWeight: 600 }}>Login</Link>
                </p>
            </form>
        </div>
    );
};

export default Signup;
