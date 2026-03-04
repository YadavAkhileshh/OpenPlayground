const express = require('express')
const { getLayout, upsertLayout } = require('../controllers/layoutController')

const router = express.Router()

router.get('/:roomId', getLayout)
router.post('/:roomId', upsertLayout)

module.exports = router
