import { RigidBody, CuboidCollider } from '@react-three/rapier'
import * as THREE from 'three'
import { Penkit } from './Penkki'
import { Ovi } from './Ovi'
import { Vessa } from './Vessa'
import { VaunuValo } from './VaunuValo'

// Vaunun pituus z-akselilla. Vaunu ulottuu -PITUUS/2 .. +PITUUS/2.
const PITUUS = 44

// Jaetut materiaalit ja geometriat ikkunaseinille. Näin 26 ikkunaseinää
// (2 per vaunu) ei luo satoja omia geometrioita ja materiaaleja, vaan kaikki
// käyttävät samoja. Tämä keventää muistia ja poistaa nykimisen kun vaunu
// tulee näkyviin.
const seinaMat = new THREE.MeshStandardMaterial({ color: '#3a2f28' })
const kehysMat = new THREE.MeshStandardMaterial({ color: '#4a4038', roughness: 0.6, metalness: 0.3 })
const metalliMat = new THREE.MeshStandardMaterial({ color: '#3a3a40', roughness: 0.4, metalness: 0.6 })
const hyllyMat = new THREE.MeshStandardMaterial({ color: '#2a2420', roughness: 0.6, metalness: 0.3 })
const lasiMat = new THREE.MeshStandardMaterial({ color: '#0a0a14', transparent: true, opacity: 0.4, roughness: 0.1, metalness: 0 })
const laukkuMatA = new THREE.MeshStandardMaterial({ color: '#2a2018', roughness: 0.8 })
const laukkuMatB = new THREE.MeshStandardMaterial({ color: '#20242a', roughness: 0.8 })

const alareunaGeo = new THREE.BoxGeometry(0.2, 1.2, PITUUS)
const ylareunaGeo = new THREE.BoxGeometry(0.2, 0.8, PITUUS)
const umpiGeo = new THREE.BoxGeometry(0.2, 1.3, 3.0)
const rakoGeo = new THREE.BoxGeometry(0.2, 1.3, 2.0)
const vessaUmpiGeo = new THREE.BoxGeometry(0.2, 1.3, 3.8)
const palkkiGeo = new THREE.BoxGeometry(0.2, 3, 0.8)
const lasiGeo = new THREE.BoxGeometry(0.1, 1.3, 3.0)
const kehysVaakaGeo = new THREE.BoxGeometry(0.1, 0.08, 3.0)
const kehysPystyGeo = new THREE.BoxGeometry(0.1, 1.3, 0.1)
const kannatinGeo = new THREE.BoxGeometry(0.7, 0.04, 0.04)

// Ikkunaverhojen jaetut resurssit. Verho tehdään ohuista pystyliuskoista jotka
// ovat aaltomaisesti eri syvyyksillä (poimutettu kangas), ei laatikkomaisena.
const verhoMat = new THREE.MeshStandardMaterial({ color: '#2e5a34', roughness: 0.9, side: THREE.DoubleSide })
const verhoTankoGeo = new THREE.CylinderGeometry(0.025, 0.025, 3.2, 8)

// Rakennetaan yhtenäinen aaltoileva verhokangas: pystysuora plane jonka
// verteksit siirretään x-suunnassa siniaallon mukaan (pehmeä poimu, ei
// kulmikkaita portaita). Jaetaan yksi geometria kummallekin reunalle.
function teeVerhoGeo(sisaan) {
  const leveys = 0.9
  const korkeus = 1.25
  const segZ = 40 // paljon segmenttejä -> sileä aalto
  const segY = 1
  const geo = new THREE.PlaneGeometry(leveys, korkeus, segZ, segY)
  const pos = geo.attributes.position
  for (let i = 0; i < pos.count; i++) {
    const zPos = pos.getX(i) // planen leveysakseli
    // Poimu: pinta aaltoilee sisään ja ulos leveyssuunnassa.
    const aalto = Math.sin((zPos / leveys) * Math.PI * 6) * 0.05
    pos.setZ(i, aalto * sisaan)
  }
  geo.computeVertexNormals()
  // Käännetään plane pystyyn ikkunan eteen (leveysakseli z-suuntaan).
  geo.rotateY(Math.PI / 2)
  return geo
}

const verhoGeoSisaan = teeVerhoGeo(1)
const verhoGeoUlos = teeVerhoGeo(-1)

