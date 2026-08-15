import { useFrame } from '@react-three/fiber'
import { useRef, useState, useEffect } from 'react'
import { RigidBody, CuboidCollider } from '@react-three/rapier'
import { Html } from '@react-three/drei'
import { Ovi } from './Ovi'
import { VaunuValo } from './VaunuValo'
import { usePelaajanPaikka } from '../hooks/usePelaajanPaikka'

// Makuuvaunun pituus, sama kuin muilla vaunuilla.
const PITUUS = 44

// Käytäväseinän x-sijainti. Käytävä on kapea vasemmalla (x -3..-1.5) ja hytit
// syvät oikealla (x -1.5..3, syvyys 4.5).
const KAYTAVA_SEINA = -1.5

// Vasemman puolen ikkunaseinä (käytävän puoli). Sama ikkunarakenne kuin
// muissa vaunuissa, mutta ilman matkatavarahyllyä.
function IkkunaSeinaVasen() {
  const x = -3

  const ikkunat = []
  for (let zi = -15.2; zi <= 15.2; zi += 3.8) ikkunat.push(zi)

  const palkit = []
  for (let zi = -20.9; zi <= 20.9; zi += 3.8) palkit.push(zi)

  return (
    <group>
      {/* Alareuna koko seinän pituudelta. */}
       <mesh position={[x, 0.3, 0]}>
        <boxGeometry args={[0.2, 1.2, PITUUS]} />
        <meshStandardMaterial color="#3a2f28" />
      </mesh>

      {/* Yläreuna koko seinän pituudelta. */}
      <RigidBody type="fixed" colliders="cuboid">
        <mesh position={[x, 2.6, 0]}>
          <boxGeometry args={[0.2, 0.8, PITUUS]} />
          <meshStandardMaterial color="#3a2f28" />
        </mesh>
      </RigidBody>

      {/* Umpiseinä ensimmäisen ja viimeisen ikkunan ohi jäävien aukkojen kohdalle. */}
      {[-21, 21].map((zi) => (
        <RigidBody key={`umpi-${zi}`} type="fixed" colliders="cuboid">
          <mesh position={[x, 1.55, zi]}>
            <boxGeometry args={[0.2, 1.3, 3.0]} />
            <meshStandardMaterial color="#3a2f28" />
          </mesh>
        </RigidBody>
      ))}

      {/* Umpiseinä ikkunan ja päädyn väliin jääneeseen rakoon. */}
      {[-18, 18].map((zi) => (
        <RigidBody key={`rako-${zi}`} type="fixed" colliders="cuboid">
          <mesh position={[x, 1.55, zi]}>
            <boxGeometry args={[0.2, 1.3, 2.0]} />
            <meshStandardMaterial color="#3a2f28" />
          </mesh>
        </RigidBody>
      ))}

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
          <mesh position={[x, 1.55, zi]}>
            <boxGeometry args={[0.1, 1.3, 3.0]} />
            <meshStandardMaterial color="#0a0a14" transparent opacity={0.4} roughness={0.1} metalness={0} />
          </mesh>
        </RigidBody>
      ))}

      {/* Ikkunakehykset. */}
      {ikkunat.map((zi) => (
        <group key={`kehys-${zi}`}>
          <mesh position={[x + 0.06, 0.9, zi]}>
            <boxGeometry args={[0.1, 0.08, 3.0]} />
            <meshStandardMaterial color="#4a4038" roughness={0.6} metalness={0.3} />
          </mesh>
          <mesh position={[x + 0.06, 2.2, zi]}>
            <boxGeometry args={[0.1, 0.08, 3.0]} />
            <meshStandardMaterial color="#4a4038" roughness={0.6} metalness={0.3} />
          </mesh>
          {[-1.5, 1.5].map((rz) => (
            <mesh key={rz} position={[x + 0.06, 1.55, zi + rz]}>
              <boxGeometry args={[0.1, 1.3, 0.1]} />
              <meshStandardMaterial color="#4a4038" roughness={0.6} metalness={0.3} />
            </mesh>
          ))}
        </group>
      ))}
    </group>
  )
}

