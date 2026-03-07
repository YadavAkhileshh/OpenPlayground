const { Schema, model } = require('mongoose')

const elementSchema = new Schema(
  {
    id: { type: String, required: true },
    type: {
      type: String,
      enum: ['pen', 'line', 'rectangle', 'circle', 'ellipse', 'arrow', 'text', 'sticky', 'image'],
      required: true,
    },
    x: { type: Number, default: 0 },
    y: { type: Number, default: 0 },
    width: { type: Number, default: 0 },
    height: { type: Number, default: 0 },
    points: [{ x: Number, y: Number }],
    text: { type: String, default: '' },
    color: { type: String, default: '#000000' },
    fill: { type: String, default: 'transparent' },
    strokeWidth: { type: Number, default: 2 },
    fontSize: { type: Number, default: 16 },
    fontFamily: { type: String, default: 'sans-serif' },
    opacity: { type: Number, default: 1, min: 0, max: 1 },
    rotation: { type: Number, default: 0 },
    layer: { type: Number, default: 0 },
    locked: { type: Boolean, default: false },
    imageUrl: { type: String, default: '' },
    createdBy: { type: Schema.Types.ObjectId, ref: 'User' },
  },
  { _id: false },
)

const boardSchema = new Schema(
  {
    title: { type: String, required: true, trim: true, default: 'Untitled Board' },
    owner: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    collaborators: [
      {
        user: { type: Schema.Types.ObjectId, ref: 'User' },
        role: { type: String, enum: ['editor', 'viewer'], default: 'editor' },
        addedAt: { type: Date, default: Date.now },
      },
    ],
    elements: [elementSchema],
    background: { type: String, default: '#ffffff' },
    thumbnail: { type: String, default: '' },
    isPublic: { type: Boolean, default: false },
    shareCode: { type: String, unique: true, sparse: true },
    template: { type: String, default: null },
    viewport: {
      x: { type: Number, default: 0 },
      y: { type: Number, default: 0 },
      zoom: { type: Number, default: 1 },
    },
    tags: [{ type: String, trim: true }],
  },
  { timestamps: true },
)

boardSchema.index({ owner: 1, updatedAt: -1 })
boardSchema.index({ shareCode: 1 })
boardSchema.index({ 'collaborators.user': 1 })

boardSchema.methods.canEdit = function (userId) {
  const uid = userId.toString()
  if (this.owner.toString() === uid) return true
  const collab = this.collaborators.find((c) => c.user.toString() === uid)
  return collab?.role === 'editor'
}

boardSchema.methods.canView = function (userId) {
  if (this.isPublic) return true
  const uid = userId.toString()
  if (this.owner.toString() === uid) return true
  return this.collaborators.some((c) => c.user.toString() === uid)
}

module.exports = model('Board', boardSchema)
