import { memo } from 'react'
import { motion } from 'framer-motion'
import { useAetherStore } from '../store/useAetherStore'

const PresenceLayer = () => {
  const cursors = useAetherStore((state) => state.cursors)

  return (
    <div className="pointer-events-none absolute inset-0 z-30">
      {Object.values(cursors || {}).map((cursor) => (
        <motion.div
          key={cursor.id}
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 0.9, scale: 1 }}
          transition={{ duration: 0.2 }}
          className="flex items-center gap-2 text-[11px] font-semibold"
          style={{ transform: `translate(${cursor.x}px, ${cursor.y}px)` }}
        >
          <span
            className="h-3 w-3 rounded-full"
            style={{ backgroundColor: cursor.color || '#4fe3ff', boxShadow: `0 0 12px ${cursor.color || '#4fe3ff'}` }}
          />
          <span className="rounded-full bg-black/60 px-2 py-0.5 text-white/80 backdrop-blur">
            {cursor.name}
          </span>
        </motion.div>
      ))}
    </div>
  )
}

export default memo(PresenceLayer)
