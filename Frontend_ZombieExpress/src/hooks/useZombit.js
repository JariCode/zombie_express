import { useState, useCallback } from 'react'

// Kuinka monta osumaa zombie kestää.
const ALKU_HP = 3

// Hallitsee zombie-listaa: luonti, vahinko ja kuolema.
export function useZombit() {
  const [zombit, setZombit] = useState([
    { id: 1, aloitusZ: -3, hp: ALKU_HP, maxHp: ALKU_HP, malli: '/models/zombie_moss.glb', scale: 0.8, kuoleva: false },
    { id: 2, aloitusZ: -7, hp: ALKU_HP, maxHp: ALKU_HP, malli: '/models/zombie_cop.glb', scale: 0.8, kuoleva: false },
    { id: 3, aloitusZ: -11, hp: ALKU_HP, maxHp: ALKU_HP, malli: '/models/zombie_female.glb', scale: 0.8, kuoleva: false },
  ])

  // Verilätäköt jotka jäävät lattiaan kuolleiden zombien kohdalle.
  const [veret, setVeret] = useState([])

  // Vähentää zombien hp:tä. Nollassa zombie merkitään kuolevaksi.
  const vahingoitaZombie = useCallback((id) => {
    setZombit((vanha) =>
      vanha.map((z) => {
        if (z.id !== id || z.kuoleva) return z
        const uusiHp = z.hp - 1
        if (uusiHp <= 0) return { ...z, hp: 0, kuoleva: true }
        return { ...z, hp: uusiHp }
      })
    )
  }, [])

  // Lisää verilätäkön ruumiin kohdalle (kutsutaan kun zombie kaatuu maahan).
  const lisaaVeri = useCallback((id, paikka) => {
    setVeret((vanha) => {
      if (vanha.some((v) => v.id === id)) return vanha
      return [...vanha, { id, x: paikka.x, z: paikka.z }]
    })
  }, [])

  return { zombit, veret, vahingoitaZombie, lisaaVeri }
}