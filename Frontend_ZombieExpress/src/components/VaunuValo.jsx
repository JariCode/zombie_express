// Yhden vaunun varjoja heittävä valo, lähes suoraan ylhäältä.
// Varjokamera kattaa tasan oman vaunun pituuden (±22), ei enempää, jottei
// viereisen vaunun varjo vuoda tämän vaunun lattialle (ylimääräinen varjo
// vaunurajalla). Varjokartta 1024, mikä on riittävä ja selvästi kevyempi kuin
// 2048 kun junassa on monta varjovaloa.
export function VaunuValo() {
  return (
    <directionalLight
      position={[3, 20, 3]}
      intensity={0.7}
      color="#ffe8d0"
      castShadow
      shadow-mapSize-width={1024}
      shadow-mapSize-height={1024}
      shadow-camera-near={0.5}
      shadow-camera-far={40}
      shadow-camera-left={-6}
      shadow-camera-right={6}
      shadow-camera-top={22}
      shadow-camera-bottom={-22}
      shadow-bias={-0.0004}
      shadow-normalBias={0.03}
    />
  )
}
