const mongoose = require('mongoose');
const dotenv = require('dotenv');
const User = require('./models/User');
const Product = require('./models/Product');
const Supplier = require('./models/Supplier');

dotenv.config();

const seedData = async () => {
    try {
        await mongoose.connect(process.env.MONGODB_URI);
        console.log('Connected to MongoDB for seeding...');

        // Clear existing data
        await User.deleteMany({});
        await Product.deleteMany({});
        await Supplier.deleteMany({});

        // Create Admin User
        const admin = new User({
            name: 'Admin User',
            email: 'admin@example.com',
            password: 'password123',
            role: 'Admin'
        });
        await admin.save();
        console.log('Admin user created');

        // Create Suppliers
        const suppliers = await Supplier.insertMany([
            { name: 'Tech Solutions Inc', contactPerson: 'John Doe', email: 'john@techsolutions.com', phone: '123-456-7890' },
            { name: 'Office Depot', contactPerson: 'Jane Smith', email: 'jane@officedepot.com', phone: '098-765-4321' }
        ]);
        console.log('Suppliers created');

        // Create Products
        await Product.insertMany([
            {
                sku: 'LAP-001',
                name: 'High-End Laptop',
                description: 'Powerful laptop for pro users',
                category: 'Electronics',
                price: 1200,
                cost: 800,
                stock: 50,
                reorderLevel: 10,
                supplier: suppliers[0]._id
            },
            {
                sku: 'MOU-001',
                name: 'Wireless Mouse',
                description: 'Ergonomic wireless mouse',
                category: 'Accessories',
                price: 25,
                cost: 10,
                stock: 5,
                reorderLevel: 20,
                supplier: suppliers[1]._id
            },
            {
                sku: 'MON-001',
                name: '4K Monitor',
                description: '32-inch 4K resolution monitor',
                category: 'Electronics',
                price: 400,
                cost: 250,
                stock: 15,
                reorderLevel: 5,
                supplier: suppliers[0]._id
            }
        ]);
        console.log('Products created');

        console.log('Seeding completed successfully!');
        process.exit();
    } catch (error) {
        console.error('Seeding error:', error);
        process.exit(1);
    }
};

seedData();
