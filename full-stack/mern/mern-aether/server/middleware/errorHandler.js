const logger = require('../utils/logger')

const errorHandler = (err, _req, res, _next) => {
  logger.error('Server error', err.message)
  res.status(err.status || 500).json({ message: err.message || 'Unexpected error' })
}

module.exports = errorHandler
