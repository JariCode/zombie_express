import { RigidBody } from '@react-three/rapier'

// Yksi junavaunu: lattia, katto ja kaksi seinää.
// z siirtää vaunun oikeaan kohtaan junassa.
// Osat on kääritty RigidBodyyn, joten ne pysäyttävät pelaajan.
export function Vaunu({ z }) {
  return (
    <group position={[0, 0, z]}>
      {/* Lattia */}
      <RigidBody type="fixed" colliders="cuboid">
        <mesh position={[0, 0, 0]}>
          <boxGeometry args={[3, 0.2, 10]} />
          <meshStandardMaterial color="#2a2320" />
        </mesh>
      </RigidBody>

      {/* Katto */}
      <RigidBody type="fixed" colliders="cuboid">
        <mesh position={[0, 3, 0]}>
          <boxGeometry args={[3, 0.2, 10]} />
          <meshStandardMaterial color="#1a1512" />
        </mesh>
      </RigidBody>

      {/* Vasen seinä */}
      <RigidBody type="fixed" colliders="cuboid">
        <mesh position={[-1.5, 1.5, 0]}>
          <boxGeometry args={[0.2, 3, 10]} />
          <meshStandardMaterial color="#3a2f28" />
        </mesh>
      </RigidBody>

      {/* Oikea seinä */}
      <RigidBody type="fixed" colliders="cuboid">
        <mesh position={[1.5, 1.5, 0]}>
          <boxGeometry args={[0.2, 3, 10]} />
          <meshStandardMaterial color="#3a2f28" />
        </mesh>
      </RigidBody>
    </group>
  )
}