import { useFrame } from '@react-three/fiber'
import { useRef, useState, useEffect, useMemo, useLayoutEffect } from 'react'
import { RigidBody, CuboidCollider } from '@react-three/rapier'
import { Html } from '@react-three/drei'
import { Ovi } from './Ovi'
import { VaunuValo } from './VaunuValo'
import { usePelaajanPaikka } from '../hooks/usePelaajanPaikka'
import * as THREE from 'three'

// Käytäväseinän x-sijainti. Käytävä on kapea vasemmalla (x -3..-1.5) ja hytit
// syvät oikealla (x -1.5..3, syvyys 4.5). Määritelty ennen geometrioita, koska
// osa geometrioista käyttää tätä.
const KAYTAVA_SEINA = -1.5

// Jaetut materiaalit ja geometriat. Hytti toistuu 11 kertaa per vaunu ja
// makuuvaunuja on kuusi, joten ilman jakoa syntyisi tuhansia identtisiä
// materiaaleja ja geometrioita. Nyt kaikki hytit käyttävät samoja, mikä
// keventää muistia ja poistaa nykimisen kun vaunu tulee näkyviin.
const mSeina = new THREE.MeshStandardMaterial({ color: '#3a2f28' })
const mSeinaRuskea = new THREE.MeshStandardMaterial({ color: '#2e2620', roughness: 0.85 })
const mPaaty = new THREE.MeshStandardMaterial({ color: '#2a2320', metalness: 0.3, roughness: 0.7 })
const mHytinSeina = new THREE.MeshStandardMaterial({ color: '#353029', roughness: 0.8 })
const mKehys = new THREE.MeshStandardMaterial({ color: '#4a4038', roughness: 0.6, metalness: 0.3 })
const mKehysB = new THREE.MeshStandardMaterial({ color: '#4a4038', metalness: 0.4, roughness: 0.6 })
const mMetalliListaa = new THREE.MeshStandardMaterial({ color: '#26262e', metalness: 0.5, roughness: 0.5 })
const mKahva = new THREE.MeshStandardMaterial({ color: '#6a6a72', metalness: 0.8, roughness: 0.3 })
const mListaKirkas = new THREE.MeshStandardMaterial({ color: '#6a6a72', metalness: 0.5, roughness: 0.5 })
const mLasiTumma = new THREE.MeshStandardMaterial({ color: '#0a0a14', transparent: true, opacity: 0.5, roughness: 0.1 })
const mOvirunko = new THREE.MeshStandardMaterial({ color: '#3a3a45', metalness: 0.6, roughness: 0.4 })

// Hyttien jaetut materiaalit ja geometriat (instansointia varten).
const mSeinaVari = new THREE.MeshStandardMaterial({ color: '#2a2320', metalness: 0.2, roughness: 0.8 })
const mPonttö = new THREE.MeshStandardMaterial({ color: '#c8c8cc', roughness: 0.3 })
const mLavuaari = new THREE.MeshStandardMaterial({ color: '#d0d0d4', roughness: 0.3, metalness: 0.2 })
const mSankyAla = new THREE.MeshStandardMaterial({ color: '#4a3a4a', roughness: 0.85 })
const mSankyYla = new THREE.MeshStandardMaterial({ color: '#3a4a4a', roughness: 0.85 })
const mTyyny = new THREE.MeshStandardMaterial({ color: '#8a8288', roughness: 0.9 })
const mTolppa = new THREE.MeshStandardMaterial({ color: '#2a2420', metalness: 0.4, roughness: 0.5 })
const mPoyta = new THREE.MeshStandardMaterial({ color: '#5a4a3a', roughness: 0.6, metalness: 0.1 })
const mTuoli = new THREE.MeshStandardMaterial({ color: '#3a2e2e', roughness: 0.85 })

