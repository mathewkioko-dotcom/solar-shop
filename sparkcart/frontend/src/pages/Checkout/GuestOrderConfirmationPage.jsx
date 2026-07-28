import { useEffect, useState } from 'react'
import { Link, useLocation, useParams } from 'react-router-dom'
import SiteLayout from '../../layouts/SiteLayout'
import { useToast } from '../../hooks/useToast'
import { getGuestOrder } from '../../services/checkoutService'
import { resolveApiImageUrl } from '../../services/apiService'
import { formatKes } from '../../utils/formatCurrency'
import '../../styles/checkout.css'

const PAYMENT_LABELS = {
  mpesa: 'M-Pesa',
  card: 'Visa / Mastercard',
  pay_on_confirmation: 'Pay on Confirmation',
}

const formatDate = (value) => {
  if (!value) return 'Pending'
  const parsed = new Date(value)
  if (Number.isNaN(parsed.getTime())) return 'Pending'

  return new Intl.DateTimeFormat('en-KE', {
    dateStyle: 'medium',
    timeStyle: 'short',
    timeZone: 'Africa/Nairobi',
  }).format(parsed)
}

function GuestOrderConfirmationPage() {
  const { token } = useParams()
  const location = useLocation()
  const { showError } = useToast()
  const tokenIsValid = /^[a-f0-9]{64}$/i.test(token || '')
  const initialOrder = tokenIsValid ? location.state?.order || null : null
  const [order, setOrder] = useState(initialOrder)
  const [loading, setLoading] = useState(tokenIsValid && !initialOrder)
  const [error, setError] = useState(
    tokenIsValid ? '' : 'This secure order confirmation link is invalid or unavailable.',
  )

  useEffect(() => {
    if (!tokenIsValid) {
      showError('Order Confirmation Unavailable', 'This secure order confirmation link is invalid or unavailable.')
      return undefined
    }

    const controller = new AbortController()
    getGuestOrder(token, controller.signal)
      .then((payload) => {
        if (!payload?.order?.order_number) {
          throw new Error('The order confirmation response was incomplete.')
        }
        setOrder(payload.order)
        setError('')
      })
      .catch((requestError) => {
        if (requestError?.name !== 'AbortError') {
          setOrder(null)
          setError('This secure order confirmation link is invalid or unavailable.')
          showError('Order Confirmation Unavailable', 'This secure order confirmation link is invalid or unavailable.')
        }
      })
      .finally(() => {
        if (!controller.signal.aborted) setLoading(false)
      })

    return () => controller.abort()
  }, [showError, token, tokenIsValid])

  if (loading) {
    return (
      <SiteLayout>
        <main className="checkout-page">
          <div className="checkout-page__route-status" role="status" aria-live="polite">
            Loading your secure order confirmation…
          </div>
        </main>
      </SiteLayout>
    )
  }

  if (!order) {
    return (
      <SiteLayout>
        <main className="checkout-page">
          <div className="checkout-page__container">
            <section className="checkout-page__state checkout-page__state--error">
              <h1>Order confirmation unavailable</h1>
              <p>{error}</p>
              <Link to="/">Continue Shopping</Link>
            </section>
          </div>
        </main>
      </SiteLayout>
    )
  }

  const delivery = order.delivery_address || {}

  return (
    <SiteLayout>
      <main className="checkout-page">
        <div className="checkout-page__container checkout-page__confirmation-page">
          <header className="checkout-page__confirmation-hero">
            <span aria-hidden="true">✓</span>
            <div>
              <p>Thank you for your order</p>
              <h1>Order placed successfully</h1>
              <p>
                A confirmation will be sent to your email when email notifications are enabled.
              </p>
            </div>
          </header>

          <div className="checkout-page__confirmation-grid">
            <section className="checkout-page__card" aria-labelledby="confirmation-order-title">
              <h2 id="confirmation-order-title">Order {order.order_number}</h2>
              <dl className="checkout-page__details-list">
                <div><dt>Customer email</dt><dd>{order.customer_email}</dd></div>
                <div><dt>Order date</dt><dd>{formatDate(order.placed_at || order.created_at)}</dd></div>
                <div><dt>Payment status</dt><dd>Pending</dd></div>
                <div><dt>Order status</dt><dd>Pending</dd></div>
                <div>
                  <dt>Intended payment method</dt>
                  <dd>{PAYMENT_LABELS[order.payment_method] || order.payment_method}</dd>
                </div>
              </dl>

              <h3>Ordered products</h3>
              <ul className="checkout-page__review-list">
                {(order.items || []).map((item) => (
                  <li key={`${item.product_id}-${item.product_name}`}>
                    <div className="checkout-page__review-image">
                      {item.product_image
                        ? <img src={resolveApiImageUrl(item.product_image)} alt="" />
                        : <span aria-hidden="true">BSS</span>}
                    </div>
                    <div>
                      <strong>{item.product_name}</strong>
                      <span>Quantity: {item.quantity} · {formatKes(item.unit_price)} each</span>
                    </div>
                    <strong>{formatKes(item.line_total)}</strong>
                  </li>
                ))}
              </ul>

              <dl className="checkout-page__totals">
                <div><dt>Subtotal</dt><dd>{formatKes(order.subtotal)}</dd></div>
                <div><dt>Delivery</dt><dd>Pending confirmation</dd></div>
                <div><dt>Estimated total</dt><dd>{formatKes(order.total)}</dd></div>
              </dl>
            </section>

            <aside className="checkout-page__card">
              <h2>Delivery address</h2>
              <address>
                <strong>{delivery.first_name} {delivery.last_name}</strong>
                <span>{delivery.street_address}</span>
                {delivery.building_details && <span>{delivery.building_details}</span>}
                <span>{delivery.city}, {delivery.county}</span>
                {delivery.postal_code && <span>{delivery.postal_code}</span>}
                <span>Kenya</span>
                <span>{delivery.phone}</span>
              </address>
              {delivery.delivery_instructions && (
                <>
                  <h3>Order notes</h3>
                  <p>{delivery.delivery_instructions}</p>
                </>
              )}
            </aside>
          </div>

          <section className="checkout-page__account-invitation">
            <div>
              <h2>Create an account for next time</h2>
              <p>Create an account to track this order, save your address, and check out faster next time.</p>
            </div>
            <div>
              <Link className="checkout-page__secondary-action" to="/">Continue Shopping</Link>
              <Link className="checkout-page__primary-action" to="/register">Create Account</Link>
            </div>
          </section>
        </div>
      </main>
    </SiteLayout>
  )
}

export default GuestOrderConfirmationPage
