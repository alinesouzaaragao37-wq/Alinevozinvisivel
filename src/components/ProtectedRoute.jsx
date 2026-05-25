import { Navigate } from 'react-router-dom'
import LoadingScreen from './LoadingScreen'
import { useAuth } from '../hooks/useAuth'

function ProtectedRoute({ allowedRoles, children }) {
  const { user, profile, loading } = useAuth()

  if (loading) return <LoadingScreen />
  if (!user) return <Navigate to="/login" replace />

  if (allowedRoles?.length && !allowedRoles.includes(profile?.role)) {
    return <Navigate to="/dashboard" replace />
  }

  return children
}

export default ProtectedRoute
