import { Link } from 'react-router-dom'
import SiteLayout from '../../layouts/SiteLayout'
import '../../styles/legal.css'

function TermsAndConditionsPage() {
  return (
    <SiteLayout>
      <main className="legal-page">
        <article className="legal-page__document">
          <header>
            <p>Baraka Solar Shop</p>
            <h1>Terms &amp; Conditions</h1>
            <span>Effective date: July 2026 · Version 2026-07</span>
          </header>
          <aside role="note">
            Initial business-ready draft. These terms require professional legal review before
            production launch.
          </aside>
          <p>These terms govern use of the Baraka Solar Shop website and orders placed through it.</p>

          <section><h2>Store use</h2><p>Customers must use the store lawfully, provide accurate information, and avoid interfering with the website or the experience of other users.</p></section>
          <section><h2>Product information</h2><p>We aim to present accurate descriptions and images. Product appearance, packaging, specifications, and availability may change, and customers should confirm critical requirements before purchase.</p></section>
          <section><h2>Pricing</h2><p>Prices are shown in Kenyan shillings. The server verifies product prices when an order is placed. Delivery costs are confirmed separately and are not included unless expressly stated.</p></section>
          <section><h2>Orders and acceptance</h2><p>An order submission is a request to purchase. Receiving an order number does not by itself guarantee acceptance, stock allocation, or dispatch. The team may contact the customer to confirm availability and order details.</p></section>
          <section><h2>Payment</h2><p>The selected payment method records the customer’s intended method. Payment remains pending until it is completed and confirmed through an enabled payment process.</p></section>
          <section><h2>Delivery</h2><p>Dispatch preparation and delivery timing depend on order time, location, stock, customer confirmation, and delivery arrangements. Any estimate is informational unless expressly agreed otherwise.</p></section>
          <section><h2>Cancellations</h2><p>Cancellation eligibility and procedure must be confirmed with Baraka Solar Shop. Final cancellation rules and contact details will be added following legal and operational review.</p></section>
          <section><h2>Returns and refunds</h2><p>Return eligibility, process, condition requirements, and refund handling will follow applicable law and the final published returns policy. No fixed return or refund period is promised by this draft.</p></section>
          <section><h2>Product warranties</h2><p>Any warranty is limited to the written manufacturer or seller warranty expressly provided for a product. Warranty scope and claim procedures should be confirmed before purchase.</p></section>
          <section><h2>Limitation of liability</h2><p>To the extent permitted by applicable law, liability will be limited as set out in the final legally reviewed terms. Nothing in these terms excludes rights or liability that cannot lawfully be excluded.</p></section>
          <section><h2>Privacy</h2><p>Personal information is handled as described in the <Link to="/privacy-policy">Privacy Policy</Link>.</p></section>
          <section><h2>Governing law</h2><p>These terms are intended to be governed by the laws of Kenya, subject to confirmation through professional legal review.</p></section>
          <section><h2>Contact information</h2><p>Business and legal contact details: [to be provided before production launch].</p></section>

          <footer><Link to="/checkout">Return to checkout</Link></footer>
        </article>
      </main>
    </SiteLayout>
  )
}

export default TermsAndConditionsPage
