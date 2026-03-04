const Product = require('../models/Product');
const Order = require('../models/Order');
const Supplier = require('../models/Supplier');

exports.getDashboardStats = async (req, res) => {
    try {
        const totalProducts = await Product.countDocuments();
        const lowStockProducts = await Product.countDocuments({ $expr: { $lte: ['$stock', '$reorderLevel'] } });
        const pendingOrders = await Order.countDocuments({ status: 'Pending' });
        const totalOrders = await Order.countDocuments();

        // Calculate total sales
        const salesData = await Order.aggregate([
            { $match: { status: { $ne: 'Cancelled' } } },
            { $group: { _id: null, totalSales: { $sum: '$totalAmount' } } }
        ]);
        const totalSales = salesData.length > 0 ? salesData[0].totalSales : 0;

        // Sales by date (last 7 days)
        const sevenDaysAgo = new Date();
        sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
        const recentSales = await Order.aggregate([
            { $match: { createdAt: { $gte: sevenDaysAgo }, status: { $ne: 'Cancelled' } } },
            {
                $group: {
                    _id: { $dateToString: { format: "%Y-%m-%d", date: "$createdAt" } },
                    total: { $sum: "$totalAmount" },
                    count: { $sum: 1 }
                }
            },
            { $sort: { _id: 1 } }
        ]);

        // Top categories
        const categoriesStats = await Product.aggregate([
            { $group: { _id: '$category', count: { $sum: 1 }, totalStock: { $sum: '$stock' } } }
        ]);

        res.json({
            summary: {
                totalProducts,
                lowStockProducts,
                pendingOrders,
                totalOrders,
                totalSales
            },
            recentSales,
            categoriesStats
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};
