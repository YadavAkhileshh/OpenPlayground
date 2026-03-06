import { useState, useEffect, useCallback } from 'react'
import {
  Plus,
  Search,
  Filter,
  ChevronLeft,
  ChevronRight,
  Pencil,
  Trash2,
  RefreshCw,
  ArrowLeftRight,
} from 'lucide-react'
import api from '../../lib/api'
import { formatCurrency, formatDate, CATEGORY_LABELS, CATEGORY_COLORS } from '../../lib/utils'
import Modal from '../../components/common/Modal'
import TransactionForm from '../../components/features/TransactionForm'
import Loader from '../../components/common/Loader'
import EmptyState from '../../components/common/EmptyState'
import toast from 'react-hot-toast'

export default function TransactionsPage() {
  const [transactions, setTransactions] = useState([])
  const [accounts, setAccounts] = useState([])
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [modalOpen, setModalOpen] = useState(false)
  const [editingTx, setEditingTx] = useState(null)
  const [showFilters, setShowFilters] = useState(false)
  const [page, setPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [filters, setFilters] = useState({
    search: '',
    type: '',
    category: '',
    startDate: '',
    endDate: '',
  })

  const loadTransactions = useCallback(async () => {
    setLoading(true)
    try {
      const params = { page, limit: 15 }
      if (filters.type) params.type = filters.type
      if (filters.category) params.category = filters.category
      if (filters.startDate) params.startDate = filters.startDate
      if (filters.endDate) params.endDate = filters.endDate
      if (filters.search) params.search = filters.search

      const data = await api.getTransactions(params)
      setTransactions(data.transactions || [])
      setTotalPages(data.totalPages || 1)
    } catch (err) {
      toast.error('Failed to load transactions')
    } finally {
      setLoading(false)
    }
  }, [page, filters])

  const loadAccounts = useCallback(async () => {
    try {
      const data = await api.getAccounts()
      setAccounts(data.accounts || [])
    } catch {
      /* silent */
    }
  }, [])

  useEffect(() => {
    loadAccounts()
  }, [loadAccounts])

  useEffect(() => {
    loadTransactions()
  }, [loadTransactions])

  const handleCreate = async (formData) => {
    setSubmitting(true)
    try {
      await api.createTransaction(formData)
      toast.success('Transaction added')
      setModalOpen(false)
      loadTransactions()
    } catch (err) {
      toast.error(err.message)
    } finally {
      setSubmitting(false)
    }
  }

  const handleUpdate = async (formData) => {
    setSubmitting(true)
    try {
      await api.updateTransaction(editingTx._id, formData)
      toast.success('Transaction updated')
      setEditingTx(null)
      setModalOpen(false)
      loadTransactions()
    } catch (err) {
      toast.error(err.message)
    } finally {
      setSubmitting(false)
    }
  }

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this transaction?')) return
    try {
      await api.deleteTransaction(id)
      toast.success('Transaction deleted')
      loadTransactions()
    } catch (err) {
      toast.error(err.message)
    }
  }

  const openEdit = (tx) => {
    setEditingTx(tx)
    setModalOpen(true)
  }

  const openCreate = () => {
    setEditingTx(null)
    setModalOpen(true)
  }

  const resetFilters = () => {
    setFilters({ search: '', type: '', category: '', startDate: '', endDate: '' })
    setPage(1)
  }

  const selectClass =
    'rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm text-gray-900 focus:border-indigo-500 focus:outline-none dark:border-gray-700 dark:bg-gray-900 dark:text-white'

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Transactions</h1>
          <p className="text-sm text-gray-500 dark:text-gray-400">
            Manage your income and expenses
          </p>
        </div>
        <button
          onClick={openCreate}
          className="flex items-center gap-2 rounded-lg bg-indigo-600 px-4 py-2 text-sm font-medium text-white hover:bg-indigo-700"
        >
          <Plus size={16} /> Add Transaction
        </button>
      </div>

      {/* Search + Filter bar */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
        <div className="relative flex-1">
          <Search
            size={16}
            className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
          />
          <input
            type="text"
            placeholder="Search transactions..."
            value={filters.search}
            onChange={(e) => {
              setFilters((f) => ({ ...f, search: e.target.value }))
              setPage(1)
            }}
            className="w-full rounded-lg border border-gray-300 bg-white py-2 pl-9 pr-3 text-sm text-gray-900 placeholder-gray-400 focus:border-indigo-500 focus:outline-none dark:border-gray-700 dark:bg-gray-900 dark:text-white dark:placeholder-gray-500"
          />
        </div>
        <button
          onClick={() => setShowFilters(!showFilters)}
          className={`flex items-center gap-2 rounded-lg border px-3 py-2 text-sm font-medium transition-colors ${
            showFilters
              ? 'border-indigo-300 bg-indigo-50 text-indigo-700 dark:border-indigo-700 dark:bg-indigo-950 dark:text-indigo-300'
              : 'border-gray-300 text-gray-700 hover:bg-gray-50 dark:border-gray-700 dark:text-gray-300 dark:hover:bg-gray-800'
          }`}
        >
          <Filter size={16} /> Filters
        </button>
      </div>

      {/* Filter panel */}
      {showFilters && (
        <div className="flex flex-wrap items-end gap-3 rounded-xl border border-gray-200 bg-white p-4 dark:border-gray-800 dark:bg-gray-950">
          <div>
            <label className="mb-1 block text-xs font-medium text-gray-500 dark:text-gray-400">
              Type
            </label>
            <select
              value={filters.type}
              onChange={(e) => { setFilters((f) => ({ ...f, type: e.target.value })); setPage(1) }}
              className={selectClass}
            >
              <option value="">All types</option>
              <option value="income">Income</option>
              <option value="expense">Expense</option>
              <option value="transfer">Transfer</option>
            </select>
          </div>
          <div>
            <label className="mb-1 block text-xs font-medium text-gray-500 dark:text-gray-400">
              Category
            </label>
            <select
              value={filters.category}
              onChange={(e) => { setFilters((f) => ({ ...f, category: e.target.value })); setPage(1) }}
              className={selectClass}
            >
              <option value="">All categories</option>
              {Object.entries(CATEGORY_LABELS).map(([key, label]) => (
                <option key={key} value={key}>{label}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="mb-1 block text-xs font-medium text-gray-500 dark:text-gray-400">
              From
            </label>
            <input
              type="date"
              value={filters.startDate}
              onChange={(e) => { setFilters((f) => ({ ...f, startDate: e.target.value })); setPage(1) }}
              className={selectClass}
            />
          </div>
          <div>
            <label className="mb-1 block text-xs font-medium text-gray-500 dark:text-gray-400">
              To
            </label>
            <input
              type="date"
              value={filters.endDate}
              onChange={(e) => { setFilters((f) => ({ ...f, endDate: e.target.value })); setPage(1) }}
              className={selectClass}
            />
          </div>
          <button
            onClick={resetFilters}
            className="flex items-center gap-1 rounded-lg px-3 py-2 text-sm text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
          >
            <RefreshCw size={14} /> Reset
          </button>
        </div>
      )}

      {/* Transactions List */}
      {loading ? (
        <Loader className="py-12" />
      ) : transactions.length === 0 ? (
        <EmptyState
          icon={ArrowLeftRight}
          title="No transactions found"
          description={
            filters.search || filters.type || filters.category
              ? 'Try adjusting your filters'
              : 'Add your first transaction to get started'
          }
          action={
            !filters.search && !filters.type && !filters.category && (
              <button
                onClick={openCreate}
                className="rounded-lg bg-indigo-600 px-4 py-2 text-sm font-medium text-white hover:bg-indigo-700"
              >
                Add Transaction
              </button>
            )
          }
        />
      ) : (
        <div className="overflow-hidden rounded-xl border border-gray-200 bg-white dark:border-gray-800 dark:bg-gray-950">
          {/* Table header */}
          <div className="hidden border-b border-gray-200 px-5 py-3 text-xs font-medium uppercase text-gray-500 dark:border-gray-800 dark:text-gray-400 sm:grid sm:grid-cols-12 sm:gap-4">
            <span className="col-span-4">Description</span>
            <span className="col-span-2">Category</span>
            <span className="col-span-2">Date</span>
            <span className="col-span-2 text-right">Amount</span>
            <span className="col-span-2 text-right">Actions</span>
          </div>

          {/* Rows */}
          {transactions.map((tx) => (
            <div
              key={tx._id}
              className="grid grid-cols-1 gap-2 border-b border-gray-100 px-5 py-3.5 last:border-0 dark:border-gray-800/50 sm:grid-cols-12 sm:items-center sm:gap-4"
            >
              {/* Description */}
              <div className="col-span-4 flex items-center gap-3">
                <div
                  className="hidden h-2.5 w-2.5 rounded-full sm:block"
                  style={{ backgroundColor: CATEGORY_COLORS[tx.category] || '#64748b' }}
                />
                <div>
                  <p className="text-sm font-medium text-gray-900 dark:text-white">
                    {tx.description || CATEGORY_LABELS[tx.category] || tx.category}
                  </p>
                  {tx.account?.name && (
                    <p className="text-xs text-gray-400">{tx.account.name}</p>
                  )}
                  {tx.isRecurring && (
                    <span className="inline-flex items-center gap-1 text-xs text-indigo-600 dark:text-indigo-400">
                      <RefreshCw size={10} /> {tx.recurringInterval}
                    </span>
                  )}
                </div>
              </div>

              {/* Category */}
              <div className="col-span-2">
                <span className="inline-block rounded-full bg-gray-100 px-2.5 py-0.5 text-xs font-medium text-gray-700 dark:bg-gray-800 dark:text-gray-300">
                  {CATEGORY_LABELS[tx.category] || tx.category}
                </span>
              </div>

              {/* Date */}
              <div className="col-span-2 text-sm text-gray-500 dark:text-gray-400">
                {formatDate(tx.date)}
              </div>

              {/* Amount */}
              <div className="col-span-2 text-right">
                <span
                  className={`text-sm font-semibold ${
                    tx.type === 'income'
                      ? 'text-green-600 dark:text-green-400'
                      : 'text-red-600 dark:text-red-400'
                  }`}
                >
                  {tx.type === 'income' ? '+' : '-'}
                  {formatCurrency(tx.amount)}
                </span>
              </div>

              {/* Actions */}
              <div className="col-span-2 flex justify-end gap-1">
                <button
                  onClick={() => openEdit(tx)}
                  className="rounded-lg p-1.5 text-gray-400 hover:bg-gray-100 hover:text-gray-600 dark:hover:bg-gray-800 dark:hover:text-gray-300"
                >
                  <Pencil size={14} />
                </button>
                <button
                  onClick={() => handleDelete(tx._id)}
                  className="rounded-lg p-1.5 text-gray-400 hover:bg-red-50 hover:text-red-600 dark:hover:bg-red-950 dark:hover:text-red-400"
                >
                  <Trash2 size={14} />
                </button>
              </div>
            </div>
          ))}

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex items-center justify-between border-t border-gray-200 px-5 py-3 dark:border-gray-800">
              <p className="text-sm text-gray-500 dark:text-gray-400">
                Page {page} of {totalPages}
              </p>
              <div className="flex gap-2">
                <button
                  onClick={() => setPage((p) => Math.max(1, p - 1))}
                  disabled={page <= 1}
                  className="rounded-lg border border-gray-300 p-1.5 text-gray-600 hover:bg-gray-50 disabled:opacity-50 dark:border-gray-700 dark:text-gray-400 dark:hover:bg-gray-800"
                >
                  <ChevronLeft size={16} />
                </button>
                <button
                  onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                  disabled={page >= totalPages}
                  className="rounded-lg border border-gray-300 p-1.5 text-gray-600 hover:bg-gray-50 disabled:opacity-50 dark:border-gray-700 dark:text-gray-400 dark:hover:bg-gray-800"
                >
                  <ChevronRight size={16} />
                </button>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Transaction Modal */}
      <Modal
        open={modalOpen}
        onClose={() => { setModalOpen(false); setEditingTx(null) }}
        title={editingTx ? 'Edit Transaction' : 'Add Transaction'}
        size="md"
      >
        <TransactionForm
          accounts={accounts}
          initialData={editingTx}
          onSubmit={editingTx ? handleUpdate : handleCreate}
          onCancel={() => { setModalOpen(false); setEditingTx(null) }}
          loading={submitting}
        />
      </Modal>
    </div>
  )
}
