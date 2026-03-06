import { useState, useEffect, useCallback } from 'react'
import { Plus, Wallet as WalletIcon } from 'lucide-react'
import api from '../../lib/api'
import { formatCurrency } from '../../lib/utils'
import AccountCard from '../../components/features/AccountCard'
import AccountForm from '../../components/features/AccountForm'
import Modal from '../../components/common/Modal'
import Loader from '../../components/common/Loader'
import EmptyState from '../../components/common/EmptyState'
import toast from 'react-hot-toast'

export default function AccountsPage() {
  const [accounts, setAccounts] = useState([])
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [modalOpen, setModalOpen] = useState(false)
  const [editing, setEditing] = useState(null)

  const loadAccounts = useCallback(async () => {
    try {
      const data = await api.getAccounts()
      setAccounts(data.accounts || [])
    } catch (err) {
      toast.error('Failed to load accounts')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    loadAccounts()
  }, [loadAccounts])

  const handleCreate = async (formData) => {
    setSubmitting(true)
    try {
      await api.createAccount(formData)
      toast.success('Account created')
      setModalOpen(false)
      loadAccounts()
    } catch (err) {
      toast.error(err.message)
    } finally {
      setSubmitting(false)
    }
  }

  const handleUpdate = async (formData) => {
    setSubmitting(true)
    try {
      await api.updateAccount(editing._id, formData)
      toast.success('Account updated')
      setEditing(null)
      setModalOpen(false)
      loadAccounts()
    } catch (err) {
      toast.error(err.message)
    } finally {
      setSubmitting(false)
    }
  }

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this account? All linked transactions will remain.')) return
    try {
      await api.deleteAccount(id)
      toast.success('Account deleted')
      loadAccounts()
    } catch (err) {
      toast.error(err.message)
    }
  }

  const totalBalance = accounts.reduce((sum, acc) => sum + acc.balance, 0)
  const activeAccounts = accounts.filter((a) => a.isActive)

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Accounts</h1>
          <p className="text-sm text-gray-500 dark:text-gray-400">
            Manage your bank accounts, wallets, and cards
          </p>
        </div>
        <button
          onClick={() => { setEditing(null); setModalOpen(true) }}
          className="flex items-center gap-2 rounded-lg bg-indigo-600 px-4 py-2 text-sm font-medium text-white hover:bg-indigo-700"
        >
          <Plus size={16} /> Add Account
        </button>
      </div>

      {/* Aggregate Balance */}
      {accounts.length > 0 && (
        <div className="rounded-xl border border-gray-200 bg-gradient-to-r from-indigo-600 to-indigo-800 p-6 text-white dark:border-gray-800">
          <p className="text-sm font-medium text-indigo-200">Total Balance</p>
          <p className="mt-1 text-3xl font-bold">{formatCurrency(totalBalance)}</p>
          <p className="mt-2 text-sm text-indigo-200">
            Across {activeAccounts.length} active account{activeAccounts.length !== 1 ? 's' : ''}
          </p>
        </div>
      )}

      {/* Accounts Grid */}
      {loading ? (
        <Loader className="py-12" />
      ) : accounts.length === 0 ? (
        <EmptyState
          icon={WalletIcon}
          title="No accounts yet"
          description="Add your bank accounts, wallets, and cards to start tracking"
          action={
            <button
              onClick={() => { setEditing(null); setModalOpen(true) }}
              className="rounded-lg bg-indigo-600 px-4 py-2 text-sm font-medium text-white hover:bg-indigo-700"
            >
              Add First Account
            </button>
          }
        />
      ) : (
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
          {accounts.map((account) => (
            <AccountCard
              key={account._id}
              account={account}
              onEdit={(acc) => { setEditing(acc); setModalOpen(true) }}
              onDelete={handleDelete}
            />
          ))}
        </div>
      )}

      {/* Modal */}
      <Modal
        open={modalOpen}
        onClose={() => { setModalOpen(false); setEditing(null) }}
        title={editing ? 'Edit Account' : 'Add Account'}
        size="sm"
      >
        <AccountForm
          initialData={editing}
          onSubmit={editing ? handleUpdate : handleCreate}
          onCancel={() => { setModalOpen(false); setEditing(null) }}
          loading={submitting}
        />
      </Modal>
    </div>
  )
}