// Geometriat jaetaan; hyttileveys 34/11 on vakio, joten leveydestä riippuvat
// mitat ovat samat kaikille hyteille.
const HYTTI_LEVEYS = 34 / 11
const HYTTI_PUOLI = HYTTI_LEVEYS / 2
const valiseinaGeo = new THREE.BoxGeometry(3 - KAYTAVA_SEINA, 3, 0.1)
const kaytavaYlaGeo = new THREE.BoxGeometry(0.12, 0.6, HYTTI_LEVEYS)
const kaytavaPalaGeo = new THREE.BoxGeometry(0.12, 3, HYTTI_PUOLI - 0.7)
const vessaZseinaGeo = new THREE.BoxGeometry(1.0, 3, 0.08)
const vessaYlaGeo = new THREE.BoxGeometry(0.9, 0.9, 0.08)
const vessaSivuGeo = new THREE.BoxGeometry(0.08, 3, HYTTI_PUOLI - 0.72)
const vessaOviGeo = new THREE.BoxGeometry(0.9, 2.2, 0.06)
const vessaLasiGeo = new THREE.BoxGeometry(0.5, 0.6, 0.04)
const vessaKahvaGeo = new THREE.BoxGeometry(0.06, 0.28, 0.04)
const ponttoGeo = new THREE.BoxGeometry(0.4, 0.56, 0.4)
const lavuaariGeo = new THREE.BoxGeometry(0.3, 0.12, 0.3)
const sankyGeo = new THREE.BoxGeometry(2.2, 0.16, 0.75)
const tyynyGeo = new THREE.BoxGeometry(0.4, 0.12, 0.55)
const tolppaGeo = new THREE.BoxGeometry(0.06, 2.3, 0.06)
const poytaTasoGeo = new THREE.BoxGeometry(0.6, 0.05, 0.6)
const poytaJalkaGeo = new THREE.BoxGeometry(0.08, 0.72, 0.08)
const tuoliIstuinGeo = new THREE.BoxGeometry(0.4, 0.08, 0.4)
const tuoliSelkaGeo = new THREE.BoxGeometry(0.08, 0.5, 0.4)



