import { memo } from 'react'
import ProductCard from '../product/ProductCard'

function ProductGrid({ products, loading }) {
  if (loading) {
    return (
      <div className="products-page__loading" role="status" aria-live="polite">
        <span className="sr-only">Loading products</span>
        <ul className="products-page__grid" aria-hidden="true">
          {Array.from({ length: 8 }, (_, index) => (
            <li className="products-page__skeleton" key={index}>
              <span />
              <span />
              <span />
            </li>
          ))}
        </ul>
      </div>
    )
  }

  return (
    <ul className="products-page__grid">
      {products.map((product) => (
        <ProductCard product={product} key={product.id || product.slug} />
      ))}
    </ul>
  )
}

export default memo(ProductGrid)
