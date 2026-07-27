import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import ProductSummaryTable from '../../components/ProductSummaryTable'
import { EmptyState, ErrorState, LoadingState, PageHeader } from '../../components/AdminUI'
import { getAdminDashboard } from '../../services/adminApi'

const statConfig = [
  ['products', 'Total products', '▦'],
  ['active_products', 'Active products', '✓'],
  ['featured_products', 'Featured products', '★'],
  ['low_stock_products', 'Low stock', '!'],
  ['out_of_stock_products', 'Out of stock', '×'],
  ['brands', 'Brands', '◈'],
  ['categories', 'Categories', '◇'],
]

export default function DashboardPage() {
  const [state, setState] = useState({ status: 'loading', data: null, error: '', retry: 0 })
  useEffect(() => {
    const controller = new AbortController()
    getAdminDashboard(controller.signal)
      .then((data) => setState((current) => ({ ...current, status: 'success', data, error: '' })))
      .catch((error) => { if (error.name !== 'AbortError') setState((current) => ({ ...current, status: 'error', error: error.message })) })
    return () => controller.abort()
  }, [state.retry])
  return <div className="admin-page">
    <PageHeader eyebrow="Store overview" title="Good decisions start here" description="A live view of catalogue health and the products that need attention." actions={<Link className="admin-button" to="/admin/products/new">Add Product</Link>} />
    {state.status === 'loading' ? <LoadingState rows={7} /> : state.status === 'error' ? <ErrorState message={state.error} onRetry={() => setState((current) => ({ ...current, retry: current.retry + 1 }))} /> : <>
      <section className="admin-stat-grid">{statConfig.map(([key, label, icon]) => <article className="admin-stat-card" key={key}><span>{icon}</span><div><strong>{state.data.counts[key]}</strong><p>{label}</p></div></article>)}</section>
      <section className="admin-quick-actions"><Link to="/admin/products/new">+ Add Product</Link><Link to="/admin/products">Manage Products</Link><Link to="/admin/brands/new">+ Add Brand</Link><Link to="/admin/inventory">Review Inventory</Link></section>
      <div className="admin-dashboard-grid"><section className="admin-panel"><header><div><span>Attention required</span><h2>Low-stock products</h2></div><Link to="/admin/inventory?stock_status=low_stock">View inventory</Link></header>{state.data.low_stock?.length ? <ProductSummaryTable compact products={state.data.low_stock} /> : <EmptyState title="Stock levels look healthy" message="No products are at or below their low-stock threshold." />}</section>
      <section className="admin-panel"><header><div><span>Catalogue activity</span><h2>Recently updated</h2></div><Link to="/admin/products?sort=newest">All products</Link></header>{state.data.recently_updated?.length ? <ProductSummaryTable compact products={state.data.recently_updated} /> : <EmptyState title="No products yet" message="Create the first product to begin building your catalogue." />}</section></div>
    </>}
  </div>
}
