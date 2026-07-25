import { Link } from 'react-router-dom'
import CartItem from '../../components/cart/CartItem'
import CartSummary from '../../components/cart/CartSummary'
import EmptyCart from '../../components/cart/EmptyCart'
import { useCart } from '../../hooks/useCart'
import SiteLayout from '../../layouts/SiteLayout'
import '../../styles/cart.css'

function CartPage() {
  const { items } = useCart()

  return (
    <SiteLayout>
      <main className="cart-page">
        <div className="cart-page__container">
          <nav className="cart-page__breadcrumb" aria-label="Breadcrumb">
            <ol>
              <li><Link to="/">Home</Link></li>
              <li aria-current="page">Shopping Cart</li>
            </ol>
          </nav>

          <header className="cart-page__heading">
            <p>Baraka Solar Shop</p>
            <h1>Shopping Cart</h1>
          </header>

          <div className="cart-page__layout">
            {items.length === 0 ? (
              <EmptyCart />
            ) : (
              <section className="cart-page__items" aria-label="Cart items">
                <ul>
                  {items.map((item) => <CartItem item={item} key={item.id} />)}
                </ul>
              </section>
            )}
            <CartSummary />
          </div>
        </div>
      </main>
    </SiteLayout>
  )
}

export default CartPage
