import axios from 'axios';

const api = axios.create({
    baseURL: 'http://localhost:5000/api',
});

// Products
export const getProducts = () => api.get('/products');
export const getProduct = (id) => api.get(`/products/${id}`);
export const createProduct = (data) => api.post('/products', data);
export const updateProduct = (id, data) => api.put(`/products/${id}`, data);
export const deleteProduct = (id) => api.delete(`/products/${id}`);
export const adjustStock = (id, data) => api.post(`/products/${id}/adjust-stock`, data);
export const getProductHistory = (id) => api.get(`/products/${id}/history`);

// Orders
export const getOrders = () => api.get('/orders');
export const getOrder = (id) => api.get(`/orders/${id}`);
export const createOrder = (data) => api.post('/orders', data);
export const updateOrderStatus = (id, statusData) => api.put(`/orders/${id}/status`, statusData);

// Suppliers
export const getSuppliers = () => api.get('/suppliers');
export const createSupplier = (data) => api.post('/suppliers', data);
export const updateSupplier = (id, data) => api.put(`/suppliers/${id}`, data);
export const deleteSupplier = (id) => api.delete(`/suppliers/${id}`);

// Reports
export const getDashboardStats = () => api.get('/reports/dashboard');

export default api;
