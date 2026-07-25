import { memo, useState } from 'react'
import { Link } from 'react-router-dom'
import trashIcon from '../../assets/icons/actions/trash-2.svg'
import shoppingBagIcon from '../../assets/icons/ecommerce/shopping-bag.svg'
import { useCart } from '../../hooks/useCart'
import { getCartQuantityLimit } from '../../services/cartStorage'
import SvgIcon from '../ui/SvgIcon'

const formatPrice = (price) => (
  `KSh ${new Intl.NumberFormat('en-KE', {
    maximumFractionDigits: 0,
  }).format(price)}`
)

function CartItem({ item }) {
  const { removeItem, setQuantity } = useCart()
  const [imageFailed, setImageFailed] = useState(false)
  const quantityLimit = getCartQuantityLimit(item.stock)
  const productPath = `/products/${encodeURIComponent(item.slug)}`

  return (
    <li className="cart-page__item">
      <div className="cart-page__item-image">
        {item.imageUrl && !imageFailed ? (
          <Link to={productPath} aria-label={`View ${item.name}`}>
            <img
              src={item.imageUrl}
              alt={`${item.name} product`}
              loading="lazy"
              onError={() => setImageFailed(true)}
            />
          </Link>
        ) : (
          <div className="cart-page__image-placeholder" role="img" aria-label={`${item.name} image unavailable`}>
            <SvgIcon src={shoppingBagIcon} size={28} />
            <span>Image unavailable</span>
          </div>
        )}
      </div>

      <div className="cart-page__item-details">
        {item.categoryName && <p>{item.categoryName}</p>}
        <h2><Link to={productPath}>{item.name}</Link></h2>
        <span className="cart-page__unit-price">{formatPrice(item.price)} each</span>
      </div>

      <div className="cart-page__quantity" aria-label={`Quantity for ${item.name}`}>
        <button
          type="button"
          aria-label={`Decrease ${item.name} quantity`}
          disabled={item.quantity <= 1}
          onClick={() => setQuantity(item.id, item.quantity - 1)}
        >
          −
        </button>
        <output aria-live="polite" aria-label={`${item.name} quantity: ${item.quantity}`}>
          {item.quantity}
        </output>
        <button
          type="button"
          aria-label={`Increase ${item.name} quantity`}
          disabled={item.quantity >= quantityLimit}
          onClick={() => setQuantity(item.id, item.quantity + 1)}
        >
          +
        </button>
      </div>

      <div className="cart-page__line-total">
        <span>Line total</span>
        <strong>{formatPrice(item.price * item.quantity)}</strong>
      </div>

      <button
        className="cart-page__remove"
        type="button"
        aria-label={`Remove ${item.name} from cart`}
        onClick={() => removeItem(item.id)}
      >
        <SvgIcon src={trashIcon} size={19} />
      </button>
    </li>
  )
}

export default memo(CartItem)

