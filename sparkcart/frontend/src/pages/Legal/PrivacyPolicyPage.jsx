import { Link } from 'react-router-dom'
import SiteLayout from '../../layouts/SiteLayout'
import '../../styles/legal.css'

function PrivacyPolicyPage() {
  return (
    <SiteLayout>
      <main className="legal-page">
        <article className="legal-page__document">
          <header>
            <p>Baraka Solar Shop</p>
            <h1>Privacy Policy</h1>
            <span>Effective date: July 2026 · Version 2026-07</span>
          </header>
          <aside role="note">
            Initial business-ready draft. This policy requires professional legal review before
            production launch.
          </aside>
          <p>
            This policy explains how Baraka Solar Shop handles personal information when customers
            browse the store, create an account, or place an order.
          </p>

          <section><h2>Information collected</h2><p>We may collect names, email addresses, phone numbers, delivery details, order information, account credentials, and technical information needed to operate and protect the store.</p></section>
          <section><h2>How information is used</h2><p>Information is used to provide the storefront, process and support orders, coordinate delivery and payment, maintain customer accounts, prevent abuse, and meet applicable legal obligations.</p></section>
          <section><h2>Account and checkout information</h2><p>Customers may check out as guests or create an account. Account details and saved addresses are used only for account features. Guest orders are not automatically attached to a future account.</p></section>
          <section><h2>Payments</h2><p>The checkout records an intended payment method. Payment providers may collect additional information under their own privacy terms when payment integrations are enabled. Baraka Solar Shop does not request card numbers or M-Pesa PINs in the current checkout.</p></section>
          <section><h2>Delivery information</h2><p>Recipient names, phone numbers, addresses, and delivery instructions may be shared with authorised staff or delivery partners only as needed to prepare and fulfil an order.</p></section>
          <section><h2>Cookies and browser storage</h2><p>The store may use cookies or browser storage to maintain authentication, preserve carts, remember preferences, provide security, and understand service performance.</p></section>
          <section><h2>Data security</h2><p>Reasonable administrative and technical safeguards are used to protect personal information. No internet service can guarantee absolute security.</p></section>
          <section><h2>Data retention</h2><p>Information is retained only as long as reasonably necessary for store operations, customer support, security, record-keeping, and applicable legal requirements. Specific retention schedules are to be confirmed before launch.</p></section>
          <section><h2>Customer rights</h2><p>Subject to applicable Kenyan law, customers may request access to, correction of, or deletion of their personal information and may raise concerns about how it is handled.</p></section>
          <section><h2>Contact information</h2><p>Privacy contact email: [to be provided before production launch]. Business contact details: [to be provided before production launch].</p></section>

          <footer><Link to="/checkout">Return to checkout</Link></footer>
        </article>
      </main>
    </SiteLayout>
  )
}

export default PrivacyPolicyPage
