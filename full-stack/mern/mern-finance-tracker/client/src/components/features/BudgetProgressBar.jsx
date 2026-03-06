import { cn } from '../../lib/utils'
import { formatCurrency, CATEGORY_LABELS, CATEGORY_COLORS } from '../../lib/utils'
import { AlertTriangle, CheckCircle2, TrendingUp } from 'lucide-react'

export default function BudgetProgressBar({ budget }) {
  const { category, limit, spent, percentage, remaining, isOverBudget, isNearLimit, alertThreshold } = budget

  const barColor = isOverBudget
    ? 'bg-red-500'
    : isNearLimit
      ? 'bg-amber-500'
      : 'bg-green-500'

  const bgColor = isOverBudget
    ? 'bg-red-100 dark:bg-red-950'
    : isNearLimit
      ? 'bg-amber-100 dark:bg-amber-950'
      : 'bg-gray-100 dark:bg-gray-800'

  return (
    <div className="rounded-xl border border-gray-200 bg-white p-4 dark:border-gray-800 dark:bg-gray-950">
      <div className="mb-3 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div
            className="h-3 w-3 rounded-full"
            style={{ backgroundColor: CATEGORY_COLORS[category] || budget.color }}
          />
          <span className="text-sm font-medium text-gray-900 dark:text-white">
            {CATEGORY_LABELS[category] || category}
          </span>
        </div>
        <div className="flex items-center gap-1.5">
          {isOverBudget && (
            <AlertTriangle size={14} className="text-red-500" />
          )}
          {isNearLimit && (
            <TrendingUp size={14} className="text-amber-500" />
          )}
          {!isOverBudget && !isNearLimit && percentage > 0 && (
            <CheckCircle2 size={14} className="text-green-500" />
          )}
          <span className={cn(
            'text-xs font-medium',
            isOverBudget ? 'text-red-600' : isNearLimit ? 'text-amber-600' : 'text-gray-500',
          )}>
            {percentage}%
          </span>
        </div>
      </div>

      {/* Progress bar */}
      <div className={cn('h-2.5 w-full overflow-hidden rounded-full', bgColor)}>
        <div
          className={cn('h-full rounded-full transition-all duration-500', barColor)}
          style={{ width: `${Math.min(percentage, 100)}%` }}
        />
      </div>

      {/* Footer stats */}
      <div className="mt-2 flex items-center justify-between text-xs text-gray-500 dark:text-gray-400">
        <span>
          {formatCurrency(spent)} of {formatCurrency(limit)}
        </span>
        <span>
          {isOverBudget
            ? `${formatCurrency(spent - limit)} over`
            : `${formatCurrency(remaining)} left`}
        </span>
      </div>

      {/* Alert message */}
      {isOverBudget && (
        <div className="mt-2 rounded-lg bg-red-50 px-3 py-1.5 text-xs text-red-700 dark:bg-red-950 dark:text-red-400">
          You&apos;ve exceeded your budget for this category!
        </div>
      )}
      {isNearLimit && (
        <div className="mt-2 rounded-lg bg-amber-50 px-3 py-1.5 text-xs text-amber-700 dark:bg-amber-950 dark:text-amber-400">
          You&apos;re approaching your budget limit ({alertThreshold}% threshold)
        </div>
      )}
    </div>
  )
}
