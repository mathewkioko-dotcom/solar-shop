import { categories } from '../../data/homeData'
import arrowRightIcon from '../../assets/icons/navigation/arrow-right.svg'
import SvgIcon from '../ui/SvgIcon'

function Categories({ scrollToSection }) {
  return <section id="categories" className="categories-section"><div className="container"><div className="section-heading centered-heading"><p>Shop by category</p><h2>Everything you need for reliable solar power</h2><span>Browse our most popular renewable energy product categories.</span></div><div className="category-grid">{categories.map((category) => <article className="category-card" key={category.slug}><div className="category-icon"><img src={category.icon} alt="" /></div><h3>{category.name}</h3><p>{category.description}</p><button type="button" onClick={() => scrollToSection('featured-products')}>Shop products <SvgIcon src={arrowRightIcon} size={16} /></button></article>)}</div></div></section>
}
export default Categories
