import { useRef, useEffect } from 'react'

// Seuraa mitkä WASD-näppäimet ovat pohjassa. Palauttaa ref-olion.
export function useNappaimet() {
  const napit = useRef({ w: false, a: false, s: false, d: false })

  useEffect(() => {
    const alas = (e) => {
      const k = e.key.toLowerCase()
      if (k in napit.current) napit.current[k] = true
    }
    const ylos = (e) => {
      const k = e.key.toLowerCase()
      if (k in napit.current) napit.current[k] = false
    }
    window.addEventListener('keydown', alas)
    window.addEventListener('keyup', ylos)
    return () => {
      window.removeEventListener('keydown', alas)
      window.removeEventListener('keyup', ylos)
    }
  }, [])

  return napit
}