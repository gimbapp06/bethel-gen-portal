import axios from 'axios'

const api = axios.create({
  baseURL: '/api',
  withCredentials: true,
  headers: { 'Accept': 'application/json', 'Content-Type': 'application/json' },
})

// Attach token from localStorage on every request
api.interceptors.request.use(config => {
  const token = localStorage.getItem('bethel_token')
  if (token) config.headers['Authorization'] = `Bearer ${token}`
  return config
})

// On 401 → only redirect if user was already logged in (had a token)
api.interceptors.response.use(
  res => res,
  err => {
    if (err.response?.status === 401) {
      const hadToken = localStorage.getItem('bethel_token')
      localStorage.removeItem('bethel_token')
      localStorage.removeItem('bethel_user')
      // Only redirect if session expired, not on login attempt
      if (hadToken && !err.config.url.includes('/auth/login')) {
        window.location.href = '/login'
      }
    }
    return Promise.reject(err)
  }
)

export default api
