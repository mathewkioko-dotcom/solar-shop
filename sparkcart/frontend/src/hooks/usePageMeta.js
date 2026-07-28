import { useEffect } from 'react'

const DEFAULT_TITLE = 'Baraka Solar Shop | Solar & Power Marketplace'
const DEFAULT_DESCRIPTION = 'Shop reliable solar panels, batteries, inverters, accessories, and energy solutions from Baraka Solar Shop.'

function getDescriptionMeta() {
  let element = document.querySelector('meta[name="description"]')
  if (!element) {
    element = document.createElement('meta')
    element.setAttribute('name', 'description')
    document.head.appendChild(element)
  }
  return element
}

export function usePageMeta(title, description) {
  useEffect(() => {
    const previousTitle = document.title
    const descriptionMeta = getDescriptionMeta()
    const previousDescription = descriptionMeta.getAttribute('content')

    document.title = title || DEFAULT_TITLE
    descriptionMeta.setAttribute('content', description || DEFAULT_DESCRIPTION)

    return () => {
      document.title = previousTitle || DEFAULT_TITLE
      descriptionMeta.setAttribute('content', previousDescription || DEFAULT_DESCRIPTION)
    }
  }, [description, title])
}

export { DEFAULT_DESCRIPTION, DEFAULT_TITLE }
