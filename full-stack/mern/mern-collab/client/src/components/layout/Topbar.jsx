import { Menu, Moon, Sun, Monitor } from 'lucide-react'
import { useTheme } from '../../context/ThemeContext'
import { useSocket } from '../../context/SocketContext'

export default function Topbar({ onMenuClick }) {
  const { theme, setTheme } = useTheme()
  const { connected } = useSocket()

  const cycleTheme = () => {
    const order = ['light', 'dark', 'system']
    const next = order[(order.indexOf(theme) + 1) % order.length]
    setTheme(next)
  }

  const ThemeIcon = theme === 'dark' ? Moon : theme === 'light' ? Sun : Monitor

  return (
    <header className="flex h-14 items-center justify-between border-b border-gray-200 bg-white px-4 dark:border-gray-800 dark:bg-gray-950">
      <button
        onClick={onMenuClick}
        className="rounded-lg p-2 text-gray-500 hover:bg-gray-100 lg:hidden dark:hover:bg-gray-800"
      >
        <Menu size={20} />
      </button>

      <div className="flex-1" />

      <div className="flex items-center gap-3">
        {/* Connection status */}
        <div className="flex items-center gap-1.5">
          <div
            className={`h-2 w-2 rounded-full ${connected ? 'bg-green-500' : 'bg-gray-400'}`}
          />
          <span className="text-xs text-gray-500 dark:text-gray-400">
            {connected ? 'Connected' : 'Offline'}
          </span>
        </div>

        {/* Theme toggle */}
        <button
          onClick={cycleTheme}
          className="rounded-lg p-2 text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-800"
          title={`Theme: ${theme}`}
        >
          <ThemeIcon size={18} />
        </button>
      </div>
    </header>
  )
}
