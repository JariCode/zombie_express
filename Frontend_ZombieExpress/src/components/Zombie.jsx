import { useFrame } from '@react-three/fiber'
import { useRef, useEffect, useState } from 'react'
import { RigidBody, CapsuleCollider } from '@react-three/rapier'
import * as THREE from 'three'
import { usePelaajanPaikka } from '../hooks/usePelaajanPaikka'

// Yksi zombie: liikkuu hitaasti kohti pelaajaa.
// aloitusZ määrää mihin kohtaan käytävää zombie ilmestyy.
// id yksilöi zombien, jotta oikea voidaan poistaa osuttaessa.
// hp on jäljellä olevat kestopisteet.
export function Zombie({ id, aloitusZ = -15, hp, onRef }) {
  const body = useRef()
  const mesh = useRef()
  const pelaajanPaikka = usePelaajanPaikka()
  const suunta = useRef(new THREE.Vector3())

  // Osumavälähdys: kun hp pienenee, zombie hohtaa hetken punaisena.
  const [osui, setOsui] = useState(false)
  const ekaRender = useRef(true)

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

  // Kun hp muuttuu, näytetään lyhyt punainen välähdys.
  useEffect(() => {
    if (ekaRender.current) {
      ekaRender.current = false
      return
    }
    setOsui(true)
    const ajastin = setTimeout(() => setOsui(false), 120)
    return () => clearTimeout(ajastin)
  }, [hp])

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
      {/* Zombien vartalo. Hohtaa punaisena osuman hetkellä. */}
      <mesh ref={mesh}>
        <boxGeometry args={[0.6, 1.6, 0.6]} />
        <meshStandardMaterial
          color="#4a5d3a"
          emissive={osui ? '#ff0000' : '#000000'}
          emissiveIntensity={osui ? 1 : 0}
        />
      </mesh>
    </RigidBody>
  )
}