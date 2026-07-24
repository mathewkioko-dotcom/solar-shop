import barakaLogo from '../../assets/logo/baraka-logo.svg'
import menuIcon from '../../assets/icons/common/menu.svg'
import searchIcon from '../../assets/icons/common/search.svg'
import userIcon from '../../assets/icons/common/user.svg'
import cartIcon from '../../assets/icons/ecommerce/cart.svg'
import wishlistIcon from '../../assets/icons/ecommerce/wishlist.svg'
import chevronDownIcon from '../../assets/icons/navigation/chevron-down.svg'
import { categories } from '../../data/homeData'
import SvgIcon from '../ui/SvgIcon'

function Header({ searchTerm, setSearchTerm, categoryMenuOpen, setCategoryMenuOpen, mobileMenuOpen, setMobileMenuOpen, scrollToSection }) {
  return <div className="main-header"><div className="container main-header-content">
    <button className="mobile-menu-button" type="button" aria-label="Open navigation" aria-expanded={mobileMenuOpen} onClick={() => setMobileMenuOpen((open) => !open)}><SvgIcon src={menuIcon} size={24} /></button>
    <a className="brand-logo" href="/" aria-label="Baraka Solar Shop"><img src={barakaLogo} alt="Baraka Solar Shop" /></a>
    <div className="header-category-wrapper"><button className="category-trigger" type="button" onClick={() => setCategoryMenuOpen((open) => !open)}><SvgIcon src={menuIcon} size={20} />All Categories<SvgIcon src={chevronDownIcon} size={18} className="trigger-arrow" /></button>
      {categoryMenuOpen && <div className="category-dropdown">{categories.map((category) => <button type="button" key={category.slug} onClick={() => { scrollToSection('categories'); setCategoryMenuOpen(false) }}><img src={category.icon} alt="" />{category.name}</button>)}</div>}
    </div>
    <label className="header-search"><span className="sr-only">Search products</span><input type="search" value={searchTerm} onChange={(event) => setSearchTerm(event.target.value)} placeholder="Search solar panels, batteries, inverters..." /><button type="button" aria-label="Search products" onClick={() => scrollToSection('featured-products')}><SvgIcon src={searchIcon} size={22} /></button></label>
    <div className="header-actions"><button className="header-action" type="button"><SvgIcon className="header-action-icon" src={userIcon} size={24} /><span><strong>Sign In</strong><small>My Account</small></span></button><button className="header-action icon-action" type="button"><SvgIcon className="header-action-icon" src={wishlistIcon} size={24} /><span className="action-label">Wishlist</span><span className="action-count">0</span></button><button className="header-action icon-action" type="button"><SvgIcon className="header-action-icon" src={cartIcon} size={24} /><span className="action-label">Cart</span><span className="action-count">0</span></button></div>
  </div></div>
}

export default Header
