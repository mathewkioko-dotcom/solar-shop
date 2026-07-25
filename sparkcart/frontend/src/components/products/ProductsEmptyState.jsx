import { memo } from 'react'

function ProductsEmptyState({ onClear }) {
  return (
    <div className="products-page__empty">
      <h2>No products match your filters.</h2>
      <p>Try adjusting your search, category, price, or availability selections.</p>
      <button type="button" onClick={onClear}>Clear Filters</button>
    </div>
  )
}

export default memo(ProductsEmptyState)
