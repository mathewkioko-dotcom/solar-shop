function InformationSections({ sections }) {
  return (
    <div className="information-sections">
      {sections.map((section) => (
        <section id={section.id} key={section.id}>
          <h2>{section.title}</h2>
          {Array.isArray(section.content)
            ? section.content.map((paragraph) => <p key={paragraph}>{paragraph}</p>)
            : <p>{section.content}</p>}
          {section.items && (
            <ul>
              {section.items.map((item) => <li key={item}>{item}</li>)}
            </ul>
          )}
        </section>
      ))}
    </div>
  )
}

export default InformationSections
