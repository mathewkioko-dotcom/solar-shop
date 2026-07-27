import { useCallback, useEffect, useMemo, useReducer, useRef } from 'react'
import { WishlistContext } from '../hooks/useWishlist'
import {
  loadStoredWishlist,
  normalizeWishlistItem,
  saveStoredWishlist,
} from '../services/wishlistStorage'
import { WISHLIST_ACTIONS, wishlistReducer } from './wishlistReducer'

const createInitialState = () => ({
  items: loadStoredWishlist(),
})

export function WishlistProvider({ children }) {
  const [state, dispatch] = useReducer(wishlistReducer, undefined, createInitialState)
  const hasMounted = useRef(false)

  useEffect(() => {
    if (!hasMounted.current) {
      hasMounted.current = true
      return
    }

    saveStoredWishlist(state.items)
  }, [state.items])

  const addItem = useCallback((product) => {
    const item = normalizeWishlistItem(product)
    if (!item) return false

    dispatch({
      type: WISHLIST_ACTIONS.ADD_ITEM,
      payload: { item },
    })
    return true
  }, [])

  const removeItem = useCallback((productId) => {
    dispatch({
      type: WISHLIST_ACTIONS.REMOVE_ITEM,
      payload: { productId },
    })
  }, [])

  const removeItems = useCallback((productIds) => {
    dispatch({
      type: WISHLIST_ACTIONS.REMOVE_ITEMS,
      payload: { productIds },
    })
  }, [])

  const toggleItem = useCallback((product) => {
    const item = normalizeWishlistItem(product)
    if (!item) return false

    dispatch({
      type: WISHLIST_ACTIONS.TOGGLE_ITEM,
      payload: { item },
    })
    return true
  }, [])

  const clearWishlist = useCallback(() => {
    dispatch({ type: WISHLIST_ACTIONS.CLEAR_WISHLIST })
  }, [])

  const itemCount = useMemo(() => state.items.length, [state.items])

  const isWishlisted = useCallback(
    (productId) => state.items.some(
      (item) => String(item.id) === String(productId),
    ),
    [state.items],
  )

  const value = useMemo(() => ({
    items: state.items,
    itemCount,
    addItem,
    removeItem,
    removeItems,
    toggleItem,
    clearWishlist,
    isWishlisted,
  }), [
    addItem,
    clearWishlist,
    isWishlisted,
    itemCount,
    removeItem,
    removeItems,
    state.items,
    toggleItem,
  ])

  return (
    <WishlistContext.Provider value={value}>
      {children}
    </WishlistContext.Provider>
  )
}
