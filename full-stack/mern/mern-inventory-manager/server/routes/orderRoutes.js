const express = require('express');
const router = express.Router();
const orderController = require('../controllers/orderController');
const { auth, authorize } = require('../middleware/auth');

router.get('/', auth, orderController.getOrders);
router.get('/:id', auth, orderController.getOrder);
router.post('/', auth, authorize(['Admin', 'Manager', 'Staff']), orderController.createOrder);
router.put('/:id/status', auth, authorize(['Admin', 'Manager', 'Staff']), orderController.updateOrderStatus);

module.exports = router;
