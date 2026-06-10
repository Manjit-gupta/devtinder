import axios from 'axios'

export const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:3000',
  withCredentials: true,
})

// Attach JWT from localStorage on every request
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token')
  if (token) {
    config.headers['Authorization'] = `Bearer ${token}`
  }
  return config
})

// Normalize error shape
api.interceptors.response.use(
  (res) => res,
  (err) => {
    const msg =
      err.response?.data?.error ||
      err.response?.data?.message ||
      err.message ||
      'Something went wrong'
    err.displayMessage = msg
    return Promise.reject(err)
  }
)
