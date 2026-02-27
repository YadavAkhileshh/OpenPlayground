import { useState, useEffect } from 'react';
import {
    Plus,
    Search,
    User,
    Mail,
    Phone,
    MapPin,
    Edit2,
    Trash2,
    Building2,
    ExternalLink
} from 'lucide-react';
import { getSuppliers, deleteSupplier, createSupplier, updateSupplier } from '../services/api';

const Suppliers = () => {
    const [suppliers, setSuppliers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [showModal, setShowModal] = useState(false);
    const [editingSupplier, setEditingSupplier] = useState(null);

    const [formData, setFormData] = useState({
        name: '',
        contactPerson: '',
        email: '',
        phone: '',
        address: '',
        categories: []
    });

    useEffect(() => {
        fetchSuppliers();
    }, []);

    const fetchSuppliers = async () => {
        try {
            const { data } = await getSuppliers();
            setSuppliers(data);
        } catch (err) {
            console.error('Failed to fetch suppliers', err);
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async (id) => {
        if (window.confirm('Are you sure you want to delete this supplier?')) {
            try {
                await deleteSupplier(id);
                fetchSuppliers();
            } catch (err) {
                alert('Delete failed');
            }
        }
    };

    const handleOpenModal = (supplier = null) => {
        if (supplier) {
            setEditingSupplier(supplier);
            setFormData({
                name: supplier.name,
                contactPerson: supplier.contactPerson || '',
                email: supplier.email || '',
                phone: supplier.phone || '',
                address: supplier.address || '',
                categories: supplier.categories || []
            });
        } else {
            setEditingSupplier(null);
            setFormData({
                name: '',
                contactPerson: '',
                email: '',
                phone: '',
                address: '',
                categories: []
            });
        }
        setShowModal(true);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            if (editingSupplier) {
                await updateSupplier(editingSupplier._id, formData);
            } else {
                await createSupplier(formData);
            }
            setShowModal(false);
            fetchSuppliers();
        } catch (err) {
            alert('Operation failed');
        }
    };

    const filteredSuppliers = suppliers.filter(s =>
        s.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        s.contactPerson?.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <div className="space-y-6">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-bold text-white">Suppliers</h1>
                    <p className="text-slate-400 mt-1">Manage your supply chain partners</p>
                </div>
                <button
                    onClick={() => handleOpenModal()}
                    className="flex items-center justify-center gap-2 px-6 py-3 bg-primary-600 hover:bg-primary-700 text-white font-semibold rounded-xl transition-all shadow-lg shadow-primary-600/20 active:scale-[0.98]"
                >
                    <Plus size={20} />
                    Add Supplier
                </button>
            </div>

            <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-500">
                    <Search size={18} />
                </div>
                <input
                    type="text"
                    placeholder="Search suppliers by name or contact person..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="block w-full pl-10 pr-4 py-3 bg-slate-900 border border-slate-800 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-primary-500 transition-all"
                />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                {filteredSuppliers.map((supplier) => (
                    <div key={supplier._id} className="bg-slate-900 border border-slate-800 rounded-2xl p-6 group hover:border-primary-500/50 transition-all shadow-lg shadow-black/20 relative overflow-hidden">
                        <div className="absolute top-0 right-0 p-4 opacity-0 group-hover:opacity-100 transition-opacity">
                            <div className="flex gap-2">
                                <button
                                    onClick={() => handleOpenModal(supplier)}
                                    className="p-2 bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white rounded-lg transition-all"
                                >
                                    <Edit2 size={16} />
                                </button>
                                <button
                                    onClick={() => handleDelete(supplier._id)}
                                    className="p-2 bg-slate-800 hover:bg-rose-500/20 text-slate-300 hover:text-rose-500 rounded-lg transition-all"
                                >
                                    <Trash2 size={16} />
                                </button>
                            </div>
                        </div>

                        <div className="flex items-center gap-4 mb-6">
                            <div className="w-14 h-14 bg-slate-800 rounded-2xl flex items-center justify-center text-primary-500 shadow-inner">
                                <Building2 size={28} />
                            </div>
                            <div>
                                <h3 className="text-xl font-bold text-white group-hover:text-primary-400 transition-colors uppercase tracking-tight">{supplier.name}</h3>
                                <p className="text-primary-500/80 text-sm font-medium flex items-center gap-1.5 mt-0.5">
                                    <User size={14} /> {supplier.contactPerson || 'No contact specified'}
                                </p>
                            </div>
                        </div>

                        <div className="space-y-3.5 pt-4 border-t border-slate-800/50">
                            <div className="flex items-center gap-3 text-slate-400 hover:text-slate-200 transition-colors group/link cursor-pointer">
                                <div className="w-8 h-8 rounded-lg bg-slate-800/40 flex items-center justify-center text-slate-500 group-hover/link:text-primary-400 transition-colors">
                                    <Mail size={16} />
                                </div>
                                <span className="text-sm truncate font-medium">{supplier.email || 'N/A'}</span>
                            </div>
                            <div className="flex items-center gap-3 text-slate-400">
                                <div className="w-8 h-8 rounded-lg bg-slate-800/40 flex items-center justify-center text-slate-500">
                                    <Phone size={16} />
                                </div>
                                <span className="text-sm font-medium">{supplier.phone || 'N/A'}</span>
                            </div>
                            <div className="flex items-start gap-3 text-slate-400">
                                <div className="w-8 h-8 rounded-lg bg-slate-800/40 flex items-center justify-center text-slate-500 mt-0.5">
                                    <MapPin size={16} />
                                </div>
                                <span className="text-sm leading-relaxed max-w-[200px]">{supplier.address || 'N/A'}</span>
                            </div>
                        </div>

                        <div className="mt-8 flex items-center justify-between">
                            <div className="flex flex-wrap gap-1.5">
                                {(supplier.categories || []).slice(0, 2).map((cat, i) => (
                                    <span key={i} className="px-2.5 py-1 bg-slate-800 text-slate-400 text-[10px] uppercase tracking-wider font-bold rounded-md">
                                        {cat}
                                    </span>
                                ))}
                            </div>
                            <button className="text-xs font-bold text-slate-500 hover:text-primary-400 uppercase tracking-widest flex items-center gap-1.5 transition-colors">
                                History <ExternalLink size={12} />
                            </button>
                        </div>
                    </div>
                ))}
                {filteredSuppliers.length === 0 && !loading && (
                    <div className="md:col-span-2 xl:col-span-3 p-20 text-center bg-slate-900/50 border-2 border-dashed border-slate-800 rounded-3xl">
                        <div className="inline-flex items-center justify-center w-20 h-20 bg-slate-800/50 text-slate-600 rounded-3xl mb-6 shadow-inner">
                            <Building2 size={40} />
                        </div>
                        <h3 className="text-2xl font-bold text-white mb-2">Build your supply network</h3>
                        <p className="text-slate-500 max-w-sm mx-auto">Start adding suppliers to connect products and manage their sources more efficiently.</p>
                    </div>
                )}
            </div>

            {/* Modal */}
            {showModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/90 backdrop-blur-md">
                    <div className="bg-slate-900 border border-slate-700/50 w-full max-w-xl rounded-3xl shadow-2xl animate-in zoom-in-95 duration-300">
                        <div className="p-8 border-b border-slate-800 flex items-center justify-between bg-slate-900/40">
                            <h2 className="text-2xl font-bold text-white">{editingSupplier ? 'Edit Supplier' : 'Add New Supplier'}</h2>
                            <button onClick={() => setShowModal(false)} className="w-10 h-10 flex items-center justify-center text-slate-500 hover:text-white hover:bg-slate-800 rounded-full transition-all">
                                <Plus size={28} className="rotate-45" />
                            </button>
                        </div>
                        <form onSubmit={handleSubmit} className="p-8 space-y-6">
                            <div className="space-y-4">
                                <div>
                                    <label className="block text-xs font-bold uppercase tracking-widest text-slate-500 mb-2">Company Name</label>
                                    <input
                                        required
                                        value={formData.name}
                                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                        placeholder="Acme Corporation"
                                        className="w-full px-5 py-3.5 bg-slate-800/50 border border-slate-700/50 rounded-2xl text-white focus:ring-2 focus:ring-primary-500/50 outline-none transition-all placeholder:text-slate-600 shadow-inner"
                                    />
                                </div>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-xs font-bold uppercase tracking-widest text-slate-500 mb-2">Contact Person</label>
                                        <input
                                            value={formData.contactPerson}
                                            onChange={(e) => setFormData({ ...formData, contactPerson: e.target.value })}
                                            placeholder="John Wick"
                                            className="w-full px-5 py-3.5 bg-slate-800/50 border border-slate-700/50 rounded-2xl text-white focus:ring-2 focus:ring-primary-500/50 outline-none transition-all placeholder:text-slate-600"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-xs font-bold uppercase tracking-widest text-slate-500 mb-2">Phone Number</label>
                                        <input
                                            value={formData.phone}
                                            onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                                            placeholder="+1 (555) 000-0000"
                                            className="w-full px-5 py-3.5 bg-slate-800/50 border border-slate-700/50 rounded-2xl text-white focus:ring-2 focus:ring-primary-500/50 outline-none transition-all placeholder:text-slate-600"
                                        />
                                    </div>
                                </div>
                                <div>
                                    <label className="block text-xs font-bold uppercase tracking-widest text-slate-500 mb-2">Email Address</label>
                                    <input
                                        type="email"
                                        value={formData.email}
                                        onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                                        placeholder="contact@acme.com"
                                        className="w-full px-5 py-3.5 bg-slate-800/50 border border-slate-700/50 rounded-2xl text-white focus:ring-2 focus:ring-primary-500/50 outline-none transition-all placeholder:text-slate-600"
                                    />
                                </div>
                                <div>
                                    <label className="block text-xs font-bold uppercase tracking-widest text-slate-500 mb-2">Physical Address</label>
                                    <textarea
                                        rows="2"
                                        value={formData.address}
                                        onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                                        placeholder="Enter full business address..."
                                        className="w-full px-5 py-3.5 bg-slate-800/50 border border-slate-700/50 rounded-2xl text-white focus:ring-2 focus:ring-primary-500/50 outline-none transition-all placeholder:text-slate-600 resize-none"
                                    />
                                </div>
                            </div>
                            <div className="flex gap-4 pt-4">
                                <button
                                    type="button"
                                    onClick={() => setShowModal(false)}
                                    className="flex-1 py-4 text-slate-400 font-bold hover:text-white hover:bg-slate-800 rounded-2xl transition-all"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    className="flex-[2] py-4 bg-primary-600 hover:bg-primary-500 text-white font-black uppercase tracking-widest rounded-2xl transition-all shadow-xl shadow-primary-900/40 active:scale-95 flex items-center justify-center gap-3"
                                >
                                    {editingSupplier ? 'Update Partner' : 'Add Partner'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Suppliers;
