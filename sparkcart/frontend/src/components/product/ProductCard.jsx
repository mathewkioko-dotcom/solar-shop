import { memo, useState } from 'react'
import { Link } from 'react-router-dom'
import shoppingBagIcon from '../../assets/icons/ecommerce/shopping-bag.svg'
import wishlistIcon from '../../assets/icons/ecommerce/wishlist.svg'
import { useCart } from '../../hooks/useCart'
import { useWishlist } from '../../hooks/useWishlist'
import { useToast } from '../../hooks/useToast'
import SvgIcon from '../ui/SvgIcon'

const formatPrice = (price) => {
  if (!Number.isFinite(price)) return 'Contact for pricing'

  return new Intl.NumberFormat('en-KE', {
    style: 'currency',
    currency: 'KES',
    maximumFractionDigits: 0,
  }).format(price)
}

function ProductCard({ product }) {
  const { addItem } = useCart()
  const { isWishlisted, toggleItem } = useWishlist()
  const { showError, showSuccess } = useToast()
  const [imageFailed, setImageFailed] = useState(false)
  const stockLabel = product.stock === null
    ? 'Availability on request'
    : product.stock > 0
      ? 'In stock'
      : 'Out of stock'
  const isUnavailable = product.stock !== null && product.stock <= 0
  const isProductWishlisted = isWishlisted(product.id)

  return (
    <li className="product-details-page__related-item">
      <article className="product-details-page__related-card">
        <button
          className={`product-details-page__related-wishlist${isProductWishlisted ? ' product-details-page__related-wishlist--active' : ''}`}
          type="button"
          aria-pressed={isProductWishlisted}
          aria-label={`${isProductWishlisted ? 'Remove' : 'Add'} ${product.name} ${isProductWishlisted ? 'from' : 'to'} wishlist`}
          onClick={(event) => {
            event.stopPropagation()
            const wasWishlisted = isProductWishlisted
            if (toggleItem(product)) {
              showSuccess(
                wasWishlisted ? 'Removed from Wishlist' : 'Added to Wishlist',
                `${product.name} was ${wasWishlisted ? 'removed from' : 'saved to'} your wishlist.`,
              )
            }
          }}
        >
          <SvgIcon src={wishlistIcon} size={19} />
        </button>
        <Link
          className="product-details-page__related-link"
          to={`/products/${encodeURIComponent(product.slug)}`}
          aria-label={`View ${product.name}`}
        >
          <div className="product-details-page__related-image-area">
            {product.mainImageUrl && !imageFailed ? (
              <img
                className="product-details-page__related-image"
                src={product.mainImageUrl}
                alt={`${product.name} product image`}
                loading="lazy"
                onError={() => setImageFailed(true)}
              />
            ) : (
              <div
                className="product-details-page__related-placeholder"
                role="img"
                aria-label={`${product.name} image unavailable`}
              >
                <span>Image unavailable</span>
              </div>
            )}
          </div>

          <div className="product-details-page__related-content">
            <p className="product-details-page__related-category">
              {product.categoryName || 'Solar equipment'}
            </p>
            <h3>{product.name}</h3>
            <div className="product-details-page__related-meta">
              <strong>{formatPrice(product.price)}</strong>
              <span className={isUnavailable ? 'product-details-page__related-stock--unavailable' : ''}>
                {stockLabel}
              </span>
            </div>
          </div>
        </Link>
        <button
          className="product-details-page__related-add"
          type="button"
          aria-label={`Add ${product.name} to cart`}
          disabled={isUnavailable}
          onClick={(event) => {
            event.stopPropagation()
            if (addItem(product, 1)) showSuccess('Added to Cart', `${product.name} added to your cart.`)
            else showError('Cart Update Failed', 'This product could not be added to the cart.')
          }}
        >
          <SvgIcon src={shoppingBagIcon} size={18} />
          Add to Cart
        </button>
      </article>
    </li>
  )
}

export default memo(ProductCard)
