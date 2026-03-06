import { useState, useEffect } from 'react'
import { CATEGORY_LABELS } from '../../lib/utils'

const INITIAL = {
  type: 'expense',
  amount: '',
  category: 'food',
  description: '',
  notes: '',
  date: new Date().toISOString().split('T')[0],
  account: '',
  isRecurring: false,
  recurringInterval: null,
}

export default function TransactionForm({ accounts = [], initialData, onSubmit, onCancel, loading }) {
  const [form, setForm] = useState(INITIAL)

  useEffect(() => {
    if (initialData) {
      setForm({
        type: initialData.type || 'expense',
        amount: initialData.amount || '',
        category: initialData.category || 'food',
        description: initialData.description || '',
        notes: initialData.notes || '',
        date: initialData.date
          ? new Date(initialData.date).toISOString().split('T')[0]
          : new Date().toISOString().split('T')[0],
        account: initialData.account?._id || initialData.account || '',
        isRecurring: initialData.isRecurring || false,
        recurringInterval: initialData.recurringInterval || null,
      })
    }
  }, [initialData])

  const handleChange = (e) => {
    const { name, value, type: inputType, checked } = e.target
    setForm((prev) => ({
      ...prev,
      [name]: inputType === 'checkbox' ? checked : value,
    }))
  }

  const handleSubmit = (e) => {
    e.preventDefault()
    onSubmit({
      ...form,
      amount: Number(form.amount),
      recurringInterval: form.isRecurring ? form.recurringInterval : null,
    })
  }

  const incomeCategories = ['salary', 'freelance', 'investment', 'gift', 'other']
  const expenseCategories = Object.keys(CATEGORY_LABELS).filter(
    (c) => !incomeCategories.includes(c) || c === 'other',
  )
  const categories = form.type === 'income' ? incomeCategories : expenseCategories

  const inputClass =
    'w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm text-gray-900 placeholder-gray-400 focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500 dark:border-gray-700 dark:bg-gray-900 dark:text-white dark:placeholder-gray-500 dark:focus:border-indigo-400'

  const labelClass = 'mb-1 block text-sm font-medium text-gray-700 dark:text-gray-300'

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {/* Type */}
      <div className="flex gap-2">
        {['expense', 'income', 'transfer'].map((t) => (
          <button
            type="button"
            key={t}
            onClick={() => setForm((prev) => ({ ...prev, type: t }))}
            className={`flex-1 rounded-lg px-3 py-2 text-sm font-medium capitalize transition-colors ${
              form.type === t
                ? t === 'income'
                  ? 'bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300'
                  : t === 'expense'
                    ? 'bg-red-100 text-red-700 dark:bg-red-900 dark:text-red-300'
                    : 'bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300'
                : 'bg-gray-100 text-gray-600 hover:bg-gray-200 dark:bg-gray-800 dark:text-gray-400 dark:hover:bg-gray-700'
            }`}
          >
            {t}
          </button>
        ))}
      </div>

      {/* Amount + Date row */}
      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className={labelClass}>Amount</label>
          <input
            type="number"
            name="amount"
            value={form.amount}
            onChange={handleChange}
            placeholder="0.00"
            min="0"
            step="0.01"
            required
            className={inputClass}
          />
        </div>
        <div>
          <label className={labelClass}>Date</label>
          <input
            type="date"
            name="date"
            value={form.date}
            onChange={handleChange}
            required
            className={inputClass}
          />
        </div>
      </div>

      {/* Category + Account row */}
      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className={labelClass}>Category</label>
          <select
            name="category"
            value={form.category}
            onChange={handleChange}
            required
            className={inputClass}
          >
            {categories.map((cat) => (
              <option key={cat} value={cat}>
                {CATEGORY_LABELS[cat] || cat}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label className={labelClass}>Account</label>
          <select
            name="account"
            value={form.account}
            onChange={handleChange}
            required
            className={inputClass}
          >
            <option value="">Select account</option>
            {accounts.map((acc) => (
              <option key={acc._id} value={acc._id}>
                {acc.name}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Description */}
      <div>
        <label className={labelClass}>Description</label>
        <input
          type="text"
          name="description"
          value={form.description}
          onChange={handleChange}
          placeholder="What was this for?"
          className={inputClass}
        />
      </div>

      {/* Notes */}
      <div>
        <label className={labelClass}>Notes</label>
        <textarea
          name="notes"
          value={form.notes}
          onChange={handleChange}
          placeholder="Additional notes..."
          rows={2}
          className={inputClass}
        />
      </div>

      {/* Recurring */}
      <div className="flex items-center gap-3">
        <label className="flex items-center gap-2 text-sm text-gray-700 dark:text-gray-300">
          <input
            type="checkbox"
            name="isRecurring"
            checked={form.isRecurring}
            onChange={handleChange}
            className="h-4 w-4 rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
          />
          Recurring transaction
        </label>
        {form.isRecurring && (
          <select
            name="recurringInterval"
            value={form.recurringInterval || 'monthly'}
            onChange={handleChange}
            className={inputClass + ' !w-auto'}
          >
            <option value="daily">Daily</option>
            <option value="weekly">Weekly</option>
            <option value="biweekly">Bi-weekly</option>
            <option value="monthly">Monthly</option>
            <option value="yearly">Yearly</option>
          </select>
        )}
      </div>

      {/* Actions */}
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
          {loading ? 'Saving...' : initialData ? 'Update' : 'Add Transaction'}
        </button>
      </div>
    </form>
  )
}
