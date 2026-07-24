import batteriesIcon from '../assets/icons/categories/batteries.svg'
import cablesConnectorsIcon from '../assets/icons/categories/cables-connectors.svg'
import cctvSolarCamerasIcon from '../assets/icons/categories/cctv-solar-cameras.svg'
import chargeControllersIcon from '../assets/icons/categories/charge-controllers.svg'
import hybridInvertersIcon from '../assets/icons/categories/hybrid-inverters.svg'
import mountingAccessoriesIcon from '../assets/icons/categories/mounting-accessories.svg'
import solarFloodLightsIcon from '../assets/icons/categories/solar-flood-lights.svg'
import solarPanelsIcon from '../assets/icons/categories/solar-panels.svg'
import expertSupportIcon from '../assets/icons/ecommerce/expert-support.svg'
import fastDeliveryIcon from '../assets/icons/ecommerce/fast-delivery.svg'
import genuineIcon from '../assets/icons/ecommerce/genuine.svg'
import manufacturerWarrantyIcon from '../assets/icons/ecommerce/manufacturer-warranty.svg'
import bydLogo from '../assets/brands/byd.svg'
import canadianSolarLogo from '../assets/brands/canadian-solar.png'
import deyeLogo from '../assets/brands/deye.svg'
import growattLogo from '../assets/brands/growatt.svg'
import huaweiLogo from '../assets/brands/huawei.svg'
import jaSolarLogo from '../assets/brands/ja-solar.svg'
import jinkoSolarLogo from '../assets/brands/jinko-solar.jpg'
import longiLogo from '../assets/brands/longi.svg'
import pylontechLogo from '../assets/brands/pylontech.svg'
import smaLogo from '../assets/brands/sma.svg'
import sungrowLogo from '../assets/brands/sungrow.svg'
import trinaSolarLogo from '../assets/brands/trina-solar.svg'
import victronLogo from '../assets/brands/victron-energy.svg'

export const categories = [
  { name: 'Solar Panels', slug: 'solar-panels', icon: solarPanelsIcon, description: 'High-efficiency panels' },
  { name: 'Solar Batteries', slug: 'batteries', icon: batteriesIcon, description: 'Reliable energy storage' },
  { name: 'Hybrid Inverters', slug: 'hybrid-inverters', icon: hybridInvertersIcon, description: 'Smart power conversion' },
  { name: 'Charge Controllers', slug: 'solar-charge-controllers', icon: chargeControllersIcon, description: 'Safe battery charging' },
  { name: 'Solar Flood Lights', slug: 'solar-flood-lights', icon: solarFloodLightsIcon, description: 'Outdoor solar lighting' },
  { name: 'CCTV Solar Cameras', slug: 'cctv-solar-cameras', icon: cctvSolarCamerasIcon, description: 'Off-grid surveillance' },
  { name: 'Cables & Connectors', slug: 'cables-connectors', icon: cablesConnectorsIcon, description: 'Reliable solar connections' },
]

export const mountingAccessories = { name: 'Mounting & Accessories', slug: 'mounting-accessories', icon: mountingAccessoriesIcon }

export const navigationItems = [
  { label: 'Home', section: 'hero' }, { label: 'Solar Panels', section: 'categories' },
  { label: 'Batteries', section: 'categories' }, { label: 'Inverters', section: 'categories' },
  { label: 'Charge Controllers', section: 'categories' }, { label: 'Solar Kits', section: 'featured-products' },
  { label: 'Mounting & Accessories', section: 'categories' }, { label: 'Brands', section: 'brands' },
  { label: 'Deals', section: 'featured-products', className: 'deals-link' },
]

export const heroTrustItems = [
  { title: '100% Genuine', text: 'Quality guaranteed', icon: genuineIcon },
  { title: 'Fast Delivery', text: 'Kenya and East Africa', icon: fastDeliveryIcon },
  { title: 'Warranty', text: 'Manufacturer backed', icon: manufacturerWarrantyIcon },
  { title: 'Expert Support', text: 'From solar specialists', icon: expertSupportIcon },
]

export const benefits = [
  { title: 'Genuine products', text: 'Original products sourced from trusted manufacturers.', icon: genuineIcon },
  { title: 'Reliable delivery', text: 'Fast delivery throughout Kenya and East Africa.', icon: fastDeliveryIcon },
  { title: 'Technical guidance', text: 'Expert assistance choosing compatible solar equipment.', icon: expertSupportIcon },
  { title: 'Manufacturer warranty', text: 'Warranty support for eligible solar products.', icon: manufacturerWarrantyIcon },
]

export const brands = [
  { name: 'Canadian Solar', image: canadianSolarLogo }, { name: 'JinkoSolar', image: jinkoSolarLogo },
  { name: 'LONGi', image: longiLogo }, { name: 'JA Solar', image: jaSolarLogo }, { name: 'Growatt', image: growattLogo },
  { name: 'Victron Energy', image: victronLogo }, { name: 'Deye', image: deyeLogo }, { name: 'Huawei', image: huaweiLogo },
  { name: 'Pylontech', image: pylontechLogo }, { name: 'Sungrow', image: sungrowLogo }, { name: 'Trina Solar', image: trinaSolarLogo },
  { name: 'BYD', image: bydLogo }, { name: 'SMA', image: smaLogo },
]

export const footerLinks = {
  shop: ['Solar panels', 'Solar batteries', 'Inverters', 'Charge controllers', 'All products'],
  support: ['Contact us', 'Delivery information', 'Warranty policy', 'Returns policy', 'Frequently asked questions'],
}
