import { useFrame, useThree } from '@react-three/fiber'
import { useRef, useState, useEffect } from 'react'
import * as THREE from 'three'
import { useAmpumisSignaali } from '../hooks/useAmpumisSignaali'

// Pelaajan pistooli ja sormet kahvan ympärillä. Näkyy lähellä kameraa
// oikeassa alakulmassa. Ampuessa: suuliekki ja recoil.
export function Pistooli() {
  const { camera } = useThree()
  const ase = useRef()
  const signaali = useAmpumisSignaali()

  const recoil = useRef(0)
  const [liekki, setLiekki] = useState(false)
  const kasitelty = useRef(0)

  useEffect(() => {
    const tarkista = setInterval(() => {
      if (signaali.laukauksia > kasitelty.current) {
        kasitelty.current = signaali.laukauksia
        recoil.current = 0.12
        setLiekki(true)
        setTimeout(() => setLiekki(false), 60)
      }
    }, 16)
    return () => clearInterval(tarkista)
  }, [signaali])

  useFrame(() => {
    if (!ase.current) return
    ase.current.position.copy(camera.position)
    ase.current.quaternion.copy(camera.quaternion)
    // Ase lähellä kameraa, oikeassa alakulmassa.
    ase.current.translateX(0.22)
    ase.current.translateY(-0.2)
    ase.current.translateZ(-0.43 + recoil.current)
    recoil.current *= 0.8
  })

  // Värit.
  const metalliTumma = '#15161a'
  const metalliVaalea = '#2a2c33'
  const iho = '#c19a80'
  const ihoVarjo = '#a8826a'
  const kahvaKallistus = 0.35

  return (
    <group ref={ase}>
      {/* ===== ASE ===== */}

      {/* Luisti */}
      <mesh position={[0, 0.035, -0.02]}>
        <boxGeometry args={[0.055, 0.055, 0.28]} />
        <meshStandardMaterial color={metalliVaalea} metalness={0.8} roughness={0.35} />
      </mesh>
      {/* Luistin urat */}
      <mesh position={[0.028, 0.035, 0.08]}>
        <boxGeometry args={[0.005, 0.04, 0.06]} />
        <meshStandardMaterial color={metalliTumma} metalness={0.7} roughness={0.4} />
      </mesh>
      <mesh position={[-0.028, 0.035, 0.08]}>
        <boxGeometry args={[0.005, 0.04, 0.06]} />
        <meshStandardMaterial color={metalliTumma} metalness={0.7} roughness={0.4} />
      </mesh>

      {/* Runko luistin alla */}
      <mesh position={[0, -0.005, 0]}>
        <boxGeometry args={[0.05, 0.04, 0.26]} />
        <meshStandardMaterial color={metalliTumma} metalness={0.6} roughness={0.45} />
      </mesh>

      {/* Piippu */}
      <mesh position={[0, 0.035, -0.18]} rotation={[Math.PI / 2, 0, 0]}>
        <cylinderGeometry args={[0.018, 0.018, 0.06, 12]} />
        <meshStandardMaterial color={metalliTumma} metalness={0.85} roughness={0.3} />
      </mesh>
      <mesh position={[0, 0.035, -0.21]} rotation={[Math.PI / 2, 0, 0]}>
        <cylinderGeometry args={[0.012, 0.012, 0.01, 12]} />
        <meshBasicMaterial color="#000000" />
      </mesh>

      {/* Tähtäimet */}
      <mesh position={[0, 0.07, 0.1]}>
        <boxGeometry args={[0.03, 0.012, 0.012]} />
        <meshStandardMaterial color={metalliTumma} metalness={0.7} roughness={0.4} />
      </mesh>
      <mesh position={[0, 0.073, 0.099]}>
        <boxGeometry args={[0.006, 0.008, 0.014]} />
        <meshBasicMaterial color="#000000" />
      </mesh>
      <mesh position={[0, 0.07, -0.13]}>
        <boxGeometry args={[0.008, 0.014, 0.008]} />
        <meshStandardMaterial color={metalliTumma} metalness={0.7} roughness={0.4} />
      </mesh>

      {/* Kahva */}
      <mesh position={[0, -0.11, 0.08]} rotation={[kahvaKallistus, 0, 0]}>
        <boxGeometry args={[0.048, 0.16, 0.06]} />
        <meshStandardMaterial color="#1a1410" roughness={0.7} metalness={0.2} />
      </mesh>

      {/* ===== SORMET kahvan ympärillä (ei hihaa) ===== */}
      <group position={[0, -0.11, 0.09]} rotation={[kahvaKallistus, 0, 0]}>
        {/* Kämmenselkä kahvan takana */}
        <mesh position={[0, 0.02, 0.04]}>
          <boxGeometry args={[0.07, 0.11, 0.045]} />
          <meshStandardMaterial color={iho} roughness={0.85} />
        </mesh>

        {/* Neljä sormea kietoutuu kahvan etupuolelle, pyöreät (litistetty pallo) */}
        {[0.045, 0.02, -0.005, -0.03].map((sy, i) => (
          <mesh key={i} position={[0, sy, -0.03]} scale={[0.033, 0.016, 0.03]}>
            <sphereGeometry args={[1, 12, 8]} />
            <meshStandardMaterial color={i % 2 === 0 ? iho : ihoVarjo} roughness={0.85} />
          </mesh>
        ))}
        
        {/* Peukalo kahvan oikealla sivulla, pyöreä */}
        <mesh position={[0.04, 0.03, -0.01]} rotation={[0.3, 0, -0.5]} scale={[0.011, 0.033, 0.015]}>
          <sphereGeometry args={[1, 12, 8]} />
          <meshStandardMaterial color={iho} roughness={0.85} />
        </mesh>
      </group>

      {/* Suuliekki, näkyy vain ammuttaessa */}
      {liekki && (
        <group position={[0, 0.035, -0.24]}>
          <mesh>
            <sphereGeometry args={[0.045, 8, 8]} />
            <meshBasicMaterial color="#ffcc44" />
          </mesh>
          <mesh position={[0, 0, -0.03]}>
            <sphereGeometry args={[0.025, 8, 8]} />
            <meshBasicMaterial color="#fff0c0" />
          </mesh>
        </group>
      )}
    </group>
  )
}