// Oikea ulkoseinä ikkuna-aukkoineen. Jokaisen hytin kohdalle jää ikkuna-aukko
// (kuten muissa vaunuissa: palkit + lasi + kehys), muuten umpiseinä.
// hytit = lista hyttien z-keskikohtia.
function UlkoSeinaIkkunoilla({ hytit }) {
  const x = 3
  const hyttiLeveys = 34 / hytit.length
  // Ikkuna-aukon leveys (z-suunnassa). Lasi ja kehys ovat tämän kokoiset.
  const aukko = 1.5

  return (
    <group>
      {/* Ala- ja yläreuna koko pituudelta. */}
      <mesh position={[x, 0.55, 0]}>
        <boxGeometry args={[0.2, 1.1, PITUUS]} />
        <meshStandardMaterial color="#2e2620" roughness={0.85} />
      </mesh>
      <RigidBody type="fixed" colliders="cuboid">
        <mesh position={[x, 2.55, 0]}>
          <boxGeometry args={[0.2, 0.9, PITUUS]} />
          <meshStandardMaterial color="#2e2620" roughness={0.85} />
        </mesh>
      </RigidBody>

      {/* Umpiseinäpalat ikkuna-aukon molemmin puolin jokaisessa hytissä, niin
          että keskelle jää tasan aukon (1.5) levyinen ikkunareikä. */}
      {hytit.map((hz, i) => {
        const palaLeveys = (hyttiLeveys - aukko) / 2
        const palaKeski = aukko / 2 + palaLeveys / 2
        return (
          <group key={`umpi-${i}`}>
            {[-1, 1].map((puoli) => (
              <RigidBody key={puoli} type="fixed" colliders="cuboid">
                <mesh position={[x, 1.55, hz + puoli * palaKeski]}>
                  <boxGeometry args={[0.2, 1.3, palaLeveys]} />
                  <meshStandardMaterial color="#2e2620" roughness={0.85} />
                </mesh>
              </RigidBody>
            ))}
          </group>
        )
      })}
      {/* Päädyt (hyttialueen ulkopuoli). */}
      {[-20.5, 20.5].map((zi) => (
        <RigidBody key={zi} type="fixed" colliders="cuboid">
          <mesh position={[x, 1.55, zi]}>
            <boxGeometry args={[0.2, 1.3, 3.0]} />
            <meshStandardMaterial color="#2e2620" roughness={0.85} />
          </mesh>
        </RigidBody>
      ))}
      {/* Umpiseinä uloimpien hyttien reunan (z=±17) ja päätyjen väliin,
          jottei jää outoa ikkunarakoa. */}
      {[-18, 18].map((zi) => (
        <RigidBody key={`taytto-${zi}`} type="fixed" colliders="cuboid">
          <mesh position={[x, 1.55, zi]}>
            <boxGeometry args={[0.2, 1.3, 2.0]} />
            <meshStandardMaterial color="#2e2620" roughness={0.85} />
          </mesh>
        </RigidBody>
      ))}

      {/* Ikkunalasit hyttien kohdalle (aukon kokoiset, 1.5). RigidBody estää
          läpikävelyn ulkoseinän ikkuna-aukosta. */}
      {hytit.map((hz, i) => (
        <RigidBody key={`lasi-${i}`} type="fixed" colliders="cuboid">
          <mesh position={[x, 1.55, hz]}>
            <boxGeometry args={[0.1, 1.3, aukko]} />
            <meshStandardMaterial
              color="#0a1420"
              emissive="#0a1830"
              emissiveIntensity={0.4}
              transparent
              opacity={0.6}
              roughness={0.1}
            />
          </mesh>
        </RigidBody>
      ))}

      {/* Ikkunakehykset hyttien kohdalle (aukon reunoille). */}
      {hytit.map((hz, i) => (
        <group key={`kehys-${i}`}>
          <mesh position={[x - 0.06, 0.9, hz]}>
            <boxGeometry args={[0.1, 0.08, aukko + 0.1]} />
            <meshStandardMaterial color="#4a4038" roughness={0.6} metalness={0.3} />
          </mesh>
          <mesh position={[x - 0.06, 2.2, hz]}>
            <boxGeometry args={[0.1, 0.08, aukko + 0.1]} />
            <meshStandardMaterial color="#4a4038" roughness={0.6} metalness={0.3} />
          </mesh>
          {[-aukko / 2, aukko / 2].map((rz) => (
            <mesh key={rz} position={[x - 0.06, 1.55, hz + rz]}>
              <boxGeometry args={[0.1, 1.3, 0.1]} />
              <meshStandardMaterial color="#4a4038" roughness={0.6} metalness={0.3} />
            </mesh>
          ))}
        </group>
      ))}
    </group>
  )
}

