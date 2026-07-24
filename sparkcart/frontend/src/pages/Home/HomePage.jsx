import '../../styles/home.css'
import '../../styles/header.css'
import '../../styles/hero.css'
import '../../styles/categories.css'
import '../../styles/products.css'
import '../../styles/brands.css'
import '../../styles/footer.css'
import '../../styles/responsive.css'
import Benefits from '../../components/home/Benefits'
import Brands from '../../components/home/Brands'
import Categories from '../../components/home/Categories'
import FeaturedProducts from '../../components/home/FeaturedProducts'
import Hero from '../../components/home/Hero'
import Newsletter from '../../components/home/Newsletter'
import Solutions from '../../components/home/Solutions'
import SiteLayout from '../../layouts/SiteLayout'

function HomePage() {
  return (
    <SiteLayout>
      {({ searchTerm, scrollToSection }) => (
        <main><Hero scrollToSection={scrollToSection} /><Categories scrollToSection={scrollToSection} /><FeaturedProducts searchTerm={searchTerm} /><Solutions /><Brands /><Benefits /><Newsletter /></main>
      )}
    </SiteLayout>
  )
}

export default HomePage
