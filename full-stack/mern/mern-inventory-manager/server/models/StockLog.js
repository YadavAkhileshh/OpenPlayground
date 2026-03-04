const mongoose = require('mongoose');

const stockLogSchema = new mongoose.Schema({
    product: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Product',
        required: true,
    },
    change: {
        type: Number,
        required: true,
    },
    type: {
        type: String,
        enum: ['Addition', 'Reduction', 'Adjustment', 'Order'],
        required: true,
    },
    reason: String,
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
    },
}, { timestamps: true });

module.exports = mongoose.model('StockLog', stockLogSchema);
