import { useEffect } from 'react'
import { Navigate, useLocation } from 'react-router-dom'
import { useAuth } from '../../hooks/useAuth'
import { useToast } from '../../hooks/useToast'
import { resolveAdminAccess } from '../utils/adminAccess'

export default function AdminRoute({ children }) {
  const { loading, user } = useAuth()
  const location = useLocation()
  const { showError, showWarning } = useToast()
  const access = resolveAdminAccess(user)
  useEffect(() => {
    if (loading) return
    if (access === 'login') showWarning('Administrator Sign In Required', 'Sign in with an administrator account to continue.')
    if (access === 'account') showError('Access Forbidden', 'Your account does not have administrator access.')
  }, [access, loading, showError, showWarning])
  if (loading) return <main className="admin-auth-loading" role="status"><span /><p>Restoring secure session…</p></main>
  if (access === 'login') return <Navigate to="/login" replace state={{ from: `${location.pathname}${location.search}` }} />
  if (access === 'account') return <Navigate to="/account" replace />
  return children
}
