const STEPS = [
  ['Cart', 'complete'],
  ['Checkout', 'current'],
  ['Payment', 'upcoming'],
  ['Confirmation', 'upcoming'],
]

function CheckoutProgress() {
  return (
    <nav className="checkout-page__progress" aria-label="Checkout progress">
      <ol>
        {STEPS.map(([step, status], index) => (
          <li
            className={`checkout-page__progress-step checkout-page__progress-step--${status}`}
            key={step}
            aria-current={status === 'current' ? 'step' : undefined}
          >
            <span aria-hidden="true">{status === 'complete' ? '✓' : index + 1}</span>
            <div>{step}<small>{status}</small></div>
          </li>
        ))}
      </ol>
    </nav>
  )
}

export default CheckoutProgress