// Aaltoileva verho ikkunan yhteen reunaan. keskiZ = ikkunan keskikohta,
// reuna = -1 vasen tai +1 oikea reuna, x = seinän x, sisaan = -1/+1 kumpaan
// suuntaan verho työntyy huoneeseen.
function Verho({ keskiZ, reuna, x, sisaan }) {
  const leveysZ = 0.9
  // Verhon keskikohta z: vasen reuna ikkunan vasemmassa laidassa, oikea oikeassa.
  const keskiOffset = reuna === -1 ? -1.0 : 1.0
  const z = keskiZ + keskiOffset
  const geo = sisaan === 1 ? verhoGeoSisaan : verhoGeoUlos
  return (
    <group>
      {/* Verhotanko ikkunan yläreunassa. */}
      <mesh geometry={verhoTankoGeo} position={[x + sisaan * 0.06, 2.2, keskiZ]} rotation={[Math.PI / 2, 0, 0]}>
        <meshStandardMaterial color="#3a3a40" metalness={0.6} roughness={0.4} />
      </mesh>
      {/* Yhtenäinen aaltoileva kangas. */}
      <mesh geometry={geo} material={verhoMat} position={[x + sisaan * 0.06, 1.55, z]} />
    </group>
  )
}

// Yksi ikkunaseinä: pystypalkkeja joiden väliin jää ikkunat.
// puoli = -1 vasen seinä, +1 oikea seinä.
function IkkunaSeina({ puoli }) {
  const x = puoli * 3

  // Ikkunat tasavälein vaunun pituudella. \n  // Oikealla puolella (vessan puoli, puoli === 1) lopetetaan ikkunat aikaisemmin,
  // jotta ensimmäinen ikkuna ei mene vessan seinän sisälle.
  const ikkunat = []
  const maxIkkunaZi = puoli === 1 ? 11.4 : 15.2
  for (let zi = -15.2; zi <= maxIkkunaZi; zi += 3.8) ikkunat.push(zi)

  // Pystypalkit ikkunoiden väleissä.
  const palkit = []
  const maxPalkkiZi = puoli === 1 ? 17.1 : 20.9
  for (let zi = -20.9; zi <= maxPalkkiZi; zi += 3.8) palkit.push(zi)

  // Hyllyn ja etuputken pituudet ja z-keskikohta riippuvat puolesta.
  const hyllyPituus = puoli === 1 ? 33.5 : 36
  const hyllyZ = puoli === 1 ? -0.8 : 0
  const etuputkiGeo = new THREE.CylinderGeometry(0.03, 0.03, hyllyPituus, 8)
  const hyllyGeo = new THREE.BoxGeometry(0.9, 0.05, hyllyPituus)

  return (
    <group>
      {/* Alareuna koko seinän pituudelta. */}
      <mesh geometry={alareunaGeo} material={seinaMat} position={[x, 0.3, 0]} />


      {/* Yläreuna koko seinän pituudelta. */}
      <RigidBody type="fixed" colliders="cuboid">
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

      {/* Umpiseinä oikealla puolella vessan kohdalla, jottei seinään jää reikää */}
      {puoli === 1 && (
        <RigidBody type="fixed" colliders="cuboid">
          <mesh geometry={vessaUmpiGeo} material={seinaMat} position={[x, 1.55, 15.2]} />
        </RigidBody>
      )}

      {/* Pystypalkit ikkunoiden väleissä. */}
      {palkit.map((zi) => (
        <RigidBody key={zi} type="fixed" colliders="cuboid">
          <mesh geometry={palkkiGeo} material={seinaMat} position={[x, 1.5, zi]} />
        </RigidBody>
      ))}

      {/* Ikkunalasit aukkoihin. Täyttävät aukon palkista palkkiin (leveys 3.0)
          ja ala- ja yläreunan väliin (korkeus 1.3). */}
      {ikkunat.map((zi) => (
        <RigidBody key={zi} type="fixed" colliders="cuboid">
          <mesh geometry={lasiGeo} material={lasiMat} position={[x, 1.55, zi]} />
        </RigidBody>
      ))}

      {/* Ikkunakehykset: listakehys jokaisen ikkuna-aukon ympärillä, käytävän puolella. */}
      {ikkunat.map((zi) => (
        <group key={`kehys-${zi}`}>
          {/* Alareuna */}
          <mesh geometry={kehysVaakaGeo} material={kehysMat} position={[x - puoli * 0.06, 0.9, zi]} />
          {/* Yläreuna */}
          <mesh geometry={kehysVaakaGeo} material={kehysMat} position={[x - puoli * 0.06, 2.2, zi]} />
          {/* Pystyreunat aukon molemmin puolin */}
          {[-1.5, 1.5].map((rz) => (
            <mesh key={rz} geometry={kehysPystyGeo} material={kehysMat} position={[x - puoli * 0.06, 1.55, zi + rz]} />
          ))}
        </group>
      ))}

      {/* Aaltoilevat verhot jokaisen ikkunan molemmissa reunoissa,
          käytävän puolella. */}
      {ikkunat.map((zi) => (
        <group key={`verho-${zi}`}>
          <Verho keskiZ={zi} reuna={-1} x={x - puoli * 0.12} sisaan={-puoli} />
          <Verho keskiZ={zi} reuna={1} x={x - puoli * 0.12} sisaan={-puoli} />
        </group>
      ))}

      {/* Matkatavarateline ikkunoiden yläpuolella, suora vaakahylly. */}
      {/* Hyllytaso, työntyy seinästä käytävälle päin */}
      <mesh geometry={hyllyGeo} material={hyllyMat} position={[x - puoli * 0.45, 2.3, hyllyZ]} />

      {/* Etureunan putki, estää laukkuja putoamasta */}
      <mesh geometry={etuputkiGeo} material={metalliMat} position={[x - puoli * 0.78, 2.42, hyllyZ]} rotation={[Math.PI / 2, 0, 0]} />

      {/* Kannatinraudat seinästä hyllyyn (vain hyllyn alueella). */}
      {palkit.filter((zi) => Math.abs(zi) <= 17).map((zi) => (
        <mesh key={`kannatin-${zi}`} geometry={kannatinGeo} material={metalliMat} position={[x - puoli * 0.4, 2.25, zi]} />
      ))}

      {/* Matkalaukkuja hyllyllä */}
      {[-15, -6, 3, 14].map((lz, li) => (
        <mesh
          key={`laukku-${lz}`}
          material={li % 2 === 0 ? laukkuMatA : laukkuMatB}
          position={[x - puoli * 0.45, 2.5, lz]}
        >
          <boxGeometry args={[0.5, 0.32, 0.7 + (li % 2) * 0.3]} />
        </mesh>
      ))}
    </group>
  )
}

