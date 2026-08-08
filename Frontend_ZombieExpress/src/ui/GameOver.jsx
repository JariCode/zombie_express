// Näytetään kun pelaajan HP loppuu.
export function GameOver({ onAloitaAlusta }) {
  return (
    <div className="ui-overlay">
      <div className="center-message">
        <h1>Kuolit</h1>
        <p>Zombit saivat sinut kiinni.</p>
        <button className="alusta-nappi" onClick={onAloitaAlusta}>
          Yritä uudelleen
        </button>
      </div>
    </div>
  )
}