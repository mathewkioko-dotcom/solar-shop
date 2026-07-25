import { memo, useState } from 'react'
import { Link } from 'react-router-dom'
import shoppingBagIcon from '../../assets/icons/ecommerce/shopping-bag.svg'
import { useCart } from '../../hooks/useCart'
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
  const [imageFailed, setImageFailed] = useState(false)
  const stockLabel = product.stock === null
    ? 'Availability on request'
    : product.stock > 0
      ? 'In stock'
      : 'Out of stock'
  const isUnavailable = product.stock !== null && product.stock <= 0

  return (
    <li className="product-details-page__related-item">
      <article className="product-details-page__related-card">
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
            addItem(product, 1)
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
