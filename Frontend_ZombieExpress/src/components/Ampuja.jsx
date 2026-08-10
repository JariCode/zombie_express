import { useThree } from '@react-three/fiber'
import { useEffect, useRef } from 'react'
import * as THREE from 'three'
import { useAmpumisSignaali } from '../hooks/useAmpumisSignaali'

// Kuuntelee hiiren klikkausta ja ampuu rayn kameran keskeltä eteenpäin.
// Jos ray osuu zombie-malliin, kutsutaan onOsuma sen id:llä ja
// onRoiske osuman tarkalla sijainnilla.
export function Ampuja({ zombieMeshit, onOsuma, onRoiske }) {
  const { camera } = useThree()
  const raycaster = useRef(new THREE.Raycaster())
  const keskipiste = useRef(new THREE.Vector2(0, 0))
  const signaali = useAmpumisSignaali()

  useEffect(() => {
    // Ampumisääni ladataan kerran. Kloonataan joka laukauksella, jotta
    // nopeat peräkkäiset laukaukset soivat päällekkäin.
    const laukausAani = new Audio('/audio/sfx/gunshot.mp3')
    laukausAani.volume = 0.5

    const ammu = () => {
      // Kasvatetaan laukauslaskuria, jotta pistooli näyttää suuliekin.
      signaali.laukauksia += 1

      // Soitetaan ampumisääni (klooni sallii päällekkäiset laukaukset).
      const aani = laukausAani.cloneNode()
      aani.volume = 0.5
      aani.play().catch(() => {})

      // Ammutaan ruudun keskeltä (0,0 = keskikohta).
      raycaster.current.setFromCamera(keskipiste.current, camera)

      // Kerätään kaikki nykyiset zombie-mallit listaksi.
      const kohteet = Object.values(zombieMeshit.current).filter(Boolean)

      // Tarkistetaan mihin ray osuu. true = tarkista myös lapsimeshit.
      const osumat = raycaster.current.intersectObjects(kohteet, true)

      if (osumat.length > 0) {
        // Roiske osuman tarkkaan kohtaan.
        const p = osumat[0].point
        if (onRoiske) onRoiske(p.x, p.y, p.z)

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
  }, [camera, zombieMeshit, onOsuma, onRoiske, signaali])

  return null
}