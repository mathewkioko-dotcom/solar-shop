import { lazy, Suspense, useEffect } from 'react'
import { BrowserRouter, Link, Route, Routes } from 'react-router-dom'
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
import OrdersPage from './pages/Account/OrdersPage'
import OrderDetailsPage from './pages/Account/OrderDetailsPage'
import CheckoutPage from './pages/Checkout/CheckoutPage'
import GuestOrderConfirmationPage from './pages/Checkout/GuestOrderConfirmationPage'
import ProtectedRoute from './components/auth/ProtectedRoute'
import RouteScrollRestoration from './components/routing/RouteScrollRestoration'
import AdminRoute from './admin/components/AdminRoute'
import { useToast } from './hooks/useToast'

const AdminLayout = lazy(() => import('./admin/layouts/AdminLayout'))
const AdminDashboard = lazy(() => import('./admin/pages/Dashboard/DashboardPage'))
const AdminProducts = lazy(() => import('./admin/pages/Products/ProductListPage'))
const AdminProductForm = lazy(() => import('./admin/pages/Products/ProductFormPage'))
const AdminBrands = lazy(() => import('./admin/pages/Brands/BrandListPage'))
const AdminBrandForm = lazy(() => import('./admin/pages/Brands/BrandFormPage'))
const AdminCategories = lazy(() => import('./admin/pages/Categories/CategoriesPage'))
const AdminInventory = lazy(() => import('./admin/pages/Inventory/InventoryPage'))
const ContactPage = lazy(() => import('./pages/Information/ContactPage'))
const ShippingInformationPage = lazy(() => import('./pages/Information/ShippingInformationPage'))
const ReturnsPolicyPage = lazy(() => import('./pages/Information/ReturnsPolicyPage'))
const WarrantyPage = lazy(() => import('./pages/Information/WarrantyPage'))
const FaqPage = lazy(() => import('./pages/Information/FaqPage'))
const PrivacyPolicyPage = lazy(() => import('./pages/Legal/PrivacyPolicyPage'))
const TermsAndConditionsPage = lazy(() => import('./pages/Legal/TermsAndConditionsPage'))

function InformationPageFallback() {
  return (
    <SiteLayout>
      <main className="information-page">
        <div className="information-page__container" role="status">Loading customer information…</div>
      </main>
    </SiteLayout>
  )
}

function LazyInformationPage({ children }) {
  return <Suspense fallback={<InformationPageFallback />}>{children}</Suspense>
}

function NotFoundPage() {
  const { showError } = useToast()
  useEffect(() => {
    showError('Page Not Found', 'The page you requested does not exist or may have moved.')
  }, [showError])

  return (
    <SiteLayout>
      <main className="product-details-page">
        <section className="product-details-page__state" aria-labelledby="not-found-title">
          <p className="product-details-page__eyebrow">404</p>
          <h1 id="not-found-title">Page Not Found</h1>
          <p>The page you requested does not exist or may have moved.</p>
          <Link className="product-details-page__primary-link" to="/">Return to homepage</Link>
        </section>
      </main>
    </SiteLayout>
  )
}

function App() {
  return (
    <BrowserRouter>
      <RouteScrollRestoration />
      <Routes>
        <Route
          path="/admin"
          element={(
            <AdminRoute>
              <Suspense fallback={<main className="admin-auth-loading" role="status">Loading administration…</main>}>
                <AdminLayout />
              </Suspense>
            </AdminRoute>
          )}
        >
          <Route index element={<AdminDashboard />} />
          <Route path="products" element={<AdminProducts />} />
          <Route path="products/new" element={<AdminProductForm />} />
          <Route path="products/:id/edit" element={<AdminProductForm />} />
          <Route path="brands" element={<AdminBrands />} />
          <Route path="brands/new" element={<AdminBrandForm />} />
          <Route path="brands/:id/edit" element={<AdminBrandForm />} />
          <Route path="categories" element={<AdminCategories />} />
          <Route path="inventory" element={<AdminInventory />} />
        </Route>
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
        <Route path="/checkout" element={<CheckoutPage />} />
        <Route path="/order-confirmation/:token" element={<GuestOrderConfirmationPage />} />
        <Route path="/contact" element={<LazyInformationPage><ContactPage /></LazyInformationPage>} />
        <Route path="/shipping-information" element={<LazyInformationPage><ShippingInformationPage /></LazyInformationPage>} />
        <Route path="/returns-policy" element={<LazyInformationPage><ReturnsPolicyPage /></LazyInformationPage>} />
        <Route path="/warranty" element={<LazyInformationPage><WarrantyPage /></LazyInformationPage>} />
        <Route path="/faq" element={<LazyInformationPage><FaqPage /></LazyInformationPage>} />
        <Route path="/privacy-policy" element={<LazyInformationPage><PrivacyPolicyPage /></LazyInformationPage>} />
        <Route path="/terms-and-conditions" element={<LazyInformationPage><TermsAndConditionsPage /></LazyInformationPage>} />
        <Route path="/account/orders" element={<ProtectedRoute><OrdersPage /></ProtectedRoute>} />
        <Route path="/account/orders/:orderNumber" element={<ProtectedRoute><OrderDetailsPage /></ProtectedRoute>} />
        <Route path="*" element={<NotFoundPage />} />
      </Routes>
    </BrowserRouter>
  )
}

export default App