// Hytin ovi käytäväseinässä. Käyttää samoja mittoja kuin vaunun päätyovi
// (aukko 1.4 leveä, 2.4 korkea, ovilevy 1.4x2.4x0.1, collideri poistuu kun
// auki), saranat ja kahva kuten muissakin ovissa. Ovi on käännetty z-suuntaan:
// sarana -z-reunalla, ovi kääntyy hytin sisälle vasenta (-z) seinää vasten.
function HyttiOvi({ worldZ }) {
  const pelaajanPaikka = usePelaajanPaikka()
  const ovilevy = useRef()
  const [auki, setAuki] = useState(false)
  const [lahella, setLahella] = useState(false)
  const aukeama = useRef(0)

  useEffect(() => {
    const nappain = (e) => {
      if (e.key.toLowerCase() === 'e' && lahella) setAuki((v) => !v)
    }
    window.addEventListener('keydown', nappain)
    return () => window.removeEventListener('keydown', nappain)
  }, [lahella])

  useFrame((state, delta) => {
    const dz = Math.abs(pelaajanPaikka.z - worldZ)
    const dx = Math.abs(pelaajanPaikka.x - (KAYTAVA_SEINA - 0.5))
    const nytLahella = dz < 1.4 && dx < 1.6
    if (nytLahella !== lahella) setLahella(nytLahella)

    const tavoite = auki ? 1 : 0
    aukeama.current += (tavoite - aukeama.current) * delta * 5
    if (ovilevy.current) {
      ovilevy.current.rotation.y = aukeama.current * 1.75
    }
  })

  // Ovi käytäväseinässä. Aukko z-suunnassa.
  return (
    <group position={[KAYTAVA_SEINA, 0, 0]}>
      {/* Collideri koko oviaukon kohdalla, poistuu kun ovi auki. */}
      {!auki && (
        <CuboidCollider args={[0.1 / 2, 2.4 / 2, 1.4 / 2]} position={[0, 1.2, 0]} type="fixed" />
      )}

      {/* Saranat -z-reunassa (samat kuin vaunujen väliovissa). */}
      {[0.4, 1.2, 2.0].map((sy) => (
        <mesh key={sy} position={[0.06, sy, -0.7]}>
          <cylinderGeometry args={[0.04, 0.04, 0.18, 10]} />
          <meshStandardMaterial color="#4a4a52" metalness={0.8} roughness={0.3} />
        </mesh>
      ))}

      {/* Saranasta (-z-reuna) kääntyvä ovilevy. Sama rakenne kuin vaunujen
          väliovissa (ikkuna kehyksineen, kahva kiinnikkeineen, alalista),
          mutta käännettynä z-suuntaan. */}
      <group ref={ovilevy} position={[0, 1.2, -0.7]}>
        <group position={[0, 0, 0.7]}>
          {/* Oven runko */}
          <mesh>
            <boxGeometry args={[0.1, 2.4, 1.4]} />
            <meshStandardMaterial color="#3a3a45" metalness={0.6} roughness={0.4} />
          </mesh>

          {/* --- Molemmat puolet (x + ja -) --- */}
          {[1, -1].map((sivu) => (
            <group key={sivu}>
              {/* Ikkuna */}
              <mesh position={[sivu * 0.02, 0.55, 0]}>
                <boxGeometry args={[0.08, 0.9, 0.9]} />
                <meshStandardMaterial color="#0a0a14" transparent opacity={0.5} roughness={0.1} />
              </mesh>
              {/* Ikkunan kehys */}
              <mesh position={[sivu * 0.04, 0.55, 0]}>
                <boxGeometry args={[0.04, 1.0, 1.0]} />
                <meshStandardMaterial color="#26262e" metalness={0.5} roughness={0.5} />
              </mesh>
              <mesh position={[sivu * 0.05, 0.55, 0]}>
                <boxGeometry args={[0.02, 0.88, 0.88]} />
                <meshStandardMaterial color="#0a0e18" transparent opacity={0.45} roughness={0.1} />
              </mesh>
              {/* Pystykahva (kaukana saranasta, +z-reunalla) */}
              <mesh position={[sivu * 0.08, -0.1, 0.5]}>
                <cylinderGeometry args={[0.03, 0.03, 0.5, 8]} />
                <meshStandardMaterial color="#6a6a72" metalness={0.8} roughness={0.3} />
              </mesh>
              {/* Kahvan kiinnikkeet */}
              <mesh position={[sivu * 0.05, 0.13, 0.5]} rotation={[0, 0, Math.PI / 2]}>
                <cylinderGeometry args={[0.02, 0.02, 0.08, 8]} />
                <meshStandardMaterial color="#6a6a72" metalness={0.8} roughness={0.3} />
              </mesh>
              <mesh position={[sivu * 0.05, -0.33, 0.5]} rotation={[0, 0, Math.PI / 2]}>
                <cylinderGeometry args={[0.02, 0.02, 0.08, 8]} />
                <meshStandardMaterial color="#6a6a72" metalness={0.8} roughness={0.3} />
              </mesh>
            </group>
          ))}

          {/* Alareunan lista */}
          <mesh position={[0, -1.05, 0]}>
            <boxGeometry args={[0.06, 0.15, 1.4]} />
            <meshStandardMaterial color="#26262e" metalness={0.5} roughness={0.5} />
          </mesh>
        </group>
      </group>

      {/* Kehote kun lähellä. */}
      {lahella && !auki && (
        <Html position={[-0.3, 1.2, 0]} center>
          <div className="ovi-kehote">Paina E</div>
        </Html>
      )}
    </group>
  )
}

