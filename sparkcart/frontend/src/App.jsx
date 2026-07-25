import { BrowserRouter, Route, Routes } from 'react-router-dom'
import SiteLayout from './layouts/SiteLayout'
import HomePage from './pages/Home/HomePage'
import ProductsPage from './pages/Products/ProductsPage'
import ProductDetailsPage from './pages/ProductDetails/ProductDetailsPage'
import CartPage from './pages/Cart/CartPage'
import WishlistPage from './pages/Wishlist/WishlistPage'
import LoginPage from './pages/Auth/LoginPage'
import RegisterPage from './pages/Auth/RegisterPage'
import ForgotPasswordPage from './pages/Auth/ForgotPasswordPage'
import ResetPasswordPage from './pages/Auth/ResetPasswordPage'
import AccountPage from './pages/Account/AccountPage'
import ProtectedRoute from './components/auth/ProtectedRoute'
import './App.css'

function NotFoundPage() {
  return (
    <SiteLayout>
      <main className="product-details-page">
        <section className="product-details-page__state" aria-labelledby="not-found-title">
          <p className="product-details-page__eyebrow">404</p>
          <h1 id="not-found-title">Page Not Found</h1>
          <p>The page you requested does not exist or may have moved.</p>
          <a className="product-details-page__primary-link" href="/">Return to homepage</a>
        </section>
      </main>
    </SiteLayout>
  )
}

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/products" element={<ProductsPage />} />
        <Route path="/products/:slug" element={<ProductDetailsPage />} />
        <Route path="/cart" element={<CartPage />} />
        <Route path="/wishlist" element={<WishlistPage />} />
        <Route path="/login" element={<ProtectedRoute guestOnly><LoginPage /></ProtectedRoute>} />
        <Route path="/register" element={<ProtectedRoute guestOnly><RegisterPage /></ProtectedRoute>} />
        <Route path="/forgot-password" element={<ProtectedRoute guestOnly><ForgotPasswordPage /></ProtectedRoute>} />
        <Route path="/reset-password" element={<ProtectedRoute guestOnly><ResetPasswordPage /></ProtectedRoute>} />
        <Route path="/account" element={<ProtectedRoute><AccountPage /></ProtectedRoute>} />
        <Route path="*" element={<NotFoundPage />} />
      </Routes>
    </BrowserRouter>
  )
}

export default App
