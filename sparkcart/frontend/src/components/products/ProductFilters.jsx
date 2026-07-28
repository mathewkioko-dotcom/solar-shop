import { memo, useEffect, useMemo, useState } from 'react'
import { useToast } from '../../hooks/useToast'

const EMPTY_FILTERS = {
  search: '',
  categoryId: '',
  brandSlug: '',
  minPrice: '',
  maxPrice: '',
  inStock: false,
  sort: 'newest',
}

function ProductFilters({
  filters,
  categories,
  brands,
  isMobileOpen,
  onApply,
  onClear,
  onClose,
  onSearchCommit,
}) {
  const { showWarning } = useToast()
  const [draft, setDraft] = useState(filters)
  const [validationError, setValidationError] = useState('')
  const selectedCategory = categories.find(
    (category) => String(category.id) === String(draft.categoryId),
  )?.slug || draft.categoryId
  const hasPendingNonSearchFilters = useMemo(
    () => (
      draft.categoryId !== filters.categoryId
      || draft.brandSlug !== filters.brandSlug
      || draft.minPrice !== filters.minPrice
      || draft.maxPrice !== filters.maxPrice
      || draft.inStock !== filters.inStock
    ),
    [draft, filters],
  )

  useEffect(() => {
    if (draft.search === filters.search || hasPendingNonSearchFilters) return undefined

    const timeoutId = window.setTimeout(() => {
      onSearchCommit(draft.search)
    }, 300)

    return () => window.clearTimeout(timeoutId)
  }, [draft.search, filters.search, hasPendingNonSearchFilters, onSearchCommit])

  const updateField = (field, value) => {
    setValidationError('')
    setDraft((currentDraft) => ({ ...currentDraft, [field]: value }))
  }

  const handleSubmit = (event) => {
    event.preventDefault()
    const minPrice = draft.minPrice === '' ? null : Number(draft.minPrice)
    const maxPrice = draft.maxPrice === '' ? null : Number(draft.maxPrice)

    if (minPrice !== null && maxPrice !== null && maxPrice < minPrice) {
      setValidationError('Maximum price must be greater than or equal to minimum price.')
      showWarning('Invalid Price Range', 'Maximum price must be greater than or equal to minimum price.')
      return
    }

    onApply(draft)
  }

  const handleClear = () => {
    setDraft(EMPTY_FILTERS)
    setValidationError('')
    onClear()
  }

  return (
    <aside
      id="catalog-filters"
      className={`products-page__filters ${isMobileOpen ? 'products-page__filters--open' : ''}`}
    >
      <div className="products-page__filters-heading">
        <div>
          <p>Refine results</p>
          <h2>Filters</h2>
        </div>
        <button type="button" onClick={onClose} aria-label="Close product filters">Close</button>
      </div>

      <form className="products-page__filters-form" onSubmit={handleSubmit}>
        <label className="products-page__field">
          <span>Search products</span>
          <input
            type="search"
            value={draft.search}
            placeholder="Panels, batteries, inverters..."
            onChange={(event) => updateField('search', event.target.value)}
          />
        </label>

        <label className="products-page__field">
          <span>Brand</span>
          <select
            value={draft.brandSlug}
            onChange={(event) => updateField('brandSlug', event.target.value)}
          >
            <option value="">All brands</option>
            {brands.map((brand) => (
              <option value={brand.slug} key={brand.id}>{brand.name}</option>
            ))}
          </select>
        </label>

        <label className="products-page__field">
          <span>Category</span>
          <select
            value={selectedCategory}
            onChange={(event) => updateField('categoryId', event.target.value)}
          >
            <option value="">All categories</option>
            {categories.map((category) => (
              <option value={category.slug} key={category.id}>{category.name}</option>
            ))}
          </select>
        </label>

        <fieldset className="products-page__price-fields">
          <legend>Price range (KES)</legend>
          <label>
            <span>Minimum</span>
            <input
              type="number"
              min="0"
              inputMode="decimal"
              value={draft.minPrice}
              placeholder="0"
              onChange={(event) => updateField('minPrice', event.target.value)}
            />
          </label>
          <label>
            <span>Maximum</span>
            <input
              type="number"
              min="0"
              inputMode="decimal"
              value={draft.maxPrice}
              placeholder="50000"
              onChange={(event) => updateField('maxPrice', event.target.value)}
            />
          </label>
        </fieldset>

        <fieldset className="products-page__availability">
          <legend>Availability</legend>
          <label>
            <input
              type="checkbox"
              checked={draft.inStock}
              onChange={(event) => updateField('inStock', event.target.checked)}
            />
            <span>In-stock products only</span>
          </label>
        </fieldset>

        {validationError && (
          <p className="products-page__filter-error" role="alert">{validationError}</p>
        )}

        <div className="products-page__filter-actions">
          <button type="submit">Apply Filters</button>
          <button type="button" onClick={handleClear}>Clear Filters</button>
        </div>
      </form>
    </aside>
  )
}

export default memo(ProductFilters)
