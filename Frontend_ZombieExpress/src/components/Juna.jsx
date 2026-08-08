import { Vaunu } from './Vaunu'
import { VaunujenVali } from './VaunujenVali'

// Koko juna: vaunut peräkkäin.
// Vaunun pituus on 44 ja vaunujen väliin jätetään 1.5 yksikön rako.
export function Juna() {
  const zPaikat = [0, -45.5, -91]

  return (
    <>
      {zPaikat.map((z, i) => (
        <Vaunu
          key={z}
          z={z}
          eka={i === 0}
          vika={i === zPaikat.length - 1}
        />
      ))}

      {/* Ensimmäisen ja toisen vaunun välinen palje. */}
      <VaunujenVali z={-22.75} />

      {/* Toisen ja kolmannen vaunun välinen palje. */}
      <VaunujenVali z={-68.25} />
    </>
  )
}