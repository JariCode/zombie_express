import { useEffect, useState } from 'react'
import './BloodDamageOverlay.css'

// Koko ruudun veriefekti, joka käynnistyy kun pelaaja saa vahinkoa.
export function BloodDamageOverlay({ trigger }) {
  const [nayta, setNayta] = useState(false)

  useEffect(() => {
    if (trigger === 0) return

    setNayta(false)

    const kaynnistys = requestAnimationFrame(() => {
      setNayta(true)
    })

    const ajastin = setTimeout(() => {
      setNayta(false)
    }, 500)

    return () => {
      cancelAnimationFrame(kaynnistys)
      clearTimeout(ajastin)
    }
  }, [trigger])

  if (!nayta) return null

  return (
    <div
      key={trigger}
      className="blood-damage-overlay"
    />
  )
}