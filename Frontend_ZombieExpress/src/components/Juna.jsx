import { Vaunu } from './Vaunu'
import { RavintolaVaunu } from './RavintolaVaunu'
import { VaunujenVali } from './VaunujenVali'

// Koko juna: kolme matkustajavaunua, ravintolavaunu keskellä ja kolme
// matkustajavaunua sen jälkeen. Vaunun pituus on 44 ja vaunujen väliin
// jätetään 1.5 yksikön rako (vaunuväli 45.5).
export function Juna() {
  // Ensimmäiset kolme matkustajavaunua.
  const alkuVaunut = [0, -45.5, -91]

  // Ravintolavaunun jälkeen tulevat kolme matkustajavaunua.
  const loppuVaunut = [-182, -227.5, -273]

  return (
    <>
      {/* Ensimmäiset kolme matkustajavaunua. */}
      {alkuVaunut.map((z, i) => (
        <Vaunu key={z} z={z} eka={i === 0} />
      ))}

      {/* Ravintolavaunu kolmannen vaunun jälkeen. */}
      <RavintolaVaunu z={-136.5} />

      {/* Kolme matkustajavaunua ravintolavaunun jälkeen. */}
      {loppuVaunut.map((z) => (
        <Vaunu key={z} z={z} />
      ))}

      {/* Palkeet vaunujen välissä. */}
      <VaunujenVali z={-22.75} />
      <VaunujenVali z={-68.25} />
      <VaunujenVali z={-113.75} />
      <VaunujenVali z={-159.25} />
      <VaunujenVali z={-204.75} />
      <VaunujenVali z={-250.25} />
    </>
  )
}
