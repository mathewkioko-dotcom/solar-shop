const DEFAULT_API_BASE_URL = 'http://localhost:8000/api'
const API_BASE_URL = (import.meta.env.VITE_API_BASE_URL || DEFAULT_API_BASE_URL).replace(/\/+$/, '')
const BACKEND_BASE_URL = API_BASE_URL.replace(/\/api\/?$/, '')

const cleanText = (value) => typeof value === 'string' && value.trim() ? value.trim() : ''

const toFiniteNumber = (value) => {
  if (value === '' || value === null || value === undefined) return null
  const number = Number(value)
  return Number.isFinite(number) ? number : null
}

const resolveImageUrl = (value) => {
  const image = cleanText(value)
  if (!image) return null
  if (/^(https?:|data:|blob:)/i.test(image)) return image

  return `${BACKEND_BASE_URL}${image.startsWith('/') ? image : `/${image}`}`
}

export const getProductImageUrl = (product) => {
  const rawImage = cleanText(product?.image_url)
    || cleanText(product?.image)
    || cleanText(product?.image_path)
    || cleanText(product?.thumbnail)

  return resolveImageUrl(rawImage)
}

class ProductServiceError extends Error {
  constructor(message, status = 0) {
    super(message)
    this.name = 'ProductServiceError'
    this.status = status
  }
}

const normalizeProduct = (payload) => {
  const candidate = payload?.product ?? payload?.data?.product ?? payload?.data ?? payload

  if (!candidate || typeof candidate !== 'object' || Array.isArray(candidate)) {
    throw new ProductServiceError('The server returned an invalid product response.')
  }

  const name = cleanText(candidate.name)
  if (!name) {
    throw new ProductServiceError('The product response is missing a valid name.')
  }

  const categoryName = cleanText(candidate.category_name)
    || cleanText(candidate.category?.name)
    || (typeof candidate.category === 'string' ? cleanText(candidate.category) : '')
  const brandName = cleanText(candidate.brand_name)
    || cleanText(candidate.brand?.name)
    || (typeof candidate.brand === 'string' ? cleanText(candidate.brand) : '')
  const description = cleanText(candidate.description)
  const shortDescription = cleanText(candidate.short_description)
    || (description.length > 220 ? `${description.slice(0, 217).trimEnd()}...` : description)
  const mainImageUrl = getProductImageUrl(candidate)
  const galleryImages = Array.isArray(candidate.images)
    ? candidate.images
      .map((image, index) => {
        const imageData = typeof image === 'string' ? { url: image } : image
        if (!imageData || typeof imageData !== 'object') return null

        const url = resolveImageUrl(
          cleanText(imageData.url)
          || cleanText(imageData.image_url)
          || cleanText(imageData.image_path),
        )
        if (!url) return null

        return {
          id: imageData.id ?? `gallery-${index}`,
          url,
          alt: cleanText(imageData.alt) || `${name} product image ${index + 1}`,
        }
      })
      .filter(Boolean)
    : []

  if (mainImageUrl && !galleryImages.some((image) => image.url === mainImageUrl)) {
    galleryImages.unshift({
      id: `main-${candidate.id ?? candidate.slug ?? 'image'}`,
      url: mainImageUrl,
      alt: `${name} product image`,
    })
  }

  const normalized = {
    id: candidate.id ?? null,
    name,
    slug: cleanText(candidate.slug),
    categoryId: candidate.category_id ?? null,
    categoryName,
    brandName,
    description,
    shortDescription,
    price: toFiniteNumber(candidate.price),
    compareAtPrice: toFiniteNumber(candidate.compare_at_price),
    stock: toFiniteNumber(candidate.stock),
    sku: cleanText(candidate.sku),
    images: galleryImages,
    specifications: candidate.specifications && typeof candidate.specifications === 'object' ? candidate.specifications : null,
    wattage: toFiniteNumber(candidate.wattage),
    capacityAh: toFiniteNumber(candidate.capacity_ah),
    voltage: cleanText(candidate.voltage),
    warranty: cleanText(candidate.warranty),
    deliveryInformation: cleanText(candidate.delivery_information),
  }

  return { ...normalized, mainImageUrl: mainImageUrl || galleryImages[0]?.url || null }
}

const getProductCandidates = (payload) => {
  if (Array.isArray(payload)) return payload
  if (Array.isArray(payload?.data)) return payload.data
  if (Array.isArray(payload?.products)) return payload.products
  return null
}

const parseJsonResponse = async (response, resourceName) => {
  try {
    return await response.json()
  } catch {
    throw new ProductServiceError(`The ${resourceName} service returned an unreadable response.`)
  }
}

