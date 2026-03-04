const express = require('express')
const cors = require('cors')
const http = require('http')
const dotenv = require('dotenv')
const connectDB = require('./utils/connectDB')
const layoutRoutes = require('./routes/layoutRoutes')
const errorHandler = require('./middleware/errorHandler')
const { registerSocketLayer } = require('./socket')
const logger = require('./utils/logger')

dotenv.config()

const app = express()
const server = http.createServer(app)
const PORT = process.env.PORT || 5050
const origins = (process.env.ORIGIN || 'http://localhost:5173').split(',')

app.use(
  cors({
    origin: origins,
    credentials: true,
  }),
)
app.use(express.json({ limit: '1mb' }))

app.get('/health', (_req, res) => {
  res.json({ status: 'ok', timestamp: Date.now() })
})

app.use('/api/layouts', layoutRoutes)
app.use(errorHandler)

registerSocketLayer(server)

connectDB().finally(() => {
  server.listen(PORT, () => logger.info(`Server listening on ${PORT}`))
})