// Umpinainen päätyseinä junan päähän: samannäköinen ovi mutta ei aukene,
// eikä siitä pääse ulos. Käytetään junan ensimmäisen vaunun takapäässä.
function Paatyseina({ z }) {
  return (
    <group position={[0, 0, z]}>
      {/* Vasen seinäpala */}
      <RigidBody type="fixed" colliders="cuboid">
        <mesh position={[-1.85, 1.5, 0]}>
          <boxGeometry args={[2.3, 3, 0.2]} />
          <meshStandardMaterial
            color="#2a2320"
            metalness={0.3}
            roughness={0.7}
          />
        </mesh>
      </RigidBody>

      {/* Oikea seinäpala */}
      <RigidBody type="fixed" colliders="cuboid">
        <mesh position={[1.85, 1.5, 0]}>
          <boxGeometry args={[2.3, 3, 0.2]} />
          <meshStandardMaterial
            color="#2a2320"
            metalness={0.3}
            roughness={0.7}
          />
        </mesh>
      </RigidBody>

      {/* Yläpala oviaukon päällä */}
      <RigidBody type="fixed" colliders="cuboid">
        <mesh position={[0, 2.7, 0]}>
          <boxGeometry args={[1.4, 0.6, 0.2]} />
          <meshStandardMaterial
            color="#2a2320"
            metalness={0.3}
            roughness={0.7}
          />
        </mesh>
      </RigidBody>

      {/* Kiinteä ovilevy aukossa (ei aukene). Yksityiskohdat vaunun sisään päin (-z). */}
      <RigidBody type="fixed" colliders="cuboid">
        <group position={[0, 1.2, 0]}>
          {/* Oven runko */}
          <mesh>
            <boxGeometry args={[1.4, 2.4, 0.1]} />
            <meshStandardMaterial
              color="#3a3a45"
              metalness={0.6}
              roughness={0.4}
            />
          </mesh>

          {/* Ikkuna oven yläosassa */}
          <mesh position={[0, 0.55, -0.02]}>
            <boxGeometry args={[0.9, 0.9, 0.08]} />
            <meshStandardMaterial
              color="#0a0a14"
              transparent
              opacity={0.5}
              roughness={0.1}
            />
          </mesh>

          {/* Ikkunan kehys */}
          <mesh position={[0, 0.55, -0.04]}>
            <boxGeometry args={[1.0, 1.0, 0.04]} />
            <meshStandardMaterial
              color="#26262e"
              metalness={0.5}
              roughness={0.5}
            />
          </mesh>

          {/* Ikkunan lasi kehyksen sisällä */}
          <mesh position={[0, 0.55, -0.05]}>
            <boxGeometry args={[0.88, 0.88, 0.02]} />
            <meshStandardMaterial
              color="#0a0e18"
              transparent
              opacity={0.45}
              roughness={0.1}
            />
          </mesh>

          {/* Kahva */}
          <mesh position={[0.5, -0.1, -0.08]}>
            <cylinderGeometry args={[0.03, 0.03, 0.5, 8]} />
            <meshStandardMaterial
              color="#6a6a72"
              metalness={0.8}
              roughness={0.3}
            />
          </mesh>

          {/* Alareunan lista */}
          <mesh position={[0, -1.05, -0.03]}>
            <boxGeometry args={[1.4, 0.15, 0.06]} />
            <meshStandardMaterial
              color="#26262e"
              metalness={0.5}
              roughness={0.5}
            />
          </mesh>
        </group>
      </RigidBody>
    </group>
  )
}

