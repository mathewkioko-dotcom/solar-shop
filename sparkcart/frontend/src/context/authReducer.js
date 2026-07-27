export const AUTH_ACTIONS = {
  RESTORE_START: 'RESTORE_START',
  AUTH_SUCCESS: 'AUTH_SUCCESS',
  AUTH_FAILURE: 'AUTH_FAILURE',
  LOGOUT: 'LOGOUT',
}

export const initialAuthState = {
  user: null,
  token: null,
  session: null,
  loading: true,
  error: '',
}

export function authReducer(state, action) {
  switch (action.type) {
    case AUTH_ACTIONS.RESTORE_START:
      return { ...state, loading: true, error: '' }

    case AUTH_ACTIONS.AUTH_SUCCESS:
      return {
        user: action.payload.user,
        token: action.payload.token || null,
        session: action.payload.session || 'token',
        loading: false,
        error: '',
      }

    case AUTH_ACTIONS.AUTH_FAILURE:
      return {
        ...initialAuthState,
        loading: false,
        error: action.payload?.message || '',
      }

    case AUTH_ACTIONS.LOGOUT:
      return { ...initialAuthState, loading: false }

    default:
      return state
  }
}
