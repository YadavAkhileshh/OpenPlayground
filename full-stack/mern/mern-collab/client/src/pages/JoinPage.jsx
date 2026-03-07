import { useState, useEffect } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { Layers } from 'lucide-react'
import toast from 'react-hot-toast'
import * as api from '../../lib/api'
import Loader from '../../components/common/Loader'

export default function JoinPage() {
  const { code } = useParams()
  const navigate = useNavigate()
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    ;(async () => {
      try {
        const { data } = await api.getBoardByCode(code)
        navigate(`/board/${data._id}`, { replace: true })
      } catch (err) {
        setError(err.response?.data?.message || 'Board not found')
        setLoading(false)
      }
    })()
  }, [code, navigate])

  if (loading) {
    return (
      <div className="h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900">
        <Loader text="Joining board..." />
      </div>
    )
  }

  return (
    <div className="h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900 px-4">
      <div className="text-center">
        <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-red-50 dark:bg-red-500/10 text-red-500 mb-4">
          <Layers size={28} />
        </div>
        <h1 className="text-xl font-bold text-gray-900 dark:text-white mb-2">Unable to join</h1>
        <p className="text-gray-500 dark:text-gray-400 mb-6">{error}</p>
        <button onClick={() => navigate('/')} className="px-4 py-2 bg-indigo-500 hover:bg-indigo-600 text-white font-medium rounded-lg transition-colors">
          Go Home
        </button>
      </div>
    </div>
  )
}
