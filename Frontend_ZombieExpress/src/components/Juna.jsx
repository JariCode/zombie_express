import { Vaunu } from './Vaunu'

// Koko juna: monta vaunua peräkkäin z-akselilla.
export function Juna() {
  const zPaikat = [0, -10, -20, -30, -40]
  return (
    <>
      {zPaikat.map((z) => (
        <Vaunu key={z} z={z} />
      ))}
    </>
  )
}