import { useCallback, useEffect, useMemo, useState } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import ProductSummaryTable from '../../components/ProductSummaryTable'
import { ConfirmDialog, EmptyState, ErrorState, LoadingState, PageHeader, Pagination } from '../../components/AdminUI'
import { useToast } from '../../../hooks/useToast'
import { adminProducts, getAdminCatalogs } from '../../services/adminApi'

const allowed = ['search', 'category', 'brand', 'active', 'featured', 'stock_status', 'low_stock', 'archived', 'sort', 'direction', 'page']

export default function ProductListPage() {
  const [params, setParams] = useSearchParams()
  const query = useMemo(() => Object.fromEntries(allowed.map((key) => [key, params.get(key) || ''])), [params])
  const [search, setSearch] = useState(query.search)
  const [catalogs, setCatalogs] = useState({ brands: [], categories: [] })
  const [state, setState] = useState({ status: 'loading', products: [], meta: null, error: '', retry: 0 })
  const [dialog, setDialog] = useState(null)
  const { showError, showSuccess } = useToast()
  const updateQuery = useCallback((key, value) => {
    const next = new URLSearchParams(params)
    value ? next.set(key, value) : next.delete(key)
    if (key !== 'page') next.delete('page')
    setParams(next)
  }, [params, setParams])

  useEffect(() => {
    const timer = window.setTimeout(() => setSearch(query.search), 0)
    return () => window.clearTimeout(timer)
  }, [query.search])
  useEffect(() => {
    const timer = window.setTimeout(() => { if (search !== query.search) updateQuery('search', search.trim()) }, 350)
    return () => window.clearTimeout(timer)
  }, [query.search, search, updateQuery])
  useEffect(() => {
    const controller = new AbortController()
    getAdminCatalogs(controller.signal).then(setCatalogs).catch((error) => {
      if (error.name !== 'AbortError') showError('Product Filters Unavailable', error.message)
    })
    return () => controller.abort()
  }, [showError])
  useEffect(() => {
    const controller = new AbortController()
    adminProducts.list({ ...query, per_page: 20 }, controller.signal)
      .then((payload) => setState((current) => ({ ...current, status: 'success', products: payload.data || [], meta: payload.meta, error: '' })))
      .catch((error) => { if (error.name !== 'AbortError') { setState((current) => ({ ...current, status: 'error', error: error.message })); showError('Products Unavailable', error.message) } })
    return () => controller.abort()
  }, [query, showError, state.retry])

  const performAction = async () => {
    const { kind, product } = dialog
    setDialog(null)
    try {
      if (kind === 'archive') await adminProducts.archive(product.id)
      if (kind === 'restore') await adminProducts.restore(product.id)
      if (kind === 'delete') await adminProducts.removePermanently(product.id)
      showSuccess('Product Updated', kind === 'archive' ? 'Product archived.' : kind === 'restore' ? 'Product restored.' : 'Product permanently deleted.')
      setState((current) => ({ ...current, retry: current.retry + 1 }))
    } catch (error) { showError('Product Update Failed', error.message) }
  }

  const actions = (product) => <div className="admin-row-actions">{!product.archived_at && <Link to={`/admin/products/${product.id}/edit`}>Edit</Link>}{product.archived_at ? <><button type="button" onClick={() => setDialog({ kind: 'restore', product })}>Restore</button><button type="button" className="is-danger" onClick={() => setDialog({ kind: 'delete', product })}>Delete</button></> : <><button type="button" onClick={() => setDialog({ kind: 'archive', product })}>Archive</button><Link to={`/products/${product.slug}`}>View</Link></>}</div>

  return <div className="admin-page"><PageHeader eyebrow="Catalogue" title="Products" description={`${state.meta?.total ?? 0} products across your catalogue.`} actions={<Link className="admin-button" to="/admin/products/new">Add Product</Link>} />
    <section className="admin-toolbar"><label className="admin-search"><span className="sr-only">Search products</span><input type="search" value={search} placeholder="Search name, SKU, model, brand…" onChange={(event) => setSearch(event.target.value)} /></label>
      <select aria-label="Category" value={query.category} onChange={(event) => updateQuery('category', event.target.value)}><option value="">All categories</option>{catalogs.categories.map((item) => <option key={item.id} value={item.id}>{item.name}</option>)}</select>
      <select aria-label="Brand" value={query.brand} onChange={(event) => updateQuery('brand', event.target.value)}><option value="">All brands</option>{catalogs.brands.map((item) => <option key={item.id} value={item.id}>{item.name}</option>)}</select>
      <select aria-label="Status" value={query.active} onChange={(event) => updateQuery('active', event.target.value)}><option value="">Any status</option><option value="1">Active</option><option value="0">Inactive</option></select>
      <select aria-label="Featured" value={query.featured} onChange={(event) => updateQuery('featured', event.target.value)}><option value="">Featured or not</option><option value="1">Featured</option><option value="0">Not featured</option></select>
      <select aria-label="Stock status" value={query.stock_status} onChange={(event) => updateQuery('stock_status', event.target.value)}><option value="">Any stock</option><option value="in_stock">In stock</option><option value="low_stock">Low stock</option><option value="out_of_stock">Out of stock</option></select>
      <select aria-label="Archive status" value={query.archived} onChange={(event) => updateQuery('archived', event.target.value)}><option value="">Current products</option><option value="with">Include archived</option><option value="only">Archived only</option></select>
      <select aria-label="Sort products" value={query.sort || 'newest'} onChange={(event) => updateQuery('sort', event.target.value)}><option value="newest">Newest</option><option value="oldest">Oldest</option><option value="name">Name</option><option value="price">Price</option><option value="stock">Stock</option></select>
    </section>
    {state.status === 'loading' ? <LoadingState /> : state.status === 'error' ? <ErrorState message={state.error} onRetry={() => setState((current) => ({ ...current, retry: current.retry + 1 }))} /> : state.products.length ? <><ProductSummaryTable products={state.products} actions={actions} /><Pagination meta={state.meta} onPage={(page) => updateQuery('page', String(page))} /></> : <EmptyState title="No matching products" message="Adjust the filters or add a new product to the catalogue." action={<Link className="admin-button" to="/admin/products/new">Add Product</Link>} />}
    <ConfirmDialog open={Boolean(dialog)} title={dialog?.kind === 'delete' ? 'Permanently delete product?' : `${dialog?.kind === 'restore' ? 'Restore' : 'Archive'} product?`} message={dialog?.kind === 'delete' ? 'This cannot be undone. Product files and catalogue data will be permanently removed.' : `Confirm this change for ${dialog?.product?.name || 'this product'}.`} confirmLabel={dialog?.kind === 'delete' ? 'Delete forever' : dialog?.kind === 'restore' ? 'Restore' : 'Archive'} destructive={dialog?.kind !== 'restore'} onConfirm={performAction} onClose={() => setDialog(null)} />
  </div>
}
