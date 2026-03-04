import { createContext, useState, useEffect, useContext } from 'react';
import axios from 'axios';

const AuthContext = createContext();

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [token, setToken] = useState(localStorage.getItem('token'));
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (token) {
            axios.defaults.headers.common['x-auth-token'] = token;
            loadUser();
        } else {
            setLoading(false);
        }
    }, [token]);

    const loadUser = async () => {
        try {
            const res = await axios.get('http://localhost:5000/api/auth');
            setUser(res.data);
            setLoading(false);
        } catch (err) {
            localStorage.removeItem('token');
            setToken(null);
            setUser(null);
            setLoading(false);
        }
    };

    const login = async (username, password) => {
        try {
            const res = await axios.post('http://localhost:5000/api/auth', { username, password });
            localStorage.setItem('token', res.data.token);
            setToken(res.data.token);
            return { success: true };
        } catch (err) {
            return { success: false, error: err.response?.data?.msg || 'Login failed' };
        }
    };

    const signup = async (username, password) => {
        try {
            const res = await axios.post('http://localhost:5000/api/users', { username, password });
            localStorage.setItem('token', res.data.token);
            setToken(res.data.token);
            return { success: true };
        } catch (err) {
            return { success: false, error: err.response?.data?.errors?.[0]?.msg || 'Signup failed' };
        }
    };

    const logout = () => {
        localStorage.removeItem('token');
        setToken(null);
        setUser(null);
    };

    return (
        <AuthContext.Provider value={{ user, token, loading, login, signup, logout }}>
            {children}
        </AuthContext.Provider>
    );
};
