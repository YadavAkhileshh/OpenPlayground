const mongoose = require('mongoose')
const Layout = require('../models/Layout')
const logger = require('../utils/logger')

const isReady = () => mongoose.connection.readyState === 1

const getLayout = async (req, res, next) => {
  if (!isReady()) {
    return res.json({ nodes: [], edges: [] })
  }

  try {
    const { roomId } = req.params
    const doc = await Layout.findOne({ roomId }).lean()
    res.json(doc || { nodes: [], edges: [] })
  } catch (error) {
    next(error)
  }
}

const upsertLayout = async (req, res, next) => {
  if (!isReady()) {
    return res.status(202).json({ message: 'Stored in memory only' })
  }

  try {
    const { roomId } = req.params
    const payload = { nodes: req.body.nodes || [], edges: req.body.edges || [] }
    await Layout.findOneAndUpdate({ roomId }, payload, { upsert: true, new: true, setDefaultsOnInsert: true })
    res.json({ ok: true })
  } catch (error) {
    next(error)
  }
}

const saveLayoutSnapshot = async (roomId, diagram) => {
  if (!isReady()) return
  try {
    await Layout.findOneAndUpdate(
      { roomId },
      { nodes: diagram.nodes || [], edges: diagram.edges || [] },
      { upsert: true, new: true },
    )
  } catch (error) {
    logger.warn('Unable to persist snapshot', error.message)
  }
}

module.exports = { getLayout, upsertLayout, saveLayoutSnapshot }
