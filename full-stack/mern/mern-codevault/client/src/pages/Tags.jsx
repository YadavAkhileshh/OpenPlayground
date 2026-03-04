import React from 'react';
import { Hash } from 'lucide-react';

const Tags = () => {
    return (
        <div className="py-20 text-center glass rounded-3xl">
            <Hash className="w-20 h-20 text-secondary mx-auto mb-6 opacity-20" />
            <h2 className="text-2xl font-bold mb-2">Tags Explorer</h2>
            <p className="text-text-muted">Interactive tag cloud coming soon.</p>
        </div>
    );
};

export default Tags;
