require('dotenv').config()

const express = require('express')
const cors = require('cors')
const http = require('http')
const { Server } = require('socket.io')

const connectDB = require('./utils/connectDB')
const logger = require('./utils/logger')
const errorHandler = require('./middleware/errorHandler')
const setupSocket = require('./socket/socketHandler')

const authRoutes = require('./routes/authRoutes')
const boardRoutes = require('./routes/boardRoutes')

const app = express()
const server = http.createServer(app)

// ── CORS ──────────────────────────────────────────────
const origins = (process.env.ORIGIN || 'http://localhost:5173')
  .split(',')
  .map((o) => o.trim())

app.use(cors({ origin: origins, credentials: true }))

// ── Body parsing ──────────────────────────────────────
app.use(express.json({ limit: '5mb' }))

// ── Socket.io ─────────────────────────────────────────
const io = new Server(server, {
  cors: { origin: origins, credentials: true },
  maxHttpBufferSize: 5e6,
})

setupSocket(io)

// ── Health check ──────────────────────────────────────
app.get('/health', (_req, res) => res.json({ status: 'ok', uptime: process.uptime() }))

// ── API Routes ────────────────────────────────────────
app.use('/api/auth', authRoutes)
app.use('/api/boards', boardRoutes)

// ── Error handler ─────────────────────────────────────
app.use(errorHandler)

// ── Start ─────────────────────────────────────────────
const PORT = process.env.PORT || 5050

connectDB().finally(() => {
  server.listen(PORT, () => {
    logger.info(`Server running on http://localhost:${PORT}`)
    logger.info('WebSocket server ready')
  })
})
