import { Navigate, useLocation } from 'react-router-dom'
import { useAuth } from '../../hooks/useAuth'
import { resolveAdminAccess } from '../utils/adminAccess'

export default function AdminRoute({ children }) {
  const { loading, user } = useAuth()
  const location = useLocation()
  if (loading) return <main className="admin-auth-loading" role="status"><span /><p>Restoring secure session…</p></main>
  const access = resolveAdminAccess(user)
  if (access === 'login') return <Navigate to="/login" replace state={{ from: `${location.pathname}${location.search}` }} />
  if (access === 'account') return <Navigate to="/account" replace />
  return children
}
