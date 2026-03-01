import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { DollarSign, TrendingUp, TrendingDown, Wallet, ArrowRight, Plus } from 'lucide-react'
import api from '../../lib/api'
import { formatCurrency, formatDate, CATEGORY_LABELS, CATEGORY_COLORS } from '../../lib/utils'
import StatCard from '../../components/common/StatCard'
import IncomeVsExpenseChart from '../../components/charts/IncomeVsExpenseChart'
import ExpenseBreakdownChart from '../../components/charts/ExpenseBreakdownChart'
import Loader from '../../components/common/Loader'
import toast from 'react-hot-toast'

export default function DashboardPage() {
  const [data, setData] = useState(null)
  const [trends, setTrends] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadDashboard()
  }, [])

  const loadDashboard = async () => {
    try {
      const [dashboardData, trendsData] = await Promise.all([
        api.getDashboard(),
        api.getMonthlyTrends({ year: new Date().getFullYear() }),
      ])
      setData(dashboardData)
      setTrends(trendsData.trends || [])
    } catch (err) {
      toast.error('Failed to load dashboard')
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return <Loader className="py-20" size="lg" />
  }

  if (!data) return null

  const { summary, categoryBreakdown, accounts, recentTransactions } = data

  // Only use past months for charts
  const currentMonth = new Date().getMonth()
  const chartTrends = trends.slice(0, currentMonth + 1)

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Dashboard</h1>
          <p className="text-sm text-gray-500 dark:text-gray-400">
            {new Date().toLocaleDateString('en-US', { month: 'long', year: 'numeric' })} overview
          </p>
        </div>
        <Link
          to="/transactions"
          className="flex items-center gap-2 rounded-lg bg-indigo-600 px-4 py-2 text-sm font-medium text-white hover:bg-indigo-700"
        >
          <Plus size={16} /> Add Transaction
        </Link>
      </div>

      {/* Stats Row */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard
          title="Total Balance"
          value={formatCurrency(summary.totalBalance)}
          subtitle={`${accounts.length} accounts`}
          icon={Wallet}
          color="indigo"
        />
        <StatCard
          title="Monthly Income"
          value={formatCurrency(summary.income)}
          icon={TrendingUp}
          color="green"
        />
        <StatCard
          title="Monthly Expenses"
          value={formatCurrency(summary.expenses)}
          icon={TrendingDown}
          color="red"
        />
        <StatCard
          title="Net Savings"
          value={formatCurrency(summary.netSavings)}
          subtitle={summary.transactionCount + ' transactions'}
          icon={DollarSign}
          color={summary.netSavings >= 0 ? 'green' : 'red'}
        />
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <IncomeVsExpenseChart data={chartTrends} />
        <ExpenseBreakdownChart data={categoryBreakdown} />
      </div>

      {/* Bottom Row: Accounts + Recent Transactions */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        {/* Account Summary */}
        <div className="rounded-xl border border-gray-200 bg-white p-5 dark:border-gray-800 dark:bg-gray-950">
          <div className="mb-4 flex items-center justify-between">
            <h3 className="text-base font-semibold text-gray-900 dark:text-white">Accounts</h3>
            <Link
              to="/accounts"
              className="flex items-center gap-1 text-sm text-indigo-600 hover:text-indigo-500"
            >
              View all <ArrowRight size={14} />
            </Link>
          </div>
          <div className="space-y-3">
            {accounts.length === 0 ? (
              <p className="py-4 text-center text-sm text-gray-400">No accounts yet</p>
            ) : (
              accounts.slice(0, 4).map((acc) => (
                <div
                  key={acc._id}
                  className="flex items-center justify-between rounded-lg border border-gray-100 p-3 dark:border-gray-800"
                >
                  <div className="flex items-center gap-3">
                    <div
                      className="flex h-9 w-9 items-center justify-center rounded-lg"
                      style={{ backgroundColor: acc.color + '20', color: acc.color }}
                    >
                      <Wallet size={18} />
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-900 dark:text-white">
                        {acc.name}
                      </p>
                      <p className="text-xs capitalize text-gray-500 dark:text-gray-400">
                        {acc.type.replace('_', ' ')}
                      </p>
                    </div>
                  </div>
                  <span
                    className={`text-sm font-semibold ${
                      acc.balance >= 0
                        ? 'text-gray-900 dark:text-white'
                        : 'text-red-600 dark:text-red-400'
                    }`}
                  >
                    {formatCurrency(acc.balance)}
                  </span>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Recent Transactions */}
        <div className="rounded-xl border border-gray-200 bg-white p-5 dark:border-gray-800 dark:bg-gray-950">
          <div className="mb-4 flex items-center justify-between">
            <h3 className="text-base font-semibold text-gray-900 dark:text-white">
              Recent Transactions
            </h3>
            <Link
              to="/transactions"
              className="flex items-center gap-1 text-sm text-indigo-600 hover:text-indigo-500"
            >
              View all <ArrowRight size={14} />
            </Link>
          </div>
          <div className="space-y-3">
            {recentTransactions.length === 0 ? (
              <p className="py-4 text-center text-sm text-gray-400">No transactions yet</p>
            ) : (
              recentTransactions.map((tx) => (
                <div
                  key={tx._id}
                  className="flex items-center justify-between rounded-lg border border-gray-100 p-3 dark:border-gray-800"
                >
                  <div className="flex items-center gap-3">
                    <div
                      className="h-3 w-3 rounded-full"
                      style={{
                        backgroundColor: CATEGORY_COLORS[tx.category] || '#64748b',
                      }}
                    />
                    <div>
                      <p className="text-sm font-medium text-gray-900 dark:text-white">
                        {tx.description || CATEGORY_LABELS[tx.category] || tx.category}
                      </p>
                      <p className="text-xs text-gray-500 dark:text-gray-400">
                        {formatDate(tx.date)}
                      </p>
                    </div>
                  </div>
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
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
