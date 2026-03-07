const jwt = require('jsonwebtoken')
const User = require('../models/User')

const SECRET = () => process.env.JWT_SECRET || 'collab-dev-secret'
const signToken = (id) => jwt.sign({ id }, SECRET(), { expiresIn: '30d' })

const register = async (req, res, next) => {
  try {
    const { name, email, password } = req.body

    if (!name || !email || !password) {
      return res.status(400).json({ message: 'Name, email and password are required' })
    }

    const exists = await User.findOne({ email })
    if (exists) {
      return res.status(409).json({ message: 'Email already registered' })
    }

    const user = await User.create({ name, email, password })
    const token = signToken(user._id)

    res.status(201).json({
      token,
      user: { _id: user._id, name: user.name, email: user.email, avatar: user.avatar, color: user.color, settings: user.settings },
    })
  } catch (err) {
    next(err)
  }
}

const login = async (req, res, next) => {
  try {
    const { email, password } = req.body

    if (!email || !password) {
      return res.status(400).json({ message: 'Email and password are required' })
    }

    const user = await User.findOne({ email }).select('+password')
    if (!user || !(await user.comparePassword(password))) {
      return res.status(401).json({ message: 'Invalid email or password' })
    }

    const token = signToken(user._id)

    res.json({
      token,
      user: { _id: user._id, name: user.name, email: user.email, avatar: user.avatar, color: user.color, settings: user.settings },
    })
  } catch (err) {
    next(err)
  }
}

const getMe = async (req, res, next) => {
  try {
    const user = await User.findById(req.userId)
    if (!user) return res.status(404).json({ message: 'User not found' })

    res.json({ user })
  } catch (err) {
    next(err)
  }
}

const updateProfile = async (req, res, next) => {
  try {
    const { name, avatar, color, settings } = req.body
    const updates = {}
    if (name) updates.name = name
    if (avatar !== undefined) updates.avatar = avatar
    if (color) updates.color = color
    if (settings) updates.settings = { ...req.body.currentSettings, ...settings }

    const user = await User.findByIdAndUpdate(req.userId, updates, { new: true })
    res.json({ user })
  } catch (err) {
    next(err)
  }
}

const changePassword = async (req, res, next) => {
  try {
    const { currentPassword, newPassword } = req.body

    if (!currentPassword || !newPassword) {
      return res.status(400).json({ message: 'Both passwords are required' })
    }
    if (newPassword.length < 6) {
      return res.status(400).json({ message: 'Password must be at least 6 characters' })
    }

    const user = await User.findById(req.userId).select('+password')
    if (!(await user.comparePassword(currentPassword))) {
      return res.status(401).json({ message: 'Current password is incorrect' })
    }

    user.password = newPassword
    await user.save()

    res.json({ message: 'Password updated' })
  } catch (err) {
    next(err)
  }
}

module.exports = { register, login, getMe, updateProfile, changePassword }
