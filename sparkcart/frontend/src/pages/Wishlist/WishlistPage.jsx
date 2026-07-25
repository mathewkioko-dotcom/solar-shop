import { useState } from 'react'
import { Link } from 'react-router-dom'
import EmptyWishlist from '../../components/wishlist/EmptyWishlist'
import WishlistItem from '../../components/wishlist/WishlistItem'
import { useWishlist } from '../../hooks/useWishlist'
import SiteLayout from '../../layouts/SiteLayout'
import '../../styles/wishlist.css'

function WishlistPage() {
  const { clearWishlist, items } = useWishlist()
  const [isConfirmingClear, setIsConfirmingClear] = useState(false)

  const confirmClearWishlist = () => {
    clearWishlist()
    setIsConfirmingClear(false)
  }

  return (
    <SiteLayout>
      <main className="wishlist-page">
        <div className="wishlist-page__container">
          <nav className="wishlist-page__breadcrumb" aria-label="Breadcrumb">
            <ol>
              <li><Link to="/">Home</Link></li>
              <li aria-current="page">Wishlist</li>
            </ol>
          </nav>

          <header className="wishlist-page__heading">
            <div>
              <p>Saved products</p>
              <h1>My Wishlist</h1>
              <span>Keep your preferred solar products together until you are ready to buy.</span>
            </div>

            {items.length > 0 && (
              <div className="wishlist-page__clear">
                {!isConfirmingClear ? (
                  <button type="button" onClick={() => setIsConfirmingClear(true)}>
                    Clear Wishlist
                  </button>
                ) : (
                  <div className="wishlist-page__clear-confirmation" role="group" aria-label="Confirm clear wishlist">
                    <p>Clear all saved products?</p>
                    <div>
                      <button type="button" onClick={() => setIsConfirmingClear(false)}>Cancel</button>
                      <button type="button" onClick={confirmClearWishlist}>Clear Wishlist</button>
                    </div>
                  </div>
                )}
              </div>
            )}
          </header>

          {items.length === 0 ? (
            <EmptyWishlist />
          ) : (
            <section className="wishlist-page__products" aria-label="Saved products">
              <ul>
                {items.map((item) => <WishlistItem item={item} key={item.id} />)}
              </ul>
            </section>
          )}
        </div>
      </main>
    </SiteLayout>
  )
}

export default WishlistPage

