import React, { useState } from 'react';
import { Plus, Search, Zap, Code2, X, AlertTriangle } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import SnippetCard from './SnippetCard';
import { useSnippets, useToggleFavorite, useDeleteSnippet, useSaveSnippet } from '../hooks/useSnippets';
import toast from 'react-hot-toast';

const SnippetList = ({ title, fetchUrl, params = {} }) => {
    const [search, setSearch] = useState('');
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
    const [currentSnippet, setCurrentSnippet] = useState(null);
    const [snippetToDelete, setSnippetToDelete] = useState(null);

    const [formData, setFormData] = useState({
        title: '', code: '', description: '', language: 'javascript', tags: ''
    });

    const { data: snippets = [], isLoading, isError } = useSnippets(fetchUrl, params, search);
    const toggleFavoriteMutation = useToggleFavorite();
    const deleteMutation = useDeleteSnippet();
    const saveMutation = useSaveSnippet(!!currentSnippet);

    const handleToggleFavorite = (id) => {
        toggleFavoriteMutation.mutate(id);
    };

    const confirmDelete = (id) => {
        setSnippetToDelete(id);
        setIsDeleteModalOpen(true);
    };

    const handleDelete = () => {
        if (snippetToDelete) {
            deleteMutation.mutate(snippetToDelete);
            setIsDeleteModalOpen(false);
            setSnippetToDelete(null);
        }
    };

    const handleSubmit = (e) => {
        e.preventDefault();

        if (!formData.title.trim() || !formData.code.trim()) {
            toast.error('Title and code are required!');
            return;
        }

        const tagArray = formData.tags ? formData.tags.split(',').map(t => t.trim()).filter(Boolean) : [];
        const data = { ...formData, tags: tagArray };

        saveMutation.mutate({ id: currentSnippet?.id, data }, {
            onSuccess: () => {
                setIsModalOpen(false);
                setFormData({ title: '', code: '', description: '', language: 'javascript', tags: '' });
                setCurrentSnippet(null);
            }
        });
    };

    const handleEdit = (s) => {
        setCurrentSnippet(s);
        setFormData({
            title: s.title, code: s.code, description: s.description || '',
            language: s.language, tags: s.tags ? s.tags.join(', ') : ''
        });
        setIsModalOpen(true);
    };

    if (isError) return <div className="text-red-500 py-10 text-center">Failed to load snippets. Please try again.</div>;

    return (
        <div className="animate-fade-in">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-10">
                <div>
                    <h2 className="text-4xl font-bold mb-2">{title}</h2>
                    <p className="text-text-muted">Total: {snippets.length} snippets</p>
                </div>
                <button
                    onClick={() => { setCurrentSnippet(null); setFormData({ title: '', code: '', description: '', language: 'javascript', tags: '' }); setIsModalOpen(true); }}
                    className="flex items-center justify-center gap-2 px-6 py-3 bg-primary hover:bg-primary/90 text-white rounded-xl font-bold transition-all transform hover:scale-105 shadow-lg shadow-primary/25 cursor-pointer"
                >
                    <Plus className="w-5 h-5" /> New Snippet
                </button>
            </div>

            <div className="relative mb-8 group">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-text-muted group-focus-within:text-primary transition-colors" />
                <input
                    type="text"
                    placeholder="Search snippets..."
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    className="w-full glass pl-12 pr-4 py-4 rounded-2xl outline-none focus:border-primary/50 border border-transparent transition-all font-medium"
                />
            </div>

            {isLoading ? (
                <div className="flex justify-center py-20"><Zap className="w-10 h-10 text-primary animate-pulse" /></div>
            ) : (
                <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
                    {snippets.length === 0 ? (
                        <div className="col-span-full py-20 text-center glass rounded-3xl border border-white/5">
                            <Code2 className="w-16 h-16 text-text-muted mx-auto mb-4" />
                            <p className="text-text-muted">No snippets found in this category.</p>
                        </div>
                    ) : (
                        snippets.map((s, i) => (
                            <SnippetCard
                                key={s.id} snippet={s} delay={i * 0.05}
                                onDelete={() => confirmDelete(s.id)} onEdit={() => handleEdit(s)}
                                onToggleFavorite={handleToggleFavorite}
                            />
                        ))
                    )}
                </div>
            )}

            {/* Create/Edit Modal */}
            <AnimatePresence>
                {isModalOpen && (
                    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
                        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setIsModalOpen(false)} className="absolute inset-0 bg-background/90 backdrop-blur-md" />
                        <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }} className="relative w-full max-w-4xl glass rounded-3xl p-8 overflow-y-auto max-h-[90vh] border border-white/10">
                            <div className="flex justify-between mb-8">
                                <h3 className="text-2xl font-bold">{currentSnippet ? 'Edit' : 'Create'} Snippet</h3>
                                <button onClick={() => setIsModalOpen(false)} className="p-2 glass rounded-full hover:bg-white/10 transition-colors cursor-pointer"><X /></button>
                            </div>
                            <form onSubmit={handleSubmit} className="space-y-6">
                                <div className="grid md:grid-cols-2 gap-6">
                                    <div className="space-y-2">
                                        <label className="text-xs font-bold text-text-muted uppercase">Title</label>
                                        <input required value={formData.title} onChange={e => setFormData({ ...formData, title: e.target.value })} className="w-full bg-background/50 border border-white/5 rounded-xl px-4 py-3 outline-none focus:border-primary/50 transition-colors" />
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-xs font-bold text-text-muted uppercase">Language</label>
                                        <select value={formData.language} onChange={e => setFormData({ ...formData, language: e.target.value })} className="w-full bg-background/50 border border-white/5 rounded-xl px-4 py-3 outline-none focus:border-primary/50 transition-colors">
                                            <option value="javascript">JavaScript</option>
                                            <option value="typescript">TypeScript</option>
                                            <option value="python">Python</option>
                                            <option value="html">HTML</option>
                                            <option value="css">CSS</option>
                                            <option value="sql">SQL</option>
                                            <option value="bash">Bash</option>
                                            <option value="json">JSON</option>
                                        </select>
                                    </div>
                                </div>
                                <div className="space-y-2">
                                    <label className="text-xs font-bold text-text-muted uppercase">Description (optional)</label>
                                    <input value={formData.description} onChange={e => setFormData({ ...formData, description: e.target.value })} className="w-full bg-background/50 border border-white/5 rounded-xl px-4 py-3 outline-none focus:border-primary/50 transition-colors" />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-xs font-bold text-text-muted uppercase">Code</label>
                                    <textarea required value={formData.code} onChange={e => setFormData({ ...formData, code: e.target.value })} className="w-full bg-[#0d0d11] border border-white/5 rounded-xl px-4 py-3 h-64 font-mono text-sm resize-none focus:border-primary/50 transition-colors outline-none" />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-xs font-bold text-text-muted uppercase">Tags (comma separated)</label>
                                    <input value={formData.tags} onChange={e => setFormData({ ...formData, tags: e.target.value })} className="w-full bg-background/50 border border-white/5 rounded-xl px-4 py-3 outline-none focus:border-primary/50 transition-colors" placeholder="e.g. react, hooks, api" />
                                </div>
                                <button disabled={saveMutation.isPending} type="submit" className="w-full bg-primary py-4 rounded-xl font-bold shadow-lg shadow-primary/20 hover:bg-primary/90 transition-colors disabled:opacity-50 cursor-pointer">
                                    {saveMutation.isPending ? 'Saving...' : 'Save Snippet'}
                                </button>
                            </form>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>

            {/* Delete Confirmation Modal */}
            <AnimatePresence>
                {isDeleteModalOpen && (
                    <div className="fixed inset-0 z-[110] flex items-center justify-center p-4">
                        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setIsDeleteModalOpen(false)} className="absolute inset-0 bg-background/90 backdrop-blur-md" />
                        <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }} className="relative w-full max-w-md glass rounded-3xl p-8 border border-red-500/20 shadow-2xl shadow-red-500/10 text-center">
                            <div className="bg-red-500/10 text-red-500 p-4 rounded-full inline-block mb-6">
                                <AlertTriangle className="w-8 h-8" />
                            </div>
                            <h3 className="text-2xl font-bold mb-2">Delete Snippet</h3>
                            <p className="text-text-muted mb-8">Are you sure you want to delete this snippet? This action cannot be undone.</p>

                            <div className="flex gap-4">
                                <button onClick={() => setIsDeleteModalOpen(false)} className="flex-1 py-3 glass rounded-xl font-bold hover:bg-white/10 transition-colors cursor-pointer">
                                    Cancel
                                </button>
                                <button onClick={handleDelete} disabled={deleteMutation.isPending} className="flex-1 py-3 bg-red-500 hover:bg-red-600 rounded-xl font-bold transition-colors shadow-lg shadow-red-500/20 disabled:opacity-50 cursor-pointer">
                                    {deleteMutation.isPending ? 'Deleting...' : 'Delete'}
                                </button>
                            </div>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>
        </div>
    );
};

export default SnippetList;
