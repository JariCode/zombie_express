import { useRef } from 'react'

// Pelaajan HP jaettuna. Zombie vähentää tätä, HUD lukee tätä.
const tila = {
  hp: 100,
  maxHp: 100,
}

export function usePelaajanHp() {
  return useRef(tila).current
}