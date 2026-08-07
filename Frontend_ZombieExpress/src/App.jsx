import { useState, useCallback, useRef } from 'react'
import { Peli } from './components/Peli'
import { Hud } from './ui/Hud'
import { GameOver } from './ui/GameOver'
import { Intro } from './ui/Intro'
import './App.css'

function App() {
  // Pelin vaihe: 'intro' tai 'peli'.
  const [vaihe, setVaihe] = useState('intro')

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
      {vaihe === 'intro' && <Intro onValmis={() => setVaihe('peli')} />}

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