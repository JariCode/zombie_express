import { useThree } from '@react-three/fiber'
import { useEffect, useRef } from 'react'
import * as THREE from 'three'

// Kuuntelee hiiren klikkausta ja ampuu rayn kameran keskeltä eteenpäin.
// Jos ray osuu zombie-meshiin, kutsutaan onOsuma sen id:llä.
// zombieMeshit on ref-olio jossa on kaikki zombie-meshit id:n mukaan.
export function Ampuja({ zombieMeshit, onOsuma }) {
  const { camera } = useThree()
  const raycaster = useRef(new THREE.Raycaster())
  const keskipiste = useRef(new THREE.Vector2(0, 0))

  useEffect(() => {
    const ammu = () => {
      // Ammutaan ruudun keskeltä (0,0 = keskikohta).
      raycaster.current.setFromCamera(keskipiste.current, camera)

      // Kerätään kaikki nykyiset zombie-meshit listaksi.
      const meshit = Object.values(zombieMeshit.current).filter(Boolean)

      // Tarkistetaan mihin ray osuu.
      const osumat = raycaster.current.intersectObjects(meshit, false)

      if (osumat.length > 0) {
        const osuttuId = osumat[0].object.userData.zombieId
        if (osuttuId != null) onOsuma(osuttuId)
      }
    }

    window.addEventListener('mousedown', ammu)
    return () => window.removeEventListener('mousedown', ammu)
  }, [camera, zombieMeshit, onOsuma])

  return null
}