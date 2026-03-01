const { Schema, model } = require('mongoose')

const CATEGORIES = [
  'food',
  'transport',
  'housing',
  'utilities',
  'entertainment',
  'shopping',
  'healthcare',
  'education',
  'savings',
  'salary',
  'freelance',
  'investment',
  'gift',
  'other',
]

const transactionSchema = new Schema(
  {
    user: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    account: { type: Schema.Types.ObjectId, ref: 'Account', required: true },
    type: { type: String, enum: ['income', 'expense', 'transfer'], required: true },
    amount: { type: Number, required: true, min: 0 },
    category: { type: String, enum: CATEGORIES, required: true },
    description: { type: String, trim: true, default: '' },
    notes: { type: String, trim: true, default: '' },
    date: { type: Date, default: Date.now, index: true },
    isRecurring: { type: Boolean, default: false },
    recurringInterval: {
      type: String,
      enum: ['daily', 'weekly', 'biweekly', 'monthly', 'yearly', null],
      default: null,
    },
    nextRecurringDate: { type: Date, default: null },
    tags: [{ type: String, trim: true }],
  },
  { timestamps: true },
)

transactionSchema.index({ user: 1, date: -1 })
transactionSchema.index({ user: 1, category: 1 })

module.exports = model('Transaction', transactionSchema)
module.exports.CATEGORIES = CATEGORIES
