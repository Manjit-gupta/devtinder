import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { api } from '../services/api'
import { useAuth } from '../context/AuthContext'
import { useToast } from '../context/ToastContext'
import Input from '../components/Input'
import Button from '../components/Button'

export default function Auth() {
  const [mode, setMode] = useState('login') // 'login' | 'signup'
  const [form, setForm] = useState({ firstName: '', lastName: '', email: '', password: '' })
  const [errors, setErrors] = useState({})
  const [loading, setLoading] = useState(false)

  const { login } = useAuth()
  const { addToast } = useToast()
  const navigate = useNavigate()

  const set = (field) => (e) => setForm((f) => ({ ...f, [field]: e.target.value }))

  const validate = () => {
    const e = {}
    if (mode === 'signup') {
      if (!form.firstName.trim()) e.firstName = 'Required'
      if (!form.lastName.trim()) e.lastName = 'Required'
    }
    if (!form.email.trim()) e.email = 'Required'
    if (!form.password) e.password = 'Required'
    setErrors(e)
    return Object.keys(e).length === 0
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!validate()) return
    setLoading(true)
    try {
      if (mode === 'login') {
        const res = await api.post('/login', {
          emailId: form.email,
          password: form.password,
        })
        login(res.data)
        addToast('Welcome back!', 'success')
      } else {
        await api.post('/signup', {
          firstName: form.firstName,
          lastName: form.lastName,
          emailId: form.email,
          password: form.password,
        })
        const res = await api.post('/login', {
          emailId: form.email,
          password: form.password,
        })
        login(res.data)
        addToast('Account created! You are now logged in.', 'success')
      }
      navigate('/feed')
    } catch (err) {
      addToast(err.displayMessage, 'error')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center px-4">
      <div className="card w-full max-w-sm space-y-6">
        {/* Logo */}
        <div className="text-center">
          <h1 className="text-2xl font-bold text-primary">DevTinder</h1>
          <p className="text-sm text-secondary mt-1">
            {mode === 'login' ? 'Sign in to your account' : 'Create your account'}
          </p>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          {mode === 'signup' && (
            <div className="grid grid-cols-2 gap-3">
              <Input
                label="First Name"
                value={form.firstName}
                onChange={set('firstName')}
                error={errors.firstName}
                placeholder="John"
                autoFocus
              />
              <Input
                label="Last Name"
                value={form.lastName}
                onChange={set('lastName')}
                error={errors.lastName}
                placeholder="Doe"
              />
            </div>
          )}
          <Input
            label="Email"
            type="email"
            value={form.email}
            onChange={set('email')}
            error={errors.email}
            placeholder="john@example.com"
            autoFocus={mode === 'login'}
          />
          <Input
            label="Password"
            type="password"
            value={form.password}
            onChange={set('password')}
            error={errors.password}
            placeholder="••••••••"
          />
          <Button type="submit" className="w-full justify-center" disabled={loading}>
            {loading ? 'Please wait...' : mode === 'login' ? 'Login' : 'Create Account'}
          </Button>
        </form>

        {/* Toggle */}
        <p className="text-center text-sm text-secondary">
          {mode === 'login' ? "Don't have an account? " : 'Already have an account? '}
          <button
            onClick={() => { setMode(mode === 'login' ? 'signup' : 'login'); setErrors({}) }}
            className="text-accent font-medium hover:underline"
          >
            {mode === 'login' ? 'Sign up' : 'Login'}
          </button>
        </p>
      </div>
    </div>
  )
}
