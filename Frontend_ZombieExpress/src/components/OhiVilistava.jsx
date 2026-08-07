import { useFrame } from '@react-three/fiber'
import { useRef, useMemo } from 'react'

// Ohi vilistävä öinen maisema: puita ja pylväitä jotka kiitävät ikkunan ohi.
// Kiertävät takaisin alkuun päästyään päähän, joten virta on jatkuva.
// puoli = -1 vasen, +1 oikea. nopeus = liikkeen vauhti.
export function OhiVilistava({ puoli = -1, nopeus = 20 }) {
  // Kuinka pitkälle maisema ulottuu junan suuntaisesti.
  const alku = -60
  const loppu = 20
  const pituus = loppu - alku

  // Luodaan siluetit kerran: satunnaiset kohdat, korkeudet ja etäisyydet.
  const siluetit = useMemo(() => {
    const lista = []
    const maara = 30
    for (let i = 0; i < maara; i++) {
      lista.push({
        z: alku + Math.random() * pituus,
        korkeus: 3 + Math.random() * 5,
        leveys: 0.4 + Math.random() * 0.7,
        etaisyys: 5 + Math.random() * 10,
        // Vaaleampi = kauempana (utuisempi), tummempi = lähempänä.
        vari: Math.random() > 0.5 ? '#0d1a12' : '#0a0f14',
      })
    }
    return lista
  }, [])

  // Refit jokaiseen siluettiin, jotta niitä voi liikuttaa.
  const refit = useRef([])

  useFrame((state, delta) => {
    for (let i = 0; i < siluetit.length; i++) {
      const ref = refit.current[i]
      if (!ref) continue

      // Liikutetaan siluettia junan suuntaisesti.
      ref.position.z += nopeus * delta

      // Kun siluetti ohittaa pään, kierrätetään takaisin alkuun.
      if (ref.position.z > loppu) {
        ref.position.z = alku
      }
    }
  })

  return (
    <group>
      {/* Tumma maanpinta horisontissa, tuo syvyyttä. */}
      <mesh position={[puoli * 12, -1, -20]} rotation={[-Math.PI / 2, 0, 0]}>
        <planeGeometry args={[24, 90]} />
        <meshBasicMaterial color="#060a08" />
      </mesh>

      {siluetit.map((s, i) => (
        <mesh
          key={i}
          ref={(el) => (refit.current[i] = el)}
          position={[puoli * s.etaisyys, s.korkeus / 2 - 1, s.z]}
        >
          {/* meshBasicMaterial näkyy ilman valoa, joten puut erottuvat aina. */}
          <boxGeometry args={[s.leveys, s.korkeus, s.leveys]} />
          <meshBasicMaterial color={s.vari} />
        </mesh>
      ))}
    </group>
  )
}