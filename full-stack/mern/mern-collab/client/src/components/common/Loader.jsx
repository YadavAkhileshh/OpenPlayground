import { Loader2 } from 'lucide-react'
import { cn } from '../../lib/utils'

export default function Loader({ className, size = 32, text }) {
  return (
    <div className={cn('flex flex-col items-center justify-center gap-3', className)}>
      <Loader2 size={size} className="animate-spin text-indigo-500" />
      {text && <p className="text-sm text-gray-500 dark:text-gray-400">{text}</p>}
    </div>
  )
}
