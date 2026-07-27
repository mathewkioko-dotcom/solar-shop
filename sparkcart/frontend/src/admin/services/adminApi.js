import { authenticatedRequest, ApiServiceError } from '../../services/apiService'
import { getStoredAuthToken } from '../../services/authService'

const ADMIN_TIMEOUT_MS = 20_000
const catalogCache = new Map()

const notifyAuthInvalidated = () => {
  window.dispatchEvent(new CustomEvent('baraka:auth-invalidated'))
}

const request = async (path, options = {}) => {
  try {
    return await authenticatedRequest(`/admin${path}`, {
      ...options,
      timeoutMs: options.timeoutMs ?? ADMIN_TIMEOUT_MS,
    })
  } catch (error) {
    if (error?.status === 401) notifyAuthInvalidated()
    if (error?.status === 403) {
      throw new ApiServiceError(
        'Your account does not have administrator access.',
        403,
        error.errors,
      )
    }
    throw error
  }
}

const multipartRequest = async (path, formData, method = 'POST', signal) => {
  const token = getStoredAuthToken()
  const controller = new AbortController()
  const timeout = window.setTimeout(() => controller.abort('timeout'), ADMIN_TIMEOUT_MS)
  const abort = () => controller.abort()
  signal?.addEventListener('abort', abort, { once: true })

  try {
    const response = await fetch(`${import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000/api'}/admin${path}`, {
      method,
      headers: {
        Accept: 'application/json',
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      },
      body: formData,
      signal: controller.signal,
    })
    const payload = response.status === 204 ? {} : await response.json()
    if (!response.ok) {
      if (response.status === 401) notifyAuthInvalidated()
      throw new ApiServiceError(
        response.status === 403
          ? 'Your account does not have administrator access.'
          : payload?.message || 'The request could not be completed.',
        response.status,
        payload?.errors || {},
      )
    }
    return payload
  } catch (error) {
    if (error instanceof ApiServiceError) throw error
    if (controller.signal.aborted && !signal?.aborted) {
      throw new ApiServiceError('The admin service did not respond in time.', 0, {}, 'REQUEST_TIMEOUT')
    }
    throw error
  } finally {
    window.clearTimeout(timeout)
    signal?.removeEventListener('abort', abort)
  }
}

const queryPath = (path, params = {}) => {
  const query = new URLSearchParams()
  Object.entries(params).forEach(([key, value]) => {
    if (value !== '' && value !== null && value !== undefined) query.set(key, String(value))
  })
  const suffix = query.toString()
  return suffix ? `${path}?${suffix}` : path
}

export const adminProducts = {
  list: (params, signal) => request(queryPath('/products', params), { signal }),
  get: (id, signal) => request(`/products/${id}`, { signal }),
  create: (body, signal) => request('/products', { method: 'POST', body, signal }),
  update: (id, body, signal) => request(`/products/${id}`, { method: 'PATCH', body, signal }),
  archive: (id) => request(`/products/${id}`, { method: 'DELETE' }),
  restore: (id) => request(`/products/${id}/restore`, { method: 'POST' }),
  removePermanently: (id) => request(`/products/${id}/force`, { method: 'DELETE', body: { confirmation: 'DELETE' } }),
  stock: (id, stock) => request(`/products/${id}/stock`, { method: 'PATCH', body: { stock } }),
  featured: (id, value) => request(`/products/${id}/featured`, { method: 'PATCH', body: { is_featured: value } }),
  active: (id, value) => request(`/products/${id}/active`, { method: 'PATCH', body: { is_active: value } }),
  uploadImage: (id, file, metadata = {}, signal) => {
    const form = new FormData()
    form.append('image', file)
    if (metadata.alt_text) form.append('alt_text', metadata.alt_text)
    form.append('display_order', String(metadata.display_order ?? 0))
    form.append('is_primary', metadata.is_primary ? '1' : '0')
    return multipartRequest(`/products/${id}/images`, form, 'POST', signal)
  },
  removeImage: (productId, imageId) => request(`/products/${productId}/images/${imageId}`, { method: 'DELETE' }),
  updateImage: (productId, imageId, metadata) => request(`/products/${productId}/images/${imageId}`, { method: 'PATCH', body: metadata }),
  setPrimaryImage: (productId, imageId) => request(`/products/${productId}/images/${imageId}/primary`, { method: 'PATCH', body: {} }),
  uploadDatasheet: (id, file, signal) => {
    const form = new FormData()
    form.append('datasheet', file)
    return multipartRequest(`/products/${id}/datasheet`, form, 'POST', signal)
  },
  removeDatasheet: (id) => request(`/products/${id}/datasheet`, { method: 'DELETE' }),
}

export const getAdminDashboard = (signal) => request('/dashboard', { signal })

export const adminBrands = {
  list: (params = {}, signal) => request(queryPath('/brands', params), { signal }),
  get: (id, signal) => request(`/brands/${id}`, { signal }),
  save: (id, values, logo, signal) => {
    const form = new FormData()
    Object.entries(values).forEach(([key, value]) => {
      if (value !== null && value !== undefined) form.append(key, typeof value === 'boolean' ? (value ? '1' : '0') : value)
    })
    if (logo) form.append('logo', logo)
    if (id) form.append('_method', 'PATCH')
    return multipartRequest(id ? `/brands/${id}` : '/brands', form, 'POST', signal)
  },
  archive: (id) => request(`/brands/${id}`, { method: 'DELETE' }),
  setActive: (id, isActive) => request(`/brands/${id}/active`, { method: 'PATCH', body: { is_active: isActive } }),
  restore: (id) => request(`/brands/${id}/restore`, { method: 'POST' }),
  removePermanently: (id) => request(`/brands/${id}/force`, { method: 'DELETE', body: { confirmation: 'DELETE' } }),
  removeLogo: (id) => request(`/brands/${id}/logo`, { method: 'DELETE' }),
}

export const adminCategories = {
  list: (params = {}, signal) => request(queryPath('/categories', params), { signal }),
  create: (body) => request('/categories', { method: 'POST', body }),
  update: (id, body) => request(`/categories/${id}`, { method: 'PATCH', body }),
  archive: (id) => request(`/categories/${id}`, { method: 'DELETE' }),
}

export const getAdminCatalogs = async (signal) => {
  if (catalogCache.has('catalogs')) return catalogCache.get('catalogs')
  const promise = Promise.all([
    adminBrands.list({ per_page: 100 }, signal),
    adminCategories.list({ per_page: 100 }, signal),
  ]).then(([brands, categories]) => ({
    brands: brands.data || [],
    categories: categories.data || [],
  })).catch((error) => {
    catalogCache.delete('catalogs')
    throw error
  })
  catalogCache.set('catalogs', promise)
  return promise
}

export const clearAdminCatalogCache = () => catalogCache.clear()
