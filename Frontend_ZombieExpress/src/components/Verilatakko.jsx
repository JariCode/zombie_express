// Litteä punainen läiskä lattialla kuolleen zombien kohdalla.
export function Verilatakko({ x, z }) {
  return (
    <mesh position={[x, 0.11, z]} rotation={[-Math.PI / 2, 0, 0]}>
      <circleGeometry args={[0.7, 16]} />
      <meshStandardMaterial color="#4a0000" transparent opacity={0.85} />
    </mesh>
  )
}