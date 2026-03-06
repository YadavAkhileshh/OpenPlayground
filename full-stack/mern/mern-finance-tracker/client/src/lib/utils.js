import { twMerge } from 'tailwind-merge'
import { clsx } from 'clsx'

export function cn(...inputs) {
  return twMerge(clsx(inputs))
}

export function formatCurrency(amount, currency = 'USD') {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency,
    minimumFractionDigits: 2,
  }).format(amount)
}

export function formatDate(date) {
  return new Date(date).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  })
}

export function formatDateShort(date) {
  return new Date(date).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
  })
}

export const CATEGORY_COLORS = {
  food: '#f97316',
  transport: '#3b82f6',
  housing: '#8b5cf6',
  utilities: '#06b6d4',
  entertainment: '#ec4899',
  shopping: '#f59e0b',
  healthcare: '#10b981',
  education: '#6366f1',
  savings: '#22c55e',
  salary: '#14b8a6',
  freelance: '#a855f7',
  investment: '#0ea5e9',
  gift: '#e11d48',
  other: '#64748b',
}

export const CATEGORY_LABELS = {
  food: 'Food & Dining',
  transport: 'Transport',
  housing: 'Housing',
  utilities: 'Utilities',
  entertainment: 'Entertainment',
  shopping: 'Shopping',
  healthcare: 'Healthcare',
  education: 'Education',
  savings: 'Savings',
  salary: 'Salary',
  freelance: 'Freelance',
  investment: 'Investment',
  gift: 'Gift',
  other: 'Other',
}

export const ACCOUNT_TYPES = [
  { value: 'bank', label: 'Bank Account' },
  { value: 'wallet', label: 'Digital Wallet' },
  { value: 'credit_card', label: 'Credit Card' },
  { value: 'cash', label: 'Cash' },
  { value: 'investment', label: 'Investment' },
]
