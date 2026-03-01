const { Schema, model } = require('mongoose')

const budgetSchema = new Schema(
  {
    user: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    category: { type: String, required: true },
    limit: { type: Number, required: true, min: 0 },
    spent: { type: Number, default: 0, min: 0 },
    month: { type: Number, required: true, min: 1, max: 12 },
    year: { type: Number, required: true },
    alertThreshold: { type: Number, default: 80, min: 0, max: 100 },
    color: { type: String, default: '#6366f1' },
  },
  { timestamps: true },
)

budgetSchema.index({ user: 1, month: 1, year: 1 })
budgetSchema.index({ user: 1, category: 1, month: 1, year: 1 }, { unique: true })

budgetSchema.virtual('percentage').get(function () {
  return this.limit > 0 ? Math.round((this.spent / this.limit) * 100) : 0
})

budgetSchema.virtual('remaining').get(function () {
  return Math.max(0, this.limit - this.spent)
})

budgetSchema.virtual('isOverBudget').get(function () {
  return this.spent > this.limit
})

budgetSchema.virtual('isNearLimit').get(function () {
  return this.percentage >= this.alertThreshold && !this.isOverBudget
})

budgetSchema.set('toJSON', { virtuals: true })
budgetSchema.set('toObject', { virtuals: true })

module.exports = model('Budget', budgetSchema)
