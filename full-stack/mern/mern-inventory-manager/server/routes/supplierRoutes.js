const express = require('express');
const router = express.Router();
const supplierController = require('../controllers/supplierController');
const { auth, authorize } = require('../middleware/auth');

router.get('/', auth, supplierController.getSuppliers);
router.post('/', auth, authorize(['Admin', 'Manager']), supplierController.createSupplier);
router.put('/:id', auth, authorize(['Admin', 'Manager']), supplierController.updateSupplier);
router.delete('/:id', auth, authorize(['Admin']), supplierController.deleteSupplier);

module.exports = router;
