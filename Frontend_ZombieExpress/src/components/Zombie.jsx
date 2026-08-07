import { useFrame } from '@react-three/fiber'
import { useRef, useEffect } from 'react'
import { RigidBody, CapsuleCollider } from '@react-three/rapier'
import * as THREE from 'three'
import { usePelaajanPaikka } from '../hooks/usePelaajanPaikka'

// Yksi zombie: liikkuu hitaasti kohti pelaajaa.
// aloitusZ määrää mihin kohtaan käytävää zombie ilmestyy.
// id yksilöi zombien, jotta oikea voidaan poistaa osuttaessa.
export function Zombie({ id, aloitusZ = -15, onRef }) {
  const body = useRef()
  const mesh = useRef()
  const pelaajanPaikka = usePelaajanPaikka()
  const suunta = useRef(new THREE.Vector3())

  // Ilmoitetaan meshi ampujalle ja tallennetaan id sen userDataan.
  useEffect(() => {
    if (mesh.current) {
      mesh.current.userData.zombieId = id
      if (onRef) onRef(id, mesh.current)
    }
    return () => {
      if (onRef) onRef(id, null)
    }
  }, [id, onRef])

  useFrame((state, delta) => {
    if (!body.current) return

    const paikka = body.current.translation()
    const zombie = new THREE.Vector3(paikka.x, paikka.y, paikka.z)

    // Suunta pelaajaa kohti vaakatasossa.
    suunta.current.set(
      pelaajanPaikka.x - zombie.x,
      0,
      pelaajanPaikka.z - zombie.z
    )
    suunta.current.normalize()

    // Liikutetaan zombieta pelaajaa kohti.
    const nopeus = 1.5 * delta
    body.current.setNextKinematicTranslation({
      x: paikka.x + suunta.current.x * nopeus,
      y: paikka.y,
      z: paikka.z + suunta.current.z * nopeus,
    })
  })

  return (
    <RigidBody
      ref={body}
      type="kinematicPosition"
      colliders={false}
      position={[0, 1, aloitusZ]}
      enabledRotations={[false, false, false]}
    >
      <CapsuleCollider args={[0.6, 0.4]} />
      {/* Zombien vartalo, toistaiseksi vihertävä laatikko. */}
      <mesh ref={mesh}>
        <boxGeometry args={[0.6, 1.6, 0.6]} />
        <meshStandardMaterial color="#4a5d3a" />
      </mesh>
    </RigidBody>
  )
}