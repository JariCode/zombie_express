import './Alku.css'

// Aloitusnäkymä (landing page): taustana kansikuva (public/img/kansikuva.png),
// päällä teemaan sopiva otsikko ja "Aloita peli" -nappi.
// onAloita kutsutaan kun nappia painetaan (vie introon).
export function Alku({ onAloita }) {
  return (
    <div className="alku">
      {/* Tumma verho kuvan päällä, jotta teksti erottuu. */}
      <div className="alku-verho" />

      {/* Otsikko ja nappi. */}
      <div className="alku-sisalto">
        <h1 className="alku-otsikko">
          <span className="alku-otsikko-rivi1">ZOMBIE</span>
          <span className="alku-otsikko-rivi2">EXPRESS</span>
        </h1>
        <p className="alku-alaotsikko">Yöjuna kohti Müncheniä</p>

        <button className="alku-nappi" onClick={onAloita}>
          ALOITA PELI
        </button>
      </div>
    </div>
  )
}
