const Order = require('../models/Order');
const Product = require('../models/Product');
const StockLog = require('../models/StockLog');

exports.getOrders = async (req, res) => {
    try {
        const orders = await Order.find().populate('createdBy', 'name').sort({ createdAt: -1 });
        res.json(orders);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

exports.getOrder = async (req, res) => {
    try {
        const order = await Order.findById(req.params.id).populate('items.product').populate('createdBy', 'name');
        if (!order) return res.status(404).json({ message: 'Order not found' });
        res.json(order);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

exports.createOrder = async (req, res) => {
    try {
        const { customerName, items, shippingAddress } = req.body;

        // Calculate total and validate stock
        let totalAmount = 0;
        for (const item of items) {
            const product = await Product.findById(item.product);
            if (!product) throw new Error(`Product ${item.product} not found`);
            if (product.stock < item.quantity) throw new Error(`Insufficient stock for ${product.name}`);

            totalAmount += item.price * item.quantity;
        }

        const orderNumber = `ORD-${Date.now()}`;
        const order = new Order({
            orderNumber,
            customerName,
            items,
            totalAmount,
            shippingAddress,
            createdBy: req.user._id
        });

        await order.save();

        // Update stock and log
        for (const item of items) {
            const product = await Product.findById(item.product);
            product.stock -= item.quantity;
            await product.save();

            const log = new StockLog({
                product: product._id,
                change: -item.quantity,
                type: 'Order',
                reason: `Order ${orderNumber}`,
                user: req.user._id
            });
            await log.save();
        }

        res.status(201).json(order);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
};

exports.updateOrderStatus = async (req, res) => {
    try {
        const { status, paymentStatus } = req.body;
        const order = await Order.findById(req.params.id);
        if (!order) return res.status(404).json({ message: 'Order not found' });

        if (status) order.status = status;
        if (paymentStatus) order.paymentStatus = paymentStatus;

        await order.save();
        res.json(order);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
};
