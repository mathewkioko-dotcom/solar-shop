import { useEffect, useMemo, useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import { ConfirmDialog, EmptyState, ErrorState, LoadingState, PageHeader, Pagination, StockBadge } from '../../components/AdminUI'
import { useToast } from '../../../hooks/useToast'
import { adminProducts, getAdminCatalogs, getAdminDashboard } from '../../services/adminApi'

export default function InventoryPage() {
  const [params, setParams] = useSearchParams()
  const filters = useMemo(() => ({ stock_status: params.get('stock_status') || '', brand: params.get('brand') || '', category: params.get('category') || '', page: params.get('page') || 1 }), [params])
  const [state, setState] = useState({ status: 'loading', products: [], meta: null, summary: null, error: '', retry: 0 })
  const [catalogs, setCatalogs] = useState({ brands: [], categories: [] })
  const [drafts, setDrafts] = useState({})
  const [confirm, setConfirm] = useState(null)
  const { showError, showSuccess } = useToast()
  const setFilter = (key, value) => { const next = new URLSearchParams(params); value ? next.set(key, value) : next.delete(key); if (key !== 'page') next.delete('page'); setParams(next) }
  useEffect(() => {
    const controller = new AbortController()
    getAdminCatalogs(controller.signal).then(setCatalogs).catch((error) => {
      if (error.name !== 'AbortError') showError('Inventory Filters Unavailable', error.message)
    })
    return () => controller.abort()
  }, [showError])
  useEffect(() => {
    const controller = new AbortController()
    Promise.all([adminProducts.list({ ...filters, per_page: 20 }, controller.signal), getAdminDashboard(controller.signal)])
      .then(([payload, summary]) => { setState((current) => ({ ...current, status: 'success', products: payload.data || [], meta: payload.meta, summary, error: '' })); setDrafts(Object.fromEntries((payload.data || []).map((product) => [product.id, product.stock]))) })
      .catch((error) => { if (error.name !== 'AbortError') { setState((current) => ({ ...current, status: 'error', error: error.message })); showError('Inventory Unavailable', error.message) } })
    return () => controller.abort()
  }, [filters, showError, state.retry])
  const requestUpdate = (product) => {
    const stock = Number(drafts[product.id])
    if (!Number.isInteger(stock) || stock < 0) { showError('Invalid Stock', 'Stock must be a non-negative whole number.'); return }
    if (Math.abs(stock - product.stock) >= Math.max(50, product.stock * 0.5)) setConfirm({ product, stock })
    else updateStock(product, stock)
  }
  const updateStock = async (product, stock) => {
    setConfirm(null)
    try {
      const payload = await adminProducts.stock(product.id, stock)
      const updated = payload.data || payload
      setState((current) => ({ ...current, products: current.products.map((item) => item.id === product.id ? updated : item), retry: current.retry + 1 }))
      showSuccess('Stock Updated', `${product.name} now has ${stock} units in stock.`)
    } catch (error) { showError('Stock Update Failed', error.message) }
  }
  return <div className="admin-page"><PageHeader eyebrow="Stock control" title="Inventory" description="Review stock health and apply absolute stock corrections safely." />
    {state.summary && <section className="admin-stat-grid admin-stat-grid--inventory"><article className="admin-stat-card"><span>Σ</span><div><strong>{state.summary.inventory.total_units}</strong><p>Total units in stock</p></div></article><article className="admin-stat-card"><span>!</span><div><strong>{state.summary.counts.low_stock_products}</strong><p>Low-stock products</p></div></article><article className="admin-stat-card"><span>×</span><div><strong>{state.summary.counts.out_of_stock_products}</strong><p>Out-of-stock products</p></div></article></section>}
    <section className="admin-toolbar"><select aria-label="Stock status" value={filters.stock_status} onChange={(event) => setFilter('stock_status', event.target.value)}><option value="">All stock levels</option><option value="in_stock">In stock</option><option value="low_stock">Low stock</option><option value="out_of_stock">Out of stock</option></select><select aria-label="Brand" value={filters.brand} onChange={(event) => setFilter('brand', event.target.value)}><option value="">All brands</option>{catalogs.brands.map((item) => <option key={item.id} value={item.id}>{item.name}</option>)}</select><select aria-label="Category" value={filters.category} onChange={(event) => setFilter('category', event.target.value)}><option value="">All categories</option>{catalogs.categories.map((item) => <option key={item.id} value={item.id}>{item.name}</option>)}</select></section>
    {state.status === 'loading' ? <LoadingState /> : state.status === 'error' ? <ErrorState message={state.error} onRetry={() => setState((current) => ({ ...current, retry: current.retry + 1 }))} /> : state.products.length ? <><div className="admin-table-wrap"><table className="admin-table"><thead><tr><th>Product</th><th>SKU</th><th>Brand</th><th>Threshold</th><th>Status</th><th>New stock quantity</th></tr></thead><tbody>{state.products.map((product) => <tr key={product.id}><td><div className="admin-product-cell">{product.primary_image ? <img src={product.primary_image} alt="" /> : <span className="admin-image-placeholder">BS</span>}<strong>{product.name}</strong></div></td><td>{product.sku || '—'}</td><td>{product.brand?.name || 'Unassigned'}</td><td>{product.low_stock_threshold}</td><td><StockBadge stock={product.stock} threshold={product.low_stock_threshold} /></td><td><div className="admin-stock-editor"><input aria-label={`New stock for ${product.name}`} type="number" min="0" value={drafts[product.id] ?? product.stock} onChange={(event) => setDrafts((current) => ({ ...current, [product.id]: event.target.value }))} /><button type="button" disabled={Number(drafts[product.id]) === product.stock} onClick={() => requestUpdate(product)}>Update</button></div></td></tr>)}</tbody></table></div><Pagination meta={state.meta} onPage={(page) => setFilter('page', String(page))} /></> : <EmptyState title="No inventory matches" message="Adjust the stock, brand, or category filters." />}
    <ConfirmDialog open={Boolean(confirm)} title="Confirm large stock change" message={`Change ${confirm?.product?.name || 'this product'} from ${confirm?.product?.stock ?? 0} to ${confirm?.stock ?? 0} units?`} confirmLabel="Update stock" onClose={() => setConfirm(null)} onConfirm={() => updateStock(confirm.product, confirm.stock)} />
  </div>
}
