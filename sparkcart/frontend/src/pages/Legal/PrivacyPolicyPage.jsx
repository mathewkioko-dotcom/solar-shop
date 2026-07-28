import InformationPageLayout from '../../components/information/InformationPageLayout'
import InformationSections from '../../components/information/InformationSections'
import { businessInfo } from '../../config/businessInfo'

// TODO: This policy must be reviewed by qualified legal counsel before production launch.
const sections = [
  { id: 'introduction', title: 'Introduction', content: `This draft explains how ${businessInfo.name} may handle personal information when customers browse the store, contact support, create an account, or place an order.` },
  { id: 'information-collected', title: 'Information collected', content: 'We may collect information that customers provide, order and delivery records, account activity, support communications, and limited technical information needed to operate and secure the service.' },
  { id: 'account-information', title: 'Account information', content: 'Account details may include a customer’s name, email address, password credentials in protected form, saved addresses, preferences, and order history. Customers may also shop as guests.' },
  { id: 'order-delivery', title: 'Order and delivery information', content: 'We may process recipient names, phone numbers, email addresses, delivery addresses, instructions, purchased items, quantities, prices, and order status to verify, fulfill, and support orders.' },
  { id: 'payment-information', title: 'Payment information', content: 'When payment integrations are enabled, payment providers process sensitive payment credentials under their own terms. Baraka Solar Shop should not directly store full card details or ask customers to disclose an M-Pesa PIN.' },
  { id: 'device-usage', title: 'Device and usage information', content: 'Technical records may include browser or device type, request times, pages viewed, approximate network information, errors, and security events. The precise analytics tools used must be confirmed before production.' },
  { id: 'information-use', title: 'How information is used', content: 'Information may be used to operate the storefront, manage accounts, verify and fulfill orders, coordinate payment and delivery, respond to support requests, maintain security, improve reliability, and meet applicable obligations.' },
  { id: 'storage', title: 'Cookies and local storage', content: 'Cart, wishlist, authentication preferences, and checkout recovery may use browser storage where applicable. Cookies or similar storage may also support sessions, security, preferences, and service performance.' },
  { id: 'providers', title: 'Service providers', content: 'Necessary information may be shared with hosting, communications, payment, delivery, professional, or technical providers only for relevant services and subject to appropriate arrangements.' },
  { id: 'security', title: 'Data security', content: 'Reasonable administrative and technical safeguards should be used to protect personal information. No internet service or storage system can guarantee absolute security.' },
  { id: 'retention', title: 'Data retention', content: 'Information should be retained only for as long as reasonably necessary for orders, support, security, records, dispute handling, and applicable requirements. Final retention schedules require operational and legal review.' },
  { id: 'rights', title: 'Customer rights', content: 'Subject to applicable law, customers may be able to request access, correction, deletion, restriction, or other action regarding their personal information. Identity verification may be required before a request is completed.' },
  { id: 'children', title: 'Children’s privacy', content: 'The store is intended for customers able to make or supervise purchasing decisions. It is not designed to knowingly collect personal information directly from children.' },
  { id: 'updates', title: 'Policy updates', content: 'This policy may be updated as the store, providers, or operational requirements change. A revised date will be shown when material updates are published.' },
  { id: 'contact', title: 'Contact information', content: `Send privacy questions to ${businessInfo.supportEmail}, call ${businessInfo.phone}, or write to ${businessInfo.address}. These contact placeholders must be verified before launch.` },
]

function PrivacyPolicyPage() {
  return (
    <InformationPageLayout
      title="Privacy Policy"
      eyebrow="Privacy and data"
      introduction="Review how customer, account, order, payment, device, and browser-storage information may be handled."
      description="Draft privacy policy explaining how Baraka Solar Shop handles customer and order information."
    >
      <aside className="information-page__legal-note" role="note">
        This is a business-ready draft, not final legal advice. Qualified legal counsel must review it before production launch.
      </aside>
      <InformationSections sections={sections} />
    </InformationPageLayout>
  )
}

export default PrivacyPolicyPage
