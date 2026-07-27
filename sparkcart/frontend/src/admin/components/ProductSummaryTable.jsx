import { Link } from 'react-router-dom'
import { formatKes } from '../../utils/formatCurrency'
import { StatusBadge, StockBadge } from './AdminUI'

export default function ProductSummaryTable({ products, compact = false, actions }) {
  return <div className="admin-table-wrap"><table className="admin-table"><thead><tr><th>Product</th>{!compact && <th>SKU</th>}<th>Brand</th>{!compact && <th>Category</th>}{!compact && <th>Price</th>}<th>Stock</th><th>Status</th><th><span className="sr-only">Actions</span></th></tr></thead><tbody>{products.map((product) => <tr key={product.id}><td><div className="admin-product-cell">{product.primary_image ? <img src={product.primary_image} alt="" /> : <span className="admin-image-placeholder">BS</span>}<div><strong>{product.name}</strong><small>{product.model_number || 'No model number'}</small></div></div></td>{!compact && <td>{product.sku || '—'}</td>}<td>{product.brand?.name || 'Unassigned'}</td>{!compact && <td>{product.category?.name || '—'}</td>}{!compact && <td>{formatKes(product.price)}</td>}<td><StockBadge stock={product.stock} threshold={product.low_stock_threshold} /></td><td><StatusBadge active={product.is_active} archived={Boolean(product.archived_at)} /></td><td>{actions ? actions(product) : <Link className="admin-text-link" to={`/admin/products/${product.id}/edit`}>Edit</Link>}</td></tr>)}</tbody></table></div>
}
