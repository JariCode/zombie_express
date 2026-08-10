import { Canvas } from '@react-three/fiber'
import { PointerLockControls } from '@react-three/drei'
import { Physics } from '@react-three/rapier'
import { useRef, useCallback, useState, useEffect } from 'react'
import { Juna } from './Juna'
import { Liikkuja } from './Liikkuja'
import { Zombie } from './Zombie'
import { Ampuja } from './Ampuja'
import { Pistooli } from './Pistooli'
import { OhiVilistava } from './OhiVilistava'
import { Verilatakko } from './Verilatakko'
import { Veriroiske } from './Veriroiske'
import { BloodDamageOverlay } from './BloodDamageOverlay'
import { useZombit } from '../hooks/useZombit'
import { useRoiskeet } from '../hooks/useRoiskeet'
import { VahinkoContext } from '../hooks/usePelaajanVahinko'

// Pelin 3D-näkymä: kamera, valot, fysiikka, juna ja liike.
export function Peli({ otaVahinkoa, peliOhi }) {
  // Zombie-lista, verilätäköt ja funktiot.
  const { zombit, veret, vahingoitaZombie, lisaaVeri } = useZombit()
  // Osumaroiskeet.
  const { roiskeet, lisaaRoiske } = useRoiskeet()
  // Kaikki zombie-mallit id:n mukaan, jotta ampuja löytää ne.
  const zombieMeshit = useRef({})
  // Pelaajan saamien vahinkojen määrä.
  const [vahinkoFlash, setVahinkoFlash] = useState(0)
  // Zombie ilmoittaa mallinsa tähän (tai null kun poistuu).
  const asetaMesh = useCallback((id, mesh) => {
   if (mesh) zombieMeshit.current[id] = mesh
    else delete zombieMeshit.current[id]

  }, [])

  // Pelaajan vahinko: välitetään varsinainen vahinko eteenpäin
  // ja käynnistetään samalla ruudun veriefekti.
  const kasittelePelaajanVahinko = useCallback((maara) => {
    otaVahinkoa(maara)
    setVahinkoFlash((arvo) => arvo + 1)
  }, [otaVahinkoa])

  // Junan taustaääni looppaa koko pelin ajan. Käynnistetään kerran.
  useEffect(() => {
    const junaAani = new Audio('/audio/sfx/train.mp3')
    junaAani.loop = true
    junaAani.volume = 0.4
    junaAani.play().catch(() => {})
    return () => {
      junaAani.pause()
      junaAani.currentTime = 0
    }
  }, [])

  return (
    <>
      <Canvas shadows camera={{ position: [0, 1.6, 3], fov: 75 }}>
        {/* Yön musta taivas taustalla. */}
        <color attach="background" args={['#02020a']} />

        {/* Yleisvalo joka valaisee kaiken tasaisesti. */}
        <ambientLight intensity={0.5} />

        {/* Ohi vilistävä öinen maisema molemmin puolin junaa. */}
        <OhiVilistava puoli={-1} nopeus={22} />
        <OhiVilistava puoli={1} nopeus={22} />

        {/* Verilätäköt kuolleiden zombien kohdilla. */}
        {veret.map((v) => (
          <Verilatakko key={v.id} x={v.x} z={v.z} />
        ))}

        {/* Osumaroiskeet. */}
        {roiskeet.map((r) => (
          <Veriroiske key={r.id} x={r.x} y={r.y} z={r.z} />
        ))}

        {/* Fysiikkamaailma: kaikki törmäävät objektit tulevat tänne sisään. */}
        <Physics>
          <Juna />

          <Liikkuja />

          {/* Vahinkofunktio zombeille contextin kautta. */}
          <VahinkoContext.Provider value={kasittelePelaajanVahinko}>

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
                kuoleva={z.kuoleva}
                lisaaVeri={lisaaVeri}
                onRef={asetaMesh}
                peliOhi={peliOhi}
              />
            ))}

          </VahinkoContext.Provider>
        </Physics>

        {/* Ampuminen: klikkaus vähentää zombien hp:tä ja tekee roiskeen. */}
        <Ampuja
          zombieMeshit={zombieMeshit}
          onOsuma={vahingoitaZombie}
          onRoiske={lisaaRoiske}
        />

        {/* Pelaajan näkyvä ase. */}
        <Pistooli />

        {/* Lukitsee hiiren ja kääntää katsetta. */}
        <PointerLockControls />
      </Canvas>

      {/* Pelaajan saamasta zombien vahingosta tuleva veriefekti. */}
      <BloodDamageOverlay trigger={vahinkoFlash} />
    </>
  )
}

