import { useEffect, useRef, useState } from 'react'
import { Link, Navigate, useNavigate } from 'react-router-dom'
import CheckoutAddressForm from '../../components/checkout/CheckoutAddressForm'
import CheckoutContactForm from '../../components/checkout/CheckoutContactForm'
import CheckoutProgress from '../../components/checkout/CheckoutProgress'
import CheckoutSummary from '../../components/checkout/CheckoutSummary'
import { useAuth } from '../../hooks/useAuth'
import { useCart } from '../../hooks/useCart'
import { useWishlist } from '../../hooks/useWishlist'
import { useToast } from '../../hooks/useToast'
import SiteLayout from '../../layouts/SiteLayout'
import {
  createCheckoutOrder,
  getSavedAddresses,
  isValidKenyanPhone,
  normalizeKenyanPhone,
  recoverCheckoutOrder,
} from '../../services/checkoutService'
import '../../styles/checkout.css'

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

const createSubmissionId = () => {
  if (globalThis.crypto?.randomUUID) return globalThis.crypto.randomUUID()

  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (character) => {
    const random = Math.floor(Math.random() * 16)
    const value = character === 'x' ? random : (random & 0x3) | 0x8
    return value.toString(16)
  })
}

const createRecoverySecret = () => {
  if (!globalThis.crypto?.getRandomValues) {
    throw new Error('Secure checkout recovery is unavailable in this browser.')
  }

  const bytes = new Uint8Array(32)
  globalThis.crypto.getRandomValues(bytes)

  return Array.from(bytes, (byte) => byte.toString(16).padStart(2, '0')).join('')
}

const emptyAddress = {
  label: '',
  county: '',
  city: '',
  street_address: '',
  building_details: '',
  postal_code: '',
  delivery_instructions: '',
}

const requiredAddressFields = [
  ['county', 'Enter the delivery county.'],
  ['city', 'Enter the town or city.'],
  ['street_address', 'Enter the street address.'],
]

const getPurchasedProductIds = (order) => {
  if (!Array.isArray(order?.items)) return []

  return order.items.reduce((productIds, item) => {
    if (!item || typeof item !== 'object' || Array.isArray(item)) return productIds

    const productId = item.product_id ?? item.productId ?? item.product?.id
    if (productId !== null && productId !== undefined) productIds.push(productId)

    return productIds
  }, [])
}

