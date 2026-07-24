import { benefits } from '../../data/homeData'
import SvgIcon from '../ui/SvgIcon'
function Benefits() { return <section className="benefits-section"><div className="container benefits-grid">{benefits.map((benefit) => <article key={benefit.title}><span className="benefits-icon-wrap"><SvgIcon className="benefits-icon" src={benefit.icon} size={24} /></span><div><h3>{benefit.title}</h3><p>{benefit.text}</p></div></article>)}</div></section> }
export default Benefits
