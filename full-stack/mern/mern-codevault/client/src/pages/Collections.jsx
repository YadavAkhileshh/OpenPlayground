import React from 'react';
import { Folder } from 'lucide-react';

const Collections = () => {
    return (
        <div className="py-20 text-center glass rounded-3xl">
            <Folder className="w-20 h-20 text-primary mx-auto mb-6 opacity-20" />
            <h2 className="text-2xl font-bold mb-2">Collections</h2>
            <p className="text-text-muted">Personalized folders for your projects coming soon.</p>
        </div>
    );
};

export default Collections;
