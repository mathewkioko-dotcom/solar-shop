import { brands } from '../../data/homeData'
function Brands() { return <section id="brands" className="brands-section"><div className="container"><div className="section-heading centered-heading"><p>Trusted global brands</p><h2>Quality products from leading manufacturers</h2><span>We stock genuine solar equipment from globally recognized brands.</span></div><div className="brands-grid">{brands.map((brand) => <article className="brand-card" key={brand.name}><img src={brand.image} alt={`${brand.name} logo`} loading="lazy" /></article>)}</div></div></section> }
export default Brands
