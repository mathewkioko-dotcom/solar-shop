import InformationPageLayout from '../../components/information/InformationPageLayout'
import InformationSections from '../../components/information/InformationSections'
import { businessInfo } from '../../config/businessInfo'

const sections = [
  { id: 'manufacturer', title: 'Manufacturer warranties', content: 'Product warranty periods vary by manufacturer and product. Warranty details shown on the product page or manufacturer datasheet take priority.' },
  { id: 'shop-support', title: 'Baraka Solar Shop support', content: `${businessInfo.name} can help document and coordinate an eligible claim. This does not create coverage beyond the manufacturer’s written terms unless the business expressly configures and publishes additional coverage later.` },
  { id: 'eligibility', title: 'Warranty eligibility', content: 'Eligibility may depend on the product, serial number, purchase source, fault, installation, operating environment, maintenance, and compliance with manufacturer instructions.' },
  { id: 'proof', title: 'Proof of purchase', content: 'Keep your order confirmation, receipt, serial numbers, packaging labels, installation records, and any warranty card or registration confirmation.' },
  { id: 'installation', title: 'Installation requirements', content: 'Some products require installation or commissioning by a suitably qualified technician. Correct protection, wiring, earthing, ventilation, mounting, configuration, and system sizing may be required.' },
  { id: 'exclusions', title: 'Warranty exclusions', content: 'Improper installation, misuse, unauthorized modification, physical damage, incorrect electrical configuration, unsuitable environmental exposure, neglected maintenance, and operation outside rated limits may affect warranty eligibility.' },
  { id: 'claim', title: 'Warranty claim process', content: 'Contact support with the order number, product and serial details, installation information, fault description, photographs or video, diagnostic information, and any steps already taken.' },
  { id: 'diagnosis', title: 'Inspection and diagnosis', content: 'The product may require remote troubleshooting, technician inspection, testing, or return to an authorized location. Do not open, modify, or attempt unsafe repairs unless authorized.' },
  { id: 'resolution', title: 'Repair, replacement, or manufacturer resolution', content: 'An approved claim may result in repair, replacement, credit, or another manufacturer-authorized resolution. The outcome depends on diagnosis, available parts or stock, and the applicable warranty.' },
  { id: 'timelines', title: 'Warranty timelines', content: 'Diagnosis and resolution time varies by product, manufacturer, parts availability, transport, and technical complexity. Support will provide updates when reliable information is available.' },
  { id: 'support', title: 'Contact support', content: `Send warranty questions to ${businessInfo.supportEmail} or call ${businessInfo.phone} during ${businessInfo.businessHours}.` },
]

function WarrantyPage() {
  return (
    <InformationPageLayout
      title="Warranty"
      introduction="Learn how manufacturer coverage, installation requirements, diagnosis, and warranty claim coordination work."
      description="Manufacturer warranty information and warranty claim support from Baraka Solar Shop."
    >
      <InformationSections sections={sections} />
    </InformationPageLayout>
  )
}

export default WarrantyPage
