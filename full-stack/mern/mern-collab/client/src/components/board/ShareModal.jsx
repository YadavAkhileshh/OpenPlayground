import { useState, useEffect } from 'react'
import { Copy, Link2, UserPlus, Trash2, Check, RefreshCw } from 'lucide-react'
import toast from 'react-hot-toast'
import Modal from '../common/Modal'
import Avatar from '../common/Avatar'
import * as api from '../../lib/api'

export default function ShareModal({ open, onClose, board, onUpdate }) {
  const [email, setEmail] = useState('')
  const [role, setRole] = useState('editor')
  const [loading, setLoading] = useState(false)
  const [copied, setCopied] = useState(false)

  const shareUrl = board?.shareCode ? `${window.location.origin}/join/${board.shareCode}` : ''

  const copyLink = async () => {
    try {
      await navigator.clipboard.writeText(shareUrl)
      setCopied(true)
      toast.success('Link copied!')
      setTimeout(() => setCopied(false), 2000)
    } catch {
      toast.error('Failed to copy')
    }
  }

  const regenerateCode = async () => {
    try {
      const { data } = await api.regenerateShareCode(board._id)
      onUpdate?.(data)
      toast.success('New share link generated')
    } catch {
      toast.error('Failed to regenerate')
    }
  }

  const addCollaborator = async (e) => {
    e.preventDefault()
    if (!email.trim()) return
    setLoading(true)
    try {
      const { data } = await api.addCollaborator(board._id, email.trim(), role)
      onUpdate?.(data)
      setEmail('')
      toast.success('Collaborator added')
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to add collaborator')
    } finally {
      setLoading(false)
    }
  }

  const removeCollaborator = async (userId) => {
    try {
      const { data } = await api.removeCollaborator(board._id, userId)
      onUpdate?.(data)
      toast.success('Collaborator removed')
    } catch {
      toast.error('Failed to remove')
    }
  }

  return (
    <Modal open={open} onClose={onClose} title="Share Board">
      {/* Share Link */}
      <div className="mb-6">
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
          Share Link
        </label>
        <div className="flex gap-2">
          <div className="flex-1 flex items-center bg-gray-50 dark:bg-gray-700 rounded-lg border border-gray-200 dark:border-gray-600 px-3 py-2 text-sm text-gray-600 dark:text-gray-300 truncate">
            <Link2 size={14} className="shrink-0 mr-2 text-gray-400" />
            <span className="truncate">{shareUrl || 'No share link'}</span>
          </div>
          <button onClick={copyLink} className="p-2 rounded-lg bg-indigo-500 text-white hover:bg-indigo-600 transition-colors shrink-0">
            {copied ? <Check size={18} /> : <Copy size={18} />}
          </button>
          <button onClick={regenerateCode} className="p-2 rounded-lg border border-gray-200 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-700 text-gray-600 dark:text-gray-300 transition-colors shrink-0" title="Generate new link">
            <RefreshCw size={18} />
          </button>
        </div>
      </div>

      {/* Add collaborator */}
      <form onSubmit={addCollaborator} className="mb-6">
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
          Add by Email
        </label>
        <div className="flex gap-2">
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="user@example.com"
            className="flex-1 px-3 py-2 rounded-lg border border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white text-sm focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
          />
          <select
            value={role}
            onChange={(e) => setRole(e.target.value)}
            className="px-3 py-2 rounded-lg border border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white text-sm"
          >
            <option value="editor">Editor</option>
            <option value="viewer">Viewer</option>
          </select>
          <button
            type="submit"
            disabled={loading}
            className="p-2 rounded-lg bg-indigo-500 text-white hover:bg-indigo-600 disabled:opacity-50 transition-colors shrink-0"
          >
            <UserPlus size={18} />
          </button>
        </div>
      </form>

      {/* Collaborators list */}
      {board?.collaborators?.length > 0 && (
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Collaborators ({board.collaborators.length})
          </label>
          <div className="space-y-2 max-h-48 overflow-y-auto">
            {board.collaborators.map((c) => (
              <div key={c.user?._id || c._id} className="flex items-center gap-3 p-2 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700/50">
                <Avatar name={c.user?.name || 'User'} color={c.user?.color} size="sm" />
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-gray-900 dark:text-white truncate">{c.user?.name || 'Unknown'}</p>
                  <p className="text-xs text-gray-500 dark:text-gray-400 truncate">{c.user?.email}</p>
                </div>
                <span className="text-xs px-2 py-0.5 rounded-full bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400 capitalize">
                  {c.role}
                </span>
                <button onClick={() => removeCollaborator(c.user?._id)} className="p-1 rounded hover:bg-red-50 dark:hover:bg-red-500/10 text-gray-400 hover:text-red-500 transition-colors">
                  <Trash2 size={14} />
                </button>
              </div>
            ))}
          </div>
        </div>
      )}
    </Modal>
  )
}
