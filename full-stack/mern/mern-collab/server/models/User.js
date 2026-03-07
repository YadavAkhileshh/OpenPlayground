const { Schema, model } = require('mongoose')
const bcrypt = require('bcryptjs')

const userSchema = new Schema(
  {
    name: { type: String, required: true, trim: true },
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },
    password: { type: String, required: true, minlength: 6, select: false },
    avatar: { type: String, default: '' },
    color: { type: String, default: '#6366f1' },
    settings: {
      defaultTool: { type: String, default: 'pen' },
      defaultColor: { type: String, default: '#000000' },
      defaultStrokeWidth: { type: Number, default: 2 },
      gridEnabled: { type: Boolean, default: false },
      snapToGrid: { type: Boolean, default: false },
    },
  },
  { timestamps: true },
)

userSchema.pre('save', async function (next) {
  if (!this.isModified('password')) return next()
  this.password = await bcrypt.hash(this.password, 12)
  next()
})

userSchema.methods.comparePassword = function (candidate) {
  return bcrypt.compare(candidate, this.password)
}

module.exports = model('User', userSchema)
