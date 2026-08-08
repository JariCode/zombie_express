import { Vaunu } from './Vaunu'

// Koko juna: vaunut peräkkäin. Vaunun pituus 44, joten väli 44.
export function Juna() {
  const zPaikat = [0, -44, -88]
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
    </>
  )
}