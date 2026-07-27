import { useEffect, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import cartIcon from '../../assets/icons/ecommerce/cart.svg'
import wishlistIcon from '../../assets/icons/ecommerce/wishlist.svg'
import userIcon from '../../assets/icons/common/user.svg'
import SvgIcon from '../../components/ui/SvgIcon'
import { useAuth } from '../../hooks/useAuth'
import { useCart } from '../../hooks/useCart'
import { useWishlist } from '../../hooks/useWishlist'
import SiteLayout from '../../layouts/SiteLayout'
import { getSavedAddresses } from '../../services/checkoutService'
import '../../styles/auth.css'

const formatAccountDate = (value) => {
  if (!value) return 'Not available'

  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return 'Not available'

  return new Intl.DateTimeFormat('en-KE', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  }).format(date)
}

function AccountPage() {
  const navigate = useNavigate()
  const { logout, token, user } = useAuth()
  const { itemCount: cartItemCount } = useCart()
  const { itemCount: wishlistItemCount } = useWishlist()
  const [addressCount, setAddressCount] = useState(null)

  useEffect(() => {
    const controller = new AbortController()

    getSavedAddresses(token, controller.signal)
      .then((addresses) => setAddressCount(addresses.length))
      .catch((error) => {
        if (error?.name !== 'AbortError') setAddressCount(null)
      })

    return () => controller.abort()
  }, [token])

  const signOut = async () => {
    await logout()
    navigate('/', { replace: true })
  }

  return (
    <SiteLayout>
      <main className="account-page">
        <div className="account-page__container">
          <nav className="account-page__breadcrumb" aria-label="Breadcrumb">
            <ol>
              <li><Link to="/">Home</Link></li>
              <li aria-current="page">My Account</li>
            </ol>
          </nav>

          <header className="account-page__heading">
            <span className="account-page__avatar" aria-hidden="true">
              <SvgIcon src={userIcon} size={34} />
            </span>
            <div>
              <p>Customer account</p>
              <h1>Welcome, {user?.firstName || 'Customer'}</h1>
              <span>Review your account details and saved shopping activity.</span>
            </div>
          </header>

          <section className="account-page__profile" aria-labelledby="account-details-title">
            <div className="account-page__section-heading">
              <div>
                <p>Profile</p>
                <h2 id="account-details-title">Account details</h2>
              </div>
              <button type="button" onClick={signOut}>Sign Out</button>
            </div>

            <dl>
              <div>
                <dt>Customer name</dt>
                <dd>{user?.name}</dd>
              </div>
              <div>
                <dt>Email address</dt>
                <dd>{user?.email}</dd>
              </div>
              <div>
                <dt>Account created</dt>
                <dd>{formatAccountDate(user?.createdAt)}</dd>
              </div>
            </dl>
          </section>

          <section className="account-page__activity" aria-labelledby="account-activity-title">
            <div className="account-page__section-heading">
              <div>
                <p>Shopping activity</p>
                <h2 id="account-activity-title">Your Baraka account</h2>
              </div>
            </div>

            <div className="account-page__cards">
              <Link to="/wishlist" className="account-page__card">
                <SvgIcon src={wishlistIcon} size={27} />
                <span>Wishlist</span>
                <strong>{wishlistItemCount}</strong>
                <small>{wishlistItemCount === 1 ? 'saved product' : 'saved products'}</small>
              </Link>

              <Link to="/cart" className="account-page__card">
                <SvgIcon src={cartIcon} size={27} />
                <span>Shopping Cart</span>
                <strong>{cartItemCount}</strong>
                <small>{cartItemCount === 1 ? 'item in cart' : 'items in cart'}</small>
              </Link>

              <Link to="/account/orders" className="account-page__card">
                <span>Orders</span>
                <strong>View Orders</strong>
                <small>Review your order history and current statuses.</small>
              </Link>

              <article className="account-page__card account-page__card--placeholder">
                <span>Addresses</span>
                <strong>{addressCount ?? '—'}</strong>
                <small>{addressCount === 1 ? 'saved delivery address' : 'saved delivery addresses'}</small>
              </article>
            </div>
          </section>
        </div>
      </main>
    </SiteLayout>
  )
}

export default AccountPage
