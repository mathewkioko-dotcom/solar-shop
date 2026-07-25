const WISHLIST_STORAGE_KEY = 'baraka_solar_wishlist_v1'
const WISHLIST_STORAGE_VERSION = 1

const cleanText = (value) => (
  typeof value === 'string' ? value.trim() : ''
)

const isValidId = (id) => (
  (typeof id === 'number' && Number.isInteger(id) && id > 0)
  || (typeof id === 'string' && Boolean(id.trim()))
)

const normalizeStock = (stock) => {
  if (stock === null || stock === undefined || stock === '') return null

  const normalizedStock = Number(stock)
  if (!Number.isFinite(normalizedStock)) return null

  return Math.max(0, Math.floor(normalizedStock))
}

export const normalizeWishlistItem = (product) => {
  if (!product || typeof product !== 'object' || Array.isArray(product)) return null

  const id = product.id
  const slug = cleanText(product.slug)
  const name = cleanText(product.name)
  const hasPrice = product.price !== null
    && product.price !== undefined
    && product.price !== ''
  const price = Number(product.price)

  if (
    !isValidId(id)
    || !slug
    || !name
    || !hasPrice
    || !Number.isFinite(price)
    || price < 0
  ) {
    return null
  }

  return {
    id,
    slug,
    name,
    price,
    imageUrl: cleanText(product.imageUrl) || cleanText(product.mainImageUrl) || null,
    categoryName: cleanText(product.categoryName),
    stock: normalizeStock(product.stock),
  }
}

export const normalizeWishlistItems = (items) => {
  if (!Array.isArray(items)) return []

  return items.reduce((normalizedItems, item) => {
    const normalizedItem = normalizeWishlistItem(item)
    if (
      normalizedItem
      && !normalizedItems.some(
        (candidate) => String(candidate.id) === String(normalizedItem.id),
      )
    ) {
      normalizedItems.push(normalizedItem)
    }

    return normalizedItems
  }, [])
}

export const loadStoredWishlist = () => {
  if (typeof window === 'undefined') return []

  try {
    if (!window.localStorage) return []

    const storedValue = window.localStorage.getItem(WISHLIST_STORAGE_KEY)
    if (!storedValue) return []

    const payload = JSON.parse(storedValue)
    if (
      !payload
      || typeof payload !== 'object'
      || payload.version !== WISHLIST_STORAGE_VERSION
    ) {
      return []
    }

    return normalizeWishlistItems(payload.items)
  } catch {
    return []
  }
}

export const saveStoredWishlist = (items) => {
  if (typeof window === 'undefined') return

  try {
    if (!window.localStorage) return

    window.localStorage.setItem(
      WISHLIST_STORAGE_KEY,
      JSON.stringify({
        version: WISHLIST_STORAGE_VERSION,
        items: normalizeWishlistItems(items),
      }),
    )
  } catch {
    // Storage can be unavailable in private browsing or restricted environments.
  }
}
