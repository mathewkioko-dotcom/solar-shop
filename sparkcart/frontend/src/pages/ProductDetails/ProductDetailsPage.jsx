import { useEffect, useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import SiteLayout from '../../layouts/SiteLayout'
import ProductGallery from '../../components/product/ProductGallery'
import ProductSpecifications from '../../components/product/ProductSpecifications'
import RelatedProducts from '../../components/product/RelatedProducts'
import { useCart } from '../../hooks/useCart'
import { useWishlist } from '../../hooks/useWishlist'
import { useToast } from '../../hooks/useToast'
import { getProductBySlug } from '../../services/productService'
import '../../styles/product-details.css'

const formatPrice = (price) => {
  if (!Number.isFinite(price)) return 'Contact us for pricing'

  return new Intl.NumberFormat('en-KE', {
    style: 'currency',
    currency: 'KES',
    maximumFractionDigits: 0,
  }).format(price)
}

const getStockLabel = (product) => {
  if (!product) return ''
  if (product.stock === null) return 'Availability on request'
  if (product.stock > 0) return `${product.stock} in stock`
  return 'Currently out of stock'
}

function ProductState({ type, message, onRetry }) {
  const isNotFound = type === 'not-found'

  return (
    <section
      className="product-details-page__state"
      aria-live="polite"
      aria-labelledby="product-state-title"
    >
      <p className="product-details-page__eyebrow">
        {isNotFound ? 'Product unavailable' : 'Something went wrong'}
      </p>

      <h1 id="product-state-title">
        {isNotFound ? 'Product Not Found' : 'We could not load this product'}
      </h1>

      <p>{message}</p>

      <div className="product-details-page__state-actions">
        {!isNotFound && (
          <button type="button" onClick={onRetry}>
            Try again
          </button>
        )}

        <Link className="product-details-page__primary-link" to="/">
          Return to homepage
        </Link>
      </div>
    </section>
  )
}

function PurchaseArea({ product }) {
  const navigate = useNavigate()
  const { addItem, getItemQuantity } = useCart()
  const { isWishlisted, toggleItem } = useWishlist()
  const { showError, showSuccess, showWarning } = useToast()
  const [quantity, setQuantity] = useState(1)
  const isProductWishlisted = isWishlisted(product.id)

  const isOutOfStock =
    Number.isFinite(product.stock) && product.stock <= 0

  const quantityLimit =
    Number.isFinite(product.stock) ? Math.max(0, Math.floor(product.stock)) : 99

  const hasReachedStockLimit =
    quantity >= quantityLimit

  const increaseQuantity = () => {
    if (hasReachedStockLimit || isOutOfStock) return
    setQuantity((currentQuantity) => currentQuantity + 1)
  }

  const decreaseQuantity = () => {
    setQuantity((currentQuantity) => Math.max(1, currentQuantity - 1))
  }

  const addSelectedQuantity = () => {
    const currentCartQuantity = getItemQuantity(product.id)
    const remainingQuantity = Math.max(0, quantityLimit - currentCartQuantity)
    const quantityToAdd = Math.min(quantity, remainingQuantity)

    if (isOutOfStock || quantityToAdd < 1) {
      showWarning('Cart Limit Reached', 'Maximum available quantity is already in your cart.')
      return false
    }

    const wasAdded = addItem(product, quantityToAdd)
    if (wasAdded) showSuccess('Added to Cart', `${quantityToAdd} × ${product.name} added to your cart.`)
    else showError('Cart Update Failed', 'This product could not be added to the cart.')
    return wasAdded
  }

  const toggleWishlist = () => {
    const wasWishlisted = isProductWishlisted
    if (!toggleItem(product)) return

    showSuccess(
      wasWishlisted ? 'Removed from Wishlist' : 'Added to Wishlist',
      `${product.name} was ${wasWishlisted ? 'removed from' : 'saved to'} your wishlist.`,
    )
  }

  return (
    <div
      className="product-details-page__purchase"
      aria-labelledby="purchase-options-title"
    >
      <h2 id="purchase-options-title">Purchase options</h2>

      <div className="product-details-page__purchase-row">
        <div className="product-details-page__quantity">
          <span className="product-details-page__quantity-label">
            Quantity
          </span>

          <div className="product-details-page__quantity-controls">
            <button
              type="button"
              aria-label="Decrease quantity"
              disabled={isOutOfStock || quantity <= 1}
              onClick={decreaseQuantity}
            >
              −
            </button>

            <output
              aria-live="polite"
              aria-label={`Quantity: ${quantity}`}
            >
              {quantity}
            </output>

            <button
              type="button"
              aria-label="Increase quantity"
              disabled={isOutOfStock || hasReachedStockLimit}
              onClick={increaseQuantity}
            >
              +
            </button>
          </div>
        </div>

        <p className="product-details-page__purchase-status">
          {isOutOfStock
            ? 'Purchasing is unavailable while this item is out of stock.'
            : `Select up to ${quantityLimit} units, subject to current availability.`}
        </p>
      </div>

      <div className="product-details-page__actions">
        <button
          className="product-details-page__add-button"
          type="button"
          disabled={isOutOfStock}
          onClick={addSelectedQuantity}
        >
          Add to Cart
        </button>

        <button
          className="product-details-page__buy-button"
          type="button"
          disabled={isOutOfStock}
          onClick={() => {
            if (addSelectedQuantity()) navigate('/cart')
          }}
        >
          Buy Now
        </button>

        <button
          className={`product-details-page__wishlist-button${isProductWishlisted ? ' product-details-page__wishlist-button--active' : ''}`}
          type="button"
          aria-pressed={isProductWishlisted}
          onClick={toggleWishlist}
        >
          {isProductWishlisted ? 'Remove from Wishlist' : 'Add to Wishlist'}
        </button>
      </div>
    </div>
  )
}

function ProductDetailsPage() {
  const { slug } = useParams()
  const { showError } = useToast()

  const [requestState, setRequestState] = useState({
    key: '',
    status: 'loading',
    product: null,
    errorMessage: '',
  })

  const [retryCount, setRetryCount] = useState(0)

  const requestKey = `${slug || ''}:${retryCount}`
  const isCurrentRequest = requestState.key === requestKey

  const status = isCurrentRequest
    ? requestState.status
    : 'loading'

  const product = isCurrentRequest
    ? requestState.product
    : null

  const errorMessage = isCurrentRequest
    ? requestState.errorMessage
    : ''

  useEffect(() => {
    const controller = new AbortController()
    let active = true

    getProductBySlug(slug, controller.signal)
      .then((nextProduct) => {
        if (!active) return

        setRequestState({
          key: requestKey,
          status: 'success',
          product: nextProduct,
          errorMessage: '',
        })
      })
      .catch((error) => {
        if (
          !active ||
          error?.name === 'AbortError'
        ) {
          return
        }

        showError(
          error?.status === 404 ? 'Product Not Found' : 'Product Unavailable',
          error?.message || 'Unable to connect to the server. Please try again.',
        )
        setRequestState({
          key: requestKey,
          status: error?.status === 404 ? 'not-found' : 'error',
          product: null,
          errorMessage: error?.message ||
            'The product could not be loaded. Please try again.',
        })
      })

    return () => {
      active = false
      controller.abort()
    }
  }, [slug, requestKey, showError])

  const categoryName =
    product?.categoryName || 'Solar equipment'

  const stockLabel = getStockLabel(product)

  const isProductUnavailable =
    product &&
    product.stock !== null &&
    Number(product.stock) <= 0

  return (
    <SiteLayout>
      <main className="product-details-page">
        {status === 'loading' && (
          <section
            className="product-details-page__state"
            role="status"
            aria-live="polite"
          >
            <div
              className="product-details-page__loading-mark"
              aria-hidden="true"
            />

            <h1>Loading product</h1>

            <p>
              Please wait while we retrieve the latest product information.
            </p>
          </section>
        )}

        {status === 'not-found' && (
          <ProductState
            type="not-found"
            message="The requested product does not exist or is no longer available."
          />
        )}

        {status === 'error' && (
          <ProductState
            type="error"
            message={
              errorMessage ||
              'Please check your connection and try again.'
            }
            onRetry={() => {
              setRetryCount((count) => count + 1)
            }}
          />
        )}

        {status === 'success' && product && (
          <div className="product-details-page__container">
            <section
              className="product-details-page__overview"
              aria-labelledby="product-title"
            >
              <div className="product-details-page__media">
                <ProductGallery
                  key={product.id || product.slug || product.name}
                  images={product.images}
                  productName={product.name}
                />
              </div>

              <div className="product-details-page__summary">
                <nav
                  className="product-details-page__breadcrumbs"
                  aria-label="Breadcrumb"
                >
                  <ol>
                    <li>
                      <Link to="/">Home</Link>
                    </li>

                    <li>
                      <span>{categoryName}</span>
                    </li>

                    <li aria-current="page">
                      <span>{product.name}</span>
                    </li>
                  </ol>
                </nav>

                {product.brandName && (
                  <p className="product-details-page__brand">
                    Brand: {product.brandName}
                  </p>
                )}

                <p className="product-details-page__category">
                  {categoryName}
                </p>

                <h1 id="product-title">
                  {product.name}
                </h1>

                {product.sku && (
                  <p className="product-details-page__sku">
                    SKU: {product.sku}
                  </p>
                )}

                <p
                  className={`product-details-page__stock ${
                    isProductUnavailable
                      ? 'product-details-page__stock--unavailable'
                      : ''
                  }`}
                >
                  {stockLabel}
                </p>

                <div className="product-details-page__pricing">
                  <p className="product-details-page__price">
                    {formatPrice(product.price)}
                  </p>

                  {Number.isFinite(product.price) &&
                    Number.isFinite(product.compareAtPrice) &&
                    product.compareAtPrice > product.price && (
                      <del className="product-details-page__compare-price">
                        {formatPrice(product.compareAtPrice)}
                      </del>
                    )}
                </div>

                {product.shortDescription && (
                  <p className="product-details-page__short-description">
                    {product.shortDescription}
                  </p>
                )}

                <PurchaseArea
                  key={product.id || product.slug}
                  product={product}
                />
              </div>
            </section>

            <section
              className="product-details-page__information"
              aria-label="Product information"
            >
              <article
                className="product-details-page__description"
                aria-labelledby="product-description-title"
              >
                <p className="product-details-page__eyebrow">
                  Product overview
                </p>

                <h2 id="product-description-title">
                  Full Description
                </h2>

                <p>
                  {product.description ||
                    'Information will be available soon.'}
                </p>
              </article>

              <ProductSpecifications product={product} />

              <article
                className="product-details-page__information-card"
                aria-labelledby="delivery-information-title"
              >
                <p className="product-details-page__eyebrow">
                  Fulfilment
                </p>

                <h2 id="delivery-information-title">
                  Delivery Information
                </h2>

                <p>
                  {product.deliveryInformation ||
                    'Information will be available soon.'}
                </p>
              </article>

              <article
                className="product-details-page__information-card"
                aria-labelledby="warranty-information-title"
              >
                <p className="product-details-page__eyebrow">
                  Product protection
                </p>

                <h2 id="warranty-information-title">
                  Warranty Information
                </h2>

                <p>
                  {product.warranty ||
                    'Information will be available soon.'}
                </p>
              </article>
            </section>

            <RelatedProducts currentProduct={product} />
          </div>
        )}
      </main>
    </SiteLayout>
  )
}

export default ProductDetailsPage
