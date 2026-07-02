import React, { createContext, useContext, useState, useEffect } from 'react'
import api from '../utils/api'

const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  const [user, setUser]       = useState(() => {
    try { return JSON.parse(localStorage.getItem('bethel_user')) } catch { return null }
  })
  const [loading, setLoading] = useState(false)

  const login = async (email, password, role) => {
    const res = await api.post('/auth/login', { email, password, role })
    const { token, user: u } = res.data
    localStorage.setItem('bethel_token', token)
    localStorage.setItem('bethel_user', JSON.stringify(u))
    setUser(u)
    return u
  }

  const logout = async () => {
    try { await api.post('/auth/logout') } catch {}
    localStorage.removeItem('bethel_token')
    localStorage.removeItem('bethel_user')
    setUser(null)
  }

  const register = async (data) => {
    const res = await api.post('/auth/register', data)
    const { token, user: u } = res.data
    localStorage.setItem('bethel_token', token)
    localStorage.setItem('bethel_user', JSON.stringify(u))
    setUser(u)
    return u
  }

  const refreshUser = async () => {
    try {
      const res = await api.get('/auth/me')
      const u = res.data.user
      localStorage.setItem('bethel_user', JSON.stringify(u))
      setUser(u)
    } catch {}
  }

  return (
    <AuthContext.Provider value={{ user, setUser, loading, login, logout, register, refreshUser }}>
      {children}
    </AuthContext.Provider>
  )
}

export const useAuth = () => useContext(AuthContext)
