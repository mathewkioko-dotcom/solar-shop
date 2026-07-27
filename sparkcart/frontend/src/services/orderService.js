import {
  authenticatedRequest,
  resolveApiImageUrl,
} from './apiService'

const normalizeOrderItem = (item) => ({
  id: item?.id,
  productId: item?.product_id,
  productName: item?.product_name || 'Product',
  productSlug: item?.product_slug || '',
  productImage: resolveApiImageUrl(item?.product_image),
  unitPrice: Number(item?.unit_price) || 0,
  quantity: Number(item?.quantity) || 0,
  lineTotal: Number(item?.line_total) || 0,
})

export const normalizeOrder = (order) => ({
  orderNumber: order?.order_number || '',
  customerEmail: order?.customer_email || '',
  customerPhone: order?.customer_phone || '',
  deliveryAddress: order?.delivery_address || {},
  deliveryMethod: order?.delivery_method || '',
  paymentMethod: order?.payment_method || '',
  paymentStatus: order?.payment_status || 'pending',
  orderStatus: order?.order_status || 'pending',
  subtotal: Number(order?.subtotal) || 0,
  deliveryAmount: Number(order?.delivery_amount) || 0,
  taxAmount: Number(order?.tax_amount) || 0,
  total: Number(order?.total) || 0,
  currency: order?.currency || 'KES',
  itemCount: Number(order?.item_count) || 0,
  items: Array.isArray(order?.items) ? order.items.map(normalizeOrderItem) : [],
  placedAt: order?.placed_at || order?.created_at || '',
})

export const getOrders = async (token, page = 1, signal) => {
  const payload = await authenticatedRequest(`/orders?page=${page}`, { token, signal })
  const pagination = Array.isArray(payload)
    ? { data: payload }
    : Array.isArray(payload?.data)
      ? payload
      : payload?.data && Array.isArray(payload.data.data)
        ? payload.data
        : null

  return {
    orders: (pagination?.data || []).map(normalizeOrder),
    meta: pagination?.meta || payload?.meta || {},
    links: pagination?.links || payload?.links || {},
  }
}

export const getOrder = async (orderNumber, token, signal) => {
  const payload = await authenticatedRequest(
    `/orders/${encodeURIComponent(orderNumber)}`,
    { token, signal },
  )
  return normalizeOrder(payload?.data || payload)
}
