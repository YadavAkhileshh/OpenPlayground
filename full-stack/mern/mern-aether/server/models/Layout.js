const { Schema, model } = require('mongoose')

const layoutSchema = new Schema(
  {
    roomId: { type: String, required: true, unique: true },
    nodes: { type: Array, default: [] },
    edges: { type: Array, default: [] },
  },
  { timestamps: true },
)

module.exports = model('Layout', layoutSchema)
