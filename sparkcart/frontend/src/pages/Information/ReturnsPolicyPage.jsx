import InformationPageLayout from '../../components/information/InformationPageLayout'
import InformationSections from '../../components/information/InformationSections'
import { businessInfo } from '../../config/businessInfo'

const returnWindow = businessInfo.returnRequestWindowDays == null
  ? 'Contact our support team promptly after delivery to confirm whether your item qualifies for return.'
  : `Submit a return request within ${businessInfo.returnRequestWindowDays} days of delivery.`

const sections = [
  { id: 'eligibility', title: 'Return eligibility', content: 'Return eligibility depends on the product, reason for return, condition, installation status, hygiene or safety considerations, manufacturer restrictions, and applicable customer rights.' },
  { id: 'request-period', title: 'Return request period', content: returnWindow },
  { id: 'condition', title: 'Condition of returned products', content: 'Unless an item was delivered damaged or incorrect, it should remain unused, uninstalled, complete, and in its original packaging with manuals, accessories, labels, and serial numbers intact.' },
  { id: 'non-returnable', title: 'Non-returnable products', content: 'Items that have been installed, electrically connected, altered, damaged after delivery, custom ordered, or supplied with broken seals may not qualify, subject to applicable law and the reason for return.' },
  { id: 'damaged', title: 'Incorrect or damaged items', content: 'Photograph the packaging, labels, and product immediately, retain all packaging, and contact support promptly. Do not install or energize an item that appears damaged or incorrect.' },
  { id: 'authorization', title: 'Return authorization process', content: 'Contact support before returning anything. Provide the order number, product, reason, condition, photographs where relevant, and preferred resolution. The team will confirm the next step and return location if eligible.' },
  { id: 'inspection', title: 'Inspection and approval', content: 'Returned products may be inspected for identity, completeness, condition, installation, use, and the reported issue. Receiving an item for inspection does not automatically approve a refund or exchange.' },
  { id: 'refunds', title: 'Refund processing', content: 'Approved refunds are processed through an appropriate method after inspection and operational review. The method and timing depend on the original payment arrangement and participating providers.' },
  { id: 'costs', title: 'Delivery and return shipping costs', content: 'Responsibility for collection, return transport, redelivery, or carrier charges depends on the reason for return and the approved resolution. Costs will be confirmed before transport is arranged.' },
  { id: 'exchanges', title: 'Exchanges', content: 'An exchange may be offered when suitable stock is available and the return is approved. Price differences, delivery charges, and compatibility must be confirmed before replacement.' },
  { id: 'contact', title: 'Contact information', content: `Start a return request through ${businessInfo.supportEmail} or ${businessInfo.phone}. Do not send products without authorization.` },
]

function ReturnsPolicyPage() {
  return (
    <InformationPageLayout
      title="Returns Policy"
      introduction="Review the preliminary return process for eligibility, authorization, inspection, refunds, shipping costs, and exchanges."
      description="Preliminary returns policy and return authorization process for Baraka Solar Shop."
    >
      <aside className="information-page__legal-note" role="note">
        This operational draft is not final legal advice. The return window and final terms require business and legal approval before production.
      </aside>
      <InformationSections sections={sections} />
    </InformationPageLayout>
  )
}

export default ReturnsPolicyPage
