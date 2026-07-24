import { useState } from 'react'
import FloatingWhatsApp from '../components/home/FloatingWhatsApp'
import Footer from '../components/home/Footer'
import Header from '../components/home/Header'
import Navigation from '../components/home/Navigation'
import TopBar from '../components/home/TopBar'

function SiteLayout({ children }) {
  const [searchTerm, setSearchTerm] = useState('')
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const [categoryMenuOpen, setCategoryMenuOpen] = useState(false)

  const scrollToSection = (sectionId) => {
    if (window.location.pathname !== '/') {
      window.location.assign(`/#${sectionId}`)
      return
    }

    document.getElementById(sectionId)?.scrollIntoView({ behavior: 'smooth', block: 'start' })
    setMobileMenuOpen(false)
  }

  return (
    <div className="home-page">
      <header className="site-header">
        <TopBar />
        <Header
          searchTerm={searchTerm}
          setSearchTerm={setSearchTerm}
          categoryMenuOpen={categoryMenuOpen}
          setCategoryMenuOpen={setCategoryMenuOpen}
          mobileMenuOpen={mobileMenuOpen}
          setMobileMenuOpen={setMobileMenuOpen}
          scrollToSection={scrollToSection}
        />
        <Navigation mobileMenuOpen={mobileMenuOpen} scrollToSection={scrollToSection} />
      </header>
      {typeof children === 'function' ? children({ searchTerm, scrollToSection }) : children}
      <Footer />
      <FloatingWhatsApp />
    </div>
  )
}

export default SiteLayout
