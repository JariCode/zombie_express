import { RigidBody, CuboidCollider } from '@react-three/rapier'
import { useRef, useState, useEffect } from 'react'
import { Vector3 } from 'three'

// Apuvektori world-position-laskentaan, jotta framessa ei luoda uutta oliota.
const apuVec = new Vector3()
import { useFrame } from '@react-three/fiber'
import { Html } from '@react-three/drei'
import { usePelaajanPaikka } from '../hooks/usePelaajanPaikka'

// Junavaunun WC.
// Sijoitetaan vaunun päätyoven oikealle puolelle,
// päätyoven ja ensimmäisen penkkirivin väliselle alueelle.
export function Vessa({ position = [1.8, 0, 20.5] }) {
  const pelaajanPaikka = usePelaajanPaikka()
  const [auki, setAuki] = useState(false)
  const [lahella, setLahella] = useState(false)
  const aukeama = useRef(0)
  const ovilevy = useRef()
  const id = useRef(Symbol('vessa'))
  const rootRef = useRef()
  const worldZRef = useRef(0)

  // Vessa ei rekisteröidy globaalisti — avautuu vain omasta E-painalluksesta.
  useEffect(() => {
    const nappain = (e) => {
      if (e.key.toLowerCase() === 'e' && lahella) {
        setAuki((v) => !v)
      }
    }
    window.addEventListener('keydown', nappain)
    return () => window.removeEventListener('keydown', nappain)
  }, [lahella])

  useFrame((state, delta) => {
    // Päivitetään vessa-ryhmän world-Z, jotta "lahella" lasketaan oikein.
    // Käytetään moduulitason apuvektoria, ettei joka framessa luoda uutta.
    if (rootRef.current) {
      rootRef.current.getWorldPosition(apuVec)
      worldZRef.current = apuVec.z
    }

    const dz = Math.abs(pelaajanPaikka.z - worldZRef.current)
    const dx = Math.abs(pelaajanPaikka.x)
    const nytLahella = dz < 2.5 && dx < 2
    if (nytLahella !== lahella) setLahella(nytLahella)

    const tavoite = auki ? 1 : 0
    aukeama.current += (tavoite - aukeama.current) * delta * 5
    // Oven aukeamissuunta: avautuu vaunun sisään (-1 tai +1)
    const avautumissuunta = -1
    if (ovilevy.current) {
      ovilevy.current.rotation.y = aukeama.current * 1.75 * avautumissuunta
    }
  })

  return (
    <group ref={rootRef} position={position}>

      {/* Vessan lattia */}
      <mesh position={[0, 0.12, 0]} receiveShadow>
        <boxGeometry args={[1.8, 0.04, 2.2]} />
        <meshStandardMaterial
          color="#292522"
          roughness={0.9}
        />
      </mesh>

      {/* ========================================= */}

      {/* Vasemman puolen seinä, käytävän puolella.
          Keskellä aukko vessan ovea varten. */}

      <RigidBody type="fixed" colliders="cuboid">
        <mesh position={[-0.92, 1.5, -0.9]}>
          <boxGeometry args={[0.16, 3, 0.36]} />
          <meshStandardMaterial
            color="#302a26"
            roughness={0.8}
          />
        </mesh>
      </RigidBody>
      {/* Oven oikean puolen seinä */}
    <RigidBody type="fixed" colliders="cuboid">
    <mesh position={[-0.92, 1.5, 0.77]}>
        <boxGeometry args={[0.16, 3, 0.34]} />
        <meshStandardMaterial
        color="#302a26"
        roughness={0.8}
        />
    </mesh>
    </RigidBody>

      {/* Seinän yläosa oven päällä */}
      <RigidBody type="fixed" colliders="cuboid">
        <mesh position={[-0.92, 2.72, 0]}>
          <boxGeometry args={[0.16, 0.56, 1.6]} />
          <meshStandardMaterial
            color="#302a26"
            roughness={0.8}
          />
        </mesh>
      </RigidBody>

      {/* Vessan takaseinä */}
      <RigidBody type="fixed" colliders="cuboid">
        <mesh position={[0.92, 1.5, 0]}>
          <boxGeometry args={[0.16, 3, 2.2]} />
          <meshStandardMaterial
            color="#302a26"
            roughness={0.8}
          />
        </mesh>
      </RigidBody>

      {/* Vessan toinen sivuseinä */}
      <RigidBody type="fixed" colliders="cuboid">
        <mesh position={[0, 1.5, 1.02]}>
          <boxGeometry args={[2.0, 3, 0.16]} />
          <meshStandardMaterial
            color="#302a26"
            roughness={0.8}
          />
        </mesh>
      </RigidBody>

      {/* Vessan toinen sivuseinä */}
      <RigidBody type="fixed" colliders="cuboid">
        <mesh position={[0, 1.5, -1.02]}>
          <boxGeometry args={[2.0, 3, 0.16]} />
          <meshStandardMaterial
            color="#302a26"
            roughness={0.8}
          />
        </mesh>
      </RigidBody>

        {/* ========================================= */}
  {/* VESSAN OVI                                */}
  {/* ========================================= */}

  {/* Oven sarana on oven reunassa, ei keskellä.
      Näin ovi avautuu sivulle ja oviaukko jää vapaaksi. */}

  <group
    ref={ovilevy}
    position={[-0.9, 1.35, -0.7]}
  >
    {/* Oven collider — käytetään eksplisiittistä CuboidCollideria kuten `Ovi.jsx`. */}
    {!auki && (
      <CuboidCollider args={[0.04, 1.15, 0.7]} position={[0.04, 0, 0.6]} type="fixed" />
    )}
    <group position={[0.04, 0, 0.6]}>
      <mesh>
          <boxGeometry args={[0.08, 2.3, 1.4]} />
        <meshStandardMaterial
          color="#3a3a45"
          metalness={0.6}
          roughness={0.4}
        />
      </mesh>

      {/* Oven ikkuna */}
      <mesh position={[-0.045, 0.35, 0]}>
        <boxGeometry args={[0.025, 0.55, 0.48]} />
        <meshStandardMaterial
          color="#0a0a14"
          transparent
          opacity={0.5}
          roughness={0.1}
        />
      </mesh>

      {/* Oven ikkuna / kehys */}
      <mesh position={[-0.05, 0.35, 0]}>
        <boxGeometry args={[0.03, 0.65, 0.58]} />
        <meshStandardMaterial
          color="#26262e"
          metalness={0.5}
          roughness={0.5}
        />
      </mesh>
        {/* Oven ulkopuolen pieni vetokahva */}
      <mesh position={[0.07, 0.05, 0.28]}>
        <boxGeometry args={[0.04, 0.28, 0.06]} />
        <meshStandardMaterial
          color="#6a6a72"
          metalness={0.8}
          roughness={0.3}
        />
      </mesh>

      {/* Oven sisäpuolen pieni vetokahva */}
      <mesh position={[-0.07, 0.05, 0.28]}>
        <boxGeometry args={[0.04, 0.28, 0.06]} />
        <meshStandardMaterial
          color="#6a6a72"
          metalness={0.8}
          roughness={0.3}
        />
      </mesh>
    {/* Sisäpuolen pieni WC-lukon kääntönuppi*/}
      <mesh position={[0.08, -0.15, 0.32]}>
        <cylinderGeometry args={[0.025, 0.025, 0.018, 12]} />
        <meshStandardMaterial
          color="#77777f"
          metalness={0.8}
          roughness={0.3}
        />
      </mesh>

      {/* Sisäpuolen lukon osoitin ( */}
      <mesh position={[0.095, -0.15, 0.32]}>
        <boxGeometry args={[0.012, 0.012, 0.045]} />
        <meshStandardMaterial
          color="#25252a"
          roughness={0.4}
        />
      </mesh>

      {/* Ulkopuolen pieni varattu/vapaa-ilmaisin (korvattu lopullisella puoliksi-indikaattorilla) */}
        {/* Ulkopuolen varattu/vapaa-ilmaisin: puoliksi valkoinen/puoliksi punainen, ovipinnan tasalla */}
        <group position={[-0.095, -0.18, 0.451]}>
          {/* Valkoinen puolisko */}
          <mesh>
            <cylinderGeometry args={[0.028, 0.028, 0.002, 32, 1, false, 0, Math.PI]} />
            <meshStandardMaterial color="#FFFFFF" roughness={0.4} metalness={0.2} />
          </mesh>

          {/* Punainen puolisko */}
          <mesh>
            <cylinderGeometry args={[0.028, 0.028, 0.002, 32, 1, false, Math.PI, Math.PI]} />
            <meshStandardMaterial color="#b52a2a" roughness={0.4} metalness={0.2} />
          </mesh>
        </group>
      </group>
    </group>

      {/* ========================================= */}
      {/* WC-ISTUIN                                 */}
      {/* ========================================= */}

      {/* WC:n jalusta*/}
      <mesh position={[0.38, 0.46, 0.48]}>
        <cylinderGeometry args={[0.32, 0.36, 0.22, 16]} />
        <meshStandardMaterial
          color="#d8d5cf"
          roughness={0.45}
        />
      </mesh>

      {/* WC-istuin) */}
      <mesh position={[0.4, 0.6, 0.5]} rotation={[Math.PI / 2, 0, 0]}> 
        <torusGeometry args={[0.25, 0.07, 8, 16]} />
        <meshStandardMaterial
          color="#e4e1da"
          roughness={0.45}
        />
      </mesh>

      {/* WC-istuimen sisäosa */}
      <mesh position={[0.48, 0.56, 0.48]}>
        <cylinderGeometry args={[0.20, 0.20, 0.08, 16]} />
        <meshStandardMaterial
          color="#15151a"
          roughness={0.9}
        />
      </mesh>

      {/* WC-säiliö */}
      <mesh position={[0.38, 0.9, 0.86]}>
        <boxGeometry args={[0.62, 0.72, 0.25]} />
        <meshStandardMaterial
          color="#d8d5cf"
          roughness={0.5}
        />
      </mesh>

      {/* ========================================= */}
      {/* PESUALLAS                                  */}
      {/* ========================================= */}

      <mesh position={[0.38, 1.0, -0.62]}>
        <boxGeometry args={[0.7, 0.16, 0.42]} />
        <meshStandardMaterial
          color="#d8d5cf"
          roughness={0.4}
        />
      </mesh>

      {/* Altaan allas */}
      <mesh position={[0.38, 1.09, -0.62]}>
        <cylinderGeometry args={[0.16, 0.16, 0.04, 16]} />
        <meshStandardMaterial
          color="#85858a"
          roughness={0.3}
          metalness={0.3}
        />
      </mesh>

      {/* Hana */}
      <mesh position={[0.38, 1.2, -0.62]}>
        <cylinderGeometry args={[0.035, 0.035, 0.28, 8]} />
        <meshStandardMaterial
          color="#707078"
          metalness={0.8}
          roughness={0.25}
        />
      </mesh>

      {/* ========================================= */}
      {/* PEILI                                      */}
      {/* ========================================= */}

      <mesh position={[0.38, 1.85, -0.93]}>
        <boxGeometry args={[0.65, 0.75, 0.04]} />
        <meshStandardMaterial
          color="#59616b"
          metalness={0.8}
          roughness={0.12}
        />
      </mesh>

      {/* Peilin kehys */}
      <mesh position={[0.38, 1.85, -0.96]}>
        <boxGeometry args={[0.75, 0.85, 0.04]} />
        <meshStandardMaterial
          color="#26262e"
          metalness={0.6}
          roughness={0.4}
        />
      </mesh>

      {/* ========================================= */}
      {/* PIENI VALO WC:hen                         */}
      {/* ========================================= */}

      <pointLight
        position={[0.2, 2.5, 0]}
        intensity={3}
        distance={4}
        color="#ffe0b0"
      />

      {lahella && !auki && (
        <Html position={[-0.86, 1.35, 0.3]} center>
          <div className="ovi-kehote">Paina E</div>
        </Html>
      )}
    </group>
  )
}