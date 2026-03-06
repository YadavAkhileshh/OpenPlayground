const express = require('express')
const {
  getAccounts,
  getAccount,
  createAccount,
  updateAccount,
  deleteAccount,
} = require('../controllers/accountController')
const auth = require('../middleware/auth')

const router = express.Router()

router.use(auth)

router.get('/', getAccounts)
router.get('/:id', getAccount)
router.post('/', createAccount)
router.put('/:id', updateAccount)
router.delete('/:id', deleteAccount)

module.exports = router
