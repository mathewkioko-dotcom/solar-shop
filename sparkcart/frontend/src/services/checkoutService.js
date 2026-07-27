import { authenticatedRequest } from './apiService'

const CHECKOUT_CREATE_TIMEOUT_MS = 30000
const CHECKOUT_RECOVERY_TIMEOUT_MS = 15000

export const normalizeKenyanPhone = (value) => {
  const phone = String(value || '').trim().replace(/[\s()-]+/g, '')
  if (/^0[17]\d{8}$/.test(phone)) return `+254${phone.slice(1)}`
  if (/^254[17]\d{8}$/.test(phone)) return `+${phone}`
  return phone
}

export const isValidKenyanPhone = (value) => (
  /^\+254[17]\d{8}$/.test(normalizeKenyanPhone(value))
)

export const getSavedAddresses = async (token, signal) => {
  const payload = await authenticatedRequest('/addresses', { token, signal })
  return Array.isArray(payload) ? payload : payload?.data || []
}

export const createCheckoutOrder = async (checkout, token) => (
  authenticatedRequest('/checkout/orders', {
    method: 'POST',
    token: token || null,
    body: checkout,
    timeoutMs: CHECKOUT_CREATE_TIMEOUT_MS,
  })
)

export const recoverCheckoutOrder = async ({
  submissionId,
  recoverySecret,
  token,
}) => authenticatedRequest(
  `/checkout/orders/recover/${encodeURIComponent(submissionId)}`,
  {
    token: token || null,
    timeoutMs: CHECKOUT_RECOVERY_TIMEOUT_MS,
    headers: {
      'X-Checkout-Recovery-Secret': recoverySecret,
    },
  },
)

export const getGuestOrder = async (guestToken, signal) => (
  authenticatedRequest(`/guest-orders/${encodeURIComponent(guestToken)}`, {
    token: null,
    signal,
  })
)
