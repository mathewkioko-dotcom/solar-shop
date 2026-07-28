import { memo, useState } from 'react'
import { Link } from 'react-router-dom'
import trashIcon from '../../assets/icons/actions/trash-2.svg'
import shoppingBagIcon from '../../assets/icons/ecommerce/shopping-bag.svg'
import wishlistIcon from '../../assets/icons/ecommerce/wishlist.svg'
import { useCart } from '../../hooks/useCart'
import { useWishlist } from '../../hooks/useWishlist'
import { useToast } from '../../hooks/useToast'
import SvgIcon from '../ui/SvgIcon'

const formatPrice = (price) => (
  `KSh ${new Intl.NumberFormat('en-KE', {
    maximumFractionDigits: 0,
  }).format(price)}`
)

function WishlistItem({ item }) {
  const { addItem: addCartItem, getItemQuantity } = useCart()
  const { removeItem } = useWishlist()
  const { showError, showSuccess } = useToast()
  const [imageFailed, setImageFailed] = useState(false)
  const productPath = `/products/${encodeURIComponent(item.slug)}`
  const cartQuantity = getItemQuantity(item.id)
  const quantityLimit = item.stock === null ? 99 : item.stock
  const isOutOfStock = item.stock !== null && item.stock <= 0
  const hasReachedCartLimit = cartQuantity >= quantityLimit
  const cannotAddToCart = isOutOfStock || hasReachedCartLimit
  const stockLabel = isOutOfStock
    ? 'Out of stock'
    : item.stock === null
      ? 'Availability on request'
      : `${item.stock} in stock`

  const addToCart = () => {
    if (cannotAddToCart) return

    const wasAdded = addCartItem(item, 1)
    if (wasAdded) showSuccess('Added to Cart', `${item.name} added to your cart.`)
    else showError('Cart Update Failed', 'This product could not be added to the cart.')
  }

  return (
    <li className="wishlist-page__item">
      <article className="wishlist-page__card">
        <div className="wishlist-page__image-area">
          {item.imageUrl && !imageFailed ? (
            <Link to={productPath} aria-label={`View ${item.name}`}>
              <img
                src={item.imageUrl}
                alt={`${item.name} product`}
                loading="lazy"
                onError={() => setImageFailed(true)}
              />
            </Link>
          ) : (
            <div className="wishlist-page__image-placeholder" role="img" aria-label={`${item.name} image unavailable`}>
              <SvgIcon src={wishlistIcon} size={32} />
              <span>Baraka Solar Shop</span>
            </div>
          )}
        </div>

        <div className="wishlist-page__card-content">
          <p className="wishlist-page__category">{item.categoryName || 'Solar equipment'}</p>
          <h2><Link to={productPath}>{item.name}</Link></h2>
          <strong className="wishlist-page__price">{formatPrice(item.price)}</strong>
          <p className={`wishlist-page__stock${isOutOfStock ? ' wishlist-page__stock--unavailable' : ''}`}>
            {stockLabel}
          </p>

          <div className="wishlist-page__card-actions">
            <Link to={productPath}>View Product</Link>
            <button
              className="wishlist-page__add-cart"
              type="button"
              disabled={cannotAddToCart}
              aria-label={`Add ${item.name} to cart`}
              onClick={addToCart}
            >
              <SvgIcon src={shoppingBagIcon} size={18} />
              {hasReachedCartLimit && !isOutOfStock ? 'Cart limit reached' : 'Add to Cart'}
            </button>
          </div>

          <button
            className="wishlist-page__remove"
            type="button"
            aria-label={`Remove ${item.name} from wishlist`}
            onClick={() => {
              removeItem(item.id)
              showSuccess('Removed from Wishlist', `${item.name} was removed from your wishlist.`)
            }}
          >
            <SvgIcon src={trashIcon} size={17} />
            Remove from Wishlist
          </button>
        </div>
      </article>
    </li>
  )
}

export default memo(WishlistItem)
