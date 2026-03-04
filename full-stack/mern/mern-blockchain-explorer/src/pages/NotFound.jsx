import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { SearchX } from 'lucide-react';

export default function NotFound() {
    return (
        <div className="app-container" style={{ paddingTop: 80, paddingBottom: 80 }}>
            <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                style={{ textAlign: 'center' }}
            >
                <SearchX size={48} style={{ color: 'var(--text-muted)', marginBottom: 16 }} />
                <h1 style={{ fontWeight: 800, fontSize: '2rem', marginBottom: 8 }}>404</h1>
                <p style={{ color: 'var(--text-muted)', marginBottom: 24, fontSize: '1rem' }}>
                    The page you're looking for doesn't exist on this chain.
                </p>
                <Link to="/" className="btn btn-primary">
                    ← Back to Dashboard
                </Link>
            </motion.div>
        </div>
    );
}
