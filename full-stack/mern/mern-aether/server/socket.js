const { Server } = require('socket.io')
const { saveLayoutSnapshot } = require('./controllers/layoutController')
const logger = require('./utils/logger')

const roomCache = new Map()

const ensureRoom = (roomId) => {
  if (!roomCache.has(roomId)) {
    roomCache.set(roomId, { nodes: [], edges: [], presence: {}, cursors: {} })
  }
  return roomCache.get(roomId)
}

const cleanup = (roomId, socket) => {
  if (!roomId) return
  const room = roomCache.get(roomId)
  if (!room) return
  delete room.presence[socket.id]
  delete room.cursors[socket.id]
  socket.to(roomId).emit('presence:update', room.presence)
  socket.to(roomId).emit('cursor:leave', socket.id)
}

const registerSocketLayer = (httpServer) => {
  const origins = (process.env.ORIGIN || 'http://localhost:5173').split(',')
  const io = new Server(httpServer, {
    cors: {
      origin: origins,
      credentials: true,
    },
  })

  io.on('connection', (socket) => {
    logger.info('Socket connected', socket.id)

    socket.on('room:join', ({ roomId, user }) => {
      if (!roomId) return
      socket.join(roomId)
      socket.data.roomId = roomId
      socket.data.user = user
      const room = ensureRoom(roomId)
      room.presence[socket.id] = { ...(user || {}), id: socket.id }
      socket.emit('room:state', { diagram: { nodes: room.nodes, edges: room.edges }, presence: room.presence })
      socket.to(roomId).emit('presence:update', room.presence)
    })

    socket.on('diagram:update', ({ roomId, diagram }) => {
      if (!roomId || !diagram) return
      const room = ensureRoom(roomId)
      room.nodes = diagram.nodes || room.nodes
      room.edges = diagram.edges || room.edges
      socket.to(roomId).emit('diagram:remote', diagram)
      saveLayoutSnapshot(roomId, diagram)
    })

    socket.on('cursor:move', ({ roomId, x, y, user }) => {
      if (!roomId) return
      const room = ensureRoom(roomId)
      const payload = { id: socket.id, name: user?.name || 'Guest', color: user?.color || '#4fe3ff', x, y }
      room.cursors[socket.id] = payload
      io.to(roomId).emit('cursor:update', payload)
    })

    socket.on('simulation:run', ({ roomId, payload }) => {
      if (!roomId || !payload) return
      socket.to(roomId).emit('simulation:run', payload)
    })

    socket.on('simulation:stop', ({ roomId }) => {
      if (!roomId) return
      socket.to(roomId).emit('simulation:stop')
    })

    socket.on('room:leave', ({ roomId }) => {
      cleanup(roomId, socket)
      socket.leave(roomId)
    })

    socket.on('disconnect', () => {
      cleanup(socket.data?.roomId, socket)
      logger.info('Socket disconnected', socket.id)
    })
  })
}

module.exports = { registerSocketLayer }
