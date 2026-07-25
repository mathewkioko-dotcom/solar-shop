import desktopHero from '../../assets/hero/desktop-hero.webp'
import mobileHero from '../../assets/hero/mobile-hero.webp'

function Hero() {
  return (
    <section
      style={{
        '--hero-desktop-image': `url(${desktopHero})`,
        '--hero-mobile-image': `url(${mobileHero})`,
      }}
    >
      <div>
        <p>Reliable Solar Solutions</p>

        <h1>Power your home and business with trusted solar products.</h1>

        <p>
          Shop high-quality solar panels, batteries, inverters, and complete
          energy systems from leading brands.
        </p>

        <a href="#products">Shop Solar Products</a>
      </div>
    </section>
  )
}

export default Hero
