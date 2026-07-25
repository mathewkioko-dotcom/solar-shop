import { memo, useEffect, useState } from 'react'
import { getRelatedProducts } from '../../services/productService'
import ProductCard from './ProductCard'

function RelatedProducts({ currentProduct }) {
  const categoryId = currentProduct?.categoryId
  const currentProductId = currentProduct?.id
  const canFetch = categoryId !== null
    && categoryId !== undefined
    && currentProductId !== null
    && currentProductId !== undefined
  const requestKey = `${categoryId ?? ''}:${currentProductId ?? ''}`
  const [requestState, setRequestState] = useState({
    key: '',
    status: 'loading',
    products: [],
  })
  const isCurrentRequest = requestState.key === requestKey
  const status = isCurrentRequest ? requestState.status : 'loading'
  const products = isCurrentRequest ? requestState.products : []

  useEffect(() => {
    if (!canFetch) return undefined

    const controller = new AbortController()
    let active = true

    getRelatedProducts(categoryId, currentProductId, controller.signal)
      .then((nextProducts) => {
        if (!active) return
        setRequestState({
          key: requestKey,
          status: 'success',
          products: nextProducts,
        })
      })
      .catch((error) => {
        if (!active || error?.name === 'AbortError') return
        setRequestState({
          key: requestKey,
          status: 'error',
          products: [],
        })
      })

    return () => {
      active = false
      controller.abort()
    }
  }, [canFetch, categoryId, currentProductId, requestKey])

  if (!canFetch || status === 'error' || (status === 'success' && products.length === 0)) {
    return null
  }

  return (
    <section
      className="product-details-page__related"
      aria-labelledby="related-products-title"
      aria-busy={status === 'loading'}
    >
      <p className="product-details-page__eyebrow">Related products</p>
      <h2 id="related-products-title">You may also like</h2>

      {status === 'loading' ? (
        <>
          <p className="sr-only" role="status" aria-live="polite">Loading related products</p>
          <ul className="product-details-page__related-grid" aria-hidden="true">
            {Array.from({ length: 4 }, (_, index) => (
              <li className="product-details-page__related-skeleton" key={index}>
                <span />
                <span />
                <span />
              </li>
            ))}
          </ul>
        </>
      ) : (
        <ul className="product-details-page__related-grid">
          {products.map((product) => (
            <ProductCard product={product} key={product.id || product.slug} />
          ))}
        </ul>
      )}
    </section>
  )
}

export default memo(RelatedProducts)
