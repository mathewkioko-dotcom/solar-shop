import {
  normalizeWishlistItem,
  normalizeWishlistItems,
} from '../services/wishlistStorage.js'

export const WISHLIST_ACTIONS = {
  ADD_ITEM: 'ADD_ITEM',
  REMOVE_ITEM: 'REMOVE_ITEM',
  TOGGLE_ITEM: 'TOGGLE_ITEM',
  CLEAR_WISHLIST: 'CLEAR_WISHLIST',
  HYDRATE_WISHLIST: 'HYDRATE_WISHLIST',
}

export function wishlistReducer(state, action) {
  switch (action.type) {
    case WISHLIST_ACTIONS.ADD_ITEM: {
      const item = normalizeWishlistItem(action.payload?.item)
      if (
        !item
        || state.items.some(
          (candidate) => String(candidate.id) === String(item.id),
        )
      ) {
        return state
      }

      return { items: [...state.items, item] }
    }

    case WISHLIST_ACTIONS.REMOVE_ITEM: {
      const items = state.items.filter(
        (item) => String(item.id) !== String(action.payload?.productId),
      )

      return items.length === state.items.length ? state : { items }
    }

    case WISHLIST_ACTIONS.TOGGLE_ITEM: {
      const item = normalizeWishlistItem(action.payload?.item)
      if (!item) return state

      const isExisting = state.items.some(
        (candidate) => String(candidate.id) === String(item.id),
      )

      return {
        items: isExisting
          ? state.items.filter(
            (candidate) => String(candidate.id) !== String(item.id),
          )
          : [...state.items, item],
      }
    }

    case WISHLIST_ACTIONS.CLEAR_WISHLIST:
      return state.items.length === 0 ? state : { items: [] }

    case WISHLIST_ACTIONS.HYDRATE_WISHLIST:
      return { items: normalizeWishlistItems(action.payload?.items) }

    default:
      return state
  }
}

