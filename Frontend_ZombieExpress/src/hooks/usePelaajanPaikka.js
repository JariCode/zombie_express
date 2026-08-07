import { useRef } from 'react'
import * as THREE from 'three'

// Yksi jaettu paikka pelaajan sijainnille.
// Pelaaja päivittää tätä, zombiet lukevat tästä.
const pelaajanPaikka = new THREE.Vector3(0, 1, 3)

export function usePelaajanPaikka() {
  return useRef(pelaajanPaikka).current
}