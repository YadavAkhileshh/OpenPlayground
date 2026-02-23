import React from 'react';
import { Info, Zap, Shield, Search, Tag, Star } from 'lucide-react';

const Help = () => {
    const sections = [
        {
            title: 'Getting Started',
            icon: Zap,
            content: 'Code Vault is designed to be your secondary brain for code. Simply click "New Snippet" to save your favorite logic blocks.'
        },
        {
            title: 'Smart Search',
            icon: Search,
            content: 'Our search engine scans titles, descriptions, and the actual code content. Use keywords to find exactly what you need.'
        },
        {
            title: 'Tagging',
            icon: Tag,
            content: 'Organize snippets using comma-separated tags. You can then filter your vault by specific technologies or categories.'
        },
        {
            title: 'Important Snippets',
            icon: Star,
            content: 'Click the star icon on any snippet to save it to your "Important" section for quick access.'
        }
    ];

    return (
        <div className="animate-fade-in max-w-4xl">
            <h2 className="text-4xl font-bold mb-8">Documentation</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {sections.map((section, i) => (
                    <div key={i} className="glass p-8 rounded-3xl border border-white/5 hover:border-primary/20 transition-all group">
                        <div className="p-3 bg-primary/10 rounded-2xl w-fit mb-6 group-hover:bg-primary/20 transition-colors">
                            <section.icon className="text-primary w-6 h-6" />
                        </div>
                        <h3 className="text-xl font-bold mb-3">{section.title}</h3>
                        <p className="text-text-muted leading-relaxed">{section.content}</p>
                    </div>
                ))}
            </div>

            <div className="mt-12 glass p-8 rounded-3xl border border-white/5 bg-gradient-to-br from-primary/5 to-transparent">
                <div className="flex items-center gap-3 mb-4">
                    <Shield className="text-secondary w-6 h-6" />
                    <h3 className="text-xl font-bold">Privacy & Security</h3>
                </div>
                <p className="text-text-muted">
                    Your snippets are stored locally in your private PostgreSQL instance. Code Vault does not upload your code to any external servers.
                </p>
            </div>
        </div>
    );
};

export default Help;
