const mongoose = require('mongoose')
const logger = require('./logger')

const connectDB = async () => {
  const uri = process.env.MONGO_URI
  if (!uri) {
    logger.warn('MONGO_URI missing, running in ephemeral mode')
    return
  }

  try {
    await mongoose.connect(uri, {
      dbName: process.env.MONGO_DB || 'aether',
    })
    logger.info('Connected to MongoDB cluster')
  } catch (error) {
    logger.error('Mongo connection failed', error.message)
  }
}

module.exports = connectDB