function CheckoutPage() {
  const navigate = useNavigate()
  const {
    token,
    user,
    isAuthenticated,
    loading: authLoading,
    logout,
  } = useAuth()
  const { clearCart, isHydrated, items, subtotal } = useCart()
  const { removeItems: removeWishlistItems } = useWishlist()
  const { showError, showInfo, showSuccess, showWarning } = useToast()
  const submissionIdRef = useRef(null)
  const recoverySecretRef = useRef(null)
  if (submissionIdRef.current == null) submissionIdRef.current = createSubmissionId()
  if (recoverySecretRef.current == null) recoverySecretRef.current = createRecoverySecret()
  const [completedOrder, setCompletedOrder] = useState(false)
  const [contact, setContact] = useState({
    first_name: user?.firstName || '',
    last_name: user?.lastName || '',
    email: user?.email || '',
    phone: '',
  })
  const [address, setAddress] = useState(emptyAddress)
  const [savedAddresses, setSavedAddresses] = useState([])
  const [selectedAddressId, setSelectedAddressId] = useState('')
  const [saveAddress, setSaveAddress] = useState(false)
  const [deliveryMethod, setDeliveryMethod] = useState('standard_delivery')
  const [paymentMethod, setPaymentMethod] = useState('pay_on_confirmation')
  const [legalAccepted, setLegalAccepted] = useState(false)
  const [legalError, setLegalError] = useState('')
  const [errors, setErrors] = useState({})
  const [feedback, setFeedback] = useState('')
  const [submitting, setSubmitting] = useState(false)

  useEffect(() => {
    if (!isAuthenticated || !token) return undefined

    const controller = new AbortController()
    getSavedAddresses(token, controller.signal)
      .then(setSavedAddresses)
      .catch((error) => {
        if (error?.name !== 'AbortError') {
          setSavedAddresses([])
          showError('Addresses Unavailable', error?.message || 'Saved addresses could not be loaded.')
        }
      })

    return () => controller.abort()
  }, [isAuthenticated, showError, token])

  if (!isHydrated) {
    return (
      <SiteLayout>
        <main className="checkout-page">
          <div className="checkout-page__route-status" role="status" aria-live="polite">
            Loading your checkout…
          </div>
        </main>
      </SiteLayout>
    )
  }

  if (items.length === 0 && !completedOrder) {
    return <Navigate to="/cart" replace />
  }

  const checkoutContact = {
    ...contact,
    first_name: contact.first_name || user?.firstName || '',
    last_name: contact.last_name || user?.lastName || '',
    email: isAuthenticated ? user?.email || '' : contact.email,
  }

  const updateContact = (event) => {
    const { name, value } = event.target
    setContact((current) => ({ ...current, [name]: value }))
    setErrors((current) => ({
      ...current,
      [`contact.${name}`]: '',
      ...(name === 'phone' ? { 'address.phone': '' } : {}),
    }))
    setFeedback('')
  }

  const updateAddress = (event) => {
    const { name, value } = event.target
    setAddress((current) => ({ ...current, [name]: value }))
    setSelectedAddressId('')
    setErrors((current) => ({ ...current, [`address.${name}`]: '' }))
    setFeedback('')
  }

  const selectSavedAddress = (event) => {
    const addressId = event.target.value
    setSelectedAddressId(addressId)
    const selected = savedAddresses.find((candidate) => String(candidate.id) === addressId)

    if (!selected) {
      setAddress(emptyAddress)
      return
    }

    setAddress(Object.fromEntries(
      Object.keys(emptyAddress).map((key) => [key, selected[key] || '']),
    ))
    setContact((current) => ({
      ...current,
      first_name: selected.first_name || current.first_name,
      last_name: selected.last_name || current.last_name,
      phone: selected.phone || current.phone,
    }))
    setSaveAddress(false)
    setErrors({})
  }

  const validate = () => {
    const nextErrors = {}
    if (!checkoutContact.first_name.trim()) nextErrors['contact.first_name'] = 'Enter your first name.'
    if (!checkoutContact.last_name.trim()) nextErrors['contact.last_name'] = 'Enter your last name.'
    if (!EMAIL_PATTERN.test(checkoutContact.email.trim())) {
      nextErrors['contact.email'] = 'Enter a valid email address.'
    }
    if (!isValidKenyanPhone(checkoutContact.phone)) {
      nextErrors['contact.phone'] = 'Enter a valid Kenyan phone number.'
    }

    requiredAddressFields.forEach(([name, message]) => {
      if (!address[name].trim()) nextErrors[`address.${name}`] = message
    })
    if (!legalAccepted) {
      setLegalError('You must agree to the Privacy Policy and Terms & Conditions.')
    }

    setErrors(nextErrors)
    return Object.keys(nextErrors).length === 0 && legalAccepted
  }

  const completeCheckout = (payload) => {
    const createdOrder = payload?.order
    const orderNumber = typeof payload?.order_number === 'string'
      ? payload.order_number.trim()
      : createdOrder?.order_number?.trim() || ''
    const guestToken = typeof payload?.guest_access_token === 'string'
      ? payload.guest_access_token.trim()
      : ''
    const accountDestinationIsValid = isAuthenticated && orderNumber
    const guestDestinationIsValid = !isAuthenticated && /^[a-f0-9]{64}$/i.test(guestToken)

    if (!createdOrder || !orderNumber || (!accountDestinationIsValid && !guestDestinationIsValid)) {
      throw new Error('The order response did not include a valid confirmation destination.')
    }

    setCompletedOrder(true)
    const purchasedProductIds = getPurchasedProductIds(createdOrder)
    if (purchasedProductIds.length > 0) removeWishlistItems(purchasedProductIds)
    clearCart()
    showSuccess('Order Placed', `Order ${orderNumber} was placed successfully.`, 7000)

    if (isAuthenticated) {
      navigate(`/account/orders/${encodeURIComponent(orderNumber)}`, {
        replace: true,
        state: { orderConfirmed: true, order: createdOrder },
      })
    } else {
      navigate(`/order-confirmation/${encodeURIComponent(guestToken)}`, {
        replace: true,
        state: { order: createdOrder },
      })
    }
  }

  const placeOrder = async (event) => {
    event.preventDefault()
    if (submitting || !validate()) {
      showWarning('Review Checkout Details', 'Review the highlighted checkout fields before placing your order.')
      return
    }

    setSubmitting(true)
    setFeedback('Securely verifying your order…')

    try {
      const normalizedPhone = normalizeKenyanPhone(checkoutContact.phone)
      const payload = await createCheckoutOrder({
        submission_id: submissionIdRef.current,
        checkout_recovery_secret: recoverySecretRef.current,
        contact: {
          first_name: checkoutContact.first_name.trim(),
          last_name: checkoutContact.last_name.trim(),
          email: checkoutContact.email.trim().toLowerCase(),
          phone: normalizedPhone,
        },
        address: {
          ...address,
          first_name: checkoutContact.first_name.trim(),
          last_name: checkoutContact.last_name.trim(),
          phone: normalizedPhone,
        },
        save_address: Boolean(isAuthenticated && saveAddress),
        delivery_method: deliveryMethod,
        payment_method: paymentMethod,
        legal_acceptance: true,
        items: items.map((item) => ({
          product_id: item.id,
          quantity: item.quantity,
          expected_unit_price: Number(item.price).toFixed(2),
        })),
      }, isAuthenticated ? token : null)

      completeCheckout(payload)
    } catch (error) {
      if (error?.code === 'REQUEST_TIMEOUT') {
        setFeedback('Checking your order status…')
        showInfo('Order Verification', 'Your order is taking longer than expected. We’re checking whether it was placed.', 8000)

        try {
          const recovered = await recoverCheckoutOrder({
            submissionId: submissionIdRef.current,
            recoverySecret: recoverySecretRef.current,
            token: isAuthenticated ? token : null,
          })
          completeCheckout(recovered)
          return
        } catch (recoveryError) {
          if (recoveryError?.status === 401 && token) logout()
          setErrors(recoveryError?.errors || {})
          setFeedback('')
          showError(
            'Order Status Unconfirmed',
            'We could not confirm whether your order was placed. Please try again using the same checkout session or contact support.',
            9000,
          )
          return
        }
      }

      if (error?.status === 401 && token) logout()
      setErrors(error?.errors || {})
      setFeedback('')
      showError('Order Placement Failed', error?.message || 'Your order could not be placed. Your cart has been preserved.', 8000)
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <SiteLayout>
      <main className="checkout-page">
        <div className="checkout-page__container">
          <nav className="checkout-page__breadcrumb" aria-label="Breadcrumb">
            <ol>
              <li><Link to="/">Home</Link></li>
              <li><Link to="/cart">Cart</Link></li>
              <li aria-current="page">Checkout</li>
            </ol>
          </nav>
          <header className="checkout-page__heading">
            <p>Secure order placement</p>
            <h1>Checkout</h1>
            <span>Complete your order as a guest or use your saved account details.</span>
          </header>
          <CheckoutProgress />

          {!authLoading && !isAuthenticated && (
            <section className="checkout-page__returning" aria-labelledby="returning-customer-title">
              <div>
                <h2 id="returning-customer-title">Returning customer?</h2>
                <p>Sign in to use your saved addresses and check out faster.</p>
              </div>
              <Link to="/login" state={{ from: '/checkout' }}>Sign In</Link>
            </section>
          )}
          {isAuthenticated && (
            <p className="checkout-page__signed-in">
              Checking out as <strong>{user?.name}</strong>
            </p>
          )}

          <div className="checkout-page__feedback" role="status" aria-live="polite">
            {feedback}
          </div>

          <form className="checkout-page__layout" noValidate onSubmit={placeOrder}>
            <div className="checkout-page__sections">
              <CheckoutContactForm
                values={checkoutContact}
                errors={errors}
                isAuthenticated={isAuthenticated}
                onChange={updateContact}
              />
              <CheckoutAddressForm
                values={address}
                errors={errors}
                savedAddresses={savedAddresses}
                selectedAddressId={selectedAddressId}
                saveAddress={saveAddress}
                isAuthenticated={isAuthenticated}
                onChange={updateAddress}
                onSavedAddressChange={selectSavedAddress}
                onSaveAddressChange={(event) => setSaveAddress(event.target.checked)}
              />
            </div>
            <CheckoutSummary
              items={items}
              subtotal={subtotal}
              deliveryMethod={deliveryMethod}
              paymentMethod={paymentMethod}
              legalAccepted={legalAccepted}
              legalError={legalError}
              sessionLoading={authLoading}
              submitting={submitting}
              onDeliveryChange={(event) => setDeliveryMethod(event.target.value)}
              onPaymentChange={(event) => setPaymentMethod(event.target.value)}
              onLegalChange={(event) => {
                setLegalAccepted(event.target.checked)
                setLegalError(event.target.checked
                  ? ''
                  : 'You must agree to the Privacy Policy and Terms & Conditions.')
              }}
            />
          </form>
        </div>
      </main>
    </SiteLayout>
  )
}

export default CheckoutPage
