import { useEffect, useRef } from 'react'

export function PageHeader({ eyebrow, title, description, actions }) {
  return <header className="admin-page-header"><div><span>{eyebrow}</span><h1>{title}</h1>{description && <p>{description}</p>}</div>{actions && <div className="admin-page-header__actions">{actions}</div>}</header>
}

export function StatusBadge({ active, archived = false }) {
  const label = archived ? 'Archived' : active ? 'Active' : 'Inactive'
  return <span className={`admin-badge admin-badge--${archived ? 'archived' : active ? 'active' : 'inactive'}`}>{label}</span>
}

export function StockBadge({ stock = 0, threshold = 5 }) {
  const state = Number(stock) === 0 ? 'out' : Number(stock) <= Number(threshold) ? 'low' : 'in'
  const label = state === 'out' ? 'Out of stock' : state === 'low' ? `Low · ${stock}` : `In stock · ${stock}`
  return <span className={`admin-badge admin-badge--stock-${state}`}>{label}</span>
}

export function LoadingState({ rows = 5 }) {
  return <div className="admin-loading" role="status" aria-label="Loading">{Array.from({ length: rows }, (_, index) => <span key={index} />)}</div>
}

export function EmptyState({ title, message, action }) {
  return <section className="admin-empty"><div aria-hidden="true">◇</div><h2>{title}</h2><p>{message}</p>{action}</section>
}

export function ErrorState({ message, onRetry }) {
  return <section className="admin-error" role="alert"><h2>Something went wrong</h2><p>{message}</p>{onRetry && <button type="button" className="admin-button admin-button--secondary" onClick={onRetry}>Try again</button>}</section>
}

export function Pagination({ meta, onPage }) {
  if (!meta || meta.last_page <= 1) return null
  return <nav className="admin-pagination" aria-label="Pagination"><button type="button" disabled={meta.current_page <= 1} onClick={() => onPage(meta.current_page - 1)}>Previous</button><span>Page {meta.current_page} of {meta.last_page}</span><button type="button" disabled={meta.current_page >= meta.last_page} onClick={() => onPage(meta.current_page + 1)}>Next</button></nav>
}

export function FieldError({ id, error }) {
  if (!error) return null
  const text = Array.isArray(error) ? error[0] : error
  return <span id={id} className="admin-field-error">{text}</span>
}

export function FormSection({ title, description, children }) {
  return <section className="admin-form-section"><header><h2>{title}</h2>{description && <p>{description}</p>}</header><div className="admin-form-grid">{children}</div></section>
}

export function ConfirmDialog({ open, title, message, confirmLabel = 'Confirm', destructive = false, onConfirm, onClose }) {
  const cancelRef = useRef(null)
  const dialogRef = useRef(null)
  useEffect(() => {
    if (!open) return undefined
    cancelRef.current?.focus()
    const close = (event) => {
      if (event.key === 'Escape') onClose()
      if (event.key === 'Tab') {
        const focusable = [...dialogRef.current.querySelectorAll('button:not([disabled]),a[href],input:not([disabled])')]
        const first = focusable[0]
        const last = focusable.at(-1)
        if (event.shiftKey && document.activeElement === first) { event.preventDefault(); last?.focus() }
        else if (!event.shiftKey && document.activeElement === last) { event.preventDefault(); first?.focus() }
      }
    }
    document.addEventListener('keydown', close)
    return () => document.removeEventListener('keydown', close)
  }, [open, onClose])
  if (!open) return null
  return <div className="admin-modal" role="presentation" onMouseDown={(event) => { if (event.target === event.currentTarget) onClose() }}><div ref={dialogRef} role="alertdialog" aria-modal="true" aria-labelledby="confirm-title"><h2 id="confirm-title">{title}</h2><p>{message}</p><div><button ref={cancelRef} type="button" className="admin-button admin-button--secondary" onClick={onClose}>Cancel</button><button type="button" className={`admin-button ${destructive ? 'admin-button--danger' : ''}`} onClick={onConfirm}>{confirmLabel}</button></div></div></div>
}
