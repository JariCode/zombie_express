import { RigidBody } from '@react-three/rapier'
import { Ovi } from './Ovi'
import { Vessa } from './Vessa'

// Ravintolavaunun pituus z-akselilla. Sama kuin matkustajavaunulla.
const PITUUS = 44

// Ympariston tormaysryhma: ryhma 0, tormaa kaikkiin.
const YMPARISTO = 0x0001000f

// Yksi ikkunaseinä: pystypalkkeja joiden väliin jää ikkunat.
// Sama rakenne kuin matkustajavaunussa.
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
      <mesh position={[x, 0.6, 0]}>
        <boxGeometry args={[0.2, 0.6, PITUUS]} />
        <meshStandardMaterial color="#3a2f28" />
      </mesh>

      {/* Yläreuna koko seinän pituudelta. */}
      <RigidBody type="fixed" colliders="cuboid" collisionGroups={YMPARISTO}>
        <mesh position={[x, 2.6, 0]}>
          <boxGeometry args={[0.2, 0.8, PITUUS]} />
          <meshStandardMaterial color="#3a2f28" />
        </mesh>
      </RigidBody>

      {/* Pystypalkit ikkunoiden väleissä. */}
      {palkit.map((zi) => (
        <RigidBody key={zi} type="fixed" colliders="cuboid" collisionGroups={YMPARISTO}>
          <mesh position={[x, 1.5, zi]}>
            <boxGeometry args={[0.2, 3, 0.8]} />
            <meshStandardMaterial color="#3a2f28" />
          </mesh>
        </RigidBody>
      ))}

      {/* Ikkunalasit aukkoihin. */}
      {ikkunat.map((zi) => (
        <RigidBody key={zi} type="fixed" colliders="cuboid" collisionGroups={YMPARISTO}>
          <mesh position={[x, 1.55, zi]}>
            <boxGeometry args={[0.1, 1.3, 3.0]} />
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

      {/* Ikkunakehykset: listakehys jokaisen ikkuna-aukon ympärillä. */}
      {ikkunat.map((zi) => (
        <group key={`kehys-${zi}`}>
          <mesh position={[x - puoli * 0.06, 0.9, zi]}>
            <boxGeometry args={[0.1, 0.08, 3.0]} />
            <meshStandardMaterial color="#4a4038" roughness={0.6} metalness={0.3} />
          </mesh>
          <mesh position={[x - puoli * 0.06, 2.2, zi]}>
            <boxGeometry args={[0.1, 0.08, 3.0]} />
            <meshStandardMaterial color="#4a4038" roughness={0.6} metalness={0.3} />
          </mesh>
          {[-1.5, 1.5].map((rz) => (
            <mesh key={rz} position={[x - puoli * 0.06, 1.55, zi + rz]}>
              <boxGeometry args={[0.1, 1.3, 0.1]} />
              <meshStandardMaterial color="#4a4038" roughness={0.6} metalness={0.3} />
            </mesh>
          ))}
        </group>
      ))}
    </group>
  )
}

// Yksi ravintolapöytä tuoleineen. x ja z sijoittavat pöydän.
function Poyta({ x, z }) {
  const poytaVari = '#5a4a3a'
  const jalkaVari = '#2a2420'
  const tuoliVari = '#3a2e2e'

  return (
    <group position={[x, 0, z]}>
      {/* Pöytälevy */}
      <RigidBody type="fixed" colliders="cuboid" collisionGroups={YMPARISTO}>
        <mesh position={[0, 0.75, 0]} castShadow>
          <boxGeometry args={[0.9, 0.06, 1.2]} />
          <meshStandardMaterial color={poytaVari} roughness={0.6} metalness={0.1} />
        </mesh>
      </RigidBody>
      {/* Pöydän jalka (keskitolppa) */}
      <mesh position={[0, 0.38, 0]}>
        <boxGeometry args={[0.12, 0.75, 0.12]} />
        <meshStandardMaterial color={jalkaVari} roughness={0.4} metalness={0.5} />
      </mesh>
      {/* Jalan aluslevy */}
      <mesh position={[0, 0.04, 0]}>
        <boxGeometry args={[0.5, 0.04, 0.6]} />
        <meshStandardMaterial color={jalkaVari} roughness={0.4} metalness={0.5} />
      </mesh>

      {/* Kaksi tuolia, pöydän molemmin puolin (z-suunnassa) */}
      {[-0.75, 0.75].map((tz) => (
        <group key={tz} position={[0, 0, tz]}>
          {/* Istuin */}
          <mesh position={[0, 0.45, 0]} castShadow>
            <boxGeometry args={[0.5, 0.08, 0.5]} />
            <meshStandardMaterial color={tuoliVari} roughness={0.85} />
          </mesh>
          {/* Selkänoja (käännetty pöytään päin) */}
          <mesh position={[0, 0.75, tz > 0 ? 0.22 : -0.22]}>
            <boxGeometry args={[0.5, 0.5, 0.06]} />
            <meshStandardMaterial color={tuoliVari} roughness={0.85} />
          </mesh>
          {/* Neljä jalkaa */}
          {[[-0.2, -0.2], [0.2, -0.2], [-0.2, 0.2], [0.2, 0.2]].map(([jx, jz], i) => (
            <mesh key={i} position={[jx, 0.22, jz]}>
              <boxGeometry args={[0.05, 0.45, 0.05]} />
              <meshStandardMaterial color={jalkaVari} roughness={0.5} metalness={0.4} />
            </mesh>
          ))}
        </group>
      ))}
    </group>
  )
}

// Ravintolavaunu: sama runko kuin matkustajavaunussa (seinät, ikkunat,
// lattia, matto, katto, valot), mutta sisustuksena baaritiski (oikea reuna),
// keittiö (vasen reuna), pöydät ja vessa. Keskikäytävä jää vapaaksi.
// z siirtää vaunun oikeaan kohtaan junassa.
export function RavintolaVaunu({ z }) {
  // Pöydät molemmissa päissä käytävän molemmin puolin (x = -1.6 ja 1.6).
  // Etupää baaritiskin jälkeen ja takapää ennen vessaa.
  const poytaRivit = [-8, -3, 4, 9, 14]

  return (
    <group position={[0, 0, z]}>
      {/* ===== RUNKO (sama kuin matkustajavaunussa) ===== */}

      {/* Lattia (törmäyspinta) */}
      <RigidBody type="fixed" colliders="cuboid" collisionGroups={YMPARISTO}>
        <mesh position={[0, 0, 0]} receiveShadow>
          <boxGeometry args={[6, 0.2, PITUUS]} />
          <meshStandardMaterial color="#241d19" />
        </mesh>
      </RigidBody>

      {/* Reuna-alueiden lattia molemmin puolin, hieman vaaleampi */}
      <mesh position={[-1.9, 0.101, 0]} receiveShadow>
        <boxGeometry args={[2.2, 0.01, PITUUS]} />
        <meshStandardMaterial color="#2e2620" roughness={0.95} />
      </mesh>
      <mesh position={[1.9, 0.101, 0]} receiveShadow>
        <boxGeometry args={[2.2, 0.01, PITUUS]} />
        <meshStandardMaterial color="#2e2620" roughness={0.95} />
      </mesh>

      {/* Keskikäytävän kulkuraita, tummempi kulunut matto */}
      <mesh position={[0, 0.102, 0]} receiveShadow>
        <boxGeometry args={[1.9, 0.012, PITUUS]} />
        <meshStandardMaterial color="#1a1512" roughness={1} />
      </mesh>

      {/* Käytävän reunalistat */}
      {[-0.95, 0.95].map((rx) => (
        <mesh key={rx} position={[rx, 0.108, 0]}>
          <boxGeometry args={[0.06, 0.012, PITUUS]} />
          <meshStandardMaterial color="#3a3a40" roughness={0.5} metalness={0.5} />
        </mesh>
      ))}

      {/* Pituussuuntaiset raidat käytävämatossa */}
      {[-0.5, 0, 0.5].map((rx) => (
        <mesh key={`r${rx}`} position={[rx, 0.109, 0]}>
          <boxGeometry args={[0.02, 0.012, PITUUS]} />
          <meshStandardMaterial color="#0f0c0a" roughness={1} />
        </mesh>
      ))}

      {/* Katto */}
      <RigidBody type="fixed" colliders="cuboid" collisionGroups={YMPARISTO}>
        <mesh position={[0, 3, 0]}>
          <boxGeometry args={[6, 0.2, PITUUS]} />
          <meshStandardMaterial color="#1a1512" />
        </mesh>
      </RigidBody>

      {/* Kattolamput */}
      <pointLight position={[0, 2.7, -14]} intensity={20} distance={18} color="#ffd8a8" />
      <pointLight position={[0, 2.7, -4]} intensity={20} distance={18} color="#ffd8a8" />
      <pointLight position={[0, 2.7, 6]} intensity={20} distance={18} color="#ffd8a8" />
      <pointLight position={[0, 2.7, 16]} intensity={20} distance={18} color="#ffd8a8" />

      {/* Näkyvät kattovalaisimet */}
      {[-14, -4, 6, 16].map((lz) => (
        <group key={`valaisin-${lz}`} position={[0, 2.85, lz]}>
          <mesh>
            <boxGeometry args={[1.2, 0.12, 0.5]} />
            <meshStandardMaterial
              color="#ffe8c0"
              emissive="#ffd8a0"
              emissiveIntensity={1.5}
              roughness={0.3}
            />
          </mesh>
          <mesh position={[0, 0.02, 0]}>
            <boxGeometry args={[1.3, 0.08, 0.6]} />
            <meshStandardMaterial color="#2a2a30" roughness={0.4} metalness={0.6} />
          </mesh>
        </group>
      ))}

      {/* Ikkunaseinät molemmin puolin */}
      <IkkunaSeina puoli={-1} />
      <IkkunaSeina puoli={1} />

      {/* ===== BAARITISKI (oikea reuna, seinän vieressä, käytävä vapaa) ===== */}

      {/* Tiskin runko */}
      <RigidBody type="fixed" colliders="cuboid" collisionGroups={YMPARISTO}>
        <mesh position={[2.0, 0.55, -14]} castShadow>
          <boxGeometry args={[1.7, 1.1, 6]} />
          <meshStandardMaterial color="#3a2e26" roughness={0.6} metalness={0.2} />
        </mesh>
      </RigidBody>
      {/* Tiskin kansilevy, vaaleampi */}
      <mesh position={[2.0, 1.12, -14]}>
        <boxGeometry args={[1.8, 0.08, 6.1]} />
        <meshStandardMaterial color="#5a4a3a" roughness={0.4} metalness={0.3} />
      </mesh>
      {/* Tiskin etureunan lista (käytävän puoli) */}
      <mesh position={[1.16, 0.9, -14]}>
        <boxGeometry args={[0.06, 0.5, 6]} />
        <meshStandardMaterial color="#6a5a48" roughness={0.4} metalness={0.4} />
      </mesh>

      {/* Baarijakkarat tiskin edessä (käytävän puolella) */}
      {[-16.5, -15, -13.5, -12].map((jz) => (
        <group key={`jakkara-${jz}`} position={[0.8, 0, jz]}>
          <mesh position={[0, 0.7, 0]} castShadow>
            <cylinderGeometry args={[0.22, 0.22, 0.1, 16]} />
            <meshStandardMaterial color="#4a2e2e" roughness={0.8} />
          </mesh>
          <mesh position={[0, 0.35, 0]}>
            <cylinderGeometry args={[0.05, 0.05, 0.6, 10]} />
            <meshStandardMaterial color="#2a2a30" roughness={0.4} metalness={0.7} />
          </mesh>
          <mesh position={[0, 0.04, 0]}>
            <cylinderGeometry args={[0.2, 0.2, 0.04, 16]} />
            <meshStandardMaterial color="#2a2a30" roughness={0.4} metalness={0.7} />
          </mesh>
        </group>
      ))}

      {/* Takahylly baaritiskin takana (oikea seinä), pulloille. */}
      <mesh position={[2.85, 1.4, -14]}>
        <boxGeometry args={[0.3, 1.6, 6]} />
        <meshStandardMaterial color="#2a2018" roughness={0.7} />
      </mesh>
      {/* Hyllytasot */}
      {[1.0, 1.5, 2.0].map((hy) => (
        <mesh key={hy} position={[2.7, hy, -14]}>
          <boxGeometry args={[0.35, 0.04, 5.8]} />
          <meshStandardMaterial color="#3a2e26" roughness={0.6} />
        </mesh>
      ))}
      {/* Pulloja hyllyillä */}
      {[1.12, 1.62, 2.12].map((hy, hi) =>
        [-16, -14.7, -13.4, -12.1].map((pz, pi) => (
          <mesh key={`pullo-${hi}-${pi}`} position={[2.7, hy, pz]}>
            <cylinderGeometry args={[0.05, 0.05, 0.22, 8]} />
            <meshStandardMaterial
              color={['#3a5a3a', '#5a3a2a', '#2a3a5a', '#5a5a2a'][pi]}
              roughness={0.3}
              metalness={0.2}
            />
          </mesh>
        ))
      )}

      {/* ===== KEITTIÖ (vasen reuna, seinän vieressä, käytävä vapaa) ===== */}

      {/* Työtaso */}
      <RigidBody type="fixed" colliders="cuboid" collisionGroups={YMPARISTO}>
        <mesh position={[-2.0, 0.5, -14]}>
          <boxGeometry args={[1.7, 1.0, 6]} />
          <meshStandardMaterial color="#3a3a40" roughness={0.4} metalness={0.5} />
        </mesh>
      </RigidBody>
      {/* Metallinen työtason kansi */}
      <mesh position={[-2.0, 1.02, -14]}>
        <boxGeometry args={[1.8, 0.06, 6.1]} />
        <meshStandardMaterial color="#8a8a92" roughness={0.3} metalness={0.8} />
      </mesh>
      {/* Liesi (tummat levyt työtasolla) */}
      {[-15.5, -14.3].map((lz) => (
        <mesh key={`liesi-${lz}`} position={[-2.0, 1.06, lz]}>
          <boxGeometry args={[0.6, 0.03, 0.6]} />
          <meshStandardMaterial color="#15161a" roughness={0.5} metalness={0.6} />
        </mesh>
      ))}
      {/* Pesuallas (upotus työtasossa) */}
      <mesh position={[-2.0, 1.04, -12.5]}>
        <boxGeometry args={[0.7, 0.06, 0.5]} />
        <meshStandardMaterial color="#6a6a72" roughness={0.3} metalness={0.7} />
      </mesh>
      {/* Liesituuletin katosta */}
      <mesh position={[-2.2, 2.3, -15]}>
        <boxGeometry args={[1.2, 0.5, 2]} />
        <meshStandardMaterial color="#6a6a72" roughness={0.4} metalness={0.7} />
      </mesh>
      {/* Yläkaapit vasemmalla seinällä */}
      <mesh position={[-2.7, 2.0, -14]}>
        <boxGeometry args={[0.4, 0.8, 5]} />
        <meshStandardMaterial color="#2a2018" roughness={0.7} />
      </mesh>

      {/* ===== RUOKAILUTILA: PÖYDÄT käytävän molemmin puolin ===== */}
      {poytaRivit.map((pz) => (
        <group key={`poydat-${pz}`}>
          <Poyta x={-1.6} z={pz} />
          <Poyta x={1.6} z={pz} />
        </group>
      ))}

      {/* Vessa vaunun takaosassa, samassa kohdassa kuin muissa vaunuissa. */}
      <Vessa />

      {/* ===== OVET PÄÄDYISSÄ ===== */}

      {/* Etuovi (kohti edellistä vaunua). */}
      <Ovi z={-PITUUS / 2} worldZ={z - PITUUS / 2} avautumissuunta={-1} />

      {/* Takaovi (junan viimeinen pää). */}
      <Ovi z={PITUUS / 2} worldZ={z + PITUUS / 2} avautumissuunta={1} />
    </group>
  )
}
