import { useCallback, useEffect, useMemo, useReducer, useRef } from 'react'
import { AuthContext } from '../hooks/useAuth'
import {
  clearStoredAuth,
  getStoredAuthToken,
  loginCustomer,
  logoutCustomer,
  refreshAuthenticatedUser,
  registerCustomer,
  requestPasswordReset,
  resetCustomerPassword,
} from '../services/authService'
import { AUTH_ACTIONS, authReducer, initialAuthState } from './authReducer'

export function AuthProvider({ children }) {
  const [state, dispatch] = useReducer(authReducer, initialAuthState)
  const hasRestored = useRef(false)

  const refreshUser = useCallback(async () => {
    dispatch({ type: AUTH_ACTIONS.RESTORE_START })

    try {
      const session = await refreshAuthenticatedUser(getStoredAuthToken())
      dispatch({ type: AUTH_ACTIONS.AUTH_SUCCESS, payload: session })
      return session.user
    } catch (error) {
      clearStoredAuth()
      dispatch({
        type: AUTH_ACTIONS.AUTH_FAILURE,
        payload: { message: error?.status === 401 ? '' : error?.message },
      })
      return null
    }
  }, [])

  useEffect(() => {
    if (hasRestored.current) return
    hasRestored.current = true
    refreshUser()
  }, [refreshUser])

  const login = useCallback(async (credentials) => {
    const session = await loginCustomer(credentials)
    dispatch({ type: AUTH_ACTIONS.AUTH_SUCCESS, payload: session })
    return session.user
  }, [])

  const register = useCallback(async (details) => {
    const session = await registerCustomer(details)
    dispatch({ type: AUTH_ACTIONS.AUTH_SUCCESS, payload: session })
    return session.user
  }, [])

  const logout = useCallback(async () => {
    try {
      await logoutCustomer(state.token)
    } catch {
      // Local state must still clear if the server session already expired.
    } finally {
      dispatch({ type: AUTH_ACTIONS.LOGOUT })
    }
  }, [state.token])

  const forgotPassword = useCallback(
    (email) => requestPasswordReset(email),
    [],
  )

  const resetPassword = useCallback(
    (details) => resetCustomerPassword(details),
    [],
  )

  const value = useMemo(() => ({
    user: state.user,
    token: state.token,
    session: state.session,
    loading: state.loading,
    isAuthenticated: Boolean(state.user),
    login,
    register,
    logout,
    forgotPassword,
    resetPassword,
    refreshUser,
  }), [
    forgotPassword,
    login,
    logout,
    refreshUser,
    register,
    resetPassword,
    state.loading,
    state.session,
    state.token,
    state.user,
  ])

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  )
}
