import { useCallback, useRef, useState } from 'react'

const MAX_HISTORY = 50

/**
 * Undo / redo hook that stores element snapshots.
 */
export default function useHistory(initialElements = []) {
  const [elements, setElements] = useState(initialElements)
  const undoStack = useRef([])
  const redoStack = useRef([])

  const pushSnapshot = useCallback(() => {
    undoStack.current.push(JSON.parse(JSON.stringify(elements)))
    if (undoStack.current.length > MAX_HISTORY) undoStack.current.shift()
    redoStack.current = []
  }, [elements])

  const addElement = useCallback(
    (el) => {
      pushSnapshot()
      setElements((prev) => [...prev, el])
    },
    [pushSnapshot],
  )

  const updateElement = useCallback(
    (id, updates) => {
      pushSnapshot()
      setElements((prev) =>
        prev.map((el) => (el.id === id ? { ...el, ...updates } : el)),
      )
    },
    [pushSnapshot],
  )

  const deleteElement = useCallback(
    (id) => {
      pushSnapshot()
      setElements((prev) => prev.filter((el) => el.id !== id))
    },
    [pushSnapshot],
  )

  const setAllElements = useCallback(
    (els) => {
      pushSnapshot()
      setElements(els)
    },
    [pushSnapshot],
  )

  const undo = useCallback(() => {
    if (undoStack.current.length === 0) return
    redoStack.current.push(JSON.parse(JSON.stringify(elements)))
    const prev = undoStack.current.pop()
    setElements(prev)
  }, [elements])

  const redo = useCallback(() => {
    if (redoStack.current.length === 0) return
    undoStack.current.push(JSON.parse(JSON.stringify(elements)))
    const next = redoStack.current.pop()
    setElements(next)
  }, [elements])

  return {
    elements,
    setElements, // raw setter for remote sync (no snapshot)
    addElement,
    updateElement,
    deleteElement,
    setAllElements,
    undo,
    redo,
    canUndo: undoStack.current.length > 0,
    canRedo: redoStack.current.length > 0,
  }
}
