import { API_BASE_URL } from './apiConfig'
import { fetchWithTimeout, RequestTimeoutError } from './requestTimeout'
import { normalizeAuthenticatedUser } from './authUser'

const AUTH_API_BASE_URL = (
  import.meta.env.VITE_AUTH_API_BASE_URL
  || `${API_BASE_URL}/auth`
).replace(/\/+$/, '')

export const AUTH_REQUEST_TIMEOUT_MS = 30000
export const AUTH_TOKEN_STORAGE_KEY = 'baraka_solar_auth_token_v1'
const SESSION_TOKEN_KEY = 'baraka_solar_auth_session_v1'

export class AuthServiceError extends Error {
  constructor(message, status = 0, errors = {}, code = '') {
    super(message)
    this.name = 'AuthServiceError'
    this.status = status
    this.errors = errors
    this.code = code
  }
}

const cleanText = (value) => (
  typeof value === 'string' ? value.trim() : ''
)

const readStorageValue = (storage, key) => {
  try {
    return storage?.getItem(key) || ''
  } catch {
    return ''
  }
}

const removeStorageValue = (storage, key) => {
  try {
    storage?.removeItem(key)
  } catch {
    // Storage may be unavailable in restricted browser environments.
  }
}

const getBrowserStorage = (name) => {
  if (typeof window === 'undefined') return null

  try {
    return window[name] || null
  } catch {
    return null
  }
}

export const getStoredAuthToken = () => {
  if (typeof window === 'undefined') return null

  return readStorageValue(
    getBrowserStorage('localStorage'),
    AUTH_TOKEN_STORAGE_KEY,
  ) || null
}

export const persistAuthToken = (token) => {
  if (typeof window === 'undefined') return

  const normalizedToken = cleanText(token)
  if (!normalizedToken) return

  try {
    removeStorageValue(getBrowserStorage('sessionStorage'), SESSION_TOKEN_KEY)
    getBrowserStorage('localStorage')?.setItem(AUTH_TOKEN_STORAGE_KEY, normalizedToken)
  } catch {
    // Storage may be unavailable in restricted browser environments.
  }
}

export const clearStoredAuth = () => {
  if (typeof window === 'undefined') return

  removeStorageValue(getBrowserStorage('localStorage'), AUTH_TOKEN_STORAGE_KEY)
  removeStorageValue(getBrowserStorage('sessionStorage'), SESSION_TOKEN_KEY)
}

const parseResponse = async (response) => {
  if (response.status === 204) return {}

  try {
    return await response.json()
  } catch {
    throw new AuthServiceError('The authentication service returned an unreadable response.', response.status)
  }
}

const request = async (path, options = {}) => {
  const token = Object.hasOwn(options, 'token')
    ? options.token
    : getStoredAuthToken()
  const headers = {
    Accept: 'application/json',
    ...(options.body ? { 'Content-Type': 'application/json' } : {}),
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  }

  let response
  try {
    response = await fetchWithTimeout(`${AUTH_API_BASE_URL}${path}`, {
      method: options.method || 'GET',
      headers,
      body: options.body ? JSON.stringify(options.body) : undefined,
      signal: options.signal,
    }, options.timeoutMs ?? AUTH_REQUEST_TIMEOUT_MS)
  } catch (error) {
    if (error?.name === 'AbortError') throw error
    if (error instanceof RequestTimeoutError) {
      throw new AuthServiceError(
        options.timeoutMessage || 'The authentication service did not respond in time.',
        0,
        {},
        options.timeoutCode || 'AUTH_REQUEST_TIMEOUT',
      )
    }
    throw new AuthServiceError('Unable to connect to the authentication service.')
  }

  const payload = await parseResponse(response)
  if (!response.ok) {
    throw new AuthServiceError(
      cleanText(payload?.message) || 'The authentication request could not be completed.',
      response.status,
      payload?.errors && typeof payload.errors === 'object' ? payload.errors : {},
    )
  }

  return payload
}

const getToken = (payload) => (
  cleanText(payload?.token)
  || cleanText(payload?.access_token)
  || cleanText(payload?.data?.token)
  || null
)

export const refreshAuthenticatedUser = async (token = getStoredAuthToken(), signal) => {
  const payload = await request('/user', { token, signal })
  const user = normalizeAuthenticatedUser(payload)

  if (!user) {
    throw new AuthServiceError('The authentication service returned an invalid customer session.')
  }

  return {
    user,
    token,
    session: 'token',
  }
}

export const loginCustomer = async ({ email, password, remember = false }) => {
  const payload = await request('/login', {
    method: 'POST',
    token: null,
    timeoutMs: AUTH_REQUEST_TIMEOUT_MS,
    body: { email, password, remember },
  })
  const token = getToken(payload)
  const user = normalizeAuthenticatedUser(payload)

  if (!token || !user) {
    throw new AuthServiceError('The authentication service returned an invalid login response.')
  }

  persistAuthToken(token)
  return { user, token, session: 'token', remember }
}

export const registerCustomer = async ({
  firstName,
  lastName,
  email,
  password,
  passwordConfirmation,
}) => {
  const payload = await request('/register', {
    method: 'POST',
    token: null,
    timeoutMs: AUTH_REQUEST_TIMEOUT_MS,
    timeoutCode: 'REGISTRATION_OUTCOME_UNKNOWN',
    timeoutMessage: 'Registration took longer than expected. Your account may already have been created, so please try signing in before registering again.',
    body: {
      first_name: firstName,
      last_name: lastName,
      name: `${firstName} ${lastName}`.trim(),
      email,
      password,
      password_confirmation: passwordConfirmation,
    },
  })
  const token = getToken(payload)
  const user = normalizeAuthenticatedUser(payload)

  if (!token || !user) {
    throw new AuthServiceError('The authentication service returned an invalid registration response.')
  }

  persistAuthToken(token)
  return { user, token, session: 'token' }
}

export const logoutCustomer = async (token = getStoredAuthToken()) => {
  if (!token) return
  await request('/logout', { method: 'POST', token })
}

export const requestPasswordReset = async (email) => {
  const payload = await request('/forgot-password', {
    method: 'POST',
    token: null,
    timeoutMs: AUTH_REQUEST_TIMEOUT_MS,
    body: { email },
  })

  return cleanText(payload?.message)
    || 'If an account exists for that email, a password reset link has been sent.'
}

export const resetCustomerPassword = async ({
  email,
  token,
  password,
  passwordConfirmation,
}) => {
  const payload = await request('/reset-password', {
    method: 'POST',
    token: null,
    timeoutMs: AUTH_REQUEST_TIMEOUT_MS,
    body: {
      email,
      token,
      password,
      password_confirmation: passwordConfirmation,
    },
  })

  return cleanText(payload?.message)
    || 'Your password has been reset. You can now sign in.'
}
