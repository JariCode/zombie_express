import { useState, useCallback } from 'react'

// Hallitsee zombie-listaa: luonti ja poisto.
export function useZombit() {
  const [zombit, setZombit] = useState([
    { id: 1, aloitusZ: -15 },
    { id: 2, aloitusZ: -25 },
    { id: 3, aloitusZ: -35 },
  ])

  // Poistaa zombien listalta id:n perusteella (kun siihen osutaan).
  const poistaZombie = useCallback((id) => {
    setZombit((vanha) => vanha.filter((z) => z.id !== id))
  }, [])

  return { zombit, poistaZombie }
}