import { useState, useEffect } from 'react';
import {
    Package,
    ShoppingCart,
    AlertTriangle,
    TrendingUp,
    ArrowUpRight,
    ArrowDownRight,
    Clock
} from 'lucide-react';
import {
    BarChart,
    Bar,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer,
    AreaChart,
    Area
} from 'recharts';
import { getDashboardStats } from '../services/api';

const StatCard = ({ title, value, icon, color, trend, trendValue }) => (
    <div className="bg-slate-900 border border-slate-800 p-6 rounded-2xl shadow-sm">
        <div className="flex items-center justify-between mb-4">
            <div className={`p-3 rounded-xl ${color} bg-opacity-10`}>
                {icon}
            </div>
            {trend && (
                <div className={`flex items-center gap-1 text-sm font-medium ${trend === 'up' ? 'text-emerald-500' : 'text-rose-500'}`}>
                    {trend === 'up' ? <ArrowUpRight size={16} /> : <ArrowDownRight size={16} />}
                    {trendValue}
                </div>
            )}
        </div>
        <h3 className="text-slate-400 text-sm font-medium mb-1">{title}</h3>
        <p className="text-2xl font-bold text-white">{value}</p>
    </div>
);

const Dashboard = () => {
    const [stats, setStats] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchStats();
    }, []);

    const fetchStats = async () => {
        try {
            const { data } = await getDashboardStats();
            setStats(data);
        } catch (err) {
            console.error('Failed to fetch stats', err);
        } finally {
            setLoading(false);
        }
    };

    if (loading) return <div className="animate-pulse space-y-8">...</div>;

    return (
        <div className="space-y-8 animate-in fade-in duration-500">
            <header>
                <h1 className="text-3xl font-bold text-white">Dashboard</h1>
                <p className="text-slate-400 mt-1">Overview of your business performance</p>
            </header>

            {/* Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <StatCard
                    title="Total Products"
                    value={stats?.summary?.totalProducts || 0}
                    icon={<Package className="text-primary-500" />}
                    color="bg-primary-500"
                    trend="up"
                    trendValue="12%"
                />
                <StatCard
                    title="Low Stock Alert"
                    value={stats?.summary?.lowStockProducts || 0}
                    icon={<AlertTriangle className="text-amber-500" />}
                    color="bg-amber-500"
                />
                <StatCard
                    title="Pending Orders"
                    value={stats?.summary?.pendingOrders || 0}
                    icon={<ShoppingCart className="text-emerald-500" />}
                    color="bg-emerald-500"
                    trend="down"
                    trendValue="5%"
                />
                <StatCard
                    title="Total Sales"
                    value={`$${stats?.summary?.totalSales?.toLocaleString() || 0}`}
                    icon={<TrendingUp className="text-violet-500" />}
                    color="bg-violet-500"
                    trend="up"
                    trendValue="24%"
                />
            </div>

            {/* Charts Section */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* Sales Trend */}
                <div className="bg-slate-900 border border-slate-800 p-6 rounded-2xl">
                    <div className="flex items-center justify-between mb-6">
                        <h3 className="text-lg font-semibold text-white">Sales Trend</h3>
                        <button className="text-sm text-primary-400 hover:text-primary-300">View Details</button>
                    </div>
                    <div className="h-80 w-full">
                        <ResponsiveContainer width="100%" height="100%">
                            <AreaChart data={stats?.recentSales || []}>
                                <defs>
                                    <linearGradient id="colorTotal" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="5%" stopColor="#0ea5e9" stopOpacity={0.3} />
                                        <stop offset="95%" stopColor="#0ea5e9" stopOpacity={0} />
                                    </linearGradient>
                                </defs>
                                <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" vertical={false} />
                                <XAxis dataKey="_id" stroke="#64748b" fontSize={12} tickLine={false} axisLine={false} />
                                <YAxis stroke="#64748b" fontSize={12} tickLine={false} axisLine={false} />
                                <Tooltip
                                    contentStyle={{ backgroundColor: '#0f172a', border: '1px solid #1e293b', borderRadius: '8px' }}
                                    itemStyle={{ color: '#0ea5e9' }}
                                />
                                <Area type="monotone" dataKey="total" stroke="#0ea5e9" fillOpacity={1} fill="url(#colorTotal)" />
                            </AreaChart>
                        </ResponsiveContainer>
                    </div>
                </div>

                {/* Categories Distribution */}
                <div className="bg-slate-900 border border-slate-800 p-6 rounded-2xl">
                    <div className="flex items-center justify-between mb-6">
                        <h3 className="text-lg font-semibold text-white">Stock by Category</h3>
                        <button className="text-sm text-primary-400 hover:text-primary-300">View Details</button>
                    </div>
                    <div className="h-80 w-full">
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={stats?.categoriesStats || []}>
                                <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" vertical={false} />
                                <XAxis dataKey="_id" stroke="#64748b" fontSize={12} tickLine={false} axisLine={false} />
                                <YAxis stroke="#64748b" fontSize={12} tickLine={false} axisLine={false} />
                                <Tooltip
                                    contentStyle={{ backgroundColor: '#0f172a', border: '1px solid #1e293b', borderRadius: '8px' }}
                                    cursor={{ fill: '#1e293b' }}
                                />
                                <Bar dataKey="totalStock" fill="#8b5cf6" radius={[4, 4, 0, 0]} barSize={40} />
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                </div>
            </div>

            {/* Bottom Section */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Low Stock Alerts */}
                <div className="lg:col-span-1 bg-slate-900 border border-slate-800 p-6 rounded-2xl h-fit">
                    <div className="flex items-center gap-2 mb-6">
                        <AlertTriangle className="text-amber-500" size={20} />
                        <h3 className="text-lg font-semibold text-white">Low Stock Alerts</h3>
                    </div>
                    <div className="space-y-4">
                        {stats?.summary?.lowStockProducts > 0 ? (
                            <p className="text-slate-400 text-sm">You have {stats.summary.lowStockProducts} products running low. Check the products page to reorder.</p>
                        ) : (
                            <div className="text-center py-4">
                                <CheckCircle2 className="text-emerald-500 mx-auto mb-2" size={24} />
                                <p className="text-slate-400 text-sm">All inventory levels are healthy.</p>
                            </div>
                        )}
                        <button className="w-full py-2 bg-slate-800 hover:bg-slate-700 text-white rounded-xl text-sm transition-colors mt-4">
                            View Low Stock Products
                        </button>
                    </div>
                </div>

                {/* Recent Activity / Log */}
                <div className="lg:col-span-2 bg-slate-900 border border-slate-800 p-6 rounded-2xl">
                    <div className="flex items-center gap-2 mb-6">
                        <Clock className="text-slate-400" size={20} />
                        <h3 className="text-lg font-semibold text-white">Recent Activity</h3>
                    </div>
                    <div className="space-y-4">
                        <div className="flex items-center justify-between p-4 bg-slate-800/30 rounded-xl border border-slate-800">
                            <div className="flex items-center gap-3">
                                <div className="w-8 h-8 bg-emerald-500/10 rounded-full flex items-center justify-center text-emerald-500">
                                    <ShoppingCart size={14} />
                                </div>
                                <div>
                                    <p className="text-sm font-medium text-white">New Order #ORD-12345</p>
                                    <p className="text-xs text-slate-500">by Admin User • 2 hours ago</p>
                                </div>
                            </div>
                            <span className="text-sm font-bold text-white">$1,200</span>
                        </div>
                        <div className="flex items-center justify-between p-4 bg-slate-800/30 rounded-xl border border-slate-800">
                            <div className="flex items-center gap-3">
                                <div className="w-8 h-8 bg-primary-500/10 rounded-full flex items-center justify-center text-primary-500">
                                    <Package className="size-14" />
                                </div>
                                <div>
                                    <p className="text-sm font-medium text-white">Stock Adjusted: Laptop Pro</p>
                                    <p className="text-xs text-slate-500">by Manager • 5 hours ago</p>
                                </div>
                            </div>
                            <span className="text-sm font-bold text-emerald-500">+10</span>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

const CheckCircle2 = ({ className, size }) => (
    <svg
        xmlns="http://www.w3.org/2000/svg"
        width={size}
        height={size}
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        className={className}
    >
        <path d="M12 22c5.523 0 10-4.477 10-10S17.523 2 12 2 2 6.477 2 12s4.477 10 10 10z" /><path d="m9 12 2 2 4-4" />
    </svg>
);

export default Dashboard;
