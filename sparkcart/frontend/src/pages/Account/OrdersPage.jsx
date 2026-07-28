import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { useAuth } from '../../hooks/useAuth'
import { useToast } from '../../hooks/useToast'
import SiteLayout from '../../layouts/SiteLayout'
import { getOrders } from '../../services/orderService'
import { formatKes } from '../../utils/formatCurrency'
import '../../styles/checkout.css'

const formatDate = (value) => {
  const date = new Date(value)
  return Number.isNaN(date.getTime())
    ? 'Date unavailable'
    : new Intl.DateTimeFormat('en-KE', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
    }).format(date)
}

const readable = (value) => String(value || 'pending').replaceAll('_', ' ')

function OrdersPage() {
  const { token } = useAuth()
  const { showError } = useToast()
  const [page, setPage] = useState(1)
  const [orders, setOrders] = useState([])
  const [meta, setMeta] = useState({})
  const [status, setStatus] = useState('loading')
  const [message, setMessage] = useState('')
  const [retryCount, setRetryCount] = useState(0)

  useEffect(() => {
    const controller = new AbortController()

    getOrders(token, page, controller.signal)
      .then((result) => {
        setOrders(result.orders)
        setMeta(result.meta)
        setMessage('')
        setStatus('success')
      })
      .catch((error) => {
        if (error?.name === 'AbortError') return
        const nextMessage = error?.message || 'Order history could not be loaded.'
        setMessage(nextMessage)
        showError('Order History Unavailable', nextMessage)
        setStatus('error')
      })

    return () => controller.abort()
  }, [page, retryCount, showError, token])

  const changePage = (nextPage) => {
    setStatus('loading')
    setMessage('')
    setPage(nextPage)
  }

  const retry = () => {
    setStatus('loading')
    setMessage('')
    setRetryCount((count) => count + 1)
  }

  return (
    <SiteLayout>
      <main className="checkout-page checkout-page--account">
        <div className="checkout-page__container">
          <nav className="checkout-page__breadcrumb" aria-label="Breadcrumb">
            <ol>
              <li><Link to="/">Home</Link></li>
              <li><Link to="/account">My Account</Link></li>
              <li aria-current="page">Orders</li>
            </ol>
          </nav>
          <header className="checkout-page__heading">
            <p>Customer account</p>
            <h1>Your Orders</h1>
            <span>Review every order placed with Baraka Solar Shop.</span>
          </header>

          {status === 'loading' && (
            <div className="checkout-page__state" role="status">Loading your orders…</div>
          )}
          {status === 'error' && (
            <div className="checkout-page__state checkout-page__state--error" role="alert">
              <p>{message}</p>
              <button type="button" onClick={retry}>Try again</button>
            </div>
          )}
          {status === 'success' && orders.length === 0 && (
            <section className="checkout-page__state">
              <h2>You have not placed any orders yet.</h2>
              <Link to="/products">Browse solar products</Link>
            </section>
          )}
          {status === 'success' && orders.length > 0 && (
            <>
              <ul className="checkout-page__orders">
                {orders.map((order) => (
                  <li key={order.orderNumber}>
                    <div>
                      <span>Order number</span>
                      <strong>{order.orderNumber}</strong>
                    </div>
                    <div><span>Date</span><strong>{formatDate(order.placedAt)}</strong></div>
                    <div><span>Order status</span><strong>{readable(order.orderStatus)}</strong></div>
                    <div><span>Payment status</span><strong>{readable(order.paymentStatus)}</strong></div>
                    <div><span>Items</span><strong>{order.itemCount}</strong></div>
                    <div><span>Total</span><strong>{formatKes(order.total)}</strong></div>
                    <Link to={`/account/orders/${encodeURIComponent(order.orderNumber)}`}>View Order</Link>
                  </li>
                ))}
              </ul>
              {Number(meta.last_page) > 1 && (
                <nav className="checkout-page__pagination" aria-label="Order pages">
                  <button
                    type="button"
                    disabled={page <= 1}
                    onClick={() => changePage(page - 1)}
                  >
                    Previous
                  </button>
                  <span>Page {meta.current_page || page} of {meta.last_page}</span>
                  <button
                    type="button"
                    disabled={page >= meta.last_page}
                    onClick={() => changePage(page + 1)}
                  >
                    Next
                  </button>
                </nav>
              )}
            </>
          )}
        </div>
      </main>
    </SiteLayout>
  )
}

export default OrdersPage
