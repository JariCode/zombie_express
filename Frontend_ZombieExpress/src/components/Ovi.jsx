import { useFrame } from '@react-three/fiber'
import { useRef, useState, useEffect } from 'react'
import { RigidBody, CuboidCollider } from '@react-three/rapier'
import { Html } from '@react-three/drei'
import { usePelaajanPaikka } from '../hooks/usePelaajanPaikka'
import { registerOvi, unregisterOvi, openOvetNear } from '../hooks/oviRegistry'

// Vaunun päätyseinä joka täyttää koko päädyn, keskellä E:llä avautuva saranaovi.
// worldZ on oven todellinen z maailmassa (pelaajan etäisyyttä varten).
// Oviaukko: leveys 1.4 (x -0.7..0.7), korkeus 2.4 (y 0..2.4).
// Vaunu: leveys 6 (x -3..3), korkeus 3 (y 0..3).
//
// avautumissuunta:
// -1 = etuovi, aukeaa vaunun sisälle (+z)
//  1 = takaovi, aukeaa vaunun sisälle (-z)
export function Ovi({ z, worldZ, avautumissuunta = -1 }) {
  const pelaajanPaikka = usePelaajanPaikka()
  const ovilevy = useRef()
  const [auki, setAuki] = useState(false)
  const [lahella, setLahella] = useState(false)
  const aukeama = useRef(0)
  const id = useRef(Symbol('ovi'))
  // Rekisteröidään ovi rekisteriin, jotta yksi E-painallus voi avata molemmat ovet.
  useEffect(() => {
    registerOvi(id.current, worldZ, setAuki)
    return () => unregisterOvi(id.current)
  }, [worldZ])

  // Kuunnellaan E-painallusta; jos pelaaja on lähellä, avaa kaikki lähellä olevat ovet.
  useEffect(() => {
    const nappain = (e) => {
      if (e.key.toLowerCase() === 'e' && lahella) {
        openOvetNear(worldZ)
      }
    }

    window.addEventListener('keydown', nappain)
    return () => window.removeEventListener('keydown', nappain)
  }, [lahella, worldZ])

  useFrame((state, delta) => {
    const dz = Math.abs(pelaajanPaikka.z - worldZ)
    const dx = Math.abs(pelaajanPaikka.x)

    const nytLahella = dz < 2.5 && dx < 2

    if (nytLahella !== lahella) {
      setLahella(nytLahella)
    }

    const tavoite = auki ? 1 : 0

    aukeama.current +=
      (tavoite - aukeama.current) * delta * 5

    // Ovi aukeaa aina vaunun sisälle.
    // Etuoven (+z sisälle) suunta = -1.
    // Takaoven (-z sisälle) suunta = +1.
    if (ovilevy.current) {
      ovilevy.current.rotation.y =
        aukeama.current * 1.75 * avautumissuunta
    }
  })

  return (
    <group position={[0, 0, z]}>

      {/* Vasen seinäpala: aukon vasemmalta puolelta vaunun reunaan. */}
      <RigidBody type="fixed" colliders="cuboid">
        <mesh position={[-1.85, 1.5, 0]}>
          <boxGeometry args={[2.3, 3, 0.2]} />
          <meshStandardMaterial
            color="#2a2320"
            metalness={0.3}
            roughness={0.7}
          />
        </mesh>
      </RigidBody>

      {/* Oikea seinäpala: aukon oikealta puolelta vaunun reunaan. */}
      <RigidBody type="fixed" colliders="cuboid">
        <mesh position={[1.85, 1.5, 0]}>
          <boxGeometry args={[2.3, 3, 0.2]} />
          <meshStandardMaterial
            color="#2a2320"
            metalness={0.3}
            roughness={0.7}
          />
        </mesh>
      </RigidBody>

      {/* Yläpala oviaukon päällä. */}
      <RigidBody type="fixed" colliders="cuboid">
        <mesh position={[0, 2.7, 0]}>
          <boxGeometry args={[1.4, 0.6, 0.2]} />
          <meshStandardMaterial
            color="#2a2320"
            metalness={0.3}
            roughness={0.7}
          />
        </mesh>
      </RigidBody>

      {/* Saranat vasemmassa reunassa. */}
      {[0.4, 1.2, 2.0].map((sy) => (
        <mesh key={sy} position={[-0.7, sy, 0.06]}>
          <cylinderGeometry args={[0.04, 0.04, 0.18, 10]} />
          <meshStandardMaterial
            color="#4a4a52"
            metalness={0.8}
            roughness={0.3}
          />
        </mesh>
      ))}

      {/* Oven collider: eksplisiittinen kuutiocollider, olemassa vain kun ovi on kiinni. */}
      {!auki && (
        <CuboidCollider args={[1.4 / 2, 2.4 / 2, 0.1 / 2]} position={[0, 1.2, 0]} type="fixed" />
      )}

      {/* Visuaalinen saranaovi.
          Sarana on vasemmassa reunassa.
          Oven avautumissuunta määräytyy avautumissuunta-propilla. */}
      <group
        ref={ovilevy}
        position={[-0.7, 1.2, 0]}
      >
        <group position={[0.7, 0, 0]}>

          {/* Oven runko */}
          <mesh>
            <boxGeometry args={[1.4, 2.4, 0.1]} />
            <meshStandardMaterial
              color="#3a3a45"
              metalness={0.6}
              roughness={0.4}
            />
          </mesh>

          {/* --- ETUPUOLEN yksityiskohdat (+z) --- */}

          {/* Ikkuna */}
          <mesh position={[0, 0.55, 0.02]}>
            <boxGeometry args={[0.9, 0.9, 0.08]} />
            <meshStandardMaterial
              color="#0a0a14"
              transparent
              opacity={0.5}
              roughness={0.1}
            />
          </mesh>

          <mesh position={[0, 0.55, 0.04]}>
            <boxGeometry args={[1.0, 1.0, 0.04]} />
            <meshStandardMaterial
              color="#26262e"
              metalness={0.5}
              roughness={0.5}
            />
          </mesh>

          <mesh position={[0, 0.55, 0.05]}>
            <boxGeometry args={[0.88, 0.88, 0.02]} />
            <meshStandardMaterial
              color="#0a0e18"
              transparent
              opacity={0.45}
              roughness={0.1}
            />
          </mesh>

          {/* Kahva */}
          <mesh position={[0.5, -0.1, 0.08]}>
            <cylinderGeometry args={[0.03, 0.03, 0.5, 8]} />
            <meshStandardMaterial
              color="#6a6a72"
              metalness={0.8}
              roughness={0.3}
            />
          </mesh>

          <mesh
            position={[0.5, 0.13, 0.05]}
            rotation={[0, 0, Math.PI / 2]}
          >
            <cylinderGeometry args={[0.02, 0.02, 0.08, 8]} />
            <meshStandardMaterial
              color="#6a6a72"
              metalness={0.8}
              roughness={0.3}
            />
          </mesh>

          <mesh
            position={[0.5, -0.33, 0.05]}
            rotation={[0, 0, Math.PI / 2]}
          >
            <cylinderGeometry args={[0.02, 0.02, 0.08, 8]} />
            <meshStandardMaterial
              color="#6a6a72"
              metalness={0.8}
              roughness={0.3}
            />
          </mesh>

          {/* Alareunan lista */}
          <mesh position={[0, -1.05, 0.03]}>
            <boxGeometry args={[1.4, 0.15, 0.06]} />
            <meshStandardMaterial
              color="#26262e"
              metalness={0.5}
              roughness={0.5}
            />
          </mesh>

          {/* --- TAKAPUOLEN yksityiskohdat (-z) --- */}

          {/* Ikkuna */}
          <mesh position={[0, 0.55, -0.02]}>
            <boxGeometry args={[0.9, 0.9, 0.08]} />
            <meshStandardMaterial
              color="#0a0a14"
              transparent
              opacity={0.5}
              roughness={0.1}
            />
          </mesh>

          <mesh position={[0, 0.55, -0.04]}>
            <boxGeometry args={[1.0, 1.0, 0.04]} />
            <meshStandardMaterial
              color="#26262e"
              metalness={0.5}
              roughness={0.5}
            />
          </mesh>

          <mesh position={[0, 0.55, -0.05]}>
            <boxGeometry args={[0.88, 0.88, 0.02]} />
            <meshStandardMaterial
              color="#0a0e18"
              transparent
              opacity={0.45}
              roughness={0.1}
            />
          </mesh>

          {/* Kahva */}
          <mesh position={[0.5, -0.1, -0.08]}>
            <cylinderGeometry args={[0.03, 0.03, 0.5, 8]} />
            <meshStandardMaterial
              color="#6a6a72"
              metalness={0.8}
              roughness={0.3}
            />
          </mesh>

          <mesh
            position={[0.5, 0.13, -0.05]}
            rotation={[0, 0, Math.PI / 2]}
          >
            <cylinderGeometry args={[0.02, 0.02, 0.08, 8]} />
            <meshStandardMaterial
              color="#6a6a72"
              metalness={0.8}
              roughness={0.3}
            />
          </mesh>

          <mesh
            position={[0.5, -0.33, -0.05]}
            rotation={[0, 0, Math.PI / 2]}
          >
            <cylinderGeometry args={[0.02, 0.02, 0.08, 8]} />
            <meshStandardMaterial
              color="#6a6a72"
              metalness={0.8}
              roughness={0.3}
            />
          </mesh>

          {/* Alareunan lista */}
          <mesh position={[0, -1.05, -0.03]}>
            <boxGeometry args={[1.4, 0.15, 0.06]} />
            <meshStandardMaterial
              color="#26262e"
              metalness={0.5}
              roughness={0.5}
            />
          </mesh>

        </group>
      </group>

      {/* Kehote kun lähellä. */}
      {lahella && !auki && (
        <Html position={[0, 1.2, 0.3]} center>
          <div className="ovi-kehote">
            Paina E
          </div>
        </Html>
      )}

    </group>
  )
}