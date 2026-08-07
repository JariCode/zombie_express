import { useFrame } from '@react-three/fiber'
import { useRef, useEffect, useState, useMemo } from 'react'
import { RigidBody, CapsuleCollider } from '@react-three/rapier'
import { useGLTF, useAnimations, Html } from '@react-three/drei'
import { SkeletonUtils } from 'three-stdlib'
import * as THREE from 'three'
import { usePelaajanPaikka } from '../hooks/usePelaajanPaikka'
import { useVahinko } from '../hooks/usePelaajanVahinko'

// Yksi zombie: liikkuu hitaasti kohti pelaajaa.
// aloitusZ määrää mihin kohtaan käytävää zombie ilmestyy.
// id yksilöi zombien, jotta oikea voidaan poistaa osuttaessa.
// hp on jäljellä olevat kestopisteet, maxHp niiden alkumäärä.
// malli on polku tämän zombien 3D-malliin, scale sen koko.
export function Zombie({ id, aloitusZ = -15, hp, maxHp, onRef, peliOhi, malli, scale = 0.8 }) {
  const body = useRef()
  const malliRyhma = useRef()
  const pelaajanPaikka = usePelaajanPaikka()
  const otaVahinkoa = useVahinko()
  const suunta = useRef(new THREE.Vector3())
  const puremaAjastin = useRef(0)

  // Ladataan malli ja animaatiot.
  const { scene, animations } = useGLTF(malli)

  // Kloonataan malli, jotta jokaisella zombiella on oma kopio.
  // Ilman tätä samaa mallia käyttävät zombit näkyisivät haamuina.
  const klooni = useMemo(() => SkeletonUtils.clone(scene), [scene])

  const { actions, names } = useAnimations(animations, malliRyhma)

  // Osumavälähdys.
  const [osui, setOsui] = useState(false)
  const ekaRender = useRef(true)

  // Käynnistetään ensimmäinen animaatio.
  useEffect(() => {
    if (names.length > 0 && actions[names[0]]) {
      actions[names[0]].reset().play()
    }
  }, [actions, names])

  // Ilmoitetaan malli ampujalle osumantunnistusta varten.
  useEffect(() => {
    if (malliRyhma.current) {
      malliRyhma.current.traverse((obj) => {
        if (obj.isMesh) obj.userData.zombieId = id
      })
      if (onRef) onRef(id, malliRyhma.current)
    }
    return () => {
      if (onRef) onRef(id, null)
    }
  }, [id, onRef, klooni])

  // Punainen välähdys osumasta.
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
    if (peliOhi) return

    const paikka = body.current.translation()
    const zombie = new THREE.Vector3(paikka.x, paikka.y, paikka.z)

    // Suunta pelaajaa kohti vaakatasossa.
    suunta.current.set(
      pelaajanPaikka.x - zombie.x,
      0,
      pelaajanPaikka.z - zombie.z
    )
    const etaisyys = suunta.current.length()
    suunta.current.normalize()

    // Käännetään malli katsomaan pelaajaa kohti.
    if (malliRyhma.current) {
      const kulma = Math.atan2(suunta.current.x, suunta.current.z)
      malliRyhma.current.rotation.y = kulma
    }

    // Jos lähellä, puree kerran sekunnissa. Muuten liikkuu kohti.
    puremaAjastin.current -= delta
    if (etaisyys < 1.5) {
      if (puremaAjastin.current <= 0) {
        otaVahinkoa(10)
        puremaAjastin.current = 1
      }
    } else {
      const nopeus = 1.5 * delta
      body.current.setNextKinematicTranslation({
        x: paikka.x + suunta.current.x * nopeus,
        y: paikka.y,
        z: paikka.z + suunta.current.z * nopeus,
      })
    }
  })

  const hpProsentti = Math.max(0, (hp / maxHp) * 100)

  return (
    <RigidBody
      ref={body}
      type="kinematicPosition"
      colliders={false}
      position={[0, 1, aloitusZ]}
      enabledRotations={[false, false, false]}
    >
      <CapsuleCollider args={[0.6, 0.4]} />

      {/* Kloonattu zombie-malli. */}
      <group ref={malliRyhma} position={[0, -1, 0]} scale={scale}>
        <primitive object={klooni} />
      </group>

      {/* HP-palkki pään yläpuolella. */}
      <Html position={[0, 1.3, 0]} center distanceFactor={8}>
        <div className="zombie-hp">
          <div className="zombie-hp-fill" style={{ width: `${hpProsentti}%` }} />
        </div>
      </Html>
    </RigidBody>
  )
}