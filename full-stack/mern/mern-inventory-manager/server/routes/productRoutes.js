const express = require('express');
const router = express.Router();
const productController = require('../controllers/productController');
const { auth, authorize } = require('../middleware/auth');

router.get('/', auth, productController.getProducts);
router.get('/:id', auth, productController.getProduct);
router.post('/', auth, authorize(['Admin', 'Manager']), productController.createProduct);
router.put('/:id', auth, authorize(['Admin', 'Manager']), productController.updateProduct);
router.delete('/:id', auth, authorize(['Admin']), productController.deleteProduct);
router.post('/:id/adjust-stock', auth, authorize(['Admin', 'Manager', 'Staff']), productController.adjustStock);
router.get('/:id/history', auth, productController.getStockHistory);

module.exports = router;
