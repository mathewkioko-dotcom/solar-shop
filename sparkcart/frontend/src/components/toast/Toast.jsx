import { useEffect } from 'react'
import closeIcon from '../../assets/icons/actions/x.svg'
import successIcon from '../../assets/icons/status/circle-check.svg'
import errorIcon from '../../assets/icons/status/error.svg'
import warningIcon from '../../assets/icons/status/triangle-alert.svg'
import infoIcon from '../../assets/icons/status/info.svg'
import SvgIcon from '../ui/SvgIcon'

const icons = {
  success: successIcon,
  error: errorIcon,
  warning: warningIcon,
  info: infoIcon,
}

function Toast({ toast, onDismiss }) {
  const { duration, id, isExiting, message, title, type } = toast

  useEffect(() => {
    if (isExiting) return undefined

    const timer = window.setTimeout(() => onDismiss(id), duration)
    return () => window.clearTimeout(timer)
  }, [duration, id, isExiting, onDismiss])

  return (
    <article
      className={`toast-notification toast-notification--${type}${isExiting ? ' toast-notification--exiting' : ''}`}
      role={type === 'error' ? 'alert' : 'status'}
      aria-atomic="true"
    >
      <div className="toast-notification__surface">
        <span className="toast-notification__icon">
          <SvgIcon src={icons[type]} size={20} />
        </span>

        <div className="toast-notification__content">
          <strong>{title}</strong>
          {message && <p>{message}</p>}
        </div>

        <button
          className="toast-notification__close"
          type="button"
          aria-label={`Dismiss ${type} notification: ${title}`}
          onClick={() => onDismiss(id)}
        >
          <SvgIcon src={closeIcon} size={16} />
        </button>
      </div>

      <span
        className="toast-notification__progress"
        aria-hidden="true"
        style={{ '--toast-duration': `${duration}ms` }}
      />
    </article>
  )
}

export default Toast
