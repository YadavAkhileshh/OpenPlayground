const express = require('express')
const { getBudgets, createBudget, updateBudget, deleteBudget } = require('../controllers/budgetController')
const auth = require('../middleware/auth')

const router = express.Router()

router.use(auth)

router.get('/', getBudgets)
router.post('/', createBudget)
router.put('/:id', updateBudget)
router.delete('/:id', deleteBudget)

module.exports = router
