import whatsappIcon from '../../assets/icons/social/whatsapp.svg'
import { businessInfo } from '../../config/businessInfo'
import SvgIcon from '../ui/SvgIcon'
function FloatingWhatsApp() { return <a className="floating-whatsapp" href={`https://wa.me/${businessInfo.whatsapp.replace(/\D/g, '')}`} target="_blank" rel="noreferrer" aria-label="Chat with Baraka Solar Shop on WhatsApp"><SvgIcon src={whatsappIcon} size={23} /><span>Chat with us</span></a> }
export default FloatingWhatsApp
