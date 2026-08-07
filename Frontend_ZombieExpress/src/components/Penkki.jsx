import { RigidBody } from '@react-three/rapier'

// Yksi kahden istuttava junapenkki: istuinosa ja selkänoja.
// x ja z sijoittavat penkin, kaanto kääntää selkänojan oikeaan suuntaan.
export function Penkki({ x, z, kaanto = 0 }) {
  return (
    <group position={[x, 0, z]} rotation={[0, kaanto, 0]}>
      {/* Istuinosa */}
      <RigidBody type="fixed" colliders="cuboid">
        <mesh position={[0, 0.5, 0]}>
          <boxGeometry args={[1.6, 0.2, 0.9]} />
          <meshStandardMaterial color="#4a2f2f" />
        </mesh>
      </RigidBody>

      {/* Selkänoja */}
      <RigidBody type="fixed" colliders="cuboid">
        <mesh position={[0, 1, -0.35]}>
          <boxGeometry args={[1.6, 0.8, 0.2]} />
          <meshStandardMaterial color="#3a2525" />
        </mesh>
      </RigidBody>

      {/* Jalat, pieni koroke istuimen alle */}
      <mesh position={[0, 0.2, 0]}>
        <boxGeometry args={[1.4, 0.4, 0.7]} />
        <meshStandardMaterial color="#2a1c1c" />
      </mesh>
    </group>
  )
}