// Makuuvaunun pituus, sama kuin muilla vaunuilla.
const PITUUS = 44

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
       <mesh material={mSeina} position={[x, 0.3, 0]}><boxGeometry args={[0.2, 1.2, PITUUS]} /></mesh>

      {/* Yläreuna koko seinän pituudelta. */}
      <RigidBody type="fixed" colliders="cuboid">
        <mesh material={mSeina} position={[x, 2.6, 0]}><boxGeometry args={[0.2, 0.8, PITUUS]} /></mesh>
      </RigidBody>

      {/* Umpiseinä ensimmäisen ja viimeisen ikkunan ohi jäävien aukkojen kohdalle. */}
      {[-21, 21].map((zi) => (
        <RigidBody key={`umpi-${zi}`} type="fixed" colliders="cuboid">
          <mesh material={mSeina} position={[x, 1.55, zi]}><boxGeometry args={[0.2, 1.3, 3.0]} /></mesh>
        </RigidBody>
      ))}

      {/* Umpiseinä ikkunan ja päädyn väliin jääneeseen rakoon. */}
      {[-18, 18].map((zi) => (
        <RigidBody key={`rako-${zi}`} type="fixed" colliders="cuboid">
          <mesh material={mSeina} position={[x, 1.55, zi]}><boxGeometry args={[0.2, 1.3, 2.0]} /></mesh>
        </RigidBody>
      ))}

      {/* Pystypalkit ikkunoiden väleissä. */}
      {palkit.map((zi) => (
        <RigidBody key={zi} type="fixed" colliders="cuboid">
          <mesh material={mSeina} position={[x, 1.5, zi]}><boxGeometry args={[0.2, 3, 0.8]} /></mesh>
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
          <mesh material={mKehys} position={[x + 0.06, 0.9, zi]}><boxGeometry args={[0.1, 0.08, 3.0]} /></mesh>
          <mesh material={mKehys} position={[x + 0.06, 2.2, zi]}><boxGeometry args={[0.1, 0.08, 3.0]} /></mesh>
          {[-1.5, 1.5].map((rz) => (
            <mesh material={mKehys} key={rz} position={[x + 0.06, 1.55, zi + rz]}><boxGeometry args={[0.1, 1.3, 0.1]} /></mesh>
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
      <mesh material={mSeinaRuskea} position={[x, 0.55, 0]}><boxGeometry args={[0.2, 1.1, PITUUS]} /></mesh>
      <RigidBody type="fixed" colliders="cuboid">
        <mesh material={mSeinaRuskea} position={[x, 2.55, 0]}><boxGeometry args={[0.2, 0.9, PITUUS]} /></mesh>
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
                <mesh material={mSeinaRuskea} position={[x, 1.55, hz + puoli * palaKeski]}><boxGeometry args={[0.2, 1.3, palaLeveys]} /></mesh>
              </RigidBody>
            ))}
          </group>
        )
      })}
      {/* Päädyt (hyttialueen ulkopuoli). */}
      {[-20.5, 20.5].map((zi) => (
        <RigidBody key={zi} type="fixed" colliders="cuboid">
          <mesh material={mSeinaRuskea} position={[x, 1.55, zi]}><boxGeometry args={[0.2, 1.3, 3.0]} /></mesh>
        </RigidBody>
      ))}
      {/* Umpiseinä uloimpien hyttien reunan (z=±17) ja päätyjen väliin,
          jottei jää outoa ikkunarakoa. */}
      {[-18, 18].map((zi) => (
        <RigidBody key={`taytto-${zi}`} type="fixed" colliders="cuboid">
          <mesh material={mSeinaRuskea} position={[x, 1.55, zi]}><boxGeometry args={[0.2, 1.3, 2.0]} /></mesh>
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
          <mesh material={mKehys} position={[x - 0.06, 0.9, hz]}><boxGeometry args={[0.1, 0.08, aukko + 0.1]} /></mesh>
          <mesh material={mKehys} position={[x - 0.06, 2.2, hz]}><boxGeometry args={[0.1, 0.08, aukko + 0.1]} /></mesh>
          {[-aukko / 2, aukko / 2].map((rz) => (
            <mesh material={mKehys} key={rz} position={[x - 0.06, 1.55, hz + rz]}><boxGeometry args={[0.1, 1.3, 0.1]} /></mesh>
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
          <mesh material={mOvirunko}><boxGeometry args={[0.1, 2.4, 1.4]} /></mesh>

          {/* --- Molemmat puolet (x + ja -) --- */}
          {[1, -1].map((sivu) => (
            <group key={sivu}>
              {/* Ikkuna */}
              <mesh material={mLasiTumma} position={[sivu * 0.02, 0.55, 0]}><boxGeometry args={[0.08, 0.9, 0.9]} /></mesh>
              {/* Ikkunan kehys */}
              <mesh material={mMetalliListaa} position={[sivu * 0.04, 0.55, 0]}><boxGeometry args={[0.04, 1.0, 1.0]} /></mesh>
              <mesh position={[sivu * 0.05, 0.55, 0]}>
                <boxGeometry args={[0.02, 0.88, 0.88]} />
                <meshStandardMaterial color="#0a0e18" transparent opacity={0.45} roughness={0.1} />
              </mesh>
              {/* Pystykahva (kaukana saranasta, +z-reunalla) */}
              <mesh material={mKahva} position={[sivu * 0.08, -0.1, 0.5]}><cylinderGeometry args={[0.03, 0.03, 0.5, 8]} /></mesh>
              {/* Kahvan kiinnikkeet */}
              <mesh material={mKahva} position={[sivu * 0.05, 0.13, 0.5]} rotation={[0, 0, Math.PI / 2]}><cylinderGeometry args={[0.02, 0.02, 0.08, 8]} /></mesh>
              <mesh material={mKahva} position={[sivu * 0.05, -0.33, 0.5]} rotation={[0, 0, Math.PI / 2]}><cylinderGeometry args={[0.02, 0.02, 0.08, 8]} /></mesh>
            </group>
          ))}

          {/* Alareunan lista */}
          <mesh material={mMetalliListaa} position={[0, -1.05, 0]}><boxGeometry args={[0.06, 0.15, 1.4]} /></mesh>
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

// Yksi instansoitu osatyyppi (sama geometria ja materiaali monessa paikassa).
function InstanssiOsa({ geo, mat, matriisit, castShadow = false }) {
  const ref = useRef()
  useLayoutEffect(() => {
    if (!ref.current) return
    for (let i = 0; i < matriisit.length; i++) {
      ref.current.setMatrixAt(i, matriisit[i])
    }
    ref.current.instanceMatrix.needsUpdate = true
  }, [matriisit])
  return <instancedMesh ref={ref} args={[geo, mat, matriisit.length]} castShadow={castShadow} />
}

// Kaikkien hyttien staattiset osat instansoituna. Jokainen osatyyppi (seinä,
// sängyn patja, tolppa, vessan seinä jne) piirretään yhtenä InstancedMesh-
// objektina kaikille 11 hytille, ei erillisinä meshinä per hytti. Näin hyttien
// draw call -määrä putoaa murto-osaan. Animoituvat ovet ja törmäyslaatikot
// tehdään erikseen per hytti (Hytti-komponentissa), koska ne eivät ole samaa
// jaettavaa muotoa.
function Hytit({ hytit, leveys }) {
  const puolileveys = leveys / 2
  const aukkoPuoli = 0.7
  const sivuZ = puolileveys - 0.45

  // Kootaan osatyypeittäin: jokaiselle (geometria, materiaali) -parille lista
  // maailmamatriiseja (yksi per hytti).
  const ryhmat = useMemo(() => {
    const map = new Map()
    const yksi = new THREE.Vector3(1, 1, 1)
    const eiRot = new THREE.Quaternion()

    // Apufunktio: lisää yhden osan matriisi tietylle (geo,mat) -parille.
    const lisaa = (avain, geo, mat, x, y, z, castShadow = false) => {
      if (!map.has(avain)) map.set(avain, { geo, mat, castShadow, matriisit: [] })
      const m = new THREE.Matrix4().compose(new THREE.Vector3(x, y, z), eiRot, yksi)
      map.get(avain).matriisit.push(m)
    }

    for (const hz of hytit) {
      // Väliseinät hyttien välissä (z-reunoilla).
      for (const puoli of [-1, 1]) {
        lisaa('valiseina', valiseinaGeo, mSeinaVari, (KAYTAVA_SEINA + 3) / 2, 1.5, hz + puoli * puolileveys)
      }
      // Käytäväseinän yläpuoli.
      lisaa('kaytavaYla', kaytavaYlaGeo, mSeinaVari, KAYTAVA_SEINA, 2.7, hz)
      // Seinäpalat oviaukon molemmin puolin.
      const palaLeveys = puolileveys - aukkoPuoli
      for (const puoli of [-1, 1]) {
        const palaKeski = puoli * (aukkoPuoli + palaLeveys / 2)
        // Palan leveys vaihtelee vain jos leveys muuttuu; sama kaikille hyteille.
        lisaa('kaytavaPala', kaytavaPalaGeo, mSeinaVari, KAYTAVA_SEINA, 1.5, hz + palaKeski)
      }

      // Vessan seinät.
      const koppiXpaa = 0.4
      const koppiZsisa = 0.72
      const oviLeveys = 0.9
      const seinaAlku = KAYTAVA_SEINA
      const oviLoppu = seinaAlku + oviLeveys
      const umpiKeski = (oviLoppu + koppiXpaa) / 2
      lisaa('vessaZseina', vessaZseinaGeo, mHytinSeina, umpiKeski, 1.5, hz + koppiZsisa)
      lisaa('vessaYla', vessaYlaGeo, mHytinSeina, (seinaAlku + oviLoppu) / 2, 2.55, hz + koppiZsisa)
      lisaa('vessaSivu', vessaSivuGeo, mHytinSeina, koppiXpaa, 1.5, hz + (koppiZsisa + puolileveys) / 2)
      // Vessan ovi.
      lisaa('vessaOvi', vessaOviGeo, mOvirunko, (seinaAlku + oviLoppu) / 2, 1.15, hz + koppiZsisa)
      lisaa('vessaLasiA', vessaLasiGeo, mLasiTumma, (seinaAlku + oviLoppu) / 2, 1.5, hz + koppiZsisa + 0.03)
      lisaa('vessaLasiB', vessaLasiGeo, mLasiTumma, (seinaAlku + oviLoppu) / 2, 1.5, hz + koppiZsisa - 0.03)
      lisaa('vessaKahvaA', vessaKahvaGeo, mKahva, (seinaAlku + oviLoppu) / 2 + 0.28, 1.1, hz + koppiZsisa + 0.05)
      lisaa('vessaKahvaB', vessaKahvaGeo, mKahva, (seinaAlku + oviLoppu) / 2 + 0.28, 1.1, hz + koppiZsisa - 0.05)
      // Pönttö ja lavuaari.
      lisaa('ponttö', ponttoGeo, mPonttö, -0.1, 0.28, hz + sivuZ - 0.1)
      lisaa('lavuaari', lavuaariGeo, mLavuaari, koppiXpaa - 0.25, 0.85, hz + sivuZ - 0.1)

      // Kerrossänky: kaksi patjaa, tyynyt, tolpat.
      lisaa('sankyAla', sankyGeo, mSankyAla, 1.5, 0.55, hz + sivuZ, true)
      lisaa('sankyYla', sankyGeo, mSankyYla, 1.5, 1.65, hz + sivuZ, true)
      lisaa('tyynyA', tyynyGeo, mTyyny, 1.5 + 0.85, 0.68, hz + sivuZ)
      lisaa('tyynyB', tyynyGeo, mTyyny, 1.5 + 0.85, 1.78, hz + sivuZ)
      for (const tz of [-0.3, 0.3]) {
        lisaa('tolppa', tolppaGeo, mTolppa, 0.45, 1.15, hz + sivuZ + tz)
      }

      // Pöytä ja tuoli.
      lisaa('poytaTaso', poytaTasoGeo, mPoyta, 2.5, 0.72, hz - 0.6)
      lisaa('poytaJalka', poytaJalkaGeo, mTolppa, 2.5, 0.36, hz - 0.6)
      lisaa('tuoliIstuin', tuoliIstuinGeo, mTuoli, 1.9, 0.45, hz - 0.6)
      lisaa('tuoliSelka', tuoliSelkaGeo, mTuoli, 1.9 - 0.16, 0.7, hz - 0.6)
    }

    return [...map.values()]
  }, [hytit, leveys])

  return (
    <group>
      {ryhmat.map((r, i) => (
        <InstanssiOsa key={i} geo={r.geo} mat={r.mat} matriisit={r.matriisit} castShadow={r.castShadow} />
      ))}
    </group>
  )
}

function Hytti({ z, leveys, vaununZ }) {
  const puolileveys = leveys / 2
  const aukkoPuoli = 0.7
  const sivuZ = puolileveys - 0.45

  const koppiXpaa = 0.4
  const koppiZsisa = 0.72
  const palaLeveys = puolileveys - aukkoPuoli

  return (
    <group position={[0, 0, z]}>
      {/* Törmäykset. Visuaaliset osat piirtää instansoitu Hytit-komponentti;
          tässä vain colliderit ja aukeava ovi. */}

      {/* Väliseinät hyttien välissä. */}
      {[-1, 1].map((puoli) => (
        <CuboidCollider key={`vali-${puoli}`} args={[(3 - KAYTAVA_SEINA) / 2, 1.5, 0.05]} position={[(KAYTAVA_SEINA + 3) / 2, 1.5, puoli * puolileveys]} />
      ))}
      {/* Käytäväseinän yläpuoli. */}
      <CuboidCollider args={[0.06, 0.3, leveys / 2]} position={[KAYTAVA_SEINA, 2.7, 0]} />
      {/* Seinäpalat oviaukon molemmin puolin. */}
      {[-1, 1].map((puoli) => {
        const palaKeski = puoli * (aukkoPuoli + palaLeveys / 2)
        return (
          <CuboidCollider key={`pala-${puoli}`} args={[0.06, 1.5, palaLeveys / 2]} position={[KAYTAVA_SEINA, 1.5, palaKeski]} />
        )
      })}
      {/* Vessan seinät. */}
      <CuboidCollider args={[0.5, 1.5, 0.04]} position={[-0.1, 1.5, koppiZsisa]} />
      <CuboidCollider args={[0.04, 1.5, (puolileveys - koppiZsisa) / 2]} position={[koppiXpaa, 1.5, (koppiZsisa + puolileveys) / 2]} />
      {/* Kerrossänky. */}
      <CuboidCollider args={[1.1, 0.6, 0.375]} position={[1.5, 1.1, sivuZ]} />
      {/* Pöytä ja tuoli. */}
      <CuboidCollider args={[0.3, 0.4, 0.3]} position={[2.5, 0.4, -0.6]} />
      <CuboidCollider args={[0.2, 0.4, 0.2]} position={[1.9, 0.4, -0.6]} />

      {/* Hytin aukeava ovi (E), saranat ja kahva. */}
      <HyttiOvi worldZ={vaununZ + z} />
    </group>
  )
}

function Paatyseina({ z }) {
  return (
    <group position={[0, 0, z]}>
      <RigidBody type="fixed" colliders="cuboid">
        <mesh material={mPaaty} position={[-1.85, 1.5, 0]}><boxGeometry args={[2.3, 3, 0.2]} /></mesh>
      </RigidBody>
      <RigidBody type="fixed" colliders="cuboid">
        <mesh material={mPaaty} position={[1.85, 1.5, 0]}><boxGeometry args={[2.3, 3, 0.2]} /></mesh>
      </RigidBody>
      <RigidBody type="fixed" colliders="cuboid">
        <mesh material={mPaaty} position={[0, 2.7, 0]}><boxGeometry args={[1.4, 0.6, 0.2]} /></mesh>
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
      {/* Kaikkien hyttien visuaaliset osat instansoituna (yksi draw call per
          osatyyppi). */}
      <Hytit hytit={hytit} leveys={hyttiLeveys} />

      {/* Hyttien törmäykset ja aukeavat ovet (per hytti). */}
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
              <mesh material={mPaaty} position={[0.75, 1.5, valiseinaZ]}><boxGeometry args={[4.5, 3, 0.2]} /></mesh>
              <CuboidCollider args={[2.25, 1.5, 0.1]} position={[0.75, 1.5, valiseinaZ]} />
            </RigidBody>
            {/* Vasen seinäpala (oviaukon vasen puoli ulkoseinään). */}
            <RigidBody type="fixed" colliders={false}>
              <mesh material={mPaaty} position={[-2.85, 1.5, valiseinaZ]}><boxGeometry args={[0.3, 3, 0.2]} /></mesh>
              <CuboidCollider args={[0.15, 1.5, 0.1]} position={[-2.85, 1.5, valiseinaZ]} />
            </RigidBody>
            {/* Yläpala oviaukon päällä (täyttää aukon tasan, ei rakoa). */}
            <RigidBody type="fixed" colliders={false}>
              <mesh material={mPaaty} position={[-2.1, 2.7, valiseinaZ]}><boxGeometry args={[1.2, 0.6, 0.2]} /></mesh>
              <CuboidCollider args={[0.6, 0.3, 0.1]} position={[-2.1, 2.7, valiseinaZ]} />
            </RigidBody>
            {/* Oviaukon kehyslistat (aukon reunoilla x=-2.7 ja -1.5). */}
            <mesh material={mListaKirkas} position={[-2.7, 1.2, valiseinaZ]}><boxGeometry args={[0.08, 2.4, 0.24]} /></mesh>
            <mesh material={mListaKirkas} position={[-1.5, 1.2, valiseinaZ]}><boxGeometry args={[0.08, 2.4, 0.24]} /></mesh>

            {/* Ulko-ovet molemmilla sivuseinillä. */}
            {[-1, 1].map((puoli) => (
              <group key={puoli} position={[puoli * 2.92, 0, valikkoZ]}>
                <mesh material={mKehysB} position={[0, 1.15, 0]}><boxGeometry args={[0.06, 2.4, 1.5]} /></mesh>
                <mesh position={[puoli * -0.04, 1.15, 0]}>
                  <boxGeometry args={[0.06, 2.2, 1.3]} />
                  <meshStandardMaterial color="#5a5560" metalness={0.5} roughness={0.5} />
                </mesh>
                <mesh position={[puoli * -0.08, 1.55, 0]}>
                  <boxGeometry args={[0.04, 1.0, 1.0]} />
                  <meshStandardMaterial color="#0a0e18" transparent opacity={0.45} roughness={0.1} metalness={0} />
                </mesh>
                <mesh material={mMetalliListaa} position={[puoli * -0.06, 1.55, 0]}><boxGeometry args={[0.03, 1.1, 1.1]} /></mesh>
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
