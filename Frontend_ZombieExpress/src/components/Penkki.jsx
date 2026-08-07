import { RigidBody } from '@react-three/rapier'

// Yksi kahden istuttava junapenkki: verhoiltu istuin, selkänoja, käsinojat ja jalat.
// x ja z sijoittavat penkin, kaanto kääntää selkänojan oikeaan suuntaan.
export function Penkki({ x, z, kaanto = 0 }) {
  // Verhoilun ja rungon värit.
  const verhoilu = '#4a2e2e'
  const verhoiluTumma = '#3a2323'
  const runko = '#1a1412'

  return (
    <group position={[x, 0, z]} rotation={[0, kaanto, 0]}>
      {/* Törmäys: yksi laatikko koko penkille, ettei tarvita montaa collideria */}
      <RigidBody type="fixed" colliders="cuboid">
        <mesh position={[0, 0.75, -0.1]} visible={false}>
          <boxGeometry args={[1.7, 1.5, 1]} />
          <meshBasicMaterial />
        </mesh>
      </RigidBody>

      {/* Istuintyyny, hieman pyöristetty ylhäältä */}
      <mesh position={[0, 0.52, 0.05]} castShadow>
        <boxGeometry args={[1.6, 0.18, 0.85]} />
        <meshStandardMaterial color={verhoilu} roughness={0.9} />
      </mesh>
      {/* Istuimen etureuna pyöristettynä (sylinteri) */}
      <mesh position={[0, 0.52, 0.47]} rotation={[0, 0, Math.PI / 2]}>
        <cylinderGeometry args={[0.09, 0.09, 1.6, 12]} />
        <meshStandardMaterial color={verhoilu} roughness={0.9} />
      </mesh>

      {/* Selkänoja, hieman taaksepäin kallistettu */}
      <mesh position={[0, 1.05, -0.32]} rotation={[-0.12, 0, 0]} castShadow>
        <boxGeometry args={[1.6, 0.85, 0.16]} />
        <meshStandardMaterial color={verhoilu} roughness={0.9} />
      </mesh>
      {/* Selkänojan yläreuna pyöristettynä */}
      <mesh position={[0, 1.47, -0.35]} rotation={[0, 0, Math.PI / 2]}>
        <cylinderGeometry args={[0.08, 0.08, 1.6, 12]} />
        <meshStandardMaterial color={verhoiluTumma} roughness={0.9} />
      </mesh>
      {/* Pystysauma keskellä selkänojaa (kahden istuttava) */}
      <mesh position={[0, 1.05, -0.24]}>
        <boxGeometry args={[0.03, 0.8, 0.04]} />
        <meshStandardMaterial color={verhoiluTumma} roughness={0.9} />
      </mesh>
      {/* Pystysauma istuimessa */}
      <mesh position={[0, 0.62, 0.05]}>
        <boxGeometry args={[0.03, 0.04, 0.8]} />
        <meshStandardMaterial color={verhoiluTumma} roughness={0.9} />
      </mesh>

      {/* Käsinojat molemmilla reunoilla */}
      {[-0.82, 0.82].map((kx) => (
        <mesh key={kx} position={[kx, 0.75, 0.05]}>
          <boxGeometry args={[0.1, 0.5, 0.75]} />
          <meshStandardMaterial color={runko} roughness={0.5} metalness={0.4} />
        </mesh>
      ))}

      {/* Metallirunko istuimen alla */}
      <mesh position={[0, 0.42, 0.05]}>
        <boxGeometry args={[1.55, 0.08, 0.8]} />
        <meshStandardMaterial color={runko} roughness={0.4} metalness={0.5} />
      </mesh>

      {/* Jalat: kaksi tolppaa */}
      {[-0.65, 0.65].map((jx) => (
        <mesh key={jx} position={[jx, 0.2, 0.05]}>
          <boxGeometry args={[0.12, 0.4, 0.5]} />
          <meshStandardMaterial color={runko} roughness={0.4} metalness={0.5} />
        </mesh>
      ))}
    </group>
  )
}