import { useRef, useLayoutEffect } from 'react'
import * as THREE from 'three'
import { CuboidCollider } from '@react-three/rapier'

// Kaikki vaunun penkit instansoituna: jokainen penkin osatyyppi piirretään
// yhtenä InstancedMesh-objektina (yksi draw call per osa), ei erillisinä
// meshinä per penkki. Näin 32 penkkiä ei tuota satoja draw calleja vaan
// muutaman kymmenen. Penkin ulkonäkö on sama kuin ennen.
//
// penkit = lista { x, z, kahvaPuoli } -olioita.

const verhoiluMat = new THREE.MeshStandardMaterial({ color: '#4a2e2e', roughness: 0.9 })
const verhoiluTummaMat = new THREE.MeshStandardMaterial({ color: '#3a2323', roughness: 0.9 })
const runkoMat = new THREE.MeshStandardMaterial({ color: '#1a1412', roughness: 0.5, metalness: 0.4 })
const metalliMat = new THREE.MeshStandardMaterial({ color: '#8a8a92', roughness: 0.35, metalness: 0.85 })

const istuinGeo = new THREE.BoxGeometry(1.6, 0.18, 0.85)
const istuinReunaGeo = new THREE.CylinderGeometry(0.09, 0.09, 1.6, 12)
const selkaGeo = new THREE.BoxGeometry(1.6, 0.85, 0.16)
const selkaReunaGeo = new THREE.CylinderGeometry(0.08, 0.08, 1.6, 12)
const saumaPystyGeo = new THREE.BoxGeometry(0.03, 0.8, 0.04)
const saumaVaakaGeo = new THREE.BoxGeometry(0.03, 0.04, 0.8)
const kasinojaGeo = new THREE.BoxGeometry(0.1, 0.5, 0.75)
const metallirunkoGeo = new THREE.BoxGeometry(1.55, 0.08, 0.8)
const jalkaGeo = new THREE.BoxGeometry(0.12, 0.4, 0.5)
const sankaVaakaGeo = new THREE.CylinderGeometry(0.018, 0.018, 0.1, 10)
const sankaPystyGeo = new THREE.CylinderGeometry(0.018, 0.018, 0.3, 10)
const sankaKaariGeo = new THREE.TorusGeometry(0.05, 0.018, 8, 12, Math.PI / 2)

// Yhden penkin osat penkin omassa koordinaatistossa (ennen kääntöä/siirtoa).
// Jokainen: geometria, materiaali ja paikallinen matriisi (sijainti+rotaatio).
// kahvaPuoli vaikuttaa kädensijasankaan.
function penkinOsat(kahvaPuoli) {
  const e = new THREE.Euler()
  const p = new THREE.Vector3()
  const s = new THREE.Vector3(1, 1, 1)
  const teeM = (px, py, pz, rx = 0, ry = 0, rz = 0) => {
    const m = new THREE.Matrix4()
    m.compose(p.set(px, py, pz), new THREE.Quaternion().setFromEuler(e.set(rx, ry, rz)), s)
    return m
  }

  const osat = [
    { geo: istuinGeo, mat: verhoiluMat, m: teeM(0, 0.52, 0.05) },
    { geo: istuinReunaGeo, mat: verhoiluMat, m: teeM(0, 0.52, 0.47, 0, 0, Math.PI / 2) },
    { geo: selkaGeo, mat: verhoiluMat, m: teeM(0, 1.05, -0.32, -0.12, 0, 0) },
    { geo: selkaReunaGeo, mat: verhoiluTummaMat, m: teeM(0, 1.47, -0.35, 0, 0, Math.PI / 2) },
    { geo: saumaPystyGeo, mat: verhoiluTummaMat, m: teeM(0, 1.05, -0.24) },
    { geo: saumaVaakaGeo, mat: verhoiluTummaMat, m: teeM(0, 0.62, 0.05) },
    { geo: kasinojaGeo, mat: runkoMat, m: teeM(-0.82, 0.75, 0.05) },
    { geo: kasinojaGeo, mat: runkoMat, m: teeM(0.82, 0.75, 0.05) },
    { geo: metallirunkoGeo, mat: runkoMat, m: teeM(0, 0.42, 0.05) },
    { geo: jalkaGeo, mat: runkoMat, m: teeM(-0.65, 0.2, 0.05) },
    { geo: jalkaGeo, mat: runkoMat, m: teeM(0.65, 0.2, 0.05) },
  ]

  // Kädensijasanka (käytävän puolella). Ryhmän siirto + paikalliset osat.
  const sankaRyhma = new THREE.Matrix4().compose(
    p.set(kahvaPuoli * 0.82, 1.45, -0.35),
    new THREE.Quaternion().setFromEuler(e.set(-0.12, 0, 0)),
    s
  )
  const sankaOsat = [
    { geo: sankaVaakaGeo, mat: metalliMat, m: teeM(-kahvaPuoli * 0.1, 0.05, 0, 0, 0, Math.PI / 2) },
    { geo: sankaKaariGeo, mat: metalliMat, m: teeM(-kahvaPuoli * 0.05, 0.0, 0, 0, kahvaPuoli > 0 ? 0 : Math.PI, 0) },
    { geo: sankaPystyGeo, mat: metalliMat, m: teeM(0, -0.15, 0) },
    { geo: sankaKaariGeo, mat: metalliMat, m: teeM(-kahvaPuoli * 0.05, -0.3, 0, 0, kahvaPuoli > 0 ? 0 : Math.PI, -Math.PI / 2) },
    { geo: sankaVaakaGeo, mat: metalliMat, m: teeM(-kahvaPuoli * 0.1, -0.35, 0, 0, 0, Math.PI / 2) },
  ]
  for (const o of sankaOsat) {
    osat.push({ geo: o.geo, mat: o.mat, m: new THREE.Matrix4().multiplyMatrices(sankaRyhma, o.m) })
  }

  return osat
}

