import { BrowserRouter, Routes, Route } from 'react-router-dom'
import { Toaster } from 'react-hot-toast'
import { AuthProvider } from './context/AuthContext'
import { ThemeProvider } from './context/ThemeContext'
import { SocketProvider } from './context/SocketContext'
import ProtectedRoute from './components/common/ProtectedRoute'
import AppLayout from './components/layout/AppLayout'
import LoginPage from './pages/LoginPage'
import RegisterPage from './pages/RegisterPage'
import HomePage from './pages/HomePage'
import BoardPage from './pages/BoardPage'
import TemplatesPage from './pages/TemplatesPage'
import JoinPage from './pages/JoinPage'
import SettingsPage from './pages/SettingsPage'

export default function App() {
  return (
    <BrowserRouter>
      <ThemeProvider>
        <AuthProvider>
          <SocketProvider>
            <Routes>
              {/* Public */}
              <Route path="/login" element={<LoginPage />} />
              <Route path="/register" element={<RegisterPage />} />

              {/* Protected */}
              <Route
                path="/"
                element={
                  <ProtectedRoute>
                    <AppLayout />
                  </ProtectedRoute>
                }
              >
                <Route index element={<HomePage />} />
                <Route path="templates" element={<TemplatesPage />} />
                <Route path="settings" element={<SettingsPage />} />
              </Route>

              {/* Board - full screen (no sidebar) */}
              <Route
                path="/board/:id"
                element={
                  <ProtectedRoute>
                    <BoardPage />
                  </ProtectedRoute>
                }
              />

              {/* Join via share code */}
              <Route
                path="/join/:code"
                element={
                  <ProtectedRoute>
                    <JoinPage />
                  </ProtectedRoute>
                }
              />
            </Routes>

            <Toaster
              position="bottom-right"
              toastOptions={{
                className: '!bg-white dark:!bg-gray-800 !text-gray-900 dark:!text-white !shadow-lg !border !border-gray-200 dark:!border-gray-700',
                duration: 3000,
              }}
            />
          </SocketProvider>
        </AuthProvider>
      </ThemeProvider>
    </BrowserRouter>
  )
}
