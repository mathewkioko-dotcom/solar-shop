import { Link } from 'react-router-dom'
import shoppingBagIcon from '../../assets/icons/ecommerce/shopping-bag.svg'
import SvgIcon from '../ui/SvgIcon'

function EmptyCart() {
  return (
    <section className="cart-page__empty" aria-labelledby="empty-cart-title">
      <span className="cart-page__empty-icon" aria-hidden="true">
        <SvgIcon src={shoppingBagIcon} size={38} />
      </span>
      <h2 id="empty-cart-title">Your cart is empty</h2>
      <p>Add products to your cart to see them here.</p>
      <Link to="/products">Browse Products</Link>
    </section>
  )
}

export default EmptyCart

