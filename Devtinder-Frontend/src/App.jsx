import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { AuthProvider, useAuth } from './context/AuthContext'
import { ToastProvider } from './context/ToastContext'
import { ThemeProvider } from './context/ThemeContext'
import Auth from './pages/Auth'
import Feed from './pages/Feed'
import Requests from './pages/Requests'
import Connections from './pages/Connections'
import Profile from './pages/Profile'
import Onboarding from './pages/Onboarding'
import Chat from './pages/Chat'
import Activity from './pages/Activity'
import Navbar from './components/Navbar'

import { useLocation } from 'react-router-dom'

function ProtectedRoute({ children }) {
  const { user, loading } = useAuth()
  const location = useLocation()
  
  if (loading) return <div className="min-h-screen flex items-center justify-center text-secondary text-sm">Loading...</div>
  if (!user) return <Navigate to="/auth" replace />
  
  return children
}

function AppRoutes() {
  const { user } = useAuth()

  return (
    <>
      <Routes>
        <Route
          path="/auth"
          element={user ? <Navigate to="/feed" replace /> : <Auth />}
        />
        <Route
          path="/onboarding"
          element={<ProtectedRoute><Navbar /><Onboarding /></ProtectedRoute>}
        />
        <Route
          path="/feed"
          element={<ProtectedRoute><Navbar /><Feed /></ProtectedRoute>}
        />
        <Route
          path="/activity"
          element={<ProtectedRoute><Navbar /><Activity /></ProtectedRoute>}
        />
        <Route
          path="/requests"
          element={<ProtectedRoute><Navbar /><Requests /></ProtectedRoute>}
        />
        <Route
          path="/connections"
          element={<ProtectedRoute><Navbar /><Connections /></ProtectedRoute>}
        />
        <Route
          path="/chat/:targetUserId"
          element={<ProtectedRoute><Navbar /><Chat /></ProtectedRoute>}
        />
        <Route
          path="/profile"
          element={<ProtectedRoute><Navbar /><Profile /></ProtectedRoute>}
        />
        <Route path="*" element={<Navigate to="/feed" replace />} />
      </Routes>
    </>
  )
}

export default function App() {
  return (
    <BrowserRouter>
      <ThemeProvider>
        <ToastProvider>
          <AuthProvider>
            <AppRoutes />
          </AuthProvider>
        </ToastProvider>
      </ThemeProvider>
    </BrowserRouter>
  )
}
