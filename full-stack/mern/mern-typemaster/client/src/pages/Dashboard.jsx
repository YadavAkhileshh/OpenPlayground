import { useState, useEffect } from 'react';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';

const Dashboard = () => {
    const [results, setResults] = useState([]);
    const [loading, setLoading] = useState(true);
    const { user } = useAuth();

    useEffect(() => {
        fetchResults();
    }, []);

    const fetchResults = async () => {
        try {
            const res = await axios.get('http://localhost:5000/api/results');
            setResults(res.data);
            setLoading(false);
        } catch (err) {
            console.error('Error fetching results', err);
            setLoading(false);
        }
    };

    if (loading) return <div>Loading...</div>;

    return (
        <div className="dashboard">
            <h1>Dashboard</h1>
            <p style={{ color: 'var(--sub-color)', marginBottom: '2rem' }}>History of {user?.username}</p>

            <div className="results-dashboard">
                {results.length > 0 ? (
                    results.map((result) => (
                        <div key={result._id} className="result-card">
                            <div style={{ fontSize: '2rem', color: 'var(--main-color)', fontWeight: 'bold' }}>
                                {result.wpm} <span style={{ fontSize: '0.8rem', color: 'var(--sub-color)' }}>WPM</span>
                            </div>
                            <div style={{ color: 'var(--sub-color)' }}>
                                Accuracy: <span style={{ color: 'var(--text-color)' }}>{result.accuracy}%</span>
                            </div>
                            <div style={{ fontSize: '0.7rem', color: 'var(--sub-color)', marginTop: '1rem' }}>
                                {new Date(result.date).toLocaleDateString()}
                            </div>
                        </div>
                    ))
                ) : (
                    <p>No results found. Start typing!</p>
                )}
            </div>
        </div>
    );
};

export default Dashboard;
