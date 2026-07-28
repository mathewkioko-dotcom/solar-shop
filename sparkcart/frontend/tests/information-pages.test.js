import test from 'node:test'
import assert from 'node:assert/strict'
import { existsSync, readFileSync } from 'node:fs'
import { fileURLToPath } from 'node:url'
import {
  footerShopLinks,
  informationNavigation,
  solutionLinks,
} from '../src/config/informationNavigation.js'
import { faqCategories, filterFaqCategories } from '../src/data/faqData.js'
import { validateContactForm } from '../src/utils/contactValidation.js'

const readSource = (relativePath) => readFileSync(
  new URL(relativePath, import.meta.url),
  'utf8',
)

test('all customer information routes are registered with renderable page modules', () => {
  const appSource = readSource('../src/App.jsx')
  const modules = {
    '/contact': '../src/pages/Information/ContactPage.jsx',
    '/shipping-information': '../src/pages/Information/ShippingInformationPage.jsx',
    '/returns-policy': '../src/pages/Information/ReturnsPolicyPage.jsx',
    '/warranty': '../src/pages/Information/WarrantyPage.jsx',
    '/faq': '../src/pages/Information/FaqPage.jsx',
    '/privacy-policy': '../src/pages/Legal/PrivacyPolicyPage.jsx',
    '/terms-and-conditions': '../src/pages/Legal/TermsAndConditionsPage.jsx',
  }

  for (const [route, modulePath] of Object.entries(modules)) {
    assert.match(appSource, new RegExp(`path="${route}"`))
    const moduleUrl = new URL(modulePath, import.meta.url)
    assert.equal(existsSync(fileURLToPath(moduleUrl)), true)
    assert.match(readFileSync(moduleUrl, 'utf8'), /export default /)
  }
})

test('footer support links match every information route and use router links', () => {
  const footerSource = readSource('../src/components/home/Footer.jsx')
  assert.deepEqual(
    informationNavigation.map((item) => item.path),
    [
      '/contact',
      '/shipping-information',
      '/returns-policy',
      '/warranty',
      '/faq',
      '/privacy-policy',
      '/terms-and-conditions',
    ],
  )
  assert.match(footerSource, /<Link key=\{item\.path\} to=\{item\.path\}>/)
  assert.doesNotMatch(footerSource, /href=["']#["']/)
})

test('footer product links use supported product category query routes', () => {
  assert.equal(footerShopLinks.length, 7)
  footerShopLinks.forEach((item) => {
    const url = new URL(item.path, 'https://barakasolarshop.test')
    assert.equal(url.pathname, '/products')
    assert.match(url.searchParams.get('category'), /^[a-z0-9]+(?:-[a-z0-9]+)*$/)
  })

  const productsSource = readSource('../src/pages/Products/ProductsPage.jsx')
  const serviceSource = readSource('../src/services/productService.js')
  assert.match(productsSource, /\^\[a-z0-9\]\+\(\?:-\[a-z0-9\]\+\)\*\$/)
  assert.match(serviceSource, /query\.set\('category', categorySlug\)/)
})

test('homepage solution buttons use stable router destinations', () => {
  const solutionsSource = readSource('../src/components/home/Solutions.jsx')
  assert.deepEqual(solutionLinks, {
    home: '/products?solution=home',
    commercial: '/products?solution=commercial',
  })
  assert.match(solutionsSource, /<Link to=\{solutionLinks\.home\}>/)
  assert.match(solutionsSource, /<Link to=\{solutionLinks\.commercial\}>/)
})

test('FAQ filtering searches questions, answers, and category names', () => {
  const mpesa = filterFaqCategories(faqCategories, 'M-Pesa')
  assert.equal(mpesa.some((group) => group.items.some((item) => item.id === 'mpesa')), true)

  const installation = filterFaqCategories(faqCategories, 'Installation')
  assert.equal(installation.some((group) => group.category === 'Installation'), true)

  assert.deepEqual(filterFaqCategories(faqCategories, 'no-result-phrase-xyz'), [])
})

test('FAQ accordion is controlled and exposes accessible relationships', () => {
  const faqSource = readSource('../src/pages/Information/FaqPage.jsx')
  assert.match(faqSource, /openId === item\.id/)
  assert.match(faqSource, /aria-expanded=\{isOpen\}/)
  assert.match(faqSource, /aria-controls=\{`faq-panel-/)
  assert.match(faqSource, /role="region"/)
})

test('contact form validation accepts Kenyan contact details and rejects missing fields', () => {
  assert.deepEqual(validateContactForm({
    fullName: 'Amina Kamau',
    email: 'amina@example.com',
    phone: '+254 712 345 678',
    subject: 'Battery sizing',
    message: 'Please help me choose a compatible battery.',
  }), {})

  const errors = validateContactForm({
    fullName: '',
    email: 'invalid',
    phone: '123',
    subject: '',
    message: '',
  })
  assert.deepEqual(Object.keys(errors), ['fullName', 'email', 'phone', 'subject', 'message'])
})

test('contact form reports mock submission through the toast system', () => {
  const contactSource = readSource('../src/pages/Information/ContactPage.jsx')
  assert.match(contactSource, /useToast\(\)/)
  assert.match(contactSource, /'Message Prepared'/)
  assert.match(contactSource, /Your contact request has been recorded locally\./)
  assert.doesNotMatch(contactSource, /\balert\s*\(/)
})

test('privacy and terms routes are unique and do not conflict', () => {
  const paths = informationNavigation.map((item) => item.path)
  assert.equal(new Set(paths).size, paths.length)
  assert.equal(paths.filter((path) => path === '/privacy-policy').length, 1)
  assert.equal(paths.filter((path) => path === '/terms-and-conditions').length, 1)
})