export async function getProducts(filters = {}, signal) {
  const query = new URLSearchParams()
  const categoryId = Number(filters.categoryId)
  const minPrice = Number(filters.minPrice)
  const maxPrice = Number(filters.maxPrice)
  const search = cleanText(filters.search)
  const validSorts = new Set(['newest', 'price_asc', 'price_desc', 'name_asc', 'name_desc'])

  if (Number.isInteger(categoryId) && categoryId > 0) {
    query.set('category_id', String(categoryId))
  }
  if (search) query.set('search', search)
  if (filters.minPrice !== '' && Number.isFinite(minPrice) && minPrice >= 0) {
    query.set('min_price', String(minPrice))
  }
  if (filters.maxPrice !== '' && Number.isFinite(maxPrice) && maxPrice >= 0) {
    query.set('max_price', String(maxPrice))
  }
  if (filters.inStock) query.set('in_stock', '1')
  query.set('sort', validSorts.has(filters.sort) ? filters.sort : 'newest')

  let response
  try {
    response = await fetch(`${API_BASE_URL}/products?${query}`, {
      signal,
      headers: { Accept: 'application/json' },
    })
  } catch (error) {
    if (error?.name === 'AbortError') throw error
    throw new ProductServiceError('Unable to connect to the products service.')
  }

  if (!response.ok) {
    throw new ProductServiceError(
      `The products service returned an error (${response.status}).`,
      response.status,
    )
  }

  const payload = await parseJsonResponse(response, 'products')
  const candidates = getProductCandidates(payload)
  if (!candidates) {
    throw new ProductServiceError('The products service returned an invalid product list.')
  }

  return candidates
    .map((candidate) => normalizeProduct(candidate))
    .filter((product) => product.slug)
}

export async function getProductSuggestions(searchTerm, signal) {
  const search = cleanText(searchTerm)
  if (!search) return []

  const normalizedSearch = search.toLocaleLowerCase()
  const products = await getProducts({ search }, signal)

  return products
    .filter((product) => (
      product.name.toLocaleLowerCase().includes(normalizedSearch)
      || product.categoryName.toLocaleLowerCase().includes(normalizedSearch)
      || product.brandName.toLocaleLowerCase().includes(normalizedSearch)
    ))
    .slice(0, 8)
}

export async function getCategories(signal) {
  let response
  try {
    response = await fetch(`${API_BASE_URL}/categories`, {
      signal,
      headers: { Accept: 'application/json' },
    })
  } catch (error) {
    if (error?.name === 'AbortError') throw error
    throw new ProductServiceError('Unable to connect to the categories service.')
  }

  if (!response.ok) {
    throw new ProductServiceError(
      `The categories service returned an error (${response.status}).`,
      response.status,
    )
  }

  const payload = await parseJsonResponse(response, 'categories')
  const candidates = Array.isArray(payload)
    ? payload
    : Array.isArray(payload?.data)
      ? payload.data
      : null

  if (!candidates) {
    throw new ProductServiceError('The categories service returned an invalid category list.')
  }

  return candidates
    .map((category) => ({
      id: category?.id ?? null,
      name: cleanText(category?.name),
      slug: cleanText(category?.slug),
    }))
    .filter((category) => category.id !== null && category.name && category.slug)
}

export async function getProductBySlug(slug, signal) {
  const normalizedSlug = cleanText(slug)
  if (!normalizedSlug) {
    throw new ProductServiceError('A valid product slug is required.', 404)
  }

  let response
  try {
    response = await fetch(`${API_BASE_URL}/products/${encodeURIComponent(normalizedSlug)}`, {
      signal,
      headers: { Accept: 'application/json' },
    })
  } catch (error) {
    if (error.name === 'AbortError') throw error
    throw new ProductServiceError('Unable to connect to the product service. Please check your connection and try again.')
  }

  if (response.status === 404) {
    throw new ProductServiceError('Product not found.', 404)
  }

  if (!response.ok) {
    throw new ProductServiceError(`The product service returned an error (${response.status}).`, response.status)
  }

  let payload
  try {
    payload = await response.json()
  } catch {
    throw new ProductServiceError('The product service returned an unreadable response.')
  }

  return normalizeProduct(payload)
}

export async function getRelatedProducts(categoryId, currentProductId, signal) {
  const normalizedCategoryId = Number(categoryId)
  if (
    !Number.isInteger(normalizedCategoryId)
    || normalizedCategoryId < 1
    || currentProductId === null
    || currentProductId === undefined
  ) {
    return []
  }

  let response
  try {
    const query = new URLSearchParams({ category_id: String(normalizedCategoryId) })
    response = await fetch(`${API_BASE_URL}/products?${query}`, {
      signal,
      headers: { Accept: 'application/json' },
    })
  } catch (error) {
    if (error.name === 'AbortError') throw error
    throw new ProductServiceError('Unable to load related products.')
  }

  if (!response.ok) {
    throw new ProductServiceError(
      `The related products service returned an error (${response.status}).`,
      response.status,
    )
  }

  let payload
  try {
    payload = await response.json()
  } catch {
    throw new ProductServiceError('The related products service returned an unreadable response.')
  }

  const candidates = getProductCandidates(payload) || []

  return candidates
    .map((candidate) => {
      try {
        return normalizeProduct(candidate)
      } catch {
        return null
      }
    })
    .filter((product) => (
      product
      && product.slug
      && String(product.id) !== String(currentProductId)
      && String(product.categoryId) === String(normalizedCategoryId)
    ))
    .slice(0, 4)
}
