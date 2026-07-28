export const faqCategories = [
  {
    category: 'Ordering',
    items: [
      { id: 'place-order', question: 'How do I place an order?', answer: 'Browse the catalog, add suitable products to your cart, review the quantities, and continue through checkout. Our team may contact you to verify product compatibility, stock, delivery, and payment details.' },
      { id: 'guest-order', question: 'Can I order without creating an account?', answer: 'Yes. Guest checkout is available. An account is optional, but it makes it easier to review order history and use saved delivery details.' },
      { id: 'change-order', question: 'Can I change an order after placing it?', answer: 'Contact support promptly with your order number. A change may be possible before stock is allocated or dispatch begins, but it cannot be guaranteed.' },
    ],
  },
  {
    category: 'Payments',
    items: [
      { id: 'payment-methods', question: 'Which payment methods will be supported?', answer: 'M-Pesa and card payments are being integrated. The methods currently available for an order will be shown during checkout and confirmed by our team where necessary.' },
      { id: 'payment-security', question: 'Is payment information secure?', answer: 'Enabled payment providers will process sensitive payment credentials through their own secure systems. Baraka Solar Shop should not directly store full card details or ask for an M-Pesa PIN.' },
      { id: 'mpesa', question: 'Can I pay using M-Pesa?', answer: 'M-Pesa integration is in progress. Its availability will be shown during checkout when it is ready for use.' },
    ],
  },
  {
    category: 'Delivery',
    items: [
      { id: 'delivery-coverage', question: 'Where do you deliver?', answer: 'Delivery can be arranged within Nairobi and to many locations across Kenya. Coverage for a specific address and equipment type is confirmed during checkout or by support.' },
      { id: 'delivery-time', question: 'How long does delivery take?', answer: 'Timelines depend on stock, destination, order verification, and the size of the equipment. An estimate is confirmed for each order rather than promised as a fixed timeframe.' },
      { id: 'collection', question: 'Can I collect my order?', answer: 'Pickup may be available by prior arrangement. Wait for confirmation of the pickup location and collection time before travelling.' },
    ],
  },
  {
    category: 'Products',
    items: [
      { id: 'product-selection', question: 'How do I select the correct solar panel, battery, or inverter?', answer: 'Start with your energy needs, appliance loads, expected runtime, installation environment, and system voltage. Contact our team for guidance before combining equipment if you are unsure.' },
      { id: 'genuine-products', question: 'Are the products genuine?', answer: 'Baraka Solar Shop aims to source genuine products from established manufacturers and distributors. Confirm any product-specific certification or serial-number requirement before purchase.' },
      { id: 'specifications', question: 'Where can I find product specifications and datasheets?', answer: 'Available specifications appear on product pages. Manufacturer datasheets may also be provided there or supplied by support when available.' },
    ],
  },
  {
    category: 'Installation',
    items: [
      { id: 'installation-service', question: 'Does Baraka Solar Shop provide installation?', answer: 'Installation availability depends on location, project scope, and the equipment selected. Contact support for an assessment and a separate installation arrangement.' },
      { id: 'self-install', question: 'Can I install solar equipment myself?', answer: 'Solar and battery systems can involve hazardous voltage, current, stored energy, and structural work. Installation should only be performed by a person with the appropriate technical competence.' },
      { id: 'professional-install', question: 'Why is professional installation recommended?', answer: 'Correct sizing, protection, earthing, cable selection, ventilation, mounting, and configuration affect safety, performance, equipment life, and warranty eligibility.' },
    ],
  },
  {
    category: 'Warranty',
    items: [
      { id: 'warranty-included', question: 'Do products include warranties?', answer: 'Warranty periods and coverage vary by manufacturer and product. Details on the product page or manufacturer datasheet take priority.' },
      { id: 'warranty-claim', question: 'How do I make a warranty claim?', answer: 'Contact support with your proof of purchase, product details, serial number where available, installation information, and a clear description of the fault.' },
    ],
  },
  {
    category: 'Returns',
    items: [
      { id: 'return-product', question: 'Can I return a product?', answer: 'Eligibility depends on the product, its condition, the reason for return, and the final approved returns policy. Contact support promptly after delivery before sending anything back.' },
      { id: 'damaged-product', question: 'What should I do if a product arrives damaged?', answer: 'Record the condition of the package and product with clear photos, keep all packaging, note the issue on delivery where possible, and contact support promptly.' },
    ],
  },
  {
    category: 'Customer Accounts',
    items: [
      { id: 'account-required', question: 'Do I need an account?', answer: 'No. You can browse and use guest checkout without an account. Creating one provides access to account features such as order history.' },
      { id: 'view-orders', question: 'Where can I view my orders?', answer: 'Sign in and open My Account, then select View Orders. Guest orders use the secure confirmation link created at checkout.' },
      { id: 'reset-password', question: 'How do I reset my password?', answer: 'Select Forgot password on the sign-in page, enter your account email, and follow the secure reset instructions when email delivery is enabled.' },
    ],
  },
]

export function filterFaqCategories(categories, searchTerm) {
  const query = String(searchTerm || '').trim().toLocaleLowerCase()
  if (!query) return categories

  return categories
    .map((group) => ({
      ...group,
      items: group.items.filter((item) => (
        item.question.toLocaleLowerCase().includes(query)
        || item.answer.toLocaleLowerCase().includes(query)
        || group.category.toLocaleLowerCase().includes(query)
      )),
    }))
    .filter((group) => group.items.length > 0)
}
