import { Canvas } from '@react-three/fiber'
import { PointerLockControls } from '@react-three/drei'
import { Physics } from '@react-three/rapier'
import { useRef, useCallback } from 'react'
import { Juna } from './Juna'
import { Liikkuja } from './Liikkuja'
import { Zombie } from './Zombie'
import { Ampuja } from './Ampuja'
import { OhiVilistava } from './OhiVilistava'
import { useZombit } from '../hooks/useZombit'
import { VahinkoContext } from '../hooks/usePelaajanVahinko'

// Pelin 3D-näkymä: kamera, valot, fysiikka, juna ja liike.
export function Peli({ otaVahinkoa, peliOhi }) {
  // Zombie-lista ja vahinkofunktio.
  const { zombit, vahingoitaZombie } = useZombit()

  // Kaikki zombie-mallit id:n mukaan, jotta ampuja löytää ne.
  const zombieMeshit = useRef({})

  // Zombie ilmoittaa mallinsa tähän (tai null kun poistuu).
  const asetaMesh = useCallback((id, mesh) => {
    if (mesh) zombieMeshit.current[id] = mesh
    else delete zombieMeshit.current[id]
  }, [])

  return (
    <Canvas camera={{ position: [0, 1.6, 3], fov: 75 }}>
      {/* Yön musta taivas taustalla. */}
      <color attach="background" args={['#02020a']} />

      {/* Himmeä yleisvalo */}
      <ambientLight intensity={0.3} />

      {/* Kattolamput valaisevat käytävää */}
      <pointLight position={[0, 2.5, 0]} intensity={20} distance={12} color="#ffd8a8" />
      <pointLight position={[0, 2.5, -20]} intensity={20} distance={12} color="#ffd8a8" />
      <pointLight position={[0, 2.5, -40]} intensity={20} distance={12} color="#ffd8a8" />

      {/* Ohi vilistävä öinen maisema molemmin puolin junaa. */}
      <OhiVilistava puoli={-1} nopeus={22} />
      <OhiVilistava puoli={1} nopeus={22} />

      {/* Fysiikkamaailma: kaikki törmäävät objektit tulevat tänne sisään. */}
      <Physics>
        <Juna />
        <Liikkuja />

        {/* Vahinkofunktio zombeille contextin kautta. */}
        <VahinkoContext.Provider value={otaVahinkoa}>
          {/* Piirretään kaikki listalla olevat zombit. */}
          {zombit.map((z) => (
            <Zombie
              key={z.id}
              id={z.id}
              aloitusZ={z.aloitusZ}
              hp={z.hp}
              maxHp={z.maxHp}
              malli={z.malli}
              scale={z.scale}
              onRef={asetaMesh}
              peliOhi={peliOhi}
            />
          ))}
        </VahinkoContext.Provider>
      </Physics>

      {/* Ampuminen: klikkaus vähentää zombien hp:tä. */}
      <Ampuja zombieMeshit={zombieMeshit} onOsuma={vahingoitaZombie} />

      {/* Lukitsee hiiren ja kääntää katsetta. */}
      <PointerLockControls />
    </Canvas>
  )
}