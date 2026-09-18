import React from 'react'
import { Navigate, Outlet } from 'react-router-dom'
import { useAuth } from '../hooks/useAuth'

/*
 * Composant ProtectedRoutes qui permet d'accéder aux routes protégées uniquement si l'utilisateur est authentifié.
 */
const ProtectedRoutes: React.FC = () => {
  const { isAuthenticated, loading } = useAuth()

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center uppercase tracking-widest animate-pulse font-mono">
        [ Validating_Session... ]
      </div>
    )
  }

  return isAuthenticated ? <Outlet /> : <Navigate to='/' replace />
}

export default ProtectedRoutes
