import desktopHero from '../../assets/hero/desktop-hero.webp'
import mobileHero from '../../assets/hero/mobile-hero.webp'
import arrowRightIcon from '../../assets/icons/navigation/arrow-right.svg'
import { heroTrustItems } from '../../data/homeData'
import SvgIcon from '../ui/SvgIcon'

function Hero({ scrollToSection }) {
  return <section id="hero" className="hero-section"><picture className="hero-background"><source media="(max-width: 767px)" srcSet={mobileHero} /><img src={desktopHero} alt="" aria-hidden="true" /></picture><div className="hero-overlay" /><div className="container hero-content"><div className="hero-copy"><p className="hero-eyebrow">Power your home. <span>Power your future.</span></p><h1>Reliable solar solutions for a <span>brighter tomorrow</span></h1><p className="hero-description">High-quality solar products from trusted global brands, selected for performance, durability and long-term savings.</p><div className="hero-benefits">{heroTrustItems.map((item) => <article key={item.title}><SvgIcon className="benefit-icon" src={item.icon} size={26} /><div><strong>{item.title}</strong><small>{item.text}</small></div></article>)}</div><div className="hero-actions"><button className="primary-button" type="button" onClick={() => scrollToSection('featured-products')}>Shop Now <SvgIcon src={arrowRightIcon} size={18} /></button><button className="secondary-button" type="button" onClick={() => scrollToSection('categories')}>Explore Solutions</button></div></div></div></section>
}
export default Hero
