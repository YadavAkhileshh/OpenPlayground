import React, { useState } from 'react';
import { Star, Copy, Check, Edit3, Trash2 } from 'lucide-react';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { atomDark } from 'react-syntax-highlighter/dist/esm/styles/prism';
import { motion } from 'framer-motion';

const SnippetCard = ({ snippet, onEdit, onDelete, onToggleFavorite, delay }) => {
    const [copied, setCopied] = useState(false);

    const handleCopy = (e) => {
        e.stopPropagation();
        navigator.clipboard.writeText(snippet.code);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    return (
        <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay }}
            className="glass rounded-3xl overflow-hidden flex flex-col group hover:shadow-2xl hover:shadow-primary/10 transition-all border border-white/5 hover:border-white/10"
        >
            <div className="p-6 pb-4">
                <div className="flex items-start justify-between mb-4">
                    <div className="flex-1">
                        <div className="flex flex-wrap items-center gap-2 mb-2">
                            <span className="text-[10px] uppercase tracking-widest font-bold px-2 py-0.5 bg-primary/10 text-primary rounded-md border border-primary/20">
                                {snippet.language}
                            </span>
                            {snippet.tags && snippet.tags.map((tag, i) => tag && (
                                <span key={i} className="text-[10px] uppercase tracking-widest font-bold px-2 py-0.5 bg-white/5 text-text-muted rounded-md border border-white/5">
                                    {tag}
                                </span>
                            ))}
                        </div>
                        <h3 className="text-xl font-bold group-hover:text-primary transition-colors line-clamp-1">{snippet.title}</h3>
                    </div>
                    <div className="flex gap-1">
                        <button
                            onClick={() => onToggleFavorite(snippet.id)}
                            className={`p-2 rounded-lg transition-colors ${snippet.is_favorite ? 'text-secondary' : 'text-text-muted hover:text-white hover:bg-white/5'}`}
                        >
                            <Star className={`w-5 h-5 ${snippet.is_favorite ? 'fill-current' : ''}`} />
                        </button>
                        <div className="opacity-0 group-hover:opacity-100 transition-opacity flex gap-1">
                            <button onClick={onEdit} className="p-2 hover:bg-white/5 rounded-lg text-text-muted hover:text-white transition-colors">
                                <Edit3 className="w-4 h-4" />
                            </button>
                            <button onClick={onDelete} className="p-2 hover:bg-white/5 rounded-lg text-text-muted hover:text-red-400 transition-colors">
                                <Trash2 className="w-4 h-4" />
                            </button>
                        </div>
                    </div>
                </div>
                {snippet.description && (
                    <p className="text-text-muted text-sm line-clamp-2 mb-4 h-10">{snippet.description}</p>
                )}
            </div>

            <div className="px-6 pb-6 mt-auto">
                <div className="relative group/code">
                    <div className="absolute right-3 top-3 z-10 flex gap-2">
                        <button
                            onClick={handleCopy}
                            className={`p-2 rounded-lg backdrop-blur-md transition-all ${copied ? 'bg-green-500/20 text-green-400 shadow-lg shadow-green-500/20' : 'bg-white/5 text-text-muted hover:text-white hover:bg-white/10 opacity-0 group-hover/code:opacity-100'}`}
                        >
                            {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                        </button>
                    </div>
                    <div className="code-container overflow-hidden rounded-xl border border-white/5 shadow-inner">
                        <SyntaxHighlighter
                            language={snippet.language}
                            style={atomDark}
                            customStyle={{
                                fontSize: '0.8rem',
                                padding: '1.25rem',
                                maxHeight: '180px',
                            }}
                        >
                            {snippet.code}
                        </SyntaxHighlighter>
                    </div>
                </div>
            </div>
        </motion.div>
    );
};

export default SnippetCard;
