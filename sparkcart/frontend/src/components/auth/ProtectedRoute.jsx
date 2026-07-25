import { Navigate, useLocation } from 'react-router-dom'
import { useAuth } from '../../hooks/useAuth'

function ProtectedRoute({ children, guestOnly = false }) {
  const location = useLocation()
  const { isAuthenticated, loading } = useAuth()

  if (loading) {
    return (
      <div className="auth-route-status" role="status" aria-live="polite">
        Restoring your secure session...
      </div>
    )
  }

  if (guestOnly && isAuthenticated) {
    return <Navigate to="/account" replace />
  }

  if (!guestOnly && !isAuthenticated) {
    return (
      <Navigate
        to="/login"
        replace
        state={{ from: `${location.pathname}${location.search}` }}
      />
    )
  }

  return children
}

export default ProtectedRoute

