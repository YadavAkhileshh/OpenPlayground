import { useEffect, useRef, useCallback } from 'react'
import { fetchLayout, persistLayout } from '../lib/api'
import { createCollaborationSocket } from '../lib/socket'
import { useAetherStore } from '../store/useAetherStore'

const debounce = (fn, wait = 800) => {
  let timeout
  return (...args) => {
    clearTimeout(timeout)
    timeout = setTimeout(() => fn(...args), wait)
  }
}

export const useLiveCollaboration = () => {
  const socketRef = useRef(null)
  const roomId = useAetherStore((state) => state.roomId)
  const user = useAetherStore((state) => state.user)
  const hydrateDiagram = useAetherStore((state) => state.hydrateDiagram)
  const setPresence = useAetherStore((state) => state.setPresence)
  const updateCursor = useAetherStore((state) => state.updateCursor)
  const removeCursor = useAetherStore((state) => state.removeCursor)
  const runSimulation = useAetherStore((state) => state.runSimulation)
  const stopSimulation = useAetherStore((state) => state.stopSimulation)

  useEffect(() => {
    let unsubDiagram

    const bootstrap = async () => {
      const snapshot = await fetchLayout(roomId)
      if (snapshot?.nodes?.length) {
        hydrateDiagram(snapshot)
      }

      const socket = createCollaborationSocket()
      socketRef.current = socket
      socket.connect()

      socket.emit('room:join', { roomId, user })

      socket.on('room:state', (payload) => {
        if (payload?.diagram) hydrateDiagram(payload.diagram)
        if (payload?.presence) setPresence(payload.presence)
      })

      socket.on('diagram:remote', (diagram) => hydrateDiagram(diagram))
      socket.on('presence:update', (presence) => setPresence(presence))
      socket.on('cursor:update', (cursor) => updateCursor(cursor))
      socket.on('cursor:leave', (cursorId) => removeCursor(cursorId))
      socket.on('simulation:run', (payload) => runSimulation(payload))
      socket.on('simulation:stop', () => stopSimulation())
    }

    bootstrap()

    const debouncedPersist = debounce((diagram) => {
      if (socketRef.current) {
        socketRef.current.emit('diagram:update', { roomId, diagram })
      }
      persistLayout(roomId, diagram)
    }, 900)

    unsubDiagram = useAetherStore.subscribe(
      (state) => ({ nodes: state.nodes, edges: state.edges }),
      (diagram) => debouncedPersist(diagram),
      { equalityFn: (a, b) => a.nodes === b.nodes && a.edges === b.edges },
    )

    return () => {
      unsubDiagram?.()
      if (socketRef.current) {
        socketRef.current.emit('room:leave', { roomId, userId: user.id })
        socketRef.current.disconnect()
        socketRef.current = null
      }
    }
  }, [hydrateDiagram, roomId, runSimulation, setPresence, stopSimulation, updateCursor, removeCursor, user])

  const broadcastCursor = useCallback(
    (payload) => {
      const cursor = { id: user.id, name: user.name, color: user.color, ...payload }
      updateCursor(cursor)
      socketRef.current?.emit('cursor:move', { roomId, ...payload, user })
    },
    [roomId, updateCursor, user],
  )

  const broadcastSimulation = useCallback(
    (payload) => {
      runSimulation(payload)
      if (!socketRef.current) return
      socketRef.current.emit('simulation:run', { roomId, payload })
    },
    [roomId, runSimulation],
  )

  const stopRemoteSimulation = useCallback(() => {
    stopSimulation()
    socketRef.current?.emit('simulation:stop', { roomId })
  }, [roomId, stopSimulation])

  return { broadcastCursor, broadcastSimulation, stopRemoteSimulation }
}
