const CART_STORAGE_KEY = 'baraka_solar_cart_v1'
const CART_STORAGE_VERSION = 1
const FALLBACK_MAX_QUANTITY = 99

const isValidId = (id) => (
  (typeof id === 'number' && Number.isInteger(id) && id > 0)
  || (typeof id === 'string' && Boolean(id.trim()))
)

const cleanText = (value) => (
  typeof value === 'string' ? value.trim() : ''
)

const normalizeStock = (stock) => {
  if (stock === null || stock === undefined || stock === '') return null

  const normalizedStock = Number(stock)
  if (!Number.isFinite(normalizedStock)) return null

  return Math.max(0, Math.floor(normalizedStock))
}

export const getCartQuantityLimit = (stock) => (
  stock === null ? FALLBACK_MAX_QUANTITY : stock
)

export const normalizeCartQuantity = (quantity, stock) => {
  const normalizedQuantity = Number(quantity)
  if (!Number.isInteger(normalizedQuantity) || normalizedQuantity < 1) return null

  const maximum = getCartQuantityLimit(stock)
  if (maximum < 1) return null

  return Math.min(normalizedQuantity, maximum)
}

export const normalizeCartItem = (product, quantity = product?.quantity ?? 1) => {
  if (!product || typeof product !== 'object' || Array.isArray(product)) return null

  const id = product.id
  const name = cleanText(product.name)
  const slug = cleanText(product.slug)
  const price = Number(product.price)
  const stock = normalizeStock(product.stock)
  const normalizedQuantity = normalizeCartQuantity(quantity, stock)

  if (
    !isValidId(id)
    || !name
    || !slug
    || !Number.isFinite(price)
    || price < 0
    || normalizedQuantity === null
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
    stock,
    quantity: normalizedQuantity,
  }
}

export const normalizeCartItems = (items) => {
  if (!Array.isArray(items)) return []

  return items.reduce((normalizedItems, item) => {
    const normalizedItem = normalizeCartItem(item)
    if (!normalizedItem) return normalizedItems

    const existingIndex = normalizedItems.findIndex(
      (candidate) => String(candidate.id) === String(normalizedItem.id),
    )

    if (existingIndex === -1) {
      normalizedItems.push(normalizedItem)
      return normalizedItems
    }

    const existingItem = normalizedItems[existingIndex]
    const combinedQuantity = normalizeCartQuantity(
      existingItem.quantity + normalizedItem.quantity,
      normalizedItem.stock,
    )

    if (combinedQuantity !== null) {
      normalizedItems[existingIndex] = {
        ...normalizedItem,
        quantity: combinedQuantity,
      }
    }

    return normalizedItems
  }, [])
}

export const loadStoredCart = () => {
  if (typeof window === 'undefined') return []

  try {
    if (!window.localStorage) return []
    const storedValue = window.localStorage.getItem(CART_STORAGE_KEY)
    if (!storedValue) return []

    const payload = JSON.parse(storedValue)
    if (
      !payload
      || typeof payload !== 'object'
      || payload.version !== CART_STORAGE_VERSION
    ) {
      return []
    }

    return normalizeCartItems(payload.items)
  } catch {
    return []
  }
}

export const saveStoredCart = (items) => {
  if (typeof window === 'undefined') return

  try {
    if (!window.localStorage) return
    window.localStorage.setItem(
      CART_STORAGE_KEY,
      JSON.stringify({
        version: CART_STORAGE_VERSION,
        items: normalizeCartItems(items),
      }),
    )
  } catch {
    // Storage can be unavailable in private browsing or restricted environments.
  }
}
