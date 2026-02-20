import { useState, useEffect } from 'react';
import {
    Plus,
    Search,
    ShoppingCart,
    ChevronRight,
    Clock,
    CheckCircle2,
    XCircle,
    Package,
    Calendar,
    User as UserIcon
} from 'lucide-react';
import { getOrders, createOrder, getProducts, updateOrderStatus } from '../services/api';

const OrderStatusBadge = ({ status }) => {
    const styles = {
        'Pending': 'bg-amber-500/10 text-amber-500 border-amber-500/20',
        'Processing': 'bg-primary-500/10 text-primary-500 border-primary-500/20',
        'Shipped': 'bg-violet-500/10 text-violet-500 border-violet-500/20',
        'Delivered': 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20',
        'Cancelled': 'bg-rose-500/10 text-rose-500 border-rose-500/20',
    };

    return (
        <span className={`px-3 py-1 rounded-full text-xs font-bold border ${styles[status]}`}>
            {status}
        </span>
    );
};

const Orders = () => {
    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [showModal, setShowModal] = useState(false);
    const [products, setProducts] = useState([]);

    // Create Order State
    const [newOrder, setNewOrder] = useState({
        customerName: '',
        shippingAddress: '',
        items: [{ product: '', quantity: 1, price: 0 }]
    });

    useEffect(() => {
        fetchOrders();
        fetchProducts();
    }, []);

    const fetchOrders = async () => {
        try {
            const { data } = await getOrders();
            setOrders(data);
        } catch (err) {
            console.error('Failed to fetch orders', err);
        } finally {
            setLoading(false);
        }
    };

    const fetchProducts = async () => {
        try {
            const { data } = await getProducts();
            setProducts(data);
        } catch (err) {
            console.error('Failed to fetch products', err);
        }
    };

    const handleAddItem = () => {
        setNewOrder({
            ...newOrder,
            items: [...newOrder.items, { product: '', quantity: 1, price: 0 }]
        });
    };

    const handleItemChange = (index, field, value) => {
        const updatedItems = [...newOrder.items];
        updatedItems[index][field] = value;

        // Auto-update price if product changes
        if (field === 'product') {
            const selectedProduct = products.find(p => p._id === value);
            if (selectedProduct) {
                updatedItems[index].price = selectedProduct.price;
            }
        }

        setNewOrder({ ...newOrder, items: updatedItems });
    };

    const calculateTotal = () => {
        return newOrder.items.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            await createOrder(newOrder);
            setShowModal(false);
            fetchOrders();
            setNewOrder({
                customerName: '',
                shippingAddress: '',
                items: [{ product: '', quantity: 1, price: 0 }]
            });
        } catch (err) {
            alert(err.response?.data?.message || 'Failed to create order');
        }
    };

    const filteredOrders = orders.filter(o =>
        o.orderNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
        o.customerName.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <div className="space-y-6">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-bold text-white">Orders</h1>
                    <p className="text-slate-400 mt-1">Track and manage customer orders</p>
                </div>
                <button
                    onClick={() => setShowModal(true)}
                    className="flex items-center justify-center gap-2 px-6 py-3 bg-primary-600 hover:bg-primary-700 text-white font-semibold rounded-xl transition-all shadow-lg shadow-primary-600/20 active:scale-[0.98]"
                >
                    <Plus size={20} />
                    Create Order
                </button>
            </div>

            {/* Search */}
            <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-500">
                    <Search size={18} />
                </div>
                <input
                    type="text"
                    placeholder="Search orders by number or customer name..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="block w-full pl-10 pr-4 py-3 bg-slate-900 border border-slate-800 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-primary-500 transition-all"
                />
            </div>

            {/* Orders Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {filteredOrders.map((order) => (
                    <div key={order._id} className="bg-slate-900 border border-slate-800 rounded-2xl p-6 hover:border-slate-700 transition-all group">
                        <div className="flex items-start justify-between mb-4">
                            <div>
                                <div className="flex items-center gap-3 mb-1">
                                    <h3 className="text-lg font-bold text-white uppercase">{order.orderNumber}</h3>
                                    <OrderStatusBadge status={order.status} />
                                </div>
                                <div className="flex items-center gap-4 text-sm text-slate-500">
                                    <span className="flex items-center gap-1"><Calendar size={14} /> {new Date(order.createdAt).toLocaleDateString()}</span>
                                    <span className="flex items-center gap-1"><UserIcon size={14} /> {order.customerName}</span>
                                </div>
                            </div>
                            <p className="text-xl font-bold text-white">${order.totalAmount.toLocaleString()}</p>
                        </div>

                        <div className="space-y-3 mb-6">
                            {order.items.slice(0, 2).map((item, idx) => (
                                <div key={idx} className="flex items-center justify-between text-sm">
                                    <span className="text-slate-400">{item.name || 'Unnamed Product'} <span className="text-slate-600">x{item.quantity}</span></span>
                                    <span className="text-slate-300 font-medium">${(item.price * item.quantity).toLocaleString()}</span>
                                </div>
                            ))}
                            {order.items.length > 2 && (
                                <p className="text-xs text-slate-500">+{order.items.length - 2} more items</p>
                            )}
                        </div>

                        <div className="flex items-center justify-between pt-4 border-t border-slate-800">
                            <span className="text-xs text-slate-500 italic">Created by {order.createdBy?.name || 'Unknown'}</span>
                            <button className="flex items-center gap-1 text-primary-400 hover:text-primary-300 text-sm font-semibold transition-colors">
                                View Details <ChevronRight size={16} />
                            </button>
                        </div>
                    </div>
                ))}
                {filteredOrders.length === 0 && !loading && (
                    <div className="lg:col-span-2 p-12 text-center bg-slate-900/50 border border-dashed border-slate-800 rounded-2xl">
                        <div className="inline-flex items-center justify-center w-12 h-12 bg-slate-800 rounded-full text-slate-500 mb-4">
                            <ShoppingCart size={24} />
                        </div>
                        <h3 className="text-lg font-medium text-white mb-1">No orders found</h3>
                        <p className="text-slate-500">Try searching for a different order or create a new one.</p>
                    </div>
                )}
            </div>

            {/* Create Order Modal */}
            {showModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm">
                    <div className="bg-slate-900 border border-slate-800 w-full max-w-3xl rounded-2xl shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200">
                        <div className="p-6 border-b border-slate-800 flex items-center justify-between bg-slate-900/50">
                            <div>
                                <h2 className="text-xl font-bold text-white">Create New Order</h2>
                                <p className="text-xs text-slate-500">Fill in the details to process a new transaction</p>
                            </div>
                            <button onClick={() => setShowModal(false)} className="text-slate-400 hover:text-white transition-colors">
                                <Plus size={24} className="rotate-45" />
                            </button>
                        </div>
                        <form onSubmit={handleSubmit} className="p-6 space-y-6">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-slate-400 mb-1.5">Customer Name</label>
                                    <input
                                        required
                                        value={newOrder.customerName}
                                        onChange={(e) => setNewOrder({ ...newOrder, customerName: e.target.value })}
                                        placeholder="Enter customer name"
                                        className="w-full px-4 py-2.5 bg-slate-800 border border-slate-700 rounded-xl text-white focus:ring-2 focus:ring-primary-500 outline-none transition-all"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-slate-400 mb-1.5">Shipping Address</label>
                                    <input
                                        required
                                        value={newOrder.shippingAddress}
                                        onChange={(e) => setNewOrder({ ...newOrder, shippingAddress: e.target.value })}
                                        placeholder="123 Street, City, Country"
                                        className="w-full px-4 py-2.5 bg-slate-800 border border-slate-700 rounded-xl text-white focus:ring-2 focus:ring-primary-500 outline-none transition-all"
                                    />
                                </div>
                            </div>

                            <div>
                                <div className="flex items-center justify-between mb-3">
                                    <label className="block text-sm font-medium text-slate-400">Order Items</label>
                                    <button
                                        type="button"
                                        onClick={handleAddItem}
                                        className="text-primary-400 hover:text-primary-300 text-xs font-bold flex items-center gap-1 px-2 py-1 rounded-lg hover:bg-primary-500/10 transition-colors"
                                    >
                                        <Plus size={14} /> Add Product
                                    </button>
                                </div>
                                <div className="space-y-3 max-h-60 overflow-y-auto pr-2 custom-scrollbar">
                                    {newOrder.items.map((item, idx) => (
                                        <div key={idx} className="flex gap-3 items-end p-4 bg-slate-800/50 rounded-xl border border-slate-700/50">
                                            <div className="flex-1">
                                                <label className="block text-[10px] uppercase tracking-wider font-bold text-slate-500 mb-1">Select Product</label>
                                                <select
                                                    required
                                                    value={item.product}
                                                    onChange={(e) => handleItemChange(idx, 'product', e.target.value)}
                                                    className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-lg text-white text-sm focus:ring-1 focus:ring-primary-500 outline-none transition-all"
                                                >
                                                    <option value="">Choose...</option>
                                                    {products.map(p => (
                                                        <option key={p._id} value={p._id} disabled={p.stock <= 0}>
                                                            {p.name} ({p.stock} available) - ${p.price}
                                                        </option>
                                                    ))}
                                                </select>
                                            </div>
                                            <div className="w-24">
                                                <label className="block text-[10px] uppercase tracking-wider font-bold text-slate-500 mb-1">Qty</label>
                                                <input
                                                    type="number"
                                                    min="1"
                                                    required
                                                    value={item.quantity}
                                                    onChange={(e) => handleItemChange(idx, 'quantity', parseInt(e.target.value))}
                                                    className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-lg text-white text-sm focus:ring-1 focus:ring-primary-500 outline-none transition-all"
                                                />
                                            </div>
                                            <div className="w-28">
                                                <label className="block text-[10px] uppercase tracking-wider font-bold text-slate-500 mb-1">Subtotal</label>
                                                <div className="px-3 py-2 bg-slate-900 border border-slate-700 rounded-lg text-slate-400 text-sm">
                                                    ${(item.price * item.quantity).toLocaleString()}
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>

                            <div className="flex items-center justify-between p-6 bg-slate-800/30 rounded-2xl border border-slate-700/50">
                                <div>
                                    <p className="text-slate-500 text-sm">Total Amount</p>
                                    <p className="text-3xl font-bold text-white">${calculateTotal().toLocaleString()}</p>
                                </div>
                                <div className="flex gap-3">
                                    <button
                                        type="button"
                                        onClick={() => setShowModal(false)}
                                        className="px-6 py-2.5 text-slate-400 hover:text-white transition-colors"
                                    >
                                        Cancel
                                    </button>
                                    <button
                                        type="submit"
                                        className="px-10 py-3 bg-primary-600 hover:bg-primary-700 text-white font-bold rounded-xl transition-all shadow-lg shadow-primary-600/20 active:scale-[0.98]"
                                    >
                                        Place Order
                                    </button>
                                </div>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Orders;
