import { useCallback, useEffect, useMemo, useReducer, useRef } from 'react'
import { AuthContext } from '../hooks/useAuth'
import {
  clearStoredAuth,
  AUTH_TOKEN_STORAGE_KEY,
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
  const [state, dispatch] = useReducer(
    authReducer,
    undefined,
    () => ({
      ...initialAuthState,
      loading: Boolean(getStoredAuthToken()),
    }),
  )
  const restorationControllerRef = useRef(null)

  const restoreSession = useCallback(async (token, showLoading = true) => {
    if (!token) {
      clearStoredAuth()
      dispatch({ type: AUTH_ACTIONS.LOGOUT })
      return null
    }

    restorationControllerRef.current?.abort()
    const controller = new AbortController()
    restorationControllerRef.current = controller
    if (showLoading) dispatch({ type: AUTH_ACTIONS.RESTORE_START })

    try {
      const session = await refreshAuthenticatedUser(token, controller.signal)
      if (controller.signal.aborted) return null
      dispatch({ type: AUTH_ACTIONS.AUTH_SUCCESS, payload: session })
      return session.user
    } catch (error) {
      if (controller.signal.aborted) return null
      clearStoredAuth()
      dispatch({
        type: AUTH_ACTIONS.AUTH_FAILURE,
        payload: { message: error?.status === 401 ? '' : error?.message },
      })
      return null
    } finally {
      if (restorationControllerRef.current === controller) {
        restorationControllerRef.current = null
      }
    }
  }, [])

  useEffect(() => {
    const token = getStoredAuthToken()
    if (!token) return undefined

    const restoreTimer = window.setTimeout(() => {
      restoreSession(token, false)
    }, 0)

    return () => window.clearTimeout(restoreTimer)
  }, [restoreSession])

  useEffect(() => {
    const invalidate = () => {
      restorationControllerRef.current?.abort()
      clearStoredAuth()
      dispatch({ type: AUTH_ACTIONS.LOGOUT })
    }
    window.addEventListener('baraka:auth-invalidated', invalidate)
    return () => window.removeEventListener('baraka:auth-invalidated', invalidate)
  }, [])

  useEffect(() => {
    const synchronizeAuth = (event) => {
      if (event.key !== AUTH_TOKEN_STORAGE_KEY) {
        return
      }

      const token = typeof event.newValue === 'string' ? event.newValue.trim() : ''
      if (!token) {
        restorationControllerRef.current?.abort()
        dispatch({ type: AUTH_ACTIONS.LOGOUT })
        return
      }

      restoreSession(token)
    }

    window.addEventListener('storage', synchronizeAuth)
    return () => window.removeEventListener('storage', synchronizeAuth)
  }, [restoreSession])

  useEffect(() => () => {
    restorationControllerRef.current?.abort()
  }, [])

  const refreshUser = useCallback(() => (
    restoreSession(getStoredAuthToken())
  ), [restoreSession])

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

  const logout = useCallback(() => {
    const token = state.token || getStoredAuthToken()
    restorationControllerRef.current?.abort()
    clearStoredAuth()
    dispatch({ type: AUTH_ACTIONS.LOGOUT })

    logoutCustomer(token).catch(() => {
      // Local logout remains complete if remote token revocation is unavailable.
    })
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
