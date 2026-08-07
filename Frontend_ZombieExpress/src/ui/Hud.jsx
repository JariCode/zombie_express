// Canvasin päälle piirtyvä käyttöliittymä.
export function Hud({ hp, maxHp }) {
  // HP prosentteina palkin leveyttä varten.
  const prosentti = Math.max(0, (hp / maxHp) * 100)

  return (
    <div className="ui-overlay">
      <div className="crosshair" />
      <div className="hud">
        Zombie Express
        <div className="hud-hp-bar">
          <div className="hud-hp-fill" style={{ width: `${prosentti}%` }} />
        </div>
      </div>
    </div>
  )
}