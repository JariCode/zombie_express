import { useFrame, useThree } from '@react-three/fiber'
import { useRef, useState, useEffect } from 'react'
import * as THREE from 'three'
import { useAmpumisSignaali } from '../hooks/useAmpumisSignaali'

// Pelaajan pistooli ja sitä pitävä käsi.
// Näkyy ruudun oikeassa alakulmassa ja seuraa kameraa.
// Ampuessa näyttää suuliekin ja nytkähtää taakse.
export function Pistooli() {
  const { camera } = useThree()
  const ase = useRef()
  const signaali = useAmpumisSignaali()

  // Recoilin määrä juuri nyt (0 = lepo, kasvaa laukauksesta).
  const recoil = useRef(0)

  // Näkyykö suuliekki juuri nyt.
  const [liekki, setLiekki] = useState(false)

  // Seurataan monesko laukaus on käsitelty.
  const kasitelty = useRef(0)

  useEffect(() => {
    // Tarkistetaan säännöllisesti onko ammuttu.
    const tarkista = setInterval(() => {
      if (signaali.laukauksia > kasitelty.current) {
        kasitelty.current = signaali.laukauksia
        recoil.current = 0.15
        setLiekki(true)
        setTimeout(() => setLiekki(false), 60)
      }
    }, 16)
    return () => clearInterval(tarkista)
  }, [signaali])

  useFrame(() => {
    if (!ase.current) return

    // Kiinnitetään ase kameran eteen, oikeaan alakulmaan.
    ase.current.position.copy(camera.position)
    ase.current.quaternion.copy(camera.quaternion)

    // Siirretään ase kameran paikalliseen "oikea-ala-etu" -kulmaan.
    ase.current.translateX(0.25)
    ase.current.translateY(-0.25)
    ase.current.translateZ(-0.6 + recoil.current)

    // Recoil palautuu vähitellen lepoon.
    recoil.current *= 0.8
  })

  return (
    <group ref={ase}>
      {/* Rungon pääosa */}
      <mesh position={[0, 0, 0]}>
        <boxGeometry args={[0.06, 0.09, 0.22]} />
        <meshStandardMaterial color="#1a1a1a" metalness={0.7} roughness={0.4} />
      </mesh>

      {/* Piippu */}
      <mesh position={[0, 0.03, -0.16]}>
        <boxGeometry args={[0.04, 0.04, 0.14]} />
        <meshStandardMaterial color="#0d0d0d" metalness={0.8} roughness={0.3} />
      </mesh>

      {/* Kahva */}
      <mesh position={[0, -0.1, 0.06]} rotation={[0.3, 0, 0]}>
        <boxGeometry args={[0.05, 0.14, 0.07]} />
        <meshStandardMaterial color="#2a1a10" roughness={0.8} />
      </mesh>

      {/* Nyrkki joka pitää kahvasta */}
      <mesh position={[0, -0.13, 0.08]} rotation={[0.3, 0, 0]}>
        <boxGeometry args={[0.07, 0.08, 0.09]} />
        <meshStandardMaterial color="#c9a08a" roughness={0.9} />
      </mesh>

      {/* Peukalo kahvan päällä */}
      <mesh position={[0.04, -0.08, 0.05]} rotation={[0.3, 0, -0.3]}>
        <boxGeometry args={[0.025, 0.06, 0.03]} />
        <meshStandardMaterial color="#c9a08a" roughness={0.9} />
      </mesh>

      {/* Käsivarsi joka tulee alhaalta nyrkkiin */}
      <mesh position={[0, -0.32, 0.16]} rotation={[0.5, 0, 0]}>
        <boxGeometry args={[0.08, 0.32, 0.09]} />
        <meshStandardMaterial color="#3a3a45" roughness={0.9} />
      </mesh>

      {/* Suuliekki piipun päässä, näkyy vain ammuttaessa */}
      {liekki && (
        <mesh position={[0, 0.03, -0.26]}>
          <sphereGeometry args={[0.05, 8, 8]} />
          <meshBasicMaterial color="#ffcc44" />
        </mesh>
      )}
    </group>
  )
}