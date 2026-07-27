import { clearStoredAuth, getStoredAuthToken } from './authService'
import { API_BASE_URL } from './apiConfig'
import { fetchWithTimeout, RequestTimeoutError } from './requestTimeout'

export { API_BASE_URL } from './apiConfig'

export class ApiServiceError extends Error {
  constructor(message, status = 0, errors = {}, code = '') {
    super(message)
    this.name = 'ApiServiceError'
    this.status = status
    this.errors = errors
    this.code = code
  }
}

const firstValidationMessage = (errors) => {
  if (!errors || typeof errors !== 'object') return ''

  for (const value of Object.values(errors)) {
    if (Array.isArray(value) && value[0]) return String(value[0])
    if (value) return String(value)
  }

  return ''
}

export const authenticatedRequest = async (path, options = {}) => {
  const token = Object.hasOwn(options, 'token')
    ? options.token
    : getStoredAuthToken()
  const headers = {
    Accept: 'application/json',
    ...(options.body ? { 'Content-Type': 'application/json' } : {}),
    ...(options.headers || {}),
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  }

  let response
  try {
    response = await fetchWithTimeout(`${API_BASE_URL}${path}`, {
      method: options.method || 'GET',
      headers,
      body: options.body ? JSON.stringify(options.body) : undefined,
      signal: options.signal,
    }, options.timeoutMs)
  } catch (error) {
    if (error?.name === 'AbortError') throw error
    if (error instanceof RequestTimeoutError) {
      throw new ApiServiceError(
        'The shop service did not respond in time.',
        0,
        {},
        'REQUEST_TIMEOUT',
      )
    }
    throw new ApiServiceError('Unable to connect to the shop service.')
  }

  if (response.status === 204) return {}

  let payload
  try {
    payload = await response.json()
  } catch {
    throw new ApiServiceError('The shop service returned an unreadable response.', response.status)
  }

  if (!response.ok) {
    if (response.status === 401 && token) clearStoredAuth()
    const errors = payload?.errors && typeof payload.errors === 'object'
      ? payload.errors
      : {}
    throw new ApiServiceError(
      firstValidationMessage(errors)
        || payload?.message
        || 'The request could not be completed.',
      response.status,
      errors,
    )
  }

  return payload
}

export const resolveApiImageUrl = (path) => {
  if (!path || typeof path !== 'string') return null
  if (/^(https?:)?\/\//i.test(path) || path.startsWith('data:')) return path

  return `${API_BASE_URL.replace(/\/api$/, '')}/${path.replace(/^\/+/, '')}`
}
