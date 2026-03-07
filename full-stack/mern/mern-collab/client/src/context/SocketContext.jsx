import { createContext, useContext, useEffect, useRef, useState, useCallback } from 'react'
import { io } from 'socket.io-client'
import { useAuth } from './AuthContext'

const SocketContext = createContext(null)

export function SocketProvider({ children }) {
  const { user } = useAuth()
  const socketRef = useRef(null)
  const [connected, setConnected] = useState(false)
  const [activeUsers, setActiveUsers] = useState([])
  const listenersRef = useRef(new Map())

  // Connect socket when user logs in
  useEffect(() => {
    if (!user) {
      if (socketRef.current) {
        socketRef.current.disconnect()
        socketRef.current = null
        setConnected(false)
      }
      return
    }

    const token = localStorage.getItem('collab_token')
    if (!token) return

    const socket = io('/', {
      auth: { token },
      transports: ['websocket', 'polling'],
    })

    socket.on('connect', () => setConnected(true))
    socket.on('disconnect', () => setConnected(false))

    socket.on('board:users', (users) => setActiveUsers(users))
    socket.on('user:joined', (newUser) => {
      setActiveUsers((prev) => {
        if (prev.find((u) => u.id === newUser.id)) return prev
        return [...prev, newUser]
      })
    })
    socket.on('user:left', ({ userId }) => {
      setActiveUsers((prev) => prev.filter((u) => u.id !== userId))
    })

    socketRef.current = socket

    return () => {
      socket.disconnect()
      socketRef.current = null
      setConnected(false)
    }
  }, [user])

  const emit = useCallback((event, data) => {
    socketRef.current?.emit(event, data)
  }, [])

  const on = useCallback((event, handler) => {
    socketRef.current?.on(event, handler)

    // Track for cleanup
    if (!listenersRef.current.has(event)) {
      listenersRef.current.set(event, new Set())
    }
    listenersRef.current.get(event).add(handler)

    return () => {
      socketRef.current?.off(event, handler)
      listenersRef.current.get(event)?.delete(handler)
    }
  }, [])

  const off = useCallback((event, handler) => {
    socketRef.current?.off(event, handler)
    listenersRef.current.get(event)?.delete(handler)
  }, [])

  const joinBoard = useCallback((boardId) => {
    emit('board:join', { boardId })
  }, [emit])

  const leaveBoard = useCallback(() => {
    emit('board:leave', {})
    setActiveUsers([])
  }, [emit])

  return (
    <SocketContext.Provider
      value={{ connected, activeUsers, emit, on, off, joinBoard, leaveBoard }}
    >
      {children}
    </SocketContext.Provider>
  )
}

export function useSocket() {
  const context = useContext(SocketContext)
  if (!context) throw new Error('useSocket must be used within SocketProvider')
  return context
}
