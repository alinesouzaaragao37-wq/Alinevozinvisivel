import { Navigate, useLocation } from 'react-router-dom'
import LoadingScreen from './LoadingScreen'
import { useAuth } from '../hooks/useAuth'

function ProtectedRoute({ allowedRoles, children }) {
  const location = useLocation()
  const { user, profile, loading } = useAuth()

  if (loading) return <LoadingScreen />
  if (!user) return <Navigate to="/login" replace state={{ from: location }} />

  if (allowedRoles?.length && !allowedRoles.includes(profile?.role)) {
    return <Navigate to="/dashboard" replace />
  }

  return children
}

export default ProtectedRoute
