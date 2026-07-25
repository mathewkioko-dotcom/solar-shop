import { memo, useState } from 'react'

function ProductThumbnail({ image, index, isActive, onSelect }) {
  const [imageFailed, setImageFailed] = useState(false)

  return (
    <button
      className={`product-details-page__thumbnail ${isActive ? 'product-details-page__thumbnail--active' : ''}`}
      type="button"
      aria-label={`Show product image ${index + 1}`}
      aria-pressed={isActive}
      onClick={() => onSelect(index)}
    >
      {!imageFailed ? (
        <img
          src={image.url}
          alt=""
          loading="lazy"
          onError={() => setImageFailed(true)}
        />
      ) : (
        <span aria-hidden="true">No image</span>
      )}
    </button>
  )
}

export default memo(ProductThumbnail)