// Yksi junavaunu: lattia, katto, valot, ikkunaseinät, penkit ja päätyovet.
// z siirtää vaunun oikeaan kohtaan junassa.
// eka = ensimmäinen vaunu (takapää umpiseinä, ettei pääse ulos).
export function Vaunu({ z, eka = false }) {
  // Penkkirivit tasavälein (väli 2). Molempiin päätyihin jää tilaa välikölle.
  // Vasen puoli täydet rivit, oikealta puolelta (vessan puoli) jätetään
  // vessan pään viimeiset rivit pois, jotta vessa mahtuu väliseinään kiinni.
  const vasenRivit = []
  for (let i = 0; i < 17; i++) vasenRivit.push(-15 + i * 2)

  // Oikealta puolelta pois vessan pään 2 viimeistä (z=15 ja 17).
  const oikeaRivit = vasenRivit.filter((pz) => pz < 15)

  return (
    <group position={[0, 0, z]}>
      {/* Lattia (törmäyspinta) */}
      <RigidBody type="fixed" colliders="cuboid">
        <mesh position={[0, 0, 0]} receiveShadow>
          <boxGeometry args={[6, 0.2, PITUUS]} />
          <meshStandardMaterial color="#241d19" />
        </mesh>
      </RigidBody>

      {/* Penkkialueiden lattia molemmin puolin, hieman vaaleampi */}
      <mesh position={[-1.9, 0.101, 0]} receiveShadow>
        <boxGeometry args={[2.2, 0.01, PITUUS]} />
        <meshStandardMaterial
          color="#2e2620"
          roughness={0.95}
        />
      </mesh>

      <mesh position={[1.9, 0.101, 0]} receiveShadow>
        <boxGeometry args={[2.2, 0.01, PITUUS]} />
        <meshStandardMaterial
          color="#2e2620"
          roughness={0.95}
        />
      </mesh>

      {/* Keskikäytävän kulkuraita, tummempi kulunut matto */}
      <mesh position={[0, 0.102, 0]} receiveShadow>
        <boxGeometry args={[1.9, 0.012, PITUUS]} />
        <meshStandardMaterial
          color="#1a1512"
          roughness={1}
        />
      </mesh>

      {/* Käytävän reunalistat, vaaleammat metallireunukset */}
      {[-0.95, 0.95].map((rx) => (
        <mesh key={rx} position={[rx, 0.108, 0]}>
          <boxGeometry args={[0.06, 0.012, PITUUS]} />
          <meshStandardMaterial
            color="#3a3a40"
            roughness={0.5}
            metalness={0.5}
          />
        </mesh>
      ))}

      {/* Pituussuuntaiset raidat käytävämatossa */}
      {[-0.5, 0, 0.5].map((rx) => (
        <mesh key={`r${rx}`} position={[rx, 0.109, 0]}>
          <boxGeometry args={[0.02, 0.012, PITUUS]} />
          <meshStandardMaterial
            color="#0f0c0a"
            roughness={1}
          />
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

      {/* Kattolamput vaunun sisällä, tasavälein pituudella. */}
      <pointLight
        position={[0, 2.7, -14]}
        intensity={20}
        distance={18}
        color="#ffd8a8"
      />

      <pointLight
        position={[0, 2.7, -4]}
        intensity={20}
        distance={18}
        color="#ffd8a8"
      />

      <pointLight
        position={[0, 2.7, 6]}
        intensity={20}
        distance={18}
        color="#ffd8a8"
      />

      <pointLight
        position={[0, 2.7, 16]}
        intensity={20}
        distance={18}
        color="#ffd8a8"
      />

      {/* Näkyvät kattovalaisimet valonlähteiden kohdalla, hehkuvat lämpimästi. */}
      {[-14, -4, 6, 16].map((lz) => (
        <group
          key={`valaisin-${lz}`}
          position={[0, 2.85, lz]}
        >
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
            <meshStandardMaterial
              color="#2a2a30"
              roughness={0.4}
              metalness={0.6}
            />
          </mesh>
        </group>
      ))}

      {/* Ikkunaseinät molemmin puolin */}
      <IkkunaSeina puoli={-1} />
      <IkkunaSeina puoli={1} />

      {/* Vasemman puolen penkit (täydet rivit). */}
      {/* Kaikki penkit instansoituna (yksi draw call per penkin osatyyppi). */}
      <Penkit
        penkit={[
          ...vasenRivit.map((pz) => ({ x: -1.8, z: pz, kahvaPuoli: -1 })),
          ...oikeaRivit.map((pz) => ({ x: 1.8, z: pz, kahvaPuoli: 1 })),
        ]}
      />

      {/* Vessa oikealla puolella, kiinni +z-pään eteisen väliseinässä. */}
      <Vessa position={[1.8, 0, 17]} />

      {/* Etuovi (kohti veturia).
          Ovi aukeaa +z-suuntaan eli tämän vaunun sisälle. */}
      <Ovi
        z={-PITUUS / 2}
        worldZ={z - PITUUS / 2}
        avautumissuunta={-1}
      />

      {/* Takaovi. Ensimmäisen vaunun takapää on umpiseinä, muissa takaovi. */}
      {eka ? (
        <Paatyseina z={PITUUS / 2} />
      ) : (
        <Ovi
          z={PITUUS / 2}
          worldZ={z + PITUUS / 2}
          avautumissuunta={1}
        />
      )}

      {/* Välikkö (eteinen) molemmissa päädyissä: väliseinä oviaukolla erottaa
          välikön matkustamosta, ulko-ovet molemmilla sivuseinillä. */}
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

            {/* Ulko-ovet molemmilla sivuseinillä. Ovi upotettu seinään,
                lasi-ikkuna yläosassa jotta erottuu ovena. */}
            {[-1, 1].map((puoli) => (
              <group key={puoli} position={[puoli * 2.92, 0, valikkoZ]}>
                {/* Oven karmi (vaaleampi kehys ympärillä) */}
                <mesh position={[0, 1.15, 0]}>
                  <boxGeometry args={[0.06, 2.4, 1.5]} />
                  <meshStandardMaterial color="#4a4038" metalness={0.4} roughness={0.6} />
                </mesh>
                {/* Oven paneeli */}
                <mesh position={[puoli * -0.04, 1.15, 0]}>
                  <boxGeometry args={[0.06, 2.2, 1.3]} />
                  <meshStandardMaterial color="#5a5560" metalness={0.5} roughness={0.5} />
                </mesh>
                {/* Iso lasi-ikkuna oven yläosassa */}
                <mesh position={[puoli * -0.08, 1.55, 0]}>
                  <boxGeometry args={[0.04, 1.0, 1.0]} />
                  <meshStandardMaterial color="#0a0e18" transparent opacity={0.45} roughness={0.1} metalness={0} />
                </mesh>
                {/* Ikkunan kehys */}
                <mesh position={[puoli * -0.06, 1.55, 0]}>
                  <boxGeometry args={[0.03, 1.1, 1.1]} />
                  <meshStandardMaterial color="#26262e" metalness={0.5} roughness={0.5} />
                </mesh>
                {/* Pystykahva */}
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