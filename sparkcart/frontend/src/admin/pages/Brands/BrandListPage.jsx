import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { ConfirmDialog, EmptyState, ErrorState, LoadingState, PageHeader, Pagination, StatusBadge } from '../../components/AdminUI'
import { useAdminNotifications } from '../../components/AdminNotifications'
import { adminBrands, clearAdminCatalogCache } from '../../services/adminApi'

const filters = [['all', 'All'], ['active', 'Active'], ['inactive', 'Inactive'], ['archived', 'Archived']]

export default function BrandListPage() {
  const [state, setState] = useState({ status: 'loading', brands: [], meta: null, error: '', page: 1, retry: 0, filter: 'all' })
  const [dialog, setDialog] = useState(null)
  const { notify } = useAdminNotifications()

  useEffect(() => {
    const controller = new AbortController()
    adminBrands.list({ status: state.filter, page: state.page }, controller.signal)
      .then((payload) => setState((current) => ({ ...current, status: 'success', brands: payload.data || [], meta: payload.meta })))
      .catch((error) => { if (error.name !== 'AbortError') setState((current) => ({ ...current, status: 'error', error: error.message })) })
    return () => controller.abort()
  }, [state.filter, state.page, state.retry])

  const act = async () => {
    const { kind, brand } = dialog
    setDialog(null)
    try {
      if (kind === 'archive') await adminBrands.archive(brand.id)
      if (kind === 'restore') await adminBrands.restore(brand.id)
      if (kind === 'delete') await adminBrands.removePermanently(brand.id)
      if (kind === 'activate') await adminBrands.setActive(brand.id, true)
      if (kind === 'deactivate') await adminBrands.setActive(brand.id, false)
      clearAdminCatalogCache()
      notify(kind === 'delete' ? 'Brand permanently deleted.' : `Brand ${kind}d.`)
      setState((current) => ({ ...current, retry: current.retry + 1 }))
    } catch (error) {
      notify(error.message, 'error')
    }
  }

  const dialogCopy = {
    activate: ['Activate brand?', 'This brand will become visible on the storefront and available for new product assignments.', 'Activate'],
    deactivate: ['Deactivate brand?', 'This brand will be hidden from the storefront, but assigned products will remain.', 'Deactivate'],
    archive: ['Archive brand?', 'This brand will be removed from active management and hidden from the storefront.', 'Archive'],
    restore: ['Restore brand?', 'The brand will return to inactive management so an administrator can review and activate it.', 'Restore'],
    delete: ['Permanently delete brand?', 'This permanently removes the brand and cannot be undone.', 'Delete forever'],
  }
  const copy = dialogCopy[dialog?.kind] || ['', '', 'Confirm']

  return <div className="admin-page">
    <PageHeader eyebrow="Catalogue organisation" title="Brands" description="Manage manufacturer identity and storefront visibility." actions={<Link className="admin-button" to="/admin/brands/new">Add Brand</Link>} />
    <nav className="admin-brand-filters" aria-label="Brand availability filters">{filters.map(([value, label]) => <button type="button" className={state.filter === value ? 'is-active' : ''} aria-pressed={state.filter === value} key={value} onClick={() => setState((current) => ({ ...current, filter: value, page: 1, status: 'loading' }))}>{label}</button>)}</nav>
    {state.status === 'loading' ? <LoadingState /> : state.status === 'error' ? <ErrorState message={state.error} onRetry={() => setState((current) => ({ ...current, retry: current.retry + 1 }))} /> : state.brands.length ? <>
      <div className="admin-table-wrap"><table className="admin-table"><thead><tr><th>Brand</th><th>Slug</th><th>Status</th><th>Products</th><th>Order</th><th>Updated</th><th>Actions</th></tr></thead><tbody>{state.brands.map((brand) => <tr key={brand.id}>
        <td><div className="admin-brand-cell">{brand.logo_url ? <img src={brand.logo_url} alt="" /> : <span>{brand.name.slice(0, 2).toUpperCase()}</span>}<strong>{brand.name}</strong></div></td>
        <td>{brand.slug}</td><td><StatusBadge active={brand.is_active} archived={Boolean(brand.archived_at)} /></td><td>{brand.products_count ?? 0}</td><td>{brand.display_order}</td><td>{brand.updated_at ? new Date(brand.updated_at).toLocaleDateString() : '—'}</td>
        <td><div className="admin-row-actions">{!brand.archived_at && <Link to={`/admin/brands/${brand.id}/edit`}>Edit</Link>}{brand.archived_at ? <><button type="button" onClick={() => setDialog({ kind: 'restore', brand })}>Restore</button>{Number(brand.products_count) === 0 && <button type="button" className="is-danger" onClick={() => setDialog({ kind: 'delete', brand })}>Delete forever</button>}</> : <><button type="button" onClick={() => setDialog({ kind: brand.is_active ? 'deactivate' : 'activate', brand })}>{brand.is_active ? 'Deactivate' : 'Activate'}</button><button type="button" onClick={() => setDialog({ kind: 'archive', brand })}>Archive</button></>}</div></td>
      </tr>)}</tbody></table></div>
      <Pagination meta={state.meta} onPage={(page) => setState((current) => ({ ...current, page }))} />
    </> : <EmptyState title={`No ${state.filter === 'all' ? '' : `${state.filter} `}brands`} message="No brands match this availability filter." action={state.filter === 'all' ? <Link className="admin-button" to="/admin/brands/new">Add Brand</Link> : undefined} />}
    <ConfirmDialog open={Boolean(dialog)} title={copy[0]} message={copy[1]} destructive={['delete', 'archive', 'deactivate'].includes(dialog?.kind)} confirmLabel={copy[2]} onConfirm={act} onClose={() => setDialog(null)} />
  </div>
}
