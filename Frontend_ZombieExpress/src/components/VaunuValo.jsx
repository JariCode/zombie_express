// Yhden vaunun varjoja heittävä valo, lähes suoraan ylhäältä.
// Varjokamera kattaa koko vaunun pituuden (±23 z-suunnassa).
export function VaunuValo() {
  return (
    <directionalLight
      position={[3, 20, 3]}
      intensity={0.7}
      color="#ffe8d0"
      castShadow
      shadow-mapSize-width={2048}
      shadow-mapSize-height={2048}
      shadow-camera-near={0.5}
      shadow-camera-far={40}
      shadow-camera-left={-6}
      shadow-camera-right={6}
      shadow-camera-top={23}
      shadow-camera-bottom={-23}
      shadow-bias={-0.0004}
      shadow-normalBias={0.03}
    />
  )
}