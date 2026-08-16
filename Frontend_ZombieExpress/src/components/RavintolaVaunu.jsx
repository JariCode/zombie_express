import { RigidBody, CuboidCollider } from '@react-three/rapier'
import * as THREE from 'three'
import { Ovi } from './Ovi'
import { Vessa } from './Vessa'
import { VaunuValo } from './VaunuValo'

// Ravintolavaunun pituus z-akselilla. Sama kuin matkustajavaunulla.
const PITUUS = 44

// Ympariston tormaysryhma: ryhma 0, tormaa kaikkiin.
const YMPARISTO = 0x0001000f

// Jaetut geometriat ja materiaalit ikkunaseinille, jottei niitä luoda
// uudelleen joka seinälle. Sama kevennys kuin matkustajavaunussa.
const seinaMat = new THREE.MeshStandardMaterial({ color: '#3a2f28' })
const kehysMat = new THREE.MeshStandardMaterial({ color: '#4a4038', roughness: 0.6, metalness: 0.3 })
const lasiMat = new THREE.MeshStandardMaterial({ color: '#0a0a14', transparent: true, opacity: 0.4, roughness: 0.1, metalness: 0 })

const alareunaGeo = new THREE.BoxGeometry(0.2, 1.2, PITUUS)
const ylareunaGeo = new THREE.BoxGeometry(0.2, 0.8, PITUUS)
const umpiGeo = new THREE.BoxGeometry(0.2, 1.3, 3.0)
const rakoGeo = new THREE.BoxGeometry(0.2, 1.3, 2.0)
const palkkiGeo = new THREE.BoxGeometry(0.2, 3, 0.8)
const lasiGeo = new THREE.BoxGeometry(0.1, 1.3, 3.0)
const kehysVaakaGeo = new THREE.BoxGeometry(0.1, 0.08, 3.0)
const kehysPystyGeo = new THREE.BoxGeometry(0.1, 1.3, 0.1)

