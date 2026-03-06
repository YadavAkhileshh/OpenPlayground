import { useState, useEffect } from 'react'
import { ACCOUNT_TYPES } from '../../lib/utils'

const COLOR_PRESETS = ['#6366f1', '#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899', '#06b6d4']

const INITIAL = {
  name: '',
  type: 'bank',
  balance: '',
  currency: 'USD',
  color: '#6366f1',
}

export default function AccountForm({ initialData, onSubmit, onCancel, loading }) {
  const [form, setForm] = useState(INITIAL)

  useEffect(() => {
    if (initialData) {
      setForm({
        name: initialData.name || '',
        type: initialData.type || 'bank',
        balance: initialData.balance ?? '',
        currency: initialData.currency || 'USD',
        color: initialData.color || '#6366f1',
      })
    }
  }, [initialData])

  const handleChange = (e) => {
    const { name, value } = e.target
    setForm((prev) => ({ ...prev, [name]: value }))
  }

  const handleSubmit = (e) => {
    e.preventDefault()
    onSubmit({ ...form, balance: Number(form.balance) })
  }

  const inputClass =
    'w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm text-gray-900 placeholder-gray-400 focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500 dark:border-gray-700 dark:bg-gray-900 dark:text-white dark:placeholder-gray-500 dark:focus:border-indigo-400'

  const labelClass = 'mb-1 block text-sm font-medium text-gray-700 dark:text-gray-300'

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label className={labelClass}>Account Name</label>
        <input
          type="text"
          name="name"
          value={form.name}
          onChange={handleChange}
          placeholder="e.g., Main Checking"
          required
          className={inputClass}
        />
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className={labelClass}>Type</label>
          <select name="type" value={form.type} onChange={handleChange} className={inputClass}>
            {ACCOUNT_TYPES.map((t) => (
              <option key={t.value} value={t.value}>
                {t.label}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label className={labelClass}>Balance</label>
          <input
            type="number"
            name="balance"
            value={form.balance}
            onChange={handleChange}
            placeholder="0.00"
            step="0.01"
            required
            className={inputClass}
          />
        </div>
      </div>

      <div>
        <label className={labelClass}>Currency</label>
        <select name="currency" value={form.currency} onChange={handleChange} className={inputClass}>
          <option value="USD">USD - US Dollar</option>
          <option value="EUR">EUR - Euro</option>
          <option value="GBP">GBP - British Pound</option>
          <option value="INR">INR - Indian Rupee</option>
          <option value="JPY">JPY - Japanese Yen</option>
          <option value="CAD">CAD - Canadian Dollar</option>
          <option value="AUD">AUD - Australian Dollar</option>
        </select>
      </div>

      <div>
        <label className={labelClass}>Color</label>
        <div className="flex flex-wrap gap-2">
          {COLOR_PRESETS.map((c) => (
            <button
              key={c}
              type="button"
              onClick={() => setForm((prev) => ({ ...prev, color: c }))}
              className={`h-8 w-8 rounded-full border-2 transition-transform ${
                form.color === c
                  ? 'scale-110 border-gray-900 dark:border-white'
                  : 'border-transparent hover:scale-105'
              }`}
              style={{ backgroundColor: c }}
            />
          ))}
        </div>
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
          {loading ? 'Saving...' : initialData ? 'Update Account' : 'Add Account'}
        </button>
      </div>
    </form>
  )
}
