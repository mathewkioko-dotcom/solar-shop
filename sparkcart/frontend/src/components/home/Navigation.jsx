import { navigationItems } from '../../data/homeData'

function Navigation({ mobileMenuOpen, scrollToSection }) {
  return <nav className={`primary-navigation ${mobileMenuOpen ? 'mobile-navigation-open' : ''}`}><div className="container navigation-content">{navigationItems.map((item) => <button className={item.className || ''} type="button" key={item.label} onClick={() => scrollToSection(item.section)}>{item.label}</button>)}</div></nav>
}

export default Navigation
