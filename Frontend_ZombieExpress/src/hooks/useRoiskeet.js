import { useState, useCallback, useRef } from 'react'

// Hallitsee osumakohtiin ilmestyviä veriroiskeita.
export function useRoiskeet() {
  const [roiskeet, setRoiskeet] = useState([])
  const seuraavaId = useRef(0)

  // Lisää roiske annettuun kohtaan. Poistuu itsestään hetken kuluttua.
  const lisaaRoiske = useCallback((x, y, z) => {
    const id = seuraavaId.current++
    setRoiskeet((vanha) => [...vanha, { id, x, y, z }])
    // Poistetaan roiske 600ms kuluttua (partikkelit ehtivät häipyä).
    setTimeout(() => {
      setRoiskeet((vanha) => vanha.filter((r) => r.id !== id))
    }, 600)
  }, [])

  return { roiskeet, lisaaRoiske }
}