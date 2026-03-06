import { useState } from 'react'
import { useAuth } from '../../context/AuthContext'
import { useTheme } from '../../context/ThemeContext'
import { User, Lock, Palette, Bell, Save, Check } from 'lucide-react'
import api from '../../lib/api'
import toast from 'react-hot-toast'

const TABS = [
  { key: 'profile', label: 'Profile', icon: User },
  { key: 'password', label: 'Password', icon: Lock },
  { key: 'appearance', label: 'Appearance', icon: Palette },
  { key: 'notifications', label: 'Notifications', icon: Bell },
]

export default function SettingsPage() {
  const { user, updateUser } = useAuth()
  const { theme, setTheme } = useTheme()
  const [activeTab, setActiveTab] = useState('profile')
  const [loading, setLoading] = useState(false)

  // -- Profile state --
  const [name, setName] = useState(user?.name || '')
  const [email, setEmail] = useState(user?.email || '')
  const [currency, setCurrency] = useState(user?.currency || 'USD')

  // -- Password state --
  const [currentPassword, setCurrentPassword] = useState('')
  const [newPassword, setNewPassword] = useState('')
  const [confirmNewPassword, setConfirmNewPassword] = useState('')

  // -- Notification prefs --
  const [notifications, setNotifications] = useState({
    budgetAlerts: true,
    weeklyReport: false,
    recurringReminders: true,
  })

  const handleProfileSave = async (e) => {
    e.preventDefault()
    setLoading(true)
    try {
      const data = await api.updateProfile({ name, email, currency })
      updateUser(data.user)
      toast.success('Profile updated')
    } catch (err) {
      toast.error(err.message)
    } finally {
      setLoading(false)
    }
  }

  const handlePasswordChange = async (e) => {
    e.preventDefault()
    if (newPassword !== confirmNewPassword) {
      toast.error('Passwords do not match')
      return
    }
    if (newPassword.length < 6) {
      toast.error('Password must be at least 6 characters')
      return
    }
    setLoading(true)
    try {
      await api.changePassword({ currentPassword, newPassword })
      toast.success('Password updated')
      setCurrentPassword('')
      setNewPassword('')
      setConfirmNewPassword('')
    } catch (err) {
      toast.error(err.message)
    } finally {
      setLoading(false)
    }
  }

  const inputClass =
    'w-full rounded-lg border border-gray-300 bg-white px-3 py-2.5 text-sm text-gray-900 placeholder-gray-400 focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500 dark:border-gray-700 dark:bg-gray-900 dark:text-white dark:placeholder-gray-500'

  const labelClass = 'mb-1.5 block text-sm font-medium text-gray-700 dark:text-gray-300'

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Settings</h1>
        <p className="text-sm text-gray-500 dark:text-gray-400">
          Manage your account preferences
        </p>
      </div>

      <div className="flex flex-col gap-6 lg:flex-row">
        {/* Sidebar tabs */}
        <nav className="flex gap-1 lg:w-56 lg:flex-col">
          {TABS.map(({ key, label, icon: Icon }) => (
            <button
              key={key}
              onClick={() => setActiveTab(key)}
              className={`flex items-center gap-2.5 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors ${
                activeTab === key
                  ? 'bg-indigo-50 text-indigo-700 dark:bg-indigo-950 dark:text-indigo-300'
                  : 'text-gray-600 hover:bg-gray-100 dark:text-gray-400 dark:hover:bg-gray-800'
              }`}
            >
              <Icon size={18} />
              {label}
            </button>
          ))}
        </nav>

        {/* Content */}
        <div className="flex-1 rounded-xl border border-gray-200 bg-white p-6 dark:border-gray-800 dark:bg-gray-950">
          {/* Profile */}
          {activeTab === 'profile' && (
            <form onSubmit={handleProfileSave} className="space-y-5">
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Profile</h2>
              <div>
                <label className={labelClass}>Full Name</label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required
                  className={inputClass}
                />
              </div>
              <div>
                <label className={labelClass}>Email</label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  className={inputClass}
                />
              </div>
              <div>
                <label className={labelClass}>Default Currency</label>
                <select
                  value={currency}
                  onChange={(e) => setCurrency(e.target.value)}
                  className={inputClass}
                >
                  <option value="USD">USD - US Dollar</option>
                  <option value="EUR">EUR - Euro</option>
                  <option value="GBP">GBP - British Pound</option>
                  <option value="INR">INR - Indian Rupee</option>
                  <option value="JPY">JPY - Japanese Yen</option>
                  <option value="CAD">CAD - Canadian Dollar</option>
                  <option value="AUD">AUD - Australian Dollar</option>
                </select>
              </div>
              <button
                type="submit"
                disabled={loading}
                className="flex items-center gap-2 rounded-lg bg-indigo-600 px-4 py-2 text-sm font-medium text-white hover:bg-indigo-700 disabled:opacity-50"
              >
                <Save size={16} /> {loading ? 'Saving...' : 'Save Changes'}
              </button>
            </form>
          )}

          {/* Password */}
          {activeTab === 'password' && (
            <form onSubmit={handlePasswordChange} className="space-y-5">
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
                Change Password
              </h2>
              <div>
                <label className={labelClass}>Current Password</label>
                <input
                  type="password"
                  value={currentPassword}
                  onChange={(e) => setCurrentPassword(e.target.value)}
                  required
                  className={inputClass}
                />
              </div>
              <div>
                <label className={labelClass}>New Password</label>
                <input
                  type="password"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  required
                  minLength={6}
                  className={inputClass}
                />
              </div>
              <div>
                <label className={labelClass}>Confirm New Password</label>
                <input
                  type="password"
                  value={confirmNewPassword}
                  onChange={(e) => setConfirmNewPassword(e.target.value)}
                  required
                  className={inputClass}
                />
              </div>
              <button
                type="submit"
                disabled={loading}
                className="flex items-center gap-2 rounded-lg bg-indigo-600 px-4 py-2 text-sm font-medium text-white hover:bg-indigo-700 disabled:opacity-50"
              >
                <Lock size={16} /> {loading ? 'Updating...' : 'Update Password'}
              </button>
            </form>
          )}

          {/* Appearance */}
          {activeTab === 'appearance' && (
            <div className="space-y-5">
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Appearance</h2>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                Choose your preferred theme
              </p>
              <div className="grid grid-cols-3 gap-3">
                {[
                  { value: 'light', label: 'Light', emoji: '☀️' },
                  { value: 'dark', label: 'Dark', emoji: '🌙' },
                  { value: 'system', label: 'System', emoji: '💻' },
                ].map((opt) => (
                  <button
                    key={opt.value}
                    onClick={() => setTheme(opt.value)}
                    className={`flex flex-col items-center gap-2 rounded-xl border-2 p-4 transition-colors ${
                      theme === opt.value
                        ? 'border-indigo-600 bg-indigo-50 dark:border-indigo-400 dark:bg-indigo-950'
                        : 'border-gray-200 hover:border-gray-300 dark:border-gray-700 dark:hover:border-gray-600'
                    }`}
                  >
                    <span className="text-2xl">{opt.emoji}</span>
                    <span className="text-sm font-medium text-gray-900 dark:text-white">
                      {opt.label}
                    </span>
                    {theme === opt.value && (
                      <Check size={16} className="text-indigo-600 dark:text-indigo-400" />
                    )}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Notifications */}
          {activeTab === 'notifications' && (
            <div className="space-y-5">
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
                Notification Preferences
              </h2>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                Configure when you want to be notified
              </p>
              <div className="space-y-4">
                {[
                  {
                    key: 'budgetAlerts',
                    title: 'Budget Alerts',
                    desc: 'Get notified when spending nears budget limits',
                  },
                  {
                    key: 'weeklyReport',
                    title: 'Weekly Summary',
                    desc: 'Receive a weekly financial summary report',
                  },
                  {
                    key: 'recurringReminders',
                    title: 'Recurring Reminders',
                    desc: 'Reminders for upcoming recurring transactions',
                  },
                ].map(({ key, title, desc }) => (
                  <div
                    key={key}
                    className="flex items-center justify-between rounded-lg border border-gray-200 p-4 dark:border-gray-800"
                  >
                    <div>
                      <p className="text-sm font-medium text-gray-900 dark:text-white">{title}</p>
                      <p className="text-xs text-gray-500 dark:text-gray-400">{desc}</p>
                    </div>
                    <button
                      type="button"
                      onClick={() =>
                        setNotifications((prev) => ({
                          ...prev,
                          [key]: !prev[key],
                        }))
                      }
                      className={`relative h-6 w-11 rounded-full transition-colors ${
                        notifications[key]
                          ? 'bg-indigo-600'
                          : 'bg-gray-300 dark:bg-gray-600'
                      }`}
                    >
                      <span
                        className={`absolute top-0.5 left-0.5 h-5 w-5 rounded-full bg-white transition-transform shadow-sm ${
                          notifications[key] ? 'translate-x-5' : 'translate-x-0'
                        }`}
                      />
                    </button>
                  </div>
                ))}
              </div>
              <button
                onClick={() => toast.success('Preferences saved')}
                className="flex items-center gap-2 rounded-lg bg-indigo-600 px-4 py-2 text-sm font-medium text-white hover:bg-indigo-700"
              >
                <Save size={16} /> Save Preferences
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
