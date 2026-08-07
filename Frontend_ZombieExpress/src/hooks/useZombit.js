import { useState, useCallback } from 'react'

// Kuinka monta osumaa zombie kestää.
const ALKU_HP = 3

// Hallitsee zombie-listaa: luonti, vahinko ja poisto.
export function useZombit() {
  const [zombit, setZombit] = useState([
    { id: 1, aloitusZ: -15, hp: ALKU_HP, maxHp: ALKU_HP, malli: '/models/zombie_moss.glb', scale: 0.8 },
    { id: 2, aloitusZ: -25, hp: ALKU_HP, maxHp: ALKU_HP, malli: '/models/zombie_cop.glb', scale: 0.7 },
    { id: 3, aloitusZ: -35, hp: ALKU_HP, maxHp: ALKU_HP, malli: '/models/zombie_female.glb', scale: 0.8 },
  ])

  // Vähentää zombien hp:tä osumasta. Kun hp menee nollaan, zombie poistuu.
  const vahingoitaZombie = useCallback((id) => {
    setZombit((vanha) =>
      vanha
        .map((z) => (z.id === id ? { ...z, hp: z.hp - 1 } : z))
        .filter((z) => z.hp > 0)
    )
  }, [])

  return { zombit, vahingoitaZombie }
}