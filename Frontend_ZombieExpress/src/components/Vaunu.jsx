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
     {/* Matkatavarateline ikkunoiden yläpuolella, suora vaakahylly. */}
      {/* Hyllytaso, työntyy seinästä käytävälle päin */}
      <mesh position={[x - puoli * 0.45, 2.3, 0]}>
        <boxGeometry args={[0.7, 0.05, PITUUS - 2]} />
        <meshStandardMaterial color="#2a2420" roughness={0.6} metalness={0.3} />
      </mesh>
      {/* Etureunan putki, estää laukkuja putoamasta */}
      <mesh position={[x - puoli * 0.78, 2.42, 0]} rotation={[Math.PI / 2, 0, 0]}>
        <cylinderGeometry args={[0.03, 0.03, PITUUS - 2, 8]} />
        <meshStandardMaterial color="#3a3a40" roughness={0.4} metalness={0.6} />
      </mesh>
      {/* Kannatinraudat seinästä hyllyyn, pystysuorat kolmiot */}
      {palkit.map((zi) => (
        <mesh key={`kannatin-${zi}`} position={[x - puoli * 0.4, 2.15, zi]}>
          <boxGeometry args={[0.7, 0.04, 0.04]} />
          <meshStandardMaterial color="#3a3a40" roughness={0.4} metalness={0.6} />
        </mesh>
      ))}
      {/* Matkalaukkuja hyllyllä, suorassa */}
      {[-15, -6, 3, 14].map((lz, li) => (
        <mesh key={`laukku-${lz}`}
          position={[x - puoli * 0.45, 2.5, lz]}>
          <boxGeometry args={[0.5, 0.32, 0.7 + (li % 2) * 0.3]} />
          <meshStandardMaterial color={li % 2 === 0 ? '#2a2018' : '#20242a'} roughness={0.8} />
        </mesh>
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

      {/* Näkyvät kattovalaisimet valonlähteiden kohdalla, hehkuvat lämpimästi. */}
      {[-14, -4, 6, 16].map((lz) => (
        <group key={`valaisin-${lz}`} position={[0, 2.85, lz]}>
          {/* Valaisimen kupu, pitkänomainen */}
          <mesh>
            <boxGeometry args={[1.2, 0.12, 0.5]} />
            <meshStandardMaterial
              color="#ffe8c0"
              emissive="#ffd8a0"
              emissiveIntensity={1.5}
              roughness={0.3}
            />
          </mesh>
          {/* Metallikehys kuvun ympärillä */}
          <mesh position={[0, 0.02, 0]}>
            <boxGeometry args={[1.3, 0.08, 0.6]} />
            <meshStandardMaterial color="#2a2a30" roughness={0.4} metalness={0.6} />
          </mesh>
        </group>
      ))}

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