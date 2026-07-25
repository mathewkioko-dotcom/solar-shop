import { memo, useMemo } from 'react'

const INVALID_TEXT_VALUES = new Set([
  '',
  'undefined',
  'null',
  'nan',
  '[object object]',
])

const normalizeName = (value) => {
  if (typeof value !== 'string') return ''

  const name = value.trim()
  return INVALID_TEXT_VALUES.has(name.toLowerCase()) ? '' : name
}

const normalizeValue = (value) => {
  if (typeof value === 'string') {
    const normalizedValue = value.trim()
    return INVALID_TEXT_VALUES.has(normalizedValue.toLowerCase()) ? '' : normalizedValue
  }

  if (typeof value === 'number') {
    return Number.isFinite(value) ? String(value) : ''
  }

  if (typeof value === 'boolean') {
    return String(value)
  }

  return ''
}

const createStableRows = (entries) => {
  const occurrences = new Map()

  return entries.reduce((rows, [rawName, rawValue]) => {
    const name = normalizeName(rawName)
    const value = normalizeValue(rawValue)
    if (!name || !value) return rows

    const occurrence = (occurrences.get(name) || 0) + 1
    occurrences.set(name, occurrence)
    rows.push({
      id: `${name}-${occurrence}`,
      name,
      value,
    })

    return rows
  }, [])
}

const normalizeSpecifications = (product) => {
  const specifications = product?.specifications
  let rows = []

  if (Array.isArray(specifications)) {
    rows = createStableRows(
      specifications.map((entry) => {
        if (!entry || typeof entry !== 'object' || Array.isArray(entry)) return ['', null]

        return [
          entry.name ?? entry.label ?? entry.key ?? entry.title,
          entry.value,
        ]
      }),
    )
  } else if (specifications && typeof specifications === 'object') {
    rows = createStableRows(Object.entries(specifications))
  }

  if (rows.length > 0) return rows

  return createStableRows([
    ['Wattage', product?.wattage],
    ['Capacity', product?.capacityAh ?? product?.capacity_ah],
    ['Voltage', product?.voltage],
  ])
}

function ProductSpecifications({ product }) {
  const specifications = useMemo(
    () => normalizeSpecifications(product),
    [product],
  )

  return (
    <section
      className="product-details-page__specifications"
      aria-labelledby="technical-specifications-title"
    >
      <p className="product-details-page__eyebrow">Technical details</p>
      <h2 id="technical-specifications-title">Technical Specifications</h2>

      {specifications.length > 0 ? (
        <dl className="product-details-page__specification-list">
          {specifications.map((specification) => (
            <div className="product-details-page__specification-row" key={specification.id}>
              <dt>{specification.name}</dt>
              <dd>{specification.value}</dd>
            </div>
          ))}
        </dl>
      ) : (
        <p className="product-details-page__specification-empty">
          Technical specifications will be available soon.
        </p>
      )}
    </section>
  )
}

export default memo(ProductSpecifications)
