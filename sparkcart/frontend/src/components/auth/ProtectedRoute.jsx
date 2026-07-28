import { useEffect } from 'react'
import { Navigate, useLocation } from 'react-router-dom'
import { useAuth } from '../../hooks/useAuth'
import { useToast } from '../../hooks/useToast'
import SiteLayout from '../../layouts/SiteLayout'

const getSafeDestination = (value, fallback = '/account') => (
  typeof value === 'string'
  && value.startsWith('/')
  && !value.startsWith('//')
  && !value.includes('\\')
    ? value
    : fallback
)

function ProtectedRoute({ children, guestOnly = false }) {
  const location = useLocation()
  const { isAuthenticated, loading } = useAuth()
  const { showWarning } = useToast()

  useEffect(() => {
    if (!loading && !guestOnly && !isAuthenticated) {
      showWarning('Sign In Required', 'Please sign in to access that page.')
    }
  }, [guestOnly, isAuthenticated, loading, showWarning])

  if (loading) {
    return (
      <SiteLayout>
        <main className="auth-route-status" role="status" aria-live="polite">
          Restoring your secure session...
        </main>
      </SiteLayout>
    )
  }

  if (guestOnly && isAuthenticated) {
    return <Navigate to={getSafeDestination(location.state?.from)} replace />
  }

  if (!guestOnly && !isAuthenticated) {
    return (
      <Navigate
        to="/login"
        replace
        state={{ from: `${location.pathname}${location.search}${location.hash}` }}
      />
    )
  }

  return children
}

export default ProtectedRoute
