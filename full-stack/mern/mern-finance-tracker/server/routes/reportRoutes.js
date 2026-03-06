const express = require('express')
const {
  getDashboardSummary,
  getMonthlyTrends,
  getCategoryReport,
  exportTransactions,
} = require('../controllers/reportController')
const auth = require('../middleware/auth')

const router = express.Router()

router.use(auth)

router.get('/dashboard', getDashboardSummary)
router.get('/trends', getMonthlyTrends)
router.get('/categories', getCategoryReport)
router.get('/export', exportTransactions)

module.exports = router
