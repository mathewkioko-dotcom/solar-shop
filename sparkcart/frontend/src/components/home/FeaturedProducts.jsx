import { useEffect, useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import solarPanelsIcon from '../../assets/icons/categories/solar-panels.svg'
import shoppingBagIcon from '../../assets/icons/ecommerce/shopping-bag.svg'
import starIcon from '../../assets/icons/ecommerce/star.svg'
import wishlistIcon from '../../assets/icons/ecommerce/wishlist.svg'
import arrowRightIcon from '../../assets/icons/navigation/arrow-right.svg'
import { useWishlist } from '../../hooks/useWishlist'
import { getProducts } from '../../services/productService'
import SvgIcon from '../ui/SvgIcon'

const formatPrice = (value) => {
  const number = Number(value)
  return Number.isNaN(number)
    ? 'Contact for price'
    : new Intl.NumberFormat('en-KE', {
      style: 'currency',
      currency: 'KES',
      maximumFractionDigits: 0,
    }).format(number)
}

function FeaturedProducts({ searchTerm }) {
  const { isWishlisted, toggleItem } = useWishlist()
  const [products, setProducts] = useState([])
  const [loadingProducts, setLoadingProducts] = useState(true)
  const [productError, setProductError] = useState('')

  useEffect(() => {
    const controller = new AbortController()

    getProducts({ limit: 8 }, controller.signal)
      .then((nextProducts) => {
        setProducts(nextProducts)
        setProductError('')
      })
      .catch((error) => {
        if (error?.name !== 'AbortError') {
          setProductError(error?.message || 'Products could not be loaded.')
        }
      })
      .finally(() => {
        if (!controller.signal.aborted) setLoadingProducts(false)
      })

    return () => controller.abort()
  }, [])

  const featuredProducts = useMemo(() => {
    const query = searchTerm.trim().toLowerCase()
    if (!query) return products

    return products.filter((product) => (
      [
        product.name,
        product.description,
        product.brandName,
        product.categoryName,
        product.slug,
      ]
        .filter(Boolean)
        .some((value) => String(value).toLowerCase().includes(query))
    ))
  }, [products, searchTerm])

  return (
    <section id="featured-products" className="products-section">
      <div className="container">
        <div className="section-heading heading-with-action">
          <div>
            <p>Featured products</p>
            <h2>{searchTerm ? `Search results for “${searchTerm}”` : 'Popular solar products'}</h2>
            <span>Carefully selected products from trusted manufacturers.</span>
          </div>
          <Link className="text-button" to="/products">
            View all products <SvgIcon src={arrowRightIcon} size={16} />
          </Link>
        </div>

        {loadingProducts && (
          <div className="products-grid">
            {Array.from({ length: 8 }).map((_, index) => (
              <div className="product-skeleton" key={index}>
                <div className="skeleton-image" />
                <div className="skeleton-line skeleton-line-short" />
                <div className="skeleton-line" />
                <div className="skeleton-line skeleton-line-medium" />
              </div>
            ))}
          </div>
        )}

        {!loadingProducts && productError && (
          <div className="products-message error-message">
            <strong>Products are temporarily unavailable.</strong>
            <span>{productError}</span>
          </div>
        )}

        {!loadingProducts && !productError && featuredProducts.length === 0 && (
          <div className="products-message">
            <strong>No products found.</strong>
            <span>Try searching with a different product name.</span>
          </div>
        )}

        {!loadingProducts && !productError && featuredProducts.length > 0 && (
          <div className="products-grid">
            {featuredProducts.map((product) => {
              const image = product.mainImageUrl
              const category = product.categoryName
              const productPath = `/products/${encodeURIComponent(product.slug)}`
              const isProductWishlisted = isWishlisted(product.id)

              return (
                <article className="product-card" key={product.id}>
                  <div className="product-image-wrapper">
                    {image && (
                      <img
                        src={image}
                        alt={product.name}
                        loading="lazy"
                        onError={(event) => {
                          event.currentTarget.style.display = 'none'
                          const fallback = event.currentTarget.parentElement
                            .querySelector('.product-image-fallback')
                          if (fallback) fallback.style.display = 'flex'
                        }}
                      />
                    )}
                    <div
                      className="product-image-fallback"
                      style={{ display: image ? 'none' : 'flex' }}
                    >
                      <img src={solarPanelsIcon} alt="" />
                      <small>Baraka Solar Shop</small>
                    </div>
                    <Link
                      to={productPath}
                      aria-label={`View ${product.name}`}
                      style={{ position: 'absolute', inset: 0 }}
                    >
                      <span className="sr-only">View {product.name}</span>
                    </Link>
                    {Number(product.stock) > 0 && <span className="stock-badge">In stock</span>}
                    <button
                      className="wishlist-button"
                      style={isProductWishlisted
                        ? { background: '#2bb673', borderColor: '#2bb673', color: '#ffffff' }
                        : undefined}
                      type="button"
                      aria-pressed={isProductWishlisted}
                      aria-label={`${isProductWishlisted ? 'Remove' : 'Add'} ${product.name} ${isProductWishlisted ? 'from' : 'to'} wishlist`}
                      onClick={(event) => {
                        event.stopPropagation()
                        toggleItem({
                          ...product,
                          imageUrl: image,
                          categoryName: category,
                        })
                      }}
                    >
                      <SvgIcon src={wishlistIcon} size={20} />
                    </button>
                  </div>
                  <div className="product-card-content">
                    <p className="product-category">
                      {category || product.brandName || 'Solar equipment'}
                    </p>
                    <h3><Link to={productPath}>{product.name}</Link></h3>
                    <div className="product-rating">
                      <span>
                        {Array.from({ length: 5 }).map((_, index) => (
                          <SvgIcon src={starIcon} size={13} key={index} />
                        ))}
                      </span>
                      <small>5.0</small>
                    </div>
                    <div className="product-card-footer">
                      <strong>{formatPrice(product.price)}</strong>
                      <button type="button" aria-label={`Add ${product.name} to cart`}>
                        <SvgIcon src={shoppingBagIcon} size={20} />
                      </button>
                    </div>
                  </div>
                </article>
              )
            })}
          </div>
        )}
      </div>
    </section>
  )
}

export default FeaturedProducts
