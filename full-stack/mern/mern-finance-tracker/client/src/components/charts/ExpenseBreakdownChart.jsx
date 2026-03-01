import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from 'recharts'
import { CATEGORY_COLORS, CATEGORY_LABELS } from '../../lib/utils'

const CustomTooltip = ({ active, payload }) => {
  if (!active || !payload?.length) return null
  const item = payload[0]
  return (
    <div className="rounded-lg border border-gray-200 bg-white px-4 py-3 shadow-lg dark:border-gray-700 dark:bg-gray-900">
      <p className="text-sm font-medium text-gray-900 dark:text-white">
        {CATEGORY_LABELS[item.name] || item.name}
      </p>
      <p className="text-sm text-gray-500">${item.value?.toLocaleString()}</p>
      <p className="text-xs text-gray-400">{item.payload.percentage}%</p>
    </div>
  )
}

const renderLabel = ({ name, percentage }) => (percentage > 5 ? `${percentage}%` : '')

export default function ExpenseBreakdownChart({ data }) {
  const chartData = data.map((item) => ({
    name: item._id || item.category,
    value: item.total,
    percentage: item.percentage,
  }))

  return (
    <div className="rounded-xl border border-gray-200 bg-white p-5 dark:border-gray-800 dark:bg-gray-950">
      <h3 className="mb-4 text-base font-semibold text-gray-900 dark:text-white">
        Expense Breakdown
      </h3>
      {chartData.length === 0 ? (
        <p className="py-12 text-center text-sm text-gray-400">No expenses this month</p>
      ) : (
        <ResponsiveContainer width="100%" height={300}>
          <PieChart>
            <Pie
              data={chartData}
              cx="50%"
              cy="50%"
              innerRadius={60}
              outerRadius={100}
              paddingAngle={2}
              dataKey="value"
              label={renderLabel}
              labelLine={false}
            >
              {chartData.map((entry, i) => (
                <Cell
                  key={entry.name}
                  fill={CATEGORY_COLORS[entry.name] || `hsl(${i * 30}, 60%, 50%)`}
                />
              ))}
            </Pie>
            <Tooltip content={<CustomTooltip />} />
            <Legend
              formatter={(value) => (
                <span className="text-sm text-gray-600 dark:text-gray-400">
                  {CATEGORY_LABELS[value] || value}
                </span>
              )}
            />
          </PieChart>
        </ResponsiveContainer>
      )}
    </div>
  )
}
