const mongoose = require('mongoose');

const supplierSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
    },
    contactPerson: String,
    email: String,
    phone: String,
    address: String,
    categories: [String],
}, { timestamps: true });

module.exports = mongoose.model('Supplier', supplierSchema);
