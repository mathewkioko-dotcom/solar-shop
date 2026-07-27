function CheckoutContactForm({ values, errors, isAuthenticated, onChange }) {
  const field = (name, label, props = {}) => {
    const error = errors[`contact.${name}`]
    const id = `checkout-contact-${name}`

    return (
      <div className="checkout-page__field">
        <label htmlFor={id}>{label}</label>
        <input
          {...props}
          id={id}
          name={name}
          value={values[name]}
          aria-invalid={Boolean(error)}
          aria-describedby={error ? `${id}-error` : undefined}
          onChange={onChange}
        />
        {error && <span id={`${id}-error`}>{error}</span>}
      </div>
    )
  }

  return (
    <section className="checkout-page__card" aria-labelledby="checkout-contact-title">
      <div className="checkout-page__section-heading">
        <span>1</span>
        <div>
          <p>Customer details</p>
          <h2 id="checkout-contact-title">Contact information</h2>
        </div>
      </div>
      <div className="checkout-page__field-grid">
        {field('first_name', 'First name', { autoComplete: 'given-name' })}
        {field('last_name', 'Last name', { autoComplete: 'family-name' })}
      </div>
      {field('email', 'Email address', {
        type: 'email',
        autoComplete: 'email',
        readOnly: isAuthenticated,
      })}
      {field('phone', 'Phone number', {
        type: 'tel',
        inputMode: 'tel',
        autoComplete: 'tel',
        placeholder: '0712345678',
      })}
      <p className="checkout-page__hint">We will use this number for order and delivery updates.</p>
    </section>
  )
}

export default CheckoutContactForm
