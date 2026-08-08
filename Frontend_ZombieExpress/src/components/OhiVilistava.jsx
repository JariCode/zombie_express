import { useFrame } from '@react-three/fiber'
import { useRef, useMemo } from 'react'

// Ohi vilistävä öinen maisema: puita ja pylväitä jotka kiitävät ikkunan ohi.
// Kiertävät takaisin alkuun päästyään päähän, joten virta on jatkuva.
// puoli = -1 vasen, +1 oikea. nopeus = liikkeen vauhti.
export function OhiVilistava({ puoli = -1, nopeus = 20 }) {
  // Kuinka pitkälle maisema ulottuu junan suuntaisesti.
  const alku = -100
  const loppu = 30
  const pituus = loppu - alku

  // Luodaan kohteet kerran: puita ja pylväitä satunnaisilla mitoilla.
  const kohteet = useMemo(() => {
    const lista = []
    const maara = 40
    for (let i = 0; i < maara; i++) {
      const puu = Math.random() > 0.35
      const etaisyys = 5 + Math.random() * 14
      lista.push({
        z: alku + Math.random() * pituus,
        etaisyys,
        puu,
        korkeus: puu ? 4 + Math.random() * 4 : 3 + Math.random() * 3,
        latvusKoko: 1.2 + Math.random() * 1.3,
        runkoLeveys: 0.2 + Math.random() * 0.2,
        // Kauempana olevat vaaleampia (utuisia), lähellä tummempia.
        vari: etaisyys > 12 ? '#111820' : '#0a0f14',
        kallistus: (Math.random() - 0.5) * 0.15,
      })
    }
    return lista
  }, [])

  const refit = useRef([])

  useFrame((state, delta) => {
    for (let i = 0; i < kohteet.length; i++) {
      const ref = refit.current[i]
      if (!ref) continue
      ref.position.z += nopeus * delta
      if (ref.position.z > loppu) {
        ref.position.z = alku
      }
    }
  })

  return (
    <group>
      {/* Tumma maanpinta joka häipyy horisonttiin. */}
      <mesh position={[puoli * 14, -1, -35]} rotation={[-Math.PI / 2, 0, 0]}>
        <planeGeometry args={[30, 140]} />
        <meshBasicMaterial color="#070b09" />
      </mesh>

      {/* Kaukainen sumuseinä horisontissa, häivyttää maiseman reunan. */}
      <mesh position={[puoli * 20, 3, -50]}>
        <planeGeometry args={[60, 20]} />
        <meshBasicMaterial color="#0a0e14" transparent opacity={0.6} />
      </mesh>

      {kohteet.map((k, i) => (
        <group
          key={i}
          ref={(el) => (refit.current[i] = el)}
          position={[puoli * k.etaisyys, -1, k.z]}
          rotation={[0, 0, k.kallistus]}
        >
          {k.puu ? (
            <>
              {/* Puun runko */}
              <mesh position={[0, k.korkeus * 0.4, 0]}>
                <cylinderGeometry args={[k.runkoLeveys * 0.7, k.runkoLeveys, k.korkeus * 0.8, 6]} />
                <meshBasicMaterial color={k.vari} />
              </mesh>
              {/* Latvus, kartiomainen havupuu */}
              <mesh position={[0, k.korkeus * 0.85, 0]}>
                <coneGeometry args={[k.latvusKoko, k.korkeus * 0.9, 7]} />
                <meshBasicMaterial color={k.vari} />
              </mesh>
              {/* Toinen latvuskerros alempana, tuuheus */}
              <mesh position={[0, k.korkeus * 0.6, 0]}>
                <coneGeometry args={[k.latvusKoko * 1.2, k.korkeus * 0.6, 7]} />
                <meshBasicMaterial color={k.vari} />
              </mesh>
            </>
          ) : (
            <>
              {/* Pylväs / lyhtypylväs */}
              <mesh position={[0, k.korkeus / 2, 0]}>
                <cylinderGeometry args={[0.12, 0.15, k.korkeus, 6]} />
                <meshBasicMaterial color={k.vari} />
              </mesh>
              {/* Poikkipuu ylhäällä */}
              <mesh position={[puoli * 0.5, k.korkeus - 0.3, 0]}>
                <boxGeometry args={[1, 0.12, 0.12]} />
                <meshBasicMaterial color={k.vari} />
              </mesh>
            </>
          )}
        </group>
      ))}
    </group>
  )
}