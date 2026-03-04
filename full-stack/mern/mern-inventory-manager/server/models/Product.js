const mongoose = require('mongoose');

const productSchema = new mongoose.Schema({
    sku: {
        type: String,
        required: true,
        unique: true,
    },
    name: {
        type: String,
        required: true,
    },
    description: String,
    category: String,
    price: {
        type: Number,
        required: true,
    },
    cost: {
        type: Number,
        required: true,
    },
    stock: {
        type: Number,
        default: 0,
    },
    reorderLevel: {
        type: Number,
        default: 10,
    },
    supplier: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Supplier',
    },
    imageUrl: String,
}, { timestamps: true });

module.exports = mongoose.model('Product', productSchema);
