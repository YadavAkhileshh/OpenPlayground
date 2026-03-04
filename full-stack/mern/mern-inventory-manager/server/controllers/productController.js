const Product = require('../models/Product');
const StockLog = require('../models/StockLog');

exports.getProducts = async (req, res) => {
    try {
        const products = await Product.find().populate('supplier', 'name');
        res.json(products);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

exports.getProduct = async (req, res) => {
    try {
        const product = await Product.findById(req.params.id).populate('supplier');
        if (!product) return res.status(404).json({ message: 'Product not found' });
        res.json(product);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

exports.createProduct = async (req, res) => {
    try {
        const product = new Product(req.body);
        await product.save();

        // Log initial stock
        const log = new StockLog({
            product: product._id,
            change: product.stock,
            type: 'Addition',
            reason: 'Initial stock on creation',
            user: req.user._id
        });
        await log.save();

        res.status(201).json(product);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
};

exports.updateProduct = async (req, res) => {
    try {
        const product = await Product.findByIdAndUpdate(req.params.id, req.body, { new: true });
        if (!product) return res.status(404).json({ message: 'Product not found' });
        res.json(product);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
};

exports.deleteProduct = async (req, res) => {
    try {
        const product = await Product.findByIdAndDelete(req.params.id);
        if (!product) return res.status(404).json({ message: 'Product not found' });
        res.json({ message: 'Product deleted' });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

exports.adjustStock = async (req, res) => {
    try {
        const { id } = req.params;
        const { change, type, reason } = req.body;

        const product = await Product.findById(id);
        if (!product) return res.status(404).json({ message: 'Product not found' });

        product.stock += change;
        await product.save();

        const log = new StockLog({
            product: id,
            change,
            type,
            reason,
            user: req.user._id
        });
        await log.save();

        res.json(product);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
};

exports.getStockHistory = async (req, res) => {
    try {
        const history = await StockLog.find({ product: req.params.id })
            .populate('user', 'name')
            .sort({ createdAt: -1 });
        res.json(history);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};
