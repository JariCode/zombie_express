import { useFrame } from '@react-three/fiber'
import { useRef, useEffect, useState, useMemo } from 'react'
import { RigidBody, CapsuleCollider } from '@react-three/rapier'
import { useGLTF, useAnimations, Billboard } from '@react-three/drei'
import { SkeletonUtils } from 'three-stdlib'
import * as THREE from 'three'
import { usePelaajanPaikka } from '../hooks/usePelaajanPaikka'
import { useVahinko } from '../hooks/usePelaajanVahinko'

// Yksi zombie: liikkuu hitaasti kohti pelaajaa.
// aloitusZ määrää mihin kohtaan käytävää zombie ilmestyy.
// id yksilöi zombien. hp/maxHp kestopisteet, malli/scale ulkonäkö.
// kuoleva = true kun HP loppui; zombie kaatuu kyljelleen ja jää ruumiiksi.
// lisaaVeri kutsutaan kun ruumis on kaatunut, jättää verilätäkön.
export function Zombie({ id, aloitusZ = -15, hp, maxHp, onRef, peliOhi, malli, scale = 0.8, kuoleva, lisaaVeri }) {
  const body = useRef()
  const malliRyhma = useRef()
  const pelaajanPaikka = usePelaajanPaikka()
  const otaVahinkoa = useVahinko()
  const suunta = useRef(new THREE.Vector3())
  const puremaAjastin = useRef(0)

  // Kuoleman eteneminen 0..1.
  const kuolinAika = useRef(0)
  const veriLisatty = useRef(false)

  // Ladataan malli ja animaatiot.
  const { scene, animations } = useGLTF(malli)
  const klooni = useMemo(() => SkeletonUtils.clone(scene), [scene])
  const { actions, names } = useAnimations(animations, malliRyhma)

  // Osumavälähdys.
  const [osui, setOsui] = useState(false)
  const ekaRender = useRef(true)

 // Varmistetaan, että malli piilotetaan ensimmäisen framen ajaksi ennen fysiikan asettumista
  const [valmis, setValmis] = useState(false)
  useEffect(() => {
    const ajastin = setTimeout(() => setValmis(true), 5) // Muuta numeroa halutessasi (esim. 10 tai 15 millisekuntia)
    return () => clearTimeout(ajastin)
  }, [])

  // Käynnistetään ensimmäinen animaatio (kävely/idle).
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

  // Kun kuolema alkaa, jäädytetään animaatio paikalleen ja toistetaan kuolinääni.
  useEffect(() => {
    if (kuoleva) {
      Object.values(actions).forEach((a) => {
        if (a) a.paused = true
      })

      const kuolinAani = new Audio('/audio/sfx/death.mp3')
      kuolinAani.volume = 1
      kuolinAani.play().catch(() => {})
    }
  }, [kuoleva, actions])

  // Murinaa loopilla aina kun zombie on elossa.
  useEffect(() => {
    if (kuoleva) return
    const murinaAani = new Audio('/audio/sfx/matalaamurinaa.mp3')
    murinaAani.loop = true
    murinaAani.volume = 0.4
    murinaAani.play().catch(() => {})
    return () => {
      murinaAani.pause()
      murinaAani.currentTime = 0
    }
  }, [kuoleva])

  useFrame((state, delta) => {
    if (!body.current || !malliRyhma.current) return

    // KUOLEMA: kaatuu kyljelleen lattialle ja jää ruumiiksi.
    if (kuoleva) {
      kuolinAika.current += delta

      // Kesto noin 1 sekunti.
      const t = Math.min(1, kuolinAika.current / 1)

      // Kaatuu satunnaisesti joko vasemmalle tai oikealle
      // ja laskeutuu lattian pinnalle.
      const kaatumisSuunta = id % 2 === 0 ? 1 : -1
      malliRyhma.current.rotation.z = kaatumisSuunta * t * (Math.PI / 2)
      malliRyhma.current.position.y = -1 + t * 0.7

      // Kun kaatuminen valmis, lisätään verilätäkkö kerran.
      if (t >= 1 && !veriLisatty.current) {
        veriLisatty.current = true
        const p = body.current.translation()
        if (lisaaVeri) lisaaVeri(id, { x: p.x, z: p.z })
      }
      return
    }

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
    const kulma = Math.atan2(suunta.current.x, suunta.current.z)
    malliRyhma.current.rotation.y = kulma

    // Jos lähellä, puree kerran sekunnissa. Muuten liikkuu kohti.
    puremaAjastin.current -= delta
    if (etaisyys < 1.5) {
      if (puremaAjastin.current <= 0) {
        otaVahinkoa(10)
        
        // Soitetaan vahinkoääni tässä
        const hurtAani = new Audio('/audio/sfx/hurt.mp3')
        hurtAani.volume = 1
        hurtAani.play().catch(() => {})

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
      {!kuoleva && (
        <CapsuleCollider
          args={[0.7, 0.5]} // Kasvatettu hieman korkeutta ja sädettä, jotta estää paremmin läpimenoa
          position={[0, 0, 0]}
          sensor={false}
          activeCollisionTypes={1 | 2 | 4 | 8}
        />
      )}

      {/* Kloonattu zombie-malli. visible={valmis} piilottaa T-asennon ja vilahtamisen ilman että osumat/kuolema rikkoutuvat. */}
      <group ref={malliRyhma} position={[0, -0.9, 0]} scale={scale} visible={valmis}>
        <primitive object={klooni} />
      </group>

      {/* HP-palkki pään yläpuolella 3D-objektina (Billboard kääntää kameraan).
          Ei Html-elementtiä, jottei DOM-synkronointi hidasta peliä. */}
      {!kuoleva && (
        <Billboard position={[0, 1.4, 0]}>
          {/* Tausta (tumma). */}
          <mesh>
            <planeGeometry args={[0.9, 0.12]} />
            <meshBasicMaterial color="#3a0a0a" transparent opacity={0.8} depthTest={false} />
          </mesh>
          {/* Täyttö (punainen), skaalautuu hp:n mukaan ja siirtyy vasemmalle. */}
          <mesh
            position={[-(0.9 * (1 - hpProsentti / 100)) / 2, 0, 0.001]}
            scale={[hpProsentti / 100, 1, 1]}
          >
            <planeGeometry args={[0.9, 0.12]} />
            <meshBasicMaterial color="#e63030" transparent opacity={0.9} depthTest={false} />
          </mesh>
        </Billboard>
      )}
    </RigidBody>
  )
}