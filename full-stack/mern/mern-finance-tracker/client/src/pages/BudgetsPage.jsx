import { useState, useEffect, useCallback } from 'react'
import { Plus, PiggyBank, Pencil, Trash2 } from 'lucide-react'
import api from '../../lib/api'
import { CATEGORY_LABELS } from '../../lib/utils'
import Modal from '../../components/common/Modal'
import BudgetForm from '../../components/features/BudgetForm'
import BudgetProgressBar from '../../components/features/BudgetProgressBar'
import Loader from '../../components/common/Loader'
import EmptyState from '../../components/common/EmptyState'
import toast from 'react-hot-toast'

export default function BudgetsPage() {
  const [budgets, setBudgets] = useState([])
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [modalOpen, setModalOpen] = useState(false)
  const [editing, setEditing] = useState(null)

  const now = new Date()
  const currentMonth = now.getMonth() + 1
  const currentYear = now.getFullYear()

  const loadBudgets = useCallback(async () => {
    try {
      const data = await api.getBudgets({ month: currentMonth, year: currentYear })
      setBudgets(data.budgets || [])
    } catch (err) {
      toast.error('Failed to load budgets')
    } finally {
      setLoading(false)
    }
  }, [currentMonth, currentYear])

  useEffect(() => {
    loadBudgets()
  }, [loadBudgets])

  const handleCreate = async (formData) => {
    setSubmitting(true)
    try {
      await api.createBudget(formData)
      toast.success('Budget created')
      setModalOpen(false)
      loadBudgets()
    } catch (err) {
      toast.error(err.message)
    } finally {
      setSubmitting(false)
    }
  }

  const handleUpdate = async (formData) => {
    setSubmitting(true)
    try {
      await api.updateBudget(editing._id, formData)
      toast.success('Budget updated')
      setEditing(null)
      setModalOpen(false)
      loadBudgets()
    } catch (err) {
      toast.error(err.message)
    } finally {
      setSubmitting(false)
    }
  }

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this budget?')) return
    try {
      await api.deleteBudget(id)
      toast.success('Budget deleted')
      loadBudgets()
    } catch (err) {
      toast.error(err.message)
    }
  }

  const totalBudget = budgets.reduce((sum, b) => sum + b.limit, 0)
  const totalSpent = budgets.reduce((sum, b) => sum + b.spent, 0)
  const overBudgetCount = budgets.filter((b) => b.isOverBudget).length
  const nearLimitCount = budgets.filter((b) => b.isNearLimit).length

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Budgets</h1>
          <p className="text-sm text-gray-500 dark:text-gray-400">
            {now.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })} — Set spending limits by category
          </p>
        </div>
        <button
          onClick={() => { setEditing(null); setModalOpen(true) }}
          className="flex items-center gap-2 rounded-lg bg-indigo-600 px-4 py-2 text-sm font-medium text-white hover:bg-indigo-700"
        >
          <Plus size={16} /> Add Budget
        </button>
      </div>

      {/* Summary cards */}
      {budgets.length > 0 && (
        <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
          <div className="rounded-xl border border-gray-200 bg-white p-4 dark:border-gray-800 dark:bg-gray-950">
            <p className="text-xs text-gray-500 dark:text-gray-400">Total Budget</p>
            <p className="mt-1 text-xl font-bold text-gray-900 dark:text-white">
              ${totalBudget.toLocaleString()}
            </p>
          </div>
          <div className="rounded-xl border border-gray-200 bg-white p-4 dark:border-gray-800 dark:bg-gray-950">
            <p className="text-xs text-gray-500 dark:text-gray-400">Total Spent</p>
            <p className="mt-1 text-xl font-bold text-gray-900 dark:text-white">
              ${totalSpent.toLocaleString()}
            </p>
          </div>
          <div className="rounded-xl border border-gray-200 bg-white p-4 dark:border-gray-800 dark:bg-gray-950">
            <p className="text-xs text-gray-500 dark:text-gray-400">Over Budget</p>
            <p className={`mt-1 text-xl font-bold ${overBudgetCount > 0 ? 'text-red-600' : 'text-green-600'}`}>
              {overBudgetCount}
            </p>
          </div>
          <div className="rounded-xl border border-gray-200 bg-white p-4 dark:border-gray-800 dark:bg-gray-950">
            <p className="text-xs text-gray-500 dark:text-gray-400">Near Limit</p>
            <p className={`mt-1 text-xl font-bold ${nearLimitCount > 0 ? 'text-amber-600' : 'text-green-600'}`}>
              {nearLimitCount}
            </p>
          </div>
        </div>
      )}

      {/* Budget List */}
      {loading ? (
        <Loader className="py-12" />
      ) : budgets.length === 0 ? (
        <EmptyState
          icon={PiggyBank}
          title="No budgets set"
          description="Create budgets to track spending by category"
          action={
            <button
              onClick={() => { setEditing(null); setModalOpen(true) }}
              className="rounded-lg bg-indigo-600 px-4 py-2 text-sm font-medium text-white hover:bg-indigo-700"
            >
              Create First Budget
            </button>
          }
        />
      ) : (
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
          {budgets.map((budget) => (
            <div key={budget._id} className="group relative">
              <BudgetProgressBar budget={budget} />
              {/* Hover actions */}
              <div className="absolute right-3 top-3 flex gap-1 opacity-0 transition-opacity group-hover:opacity-100">
                <button
                  onClick={() => { setEditing(budget); setModalOpen(true) }}
                  className="rounded-lg bg-white p-1.5 text-gray-400 shadow-sm hover:text-gray-600 dark:bg-gray-900 dark:hover:text-gray-300"
                >
                  <Pencil size={14} />
                </button>
                <button
                  onClick={() => handleDelete(budget._id)}
                  className="rounded-lg bg-white p-1.5 text-gray-400 shadow-sm hover:text-red-600 dark:bg-gray-900 dark:hover:text-red-400"
                >
                  <Trash2 size={14} />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Modal */}
      <Modal
        open={modalOpen}
        onClose={() => { setModalOpen(false); setEditing(null) }}
        title={editing ? 'Edit Budget' : 'Create Budget'}
        size="sm"
      >
        <BudgetForm
          initialData={editing}
          onSubmit={editing ? handleUpdate : handleCreate}
          onCancel={() => { setModalOpen(false); setEditing(null) }}
          loading={submitting}
        />
      </Modal>
    </div>
  )
}
