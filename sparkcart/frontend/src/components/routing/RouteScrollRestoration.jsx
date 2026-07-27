import { useLayoutEffect } from 'react'
import { useLocation } from 'react-router-dom'

function RouteScrollRestoration() {
  const { hash, pathname } = useLocation()

  useLayoutEffect(() => {
    const root = document.documentElement
    const previousBehavior = root.style.scrollBehavior
    root.style.scrollBehavior = 'auto'

    let hashTarget = null
    if (hash) {
      try {
        hashTarget = document.getElementById(decodeURIComponent(hash.slice(1)))
      } catch {
        hashTarget = null
      }
    }

    if (hashTarget) hashTarget.scrollIntoView({ behavior: 'auto', block: 'start' })
    else window.scrollTo({ top: 0, left: 0, behavior: 'auto' })

    const restoreTimer = window.requestAnimationFrame(() => {
      root.style.scrollBehavior = previousBehavior
    })

    return () => {
      window.cancelAnimationFrame(restoreTimer)
      root.style.scrollBehavior = previousBehavior
    }
  }, [hash, pathname])

  return null
}

export default RouteScrollRestoration
