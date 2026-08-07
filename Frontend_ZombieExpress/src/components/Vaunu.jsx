import { RigidBody } from '@react-three/rapier'
import { Penkki } from './Penkki'

// Yksi ikkunaseinä: pystypalkkeja joiden väliin jää ikkunat.
// puoli = -1 vasen seinä, +1 oikea seinä.
function IkkunaSeina({ puoli }) {
  const x = puoli * 3

  // Ikkunoiden keskikohdat vaunun pituudella (z-akseli).
  const ikkunat = [-3.5, 0, 3.5]

  // Pystypalkkien keskikohdat ikkunoiden väleissä ja päissä.
  const palkit = [-5, -1.75, 1.75, 5]

  return (
    <group>
      {/* Ala- ja yläreuna: kapeat vaakapalkit koko seinän pituudelta. */}
      <RigidBody type="fixed" colliders="cuboid">
        <mesh position={[x, 0.6, 0]}>
          <boxGeometry args={[0.2, 0.6, 10]} />
          <meshStandardMaterial color="#3a2f28" />
        </mesh>
      </RigidBody>
      <RigidBody type="fixed" colliders="cuboid">
        <mesh position={[x, 2.6, 0]}>
          <boxGeometry args={[0.2, 0.8, 10]} />
          <meshStandardMaterial color="#3a2f28" />
        </mesh>
      </RigidBody>

      {/* Pystypalkit ikkunoiden väleissä. */}
      {palkit.map((z) => (
        <RigidBody key={z} type="fixed" colliders="cuboid">
          <mesh position={[x, 1.5, z]}>
            <boxGeometry args={[0.2, 3, 1]} />
            <meshStandardMaterial color="#3a2f28" />
          </mesh>
        </RigidBody>
      ))}

      {/* Ikkunalasit aukkoihin. Läpikuultavaa tummaa lasia, pysäyttää pelaajan. */}
      {ikkunat.map((z) => (
        <RigidBody key={z} type="fixed" colliders="cuboid">
          <mesh position={[x, 1.6, z]}>
            <boxGeometry args={[0.1, 1.6, 2.5]} />
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

// Yksi junavaunu: lattia, katto, ikkunaseinät ja penkit.
// z siirtää vaunun oikeaan kohtaan junassa.
export function Vaunu({ z }) {
  // Penkkirivien z-kohdat, ikkunoiden mukaan.
  const penkkiRivit = [-3, -1, 1, 3]

  return (
    <group position={[0, 0, z]}>
      {/* Lattia */}
      <RigidBody type="fixed" colliders="cuboid">
        <mesh position={[0, 0, 0]}>
          <boxGeometry args={[6, 0.2, 10]} />
          <meshStandardMaterial color="#2a2320" />
        </mesh>
      </RigidBody>

      {/* Katto */}
      <RigidBody type="fixed" colliders="cuboid">
        <mesh position={[0, 3, 0]}>
          <boxGeometry args={[6, 0.2, 10]} />
          <meshStandardMaterial color="#1a1512" />
        </mesh>
      </RigidBody>

      {/* Vasen ikkunaseinä */}
      <IkkunaSeina puoli={-1} />

      {/* Oikea ikkunaseinä */}
      <IkkunaSeina puoli={1} />

      {/* Penkit molemmin puolin käytävää, ikkunoiden kohdalla. */}
      {/* Penkit molemmin puolin käytävää, ikkunoiden kohdalla. */}
      {penkkiRivit.map((pz) => (
        <group key={pz}>
          {/* Vasen penkki */}
          <Penkki x={-1.8} z={pz} kaanto={Math.PI} />
          {/* Oikea penkki */}
          <Penkki x={1.8} z={pz} kaanto={Math.PI} />
        </group>
      ))}
    </group>
  )
}