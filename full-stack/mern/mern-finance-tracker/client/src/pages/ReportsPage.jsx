import { useState, useEffect, useCallback } from 'react'
import { BarChart3, Download, Calendar } from 'lucide-react'
import api from '../../lib/api'
import { formatCurrency, CATEGORY_LABELS, CATEGORY_COLORS } from '../../lib/utils'
import TrendLineChart from '../../components/charts/TrendLineChart'
import ExpenseBreakdownChart from '../../components/charts/ExpenseBreakdownChart'
import IncomeVsExpenseChart from '../../components/charts/IncomeVsExpenseChart'
import Loader from '../../components/common/Loader'
import EmptyState from '../../components/common/EmptyState'
import toast from 'react-hot-toast'

export default function ReportsPage() {
  const [year, setYear] = useState(new Date().getFullYear())
  const [trends, setTrends] = useState([])
  const [categoryReport, setCategoryReport] = useState([])
  const [grandTotal, setGrandTotal] = useState(0)
  const [loading, setLoading] = useState(true)
  const [exporting, setExporting] = useState(false)

  const loadReports = useCallback(async () => {
    setLoading(true)
    try {
      const [trendsData, catData] = await Promise.all([
        api.getMonthlyTrends({ year }),
        api.getCategoryReport({
          startDate: `${year}-01-01`,
          endDate: `${year}-12-31`,
        }),
      ])
      setTrends(trendsData.trends || [])
      setCategoryReport(catData.report || [])
      setGrandTotal(catData.grandTotal || 0)
    } catch (err) {
      toast.error('Failed to load reports')
    } finally {
      setLoading(false)
    }
  }, [year])

  useEffect(() => {
    loadReports()
  }, [loadReports])

  const handleExport = async (format) => {
    setExporting(true)
    try {
      const res = await api.exportTransactions({
        startDate: `${year}-01-01`,
        endDate: `${year}-12-31`,
        format,
      })

      if (format === 'csv') {
        const text = await res.text()
        const blob = new Blob([text], { type: 'text/csv' })
        const url = URL.createObjectURL(blob)
        const a = document.createElement('a')
        a.href = url
        a.download = `transactions-${year}.csv`
        a.click()
        URL.revokeObjectURL(url)
        toast.success('CSV exported successfully')
      } else {
        const data = await res.json()
        const blob = new Blob([JSON.stringify(data.transactions, null, 2)], {
          type: 'application/json',
        })
        const url = URL.createObjectURL(blob)
        const a = document.createElement('a')
        a.href = url
        a.download = `transactions-${year}.json`
        a.click()
        URL.revokeObjectURL(url)
        toast.success('JSON exported successfully')
      }
    } catch (err) {
      toast.error('Export failed')
    } finally {
      setExporting(false)
    }
  }

  // Calculate annual summary
  const annualIncome = trends.reduce((sum, m) => sum + m.income, 0)
  const annualExpenses = trends.reduce((sum, m) => sum + m.expenses, 0)
  const annualNet = annualIncome - annualExpenses
  const avgMonthlyIncome = annualIncome / 12
  const avgMonthlyExpenses = annualExpenses / 12

  // Available years (current year and 5 years back)
  const currentYear = new Date().getFullYear()
  const years = Array.from({ length: 6 }, (_, i) => currentYear - i)

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Reports</h1>
          <p className="text-sm text-gray-500 dark:text-gray-400">
            Yearly financial trends and insights
          </p>
        </div>
        <div className="flex items-center gap-3">
          {/* Year selector */}
          <div className="flex items-center gap-2 rounded-lg border border-gray-300 bg-white px-3 py-2 dark:border-gray-700 dark:bg-gray-900">
            <Calendar size={16} className="text-gray-400" />
            <select
              value={year}
              onChange={(e) => setYear(Number(e.target.value))}
              className="bg-transparent text-sm font-medium text-gray-900 focus:outline-none dark:text-white"
            >
              {years.map((y) => (
                <option key={y} value={y}>{y}</option>
              ))}
            </select>
          </div>

          {/* Export buttons */}
          <div className="flex gap-2">
            <button
              onClick={() => handleExport('csv')}
              disabled={exporting}
              className="flex items-center gap-1.5 rounded-lg border border-gray-300 px-3 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50 dark:border-gray-700 dark:text-gray-300 dark:hover:bg-gray-800"
            >
              <Download size={14} /> CSV
            </button>
            <button
              onClick={() => handleExport('json')}
              disabled={exporting}
              className="flex items-center gap-1.5 rounded-lg border border-gray-300 px-3 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50 dark:border-gray-700 dark:text-gray-300 dark:hover:bg-gray-800"
            >
              <Download size={14} /> JSON
            </button>
          </div>
        </div>
      </div>

      {loading ? (
        <Loader className="py-12" />
      ) : trends.every((m) => m.income === 0 && m.expenses === 0) ? (
        <EmptyState
          icon={BarChart3}
          title="No data for this year"
          description="Add transactions to see reports and trends"
        />
      ) : (
        <>
          {/* Annual Summary */}
          <div className="grid grid-cols-2 gap-4 lg:grid-cols-5">
            <div className="rounded-xl border border-gray-200 bg-white p-4 dark:border-gray-800 dark:bg-gray-950">
              <p className="text-xs text-gray-500 dark:text-gray-400">Annual Income</p>
              <p className="mt-1 text-xl font-bold text-green-600">{formatCurrency(annualIncome)}</p>
            </div>
            <div className="rounded-xl border border-gray-200 bg-white p-4 dark:border-gray-800 dark:bg-gray-950">
              <p className="text-xs text-gray-500 dark:text-gray-400">Annual Expenses</p>
              <p className="mt-1 text-xl font-bold text-red-600">{formatCurrency(annualExpenses)}</p>
            </div>
            <div className="rounded-xl border border-gray-200 bg-white p-4 dark:border-gray-800 dark:bg-gray-950">
              <p className="text-xs text-gray-500 dark:text-gray-400">Net Savings</p>
              <p className={`mt-1 text-xl font-bold ${annualNet >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                {formatCurrency(annualNet)}
              </p>
            </div>
            <div className="rounded-xl border border-gray-200 bg-white p-4 dark:border-gray-800 dark:bg-gray-950">
              <p className="text-xs text-gray-500 dark:text-gray-400">Avg Monthly Income</p>
              <p className="mt-1 text-xl font-bold text-gray-900 dark:text-white">
                {formatCurrency(avgMonthlyIncome)}
              </p>
            </div>
            <div className="rounded-xl border border-gray-200 bg-white p-4 dark:border-gray-800 dark:bg-gray-950">
              <p className="text-xs text-gray-500 dark:text-gray-400">Avg Monthly Expenses</p>
              <p className="mt-1 text-xl font-bold text-gray-900 dark:text-white">
                {formatCurrency(avgMonthlyExpenses)}
              </p>
            </div>
          </div>

          {/* Charts */}
          <TrendLineChart data={trends} title={`${year} Income, Expenses & Savings Trend`} />

          <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
            <IncomeVsExpenseChart data={trends} />
            <ExpenseBreakdownChart data={categoryReport} />
          </div>

          {/* Category Table */}
          <div className="rounded-xl border border-gray-200 bg-white dark:border-gray-800 dark:bg-gray-950">
            <div className="border-b border-gray-200 px-5 py-4 dark:border-gray-800">
              <h3 className="text-base font-semibold text-gray-900 dark:text-white">
                Expense by Category
              </h3>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-gray-200 text-left text-xs font-medium uppercase text-gray-500 dark:border-gray-800 dark:text-gray-400">
                    <th className="px-5 py-3">Category</th>
                    <th className="px-5 py-3 text-right">Amount</th>
                    <th className="px-5 py-3 text-right">Transactions</th>
                    <th className="px-5 py-3 text-right">Average</th>
                    <th className="px-5 py-3 text-right">% of Total</th>
                  </tr>
                </thead>
                <tbody>
                  {categoryReport.map((cat) => (
                    <tr
                      key={cat._id}
                      className="border-b border-gray-100 last:border-0 dark:border-gray-800/50"
                    >
                      <td className="px-5 py-3">
                        <div className="flex items-center gap-2">
                          <div
                            className="h-3 w-3 rounded-full"
                            style={{ backgroundColor: CATEGORY_COLORS[cat._id] || '#64748b' }}
                          />
                          <span className="font-medium text-gray-900 dark:text-white">
                            {CATEGORY_LABELS[cat._id] || cat._id}
                          </span>
                        </div>
                      </td>
                      <td className="px-5 py-3 text-right font-medium text-gray-900 dark:text-white">
                        {formatCurrency(cat.total)}
                      </td>
                      <td className="px-5 py-3 text-right text-gray-500 dark:text-gray-400">
                        {cat.count}
                      </td>
                      <td className="px-5 py-3 text-right text-gray-500 dark:text-gray-400">
                        {formatCurrency(cat.avgAmount)}
                      </td>
                      <td className="px-5 py-3 text-right">
                        <div className="flex items-center justify-end gap-2">
                          <div className="h-1.5 w-16 overflow-hidden rounded-full bg-gray-100 dark:bg-gray-800">
                            <div
                              className="h-full rounded-full bg-indigo-600"
                              style={{ width: `${cat.percentage}%` }}
                            />
                          </div>
                          <span className="text-gray-500 dark:text-gray-400">{cat.percentage}%</span>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
                <tfoot>
                  <tr className="border-t border-gray-200 dark:border-gray-800">
                    <td className="px-5 py-3 font-semibold text-gray-900 dark:text-white">Total</td>
                    <td className="px-5 py-3 text-right font-semibold text-gray-900 dark:text-white">
                      {formatCurrency(grandTotal)}
                    </td>
                    <td className="px-5 py-3 text-right text-gray-500 dark:text-gray-400">
                      {categoryReport.reduce((sum, c) => sum + c.count, 0)}
                    </td>
                    <td />
                    <td className="px-5 py-3 text-right text-gray-500 dark:text-gray-400">100%</td>
                  </tr>
                </tfoot>
              </table>
            </div>
          </div>
        </>
      )}
    </div>
  )
}
