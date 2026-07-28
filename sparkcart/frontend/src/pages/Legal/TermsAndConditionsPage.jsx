import { Link } from 'react-router-dom'
import InformationPageLayout from '../../components/information/InformationPageLayout'
import InformationSections from '../../components/information/InformationSections'
import { businessInfo } from '../../config/businessInfo'

// TODO: These terms require qualified legal review and business approval before production.
const sections = [
  { id: 'acceptance', title: 'Acceptance of terms', content: `These draft terms govern use of the ${businessInfo.name} website and order requests placed through it. Using the store indicates acceptance of the final terms published at the time of use.` },
  { id: 'accounts', title: 'Customer accounts', content: 'Customers must provide accurate information, protect account credentials, and notify support of suspected unauthorized access. Guest checkout may be available without an account.' },
  { id: 'product-information', title: 'Product information', content: 'We aim to present useful descriptions, images, specifications, and datasheets. Packaging, appearance, specifications, and manufacturer details can change, so critical requirements should be confirmed before purchase.' },
  { id: 'pricing', title: 'Pricing', content: `Prices are displayed in ${businessInfo.currency}. Pricing errors may be corrected before order acceptance. Delivery, installation, configuration, or other services are included only when expressly stated.` },
  { id: 'stock', title: 'Stock availability', content: 'Displayed stock is informational and may change before allocation. Submission of an order does not guarantee that stock has been reserved.' },
  { id: 'orders', title: 'Orders', content: 'An order submission is a request to purchase. Customers are responsible for checking product suitability, quantities, contact details, delivery information, and any compatibility requirements.' },
  { id: 'acceptance-cancellation', title: 'Order acceptance and cancellation', content: 'An order number confirms receipt, not final acceptance or dispatch. The store may verify, accept, decline, or cancel an order for stock, pricing, safety, fraud prevention, delivery, or operational reasons, subject to applicable rights.' },
  { id: 'payments', title: 'Payments', content: 'Available payment methods are shown during checkout. M-Pesa and card integrations are being developed. Payment providers may apply their own terms, and payment is complete only after confirmation.' },
  { id: 'delivery', title: 'Delivery', content: 'Delivery coverage, fees, timelines, access, and handling requirements are confirmed for each order. Estimates may be affected by destination, carriers, verification, stock, weather, and equipment size.' },
  { id: 'returns', title: 'Returns', content: 'Return eligibility and procedure are governed by the published Returns Policy and applicable rights. Customers should request authorization before sending any product back.' },
  { id: 'warranties', title: 'Warranties', content: 'Product warranty periods and coverage vary by manufacturer and product. Product-page or manufacturer documentation takes priority, and no additional store warranty is created unless expressly published.' },
  { id: 'installation', title: 'Installation and electrical safety', content: 'Solar, battery, and electrical equipment must be selected, protected, installed, configured, and maintained safely. Customers should use appropriately qualified installers and follow manufacturer instructions and applicable requirements.' },
  { id: 'liability', title: 'Limitation of liability', content: 'Any limitation must be interpreted subject to applicable law and the final legally reviewed terms. Nothing excludes rights or liability that cannot lawfully be excluded.' },
  { id: 'intellectual-property', title: 'Intellectual property', content: 'Store branding, original content, layout, and materials may be protected. Manufacturer names, marks, images, and documentation remain the property of their respective owners.' },
  { id: 'prohibited-use', title: 'Prohibited use', content: 'Users must not misuse the store, interfere with security or availability, submit unlawful or deceptive content, attempt unauthorized access, or use automated systems in a harmful manner.' },
  { id: 'changes', title: 'Changes to terms', content: 'Terms may be updated as operations, integrations, and requirements change. The revised date will be displayed, and the applicable version is the one published when the relevant use or order occurs.' },
  { id: 'governing-law', title: 'Governing law', content: `The intended governing law is ${businessInfo.governingLaw}. The final governing-law and dispute wording remains subject to qualified legal review before production.` },
  { id: 'contact', title: 'Contact information', content: `Questions about these terms can be sent to ${businessInfo.supportEmail} or ${businessInfo.address}. Contact placeholders must be verified before launch.` },
]

function TermsAndConditionsPage() {
  return (
    <InformationPageLayout
      title="Terms and Conditions"
      eyebrow="Store terms"
      introduction="Review the preliminary terms for accounts, products, orders, payments, delivery, returns, warranties, safety, and acceptable use."
      description="Draft terms and conditions for using Baraka Solar Shop and placing product orders."
    >
      <aside className="information-page__legal-note" role="note">
        This is a business-ready draft, not final legal advice. Qualified legal counsel must review and approve the final terms before production.
      </aside>
      <InformationSections sections={sections} />
      <p className="information-page__related-policy">
        Personal information is handled as described in the <Link to="/privacy-policy">Privacy Policy</Link>.
      </p>
    </InformationPageLayout>
  )
}

export default TermsAndConditionsPage
