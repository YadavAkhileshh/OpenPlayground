require('dotenv').config()

const express = require('express')
const cors = require('cors')
const http = require('http')

const connectDB = require('./utils/connectDB')
const logger = require('./utils/logger')
const errorHandler = require('./middleware/errorHandler')
const startRecurringScheduler = require('./utils/recurringScheduler')

const authRoutes = require('./routes/authRoutes')
const transactionRoutes = require('./routes/transactionRoutes')
const budgetRoutes = require('./routes/budgetRoutes')
const accountRoutes = require('./routes/accountRoutes')
const reportRoutes = require('./routes/reportRoutes')

const app = express()
const server = http.createServer(app)

// ── CORS ──────────────────────────────────────────────
const origins = (process.env.ORIGIN || 'http://localhost:5173')
  .split(',')
  .map((o) => o.trim())

app.use(cors({ origin: origins, credentials: true }))

// ── Body parsing ──────────────────────────────────────
app.use(express.json({ limit: '1mb' }))

// ── Health check ──────────────────────────────────────
app.get('/health', (_req, res) => res.json({ status: 'ok', uptime: process.uptime() }))

// ── API Routes ────────────────────────────────────────
app.use('/api/auth', authRoutes)
app.use('/api/transactions', transactionRoutes)
app.use('/api/budgets', budgetRoutes)
app.use('/api/accounts', accountRoutes)
app.use('/api/reports', reportRoutes)

// ── Error handler ─────────────────────────────────────
app.use(errorHandler)

// ── Start ─────────────────────────────────────────────
const PORT = process.env.PORT || 5050

connectDB().finally(() => {
  server.listen(PORT, () => {
    logger.info(`Server running on http://localhost:${PORT}`)
    startRecurringScheduler()
  })
})
