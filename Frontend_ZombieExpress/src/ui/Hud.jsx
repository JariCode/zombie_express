// Canvasin päälle piirtyvä käyttöliittymä.
export function Hud() {
  return (
    <div className="ui-overlay">
      <div className="crosshair" />
      <div className="hud">Zombie Express</div>
    </div>
  )
}