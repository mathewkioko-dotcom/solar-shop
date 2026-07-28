import { Link } from 'react-router-dom'
import arrowRightIcon from '../../assets/icons/navigation/arrow-right.svg'
import { solutionLinks } from '../../config/informationNavigation'
import SvgIcon from '../ui/SvgIcon'

function Solutions() { return <section className="solutions-section"><div className="container"><div className="solutions-grid"><article className="solution-card solution-home"><div><p>Home solar solutions</p><h2>Power your home with confidence</h2><span>Build a complete solar system with panels, batteries, inverters and professional support.</span><Link to={solutionLinks.home}>Explore home solutions <SvgIcon src={arrowRightIcon} size={16} /></Link></div></article><article className="solution-card solution-business"><div><p>Commercial systems</p><h2>Reduce your business energy costs</h2><span>Reliable commercial solar equipment designed for long-term performance and savings.</span><Link to={solutionLinks.commercial}>Explore commercial solar <SvgIcon src={arrowRightIcon} size={16} /></Link></div></article></div></div></section> }
export default Solutions
