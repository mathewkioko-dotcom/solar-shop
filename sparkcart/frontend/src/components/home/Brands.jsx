import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { getBrands } from '../../services/productService'
import { useToast } from '../../hooks/useToast'

function Brands() {
  const { showError } = useToast()
  const [brands, setBrands] = useState([])
  useEffect(() => {
    const controller = new AbortController()
    getBrands(controller.signal).then(setBrands).catch((error) => {
      if (error?.name !== 'AbortError') {
        setBrands([])
        showError('Brands Unavailable', error?.message || 'Brand information could not be loaded.')
      }
    })
    return () => controller.abort()
  }, [showError])
  if (!brands.length) return null
  return <section id="brands" className="brands-section"><div className="container"><div className="section-heading centered-heading"><p>Trusted global brands</p><h2>Quality products from leading manufacturers</h2><span>We stock genuine solar equipment from globally recognized brands.</span></div><div className="brands-grid">{brands.map((brand) => <Link className="brand-card" key={brand.id} to={`/products?brand=${encodeURIComponent(brand.slug)}`} aria-label={`Shop ${brand.name} products`}>{brand.logoUrl ? <img src={brand.logoUrl} alt={`${brand.name} logo`} loading="lazy" /> : <strong>{brand.name}</strong>}</Link>)}</div></div></section>
}
export default Brands
