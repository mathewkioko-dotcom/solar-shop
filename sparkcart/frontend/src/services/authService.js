const DEFAULT_API_BASE_URL = 'http://localhost:8000/api'
const API_BASE_URL = (import.meta.env.VITE_API_BASE_URL || DEFAULT_API_BASE_URL).replace(/\/+$/, '')
const BACKEND_BASE_URL = API_BASE_URL.replace(/\/api\/?$/, '')
const AUTH_API_BASE_URL = (
  import.meta.env.VITE_AUTH_API_BASE_URL
  || `${API_BASE_URL}/auth`
).replace(/\/+$/, '')

const PERSISTENT_TOKEN_KEY = 'baraka_solar_auth_token_v1'
const SESSION_TOKEN_KEY = 'baraka_solar_auth_session_v1'

export class AuthServiceError extends Error {
  constructor(message, status = 0, errors = {}) {
    super(message)
    this.name = 'AuthServiceError'
    this.status = status
    this.errors = errors
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

  const persistentToken = readStorageValue(
    getBrowserStorage('localStorage'),
    PERSISTENT_TOKEN_KEY,
  )
  if (persistentToken) return persistentToken

  return readStorageValue(
    getBrowserStorage('sessionStorage'),
    SESSION_TOKEN_KEY,
  ) || null
}

export const persistAuthToken = (token, remember = false) => {
  if (typeof window === 'undefined') return

  clearStoredAuth()
  const normalizedToken = cleanText(token)
  if (!normalizedToken) return

  try {
    const storage = getBrowserStorage(remember ? 'localStorage' : 'sessionStorage')
    const key = remember ? PERSISTENT_TOKEN_KEY : SESSION_TOKEN_KEY
    storage?.setItem(key, normalizedToken)
  } catch {
    // Cookie-based Sanctum sessions continue to work when storage is blocked.
  }
}

export const clearStoredAuth = () => {
  if (typeof window === 'undefined') return

  removeStorageValue(getBrowserStorage('localStorage'), PERSISTENT_TOKEN_KEY)
  removeStorageValue(getBrowserStorage('sessionStorage'), SESSION_TOKEN_KEY)
}

const getXsrfToken = () => {
  if (typeof document === 'undefined') return ''

  const cookie = document.cookie
    .split('; ')
    .find((entry) => entry.startsWith('XSRF-TOKEN='))

  if (!cookie) return ''

  try {
    return decodeURIComponent(cookie.slice('XSRF-TOKEN='.length))
  } catch {
    return ''
  }
}

const primeCsrfCookie = async () => {
  try {
    await fetch(`${BACKEND_BASE_URL}/sanctum/csrf-cookie`, {
      credentials: 'include',
      headers: { Accept: 'application/json' },
    })
  } catch {
    // Personal-access-token APIs do not require the Sanctum SPA cookie.
  }
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
  const xsrfToken = getXsrfToken()
  const headers = {
    Accept: 'application/json',
    ...(options.body ? { 'Content-Type': 'application/json' } : {}),
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
    ...(xsrfToken ? { 'X-XSRF-TOKEN': xsrfToken } : {}),
  }

  let response
  try {
    response = await fetch(`${AUTH_API_BASE_URL}${path}`, {
      method: options.method || 'GET',
      credentials: 'include',
      headers,
      body: options.body ? JSON.stringify(options.body) : undefined,
      signal: options.signal,
    })
  } catch (error) {
    if (error?.name === 'AbortError') throw error
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

const normalizeUser = (payload) => {
  const candidate = payload?.user ?? payload?.data?.user ?? payload?.data
  if (!candidate || typeof candidate !== 'object' || Array.isArray(candidate)) return null

  const id = candidate.id
  const email = cleanText(candidate.email)
  const firstName = cleanText(candidate.first_name)
  const lastName = cleanText(candidate.last_name)
  const fullName = cleanText(candidate.name)
    || [firstName, lastName].filter(Boolean).join(' ')

  if (
    (!Number.isInteger(id) && !cleanText(id))
    || !email
    || !fullName
  ) {
    return null
  }

  return {
    id,
    name: fullName,
    firstName: firstName || fullName.split(/\s+/)[0],
    lastName,
    email,
    createdAt: cleanText(candidate.created_at),
  }
}

const getToken = (payload) => (
  cleanText(payload?.token)
  || cleanText(payload?.access_token)
  || cleanText(payload?.data?.token)
  || null
)

export const refreshAuthenticatedUser = async (token = getStoredAuthToken(), signal) => {
  const payload = await request('/user', { token, signal })
  const user = normalizeUser(payload)

  if (!user) {
    throw new AuthServiceError('The authentication service returned an invalid customer session.')
  }

  return {
    user,
    token,
    session: token ? 'token' : 'cookie',
  }
}

export const loginCustomer = async ({ email, password, remember = false }) => {
  await primeCsrfCookie()
  const payload = await request('/login', {
    method: 'POST',
    token: null,
    body: { email, password, remember },
  })
  const token = getToken(payload)
  const user = normalizeUser(payload)

  if (token) persistAuthToken(token, remember)

  if (user) {
    return { user, token, session: token ? 'token' : 'cookie' }
  }

  return refreshAuthenticatedUser(token)
}

export const registerCustomer = async ({
  firstName,
  lastName,
  email,
  password,
  passwordConfirmation,
}) => {
  await primeCsrfCookie()
  const payload = await request('/register', {
    method: 'POST',
    token: null,
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
  const user = normalizeUser(payload)

  if (token) persistAuthToken(token, true)

  if (user) {
    return { user, token, session: token ? 'token' : 'cookie' }
  }

  return refreshAuthenticatedUser(token)
}

export const logoutCustomer = async (token = getStoredAuthToken()) => {
  try {
    await request('/logout', { method: 'POST', token })
  } finally {
    clearStoredAuth()
  }
}

export const requestPasswordReset = async (email) => {
  await primeCsrfCookie()
  const payload = await request('/forgot-password', {
    method: 'POST',
    token: null,
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
  await primeCsrfCookie()
  const payload = await request('/reset-password', {
    method: 'POST',
    token: null,
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
