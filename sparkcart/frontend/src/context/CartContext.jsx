import { useCallback, useEffect, useMemo, useReducer, useRef } from 'react'
import { CartContext } from '../hooks/useCart'
import {
  loadStoredCart,
  normalizeCartItem,
  saveStoredCart,
} from '../services/cartStorage'
import { CART_ACTIONS, cartReducer } from './cartReducer'

const createInitialState = () => ({
  items: loadStoredCart(),
})

export function CartProvider({ children }) {
  const [state, dispatch] = useReducer(cartReducer, undefined, createInitialState)
  const hasMounted = useRef(false)

  useEffect(() => {
    if (!hasMounted.current) {
      hasMounted.current = true
      return
    }

    saveStoredCart(state.items)
  }, [state.items])

  const addItem = useCallback((product, quantity = 1) => {
    const item = normalizeCartItem(product, quantity)
    if (!item) return false

    dispatch({
      type: CART_ACTIONS.ADD_ITEM,
      payload: { item },
    })
    return true
  }, [])

  const removeItem = useCallback((productId) => {
    dispatch({
      type: CART_ACTIONS.REMOVE_ITEM,
      payload: { productId },
    })
  }, [])

  const setQuantity = useCallback((productId, quantity) => {
    dispatch({
      type: CART_ACTIONS.SET_QUANTITY,
      payload: { productId, quantity },
    })
  }, [])

  const clearCart = useCallback(() => {
    dispatch({ type: CART_ACTIONS.CLEAR_CART })
  }, [])

  const itemCount = useMemo(
    () => state.items.reduce((total, item) => total + item.quantity, 0),
    [state.items],
  )

  const subtotal = useMemo(
    () => state.items.reduce(
      (total, item) => total + (item.price * item.quantity),
      0,
    ),
    [state.items],
  )

  const isInCart = useCallback(
    (productId) => state.items.some(
      (item) => String(item.id) === String(productId),
    ),
    [state.items],
  )

  const getItemQuantity = useCallback(
    (productId) => state.items.find(
      (item) => String(item.id) === String(productId),
    )?.quantity ?? 0,
    [state.items],
  )

  const value = useMemo(() => ({
    items: state.items,
    isHydrated: true,
    itemCount,
    subtotal,
    addItem,
    removeItem,
    setQuantity,
    clearCart,
    isInCart,
    getItemQuantity,
  }), [
    addItem,
    clearCart,
    getItemQuantity,
    isInCart,
    itemCount,
    removeItem,
    setQuantity,
    state.items,
    subtotal,
  ])

  return (
    <CartContext.Provider value={value}>
      {children}
    </CartContext.Provider>
  )
}
