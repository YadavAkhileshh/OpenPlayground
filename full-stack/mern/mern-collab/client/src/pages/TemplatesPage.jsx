import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { Sparkles, Plus } from 'lucide-react'
import toast from 'react-hot-toast'
import * as api from '../../lib/api'
import Loader from '../../components/common/Loader'
import EmptyState from '../../components/common/EmptyState'

const TEMPLATE_ICONS = {
  blank: '📄',
  brainstorm: '🧠',
  retrospective: '🔄',
  mindmap: '🗺️',
  wireframe: '🖥️',
}

export default function TemplatesPage() {
  const navigate = useNavigate()
  const [templates, setTemplates] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    ;(async () => {
      try {
        const { data } = await api.getTemplates()
        setTemplates(data)
      } catch {
        toast.error('Failed to load templates')
      } finally {
        setLoading(false)
      }
    })()
  }, [])

  const useTemplate = async (template) => {
    try {
      const { data } = await api.createBoard({
        name: template.name,
        elements: template.elements || [],
      })
      navigate(`/board/${data._id}`)
    } catch {
      toast.error('Failed to create board')
    }
  }

  if (loading) {
    return (
      <div className="flex-1 flex items-center justify-center">
        <Loader text="Loading templates..." />
      </div>
    )
  }

  return (
    <div className="flex-1 overflow-y-auto p-6 lg:p-8">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Templates</h1>
        <p className="text-gray-500 dark:text-gray-400 text-sm mt-1">Start with a pre-made layout</p>
      </div>

      {templates.length === 0 ? (
        <EmptyState icon={Sparkles} title="No templates available" description="Templates will appear here" />
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {templates.map((t) => (
            <button
              key={t.id}
              onClick={() => useTemplate(t)}
              className="text-left bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl p-6 hover:shadow-lg hover:border-indigo-300 dark:hover:border-indigo-600 transition-all duration-200 group"
            >
              <div className="text-4xl mb-4">{TEMPLATE_ICONS[t.id] || '📋'}</div>
              <h3 className="font-semibold text-gray-900 dark:text-white group-hover:text-indigo-500 transition-colors">{t.name}</h3>
              <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">{t.description}</p>
              <div className="flex items-center gap-1 mt-4 text-xs text-indigo-500 font-medium">
                <Plus size={14} /> Use template
              </div>
            </button>
          ))}
        </div>
      )}
    </div>
  )
}
