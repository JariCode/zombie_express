import { RigidBody } from '@react-three/rapier'

// Junavaunujen välinen kulkuyhteys / haitaripalje.
// Palkeen keskellä ei ole seinää eikä sivuilla collideria,
// jotta pelaaja pääsee vapaasti vaunusta toiseen.
export function VaunujenVali({ z }) {
  const poimut = [
    -0.62,
    -0.46,
    -0.30,
    -0.14,
    0.02,
    0.18,
    0.34,
    0.50,
    0.66,
  ]

  return (
    <group position={[0, 0, z]}>

      {/* ========================================= */}
      {/* LATTIAN JATKE                             */}
      {/* ========================================= */}

      {/* Visuaalinen lattian jatke palkeeseen - ilman collideria, jotta pelaaja pääsee läpi */}
      <mesh
        position={[0, 0.10, 0]}
        receiveShadow
      >
        <boxGeometry args={[1.9, 0.20, 2.2]} />
        <meshStandardMaterial
          color="#1a1512"
          roughness={0.95}
        />
      </mesh>

      {/* Vasemman lattiareunan metallilista */}
      <mesh position={[-0.97, 0.22, 0]}>
        <boxGeometry args={[0.08, 0.12, 1.5]} />
        <meshStandardMaterial
          color="#3a3a40"
          roughness={0.5}
          metalness={0.6}
        />
      </mesh>

      {/* Oikean lattiareunan metallilista */}
      <mesh position={[0.97, 0.22, 0]}>
        <boxGeometry args={[0.08, 0.12, 1.5]} />
        <meshStandardMaterial
          color="#3a3a40"
          roughness={0.5}
          metalness={0.6}
        />
      </mesh>

      {/* ========================================= */}
      {/* VASEN HAITARIPALLE                        */}
      {/* ========================================= */}

      {/* Pehmeä sivupalje.
          EI collideria, koska pelaajan ei tarvitse törmätä tähän. */}
      <mesh position={[-1.18, 1.45, 0]}>
        <boxGeometry args={[0.20, 2.7, 1.5]} />
        <meshStandardMaterial
          color="#111014"
          roughness={0.95}
        />
      </mesh>

      {/* Vasemman puolen pystysuuntaiset haitaripoimut */}
      {poimut.map((pz) => (
        <mesh
          key={`vasen-poimu-${pz}`}
          position={[-1.31, 1.45, pz]}
        >
          <boxGeometry args={[0.10, 2.72, 0.08]} />
          <meshStandardMaterial
            color="#050507"
            roughness={1}
          />
        </mesh>
      ))}

      {/* ========================================= */}
      {/* OIKEA HAITARIPALLE                        */}
      {/* ========================================= */}

      <mesh position={[1.18, 1.45, 0]}>
        <boxGeometry args={[0.20, 2.7, 1.5]} />
        <meshStandardMaterial
          color="#111014"
          roughness={0.95}
        />
      </mesh>

      {/* Oikean puolen pystysuuntaiset haitaripoimut */}
      {poimut.map((pz) => (
        <mesh
          key={`oikea-poimu-${pz}`}
          position={[1.31, 1.45, pz]}
        >
          <boxGeometry args={[0.10, 2.72, 0.08]} />
          <meshStandardMaterial
            color="#050507"
            roughness={1}
          />
        </mesh>
      ))}

      {/* ========================================= */}
      {/* KATTO                                    */}
      {/* ========================================= */}

      {/* Katto on visuaalinen.
          Ei collideria, jotta se ei vaikuta pelaajan liikkumiseen. */}
      <mesh
        position={[0, 2.85, 0]}
        receiveShadow
      >
        <boxGeometry args={[2.7, 0.18, 1.5]} />
        <meshStandardMaterial
          color="#1a1719"
          roughness={0.8}
          metalness={0.2}
        />
      </mesh>

      {/* Katon haitaripoimut */}
      {poimut.map((pz) => (
        <mesh
          key={`katto-poimu-${pz}`}
          position={[0, 2.72, pz]}
        >
          <boxGeometry args={[2.4, 0.10, 0.08]} />
          <meshStandardMaterial
            color="#070709"
            roughness={1}
          />
        </mesh>
      ))}

      {/* Katon metallireunat */}
      <mesh position={[-1.27, 2.72, 0]}>
        <boxGeometry args={[0.10, 0.16, 1.5]} />
        <meshStandardMaterial
          color="#2a292e"
          roughness={0.5}
          metalness={0.6}
        />
      </mesh>

      <mesh position={[1.27, 2.72, 0]}>
        <boxGeometry args={[0.10, 0.16, 1.5]} />
        <meshStandardMaterial
          color="#2a292e"
          roughness={0.5}
          metalness={0.6}
        />
      </mesh>

      {/* ========================================= */}
      {/* ALAPUOLEN HAITARIPOIMUT                  */}
      {/* ========================================= */}

      {poimut.map((pz) => (
        <mesh
          key={`ala-poimu-${pz}`}
          position={[0, 0.38, pz]}
        >
          <boxGeometry args={[2.4, 0.10, 0.08]} />
          <meshStandardMaterial
            color="#070709"
            roughness={1}
          />
        </mesh>
      ))}

      {/* ========================================= */}
      {/* PIENI VALO PALKEESEEN                    */}
      {/* ========================================= */}

      <pointLight
        position={[0, 2.4, 0]}
        intensity={1.5}
        distance={3.5}
        color="#d8c0a0"
      />

    </group>
  )
}