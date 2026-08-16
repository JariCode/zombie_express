import { useState, useCallback, useEffect, useRef } from 'react'

// Kuinka monta osumaa zombie kestää.
const ALKU_HP = 3

// Kaikki zombit jotka peliin ilmestyvät. Ne lisätään listaan porrastetusti,
// jotta kolme eri mallia ei kääntyisi GPU:lle samalla framella (alkupiikki) ja
// jotta ampumisen kuormitus (ääni, suuliekki, osumantunnistus) ei kasaudu heti
// pelin alkuun.
const KAIKKI_ZOMBIT = [
  { id: 1, aloitusZ: -3, hp: ALKU_HP, maxHp: ALKU_HP, malli: '/models/zombie_moss.glb', scale: 0.8, kuoleva: false },
  { id: 2, aloitusZ: -7, hp: ALKU_HP, maxHp: ALKU_HP, malli: '/models/zombie_cop.glb', scale: 0.7, kuoleva: false },
  { id: 3, aloitusZ: -11, hp: ALKU_HP, maxHp: ALKU_HP, malli: '/models/zombie_female.glb', scale: 0.8, kuoleva: false },
]

// Viive ennen ensimmäisen zombien ilmestymistä (peli ehtii latautua rauhassa).
const ALKUVIIVE = 800

// Viive zombien ilmestymisen välillä (millisekunteina). Reilu väli, jotta
// yhden zombien raskas mount (skinned mesh -klooni ja animaatiot) ehtii
// asettua ennen seuraavaa eikä piikki kasaudu.
const ILMESTYMISVIIVE = 1500

// Hallitsee zombie-listaa: luonti, vahinko ja kuolema.
export function useZombit() {
  // Aloitetaan tyhjällä listalla; zombit lisätään yksitellen viiveellä, jotta
  // kolme raskasta mallia ei kääntyisi GPU:lle samalla framella pelin alussa.
  const [zombit, setZombit] = useState([])

  // Verilätäköt jotka jäävät lattiaan kuolleiden zombien kohdalle.
  const [veret, setVeret] = useState([])

  // Seuraa mikä zombie on seuraavana vuorossa lisättäväksi.
  const seuraavaIndeksi = useRef(0)

  // Lisää zombit yksitellen viiveellä pelin alettua.
  useEffect(() => {
    let ajastin

    const lisaaSeuraava = () => {
      const i = seuraavaIndeksi.current
      if (i >= KAIKKI_ZOMBIT.length) return
      setZombit((vanha) => [...vanha, KAIKKI_ZOMBIT[i]])
      seuraavaIndeksi.current += 1
      if (seuraavaIndeksi.current < KAIKKI_ZOMBIT.length) {
        ajastin = setTimeout(lisaaSeuraava, ILMESTYMISVIIVE)
      }
    }

    // Ensimmäinen zombie tulee vasta pienen aloitusviiveen jälkeen.
    ajastin = setTimeout(lisaaSeuraava, ALKUVIIVE)

    return () => clearTimeout(ajastin)
  }, [])

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