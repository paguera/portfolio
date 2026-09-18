import React, { useState, useCallback, useEffect } from 'react'
import type { User } from '../types'
import { AuthContext } from './AuthContext'
import apiFetch from '../utils/api'

export default function AuthProvider ({
  children
}: {
  children: React.ReactNode
}) {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)

  // Vérification de la session au chargement de l'application
  useEffect(() => {
    const checkAuth = async () => {
      try {
        const data = await apiFetch<{ user: User }>('/auth/me')
        setUser(data.user)
      } catch (e) {
        // Si /me échoue, c'est que le cookie est invalide ou absent
        setUser(null)
      } finally {
        setLoading(false)
      }
    }
    checkAuth()
  }, [])

  const login = useCallback(async () => {
    // Après un login réussi (qui a posé le cookie), on récupère les infos user
    try {
      const data = await apiFetch<{ user: User }>('/auth/me')
      setUser(data.user)
    } catch (e) {
      setUser(null)
    }
  }, [])

  const logout = useCallback(async () => {
    try {
      await apiFetch('/auth/logout', { method: 'POST' })
    } finally {
      setUser(null)
    }
  }, [])

  const isAuthenticated = !!user
  const isAdmin = user?.role === 'admin'

  return (
    <AuthContext.Provider
      value={{ user, login, logout, isAuthenticated, isAdmin, loading }}
    >
      {children}
    </AuthContext.Provider>
  )
}
