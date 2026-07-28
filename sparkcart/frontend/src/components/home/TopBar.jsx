import { heroTrustItems } from '../../data/homeData'
import { businessInfo } from '../../config/businessInfo'
import SvgIcon from '../ui/SvgIcon'

function TopBar() {
  return <div className="announcement-bar"><div className="container announcement-content">
    <span><SvgIcon src={heroTrustItems[1].icon} size={16} /> Fast delivery across Kenya and East Africa</span>
    <span className="announcement-center"><SvgIcon src={heroTrustItems[0].icon} size={16} /> 100% genuine products <span className="announcement-divider" aria-hidden="true" /><SvgIcon src={heroTrustItems[2].icon} size={16} /> Manufacturer warranty</span>
    <span><SvgIcon src={heroTrustItems[3].icon} size={16} /> Expert support: {businessInfo.phone}</span>
  </div></div>
}

export default TopBar
