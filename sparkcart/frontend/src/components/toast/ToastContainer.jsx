import Toast from './Toast'

function ToastContainer({ dismiss, toasts }) {
  return (
    <aside
      className="toast-container"
      aria-label="Notifications"
      aria-live="polite"
      aria-relevant="additions"
    >
      {toasts.map((toast) => (
        <Toast key={toast.id} toast={toast} onDismiss={dismiss} />
      ))}
    </aside>
  )
}

export default ToastContainer
