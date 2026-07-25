import { memo } from 'react'

function ProductResultsHeader({ count, filtersOpen, sort, onOpenFilters, onSortChange }) {
  return (
    <div className="products-page__results-header">
      <div>
        <p aria-live="polite">{count} {count === 1 ? 'product' : 'products'}</p>
        <button
          type="button"
          aria-expanded={filtersOpen}
          aria-controls="catalog-filters"
          onClick={onOpenFilters}
        >
          Filters
        </button>
      </div>

      <label>
        <span>Sort by</span>
        <select value={sort} onChange={(event) => onSortChange(event.target.value)}>
          <option value="newest">Newest</option>
          <option value="price_asc">Price: Low to High</option>
          <option value="price_desc">Price: High to Low</option>
          <option value="name_asc">Name: A to Z</option>
          <option value="name_desc">Name: Z to A</option>
        </select>
      </label>
    </div>
  )
}

export default memo(ProductResultsHeader)
