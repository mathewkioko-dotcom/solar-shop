import {
  normalizeCartItem,
  normalizeCartItems,
  normalizeCartQuantity,
} from '../services/cartStorage.js'

export const CART_ACTIONS = {
  ADD_ITEM: 'ADD_ITEM',
  REMOVE_ITEM: 'REMOVE_ITEM',
  SET_QUANTITY: 'SET_QUANTITY',
  CLEAR_CART: 'CLEAR_CART',
  HYDRATE_CART: 'HYDRATE_CART',
}

export function cartReducer(state, action) {
  switch (action.type) {
    case CART_ACTIONS.ADD_ITEM: {
      const item = normalizeCartItem(action.payload?.item)
      if (!item) return state

      const existingIndex = state.items.findIndex(
        (candidate) => String(candidate.id) === String(item.id),
      )

      if (existingIndex === -1) {
        return { items: [...state.items, item] }
      }

      const existingItem = state.items[existingIndex]
      const quantity = normalizeCartQuantity(
        existingItem.quantity + item.quantity,
        item.stock,
      )

      if (quantity === null || quantity === existingItem.quantity) return state

      return {
        items: state.items.map((candidate, index) => (
          index === existingIndex
            ? { ...item, quantity }
            : candidate
        )),
      }
    }

    case CART_ACTIONS.REMOVE_ITEM: {
      const items = state.items.filter(
        (item) => String(item.id) !== String(action.payload?.productId),
      )

      return items.length === state.items.length ? state : { items }
    }

    case CART_ACTIONS.SET_QUANTITY: {
      const productId = action.payload?.productId
      const item = state.items.find(
        (candidate) => String(candidate.id) === String(productId),
      )
      if (!item) return state

      const quantity = normalizeCartQuantity(action.payload?.quantity, item.stock)
      if (quantity === null || quantity === item.quantity) return state

      return {
        items: state.items.map((candidate) => (
          String(candidate.id) === String(productId)
            ? { ...candidate, quantity }
            : candidate
        )),
      }
    }

    case CART_ACTIONS.CLEAR_CART:
      return state.items.length === 0 ? state : { items: [] }

    case CART_ACTIONS.HYDRATE_CART:
      return { items: normalizeCartItems(action.payload?.items) }

    default:
      return state
  }
}
