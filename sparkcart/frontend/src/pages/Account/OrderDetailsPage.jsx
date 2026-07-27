import { useEffect, useState } from 'react'
import { Link, useLocation, useParams } from 'react-router-dom'
import { useAuth } from '../../hooks/useAuth'
import SiteLayout from '../../layouts/SiteLayout'
import { getOrder, normalizeOrder } from '../../services/orderService'
import { formatKes } from '../../utils/formatCurrency'
import '../../styles/checkout.css'

const labels = {
  standard_delivery: 'Standard Delivery',
  mpesa: 'M-Pesa',
  card: 'Card payment',
  pay_on_confirmation: 'Pay on confirmation',
}

const formatDate = (value) => {
  const date = new Date(value)
  return Number.isNaN(date.getTime())
    ? 'Date unavailable'
    : new Intl.DateTimeFormat('en-KE', {
      dateStyle: 'long',
      timeStyle: 'short',
    }).format(date)
}

const readable = (value) => String(value || 'pending').replaceAll('_', ' ')

function OrderDetailsPage() {
  const { orderNumber } = useParams()
  const location = useLocation()
  const { token } = useAuth()
  const confirmedOrder = location.state?.order
    ? normalizeOrder(location.state.order)
    : null
  const hasConfirmedOrder = confirmedOrder?.orderNumber === orderNumber
  const [order, setOrder] = useState(hasConfirmedOrder ? confirmedOrder : null)
  const [status, setStatus] = useState(hasConfirmedOrder ? 'success' : 'loading')
  const [message, setMessage] = useState('')
  const [retryCount, setRetryCount] = useState(0)
  const visibleStatus = status === 'error'
    ? 'error'
    : order?.orderNumber === orderNumber
      ? status
      : 'loading'

  useEffect(() => {
    if (hasConfirmedOrder) return undefined

    const controller = new AbortController()

    getOrder(orderNumber, token, controller.signal)
      .then((result) => {
        setOrder(result)
        setMessage('')
        setStatus('success')
      })
      .catch((error) => {
        if (error?.name === 'AbortError') return
        setMessage(error?.status === 404
          ? 'This order could not be found.'
          : error?.message || 'The order could not be loaded.')
        setStatus('error')
      })

    return () => controller.abort()
  }, [hasConfirmedOrder, orderNumber, retryCount, token])

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
              <li><Link to="/account/orders">Orders</Link></li>
              <li aria-current="page">{orderNumber}</li>
            </ol>
          </nav>

          {visibleStatus === 'loading' && (
            <div className="checkout-page__state" role="status">Loading order details…</div>
          )}
          {visibleStatus === 'error' && (
            <div className="checkout-page__state checkout-page__state--error" role="alert">
              <h1>Order unavailable</h1>
              <p>{message}</p>
              {message !== 'This order could not be found.' && (
                <button type="button" onClick={retry}>Try again</button>
              )}
              <Link to="/account/orders">Return to orders</Link>
            </div>
          )}
          {visibleStatus === 'success' && order && (
            <>
              <header className="checkout-page__heading">
                <p>{location.state?.orderConfirmed ? 'Order received' : 'Order details'}</p>
                <h1>Order confirmation</h1>
                <span>{order.orderNumber}</span>
              </header>
              {location.state?.orderConfirmed && (
                <div className="checkout-page__confirmation" role="status" aria-live="polite">
                  Your order has been created. Payment and delivery remain pending confirmation.
                </div>
              )}
              <div className="checkout-page__details-grid">
                <section className="checkout-page__card">
                  <h2>Order status</h2>
                  <dl className="checkout-page__details-list">
                    <div><dt>Date placed</dt><dd>{formatDate(order.placedAt)}</dd></div>
                    <div><dt>Order status</dt><dd>{readable(order.orderStatus)}</dd></div>
                    <div><dt>Payment status</dt><dd>{readable(order.paymentStatus)}</dd></div>
                    <div><dt>Intended payment</dt><dd>{labels[order.paymentMethod] || readable(order.paymentMethod)}</dd></div>
                    <div><dt>Delivery method</dt><dd>{labels[order.deliveryMethod] || readable(order.deliveryMethod)}</dd></div>
                  </dl>
                </section>
                <section className="checkout-page__card">
                  <h2>Delivery address</h2>
                  <address>
                    <strong>{order.deliveryAddress.first_name} {order.deliveryAddress.last_name}</strong>
                    <span>{order.deliveryAddress.street_address}</span>
                    {order.deliveryAddress.building_details && <span>{order.deliveryAddress.building_details}</span>}
                    <span>{order.deliveryAddress.city}, {order.deliveryAddress.county}</span>
                    {order.deliveryAddress.postal_code && <span>{order.deliveryAddress.postal_code}</span>}
                    <span>{order.deliveryAddress.phone}</span>
                  </address>
                  {order.deliveryAddress.delivery_instructions && (
                    <p>Instructions: {order.deliveryAddress.delivery_instructions}</p>
                  )}
                  <h3>Contact information</h3>
                  <p>{order.customerEmail}<br />{order.customerPhone}</p>
                </section>
              </div>
              <section className="checkout-page__card">
                <h2>Ordered products</h2>
                <ul className="checkout-page__review-list">
                  {order.items.map((item) => (
                    <li key={item.id}>
                      <div className="checkout-page__review-image">
                        {item.productImage ? <img src={item.productImage} alt="" /> : <span aria-hidden="true">BSS</span>}
                      </div>
                      <div>
                        {item.productSlug ? (
                          <Link to={`/products/${encodeURIComponent(item.productSlug)}`}>{item.productName}</Link>
                        ) : <strong>{item.productName}</strong>}
                        <span>{formatKes(item.unitPrice)} × {item.quantity}</span>
                      </div>
                      <strong>{formatKes(item.lineTotal)}</strong>
                    </li>
                  ))}
                </ul>
                <dl className="checkout-page__totals">
                  <div><dt>Subtotal</dt><dd>{formatKes(order.subtotal)}</dd></div>
                  <div><dt>Delivery</dt><dd>Pending confirmation</dd></div>
                  <div><dt>Tax</dt><dd>Included or calculated later</dd></div>
                  <div><dt>Estimated total</dt><dd>{formatKes(order.total)}</dd></div>
                </dl>
              </section>
            </>
          )}
        </div>
      </main>
    </SiteLayout>
  )
}

export default OrderDetailsPage
