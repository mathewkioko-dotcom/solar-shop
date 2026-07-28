import { useCallback, useEffect, useRef, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import barakaLogo from '../../assets/logo/baraka-logo.svg'
import menuIcon from '../../assets/icons/common/menu.svg'
import searchIcon from '../../assets/icons/common/search.svg'
import userIcon from '../../assets/icons/common/user.svg'
import cartIcon from '../../assets/icons/ecommerce/cart.svg'
import wishlistIcon from '../../assets/icons/ecommerce/wishlist.svg'
import chevronDownIcon from '../../assets/icons/navigation/chevron-down.svg'
import { categories } from '../../data/homeData'
import { useAuth } from '../../hooks/useAuth'
import { useCart } from '../../hooks/useCart'
import { useWishlist } from '../../hooks/useWishlist'
import { useToast } from '../../hooks/useToast'
import { getProductSuggestions } from '../../services/productService'
import '../../styles/auth.css'
import '../../styles/search-dropdown.css'
import SvgIcon from '../ui/SvgIcon'

const formatPrice = (price) => {
  if (!Number.isFinite(price)) return 'Contact for pricing'

  return new Intl.NumberFormat('en-KE', {
    style: 'currency',
    currency: 'KES',
    maximumFractionDigits: 0,
  }).format(price)
}

function Header({ searchTerm, setSearchTerm, categoryMenuOpen, setCategoryMenuOpen, mobileMenuOpen, setMobileMenuOpen, scrollToSection }) {
  const navigate = useNavigate()
  const { isAuthenticated, logout, user } = useAuth()
  const { itemCount: cartItemCount } = useCart()
  const { itemCount: wishlistItemCount } = useWishlist()
  const { showError, showSuccess } = useToast()
  const searchWrapperRef = useRef(null)
  const accountWrapperRef = useRef(null)
  const [suggestions, setSuggestions] = useState([])
  const [searchStatus, setSearchStatus] = useState('idle')
  const [isSearchOpen, setIsSearchOpen] = useState(false)
  const [activeIndex, setActiveIndex] = useState(-1)
  const [accountMenuOpen, setAccountMenuOpen] = useState(false)
  const normalizedSearch = searchTerm.trim()

  useEffect(() => {
    if (!normalizedSearch) return undefined

    const controller = new AbortController()
    const debounceTimer = window.setTimeout(() => {
      getProductSuggestions(normalizedSearch, controller.signal)
        .then((products) => {
          setSuggestions(products)
          setSearchStatus('success')
          setActiveIndex((currentIndex) => (
            currentIndex >= products.length ? -1 : currentIndex
          ))
        })
        .catch((error) => {
          if (error?.name === 'AbortError') return
          setSuggestions([])
          setSearchStatus('error')
          setActiveIndex(-1)
          showError('Search Unavailable', error?.message || 'Unable to connect to the server. Please try again.')
        })
    }, 300)

    return () => {
      window.clearTimeout(debounceTimer)
      controller.abort()
    }
  }, [normalizedSearch, showError])

  useEffect(() => {
    const closeWhenClickingOutside = (event) => {
      if (!searchWrapperRef.current?.contains(event.target)) {
        setIsSearchOpen(false)
        setActiveIndex(-1)
      }
      if (!accountWrapperRef.current?.contains(event.target)) {
        setAccountMenuOpen(false)
      }
    }

    const closeAccountMenuWithEscape = (event) => {
      if (
        event.key !== 'Escape'
        || !accountWrapperRef.current?.querySelector('.header-account-dropdown')
      ) return
      setAccountMenuOpen(false)
      accountWrapperRef.current.querySelector('button')?.focus()
    }

    document.addEventListener('pointerdown', closeWhenClickingOutside)
    document.addEventListener('keydown', closeAccountMenuWithEscape)
    return () => {
      document.removeEventListener('pointerdown', closeWhenClickingOutside)
      document.removeEventListener('keydown', closeAccountMenuWithEscape)
    }
  }, [])

  const submitSearch = useCallback(() => {
    const params = new URLSearchParams({ search: searchTerm.trim() })
    setIsSearchOpen(false)
    setActiveIndex(-1)
    navigate(`/products?${params.toString()}`)
  }, [navigate, searchTerm])

  const selectSuggestion = useCallback((product) => {
    setIsSearchOpen(false)
    setActiveIndex(-1)
    navigate(`/products/${encodeURIComponent(product.slug)}`)
  }, [navigate])

  const handleSearchChange = useCallback((event) => {
    const nextSearch = event.target.value
    const nextNormalizedSearch = nextSearch.trim()
    const hasSearch = Boolean(nextNormalizedSearch)

    setSearchTerm(nextSearch)
    if (!hasSearch) {
      setSuggestions([])
      setSearchStatus('idle')
    } else if (nextNormalizedSearch !== normalizedSearch) {
      setSuggestions([])
      setSearchStatus('loading')
    }
    setIsSearchOpen(hasSearch)
    setActiveIndex(-1)
  }, [normalizedSearch, setSearchTerm])

  const handleSearchKeyDown = useCallback((event) => {
    if (event.key === 'Escape') {
      event.preventDefault()
      setIsSearchOpen(false)
      setActiveIndex(-1)
      return
    }

    if (event.key === 'ArrowDown' && suggestions.length > 0) {
      event.preventDefault()
      setIsSearchOpen(true)
      setActiveIndex((currentIndex) => (currentIndex + 1) % suggestions.length)
      return
    }

    if (event.key === 'ArrowUp' && suggestions.length > 0) {
      event.preventDefault()
      setIsSearchOpen(true)
      setActiveIndex((currentIndex) => (
        currentIndex <= 0 ? suggestions.length - 1 : currentIndex - 1
      ))
      return
    }

    if (event.key === 'Enter' && isSearchOpen && activeIndex >= 0) {
      event.preventDefault()
      selectSuggestion(suggestions[activeIndex])
    }
  }, [activeIndex, isSearchOpen, selectSuggestion, suggestions])

  const showDropdown = isSearchOpen && Boolean(normalizedSearch)
  const customerFirstName = user?.firstName || user?.name?.split(/\s+/)[0] || 'Account'

  const signOut = useCallback(async () => {
    setAccountMenuOpen(false)
    await logout()
    showSuccess('Signed Out', 'You have been signed out successfully.')
    navigate('/')
  }, [logout, navigate, showSuccess])

  return <div className="main-header"><div className="container main-header-content">
    <button className="mobile-menu-button" type="button" aria-label="Open navigation" aria-expanded={mobileMenuOpen} onClick={() => setMobileMenuOpen((open) => !open)}><SvgIcon src={menuIcon} size={24} /></button>
    <a className="brand-logo" href="/" aria-label="Baraka Solar Shop"><img src={barakaLogo} alt="Baraka Solar Shop" /></a>
    <div className="header-category-wrapper"><button className="category-trigger" type="button" onClick={() => setCategoryMenuOpen((open) => !open)}><SvgIcon src={menuIcon} size={20} />All Categories<SvgIcon src={chevronDownIcon} size={18} className="trigger-arrow" /></button>
      {categoryMenuOpen && <div className="category-dropdown">{categories.map((category) => <button type="button" key={category.slug} onClick={() => { scrollToSection('categories'); setCategoryMenuOpen(false) }}><img src={category.icon} alt="" />{category.name}</button>)}</div>}
    </div>
    <div className="header-search-wrapper" ref={searchWrapperRef}>
      <form className="header-search" role="search" onSubmit={(event) => { event.preventDefault(); submitSearch() }}>
        <label className="sr-only" htmlFor="header-product-search">Search products</label>
        <input
          id="header-product-search"
          type="search"
          value={searchTerm}
          onChange={handleSearchChange}
          onFocus={() => { if (normalizedSearch) setIsSearchOpen(true) }}
          onKeyDown={handleSearchKeyDown}
          placeholder="Search solar panels, batteries, inverters..."
          role="combobox"
          aria-autocomplete="list"
          aria-controls="header-search-suggestions"
          aria-expanded={showDropdown}
          aria-activedescendant={activeIndex >= 0 ? `header-search-suggestion-${activeIndex}` : undefined}
        />
        <button type="submit" aria-label="Search products"><SvgIcon src={searchIcon} size={22} /></button>
      </form>
      {showDropdown && (
        <div className="search-dropdown" id="header-search-suggestions" role="listbox" aria-label="Product suggestions">
          {searchStatus === 'loading' && <div className="search-dropdown__status" role="status">Searching products...</div>}
          {searchStatus === 'success' && suggestions.length === 0 && <div className="search-dropdown__status" role="status">No matching products found.</div>}
          {suggestions.map((product, index) => (
            <button
              className={`search-dropdown__suggestion${activeIndex === index ? ' search-dropdown__suggestion--active' : ''}`}
              id={`header-search-suggestion-${index}`}
              key={product.id ?? product.slug}
              type="button"
              role="option"
              aria-selected={activeIndex === index}
              onMouseEnter={() => setActiveIndex(index)}
              onClick={() => selectSuggestion(product)}
            >
              <span className="search-dropdown__thumbnail">
                {product.mainImageUrl
                  ? <img src={product.mainImageUrl} alt="" loading="lazy" />
                  : <SvgIcon src={searchIcon} size={20} />}
              </span>
              <span className="search-dropdown__details">
                <strong>{product.name}</strong>
                <small>{product.categoryName || 'Solar equipment'}</small>
              </span>
              <span className="search-dropdown__price">{formatPrice(product.price)}</span>
            </button>
          ))}
        </div>
      )}
    </div>
    <div className="header-actions">
      <div className="header-account-wrapper" ref={accountWrapperRef}>
        <button
          className="header-action"
          type="button"
          aria-expanded={isAuthenticated ? accountMenuOpen : undefined}
          aria-haspopup={isAuthenticated ? 'menu' : undefined}
          onClick={() => {
            if (!isAuthenticated) {
              navigate('/login')
              return
            }
            setAccountMenuOpen((open) => !open)
          }}
        >
          <SvgIcon className="header-action-icon" src={userIcon} size={24} />
          <span>
            <strong>{isAuthenticated ? customerFirstName : 'Sign In'}</strong>
            <small>My Account</small>
          </span>
        </button>
        {isAuthenticated && accountMenuOpen && (
          <div className="header-account-dropdown" role="menu" aria-label="Account menu">
            <Link role="menuitem" to="/account" onClick={() => setAccountMenuOpen(false)}>My Account</Link>
            <Link role="menuitem" to="/wishlist" onClick={() => setAccountMenuOpen(false)}>Wishlist</Link>
            <Link role="menuitem" to="/cart" onClick={() => setAccountMenuOpen(false)}>Cart</Link>
            <button role="menuitem" type="button" onClick={signOut}>Logout</button>
          </div>
        )}
      </div>
      <button className="header-action icon-action" type="button" aria-label={`Wishlist, ${wishlistItemCount} ${wishlistItemCount === 1 ? 'item' : 'items'}`} onClick={() => navigate('/wishlist')}><SvgIcon className="header-action-icon" src={wishlistIcon} size={24} /><span className="action-label">Wishlist</span><span className="action-count">{wishlistItemCount}</span></button>
      <button className="header-action icon-action" type="button" aria-label={`Cart, ${cartItemCount} ${cartItemCount === 1 ? 'item' : 'items'}`} onClick={() => navigate('/cart')}><SvgIcon className="header-action-icon" src={cartIcon} size={24} /><span className="action-label">Cart</span><span className="action-count">{cartItemCount}</span></button>
    </div>
  </div></div>
}

export default Header
