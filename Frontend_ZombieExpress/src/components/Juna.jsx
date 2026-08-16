import { Vaunu } from './Vaunu'
import { RavintolaVaunu } from './RavintolaVaunu'
import { MakuuVaunu } from './MakuuVaunu'
import { VaunujenVali } from './VaunujenVali'
import { EtaisyysNakyva } from './EtaisyysNakyva'

// Koko juna: kolme matkustajavaunua, ravintolavaunu keskellä, kolme
// matkustajavaunua ja kuusi makuuvaunua. Vaunun pituus on 44 ja vaunujen
// väliin jätetään 1.5 yksikön rako (vaunuväli 45.5).
//
// Suorituskyvyn vuoksi jokainen vaunu ja palje piilotetaan kun pelaaja on
// kaukana (EtaisyysNakyva). Näkyvissä on nykyinen vaunu sekä yksi edellinen
// ja seuraava, jotta avoimesta ovesta näkee naapurivaunuun. Piilotetut vaunut
// pysyvät muistissa, joten niitä ei ladata uudelleen (ei nykäyksiä).
export function Juna() {
  const alkuVaunut = [0, -45.5, -91]
  const loppuVaunut = [-182, -227.5, -273]
  const makuuVaunut = [-318.5, -364, -409.5, -455, -500.5, -546]

  const palkeet = [
    -22.75, -68.25, -113.75, -159.25, -204.75, -250.25,
    -295.75, -341.25, -386.75, -432.25, -477.75, -523.25,
  ]

  return (
    <>
      {/* Ensimmäiset kolme matkustajavaunua. */}
      {alkuVaunut.map((z, i) => (
        <EtaisyysNakyva key={z} keskiZ={z}>
          <Vaunu z={z} eka={i === 0} />
        </EtaisyysNakyva>
      ))}

      {/* Ravintolavaunu kolmannen vaunun jälkeen. */}
      <EtaisyysNakyva keskiZ={-136.5}>
        <RavintolaVaunu z={-136.5} />
      </EtaisyysNakyva>

      {/* Kolme matkustajavaunua ravintolavaunun jälkeen. */}
      {loppuVaunut.map((z) => (
        <EtaisyysNakyva key={z} keskiZ={z}>
          <Vaunu z={z} />
        </EtaisyysNakyva>
      ))}

      {/* Kuusi makuuvaunua junan jatkoksi. */}
      {makuuVaunut.map((z) => (
        <EtaisyysNakyva key={z} keskiZ={z}>
          <MakuuVaunu z={z} />
        </EtaisyysNakyva>
      ))}

      {/* Palkeet vaunujen välissä. */}
      {palkeet.map((z) => (
        <EtaisyysNakyva key={z} keskiZ={z}>
          <VaunujenVali z={z} />
        </EtaisyysNakyva>
      ))}
    </>
  )
}
