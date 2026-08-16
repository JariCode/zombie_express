import { RigidBody } from '@react-three/rapier'
import * as THREE from 'three'

// Jaetut geometriat ja materiaalit kaikille palkeille (12 kpl junassa). Näin
// jokainen palje ei luo omia geometrioita ja materiaaleja, vaan kaikki
// käyttävät samoja. Keventää muistia ja poistaa nykimisen kun palje tulee
// näkyviin.
const lattiaMat = new THREE.MeshStandardMaterial({ color: '#1a1512', roughness: 0.95 })
const listaMat = new THREE.MeshStandardMaterial({ color: '#3a3a40', roughness: 0.5, metalness: 0.6 })
const paljeMat = new THREE.MeshStandardMaterial({ color: '#111014', roughness: 0.95 })
const poimuTummaMat = new THREE.MeshStandardMaterial({ color: '#050507', roughness: 1 })
const poimuMat = new THREE.MeshStandardMaterial({ color: '#070709', roughness: 1 })
const kattoMat = new THREE.MeshStandardMaterial({ color: '#1a1719', roughness: 0.8, metalness: 0.2 })
const kattoreunaMat = new THREE.MeshStandardMaterial({ color: '#2a292e', roughness: 0.5, metalness: 0.6 })

const lattiaGeo = new THREE.BoxGeometry(1.9, 0.20, 2.2)
const listaGeo = new THREE.BoxGeometry(0.08, 0.12, 1.5)
const paljeGeo = new THREE.BoxGeometry(0.20, 2.7, 1.5)
const sivuPoimuGeo = new THREE.BoxGeometry(0.10, 2.72, 0.08)
const kattoGeo = new THREE.BoxGeometry(2.7, 0.18, 1.5)
const kattoPoimuGeo = new THREE.BoxGeometry(2.4, 0.10, 0.08)
const kattoreunaGeo = new THREE.BoxGeometry(0.10, 0.16, 1.5)

// Junavaunujen välinen kulkuyhteys / haitaripalje.
// Palkeen keskellä ei ole seinää eikä sivuilla collideria,
// jotta pelaaja pääsee vapaasti vaunusta toiseen.
export function VaunujenVali({ z }) {
  const poimut = [-0.62, -0.46, -0.30, -0.14, 0.02, 0.18, 0.34, 0.50, 0.66]

  return (
    <group position={[0, 0, z]}>
      {/* Visuaalinen lattian jatke, ilman collideria. */}
      <mesh geometry={lattiaGeo} material={lattiaMat} position={[0, 0.10, 0]} receiveShadow />

      {/* Lattiareunan metallilistat. */}
      <mesh geometry={listaGeo} material={listaMat} position={[-0.97, 0.22, 0]} />
      <mesh geometry={listaGeo} material={listaMat} position={[0.97, 0.22, 0]} />

      {/* Vasen sivupalje ja poimut. */}
      <mesh geometry={paljeGeo} material={paljeMat} position={[-1.18, 1.45, 0]} />
      {poimut.map((pz) => (
        <mesh key={`vasen-poimu-${pz}`} geometry={sivuPoimuGeo} material={poimuTummaMat} position={[-1.31, 1.45, pz]} />
      ))}

      {/* Oikea sivupalje ja poimut. */}
      <mesh geometry={paljeGeo} material={paljeMat} position={[1.18, 1.45, 0]} />
      {poimut.map((pz) => (
        <mesh key={`oikea-poimu-${pz}`} geometry={sivuPoimuGeo} material={poimuTummaMat} position={[1.31, 1.45, pz]} />
      ))}

      {/* Katto ja poimut. */}
      <mesh geometry={kattoGeo} material={kattoMat} position={[0, 2.85, 0]} receiveShadow />
      {poimut.map((pz) => (
        <mesh key={`katto-poimu-${pz}`} geometry={kattoPoimuGeo} material={poimuMat} position={[0, 2.72, pz]} />
      ))}

      {/* Katon metallireunat. */}
      <mesh geometry={kattoreunaGeo} material={kattoreunaMat} position={[-1.27, 2.72, 0]} />
      <mesh geometry={kattoreunaGeo} material={kattoreunaMat} position={[1.27, 2.72, 0]} />

      {/* Alapuolen haitaripoimut. */}
      {poimut.map((pz) => (
        <mesh key={`ala-poimu-${pz}`} geometry={kattoPoimuGeo} material={poimuMat} position={[0, 0.38, pz]} />
      ))}

      {/* Pieni valo palkeeseen. */}
      <pointLight position={[0, 2.4, 0]} intensity={1.5} distance={3.5} color="#d8c0a0" />
    </group>
  )
}
