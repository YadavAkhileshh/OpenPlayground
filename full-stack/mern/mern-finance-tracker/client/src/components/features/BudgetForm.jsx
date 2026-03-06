import { useState, useEffect } from 'react'
import { CATEGORY_LABELS, CATEGORY_COLORS } from '../../lib/utils'

const INITIAL = {
  category: 'food',
  limit: '',
  alertThreshold: 80,
}

export default function BudgetForm({ initialData, onSubmit, onCancel, loading }) {
  const [form, setForm] = useState(INITIAL)

  useEffect(() => {
    if (initialData) {
      setForm({
        category: initialData.category || 'food',
        limit: initialData.limit ?? '',
        alertThreshold: initialData.alertThreshold ?? 80,
      })
    }
  }, [initialData])

  const handleChange = (e) => {
    const { name, value } = e.target
    setForm((prev) => ({ ...prev, [name]: value }))
  }

  const handleSubmit = (e) => {
    e.preventDefault()
    const now = new Date()
    onSubmit({
      ...form,
      limit: Number(form.limit),
      alertThreshold: Number(form.alertThreshold),
      color: CATEGORY_COLORS[form.category] || '#6366f1',
      month: now.getMonth() + 1,
      year: now.getFullYear(),
    })
  }

  const inputClass =
    'w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm text-gray-900 placeholder-gray-400 focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500 dark:border-gray-700 dark:bg-gray-900 dark:text-white dark:placeholder-gray-500 dark:focus:border-indigo-400'

  const labelClass = 'mb-1 block text-sm font-medium text-gray-700 dark:text-gray-300'

  const expenseCategories = Object.keys(CATEGORY_LABELS).filter(
    (c) => !['salary', 'freelance', 'investment'].includes(c),
  )

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label className={labelClass}>Category</label>
        <select
          name="category"
          value={form.category}
          onChange={handleChange}
          required
          className={inputClass}
          disabled={!!initialData}
        >
          {expenseCategories.map((cat) => (
            <option key={cat} value={cat}>
              {CATEGORY_LABELS[cat]}
            </option>
          ))}
        </select>
      </div>

      <div>
        <label className={labelClass}>Monthly Limit ($)</label>
        <input
          type="number"
          name="limit"
          value={form.limit}
          onChange={handleChange}
          placeholder="500.00"
          min="1"
          step="0.01"
          required
          className={inputClass}
        />
      </div>

      <div>
        <label className={labelClass}>
          Alert Threshold ({form.alertThreshold}%)
        </label>
        <input
          type="range"
          name="alertThreshold"
          value={form.alertThreshold}
          onChange={handleChange}
          min="50"
          max="100"
          className="w-full accent-indigo-600"
        />
        <div className="flex justify-between text-xs text-gray-400">
          <span>50%</span>
          <span>100%</span>
        </div>
      </div>

      {/* Preview */}
      <div className="rounded-lg bg-gray-50 p-3 dark:bg-gray-900">
        <p className="text-xs text-gray-500 dark:text-gray-400">
          You&apos;ll be alerted when spending reaches{' '}
          <strong className="text-gray-900 dark:text-white">{form.alertThreshold}%</strong> of{' '}
          <strong className="text-gray-900 dark:text-white">
            ${Number(form.limit || 0).toLocaleString()}
          </strong>{' '}
          ({`$${Math.round((Number(form.limit || 0) * form.alertThreshold) / 100).toLocaleString()}`})
        </p>
      </div>

      <div className="flex justify-end gap-3 pt-2">
        {onCancel && (
          <button
            type="button"
            onClick={onCancel}
            className="rounded-lg border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 dark:border-gray-600 dark:text-gray-300 dark:hover:bg-gray-800"
          >
            Cancel
          </button>
        )}
        <button
          type="submit"
          disabled={loading}
          className="rounded-lg bg-indigo-600 px-4 py-2 text-sm font-medium text-white hover:bg-indigo-700 disabled:opacity-50"
        >
          {loading ? 'Saving...' : initialData ? 'Update Budget' : 'Set Budget'}
        </button>
      </div>
    </form>
  )
}
