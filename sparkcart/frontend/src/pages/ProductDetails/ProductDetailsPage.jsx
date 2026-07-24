import { useEffect, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import SiteLayout from '../../layouts/SiteLayout'
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

function ProductImage({ product }) {
  const [imageFailed, setImageFailed] = useState(false)

  if (!product.mainImageUrl || imageFailed) {
    return (
      <div className="product-details-page__image-placeholder" role="img" aria-label={`${product.name} image unavailable`}>
        <span>Image unavailable</span>
        <small>Baraka Solar Shop</small>
      </div>
    )
  }

  return (
    <img
      className="product-details-page__image"
      src={product.mainImageUrl}
      alt={`${product.name} product image`}
      onError={() => setImageFailed(true)}
    />
  )
}

function ProductState({ type, message, onRetry }) {
  const isNotFound = type === 'not-found'

  return (
    <section className="product-details-page__state" aria-live="polite" aria-labelledby="product-state-title">
      <p className="product-details-page__eyebrow">{isNotFound ? 'Product unavailable' : 'Something went wrong'}</p>
      <h1 id="product-state-title">{isNotFound ? 'Product Not Found' : 'We could not load this product'}</h1>
      <p>{message}</p>
      <div className="product-details-page__state-actions">
        {!isNotFound && <button type="button" onClick={onRetry}>Try again</button>}
        <Link className="product-details-page__primary-link" to="/">Return to homepage</Link>
      </div>
    </section>
  )
}

function ProductDetailsPage() {
  const { slug } = useParams()
  const [requestState, setRequestState] = useState({
    key: '',
    status: 'loading',
    product: null,
    errorMessage: '',
  })
  const [retryCount, setRetryCount] = useState(0)
  const requestKey = `${slug || ''}:${retryCount}`
  const isCurrentRequest = requestState.key === requestKey
  const status = isCurrentRequest ? requestState.status : 'loading'
  const product = isCurrentRequest ? requestState.product : null
  const errorMessage = isCurrentRequest ? requestState.errorMessage : ''

  useEffect(() => {
    const controller = new AbortController()
    let active = true

    window.scrollTo({ top: 0, behavior: 'auto' })

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
        if (!active || error.name === 'AbortError') return
        setRequestState({
          key: requestKey,
          status: error.status === 404 ? 'not-found' : 'error',
          product: null,
          errorMessage: error.message,
        })
      })

    return () => {
      active = false
      controller.abort()
    }
  }, [slug, requestKey])

  const categoryName = product?.categoryName || 'Solar equipment'
  const stockLabel = product?.stock === null
    ? 'Availability on request'
    : product.stock > 0
      ? `${product.stock} in stock`
      : 'Currently out of stock'

  return (
    <SiteLayout>
      <main className="product-details-page">
        {status === 'loading' && (
          <section className="product-details-page__state" role="status" aria-live="polite">
            <div className="product-details-page__loading-mark" aria-hidden="true" />
            <h1>Loading product</h1>
            <p>Please wait while we retrieve the latest product information.</p>
          </section>
        )}

        {status === 'not-found' && (
          <ProductState type="not-found" message="The requested product does not exist or is no longer available." />
        )}

        {status === 'error' && (
          <ProductState
            type="error"
            message={errorMessage || 'Please check your connection and try again.'}
            onRetry={() => setRetryCount((count) => count + 1)}
          />
        )}

        {status === 'success' && product && (
          <div className="product-details-page__container">
            <nav className="product-details-page__breadcrumbs" aria-label="Breadcrumb">
              <ol>
                <li><Link to="/">Home</Link></li>
                <li><span>{categoryName}</span></li>
                <li aria-current="page"><span>{product.name}</span></li>
              </ol>
            </nav>

            <section className="product-details-page__overview" aria-labelledby="product-title">
              <div className="product-details-page__media">
                <ProductImage key={product.mainImageUrl || product.id || product.slug} product={product} />
              </div>

              <div className="product-details-page__summary">
                <p className="product-details-page__category">{categoryName}</p>
                {product.brandName && <p className="product-details-page__brand">Brand: {product.brandName}</p>}
                <h1 id="product-title">{product.name}</h1>
                {product.sku && <p className="product-details-page__sku">SKU: {product.sku}</p>}
                <p className="product-details-page__price">{formatPrice(product.price)}</p>
                <p className={`product-details-page__stock ${product.stock === 0 ? 'product-details-page__stock--unavailable' : ''}`}>
                  <span aria-hidden="true" />
                  {stockLabel}
                </p>
                {product.shortDescription && <p className="product-details-page__short-description">{product.shortDescription}</p>}

                {/* TODO: Connect these disabled controls to cart, checkout, and wishlist services in a future phase. */}
                <div className="product-details-page__actions" aria-label="Product actions coming soon">
                  <button type="button" disabled>Add to Cart</button>
                  <button type="button" disabled>Buy Now</button>
                  <button type="button" disabled>Wishlist</button>
                </div>
                <p className="product-details-page__action-note">Online purchasing actions will be available soon.</p>
              </div>
            </section>

            <section className="product-details-page__description" aria-labelledby="product-description-title">
              <div>
                <p className="product-details-page__eyebrow">Product overview</p>
                <h2 id="product-description-title">Description</h2>
                <p>{product.description || 'A detailed product description is not available yet.'}</p>
              </div>
              <aside className="product-details-page__specification-note" aria-labelledby="specifications-title">
                <p className="product-details-page__eyebrow">Technical details</p>
                <h2 id="specifications-title">Specifications</h2>
                <p>Product specifications will appear here when verified information is available.</p>
              </aside>
            </section>
          </div>
        )}
      </main>
    </SiteLayout>
  )
}

export default ProductDetailsPage
