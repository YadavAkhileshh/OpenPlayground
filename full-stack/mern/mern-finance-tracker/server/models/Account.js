const { Schema, model } = require('mongoose')

const accountSchema = new Schema(
  {
    user: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    name: { type: String, required: true, trim: true },
    type: {
      type: String,
      enum: ['bank', 'wallet', 'credit_card', 'cash', 'investment'],
      required: true,
    },
    balance: { type: Number, default: 0 },
    currency: { type: String, default: 'USD' },
    color: { type: String, default: '#6366f1' },
    icon: { type: String, default: 'wallet' },
    isActive: { type: Boolean, default: true },
  },
  { timestamps: true },
)

module.exports = model('Account', accountSchema)
