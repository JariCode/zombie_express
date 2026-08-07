import { Vaunu } from './Vaunu'

// Koko juna: monta vaunua peräkkäin. Vaunun pituus 30, joten väli 30.
export function Juna() {
  const zPaikat = [0, -30, -60]
  return (
    <>
      {zPaikat.map((z) => (
        <Vaunu key={z} z={z} />
      ))}
    </>
  )
}