// Yksi hytti oikealla puolella. z = hytin keskikohta, leveys = hytin koko
// z-suunnassa. Hyttiin tullaan käytävältä (vasemmalta, x=KAYTAVA_SEINA).
//
// Pohja (katsottuna käytävältä hyttiin, +x-suuntaan):
// - Ovesta tullessa heti oikealla (+z) pieni vessakoppi omalla ovella
//   (pönttö + pieni lavuaari), johon mahtuu just sisään.
// - Kerrossänky vessan väliseinän jälkeen +z-sivuseinää vasten, sängyt
//   x-suunnassa (pää ikkunalla, jalkopää vessan kohdalla).
// - Pöytä, tuoli ja ikkuna ulkoseinällä (x=3), suoraan oven vastapäätä.
// - -z-sivu vapaata kulkutilaa, jota vasten hytin ovi aukeaa.
function Hytti({ z, leveys, vaununZ }) {
  const seinaVari = '#2a2320'
  const puolileveys = leveys / 2
  const aukkoPuoli = 0.7

  // Kalusteiden +z-reuna (sivuseinän vieressä).
  const sivuZ = puolileveys - 0.45

  return (
    <group position={[0, 0, z]}>
      {/* ===== VÄLISEINÄT hyttien välissä (z-reunoilla) ===== */}
      {[-1, 1].map((puoli) => (
        <RigidBody key={puoli} type="fixed" colliders="cuboid">
          <mesh position={[(KAYTAVA_SEINA + 3) / 2, 1.5, puoli * puolileveys]}>
            <boxGeometry args={[3 - KAYTAVA_SEINA, 3, 0.1]} />
            <meshStandardMaterial color={seinaVari} metalness={0.2} roughness={0.8} />
          </mesh>
        </RigidBody>
      ))}

      {/* ===== KÄYTÄVÄSEINÄ + OVIAUKKO ===== */}
      {/* Yläpuoli koko leveydeltä. */}
      <RigidBody type="fixed" colliders="cuboid">
        <mesh position={[KAYTAVA_SEINA, 2.7, 0]}>
          <boxGeometry args={[0.12, 0.6, leveys]} />
          <meshStandardMaterial color={seinaVari} metalness={0.2} roughness={0.8} />
        </mesh>
      </RigidBody>
      {/* Seinäpalat oviaukon molemmin puolin (aukko keskellä, leveys 1.4). */}
      {[-1, 1].map((puoli) => {
        const palaLeveys = puolileveys - aukkoPuoli
        const palaKeski = puoli * (aukkoPuoli + palaLeveys / 2)
        return (
          <RigidBody key={puoli} type="fixed" colliders="cuboid">
            <mesh position={[KAYTAVA_SEINA, 1.5, palaKeski]}>
              <boxGeometry args={[0.12, 3, palaLeveys]} />
              <meshStandardMaterial color={seinaVari} metalness={0.2} roughness={0.8} />
            </mesh>
          </RigidBody>
        )
      })}

      {/* Hytin aukeava ovi (E), saranat ja kahva. */}
      <HyttiOvi worldZ={vaununZ + z} />

      {/* ===== VESSAKOPPI heti oikealla ovea, hytin +z-nurkassa ===== */}
      {/* Vessa on nurkassa jossa on jo kaksi seinää: hytin +z-sivuseinä ja
          käytäväseinä (x=KAYTAVA_SEINA). Tarvitaan vain yksi väliseinä joka
          erottaa vessan hytin kulkutilasta, sekä vessan ovi. Seinä yltää
          kattoon (korkeus 3). Koppi ulottuu käytäväseinästä x-suunnassa noin
          1.1, z-suunnassa hytin +z-sivuseinästä noin 1.1. */}
      {(() => {
        // Vessa +z-nurkassa: käytäväseinästä sängyn jalkopäähän (x=-1.5..0.4),
        // hytin +z-sivuseinää vasten. Ovi vessan -z-seinässä (aukeaa hyttiin).
        const koppiXpaa = 0.4          // sängyn jalkopää, vessan hyttipuolen reuna
        const koppiZsisa = 0.72 // vessan -z-seinä hytin oviaukon oikealla reunalla
        const oviLeveys = 0.9
        // Oviaukko -z-seinässä käytäväpäässä. -z-seinä jaetaan: oviaukko +
        // umpipala sängyn puolelle.
        const seinaAlku = KAYTAVA_SEINA
        const oviLoppu = seinaAlku + oviLeveys
        const umpiKeski = (oviLoppu + koppiXpaa) / 2
        const umpiLeveys = koppiXpaa - oviLoppu
        return (
          <group>
            {/* Vessan -z-seinä: umpipala sängyn puolella (oviaukko käytäväpäässä). */}
            <RigidBody type="fixed" colliders="cuboid">
              <mesh position={[umpiKeski, 1.5, koppiZsisa]}>
                <boxGeometry args={[umpiLeveys, 3, 0.08]} />
                <meshStandardMaterial color="#353029" roughness={0.8} />
              </mesh>
            </RigidBody>
            {/* -z-seinän yläpala oviaukon päällä. */}
            <RigidBody type="fixed" colliders="cuboid">
              <mesh position={[(seinaAlku + oviLoppu) / 2, 2.55, koppiZsisa]}>
                <boxGeometry args={[oviLeveys, 0.9, 0.08]} />
                <meshStandardMaterial color="#353029" roughness={0.8} />
              </mesh>
            </RigidBody>
            {/* Vessan hyttipuolen seinä (x=koppiXpaa), -z-seinästä sivuseinään. */}
            <RigidBody type="fixed" colliders="cuboid">
              <mesh position={[koppiXpaa, 1.5, (koppiZsisa + puolileveys) / 2]}>
                <boxGeometry args={[0.08, 3, puolileveys - koppiZsisa]} />
                <meshStandardMaterial color="#353029" roughness={0.8} />
              </mesh>
            </RigidBody>

            {/* Vessan ovi -z-seinässä (käytäväpäässä), sama tyyli kuin muissa
                vessoissa: runko, ikkuna, vetokahvat. Aukko x-suunnassa. */}
            <group position={[(seinaAlku + oviLoppu) / 2, 1.15, koppiZsisa]}>
              <mesh>
                <boxGeometry args={[oviLeveys, 2.2, 0.06]} />
                <meshStandardMaterial color="#3a3a45" metalness={0.6} roughness={0.4} />
              </mesh>
              {/* Ikkuna molemmin puolin */}
              <mesh position={[0, 0.35, 0.03]}>
                <boxGeometry args={[0.5, 0.6, 0.04]} />
                <meshStandardMaterial color="#0a0a14" transparent opacity={0.5} roughness={0.1} />
              </mesh>
              <mesh position={[0, 0.35, -0.03]}>
                <boxGeometry args={[0.5, 0.6, 0.04]} />
                <meshStandardMaterial color="#0a0a14" transparent opacity={0.5} roughness={0.1} />
              </mesh>
              {/* Vetokahvat molemmin puolin */}
              <mesh position={[0.28, -0.05, 0.05]}>
                <boxGeometry args={[0.06, 0.28, 0.04]} />
                <meshStandardMaterial color="#6a6a72" metalness={0.8} roughness={0.3} />
              </mesh>
              <mesh position={[0.28, -0.05, -0.05]}>
                <boxGeometry args={[0.06, 0.28, 0.04]} />
                <meshStandardMaterial color="#6a6a72" metalness={0.8} roughness={0.3} />
              </mesh>
            </group>

            {/* Pönttö sivuseinää vasten. */}
            <mesh position={[-0.1, 0.28, sivuZ - 0.1]}>
              <boxGeometry args={[0.4, 0.56, 0.4]} />
              <meshStandardMaterial color="#c8c8cc" roughness={0.3} />
            </mesh>
            {/* Pieni lavuaari. */}
            <mesh position={[koppiXpaa - 0.25, 0.85, sivuZ - 0.1]}>
              <boxGeometry args={[0.3, 0.12, 0.3]} />
              <meshStandardMaterial color="#d0d0d4" roughness={0.3} metalness={0.2} />
            </mesh>
          </group>
        )
      })()}

      {/* ===== KERROSSÄNKY vessan jälkeen, +z-sivuseinää vasten ===== */}
      {/* Sängyt x-suunnassa. Pää ikkunalla (x=2.6), jalkopää vessan kohdalla (x=0.6). */}
      {[0.55, 1.65].map((sy, i) => (
        <RigidBody key={i} type="fixed" colliders="cuboid">
          <group position={[1.5, sy, sivuZ]}>
            <mesh castShadow>
              <boxGeometry args={[2.2, 0.16, 0.75]} />
              <meshStandardMaterial color={i === 0 ? '#4a3a4a' : '#3a4a4a'} roughness={0.85} />
            </mesh>
            {/* Tyyny ikkunan päässä */}
            <mesh position={[0.85, 0.13, 0]}>
              <boxGeometry args={[0.4, 0.12, 0.55]} />
              <meshStandardMaterial color="#8a8288" roughness={0.9} />
            </mesh>
          </group>
        </RigidBody>
      ))}
      {/* Sängyn pystytolpat jalkopäässä. */}
      {[-0.3, 0.3].map((tz, i) => (
        <mesh key={i} position={[0.45, 1.15, sivuZ + tz]}>
          <boxGeometry args={[0.06, 2.3, 0.06]} />
          <meshStandardMaterial color="#2a2420" metalness={0.4} roughness={0.5} />
        </mesh>
      ))}

      {/* ===== PÖYTÄ JA TUOLI ulkoseinällä (x=3), oven vastapäätä (z=0), -z-puolella ===== */}
      <RigidBody type="fixed" colliders="cuboid">
        <group position={[2.5, 0, -0.6]}>
          <mesh position={[0, 0.72, 0]}>
            <boxGeometry args={[0.6, 0.05, 0.6]} />
            <meshStandardMaterial color="#5a4a3a" roughness={0.6} metalness={0.1} />
          </mesh>
          <mesh position={[0, 0.36, 0]}>
            <boxGeometry args={[0.08, 0.72, 0.08]} />
            <meshStandardMaterial color="#2a2420" metalness={0.4} roughness={0.5} />
          </mesh>
        </group>
      </RigidBody>
      <RigidBody type="fixed" colliders="cuboid">
        <group position={[1.9, 0, -0.6]}>
          <mesh position={[0, 0.45, 0]}>
            <boxGeometry args={[0.4, 0.08, 0.4]} />
            <meshStandardMaterial color="#3a2e2e" roughness={0.85} />
          </mesh>
          <mesh position={[-0.16, 0.7, 0]}>
            <boxGeometry args={[0.08, 0.5, 0.4]} />
            <meshStandardMaterial color="#3a2e2e" roughness={0.85} />
          </mesh>
        </group>
      </RigidBody>
    </group>
  )
}