// Yksi instansoitu osatyyppi (sama geometria+materiaali monessa paikassa).
function InstanssiOsa({ geo, mat, matriisit }) {
  const ref = useRef()
  useLayoutEffect(() => {
    if (!ref.current) return
    for (let i = 0; i < matriisit.length; i++) {
      ref.current.setMatrixAt(i, matriisit[i])
    }
    ref.current.instanceMatrix.needsUpdate = true
  }, [matriisit])
  return <instancedMesh ref={ref} args={[geo, mat, matriisit.length]} castShadow />
}

export function Penkit({ penkit }) {
  // Ryhmitellään kaikki penkinosat osatyypeittäin (geo+mat), ja kerätään
  // jokaisen esiintymän maailmamatriisi (penkin sijainti+kääntö × osan matriisi).
  const ryhmat = new Map()

  const kaanto = new THREE.Quaternion().setFromEuler(new THREE.Euler(0, Math.PI, 0))
  const yksi = new THREE.Vector3(1, 1, 1)

  for (const penkki of penkit) {
    const penkkiM = new THREE.Matrix4().compose(
      new THREE.Vector3(penkki.x, 0, penkki.z),
      kaanto,
      yksi
    )
    const osat = penkinOsat(penkki.kahvaPuoli)
    for (const osa of osat) {
      const avain = osa.geo.uuid + '_' + osa.mat.uuid
      if (!ryhmat.has(avain)) {
        ryhmat.set(avain, { geo: osa.geo, mat: osa.mat, matriisit: [] })
      }
      ryhmat.get(avain).matriisit.push(
        new THREE.Matrix4().multiplyMatrices(penkkiM, osa.m)
      )
    }
  }

  return (
    <group>
      {/* Törmäyslaatikko jokaiselle penkille. Penkin sisäinen collideri oli
          z=-0.1; Math.PI-käännön jälkeen se on maailmassa z-suunnassa +0.1
          penkin keskeltä. */}
      {penkit.map((penkki, i) => (
        <CuboidCollider
          key={i}
          args={[1.7 / 2, 1.5 / 2, 1 / 2]}
          position={[penkki.x, 0.75, penkki.z + 0.1]}
          type="fixed"
        />
      ))}

      {/* Instansoidut osat. */}
      {[...ryhmat.values()].map((r, i) => (
        <InstanssiOsa key={i} geo={r.geo} mat={r.mat} matriisit={r.matriisit} />
      ))}
    </group>
  )
}
