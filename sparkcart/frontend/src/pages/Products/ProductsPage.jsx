import { useCallback, useEffect, useMemo, useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import ProductFilters from '../../components/products/ProductFilters'
import ProductGrid from '../../components/products/ProductGrid'
import ProductResultsHeader from '../../components/products/ProductResultsHeader'
import ProductsEmptyState from '../../components/products/ProductsEmptyState'
import SiteLayout from '../../layouts/SiteLayout'
import { getBrands, getCategories, getProducts } from '../../services/productService'
import { useToast } from '../../hooks/useToast'
import '../../styles/products-page.css'

const VALID_SORTS = new Set(['newest', 'price_asc', 'price_desc', 'name_asc', 'name_desc'])
const DEFAULT_FILTERS = {
  search: '',
  categoryId: '',
  brandSlug: '',
  minPrice: '',
  maxPrice: '',
  inStock: false,
  sort: 'newest',
  solution: '',
}

const normalizePositiveNumber = (value) => {
  if (value === null || value === '') return ''
  const number = Number(value)
  return Number.isFinite(number) && number >= 0 ? String(number) : ''
}

const readFilters = (queryString) => {
  const params = new URLSearchParams(queryString)
  const category = (params.get('category') ?? params.get('category_id') ?? '').trim()
  const categoryNumber = Number(category)
  const sort = params.get('sort')
  const solution = params.get('solution')

  return {
    search: (params.get('search') || '').trim(),
    categoryId: Number.isInteger(categoryNumber) && categoryNumber > 0
      ? String(categoryNumber)
      : /^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(category) ? category : '',
    brandSlug: (params.get('brand') || '').trim(),
    minPrice: normalizePositiveNumber(params.get('min_price')),
    maxPrice: normalizePositiveNumber(params.get('max_price')),
    inStock: ['1', 'true'].includes((params.get('in_stock') || '').toLowerCase()),
    sort: VALID_SORTS.has(sort) ? sort : 'newest',
    solution: ['home', 'commercial'].includes(solution) ? solution : '',
  }
}

const createFilterParams = (filters) => {
  const params = new URLSearchParams()
  const search = filters.search.trim()

  if (search) params.set('search', search)
  if (filters.categoryId) params.set('category', filters.categoryId)
  if (filters.brandSlug) params.set('brand', filters.brandSlug)
  if (filters.minPrice !== '') params.set('min_price', filters.minPrice)
  if (filters.maxPrice !== '') params.set('max_price', filters.maxPrice)
  if (filters.inStock) params.set('in_stock', '1')
  if (filters.sort !== 'newest') params.set('sort', filters.sort)
  if (filters.solution) params.set('solution', filters.solution)

  return params
}

function ProductsPage() {
  const { showError } = useToast()
  const [searchParams, setSearchParams] = useSearchParams()
  const queryKey = searchParams.toString()
  const filters = useMemo(() => readFilters(queryKey), [queryKey])
  const [categories, setCategories] = useState([])
  const [brands, setBrands] = useState([])
  const [filtersOpen, setFiltersOpen] = useState(false)
  const [retryCount, setRetryCount] = useState(0)
  const requestKey = `${queryKey}:${retryCount}`
  const [requestState, setRequestState] = useState({
    key: '',
    status: 'loading',
    products: [],
    errorMessage: '',
  })
  const isCurrentRequest = requestState.key === requestKey
  const status = isCurrentRequest ? requestState.status : 'loading'
  const products = isCurrentRequest ? requestState.products : []
  const errorMessage = isCurrentRequest ? requestState.errorMessage : ''

  useEffect(() => {
    const controller = new AbortController()
    let active = true

    Promise.all([getCategories(controller.signal), getBrands(controller.signal)])
      .then(([nextCategories, nextBrands]) => {
        if (active) {
          setCategories(nextCategories)
          setBrands(nextBrands)
        }
      })
      .catch((error) => {
        if (!active || error?.name === 'AbortError') return
        setCategories([])
        setBrands([])
        showError('Filters Unavailable', error?.message || 'Product filters could not be loaded.')
      })

    return () => {
      active = false
      controller.abort()
    }
  }, [showError])

  useEffect(() => {
    const controller = new AbortController()
    let active = true

    getProducts(filters, controller.signal)
      .then((nextProducts) => {
        if (!active) return
        setRequestState({
          key: requestKey,
          status: 'success',
          products: nextProducts,
          errorMessage: '',
        })
      })
      .catch((error) => {
        if (!active || error?.name === 'AbortError') return
        showError('Products Unavailable', error?.message || 'Unable to connect to the server. Please try again.')
        setRequestState({
          key: requestKey,
          status: 'error',
          products: [],
          errorMessage: error?.message || 'Products could not be loaded.',
        })
      })

    return () => {
      active = false
      controller.abort()
    }
  }, [filters, requestKey, showError])

  const applyFilters = useCallback((nextFilters) => {
    setSearchParams(createFilterParams(nextFilters))
    setFiltersOpen(false)
  }, [setSearchParams])

  const clearFilters = useCallback(() => {
    setSearchParams(createFilterParams(DEFAULT_FILTERS))
    setFiltersOpen(false)
  }, [setSearchParams])

  const commitSearch = useCallback((search) => {
    const normalizedSearch = search.trim()
    if (normalizedSearch === filters.search) return
    setSearchParams(createFilterParams({ ...filters, search: normalizedSearch }))
  }, [filters, setSearchParams])

  const changeSort = useCallback((sort) => {
    setSearchParams(createFilterParams({ ...filters, sort }))
  }, [filters, setSearchParams])
  const selectedBrand = brands.find((brand) => brand.slug === filters.brandSlug)
  const solutionCopy = filters.solution === 'home'
    ? {
        title: 'Solar products for home energy needs',
        description: 'Explore the full catalog with residential planning in mind, from backup power to complete home solar systems.',
      }
    : filters.solution === 'commercial'
      ? {
          title: 'Solar products for commercial energy needs',
          description: 'Explore the full catalog for business and commercial planning, with compatibility confirmed for each project.',
        }
      : null

  return (
    <SiteLayout>
      <main className="products-page">
        <div className="products-page__container">
          <div className="products-page__intro">
            <p>Baraka Solar Shop</p>
            <h1>{selectedBrand ? `${selectedBrand.name} solar products` : solutionCopy?.title || 'Solar products for every energy need'}</h1>
            <span>{solutionCopy?.description || 'Explore reliable equipment for homes, businesses, and complete solar installations.'}</span>
          </div>

          <div className="products-page__layout">
            <ProductFilters
              key={queryKey}
              filters={filters}
              categories={categories}
              brands={brands}
              isMobileOpen={filtersOpen}
              onApply={applyFilters}
              onClear={clearFilters}
              onClose={() => setFiltersOpen(false)}
              onSearchCommit={commitSearch}
            />

            <div className="products-page__results">
              <ProductResultsHeader
                count={products.length}
                filtersOpen={filtersOpen}
                sort={filters.sort}
                onOpenFilters={() => setFiltersOpen(true)}
                onSortChange={changeSort}
              />

              {status === 'error' ? (
                <div className="products-page__error" role="alert">
                  <h2>Products could not be loaded.</h2>
                  <p>{errorMessage}</p>
                  <button type="button" onClick={() => setRetryCount((count) => count + 1)}>
                    Try again
                  </button>
                </div>
              ) : status === 'success' && products.length === 0 ? (
                <ProductsEmptyState onClear={clearFilters} />
              ) : (
                <ProductGrid products={products} loading={status === 'loading'} />
              )}
            </div>
          </div>
        </div>
      </main>
    </SiteLayout>
  )
}

export default ProductsPage
