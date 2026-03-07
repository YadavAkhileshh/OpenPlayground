import { useRef, useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { ArrowLeft, Share2, Undo2, Redo2, Save, Users } from 'lucide-react'
import toast from 'react-hot-toast'
import useCanvas from '../../hooks/useCanvas'
import Canvas from '../../components/canvas/Canvas'
import Toolbar from '../../components/canvas/Toolbar'
import ShareModal from '../../components/board/ShareModal'
import ExportMenu from '../../components/board/ExportMenu'
import Avatar from '../../components/common/Avatar'
import Loader from '../../components/common/Loader'
import { useSocket } from '../../context/SocketContext'
import * as api from '../../lib/api'

export default function BoardPage() {
  const { id } = useParams()
  const navigate = useNavigate()
  const svgRef = useRef(null)
  const { activeUsers } = useSocket()

  const {
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
  } = useCanvas(id)

  const [board, setBoard] = useState(null)
  const [shareOpen, setShareOpen] = useState(false)
  const [boardName, setBoardName] = useState('')
  const [editingName, setEditingName] = useState(false)

  // Fetch board metadata
  useEffect(() => {
    ;(async () => {
      try {
        const { data } = await api.getBoard(id)
        setBoard(data)
        setBoardName(data.name)
      } catch {
        toast.error('Board not found')
        navigate('/')
      }
    })()
  }, [id, navigate])

  const saveName = async () => {
    setEditingName(false)
    if (boardName.trim() && boardName !== board?.name) {
      try {
        const { data } = await api.updateBoard(id, { name: boardName.trim() })
        setBoard(data)
      } catch {
        toast.error('Failed to rename')
      }
    }
  }

  const handleSave = async () => {
    try {
      await api.saveElements(id, elements)
      toast.success('Saved!')
    } catch {
      toast.error('Failed to save')
    }
  }

  if (loading || !board) {
    return (
      <div className="h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900">
        <Loader text="Loading board..." />
      </div>
    )
  }

  return (
    <div className="h-screen flex flex-col bg-gray-50 dark:bg-gray-900">
      {/* Top bar */}
      <header className="flex items-center gap-3 px-4 py-2 bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 z-30">
        <button onClick={() => navigate('/')} className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-600 dark:text-gray-300">
          <ArrowLeft size={18} />
        </button>

        {/* Board name */}
        {editingName ? (
          <input
            autoFocus
            value={boardName}
            onChange={(e) => setBoardName(e.target.value)}
            onBlur={saveName}
            onKeyDown={(e) => e.key === 'Enter' && saveName()}
            className="px-2 py-1 text-sm font-semibold bg-transparent border-b-2 border-indigo-500 text-gray-900 dark:text-white focus:outline-none"
          />
        ) : (
          <button onClick={() => setEditingName(true)} className="text-sm font-semibold text-gray-900 dark:text-white hover:text-indigo-500 transition-colors truncate max-w-[200px]">
            {boardName}
          </button>
        )}

        <div className="flex-1" />

        {/* Active users */}
        {activeUsers.length > 0 && (
          <div className="flex items-center gap-1 mr-2">
            <div className="flex -space-x-2">
              {activeUsers.slice(0, 4).map((u) => (
                <Avatar key={u.userId} name={u.username} color={u.color} size="sm" className="ring-2 ring-white dark:ring-gray-800" />
              ))}
            </div>
            {activeUsers.length > 4 && (
              <span className="text-xs text-gray-500 ml-1">+{activeUsers.length - 4}</span>
            )}
          </div>
        )}

        {/* Undo / Redo */}
        <div className="flex items-center border border-gray-200 dark:border-gray-600 rounded-lg overflow-hidden">
          <button onClick={undo} disabled={!canUndo} className="p-2 hover:bg-gray-50 dark:hover:bg-gray-700 text-gray-600 dark:text-gray-300 disabled:opacity-30" title="Undo (Ctrl+Z)">
            <Undo2 size={16} />
          </button>
          <button onClick={redo} disabled={!canRedo} className="p-2 hover:bg-gray-50 dark:hover:bg-gray-700 text-gray-600 dark:text-gray-300 disabled:opacity-30 border-l border-gray-200 dark:border-gray-600" title="Redo (Ctrl+Shift+Z)">
            <Redo2 size={16} />
          </button>
        </div>

        <button onClick={handleSave} className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-600 dark:text-gray-300" title="Save">
          <Save size={16} />
        </button>

        <ExportMenu svgRef={svgRef} boardName={board.name} />

        <button
          onClick={() => setShareOpen(true)}
          className="flex items-center gap-2 px-3 py-2 bg-indigo-500 hover:bg-indigo-600 text-white text-sm font-medium rounded-lg transition-colors"
        >
          <Share2 size={16} /> Share
        </button>
      </header>

      {/* Canvas area */}
      <div className="flex-1 flex overflow-hidden">
        {/* Toolbar */}
        <Toolbar
          tool={tool}
          onToolChange={setTool}
          color={color}
          onColorChange={setColor}
          strokeWidth={strokeWidth}
          onStrokeWidthChange={setStrokeWidth}
        />

        {/* Canvas */}
        <Canvas
          boardId={id}
          elements={elements}
          tool={tool}
          color={color}
          strokeWidth={strokeWidth}
          selectedId={selectedId}
          onSelect={setSelectedId}
          onElementAdd={addElement}
          onElementUpdate={updateElement}
          onElementDelete={deleteElement}
        />
      </div>

      {/* Share modal */}
      <ShareModal open={shareOpen} onClose={() => setShareOpen(false)} board={board} onUpdate={setBoard} />
    </div>
  )
}
