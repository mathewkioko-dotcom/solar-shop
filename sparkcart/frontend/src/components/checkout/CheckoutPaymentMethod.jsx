const PAYMENT_METHODS = [
  ['mpesa', 'M-Pesa', 'Secure mobile payment through Safaricom'],
  ['card', 'Visa / Mastercard', 'Secure card payment'],
  ['pay_on_confirmation', 'Pay on Confirmation', 'Our team will confirm delivery and payment details'],
]

function CheckoutPaymentMethod({ value, onChange }) {
  return (
    <section className="checkout-page__card" aria-labelledby="checkout-payment-title">
      <div className="checkout-page__section-heading">
        <span>4</span>
        <div>
          <p>Payment preference</p>
          <h2 id="checkout-payment-title">Payment method</h2>
        </div>
      </div>
      <fieldset className="checkout-page__choices">
        <legend className="checkout-page__sr-only">Choose an intended payment method</legend>
        {PAYMENT_METHODS.map(([code, label, description]) => (
          <label className="checkout-page__choice" key={code}>
            <input
              type="radio"
              name="payment_method"
              value={code}
              checked={value === code}
              onChange={onChange}
            />
            <span>
              <strong>{label}</strong>
              <small>{description}</small>
            </span>
          </label>
        ))}
      </fieldset>
      <p className="checkout-page__notice">
        Payment status will remain pending. No payment is processed at this stage.
      </p>
    </section>
  )
}

export default CheckoutPaymentMethod
