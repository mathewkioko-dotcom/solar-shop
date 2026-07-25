import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useCart } from '../../hooks/useCart'

const formatPrice = (price) => (
  `KSh ${new Intl.NumberFormat('en-KE', {
    maximumFractionDigits: 0,
  }).format(price)}`
)

function CartSummary() {
  const navigate = useNavigate()
  const { clearCart, itemCount, items, subtotal } = useCart()
  const [isConfirmingClear, setIsConfirmingClear] = useState(false)
  const isEmpty = items.length === 0

  const proceedToCheckout = () => {
    // TODO: Replace this cart destination when the checkout integration is implemented.
    navigate('/cart')
  }

  const confirmClearCart = () => {
    clearCart()
    setIsConfirmingClear(false)
  }

  return (
    <aside className="cart-page__summary" aria-labelledby="cart-summary-title">
      <h2 id="cart-summary-title">Order summary</h2>

      <dl>
        <div>
          <dt>Total items</dt>
          <dd>{itemCount}</dd>
        </div>
        <div>
          <dt>Subtotal</dt>
          <dd>{formatPrice(subtotal)}</dd>
        </div>
        <div>
          <dt>Delivery</dt>
          <dd>Calculated at checkout</dd>
        </div>
        <div>
          <dt>Tax</dt>
          <dd>Calculated at checkout</dd>
        </div>
        <div className="cart-page__estimated-total">
          <dt>Estimated total</dt>
          <dd>{formatPrice(subtotal)}</dd>
        </div>
      </dl>

      <button
        className="cart-page__checkout"
        type="button"
        disabled={isEmpty}
        onClick={proceedToCheckout}
      >
        Proceed to Checkout
      </button>

      <Link className="cart-page__continue" to="/products">
        Continue Shopping
      </Link>

      {!isEmpty && (
        <div className="cart-page__clear">
          {!isConfirmingClear ? (
            <button type="button" onClick={() => setIsConfirmingClear(true)}>
              Clear Cart
            </button>
          ) : (
            <div className="cart-page__clear-confirmation" role="group" aria-label="Confirm clear cart">
              <p>Remove every item from your cart?</p>
              <div>
                <button type="button" onClick={confirmClearCart}>Yes, clear cart</button>
                <button type="button" onClick={() => setIsConfirmingClear(false)}>Cancel</button>
              </div>
            </div>
          )}
        </div>
      )}
    </aside>
  )
}

export default CartSummary

