const logger = require('../utils/logger')

const errorHandler = (err, _req, res, _next) => {
  logger.error(err.stack || err.message)

  if (err.name === 'ValidationError') {
    const messages = Object.values(err.errors).map((e) => e.message)
    return res.status(400).json({ message: messages.join(', ') })
  }

  if (err.code === 11000) {
    const field = Object.keys(err.keyPattern)[0]
    return res.status(409).json({ message: `${field} already exists` })
  }

  if (err.name === 'CastError') {
    return res.status(400).json({ message: 'Invalid ID format' })
  }

  res.status(err.statusCode || 500).json({
    message: err.message || 'Internal server error',
  })
}

module.exports = errorHandler
