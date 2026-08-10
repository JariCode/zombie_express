import { useState, useCallback, useRef, useEffect } from 'react'
import { useGLTF } from '@react-three/drei'
import { Peli } from './components/Peli'
import { Hud } from './ui/Hud'
import { GameOver } from './ui/GameOver'
import { Intro } from './ui/Intro'
import './App.css'

// Esiladataan 3D-mallit valmiiksi
useGLTF.preload('/models/zombie_cop.glb')
useGLTF.preload('/models/zombie_female.glb')
useGLTF.preload('/models/zombie_moss.glb')

function App() {
  // Pelin vaihe: 'intro' tai 'peli'.
  const [vaihe, setVaihe] = useState('intro')
  const [valmis, setValmis] = useState(false)

  // Esiladataan KAIKKI äänet ja musiikit taustalla intron aikana
  useEffect(() => {
    const aanet = [
      new Audio('/audio/music/background.mp3'),
      new Audio('/audio/sfx/coughing.mp3'),
      new Audio('/audio/sfx/death.mp3'),
      new Audio('/audio/sfx/glass.mp3'),
      new Audio('/audio/sfx/gunshot.mp3'),
      new Audio('/audio/sfx/hurt.mp3'),
      new Audio('/audio/sfx/matalaamurinaa.mp3'),
      new Audio('/audio/sfx/murinaa.mp3'),
      new Audio('/audio/sfx/train.mp3')
    ]

    aanet.forEach(aani => {
      aani.preload = 'auto'
      aani.load()
    })

    const ajastin = setTimeout(() => {
      setValmis(true)
    }, 500)

    return () => clearTimeout(ajastin)
  }, [])

  // Pelaajan HP React-tilana.
  const [hp, setHp] = useState(100)
  const maxHp = 100
  const kuollut = useRef(false)

  const otaVahinkoa = useCallback((maara) => {
    if (kuollut.current) return
    setHp((vanha) => {
      const uusi = Math.max(0, vanha - maara)
      if (uusi === 0) kuollut.current = true
      return uusi
    })
  }, [])

  const aloitaAlusta = useCallback(() => {
    kuollut.current = false
    setHp(maxHp)
  }, [])

  const peliOhi = hp <= 0

  return (
    <>
      {vaihe === 'intro' && (
        <Intro onValmis={() => { if (valmis) setVaihe('peli') }} />
      )}

      {vaihe === 'peli' && (
        <>
          <Peli otaVahinkoa={otaVahinkoa} peliOhi={peliOhi} />
          <Hud hp={hp} maxHp={maxHp} />
          {peliOhi && <GameOver onAloitaAlusta={aloitaAlusta} />}
        </>
      )}
    </>
  )
}

export default App