// Umpinainen päätyseinä (ensimmäisen vaunun takapäähän).
function Paatyseina({ z }) {
  return (
    <group position={[0, 0, z]}>
      <RigidBody type="fixed" colliders="cuboid">
        <mesh position={[-1.85, 1.5, 0]}>
          <boxGeometry args={[2.3, 3, 0.2]} />
          <meshStandardMaterial color="#2a2320" metalness={0.3} roughness={0.7} />
        </mesh>
      </RigidBody>
      <RigidBody type="fixed" colliders="cuboid">
        <mesh position={[1.85, 1.5, 0]}>
          <boxGeometry args={[2.3, 3, 0.2]} />
          <meshStandardMaterial color="#2a2320" metalness={0.3} roughness={0.7} />
        </mesh>
      </RigidBody>
      <RigidBody type="fixed" colliders="cuboid">
        <mesh position={[0, 2.7, 0]}>
          <boxGeometry args={[1.4, 0.6, 0.2]} />
          <meshStandardMaterial color="#2a2320" metalness={0.3} roughness={0.7} />
        </mesh>
      </RigidBody>
    </group>
  )
}

// Makuuvaunu: kapea käytävä ja ikkunat vasemmalla, syvät hytit oikealla.
// Jokaisessa hytissä vessakoppi, kerrossänky, pöytä, tuoli ja ikkuna. Eteiset
// molemmissa päissä, oviaukko vasemmalla käytävän kohdalla.
export function MakuuVaunu({ z, eka = false }) {
  const hyttiMaara = 11
  const hyttiAlue = 34
  const hyttiLeveys = hyttiAlue / hyttiMaara
  const hytit = []
  for (let i = 0; i < hyttiMaara; i++) {
    hytit.push(-hyttiAlue / 2 + hyttiLeveys / 2 + i * hyttiLeveys)
  }

  const kaytavaX = -2.25

  return (
    <group position={[0, 0, z]}>
      {/* Lattia */}
      <RigidBody type="fixed" colliders="cuboid">
        <mesh position={[0, 0, 0]} receiveShadow>
          <boxGeometry args={[6, 0.2, PITUUS]} />
          <meshStandardMaterial color="#241d19" />
        </mesh>
      </RigidBody>

      {/* Käytävämatto vasemmalla, sama tyyli kuin vaunun keskikäytävällä:
          kulunut keskiraita, vaaleat reunalistat ja tummat pituusraidat.
          Siirretty vasemmalle käytävän keskikohtaan (kaytavaX). */}
      <mesh position={[kaytavaX, 0.102, 0]} receiveShadow>
        <boxGeometry args={[1.4, 0.012, PITUUS]} />
        <meshStandardMaterial color="#1a1512" roughness={1} />
      </mesh>
      {/* Reunalistat (vaaleat metallireunukset). */}
      {[kaytavaX - 0.68, kaytavaX + 0.68].map((rx) => (
        <mesh key={`lista-${rx}`} position={[rx, 0.108, 0]}>
          <boxGeometry args={[0.06, 0.012, PITUUS]} />
          <meshStandardMaterial color="#3a3a40" roughness={0.5} metalness={0.5} />
        </mesh>
      ))}
      {/* Pituussuuntaiset raidat. */}
      {[kaytavaX - 0.35, kaytavaX, kaytavaX + 0.35].map((rx) => (
        <mesh key={`raita-${rx}`} position={[rx, 0.109, 0]}>
          <boxGeometry args={[0.02, 0.012, PITUUS]} />
          <meshStandardMaterial color="#0f0c0a" roughness={1} />
        </mesh>
      ))}

      {/* Katto */}
      <RigidBody type="fixed" colliders="cuboid">
        <mesh position={[0, 3, 0]}>
          <boxGeometry args={[6, 0.2, PITUUS]} />
          <meshStandardMaterial color="#1a1512" />
        </mesh>
      </RigidBody>

      {/* Tämän vaunun oma varjoja heittävä valo. */}
      <VaunuValo />

      {/* Kattolamput käytävän yllä. */}
      <pointLight position={[kaytavaX, 2.7, -11]} intensity={22} distance={24} color="#ffd8a8" />
      <pointLight position={[kaytavaX, 2.7, 11]} intensity={22} distance={24} color="#ffd8a8" />

      {/* Näkyvät kattovalaisimet. */}
      {[-11, 11].map((lz) => (
        <mesh key={lz} position={[kaytavaX, 2.9, lz]}>
          <boxGeometry args={[0.6, 0.1, 0.4]} />
          <meshStandardMaterial color="#ffe8c0" emissive="#ffd8a0" emissiveIntensity={1.5} roughness={0.3} />
        </mesh>
      ))}

      {/* Vasen ikkunaseinä (käytävän puoli). */}
      <IkkunaSeinaVasen />

      {/* Oikea ulkoseinä ikkuna-aukkoineen (aukko jokaisen hytin kohdalle). */}
      <UlkoSeinaIkkunoilla hytit={hytit} />

      {/* Hytit oikealla puolella. */}
      {hytit.map((hz, i) => (
        <Hytti key={i} z={hz} leveys={hyttiLeveys} vaununZ={z} />
      ))}

      {/* Etuovi (kohti edellistä vaunua). */}
      <Ovi z={-PITUUS / 2} worldZ={z - PITUUS / 2} avautumissuunta={-1} />

      {/* Takaovi tai päätyseinä. */}
      {eka ? (
        <Paatyseina z={PITUUS / 2} />
      ) : (
        <Ovi z={PITUUS / 2} worldZ={z + PITUUS / 2} avautumissuunta={1} />
      )}

      {/* Välikkö (eteinen) molemmissa päädyissä. Oviaukko vasemmalla
          käytävän kohdalla. */}
      {[-1, 1].map((suunta) => {
        const valikkoZ = suunta * 19.5
        const valiseinaZ = valikkoZ - suunta * 1.4
        return (
          <group key={suunta}>
            {/* Oikea seinäpala (oviaukon oikea puoli ulkoseinään). */}
            <RigidBody type="fixed" colliders={false}>
              <mesh position={[0.75, 1.5, valiseinaZ]}>
                <boxGeometry args={[4.5, 3, 0.2]} />
                <meshStandardMaterial color="#2a2320" metalness={0.3} roughness={0.7} />
              </mesh>
              <CuboidCollider args={[2.25, 1.5, 0.1]} position={[0.75, 1.5, valiseinaZ]} />
            </RigidBody>
            {/* Vasen seinäpala (oviaukon vasen puoli ulkoseinään). */}
            <RigidBody type="fixed" colliders={false}>
              <mesh position={[-2.85, 1.5, valiseinaZ]}>
                <boxGeometry args={[0.3, 3, 0.2]} />
                <meshStandardMaterial color="#2a2320" metalness={0.3} roughness={0.7} />
              </mesh>
              <CuboidCollider args={[0.15, 1.5, 0.1]} position={[-2.85, 1.5, valiseinaZ]} />
            </RigidBody>
            {/* Yläpala oviaukon päällä (täyttää aukon tasan, ei rakoa). */}
            <RigidBody type="fixed" colliders={false}>
              <mesh position={[-2.1, 2.7, valiseinaZ]}>
                <boxGeometry args={[1.2, 0.6, 0.2]} />
                <meshStandardMaterial color="#2a2320" metalness={0.3} roughness={0.7} />
              </mesh>
              <CuboidCollider args={[0.6, 0.3, 0.1]} position={[-2.1, 2.7, valiseinaZ]} />
            </RigidBody>
            {/* Oviaukon kehyslistat (aukon reunoilla x=-2.7 ja -1.5). */}
            <mesh position={[-2.7, 1.2, valiseinaZ]}>
              <boxGeometry args={[0.08, 2.4, 0.24]} />
              <meshStandardMaterial color="#6a6a72" metalness={0.5} roughness={0.5} />
            </mesh>
            <mesh position={[-1.5, 1.2, valiseinaZ]}>
              <boxGeometry args={[0.08, 2.4, 0.24]} />
              <meshStandardMaterial color="#6a6a72" metalness={0.5} roughness={0.5} />
            </mesh>

            {/* Ulko-ovet molemmilla sivuseinillä. */}
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
    </group>
  )
}
