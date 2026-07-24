const DEFAULT_API_BASE_URL = 'http://localhost:8000/api'
const API_BASE_URL = (import.meta.env.VITE_API_BASE_URL || DEFAULT_API_BASE_URL).replace(/\/+$/, '')
const BACKEND_BASE_URL = API_BASE_URL.replace(/\/api\/?$/, '')

const cleanText = (value) => typeof value === 'string' && value.trim() ? value.trim() : ''

const toFiniteNumber = (value) => {
  if (value === '' || value === null || value === undefined) return null
  const number = Number(value)
  return Number.isFinite(number) ? number : null
}

export const getProductImageUrl = (product) => {
  const rawImage = cleanText(product?.image_url)
    || cleanText(product?.image)
    || cleanText(product?.image_path)
    || cleanText(product?.thumbnail)

  if (!rawImage) return null
  if (/^(https?:|data:|blob:)/i.test(rawImage)) return rawImage

  return `${BACKEND_BASE_URL}${rawImage.startsWith('/') ? rawImage : `/${rawImage}`}`
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
    images: Array.isArray(candidate.images) ? candidate.images.filter(Boolean) : [],
    specifications: candidate.specifications && typeof candidate.specifications === 'object' ? candidate.specifications : null,
    warranty: cleanText(candidate.warranty),
    deliveryInformation: cleanText(candidate.delivery_information),
  }

  return { ...normalized, mainImageUrl: getProductImageUrl(candidate) }
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
