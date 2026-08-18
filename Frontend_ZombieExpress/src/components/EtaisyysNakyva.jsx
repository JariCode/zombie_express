import { useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import { usePelaajanPaikka } from '../hooks/usePelaajanPaikka'

// Piilottaa lapsensa kun pelaaja on kaukana, mutta pitää ne muistissa.
// Käyttää ryhmän visible-lippua, ei ehdollista renderöintiä: näin mesh-data
// säilyy GPU:lla eikä sitä luoda uudelleen vaunurajoilla (ei nykäyksiä).
// Piilotettua ryhmää ei piirretä, joten kaukaiset vaunut eivät kuormita
// renderöintiä.
//
// keskiZ = kohteen z-keskikohta. raja 50 on juuri yli vaunuvälin (45.5), joten
// näkyvissä on oma vaunu ja sen välittömät naapurit (joihin näkee avoimesta
// ovesta), mutta ei kauempia. Tiukempi raja vilkuttaisi naapuria oviaukossa.
export function EtaisyysNakyva({ keskiZ, raja = 50, children }) {
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
