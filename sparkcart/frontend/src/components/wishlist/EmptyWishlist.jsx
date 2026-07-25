import { Link } from 'react-router-dom'
import wishlistIcon from '../../assets/icons/ecommerce/wishlist.svg'
import SvgIcon from '../ui/SvgIcon'

function EmptyWishlist() {
  return (
    <section className="wishlist-page__empty" aria-labelledby="empty-wishlist-title">
      <span className="wishlist-page__empty-icon" aria-hidden="true">
        <SvgIcon src={wishlistIcon} size={40} />
      </span>
      <h2 id="empty-wishlist-title">Your wishlist is empty</h2>
      <p>Save products you are interested in and return to them later.</p>
      <Link to="/products">Browse Products</Link>
    </section>
  )
}

export default EmptyWishlist

