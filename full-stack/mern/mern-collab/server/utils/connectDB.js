const mongoose = require('mongoose')
const logger = require('./logger')

const connectDB = async () => {
  const uri = process.env.MONGODB_URI || 'mongodb://localhost:27017/collab-whiteboard'
  try {
    await mongoose.connect(uri)
    logger.info(`MongoDB connected: ${mongoose.connection.host}`)
  } catch (err) {
    logger.error('MongoDB connection failed:', err.message)
    process.exit(1)
  }
}

module.exports = connectDB
