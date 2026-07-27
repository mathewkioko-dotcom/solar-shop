import { formatKes } from '../../utils/formatCurrency'

function CheckoutOrderReview({ items, subtotal }) {
  return (
    <section className="checkout-page__card" aria-labelledby="checkout-review-title">
      <div className="checkout-page__section-heading">
        <span aria-hidden="true">✓</span>
        <div>
          <p>Review your basket</p>
          <h2 id="checkout-review-title">Your Order</h2>
        </div>
      </div>
      <ul className="checkout-page__review-list">
        {items.map((item) => (
          <li key={item.id}>
            <div className="checkout-page__review-image">
              {item.imageUrl ? <img src={item.imageUrl} alt="" /> : <span aria-hidden="true">BSS</span>}
            </div>
            <div>
              <strong>{item.name}</strong>
              <span>Quantity: {item.quantity} · Unit price: {formatKes(item.price)}</span>
            </div>
            <strong>{formatKes(item.price * item.quantity)}</strong>
          </li>
        ))}
      </ul>
      <dl className="checkout-page__totals">
        <div><dt>Subtotal</dt><dd>{formatKes(subtotal)}</dd></div>
        <div><dt>Delivery</dt><dd>To be confirmed</dd></div>
        <div><dt>Tax</dt><dd>Included where applicable</dd></div>
        <div><dt>Estimated Total</dt><dd>{formatKes(subtotal)}</dd></div>
      </dl>
    </section>
  )
}

export default CheckoutOrderReview
