import { useState, useCallback, useRef } from 'react'
import { Peli } from './components/Peli'
import { Hud } from './ui/Hud'
import { GameOver } from './ui/GameOver'
import './App.css'

function App() {
  // Pelaajan HP React-tilana, jotta HUD päivittyy.
  const [hp, setHp] = useState(100)
  const maxHp = 100

  // Estää vahingon Game Overin jälkeen.
  const kuollut = useRef(false)

  // Zombie kutsuu tätä kun se puree pelaajaa.
  const otaVahinkoa = useCallback((maara) => {
    if (kuollut.current) return
    setHp((vanha) => {
      const uusi = Math.max(0, vanha - maara)
      if (uusi === 0) kuollut.current = true
      return uusi
    })
  }, [])

  // Aloittaa pelin alusta.
  const aloitaAlusta = useCallback(() => {
    kuollut.current = false
    setHp(maxHp)
  }, [])

  const peliOhi = hp <= 0

  return (
    <>
      <Peli otaVahinkoa={otaVahinkoa} peliOhi={peliOhi} />
      <Hud hp={hp} maxHp={maxHp} />
      {peliOhi && <GameOver onAloitaAlusta={aloitaAlusta} />}
    </>
  )
}

export default App