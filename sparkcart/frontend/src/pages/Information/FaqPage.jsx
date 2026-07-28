import { useMemo, useState } from 'react'
import searchIcon from '../../assets/icons/common/search.svg'
import chevronDownIcon from '../../assets/icons/navigation/chevron-down.svg'
import InformationPageLayout from '../../components/information/InformationPageLayout'
import SvgIcon from '../../components/ui/SvgIcon'
import { faqCategories, filterFaqCategories } from '../../data/faqData'

function FaqPage() {
  const [search, setSearch] = useState('')
  const [openId, setOpenId] = useState(null)
  const filteredCategories = useMemo(
    () => filterFaqCategories(faqCategories, search),
    [search],
  )

  const updateSearch = (event) => {
    setSearch(event.target.value)
    setOpenId(null)
  }

  return (
    <InformationPageLayout
      title="Frequently Asked Questions"
      introduction="Find practical answers about ordering, payments, delivery, products, installation, warranties, returns, and customer accounts."
      description="Answers to frequently asked questions about shopping with Baraka Solar Shop."
    >
      <div className="faq-search">
        <label htmlFor="faq-search">Search questions and answers</label>
        <div>
          <SvgIcon src={searchIcon} size={20} />
          <input id="faq-search" type="search" value={search} onChange={updateSearch} placeholder="Search delivery, M-Pesa, warranty…" />
        </div>
      </div>

      {filteredCategories.length === 0 ? (
        <section className="faq-empty" aria-live="polite">
          <h2>No matching answers</h2>
          <p>Try a broader term, or contact our support team for help with your question.</p>
          <button type="button" onClick={() => setSearch('')}>Clear search</button>
        </section>
      ) : (
        <div className="faq-groups">
          {filteredCategories.map((group) => (
            <section key={group.category} aria-labelledby={`faq-${group.category.toLowerCase().replace(/\s/g, '-')}`}>
              <h2 id={`faq-${group.category.toLowerCase().replace(/\s/g, '-')}`}>{group.category}</h2>
              <div className="faq-accordion">
                {group.items.map((item) => {
                  const isOpen = openId === item.id
                  return (
                    <article className={isOpen ? 'is-open' : undefined} key={item.id}>
                      <h3>
                        <button
                          id={`faq-button-${item.id}`}
                          type="button"
                          aria-expanded={isOpen}
                          aria-controls={`faq-panel-${item.id}`}
                          onClick={() => setOpenId(isOpen ? null : item.id)}
                        >
                          <span>{item.question}</span>
                          <SvgIcon src={chevronDownIcon} size={19} />
                        </button>
                      </h3>
                      <div
                        id={`faq-panel-${item.id}`}
                        className="faq-accordion__panel"
                        role="region"
                        aria-labelledby={`faq-button-${item.id}`}
                        aria-hidden={!isOpen}
                      >
                        <p>{item.answer}</p>
                      </div>
                    </article>
                  )
                })}
              </div>
            </section>
          ))}
        </div>
      )}
    </InformationPageLayout>
  )
}

export default FaqPage
