import { cn } from '../../lib/utils'

const COLORS = [
  'bg-indigo-500', 'bg-rose-500', 'bg-emerald-500', 'bg-amber-500',
  'bg-cyan-500', 'bg-violet-500', 'bg-pink-500', 'bg-teal-500',
]

function getColorFromName(name = '') {
  let hash = 0
  for (let i = 0; i < name.length; i++) hash = name.charCodeAt(i) + ((hash << 5) - hash)
  return COLORS[Math.abs(hash) % COLORS.length]
}

export default function Avatar({ name, color, size = 'md', className }) {
  const sizes = { sm: 'w-7 h-7 text-xs', md: 'w-9 h-9 text-sm', lg: 'w-12 h-12 text-base' }
  const initials = (name || '?').split(' ').map((w) => w[0]).join('').toUpperCase().slice(0, 2)

  return (
    <div
      className={cn(
        'rounded-full flex items-center justify-center font-semibold text-white shrink-0',
        sizes[size],
        color ? '' : getColorFromName(name),
        className,
      )}
      style={color ? { backgroundColor: color } : undefined}
      title={name}
    >
      {initials}
    </div>
  )
}
