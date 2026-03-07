import { Link } from 'react-router-dom'
import { Users, Clock, MoreVertical, Trash2, Copy, ExternalLink } from 'lucide-react'
import { useState } from 'react'
import { formatRelative } from '../../lib/utils'
import Avatar from '../common/Avatar'

export default function BoardCard({ board, onDelete, onDuplicate }) {
  const [menuOpen, setMenuOpen] = useState(false)

  const collaboratorCount = board.collaborators?.length || 0

  return (
    <div className="group relative bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl overflow-hidden hover:shadow-lg hover:border-indigo-300 dark:hover:border-indigo-600 transition-all duration-200">
      {/* Thumbnail / preview */}
      <Link to={`/board/${board._id}`} className="block">
        <div className="h-40 bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-800 dark:to-gray-900 flex items-center justify-center relative overflow-hidden">
          {board.elements?.length > 0 ? (
            <svg viewBox="0 0 400 250" className="w-full h-full p-4" preserveAspectRatio="xMidYMid meet">
              {board.elements.slice(0, 20).map((el, i) => {
                if (el.type === 'rectangle')
                  return <rect key={i} x={el.x} y={el.y} width={Math.abs(el.width || 40)} height={Math.abs(el.height || 30)} stroke={el.color} strokeWidth={1} fill={el.fill || 'none'} rx={2} />
                if (el.type === 'circle' || el.type === 'ellipse')
                  return <ellipse key={i} cx={el.x + (el.width || 40) / 2} cy={el.y + (el.height || 40) / 2} rx={Math.abs(el.width || 40) / 2} ry={Math.abs(el.height || 40) / 2} stroke={el.color} strokeWidth={1} fill={el.fill || 'none'} />
                if (el.type === 'pen' && el.points?.length > 1) {
                  const d = el.points.reduce((a, p, j) => (j === 0 ? `M ${p.x} ${p.y}` : `${a} L ${p.x} ${p.y}`), '')
                  return <path key={i} d={d} stroke={el.color} strokeWidth={1} fill="none" />
                }
                return null
              })}
            </svg>
          ) : (
            <span className="text-gray-300 dark:text-gray-600 text-4xl font-light">✦</span>
          )}
        </div>
      </Link>

      {/* Info */}
      <div className="p-4">
        <div className="flex items-start justify-between gap-2">
          <Link to={`/board/${board._id}`} className="flex-1 min-w-0">
            <h3 className="font-semibold text-gray-900 dark:text-white truncate">{board.name}</h3>
          </Link>

          {/* Menu */}
          <div className="relative">
            <button
              onClick={() => setMenuOpen(!menuOpen)}
              className="p-1 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-400 opacity-0 group-hover:opacity-100 transition-opacity"
            >
              <MoreVertical size={16} />
            </button>
            {menuOpen && (
              <>
                <div className="fixed inset-0 z-10" onClick={() => setMenuOpen(false)} />
                <div className="absolute right-0 top-8 z-20 bg-white dark:bg-gray-800 rounded-lg shadow-xl border border-gray-200 dark:border-gray-700 py-1 w-40">
                  <Link
                    to={`/board/${board._id}`}
                    className="flex items-center gap-2 px-3 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700"
                  >
                    <ExternalLink size={14} /> Open
                  </Link>
                  <button
                    onClick={() => { onDuplicate?.(board._id); setMenuOpen(false) }}
                    className="flex items-center gap-2 px-3 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 w-full text-left"
                  >
                    <Copy size={14} /> Duplicate
                  </button>
                  <button
                    onClick={() => { onDelete?.(board._id); setMenuOpen(false) }}
                    className="flex items-center gap-2 px-3 py-2 text-sm text-red-600 hover:bg-red-50 dark:hover:bg-red-500/10 w-full text-left"
                  >
                    <Trash2 size={14} /> Delete
                  </button>
                </div>
              </>
            )}
          </div>
        </div>

        {/* Meta */}
        <div className="flex items-center gap-3 mt-2 text-xs text-gray-500 dark:text-gray-400">
          <span className="flex items-center gap-1">
            <Clock size={12} /> {formatRelative(board.updatedAt)}
          </span>
          {collaboratorCount > 0 && (
            <span className="flex items-center gap-1">
              <Users size={12} /> {collaboratorCount}
            </span>
          )}
        </div>

        {/* Collaborator avatars */}
        {collaboratorCount > 0 && (
          <div className="flex -space-x-2 mt-3">
            {board.collaborators.slice(0, 5).map((c, i) => (
              <Avatar key={i} name={c.user?.name || 'User'} color={c.user?.color} size="sm" className="ring-2 ring-white dark:ring-gray-800" />
            ))}
            {collaboratorCount > 5 && (
              <div className="w-7 h-7 rounded-full bg-gray-200 dark:bg-gray-700 flex items-center justify-center text-xs font-medium text-gray-600 dark:text-gray-300 ring-2 ring-white dark:ring-gray-800">
                +{collaboratorCount - 5}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  )
}
