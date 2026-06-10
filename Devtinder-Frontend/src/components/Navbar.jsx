import { NavLink, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { useToast } from '../context/ToastContext'
import { useTheme } from '../context/ThemeContext'
import { Sun, Moon } from 'lucide-react'

const links = [
  { to: '/feed', label: 'Feed' },
  { to: '/activity', label: 'Activity' },
  { to: '/requests', label: 'Requests' },
  { to: '/connections', label: 'Connections' },
  { to: '/profile', label: 'Profile' },
]

export default function Navbar() {
  const { logout } = useAuth()
  const { addToast } = useToast()
  const { theme, toggleTheme } = useTheme()
  const navigate = useNavigate()

  const handleLogout = async () => {
    await logout()
    addToast('Logged out', 'info')
    navigate('/auth')
  }

  return (
    <header className="border-b border-border bg-white dark:bg-[#1a1a1a] dark:border-gray-800 sticky top-0 z-40 transition-colors">
      <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
        <span className="text-4xl font-black text-primary dark:text-white tracking-tighter">DevTinder</span>
        <nav className="flex items-center gap-1">
          {links.map(({ to, label }) => (
            <NavLink
              key={to}
              to={to}
              className={({ isActive }) =>
                `px-5 py-2.5 rounded-xl text-lg font-bold transition-all ${
                  isActive
                    ? 'bg-accent text-white shadow-md scale-105'
                    : 'text-secondary dark:text-gray-300 hover:text-primary dark:hover:text-white hover:bg-gray-50 dark:hover:bg-gray-800 hover:scale-105'
                }`
              }
            >
              {label}
            </NavLink>
          ))}
          <button
            onClick={toggleTheme}
            className="ml-6 p-3 text-secondary dark:text-gray-400 hover:text-primary dark:hover:text-white hover:bg-gray-50 dark:hover:bg-gray-800 rounded-xl transition-all hover:scale-110"
            aria-label="Toggle theme"
          >
            {theme === 'light' ? <Moon size={26} /> : <Sun size={26} />}
          </button>
          <button
            onClick={handleLogout}
            className="ml-4 px-6 py-2.5 text-lg text-danger font-bold hover:bg-red-50 dark:hover:bg-red-950/30 rounded-xl transition-all hover:scale-105"
          >
            Logout
          </button>
        </nav>
      </div>
    </header>
  )
}
