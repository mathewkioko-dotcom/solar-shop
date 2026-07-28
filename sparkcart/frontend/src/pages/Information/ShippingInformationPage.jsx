import InformationPageLayout from '../../components/information/InformationPageLayout'
import InformationSections from '../../components/information/InformationSections'
import { businessInfo } from '../../config/businessInfo'

const sections = [
  { id: 'coverage', title: 'Delivery coverage', content: `${businessInfo.name} can arrange delivery within Nairobi and to many destinations across Kenya. Coverage is confirmed for each order because access, carrier availability, and equipment handling needs vary.` },
  { id: 'nairobi', title: 'Nairobi delivery', content: 'Orders within Nairobi may be delivered through an approved local carrier or arranged directly with our team. The available option depends on stock location, order verification, and product size.' },
  { id: 'outside-nairobi', title: 'Delivery outside Nairobi', content: 'For destinations outside Nairobi, we may use suitable courier, parcel, or transport services. Customers may be asked to confirm a collection point or delivery instructions before dispatch.' },
  { id: 'timelines', title: 'Estimated delivery timelines', content: 'Delivery estimates begin after stock, contact details, payment arrangements, and destination have been verified. Delivery fees and estimated timelines are confirmed during checkout or by our support team.' },
  { id: 'fees', title: 'Delivery fees', content: `Fees depend on destination, parcel dimensions, weight, insurance or special handling, and the selected carrier. Any confirmed delivery fee will be communicated in ${businessInfo.currency} before dispatch.` },
  { id: 'heavy-equipment', title: 'Large or heavy solar equipment', content: 'Batteries, panels, mounting equipment, and complete systems may require specialist transport, additional handling, or customer-provided unloading support. Our team will explain these requirements before dispatch.' },
  { id: 'verification', title: 'Order verification', content: 'We may contact you to verify recipient details, compatibility questions, stock, destination, access restrictions, and the intended payment method. Dispatch may wait until essential details are confirmed.' },
  { id: 'inspection', title: 'Receiving and inspecting deliveries', content: 'Inspect the packaging and visible product condition when receiving an order. Record damage or missing items with clear photographs, retain packaging, and contact support promptly.' },
  { id: 'delays', title: 'Delayed deliveries', content: 'Weather, traffic, carrier schedules, remote access, operational interruptions, and order verification can affect estimates. Contact support with your order number if a delivery appears delayed.' },
  { id: 'pickup', title: 'Pickup availability', content: 'Pickup may be available by prior arrangement. Do not travel until the team has confirmed that the order is ready and provided the collection location and time.' },
  { id: 'support', title: 'Contacting support', content: `For delivery help, contact ${businessInfo.supportEmail} or ${businessInfo.phone} during ${businessInfo.businessHours}.` },
]

function ShippingInformationPage() {
  return (
    <InformationPageLayout
      title="Shipping Information"
      introduction="Understand how delivery coverage, estimates, fees, equipment handling, inspection, and pickup arrangements are confirmed."
      description="Delivery and shipping information for Baraka Solar Shop orders within Nairobi and across Kenya."
    >
      <InformationSections sections={sections} />
    </InformationPageLayout>
  )
}

export default ShippingInformationPage
