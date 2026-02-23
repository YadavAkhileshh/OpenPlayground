import { createContext, useState, useContext, useEffect } from 'react';
import axios from 'axios';
import { devAuth } from '../services/devAuth';

const AuthContext = createContext();

// Toggle this to switch between real backend and dev localStorage auth
const USE_DEV_AUTH = true;

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);
    const [token, setToken] = useState(localStorage.getItem(USE_DEV_AUTH ? 'dev_inventory_token' : 'token'));

    useEffect(() => {
        if (token) {
            if (!USE_DEV_AUTH) {
                axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
            }
            fetchProfile();
        } else {
            setLoading(false);
        }
    }, [token]);

    const fetchProfile = async () => {
        try {
            if (USE_DEV_AUTH) {
                const res = await devAuth.fetchProfile();
                setUser(res.user);
            } else {
                const res = await axios.get('http://localhost:5000/api/auth/profile');
                setUser(res.data.user);
            }
        } catch (err) {
            logout();
        } finally {
            setLoading(false);
        }
    };

    const login = async (email, password) => {
        if (USE_DEV_AUTH) {
            const { token, user } = await devAuth.login(email, password);
            setToken(token);
            setUser(user);
            return user;
        } else {
            const res = await axios.post('http://localhost:5000/api/auth/login', { email, password });
            const { token, user } = res.data;
            localStorage.setItem('token', token);
            setToken(token);
            setUser(user);
            return user;
        }
    };

    const register = async (name, email, password, role) => {
        if (USE_DEV_AUTH) {
            const { token, user } = await devAuth.register(name, email, password, role);
            setToken(token);
            setUser(user);
            return user;
        } else {
            const res = await axios.post('http://localhost:5000/api/auth/register', { name, email, password, role });
            const { token, user } = res.data;
            localStorage.setItem('token', token);
            setToken(token);
            setUser(user);
            return user;
        }
    };

    const logout = () => {
        if (USE_DEV_AUTH) {
            devAuth.logout();
        } else {
            localStorage.removeItem('token');
            delete axios.defaults.headers.common['Authorization'];
        }
        setToken(null);
        setUser(null);
    };

    const value = {
        user,
        token,
        loading,
        login,
        register,
        logout,
        isDevMode: USE_DEV_AUTH
    };

    return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

