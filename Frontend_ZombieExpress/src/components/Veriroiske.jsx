import { useFrame } from '@react-three/fiber'
import { useRef, useMemo } from 'react'
import * as THREE from 'three'

// Lyhytikäinen veriroiske osumakohdassa: partikkelit sinkoavat ulos ja häipyvät.
// Näkyy zombien mallin läpi (depthTest false), jottei skinned mesh peitä sitä.
export function Veriroiske({ x, y, z }) {
  const ryhma = useRef()
  const ika = useRef(0)

  // Luodaan partikkeleille satunnaiset lentosuunnat kerran.
  const palaset = useMemo(() => {
    const lista = []
    for (let i = 0; i < 12; i++) {
      lista.push({
        suunta: new THREE.Vector3(
          (Math.random() - 0.5) * 2,
          (Math.random() - 0.5) * 2,
          (Math.random() - 0.5) * 2
        ).normalize(),
        nopeus: 1.5 + Math.random() * 2.5,
      })
    }
    return lista
  }, [])

  const refit = useRef([])

  useFrame((state, delta) => {
    ika.current += delta
    for (let i = 0; i < palaset.length; i++) {
      const ref = refit.current[i]
      if (!ref) continue
      const p = palaset[i]
      // Partikkeli lentää ulospäin ja hidastuu, painovoima vetää alas.
      ref.position.x += p.suunta.x * p.nopeus * delta
      ref.position.y += (p.suunta.y * p.nopeus - ika.current * 3) * delta
      ref.position.z += p.suunta.z * p.nopeus * delta
      // Kutistuu ajan myötä (elää noin 0.6 s).
      const koko = Math.max(0, 1 - ika.current / 0.6)
      ref.scale.setScalar(koko)
    }
  })

  return (
    <group ref={ryhma} position={[x, y, z]}>
      {palaset.map((_, i) => (
        <mesh key={i} ref={(el) => (refit.current[i] = el)}>
          <sphereGeometry args={[0.09, 6, 6]} />
          <meshBasicMaterial color="#cc0000" depthTest={false} transparent />
        </mesh>
      ))}
    </group>
  )
}