// Yksi ikkunaseinä: pystypalkkeja joiden väliin jää ikkunat.
// Sama rakenne kuin matkustajavaunussa.
// puoli = -1 vasen seinä, +1 oikea seinä.
function IkkunaSeina({ puoli }) {
  const x = puoli * 3

  // Ikkunat tasavälein vaunun pituudella.
  const ikkunat = []
  for (let zi = -15.2; zi <= 15.2; zi += 3.8) ikkunat.push(zi)

  // Pystypalkit ikkunoiden väleissä.
  const palkit = []
  for (let zi = -20.9; zi <= 20.9; zi += 3.8) palkit.push(zi)

  return (
    <group>
      {/* Alareuna koko seinän pituudelta. */}
      <mesh geometry={alareunaGeo} material={seinaMat} position={[x, 0.3, 0]} />

      {/* Yläreuna koko seinän pituudelta. */}
      <RigidBody type="fixed" colliders="cuboid" collisionGroups={YMPARISTO}>
        <mesh geometry={ylareunaGeo} material={seinaMat} position={[x, 2.6, 0]} />
      </RigidBody>

      {/* Umpiseinä ensimmäisen ja viimeisen ikkunan ohi jäävien aukkojen
          kohdalle (z=±21), jottei seinään jää reikää. */}
      {[-21, 21].map((zi) => (
        <RigidBody key={`umpi-${zi}`} type="fixed" colliders="cuboid">
          <mesh geometry={umpiGeo} material={seinaMat} position={[x, 1.55, zi]} />
        </RigidBody>
      ))}

      {/* Umpiseinä ikkunan ja päädyn väliin jääneeseen rakoon (väliseinän kohta). */}
      {[-18, 18].map((zi) => (
        <RigidBody key={`rako-${zi}`} type="fixed" colliders="cuboid">
          <mesh geometry={rakoGeo} material={seinaMat} position={[x, 1.55, zi]} />
        </RigidBody>
      ))}

      {/* Pystypalkit ikkunoiden väleissä. */}
      {palkit.map((zi) => (
        <RigidBody key={zi} type="fixed" colliders="cuboid" collisionGroups={YMPARISTO}>
          <mesh geometry={palkkiGeo} material={seinaMat} position={[x, 1.5, zi]} />
        </RigidBody>
      ))}

      {/* Ikkunalasit aukkoihin. */}
      {ikkunat.map((zi) => (
        <RigidBody key={zi} type="fixed" colliders="cuboid" collisionGroups={YMPARISTO}>
          <mesh geometry={lasiGeo} material={lasiMat} position={[x, 1.55, zi]} />
        </RigidBody>
      ))}

      {/* Ikkunakehykset: listakehys jokaisen ikkuna-aukon ympärillä. */}
      {ikkunat.map((zi) => (
        <group key={`kehys-${zi}`}>
          <mesh geometry={kehysVaakaGeo} material={kehysMat} position={[x - puoli * 0.06, 0.9, zi]} />
          <mesh geometry={kehysVaakaGeo} material={kehysMat} position={[x - puoli * 0.06, 2.2, zi]} />
          {[-1.5, 1.5].map((rz) => (
            <mesh key={rz} geometry={kehysPystyGeo} material={kehysMat} position={[x - puoli * 0.06, 1.55, zi + rz]} />
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

      {/* Tämän vaunun oma varjoja heittävä valo. */}
      <VaunuValo />

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

     {/* Tiskin runko: kapea ja irti seinästä, seinän puolelle jää
          henkilökunnan työskentelytila. Lyhennetty niin että päädyistä
          pääsee kiertämään taakse. Collideri täsmälleen rungon kohdalla. */}
      <RigidBody type="fixed" colliders={false} collisionGroups={YMPARISTO}>
        <mesh position={[1.7, 0.55, -14]} castShadow>
          <boxGeometry args={[0.9, 1.1, 3.6]} />
          <meshStandardMaterial color="#3a2e26" roughness={0.6} metalness={0.2} />
        </mesh>
        <CuboidCollider args={[0.45, 0.55, 1.8]} position={[1.7, 0.55, -14]} />
      </RigidBody>
      {/* Tiskin kansilevy, vaaleampi */}
      <mesh position={[1.7, 1.12, -14]}>
        <boxGeometry args={[1.0, 0.08, 3.7]} />
        <meshStandardMaterial color="#5a4a3a" roughness={0.4} metalness={0.3} />
      </mesh>
      {/* Tiskin etureunan lista (käytävän puoli) */}
      <mesh position={[1.26, 0.9, -14]}>
        <boxGeometry args={[0.06, 0.5, 3.6]} />
        <meshStandardMaterial color="#6a5a48" roughness={0.4} metalness={0.4} />
      </mesh>

      {/* Baarijakkarat tiskin edessä (käytävän puolella) */}
      {[-15.4, -14.4, -13.4, -12.6].map((jz) => (
        <group key={`jakkara-${jz}`} position={[0.95, 0, jz]}>
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
      <mesh position={[2.92, 1.4, -14]}>
        <boxGeometry args={[0.15, 1.6, 6]} />
        <meshStandardMaterial color="#2a2018" roughness={0.7} />
      </mesh>
      {/* Hyllytasot */}
      {[1.0, 1.5, 2.0].map((hy) => (
        <mesh key={hy} position={[2.82, hy, -14]}>
          <boxGeometry args={[0.25, 0.04, 5.8]} />
          <meshStandardMaterial color="#3a2e26" roughness={0.6} />
        </mesh>
      ))}
      {/* Pulloja hyllyillä */}
      {[1.12, 1.62, 2.12].map((hy, hi) =>
        [-16, -14.7, -13.4, -12.1].map((pz, pi) => (
          <mesh key={`pullo-${hi}-${pi}`} position={[2.82, hy, pz]}>
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

      {/* Työtaso: kapea ja irti seinästä, seinän puolelle jää työskentelytila.
          Collideri täsmälleen tason kohdalla. */}
      <RigidBody type="fixed" colliders={false} collisionGroups={YMPARISTO}>
        <mesh position={[-1.7, 0.5, -14]}>
          <boxGeometry args={[0.9, 1.0, 3.6]} />s
          <meshStandardMaterial color="#3a3a40" roughness={0.4} metalness={0.5} />
        </mesh>
        <CuboidCollider args={[0.45, 0.5, 1.8]} position={[-1.7, 0.5, -14]} />
      </RigidBody>
      {/* Metallinen työtason kansi */}
      <mesh position={[-1.7, 1.02, -14]}>
        <boxGeometry args={[1.0, 0.06, 3.7]} />
        <meshStandardMaterial color="#8a8a92" roughness={0.3} metalness={0.8} />
      </mesh>
      {/* Liesi (tummat levyt työtasolla) */}
      {[-15.4, -14.4].map((lz) => (
        <mesh key={`liesi-${lz}`} position={[-1.7, 1.06, lz]}>
          <boxGeometry args={[0.6, 0.03, 0.6]} />
          <meshStandardMaterial color="#15161a" roughness={0.5} metalness={0.6} />
        </mesh>
      ))}
      {/* Pesuallas (upotus työtasossa) */}
      <mesh position={[-1.7, 1.04, -12.8]}>
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

      {/* Vessa oikealla puolella, kiinni +z-pään eteisen väliseinässä. */}
      <Vessa position={[1.8, 0, 17]} />

      {/* Välikkö (eteinen) molemmissa päädyissä: väliseinä oviaukolla erottaa
          välikön muusta tilasta, ulko-ovet molemmilla sivuseinillä. */}
      {[-1, 1].map((suunta) => {
        const valikkoZ = suunta * 19.5
        const valiseinaZ = valikkoZ - suunta * 1.4
        return (
          <group key={suunta}>
            <RigidBody type="fixed" colliders={false} collisionGroups={0x0001000f}>
              <mesh position={[-1.85, 1.5, valiseinaZ]}>
                <boxGeometry args={[2.3, 3, 0.2]} />
                <meshStandardMaterial color="#2a2320" metalness={0.3} roughness={0.7} />
              </mesh>
              <CuboidCollider args={[1.15, 1.5, 0.1]} position={[-1.85, 1.5, valiseinaZ]} />
            </RigidBody>
            <RigidBody type="fixed" colliders={false} collisionGroups={0x0001000f}>
              <mesh position={[1.85, 1.5, valiseinaZ]}>
                <boxGeometry args={[2.3, 3, 0.2]} />
                <meshStandardMaterial color="#2a2320" metalness={0.3} roughness={0.7} />
              </mesh>
              <CuboidCollider args={[1.15, 1.5, 0.1]} position={[1.85, 1.5, valiseinaZ]} />
            </RigidBody>
            <RigidBody type="fixed" colliders={false} collisionGroups={0x0001000f}>
              <mesh position={[0, 2.7, valiseinaZ]}>
                <boxGeometry args={[1.4, 0.6, 0.2]} />
                <meshStandardMaterial color="#2a2320" metalness={0.3} roughness={0.7} />
              </mesh>
              <CuboidCollider args={[0.7, 0.3, 0.1]} position={[0, 2.7, valiseinaZ]} />
            </RigidBody>
            <mesh position={[-0.72, 1.2, valiseinaZ]}>
              <boxGeometry args={[0.08, 2.4, 0.24]} />
              <meshStandardMaterial color="#6a6a72" metalness={0.5} roughness={0.5} />
            </mesh>
            <mesh position={[0.72, 1.2, valiseinaZ]}>
              <boxGeometry args={[0.08, 2.4, 0.24]} />
              <meshStandardMaterial color="#6a6a72" metalness={0.5} roughness={0.5} />
            </mesh>

            {[-1, 1].map((puoli) => (
              <group key={puoli} position={[puoli * 2.92, 0, valikkoZ]}>
                <mesh position={[0, 1.15, 0]}>
                  <boxGeometry args={[0.06, 2.4, 1.5]} />
                  <meshStandardMaterial color="#4a4038" metalness={0.4} roughness={0.6} />
                </mesh>
                <mesh position={[puoli * -0.04, 1.15, 0]}>
                  <boxGeometry args={[0.06, 2.2, 1.3]} />
                  <meshStandardMaterial color="#5a5560" metalness={0.5} roughness={0.5} />
                </mesh>
                <mesh position={[puoli * -0.08, 1.55, 0]}>
                  <boxGeometry args={[0.04, 1.0, 1.0]} />
                  <meshStandardMaterial color="#0a0e18" transparent opacity={0.45} roughness={0.1} metalness={0} />
                </mesh>
                <mesh position={[puoli * -0.06, 1.55, 0]}>
                  <boxGeometry args={[0.03, 1.1, 1.1]} />
                  <meshStandardMaterial color="#26262e" metalness={0.5} roughness={0.5} />
                </mesh>
                <mesh position={[puoli * -0.1, 0.9, puoli * 0.4]}>
                  <boxGeometry args={[0.04, 0.5, 0.06]} />
                  <meshStandardMaterial color="#8a8a92" metalness={0.8} roughness={0.3} />
                </mesh>
              </group>
            ))}
          </group>
        )
      })}

      {/* ===== OVET PÄÄDYISSÄ ===== */}

      {/* Etuovi (kohti edellistä vaunua). */}
      <Ovi z={-PITUUS / 2} worldZ={z - PITUUS / 2} avautumissuunta={-1} />

      {/* Takaovi (junan viimeinen pää). */}
      <Ovi z={PITUUS / 2} worldZ={z + PITUUS / 2} avautumissuunta={1} />
    </group>
  )
}
