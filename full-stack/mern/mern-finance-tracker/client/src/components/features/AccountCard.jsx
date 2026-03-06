import { ACCOUNT_TYPES, formatCurrency } from '../../lib/utils'
import { CreditCard, Wallet, Landmark, Banknote, TrendingUp, MoreVertical, Pencil, Trash2 } from 'lucide-react'
import { useState } from 'react'

const accountIcons = {
  bank: Landmark,
  wallet: Wallet,
  credit_card: CreditCard,
  cash: Banknote,
  investment: TrendingUp,
}

export default function AccountCard({ account, onEdit, onDelete }) {
  const [menuOpen, setMenuOpen] = useState(false)
  const Icon = accountIcons[account.type] || Wallet
  const typeLabel = ACCOUNT_TYPES.find((t) => t.value === account.type)?.label || account.type

  return (
    <div className="group relative rounded-xl border border-gray-200 bg-white p-5 transition-shadow hover:shadow-md dark:border-gray-800 dark:bg-gray-950">
      <div className="flex items-start justify-between">
        <div className="flex items-center gap-3">
          <div
            className="flex h-10 w-10 items-center justify-center rounded-lg"
            style={{ backgroundColor: account.color + '20', color: account.color }}
          >
            <Icon size={20} />
          </div>
          <div>
            <h4 className="font-medium text-gray-900 dark:text-white">{account.name}</h4>
            <p className="text-xs text-gray-500 dark:text-gray-400">{typeLabel}</p>
          </div>
        </div>

        {/* Menu */}
        <div className="relative">
          <button
            onClick={() => setMenuOpen(!menuOpen)}
            className="rounded-lg p-1 text-gray-400 opacity-0 transition-opacity hover:bg-gray-100 group-hover:opacity-100 dark:hover:bg-gray-800"
          >
            <MoreVertical size={16} />
          </button>
          {menuOpen && (
            <>
              <div className="fixed inset-0 z-10" onClick={() => setMenuOpen(false)} />
              <div className="absolute right-0 z-20 mt-1 w-36 rounded-lg border border-gray-200 bg-white py-1 shadow-lg dark:border-gray-700 dark:bg-gray-900">
                <button
                  onClick={() => { setMenuOpen(false); onEdit(account) }}
                  className="flex w-full items-center gap-2 px-3 py-2 text-sm text-gray-700 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-800"
                >
                  <Pencil size={14} /> Edit
                </button>
                <button
                  onClick={() => { setMenuOpen(false); onDelete(account._id) }}
                  className="flex w-full items-center gap-2 px-3 py-2 text-sm text-red-600 hover:bg-red-50 dark:text-red-400 dark:hover:bg-red-950"
                >
                  <Trash2 size={14} /> Delete
                </button>
              </div>
            </>
          )}
        </div>
      </div>

      {/* Balance */}
      <div className="mt-4">
        <p className="text-xs text-gray-500 dark:text-gray-400">Balance</p>
        <p className={`text-xl font-bold ${account.balance >= 0 ? 'text-gray-900 dark:text-white' : 'text-red-600 dark:text-red-400'}`}>
          {formatCurrency(account.balance, account.currency)}
        </p>
      </div>

      {/* Status */}
      <div className="mt-3 flex items-center gap-1.5">
        <div className={`h-2 w-2 rounded-full ${account.isActive ? 'bg-green-500' : 'bg-gray-400'}`} />
        <span className="text-xs text-gray-500 dark:text-gray-400">
          {account.isActive ? 'Active' : 'Inactive'}
        </span>
      </div>
    </div>
  )
}
