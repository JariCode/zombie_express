import { useFrame, useThree } from '@react-three/fiber'
import { useRef } from 'react'
import { RigidBody, CapsuleCollider, useRapier } from '@react-three/rapier'
import * as THREE from 'three'
import { useNappaimet } from '../hooks/useNappaimet'
import { usePelaajanPaikka } from '../hooks/usePelaajanPaikka'

// Pelaaja: näkymätön fyysinen kapseli jota liikutetaan WASD:lla.
// Kamera seuraa kapselia. Rapier estää liikkeen seinien läpi.
export function Liikkuja() {
  const { camera } = useThree()
  const { world } = useRapier()
  const napit = useNappaimet()
  const pelaajanPaikka = usePelaajanPaikka()

  const body = useRef()
  const controller = useRef()

  const eteen = useRef(new THREE.Vector3())
  const sivu = useRef(new THREE.Vector3())
  const liike = useRef(new THREE.Vector3())

  useFrame((state, delta) => {
    if (!body.current) return

    // Luodaan character controller kerran ensimmäisellä framella.
    if (!controller.current) {
      controller.current = world.createCharacterController(0.01)
    }

    const nopeus = 4 * delta
    const n = napit.current

    // Katseen suunta vaakatasossa.
    camera.getWorldDirection(eteen.current)
    eteen.current.y = 0
    eteen.current.normalize()

    // Sivuttaissuunta.
    sivu.current.crossVectors(camera.up, eteen.current).normalize()

    // Lasketaan haluttu liike näppäimistä.
    liike.current.set(0, 0, 0)
    if (n.w) liike.current.addScaledVector(eteen.current, nopeus)
    if (n.s) liike.current.addScaledVector(eteen.current, -nopeus)
    if (n.a) liike.current.addScaledVector(sivu.current, nopeus)
    if (n.d) liike.current.addScaledVector(sivu.current, -nopeus)

    // Kysytään rapierilta paljonko liikkeestä on sallittu (törmäykset huomioiden).
    const collider = body.current.collider(0)
    controller.current.computeColliderMovement(collider, liike.current)
    const sallittu = controller.current.computedMovement()

    // Siirretään kapseli sallitun liikkeen verran.
    const paikka = body.current.translation()
    body.current.setNextKinematicTranslation({
      x: paikka.x + sallittu.x,
      y: paikka.y + sallittu.y,
      z: paikka.z + sallittu.z,
    })

    // Huom. Tämä tulostaa koordinaatit jokaisella framella, joten konsoli saattaa täyttyä nopeasti.
    console.log(`Pelaajan sijainti -> X: ${paikka.x.toFixed(2)}, Y: ${paikka.y.toFixed(2)}`)

    // Kamera seuraa kapselia, silmien korkeudella.
    camera.position.set(paikka.x, paikka.y + 0.8, paikka.z)

    // Päivitetään jaettu pelaajan paikka, jotta zombiet löytävät pelaajan.
    pelaajanPaikka.set(paikka.x, paikka.y, paikka.z)
  })

  return (
    <RigidBody
      ref={body}
      type="kinematicPosition"
      colliders={false}
      position={[0, 1, 3]}
      enabledRotations={[false, false, false]}
    >
      {/* Näkymätön törmäyskapseli pelaajan keholle. */}
      <CapsuleCollider args={[0.6, 0.4]} />
    </RigidBody>
  )
}