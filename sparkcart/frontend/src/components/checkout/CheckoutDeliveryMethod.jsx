function CheckoutDeliveryMethod({ value, onChange }) {
  return (
    <section className="checkout-page__card" aria-labelledby="checkout-delivery-title">
      <div className="checkout-page__section-heading">
        <span>3</span>
        <div>
          <p>Fulfilment</p>
          <h2 id="checkout-delivery-title">Delivery method</h2>
        </div>
      </div>
      <label className="checkout-page__choice">
        <input
          type="radio"
          name="delivery_method"
          value="standard_delivery"
          checked={value === 'standard_delivery'}
          onChange={onChange}
        />
        <span>
          <strong>Standard Delivery</strong>
          <small>Delivery cost will be confirmed before payment.</small>
        </span>
      </label>
      <p className="checkout-page__notice">
        Orders placed before 3:00 PM EAT on business days are normally prepared for same-day
        dispatch. Orders placed after the cutoff or during weekends are processed on the next
        business day.
      </p>
    </section>
  )
}

export default CheckoutDeliveryMethod
