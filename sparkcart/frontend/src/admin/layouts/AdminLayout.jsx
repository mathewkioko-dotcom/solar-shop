import { useState } from 'react'
import { Link, NavLink, Outlet, useLocation } from 'react-router-dom'
import { useAuth } from '../../hooks/useAuth'
import { useToast } from '../../hooks/useToast'
import '../styles/admin.css'

const navigation = [
  ['Dashboard', '/admin', '⌂'],
  ['Products', '/admin/products', '▦'],
  ['Add Product', '/admin/products/new', '+'],
  ['Brands', '/admin/brands', '◈'],
  ['Categories', '/admin/categories', '◇'],
  ['Inventory', '/admin/inventory', '▤'],
]

export default function AdminLayout() {
  const [drawerOpen, setDrawerOpen] = useState(false)
  const location = useLocation()
  const { user, logout } = useAuth()
  const { showSuccess } = useToast()
  const signOut = () => {
    logout()
    showSuccess('Signed Out', 'You have been signed out successfully.')
  }
  const title = navigation.find(([, path]) => path === location.pathname)?.[0] || (location.pathname.includes('/edit') ? 'Edit record' : 'Administration')

  return <div className="admin-shell">
    <button type="button" className={`admin-drawer-backdrop ${drawerOpen ? 'is-open' : ''}`} aria-label="Close navigation" onClick={() => setDrawerOpen(false)} />
    <aside className={`admin-sidebar ${drawerOpen ? 'is-open' : ''}`} aria-label="Admin navigation">
      <Link className="admin-brand" to="/admin"><span>BS</span><div><strong>Baraka Solar</strong><small>Administration</small></div></Link>
      <nav>{navigation.map(([label, path, icon]) => <NavLink end={path === '/admin'} key={path} to={path} onClick={() => setDrawerOpen(false)}><span aria-hidden="true">{icon}</span>{label}</NavLink>)}</nav>
      <div className="admin-sidebar__footer"><Link to="/">↗ View Store</Link><button type="button" onClick={signOut}>↪ Sign Out</button></div>
    </aside>
    <div className="admin-workspace">
      <header className="admin-header"><button type="button" className="admin-menu" aria-label="Open navigation" aria-expanded={drawerOpen} onClick={() => setDrawerOpen(true)}>☰</button><h2>{title}</h2><div><Link to="/">View storefront</Link><span className="admin-header__identity"><strong>{user?.first_name || user?.name || 'Administrator'}</strong><small>Admin</small></span><button type="button" onClick={signOut}>Sign out</button></div></header>
      <main className="admin-main"><Outlet /></main>
    </div>
  </div>
}
