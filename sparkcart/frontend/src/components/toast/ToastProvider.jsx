import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import ToastContext from '../../context/ToastContext'
import '../../styles/toast.css'
import ToastContainer from './ToastContainer'

const DEFAULT_DURATION = 5000
const EXIT_DURATION = 240
const VALID_TYPES = new Set(['success', 'error', 'warning', 'info'])

const normalizeDuration = (duration) => (
  Number.isFinite(Number(duration)) && Number(duration) > 0
    ? Number(duration)
    : DEFAULT_DURATION
)

function ToastProvider({ children }) {
  const [toasts, setToasts] = useState([])
  const nextId = useRef(0)
  const removalTimers = useRef(new Map())

  useEffect(() => () => {
    removalTimers.current.forEach((timer) => window.clearTimeout(timer))
    removalTimers.current.clear()
  }, [])

  const dismiss = useCallback((id) => {
    setToasts((current) => current.map((toast) => (
      toast.id === id ? { ...toast, isExiting: true } : toast
    )))

    if (removalTimers.current.has(id)) return

    const timer = window.setTimeout(() => {
      setToasts((current) => current.filter((toast) => toast.id !== id))
      removalTimers.current.delete(id)
    }, EXIT_DURATION)

    removalTimers.current.set(id, timer)
  }, [])

  const dismissAll = useCallback(() => {
    setToasts((current) => {
      current.forEach(({ id }) => {
        if (removalTimers.current.has(id)) return

        const timer = window.setTimeout(() => {
          setToasts((items) => items.filter((toast) => toast.id !== id))
          removalTimers.current.delete(id)
        }, EXIT_DURATION)
        removalTimers.current.set(id, timer)
      })

      return current.map((toast) => ({ ...toast, isExiting: true }))
    })
  }, [])

  const showToast = useCallback((options = {}) => {
    const type = VALID_TYPES.has(options.type) ? options.type : 'info'
    const id = `toast-${Date.now()}-${nextId.current += 1}`
    const title = String(options.title || `${type[0].toUpperCase()}${type.slice(1)}`)
    const message = options.message == null ? '' : String(options.message)

    setToasts((current) => [{
      id,
      type,
      title,
      message,
      duration: normalizeDuration(options.duration),
      isExiting: false,
    }, ...current])

    return id
  }, [])

  const value = useMemo(() => ({
    showToast,
    showSuccess: (title, message, duration) => showToast({ type: 'success', title, message, duration }),
    showError: (title, message, duration) => showToast({ type: 'error', title, message, duration }),
    showWarning: (title, message, duration) => showToast({ type: 'warning', title, message, duration }),
    showInfo: (title, message, duration) => showToast({ type: 'info', title, message, duration }),
    dismiss,
    dismissAll,
  }), [dismiss, dismissAll, showToast])

  return (
    <ToastContext.Provider value={value}>
      {children}
      <ToastContainer toasts={toasts} dismiss={dismiss} />
    </ToastContext.Provider>
  )
}

export default ToastProvider
