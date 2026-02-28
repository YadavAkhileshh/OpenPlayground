import { useState, useEffect } from 'react';
import {
    Plus,
    Search,
    Filter,
    MoreVertical,
    Edit2,
    Trash2,
    AlertCircle,
    Package as PackageIcon
} from 'lucide-react';
import { getProducts, deleteProduct, getSuppliers, createProduct, updateProduct } from '../services/api';
import { useAuth } from '../context/AuthContext';

const Products = () => {
    const [products, setProducts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [showModal, setShowModal] = useState(false);
    const [editingProduct, setEditingProduct] = useState(null);
    const [suppliers, setSuppliers] = useState([]);

    const { user } = useAuth();
    const isAdminOrManager = ['Admin', 'Manager'].includes(user?.role);

    const [formData, setFormData] = useState({
        sku: '',
        name: '',
        category: '',
        price: '',
        cost: '',
        stock: '',
        reorderLevel: '',
        supplier: ''
    });

    useEffect(() => {
        fetchProducts();
        fetchSuppliers();
    }, []);

    const fetchProducts = async () => {
        try {
            const { data } = await getProducts();
            setProducts(data);
        } catch (err) {
            console.error('Failed to fetch products', err);
        } finally {
            setLoading(false);
        }
    };

    const fetchSuppliers = async () => {
        try {
            const { data } = await getSuppliers();
            setSuppliers(data);
        } catch (err) {
            console.error('Failed to fetch suppliers', err);
        }
    };

    const handleDelete = async (id) => {
        if (window.confirm('Are you sure you want to delete this product?')) {
            try {
                await deleteProduct(id);
                fetchProducts();
            } catch (err) {
                alert('Delete failed');
            }
        }
    };

    const handleOpenModal = (product = null) => {
        if (product) {
            setEditingProduct(product);
            setFormData({
                sku: product.sku,
                name: product.name,
                category: product.category || '',
                price: product.price,
                cost: product.cost,
                stock: product.stock,
                reorderLevel: product.reorderLevel,
                supplier: product.supplier?._id || ''
            });
        } else {
            setEditingProduct(null);
            setFormData({
                sku: '',
                name: '',
                category: '',
                price: '',
                cost: '',
                stock: '',
                reorderLevel: '10',
                supplier: ''
            });
        }
        setShowModal(true);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            if (editingProduct) {
                await updateProduct(editingProduct._id, formData);
            } else {
                await createProduct(formData);
            }
            setShowModal(false);
            fetchProducts();
        } catch (err) {
            alert('Operation failed');
        }
    };

    const filteredProducts = products.filter(p =>
        p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        p.sku.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <div className="space-y-6">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-bold text-white">Products</h1>
                    <p className="text-slate-400 mt-1">Manage your inventory catalog</p>
                </div>
                {isAdminOrManager && (
                    <button
                        onClick={() => handleOpenModal()}
                        className="flex items-center justify-center gap-2 px-6 py-3 bg-primary-600 hover:bg-primary-700 text-white font-semibold rounded-xl transition-all shadow-lg shadow-primary-600/20 active:scale-[0.98]"
                    >
                        <Plus size={20} />
                        Add Product
                    </button>
                )}
            </div>

            {/* Filters */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="md:col-span-2 relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-500">
                        <Search size={18} />
                    </div>
                    <input
                        type="text"
                        placeholder="Search products by name or SKU..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="block w-full pl-10 pr-4 py-3 bg-slate-900 border border-slate-800 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-primary-500 transition-all"
                    />
                </div>
                <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-500">
                        <Filter size={18} />
                    </div>
                    <select className="block w-full pl-10 pr-10 py-3 bg-slate-900 border border-slate-800 rounded-xl text-white appearance-none focus:outline-none focus:ring-2 focus:ring-primary-500 transition-all">
                        <option>All Categories</option>
                        <option>Electronics</option>
                        <option>Accessories</option>
                    </select>
                </div>
            </div>

            {/* Product Table */}
            <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden shadow-sm">
                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="bg-slate-800/50 text-slate-400 text-sm font-medium uppercase tracking-wider">
                                <th className="px-6 py-4">Product</th>
                                <th className="px-6 py-4">SKU</th>
                                <th className="px-6 py-4">Category</th>
                                <th className="px-6 py-4">Price/Cost</th>
                                <th className="px-6 py-4">Stock</th>
                                <th className="px-6 py-4">Supplier</th>
                                <th className="px-6 py-4 text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-800">
                            {filteredProducts.map((product) => (
                                <tr key={product._id} className="hover:bg-slate-800/30 transition-colors group">
                                    <td className="px-6 py-4">
                                        <div className="flex items-center gap-3">
                                            <div className="w-10 h-10 bg-slate-800 rounded-lg flex items-center justify-center text-primary-500">
                                                <PackageIcon size={20} />
                                            </div>
                                            <span className="font-semibold text-white">{product.name}</span>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 text-slate-400 font-mono text-sm">{product.sku}</td>
                                    <td className="px-6 py-4 text-slate-400">{product.category}</td>
                                    <td className="px-6 py-4">
                                        <div>
                                            <p className="text-white font-medium">${product.price}</p>
                                            <p className="text-xs text-slate-500">Cost: ${product.cost}</p>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4">
                                        <div className="flex items-center gap-2">
                                            <span className={`px-2.5 py-1 rounded-full text-xs font-bold ${product.stock <= product.reorderLevel
                                                    ? 'bg-rose-500/10 text-rose-500'
                                                    : 'bg-emerald-500/10 text-emerald-500'
                                                }`}>
                                                {product.stock} units
                                            </span>
                                            {product.stock <= product.reorderLevel && (
                                                <AlertCircle size={14} className="text-rose-500" />
                                            )}
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 text-slate-400">{product.supplier?.name || 'N/A'}</td>
                                    <td className="px-6 py-4 text-right">
                                        <div className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                            <button
                                                onClick={() => handleOpenModal(product)}
                                                className="p-2 text-slate-400 hover:text-white hover:bg-slate-700 rounded-lg transition-colors"
                                            >
                                                <Edit2 size={18} />
                                            </button>
                                            <button
                                                onClick={() => handleDelete(product._id)}
                                                className="p-2 text-slate-400 hover:text-rose-500 hover:bg-rose-500/10 rounded-lg transition-colors"
                                            >
                                                <Trash2 size={18} />
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                    {filteredProducts.length === 0 && !loading && (
                        <div className="p-12 text-center">
                            <div className="inline-flex items-center justify-center w-12 h-12 bg-slate-800 rounded-full text-slate-500 mb-4">
                                <Search size={24} />
                            </div>
                            <h3 className="text-lg font-medium text-white mb-1">No products found</h3>
                            <p className="text-slate-500">Try adjusting your filters or adding a new product.</p>
                        </div>
                    )}
                </div>
            </div>

            {/* Modal Integration */}
            {showModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm">
                    <div className="bg-slate-900 border border-slate-800 w-full max-w-2xl rounded-2xl shadow-2xl animate-in zoom-in-95 duration-200">
                        <div className="p-6 border-b border-slate-800 flex items-center justify-between">
                            <h2 className="text-xl font-bold text-white">{editingProduct ? 'Edit Product' : 'Add New Product'}</h2>
                            <button onClick={() => setShowModal(false)} className="text-slate-400 hover:text-white transition-colors">
                                <Plus size={24} className="rotate-45" />
                            </button>
                        </div>
                        <form onSubmit={handleSubmit} className="p-6 space-y-4">
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-slate-400 mb-1.5">SKU</label>
                                    <input
                                        required
                                        value={formData.sku}
                                        onChange={(e) => setFormData({ ...formData, sku: e.target.value })}
                                        className="w-full px-4 py-2.5 bg-slate-800 border border-slate-700 rounded-xl text-white focus:ring-2 focus:ring-primary-500 outline-none transition-all"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-slate-400 mb-1.5">Name</label>
                                    <input
                                        required
                                        value={formData.name}
                                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                        className="w-full px-4 py-2.5 bg-slate-800 border border-slate-700 rounded-xl text-white focus:ring-2 focus:ring-primary-500 outline-none transition-all"
                                    />
                                </div>
                            </div>
                            <div className="grid grid-cols-3 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-slate-400 mb-1.5">Category</label>
                                    <input
                                        value={formData.category}
                                        onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                                        className="w-full px-4 py-2.5 bg-slate-800 border border-slate-700 rounded-xl text-white focus:ring-2 focus:ring-primary-500 outline-none transition-all"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-slate-400 mb-1.5">Price ($)</label>
                                    <input
                                        type="number"
                                        required
                                        value={formData.price}
                                        onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                                        className="w-full px-4 py-2.5 bg-slate-800 border border-slate-700 rounded-xl text-white focus:ring-2 focus:ring-primary-500 outline-none transition-all"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-slate-400 mb-1.5">Cost ($)</label>
                                    <input
                                        type="number"
                                        required
                                        value={formData.cost}
                                        onChange={(e) => setFormData({ ...formData, cost: e.target.value })}
                                        className="w-full px-4 py-2.5 bg-slate-800 border border-slate-700 rounded-xl text-white focus:ring-2 focus:ring-primary-500 outline-none transition-all"
                                    />
                                </div>
                            </div>
                            <div className="grid grid-cols-3 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-slate-400 mb-1.5">Stock</label>
                                    <input
                                        type="number"
                                        required
                                        value={formData.stock}
                                        onChange={(e) => setFormData({ ...formData, stock: e.target.value })}
                                        className="w-full px-4 py-2.5 bg-slate-800 border border-slate-700 rounded-xl text-white focus:ring-2 focus:ring-primary-500 outline-none transition-all"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-slate-400 mb-1.5">Reorder Level</label>
                                    <input
                                        type="number"
                                        required
                                        value={formData.reorderLevel}
                                        onChange={(e) => setFormData({ ...formData, reorderLevel: e.target.value })}
                                        className="w-full px-4 py-2.5 bg-slate-800 border border-slate-700 rounded-xl text-white focus:ring-2 focus:ring-primary-500 outline-none transition-all"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-slate-400 mb-1.5">Supplier</label>
                                    <select
                                        value={formData.supplier}
                                        onChange={(e) => setFormData({ ...formData, supplier: e.target.value })}
                                        className="w-full px-4 py-2.5 bg-slate-800 border border-slate-700 rounded-xl text-white focus:ring-2 focus:ring-primary-500 outline-none transition-all"
                                    >
                                        <option value="">Select Supplier</option>
                                        {suppliers.map(s => (
                                            <option key={s._id} value={s._id}>{s.name}</option>
                                        ))}
                                    </select>
                                </div>
                            </div>
                            <div className="flex justify-end gap-3 pt-4">
                                <button
                                    type="button"
                                    onClick={() => setShowModal(false)}
                                    className="px-6 py-2.5 text-slate-400 hover:text-white transition-colors"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    className="px-8 py-2.5 bg-primary-600 hover:bg-primary-700 text-white font-semibold rounded-xl transition-all shadow-lg shadow-primary-600/20 active:scale-[0.98]"
                                >
                                    {editingProduct ? 'Update Product' : 'Create Product'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Products;
