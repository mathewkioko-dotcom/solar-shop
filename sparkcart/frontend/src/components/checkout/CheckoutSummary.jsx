import { Link } from 'react-router-dom'
import CheckoutDeliveryMethod from './CheckoutDeliveryMethod'
import CheckoutOrderReview from './CheckoutOrderReview'
import CheckoutPaymentMethod from './CheckoutPaymentMethod'

function CheckoutSummary({
  items,
  subtotal,
  deliveryMethod,
  paymentMethod,
  legalAccepted,
  legalError,
  sessionLoading,
  submitting,
  onDeliveryChange,
  onPaymentChange,
  onLegalChange,
}) {
  return (
    <aside className="checkout-page__sidebar" aria-label="Order placement">
      <CheckoutOrderReview items={items} subtotal={subtotal} />
      <CheckoutDeliveryMethod value={deliveryMethod} onChange={onDeliveryChange} />
      <CheckoutPaymentMethod value={paymentMethod} onChange={onPaymentChange} />

      <section className="checkout-page__card checkout-page__legal" aria-labelledby="checkout-legal-title">
        <h2 id="checkout-legal-title">Privacy &amp; Terms</h2>
        <label className="checkout-page__legal-agreement">
          <input
            type="checkbox"
            required
            checked={legalAccepted}
            aria-invalid={Boolean(legalError)}
            aria-describedby={legalError ? 'checkout-legal-error' : 'checkout-legal-hint'}
            onChange={onLegalChange}
          />
          <span>
            I have read and agree to the{' '}
            <Link to="/privacy-policy" target="_blank" rel="noreferrer">Privacy Policy</Link>
            {' '}and{' '}
            <Link to="/terms-and-conditions" target="_blank" rel="noreferrer">
              Terms &amp; Conditions
            </Link>.
          </span>
        </label>
        {legalError ? (
          <p id="checkout-legal-error" className="checkout-page__legal-error">
            {legalError}
          </p>
        ) : (
          <p id="checkout-legal-hint" className="checkout-page__hint">
            Required before your order can be placed.
          </p>
        )}
        <button
          className="checkout-page__place-order"
          type="submit"
          disabled={sessionLoading || submitting || !legalAccepted}
        >
          {submitting ? 'Placing Your Order…' : 'Place Your Order'}
        </button>
        <small>Prices, stock, and totals are verified securely before your order is created.</small>
      </section>
    </aside>
  )
}

export default CheckoutSummary
