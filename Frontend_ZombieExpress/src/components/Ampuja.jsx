import { useThree } from '@react-three/fiber'
import { useEffect, useRef } from 'react'
import * as THREE from 'three'
import { useAmpumisSignaali } from '../hooks/useAmpumisSignaali'

// Kuuntelee hiiren klikkausta ja ampuu rayn kameran keskeltä eteenpäin.
// Jos ray osuu zombie-malliin, kutsutaan onOsuma sen id:llä.
// zombieMeshit on ref-olio jossa on kaikki zombie-mallit id:n mukaan.
export function Ampuja({ zombieMeshit, onOsuma }) {
  const { camera } = useThree()
  const raycaster = useRef(new THREE.Raycaster())
  const keskipiste = useRef(new THREE.Vector2(0, 0))
  const signaali = useAmpumisSignaali()

  useEffect(() => {
    const ammu = () => {
      // Kasvatetaan laukauslaskuria, jotta pistooli näyttää suuliekin.
      signaali.laukauksia += 1

      // Ammutaan ruudun keskeltä (0,0 = keskikohta).
      raycaster.current.setFromCamera(keskipiste.current, camera)

      // Kerätään kaikki nykyiset zombie-mallit listaksi.
      const kohteet = Object.values(zombieMeshit.current).filter(Boolean)

      // Tarkistetaan mihin ray osuu. true = tarkista myös lapsimeshit.
      const osumat = raycaster.current.intersectObjects(kohteet, true)

      if (osumat.length > 0) {
        // Etsitään zombieId osuneesta objektista tai sen vanhemmista.
        let obj = osumat[0].object
        while (obj && obj.userData.zombieId == null) {
          obj = obj.parent
        }
        if (obj && obj.userData.zombieId != null) {
          onOsuma(obj.userData.zombieId)
        }
      }
    }

    window.addEventListener('mousedown', ammu)
    return () => window.removeEventListener('mousedown', ammu)
  }, [camera, zombieMeshit, onOsuma, signaali])

  return null
}