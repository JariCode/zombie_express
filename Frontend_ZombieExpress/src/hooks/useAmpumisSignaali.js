import { useRef } from 'react'

// Jaettu signaali: kasvaa joka laukauksella.
// Ase seuraa tätä ja käynnistää suuliekin + recoilin.
const tila = { laukauksia: 0 }

export function useAmpumisSignaali() {
  return useRef(tila).current
}