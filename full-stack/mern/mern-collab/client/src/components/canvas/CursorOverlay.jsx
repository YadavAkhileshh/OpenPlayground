/**
 * Renders remote users' cursors overlaid on the canvas.
 */
export default function CursorOverlay({ cursors, viewport }) {
  if (!cursors || cursors.length === 0) return null

  return (
    <div className="pointer-events-none absolute inset-0 overflow-hidden z-40">
      {cursors.map((cursor) => {
        // Transform cursor world coords to screen coords
        const screenX = (cursor.x - viewport.x) * viewport.zoom
        const screenY = (cursor.y - viewport.y) * viewport.zoom

        return (
          <div
            key={cursor.userId}
            className="absolute transition-all duration-100 ease-out"
            style={{ left: screenX, top: screenY }}
          >
            {/* Cursor arrow SVG */}
            <svg width="20" height="20" viewBox="0 0 20 20" className="drop-shadow-md" style={{ filter: `drop-shadow(0 1px 2px rgba(0,0,0,0.2))` }}>
              <path
                d="M4 1L4 16L8.5 12L14 17L17 14L11.5 9L16 4.5L4 1Z"
                fill={cursor.color || '#6366f1'}
                stroke="white"
                strokeWidth="1.5"
                strokeLinejoin="round"
              />
            </svg>
            {/* Username label */}
            <div
              className="ml-4 -mt-1 px-2 py-0.5 rounded-md text-xs font-medium text-white whitespace-nowrap shadow-md"
              style={{ backgroundColor: cursor.color || '#6366f1' }}
            >
              {cursor.username || 'Anonymous'}
            </div>
          </div>
        )
      })}
    </div>
  )
}
