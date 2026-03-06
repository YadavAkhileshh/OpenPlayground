const express = require('express')
const {
  getTransactions,
  getTransaction,
  createTransaction,
  updateTransaction,
  deleteTransaction,
} = require('../controllers/transactionController')
const auth = require('../middleware/auth')

const router = express.Router()

router.use(auth)

router.get('/', getTransactions)
router.get('/:id', getTransaction)
router.post('/', createTransaction)
router.put('/:id', updateTransaction)
router.delete('/:id', deleteTransaction)

module.exports = router
