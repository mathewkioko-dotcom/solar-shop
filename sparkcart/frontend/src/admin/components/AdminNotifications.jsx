/* eslint-disable react-refresh/only-export-components */
import { createContext, useCallback, useContext, useMemo, useState } from 'react'

const NotificationContext = createContext(null)

export function AdminNotificationProvider({ children }) {
  const [items, setItems] = useState([])
  const dismiss = useCallback((id) => setItems((current) => current.filter((item) => item.id !== id)), [])
  const notify = useCallback((message, type = 'success') => {
    const id = `${Date.now()}-${Math.random()}`
    setItems((current) => [...current, { id, message, type }])
    window.setTimeout(() => dismiss(id), 5000)
  }, [dismiss])
  const value = useMemo(() => ({ notify }), [notify])
  return <NotificationContext.Provider value={value}>{children}<aside className="admin-toasts" aria-live="polite">{items.map((item) => <div className={`admin-toast admin-toast--${item.type}`} key={item.id}><span>{item.message}</span><button type="button" aria-label="Dismiss notification" onClick={() => dismiss(item.id)}>×</button></div>)}</aside></NotificationContext.Provider>
}

export const useAdminNotifications = () => useContext(NotificationContext)
