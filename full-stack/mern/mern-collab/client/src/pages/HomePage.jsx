import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { Plus, Search, LayoutGrid, List, Layers } from 'lucide-react'
import toast from 'react-hot-toast'
import * as api from '../../lib/api'
import BoardCard from '../../components/board/BoardCard'
import Loader from '../../components/common/Loader'
import EmptyState from '../../components/common/EmptyState'

export default function HomePage() {
  const navigate = useNavigate()
  const [boards, setBoards] = useState([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [viewMode, setViewMode] = useState('grid')

  useEffect(() => {
    fetchBoards()
  }, [])

  const fetchBoards = async () => {
    try {
      const { data } = await api.getBoards()
      setBoards(data)
    } catch {
      toast.error('Failed to load boards')
    } finally {
      setLoading(false)
    }
  }

  const createBoard = async () => {
    try {
      const { data } = await api.createBoard({ name: 'Untitled Board' })
      navigate(`/board/${data._id}`)
    } catch {
      toast.error('Failed to create board')
    }
  }

  const deleteBoard = async (id) => {
    if (!window.confirm('Delete this board?')) return
    try {
      await api.deleteBoard(id)
      setBoards((prev) => prev.filter((b) => b._id !== id))
      toast.success('Board deleted')
    } catch {
      toast.error('Failed to delete')
    }
  }

  const duplicateBoard = async (id) => {
    try {
      const board = boards.find((b) => b._id === id)
      const { data } = await api.createBoard({ name: `${board.name} (copy)`, elements: board.elements })
      setBoards((prev) => [data, ...prev])
      toast.success('Board duplicated')
    } catch {
      toast.error('Failed to duplicate')
    }
  }

  const filtered = boards.filter((b) =>
    b.name.toLowerCase().includes(search.toLowerCase()),
  )

  if (loading) {
    return (
      <div className="flex-1 flex items-center justify-center">
        <Loader text="Loading boards..." />
      </div>
    )
  }

  return (
    <div className="flex-1 overflow-y-auto p-6 lg:p-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">My Boards</h1>
          <p className="text-gray-500 dark:text-gray-400 text-sm mt-1">{boards.length} board{boards.length !== 1 && 's'}</p>
        </div>
        <button
          onClick={createBoard}
          className="flex items-center gap-2 px-4 py-2.5 bg-indigo-500 hover:bg-indigo-600 text-white font-medium rounded-lg transition-colors shadow-sm"
        >
          <Plus size={18} /> New Board
        </button>
      </div>

      {/* Search & view toggle */}
      {boards.length > 0 && (
        <div className="flex items-center gap-3 mb-6">
          <div className="relative flex-1 max-w-sm">
            <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search boards..."
              className="w-full pl-9 pr-4 py-2 rounded-lg border border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-white text-sm focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
            />
          </div>
          <div className="flex rounded-lg border border-gray-200 dark:border-gray-600 overflow-hidden">
            <button
              onClick={() => setViewMode('grid')}
              className={`p-2 ${viewMode === 'grid' ? 'bg-indigo-50 dark:bg-indigo-500/10 text-indigo-500' : 'text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-700'}`}
            >
              <LayoutGrid size={16} />
            </button>
            <button
              onClick={() => setViewMode('list')}
              className={`p-2 ${viewMode === 'list' ? 'bg-indigo-50 dark:bg-indigo-500/10 text-indigo-500' : 'text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-700'}`}
            >
              <List size={16} />
            </button>
          </div>
        </div>
      )}

      {/* Content */}
      {filtered.length === 0 && boards.length > 0 ? (
        <EmptyState icon={Search} title="No boards found" description="Try a different search term" />
      ) : boards.length === 0 ? (
        <EmptyState
          icon={Layers}
          title="No boards yet"
          description="Create your first collaborative whiteboard to get started"
          action={
            <button onClick={createBoard} className="flex items-center gap-2 px-4 py-2.5 bg-indigo-500 hover:bg-indigo-600 text-white font-medium rounded-lg transition-colors">
              <Plus size={18} /> Create Board
            </button>
          }
        />
      ) : (
        <div className={viewMode === 'grid' ? 'grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4' : 'space-y-3'}>
          {filtered.map((board) => (
            <BoardCard key={board._id} board={board} onDelete={deleteBoard} onDuplicate={duplicateBoard} />
          ))}
        </div>
      )}
    </div>
  )
}
