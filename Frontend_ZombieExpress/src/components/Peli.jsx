import { Canvas } from '@react-three/fiber'
import { PointerLockControls } from '@react-three/drei'
import { Physics } from '@react-three/rapier'
import { Juna } from './Juna'
import { Liikkuja } from './Liikkuja'

// Pelin 3D-näkymä: kamera, valot, fysiikka, juna ja liike.
export function Peli() {
  return (
    <Canvas camera={{ position: [0, 1.6, 3], fov: 75 }}>
      {/* Himmeä yleisvalo */}
      <ambientLight intensity={0.3} />

      {/* Kattolamput valaisevat käytävää */}
      <pointLight position={[0, 2.5, 0]} intensity={20} distance={12} color="#ffd8a8" />
      <pointLight position={[0, 2.5, -20]} intensity={20} distance={12} color="#ffd8a8" />
      <pointLight position={[0, 2.5, -40]} intensity={20} distance={12} color="#ffd8a8" />

      {/* Fysiikkamaailma: kaikki törmäävät objektit tulevat tänne sisään. */}
      <Physics>
        <Juna />
        <Liikkuja />
      </Physics>

      {/* Lukitsee hiiren ja kääntää katsetta. */}
      <PointerLockControls />
    </Canvas>
  )
}