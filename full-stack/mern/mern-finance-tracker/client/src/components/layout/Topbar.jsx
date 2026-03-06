import { Menu, Moon, Sun, Monitor, Bell } from 'lucide-react'
import { useAuth } from '../../context/AuthContext'
import { useTheme } from '../../context/ThemeContext'

const themeIcons = { light: Sun, dark: Moon, system: Monitor }

export default function Topbar({ onMenuClick }) {
  const { user } = useAuth()
  const { theme, setTheme } = useTheme()

  const cycleTheme = () => {
    const order = ['light', 'dark', 'system']
    const next = order[(order.indexOf(theme) + 1) % order.length]
    setTheme(next)
  }

  const ThemeIcon = themeIcons[theme]

  return (
    <header className="sticky top-0 z-30 flex h-16 items-center gap-4 border-b border-gray-200 bg-white/80 px-4 backdrop-blur-md sm:px-6 dark:border-gray-800 dark:bg-gray-950/80">
      <button
        onClick={onMenuClick}
        className="rounded-lg p-2 text-gray-500 hover:bg-gray-100 lg:hidden dark:hover:bg-gray-800"
      >
        <Menu size={20} />
      </button>

      <div className="flex-1" />

      <button
        onClick={cycleTheme}
        className="rounded-lg p-2 text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-800"
        title={`Theme: ${theme}`}
      >
        <ThemeIcon size={20} />
      </button>

      <button className="rounded-lg p-2 text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-800">
        <Bell size={20} />
      </button>

      <div className="flex items-center gap-3 border-l border-gray-200 pl-4 dark:border-gray-800">
        <div className="flex h-8 w-8 items-center justify-center rounded-full bg-indigo-100 text-sm font-semibold text-indigo-700 dark:bg-indigo-900 dark:text-indigo-300">
          {user?.name?.charAt(0)?.toUpperCase() || 'U'}
        </div>
        <span className="hidden text-sm font-medium text-gray-700 sm:block dark:text-gray-300">
          {user?.name || 'User'}
        </span>
      </div>
    </header>
  )
}
