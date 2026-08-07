import { Vaunu } from './Vaunu'

// Koko juna: vaunut peräkkäin. Vaunun pituus 44, joten väli 44.
export function Juna() {
  const zPaikat = [0, -44, -88]
  return (
    <>
      {zPaikat.map((z) => (
        <Vaunu key={z} z={z} />
      ))}
    </>
  )
}