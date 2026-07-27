const DEFAULT_API_BASE_URL = 'http://localhost:8000/api'

export const API_BASE_URL = (
  import.meta.env.VITE_API_BASE_URL || DEFAULT_API_BASE_URL
).replace(/\/+$/, '')

export const BACKEND_BASE_URL = API_BASE_URL.replace(/\/api\/?$/, '')
