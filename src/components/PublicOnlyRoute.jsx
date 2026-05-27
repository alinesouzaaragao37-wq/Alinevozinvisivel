import { Navigate, useLocation } from 'react-router-dom'
import LoadingScreen from './LoadingScreen'
import { useAuth } from '../hooks/useAuth'

function PublicOnlyRoute({ children }) {
  const location = useLocation()
  const { user, isAdmin, loading } = useAuth()

  if (loading) return <LoadingScreen />
  if (!user) return children

  const requestedPath = location.state?.from?.pathname
  const destination = requestedPath || (isAdmin ? '/admin' : '/dashboard')

  return <Navigate to={destination} replace />
}

export default PublicOnlyRoute
