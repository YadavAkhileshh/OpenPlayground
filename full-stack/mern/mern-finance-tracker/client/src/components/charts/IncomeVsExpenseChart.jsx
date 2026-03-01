import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts'

const CustomTooltip = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null
  return (
    <div className="rounded-lg border border-gray-200 bg-white px-4 py-3 shadow-lg dark:border-gray-700 dark:bg-gray-900">
      <p className="mb-1 text-sm font-medium text-gray-900 dark:text-white">{label}</p>
      {payload.map((entry, i) => (
        <p key={i} className="text-sm" style={{ color: entry.color }}>
          {entry.name}: ${entry.value?.toLocaleString()}
        </p>
      ))}
    </div>
  )
}

export default function IncomeVsExpenseChart({ data }) {
  return (
    <div className="rounded-xl border border-gray-200 bg-white p-5 dark:border-gray-800 dark:bg-gray-950">
      <h3 className="mb-4 text-base font-semibold text-gray-900 dark:text-white">
        Income vs Expenses
      </h3>
      <ResponsiveContainer width="100%" height={300}>
        <BarChart data={data} margin={{ top: 5, right: 20, left: 0, bottom: 5 }}>
          <CartesianGrid strokeDasharray="3 3" className="stroke-gray-200 dark:stroke-gray-800" />
          <XAxis
            dataKey="monthName"
            tick={{ fontSize: 12 }}
            className="fill-gray-500 dark:fill-gray-400"
          />
          <YAxis
            tick={{ fontSize: 12 }}
            className="fill-gray-500 dark:fill-gray-400"
            tickFormatter={(v) => `$${v >= 1000 ? `${(v / 1000).toFixed(0)}k` : v}`}
          />
          <Tooltip content={<CustomTooltip />} />
          <Legend />
          <Bar dataKey="income" fill="#22c55e" radius={[4, 4, 0, 0]} name="Income" />
          <Bar dataKey="expenses" fill="#ef4444" radius={[4, 4, 0, 0]} name="Expenses" />
        </BarChart>
      </ResponsiveContainer>
    </div>
  )
}
