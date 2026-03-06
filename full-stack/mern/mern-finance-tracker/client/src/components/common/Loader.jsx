import { cn } from '../../lib/utils'

export default function Loader({ className, size = 'md' }) {
  const sizes = {
    sm: 'h-5 w-5 border-2',
    md: 'h-8 w-8 border-3',
    lg: 'h-12 w-12 border-4',
  }

  return (
    <div className={cn('flex items-center justify-center', className)}>
      <div
        className={cn(
          'animate-spin rounded-full border-indigo-600 border-t-transparent',
          sizes[size],
        )}
      />
    </div>
  )
}
