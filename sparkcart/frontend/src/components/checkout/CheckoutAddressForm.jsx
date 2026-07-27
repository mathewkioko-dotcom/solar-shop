function CheckoutAddressForm({
  values,
  errors,
  savedAddresses,
  selectedAddressId,
  saveAddress,
  isAuthenticated,
  onChange,
  onSavedAddressChange,
  onSaveAddressChange,
}) {
  const field = (name, label, props = {}) => {
    const error = errors[`address.${name}`]
    const id = `checkout-address-${name}`

    return (
      <div className={`checkout-page__field ${props.wide ? 'checkout-page__field--wide' : ''}`}>
        <label htmlFor={id}>{label}</label>
        {props.multiline ? (
          <textarea
            id={id}
            name={name}
            rows={props.rows || 3}
            placeholder={props.placeholder}
            value={values[name]}
            aria-invalid={Boolean(error)}
            aria-describedby={error ? `${id}-error` : undefined}
            onChange={onChange}
          />
        ) : (
          <input
            id={id}
            name={name}
            type={props.type || 'text'}
            inputMode={props.inputMode}
            autoComplete={props.autoComplete}
            placeholder={props.placeholder}
            value={values[name]}
            aria-invalid={Boolean(error)}
            aria-describedby={error ? `${id}-error` : undefined}
            onChange={onChange}
          />
        )}
        {error && <span id={`${id}-error`}>{error}</span>}
      </div>
    )
  }

  return (
    <section className="checkout-page__card" aria-labelledby="checkout-address-title">
      <div className="checkout-page__section-heading">
        <span>2</span>
        <div>
          <p>Where should it go?</p>
          <h2 id="checkout-address-title">Billing &amp; Delivery Details</h2>
        </div>
      </div>

      {isAuthenticated && savedAddresses.length > 0 && (
        <div className="checkout-page__field checkout-page__saved-address">
          <label htmlFor="checkout-saved-address">Use a saved address</label>
          <select
            id="checkout-saved-address"
            value={selectedAddressId}
            onChange={onSavedAddressChange}
          >
            <option value="">Enter a different address</option>
            {savedAddresses.map((address) => (
              <option key={address.id} value={address.id}>
                {address.label || 'Saved address'} — {address.street_address}, {address.city}
              </option>
            ))}
          </select>
        </div>
      )}

      <div className="checkout-page__field-grid">
        {field('label', 'Address label (optional)', { placeholder: 'Home, Office, Site' })}
        <div aria-hidden="true" />
        {field('county', 'County', { autoComplete: 'address-level1' })}
        {field('city', 'Town or city', { autoComplete: 'address-level2' })}
        {field('postal_code', 'Postal code (optional)', {
          inputMode: 'numeric',
          autoComplete: 'postal-code',
        })}
        {field('street_address', 'Street address', {
          wide: true,
          autoComplete: 'street-address',
        })}
        {field('building_details', 'Building, apartment, floor, or landmark (optional)', {
          wide: true,
        })}
        <div className="checkout-page__field checkout-page__field--wide">
          <label htmlFor="checkout-country">Country / Region</label>
          <input id="checkout-country" value="Kenya" readOnly />
        </div>
        {field('delivery_instructions', 'Order Notes (Optional)', {
          wide: true,
          multiline: true,
          placeholder: 'Notes about your order or special delivery instructions.',
        })}
      </div>

      {isAuthenticated && (
        <label className="checkout-page__checkbox">
          <input
            type="checkbox"
            checked={saveAddress}
            onChange={onSaveAddressChange}
          />
          Save this address to my account
        </label>
      )}
    </section>
  )
}

export default CheckoutAddressForm
