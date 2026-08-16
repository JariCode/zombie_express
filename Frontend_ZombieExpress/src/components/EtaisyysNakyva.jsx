import { useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import { usePelaajanPaikka } from '../hooks/usePelaajanPaikka'

// Piilottaa lapsensa kun pelaaja on kaukana, mutta pitää ne muistissa.
// Käyttää ryhmän visible-lippua, ei ehdollista renderöintiä: näin mesh-data
// säilyy GPU:lla eikä sitä luoda uudelleen vaunurajoilla (ei nykäyksiä).
// Piilotettua ryhmää ei piirretä, joten kaukaiset vaunut eivät kuormita
// renderöintiä.
//
// keskiZ = kohteen z-keskikohta. raja 90 = nykyinen vaunu sekä pari edellistä
// ja seuraavaa näkyvissä. Raja on tarkoituksella reilu, jotta seuraava vaunu
// ehtii tulla näkyviin jo vaunun keskivaiheilla, ei vasta oviaukossa. Näin
// näkyviin tulon piikki ei osu keskelle vaunusta toiseen kävelyä.
export function EtaisyysNakyva({ keskiZ, raja = 90, children }) {
  const pelaajanPaikka = usePelaajanPaikka()
  const ryhma = useRef()
  const tarkistus = useRef(0)

  useFrame((state, delta) => {
    // Tarkistetaan muutaman kerran sekunnissa, ei joka framessa.
    tarkistus.current -= delta
    if (tarkistus.current > 0) return
    tarkistus.current = 0.2

    if (ryhma.current) {
      const nakyva = Math.abs(pelaajanPaikka.z - keskiZ) < raja
      if (ryhma.current.visible !== nakyva) {
        ryhma.current.visible = nakyva
      }
    }
  })

  return <group ref={ryhma}>{children}</group>
}
