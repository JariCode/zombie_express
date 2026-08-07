import { RigidBody } from '@react-three/rapier'
import { Penkki } from './Penkki'
import { Ovi } from './Ovi'

// Vaunun pituus z-akselilla. Vaunu ulottuu -PITUUS/2 .. +PITUUS/2.
const PITUUS = 44

// Yksi ikkunaseinä: pystypalkkeja joiden väliin jää ikkunat.
// puoli = -1 vasen seinä, +1 oikea seinä.
function IkkunaSeina({ puoli }) {
  const x = puoli * 3

  // Ikkunat tasavälein vaunun pituudella.
  const ikkunat = []
  for (let zi = -19; zi <= 19; zi += 3.8) ikkunat.push(zi)

  // Pystypalkit ikkunoiden väleissä.
  const palkit = []
  for (let zi = -20.9; zi <= 20.9; zi += 3.8) palkit.push(zi)

  return (
    <group>
      {/* Alareuna koko seinän pituudelta. */}
      <RigidBody type="fixed" colliders="cuboid">
        <mesh position={[x, 0.6, 0]}>
          <boxGeometry args={[0.2, 0.6, PITUUS]} />
          <meshStandardMaterial color="#3a2f28" />
        </mesh>
      </RigidBody>
      {/* Yläreuna koko seinän pituudelta. */}
      <RigidBody type="fixed" colliders="cuboid">
        <mesh position={[x, 2.6, 0]}>
          <boxGeometry args={[0.2, 0.8, PITUUS]} />
          <meshStandardMaterial color="#3a2f28" />
        </mesh>
      </RigidBody>

      {/* Pystypalkit ikkunoiden väleissä. */}
      {palkit.map((zi) => (
        <RigidBody key={zi} type="fixed" colliders="cuboid">
          <mesh position={[x, 1.5, zi]}>
            <boxGeometry args={[0.2, 3, 0.8]} />
            <meshStandardMaterial color="#3a2f28" />
          </mesh>
        </RigidBody>
      ))}

      {/* Ikkunalasit aukkoihin. */}
      {ikkunat.map((zi) => (
        <RigidBody key={zi} type="fixed" colliders="cuboid">
          <mesh position={[x, 1.6, zi]}>
            <boxGeometry args={[0.1, 1.6, 2.2]} />
            <meshStandardMaterial
              color="#0a0a14"
              transparent
              opacity={0.4}
              roughness={0.1}
              metalness={0}
            />
          </mesh>
        </RigidBody>
      ))}
    </group>
  )
}

// Yksi junavaunu: lattia, katto, valot, ikkunaseinät, penkit ja päätyovet.
// z siirtää vaunun oikeaan kohtaan junassa.
export function Vaunu({ z }) {
  // 20 penkkiriviä tasavälein, jättäen tilaa ovien eteen.
  const penkkiRivit = []
  for (let i = 0; i < 20; i++) {
    penkkiRivit.push(-19 + i * (38 / 19))
  }

  return (
    <group position={[0, 0, z]}>
      {/* Lattia */}
      <RigidBody type="fixed" colliders="cuboid">
        <mesh position={[0, 0, 0]}>
          <boxGeometry args={[6, 0.2, PITUUS]} />
          <meshStandardMaterial color="#2a2320" />
        </mesh>
      </RigidBody>

      {/* Katto */}
      <RigidBody type="fixed" colliders="cuboid">
        <mesh position={[0, 3, 0]}>
          <boxGeometry args={[6, 0.2, PITUUS]} />
          <meshStandardMaterial color="#1a1512" />
        </mesh>
      </RigidBody>

      {/* Kattolamput vaunun sisällä, tasavälein pituudella. */}
      <pointLight position={[0, 2.7, -14]} intensity={20} distance={18} color="#ffd8a8" />
      <pointLight position={[0, 2.7, -4]} intensity={20} distance={18} color="#ffd8a8" />
      <pointLight position={[0, 2.7, 6]} intensity={20} distance={18} color="#ffd8a8" />
      <pointLight position={[0, 2.7, 16]} intensity={20} distance={18} color="#ffd8a8" />

      {/* Ikkunaseinät molemmin puolin */}
      <IkkunaSeina puoli={-1} />
      <IkkunaSeina puoli={1} />

      {/* Penkit molemmin puolin käytävää. */}
      {penkkiRivit.map((pz, i) => (
        <group key={i}>
          <Penkki x={-1.8} z={pz} kaanto={Math.PI} />
          <Penkki x={1.8} z={pz} kaanto={Math.PI} />
        </group>
      ))}

      {/* Etuovi ja päätyseinä (kohti veturia). */}
      <Ovi z={-PITUUS / 2} worldZ={z - PITUUS / 2} />

      {/* Takaovi ja päätyseinä (mistä tultiin). */}
      <Ovi z={PITUUS / 2} worldZ={z + PITUUS / 2} />
    </group>
  )
}