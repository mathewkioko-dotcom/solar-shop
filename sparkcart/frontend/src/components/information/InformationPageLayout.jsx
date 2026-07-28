import { Link, NavLink } from 'react-router-dom'
import expertSupportIcon from '../../assets/icons/ecommerce/expert-support.svg'
import { businessInfo } from '../../config/businessInfo'
import { informationNavigation } from '../../config/informationNavigation'
import { usePageMeta } from '../../hooks/usePageMeta'
import SiteLayout from '../../layouts/SiteLayout'
import '../../styles/information-pages.css'
import SvgIcon from '../ui/SvgIcon'

function InformationPageLayout({
  children,
  description,
  eyebrow = 'Customer information',
  introduction,
  lastUpdated = businessInfo.policyLastUpdated,
  title,
}) {
  usePageMeta(`${title} | ${businessInfo.name}`, description || introduction)

  return (
    <SiteLayout>
      <main className="information-page">
        <div className="information-page__container">
          <nav className="information-page__breadcrumb" aria-label="Breadcrumb">
            <ol>
              <li><Link to="/">Home</Link></li>
              <li aria-current="page">{title}</li>
            </ol>
          </nav>

          <header className="information-page__header">
            <p>{eyebrow}</p>
            <h1>{title}</h1>
            <span>{introduction}</span>
            {lastUpdated && <small>Last updated: {lastUpdated}</small>}
          </header>

          <div className="information-page__layout">
            <aside className="information-page__sidebar" aria-label="Customer information pages">
              <h2>Help and information</h2>
              <nav>
                {informationNavigation.map((item) => (
                  <NavLink
                    className={({ isActive }) => isActive ? 'is-active' : undefined}
                    key={item.path}
                    to={item.path}
                  >
                    {item.label}
                  </NavLink>
                ))}
              </nav>
            </aside>

            <article className="information-page__content">
              {children}

              <section className="information-page__support-cta" aria-labelledby="support-cta-title">
                <span aria-hidden="true"><SvgIcon src={expertSupportIcon} size={24} /></span>
                <div>
                  <h2 id="support-cta-title">Need help with something specific?</h2>
                  <p>Our support team can help clarify product, order, delivery, return, and warranty questions.</p>
                </div>
                <Link to="/contact">Contact support</Link>
              </section>
            </article>
          </div>
        </div>
      </main>
    </SiteLayout>
  )
}

export default InformationPageLayout
