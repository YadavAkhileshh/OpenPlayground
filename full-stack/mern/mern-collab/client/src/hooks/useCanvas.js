import { useEffect, useCallback, useState } from 'react'
import { useSocket } from '../context/SocketContext'
import useHistory from './useHistory'
import * as api from '../lib/api'

/**
 * Orchestrates canvas state — bridges socket events with the
 * element history so every remote change is reflected locally.
 */
export default function useCanvas(boardId) {
  const { emit, socket, joinBoard, leaveBoard } = useSocket()

  const {
    elements,
    setElements,
    addElement,
    updateElement,
    deleteElement,
    setAllElements,
    undo,
    redo,
    canUndo,
    canRedo,
  } = useHistory([])

  // Active tool, color, stroke
  const [tool, setTool] = useState('pen')
  const [color, setColor] = useState('#000000')
  const [strokeWidth, setStrokeWidth] = useState(2)
  const [selectedId, setSelectedId] = useState(null)
  const [loading, setLoading] = useState(true)

  // Fetch board elements on mount
  useEffect(() => {
    let cancelled = false
    ;(async () => {
      try {
        const { data } = await api.getBoard(boardId)
        if (!cancelled) setElements(data.elements || [])
      } catch (err) {
        console.error('Failed to load board', err)
      } finally {
        if (!cancelled) setLoading(false)
      }
    })()
    return () => { cancelled = true }
  }, [boardId])

  // Join / leave socket room
  useEffect(() => {
    joinBoard(boardId)
    return () => leaveBoard(boardId)
  }, [boardId, joinBoard, leaveBoard])

  // Listen for remote element events
  useEffect(() => {
    if (!socket) return

    const onAdd = ({ element }) => {
      setElements((prev) => {
        if (prev.some((e) => e.id === element.id)) return prev
        return [...prev, element]
      })
    }

    const onUpdate = ({ element }) => {
      setElements((prev) =>
        prev.map((e) => (e.id === element.id ? { ...e, ...element } : e)),
      )
    }

    const onDelete = ({ elementId }) => {
      setElements((prev) => prev.filter((e) => e.id !== elementId))
    }

    const onSync = ({ elements: els }) => {
      setElements(els)
    }

    socket.on('element:added', onAdd)
    socket.on('element:updated', onUpdate)
    socket.on('element:deleted', onDelete)
    socket.on('elements:synced', onSync)

    return () => {
      socket.off('element:added', onAdd)
      socket.off('element:updated', onUpdate)
      socket.off('element:deleted', onDelete)
      socket.off('elements:synced', onSync)
    }
  }, [socket, setElements])

  // Auto-save debounced
  useEffect(() => {
    if (loading) return
    const t = setTimeout(() => {
      api.saveElements(boardId, elements).catch(console.error)
    }, 2000)
    return () => clearTimeout(t)
  }, [elements, boardId, loading])

  // Keyboard shortcuts
  useEffect(() => {
    const handler = (e) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 'z') {
        e.preventDefault()
        if (e.shiftKey) redo()
        else undo()
        // Broadcast sync after undo/redo
        emit('elements:sync', { boardId, elements })
      }
      if (e.key === 'Delete' || e.key === 'Backspace') {
        if (selectedId) {
          deleteElement(selectedId)
          emit('element:delete', { boardId, elementId: selectedId })
          setSelectedId(null)
        }
      }
      // Tool shortcuts
      const shortcuts = { v: 'select', h: 'pan', p: 'pen', l: 'line', r: 'rectangle', c: 'circle', a: 'arrow', t: 'text', s: 'sticky', e: 'eraser' }
      if (!e.ctrlKey && !e.metaKey && !e.altKey && shortcuts[e.key]) {
        setTool(shortcuts[e.key])
      }
    }
    window.addEventListener('keydown', handler)
    return () => window.removeEventListener('keydown', handler)
  }, [selectedId, undo, redo, deleteElement, emit, boardId, elements])

  return {
    elements,
    tool,
    setTool,
    color,
    setColor,
    strokeWidth,
    setStrokeWidth,
    selectedId,
    setSelectedId,
    addElement,
    updateElement,
    deleteElement,
    undo,
    redo,
    canUndo,
    canRedo,
    loading,
  }
}
