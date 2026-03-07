import { useRef, useState, useCallback, useEffect } from 'react'
import { useSocket } from '../../context/SocketContext'
import ElementRenderer from './ElementRenderer'
import CursorOverlay from './CursorOverlay'
import { getCanvasPoint, createElement } from '../../lib/utils'

/**
 * Main Canvas component – renders SVG drawing surface with
 * pan / zoom, drawing, selection, and live cursor broadcasting.
 */
export default function Canvas({
  boardId,
  elements,
  tool,
  color,
  strokeWidth,
  selectedId,
  onSelect,
  onElementAdd,
  onElementUpdate,
  onElementDelete,
}) {
  const svgRef = useRef(null)
  const containerRef = useRef(null)

  const { emit, activeUsers } = useSocket()

  // Viewport state (pan / zoom)
  const [viewport, setViewport] = useState({ x: 0, y: 0, zoom: 1 })

  // Drawing-in-progress state
  const [isDrawing, setIsDrawing] = useState(false)
  const [drawStart, setDrawStart] = useState(null)
  const [currentElement, setCurrentElement] = useState(null)
  const [penPoints, setPenPoints] = useState([])

  // Pan helpers
  const [isPanning, setIsPanning] = useState(false)
  const [panStart, setPanStart] = useState(null)

  // Live cursors from remote users
  const [cursors, setCursors] = useState([])

  // ─── CURSOR BROADCAST ─────────────────────────────────
  const handlePointerMove = useCallback(
    (e) => {
      const rect = containerRef.current?.getBoundingClientRect()
      if (!rect) return
      const worldX = (e.clientX - rect.left) / viewport.zoom + viewport.x
      const worldY = (e.clientY - rect.top) / viewport.zoom + viewport.y

      emit('cursor:move', { boardId, x: worldX, y: worldY })

      // If panning
      if (isPanning && panStart) {
        const dx = (e.clientX - panStart.sx) / viewport.zoom
        const dy = (e.clientY - panStart.sy) / viewport.zoom
        setViewport((v) => ({ ...v, x: panStart.vx - dx, y: panStart.vy - dy }))
        return
      }

      // If drawing
      if (!isDrawing || !drawStart) return

      const pt = getCanvasPoint(e, containerRef.current, viewport)

      if (tool === 'pen') {
        const newPoints = [...penPoints, pt]
        setPenPoints(newPoints)
        setCurrentElement((prev) => ({ ...prev, points: newPoints }))
        // Broadcast live stroke progress
        emit('draw:progress', { boardId, element: { ...currentElement, points: newPoints } })
      } else if (['rectangle', 'circle', 'ellipse', 'line', 'arrow'].includes(tool)) {
        const updated = {
          ...currentElement,
          width: pt.x - drawStart.x,
          height: pt.y - drawStart.y,
          points: tool === 'line' || tool === 'arrow' ? [{ x: 0, y: 0 }, { x: pt.x - drawStart.x, y: pt.y - drawStart.y }] : undefined,
        }
        setCurrentElement(updated)
        emit('draw:progress', { boardId, element: updated })
      }
    },
    [isPanning, panStart, isDrawing, drawStart, tool, penPoints, currentElement, viewport, boardId, emit],
  )

  const handlePointerDown = useCallback(
    (e) => {
      if (e.button !== 0) return
      const pt = getCanvasPoint(e, containerRef.current, viewport)

      if (tool === 'pan') {
        setIsPanning(true)
        setPanStart({ sx: e.clientX, sy: e.clientY, vx: viewport.x, vy: viewport.y })
        return
      }

      if (tool === 'select') {
        // deselect when clicking blank area
        onSelect?.(null)
        return
      }

      if (tool === 'eraser') return // handled via element click

      // Start drawing a new element
      const el = createElement(tool, pt.x, pt.y, color, strokeWidth)
      if (!el) return

      setIsDrawing(true)
      setDrawStart(pt)
      setCurrentElement(el)
      if (tool === 'pen') setPenPoints([pt])
    },
    [tool, viewport, color, strokeWidth, onSelect],
  )

  const handlePointerUp = useCallback(() => {
    if (isPanning) {
      setIsPanning(false)
      setPanStart(null)
      return
    }

    if (!isDrawing || !currentElement) {
      setIsDrawing(false)
      return
    }

    // Finalize the element
    let final = { ...currentElement }
    if (tool === 'pen') {
      final.points = penPoints
    }

    // Text and sticky get special treatment – open inline editing
    if (tool === 'text') {
      const content = prompt('Enter text:')
      if (!content) {
        setIsDrawing(false)
        setCurrentElement(null)
        return
      }
      final.text = content
    }

    if (tool === 'sticky') {
      const content = prompt('Sticky note text:')
      if (!content) {
        setIsDrawing(false)
        setCurrentElement(null)
        return
      }
      final.text = content
      final.width = 200
      final.height = 150
    }

    // Only add if element has meaningful size or is pen/text/sticky
    const minSize = 4
    const hasDimension =
      tool === 'pen' ||
      tool === 'text' ||
      tool === 'sticky' ||
      Math.abs(final.width || 0) > minSize ||
      Math.abs(final.height || 0) > minSize

    if (hasDimension) {
      onElementAdd(final)
      emit('element:add', { boardId, element: final })
    }

    setIsDrawing(false)
    setDrawStart(null)
    setCurrentElement(null)
    setPenPoints([])
  }, [isPanning, isDrawing, currentElement, tool, penPoints, onElementAdd, boardId, emit])

  // Handle mouse wheel zoom
  const handleWheel = useCallback(
    (e) => {
      e.preventDefault()
      const scaleFactor = e.deltaY > 0 ? 0.9 : 1.1
      setViewport((v) => {
        const newZoom = Math.min(Math.max(v.zoom * scaleFactor, 0.1), 5)
        const rect = containerRef.current?.getBoundingClientRect()
        if (!rect) return { ...v, zoom: newZoom }
        const mx = (e.clientX - rect.left) / v.zoom + v.x
        const my = (e.clientY - rect.top) / v.zoom + v.y
        return {
          x: mx - (e.clientX - rect.left) / newZoom,
          y: my - (e.clientY - rect.top) / newZoom,
          zoom: newZoom,
        }
      })
    },
    [],
  )

  // Eraser click on element
  const handleElementClick = useCallback(
    (id) => {
      if (tool === 'eraser') {
        onElementDelete(id)
        emit('element:delete', { boardId, elementId: id })
      } else if (tool === 'select') {
        onSelect?.(id)
      }
    },
    [tool, onElementDelete, onSelect, boardId, emit],
  )

  // Listen for remote cursors
  useEffect(() => {
    const handler = (data) => {
      setCursors((prev) => {
        const idx = prev.findIndex((c) => c.userId === data.userId)
        const updated = { userId: data.userId, username: data.username, color: data.color, x: data.x, y: data.y }
        if (idx >= 0) {
          const next = [...prev]
          next[idx] = updated
          return next
        }
        return [...prev, updated]
      })
    }

    // We rely on the SocketContext's on/off
    // but here we directly use the socket from context if available
    // For simplicity, update cursors from activeUsers broadcasting
    const interval = setInterval(() => {
      // Clean up stale cursors (no update in 5 seconds)
      setCursors((prev) => prev.filter((c) => Date.now() - (c.lastSeen || 0) < 5000))
    }, 5000)

    return () => clearInterval(interval)
  }, [])

  // Wheel listener (non-passive to allow preventDefault)
  useEffect(() => {
    const el = containerRef.current
    if (!el) return
    el.addEventListener('wheel', handleWheel, { passive: false })
    return () => el.removeEventListener('wheel', handleWheel)
  }, [handleWheel])

  // Cursor style
  const getCursor = () => {
    switch (tool) {
      case 'pan': return isPanning ? 'grabbing' : 'grab'
      case 'select': return 'default'
      case 'eraser': return 'crosshair'
      default: return 'crosshair'
    }
  }

  return (
    <div
      ref={containerRef}
      className="relative flex-1 overflow-hidden bg-white dark:bg-gray-900"
      style={{ cursor: getCursor() }}
      onPointerDown={handlePointerDown}
      onPointerMove={handlePointerMove}
      onPointerUp={handlePointerUp}
      onPointerLeave={handlePointerUp}
    >
      {/* Grid dots */}
      <svg className="absolute inset-0 w-full h-full pointer-events-none" style={{ opacity: 0.3 }}>
        <defs>
          <pattern
            id="grid-dots"
            width={20 * viewport.zoom}
            height={20 * viewport.zoom}
            patternUnits="userSpaceOnUse"
            x={-(viewport.x * viewport.zoom) % (20 * viewport.zoom)}
            y={-(viewport.y * viewport.zoom) % (20 * viewport.zoom)}
          >
            <circle cx={1} cy={1} r={1} className="fill-gray-300 dark:fill-gray-600" />
          </pattern>
        </defs>
        <rect width="100%" height="100%" fill="url(#grid-dots)" />
      </svg>

      {/* Main SVG */}
      <svg
        ref={svgRef}
        className="absolute inset-0 w-full h-full"
        style={{
          transform: `scale(${viewport.zoom}) translate(${-viewport.x}px, ${-viewport.y}px)`,
          transformOrigin: '0 0',
        }}
      >
        {/* Existing elements */}
        {elements.map((el) => (
          <ElementRenderer
            key={el.id}
            element={el}
            isSelected={el.id === selectedId}
            onSelect={handleElementClick}
          />
        ))}

        {/* Element being drawn */}
        {currentElement && (
          <ElementRenderer element={currentElement} isSelected={false} />
        )}
      </svg>

      {/* Cursor overlay */}
      <CursorOverlay cursors={cursors} viewport={viewport} />

      {/* Zoom indicator */}
      <div className="absolute bottom-4 right-4 bg-white/80 dark:bg-gray-800/80 backdrop-blur px-3 py-1.5 rounded-lg text-sm text-gray-600 dark:text-gray-300 shadow-sm border border-gray-200 dark:border-gray-700">
        {Math.round(viewport.zoom * 100)}%
      </div>
    </div>
  )
}
