import { useCallback, useMemo, useRef, useState } from 'react'
import ProductThumbnail from './ProductThumbnail'

const SWIPE_DISTANCE = 40

function ProductGallery({ images, productName }) {
  const galleryImages = useMemo(
    () => (Array.isArray(images)
      ? images.filter((image) => (
        image
        && (typeof image.id === 'string' || typeof image.id === 'number')
        && typeof image.url === 'string'
        && image.url.trim()
      ))
      : []),
    [images],
  )
  const [activeIndex, setActiveIndex] = useState(0)
  const [mainImageLoaded, setMainImageLoaded] = useState(false)
  const [failedImageIds, setFailedImageIds] = useState(() => new Set())
  const activeIndexRef = useRef(0)
  const touchStartX = useRef(null)
  const imageCount = galleryImages.length
  const activeImage = galleryImages[activeIndex] || null
  const activeImageFailed = activeImage
    ? failedImageIds.has(String(activeImage.id))
    : false

  const selectImage = useCallback((nextIndex) => {
    if (nextIndex === activeIndexRef.current) return
    activeIndexRef.current = nextIndex
    setActiveIndex(nextIndex)
    setMainImageLoaded(false)
  }, [])

  const showPreviousImage = useCallback(() => {
    if (imageCount < 2) return
    selectImage((activeIndexRef.current - 1 + imageCount) % imageCount)
  }, [imageCount, selectImage])

  const showNextImage = useCallback(() => {
    if (imageCount < 2) return
    selectImage((activeIndexRef.current + 1) % imageCount)
  }, [imageCount, selectImage])

  const handleKeyDown = (event) => {
    if (event.key === 'ArrowLeft') {
      event.preventDefault()
      showPreviousImage()
    }

    if (event.key === 'ArrowRight') {
      event.preventDefault()
      showNextImage()
    }
  }

  const handleTouchStart = (event) => {
    touchStartX.current = event.touches[0]?.clientX ?? null
  }

  const handleTouchEnd = (event) => {
    if (touchStartX.current === null) return

    const touchEndX = event.changedTouches[0]?.clientX
    if (typeof touchEndX !== 'number') return

    const distance = touchEndX - touchStartX.current
    touchStartX.current = null

    if (Math.abs(distance) < SWIPE_DISTANCE) return
    if (distance > 0) showPreviousImage()
    else showNextImage()
  }

  const handleMainImageError = () => {
    if (!activeImage) return

    setFailedImageIds((currentIds) => {
      const nextIds = new Set(currentIds)
      nextIds.add(String(activeImage.id))
      return nextIds
    })
    setMainImageLoaded(false)
  }

  return (
    <div className="product-details-page__gallery">
      {imageCount > 0 && (
        <div className="product-details-page__thumbnails" aria-label="Product image thumbnails">
          {galleryImages.map((image, index) => (
            <ProductThumbnail
              key={image.id}
              image={image}
              index={index}
              isActive={index === activeIndex}
              onSelect={selectImage}
            />
          ))}
        </div>
      )}

      <div
        className="product-details-page__gallery-main"
        tabIndex={0}
        role="group"
        aria-label={`${productName} image gallery. Use left and right arrow keys to change images.`}
        onKeyDown={handleKeyDown}
        onTouchStart={handleTouchStart}
        onTouchEnd={handleTouchEnd}
      >
        {activeImage && !activeImageFailed ? (
          <>
            {!mainImageLoaded && <div className="product-details-page__image-skeleton" aria-hidden="true" />}
            <img
              key={activeImage.id}
              className={`product-details-page__image ${mainImageLoaded ? 'product-details-page__image--loaded' : ''}`}
              src={activeImage.url}
              alt={activeImage.alt || `${productName} product image`}
              loading="lazy"
              draggable="false"
              onLoad={() => setMainImageLoaded(true)}
              onError={handleMainImageError}
            />
          </>
        ) : (
          <div
            className="product-details-page__image-placeholder"
            role="img"
            aria-label={`${productName} image unavailable`}
          >
            <span>Image unavailable</span>
            <small>Baraka Solar Shop</small>
          </div>
        )}

        {imageCount > 1 && (
          <span className="product-details-page__image-count" aria-live="polite">
            {activeIndex + 1} / {imageCount}
          </span>
        )}
      </div>
    </div>
  )
}

export default ProductGallery
