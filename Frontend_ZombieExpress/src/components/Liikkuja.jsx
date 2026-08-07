import { useFrame, useThree } from '@react-three/fiber'
import { useRef } from 'react'
import * as THREE from 'three'
import { useNappaimet } from '../hooks/useNappaimet'

// Pelaajan liike. Siirtää kameraa WASD-näppäimillä katseen suuntaan.
export function Liikkuja() {
  const { camera } = useThree()
  const napit = useNappaimet()

  const eteen = useRef(new THREE.Vector3())
  const sivu = useRef(new THREE.Vector3())

  useFrame((state, delta) => {
    const nopeus = 4 * delta
    const n = napit.current

    // Katseen suunta vaakatasossa.
    camera.getWorldDirection(eteen.current)
    eteen.current.y = 0
    eteen.current.normalize()

    // Sivuttaissuunta.
    sivu.current.crossVectors(camera.up, eteen.current).normalize()

    if (n.w) camera.position.addScaledVector(eteen.current, nopeus)
    if (n.s) camera.position.addScaledVector(eteen.current, -nopeus)
    if (n.a) camera.position.addScaledVector(sivu.current, nopeus)
    if (n.d) camera.position.addScaledVector(sivu.current, -nopeus)

    // Pidetään katsekorkeus vakiona.
    camera.position.y = 1.6
  })

  return null
}