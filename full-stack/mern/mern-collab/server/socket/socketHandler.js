const jwt = require('jsonwebtoken')
const User = require('../models/User')
const Board = require('../models/Board')
const logger = require('../utils/logger')

// Track active users per board: Map<boardId, Map<socketId, userInfo>>
const boardRooms = new Map()

function setupSocket(io) {
  // ── Auth middleware ────────────────────────────────
  io.use(async (socket, next) => {
    try {
      const token = socket.handshake.auth?.token
      if (!token) return next(new Error('Authentication required'))

      const decoded = jwt.verify(token, process.env.JWT_SECRET || 'collab-dev-secret')
      const user = await User.findById(decoded.id).lean()
      if (!user) return next(new Error('User not found'))

      socket.userId = user._id.toString()
      socket.userName = user.name
      socket.userColor = user.color || '#6366f1'
      socket.userAvatar = user.avatar || ''
      next()
    } catch {
      next(new Error('Invalid token'))
    }
  })

  io.on('connection', (socket) => {
    logger.info(`Socket connected: ${socket.userName} (${socket.id})`)

    // ── Join board room ────────────────────────────
    socket.on('board:join', async ({ boardId }) => {
      try {
        const board = await Board.findById(boardId)
        if (!board || !board.canView(socket.userId)) {
          return socket.emit('error', { message: 'Access denied' })
        }

        socket.join(boardId)
        socket.boardId = boardId

        // Track user in room
        if (!boardRooms.has(boardId)) {
          boardRooms.set(boardId, new Map())
        }

        const room = boardRooms.get(boardId)
        room.set(socket.id, {
          id: socket.userId,
          name: socket.userName,
          color: socket.userColor,
          avatar: socket.userAvatar,
          cursor: null,
        })

        // Send current users to joiner
        socket.emit('board:users', Array.from(room.values()))

        // Notify others
        socket.to(boardId).emit('user:joined', {
          id: socket.userId,
          name: socket.userName,
          color: socket.userColor,
          avatar: socket.userAvatar,
        })

        logger.info(`${socket.userName} joined board ${boardId}`)
      } catch (err) {
        logger.error('board:join error:', err.message)
        socket.emit('error', { message: 'Failed to join board' })
      }
    })

    // ── Leave board room ───────────────────────────
    socket.on('board:leave', () => {
      leaveBoard(socket, io)
    })

    // ── Cursor movement ────────────────────────────
    socket.on('cursor:move', ({ x, y }) => {
      if (!socket.boardId) return

      const room = boardRooms.get(socket.boardId)
      if (room?.has(socket.id)) {
        room.get(socket.id).cursor = { x, y }
      }

      socket.to(socket.boardId).emit('cursor:update', {
        userId: socket.userId,
        x,
        y,
        name: socket.userName,
        color: socket.userColor,
      })
    })

    // ── Element operations ─────────────────────────
    socket.on('element:add', ({ element }) => {
      if (!socket.boardId) return
      socket.to(socket.boardId).emit('element:added', {
        element,
        userId: socket.userId,
      })
    })

    socket.on('element:update', ({ element }) => {
      if (!socket.boardId) return
      socket.to(socket.boardId).emit('element:updated', {
        element,
        userId: socket.userId,
      })
    })

    socket.on('element:delete', ({ elementId }) => {
      if (!socket.boardId) return
      socket.to(socket.boardId).emit('element:deleted', {
        elementId,
        userId: socket.userId,
      })
    })

    socket.on('element:move', ({ elementId, x, y }) => {
      if (!socket.boardId) return
      socket.to(socket.boardId).emit('element:moved', {
        elementId,
        x,
        y,
        userId: socket.userId,
      })
    })

    // ── Batch update (for undo/redo) ───────────────
    socket.on('elements:sync', ({ elements }) => {
      if (!socket.boardId) return
      socket.to(socket.boardId).emit('elements:synced', {
        elements,
        userId: socket.userId,
      })
    })

    // ── Drawing in progress (live strokes) ─────────
    socket.on('draw:progress', ({ points, color, strokeWidth }) => {
      if (!socket.boardId) return
      socket.to(socket.boardId).emit('draw:live', {
        userId: socket.userId,
        points,
        color,
        strokeWidth,
      })
    })

    // ── Disconnect ─────────────────────────────────
    socket.on('disconnect', () => {
      leaveBoard(socket, io)
      logger.info(`Socket disconnected: ${socket.userName} (${socket.id})`)
    })
  })
}

function leaveBoard(socket, io) {
  const boardId = socket.boardId
  if (!boardId) return

  const room = boardRooms.get(boardId)
  if (room) {
    room.delete(socket.id)
    if (room.size === 0) {
      boardRooms.delete(boardId)
    }
  }

  socket.to(boardId).emit('user:left', { userId: socket.userId })
  socket.leave(boardId)
  socket.boardId = null
}

module.exports = setupSocket
