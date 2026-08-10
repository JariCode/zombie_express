import { useState, useEffect } from 'react'
import './Intro.css'

// Tarinan kohtaukset: kesto, teema (tausta) ja tekstit.
const KOHTAUKSET = [
  { kesto: 8000, teema: 'juna', tekstit: [
    'Kello on yli puolenyön.',
    'Yöjuna halkoo pimeää maisemaa kohti Müncheniä.',
  ]},
  { kesto: 8500, teema: 'juna', tekstit: [
    'Yksityisetsivä Ruben Kaarna istuu lähes tyhjässä vaunussa.',
    'Hän on matkalla sukulaistensa luo Saksaan — ensimmäistä kertaa vuosiin pois töiden parista.',
  ]},
  { kesto: 9000, teema: 'uutiset', tekstit: [
    'Uni ei tule. Ruben selaa puhelimensa uutisia junan kolistessa raiteilla.',
    'Otsikko pysäyttää hänet: tuntematon virustartunta on levinnyt Münchenin alueella.',
  ]},
  { kesto: 8500, teema: 'uutiset', tekstit: [
    '"Viranomaiset kehottavat välttämään matkustamista alueelle."',
    '"Tartunnan saaneet käyttäytyvät aggressiivisesti. Älkää lähestykö heitä."',
  ]},
  { kesto: 8500, teema: 'matkustaja', tekstit: [
    'Ruben nostaa katseensa. Käytävän toisessa päässä matkustaja horjahtaa istuimellaan.',
    'Kalpea. Hikinen. Silmät lasittuneina tuijottamassa tyhjyyteen.',
  ]},
  { kesto: 8000, teema: 'matkustaja', tekstit: [
    'Vuosien kokemus on opettanut Rubenille yhden asian: kun jokin tuntuu väärältä, se on väärin.',
    'Hiljaa hän nousee ja vetäytyy vaunun perällä olevaan vessaan.',
  ]},
  { kesto: 9000, teema: 'vessa', tekstit: [
    'Oven lukko naksahtaa kiinni. Ruben jatkaa uutisten lukemista vapisevin käsin.',
    'Silloin hän kuulee sen.',
  ]},
  { kesto: 8500, teema: 'vessa', tekstit: [
    'Käytäviltä kantautuu ääntä. Matalaa, märkää, lähes eläimellistä.',
    'Sitten huuto. Lasin särkymistä. Ja askelia — liian monta, liian nopeasti.',
  ]},
  { kesto: 8500, teema: 'ase', tekstit: [
    'Kädet vapisten Ruben tarkistaa kainalokotelon. Pistooli on paikallaan.',
    'Hän tarkistaa lippaan. Täysi.',
  ]},
  { kesto: 7500, teema: 'ase', tekstit: [
    'Ruben vetää henkeä. Mitä ikinä oven takana onkin, hän ei jää tänne odottamaan.',
    'Hän avaa vessan oven ja astuu käytävälle.',
  ]},
]

export function Intro({ onValmis }) {
  const [nykyinen, setNykyinen] = useState(0)

  useEffect(() => {
    if (nykyinen >= KOHTAUKSET.length) {
      onValmis()
      return
    }
    const ajastin = setTimeout(() => setNykyinen((n) => n + 1), KOHTAUKSET[nykyinen].kesto)
    return () => clearTimeout(ajastin)
  }, [nykyinen, onValmis])

  useEffect(() => {
    const ohita = (e) => {
      if (e.key === 'Enter' || e.key === ' ') onValmis()
    }
    window.addEventListener('keydown', ohita)
    return () => window.removeEventListener('keydown', ohita)
  }, [onValmis])

  //Junaääni toistuu koko intro-kohtauksen ajan. Käynnistetään kerran.
  useEffect(() => {
    const junaAani = new Audio('/audio/sfx/train.mp3')
    junaAani.loop = true
    junaAani.volume = 0.4
    junaAani.play().catch(() => {})
    return () => {
      junaAani.pause()
      junaAani.currentTime = 0
    }
  }, [])

  //Yskäisyääni toistuu kun tarinan mies yskii. Toistuu loopilla neljä kertaa
  useEffect(() => {
    if (nykyinen === 4 || nykyinen === 5) {
      const yskaAani = new Audio('/audio/sfx/coughing.mp3')
      yskaAani.loop = true
      yskaAani.volume = 0.4
      yskaAani.play().catch(() => {})
      return () => {
        yskaAani.pause()
        yskaAani.currentTime = 0
      }
    }
  }, [nykyinen])

  //Lasin hajoamisen ääni toistuu kerran kun tarinan mies on vessassa ja joku rikkoo lasin. Toistuu kerran.
  useEffect(() => {
    if (nykyinen === 7) {
      const lasiAani = new Audio('/audio/sfx/glass.mp3')
      lasiAani.volume = 0.4
      lasiAani.play().catch(() => {})
      return () => {
        lasiAani.pause()
        lasiAani.currentTime = 0
      }
    }
  }, [nykyinen])

  //Murinaa ja ääniä kun tarinan mies on vessassa. Toistuu kerran.
  useEffect(() => {
    if (nykyinen === 7 || nykyinen === 8 || nykyinen === 9) {
      const murinaAani = new Audio('/audio/sfx/murinaa.mp3')
      murinaAani.volume = 0.4
      murinaAani.play().catch(() => {})
      return () => {
        murinaAani.pause()
        murinaAani.currentTime = 0
      }
    }
  }, [nykyinen])

  if (nykyinen >= KOHTAUKSET.length) return null

  const kohtaus = KOHTAUKSET[nykyinen]

  return (
    <div className="intro">
      <div className={`intro-tausta teema-${kohtaus.teema}`}>
        <div className="vinjetti" />
        <div className="rae" />
      </div>

      <div className="intro-kuvitus" key={`k-${nykyinen}`}>
        <IntroKuvitus teema={kohtaus.teema} />
      </div>

      <div className="intro-teksti" key={`t-${nykyinen}`}>
        {kohtaus.tekstit.map((rivi, i) => (
          <p key={i} style={{ animationDelay: `${0.6 + i * 2}s` }}>{rivi}</p>
        ))}
      </div>

      <div className="intro-eteneminen">
        {KOHTAUKSET.map((_, i) => (
          <span key={i} className={i <= nykyinen ? 'aktiivinen' : ''} />
        ))}
      </div>

      <div className="intro-ohita">Enter › ohita</div>
    </div>
  )
}

function IntroKuvitus({ teema }) {
  // JUNA tulee kohti kameraa.
  if (teema === 'juna') {
    return (
      <svg viewBox="0 0 900 500" className="kuvitus-svg">
        <defs>
          <radialGradient id="kuuG" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="#f0f4ff" />
            <stop offset="55%" stopColor="#8a97b8" />
            <stop offset="100%" stopColor="transparent" />
          </radialGradient>
          <linearGradient id="taivasG" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#0c1424" />
            <stop offset="100%" stopColor="#050810" />
          </linearGradient>
          <linearGradient id="veturiG" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#2a3446" />
            <stop offset="100%" stopColor="#0e1420" />
          </linearGradient>
          <radialGradient id="ajovaloG" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="#fff8e0" />
            <stop offset="45%" stopColor="#ffe4a0" />
            <stop offset="100%" stopColor="transparent" />
          </radialGradient>
        </defs>
        <rect width="900" height="330" fill="url(#taivasG)" />
        <circle cx="770" cy="70" r="40" fill="url(#kuuG)" className="kuu-hehku" />
        {[[120,60],[220,110],[340,50],[500,90],[620,140],[840,150],[60,140]].map(([cx,cy],i) => (
          <circle key={i} cx={cx} cy={cy} r="1.5" fill="#cdd6ee" opacity="0.7" className="tahti"
            style={{ animationDelay: `${i * 0.5}s` }} />
        ))}
        <rect y="330" width="900" height="170" fill="#060a12" />
        <polygon points="420,330 480,330 660,500 240,500" fill="#0d1219" />
        <line x1="435" y1="330" x2="290" y2="500" stroke="#1c2432" strokeWidth="4" />
        <line x1="465" y1="330" x2="610" y2="500" stroke="#1c2432" strokeWidth="4" />
        {[...Array(6)].map((_, i) => (
          <rect key={i} className="polkky"
            x={438 - i * 17} y={342 + i * 27} width={24 + i * 34} height="5"
            fill="#141a24" style={{ animationDelay: `${i * 0.25}s` }} />
        ))}
        <g className="juna-lahesty">
          <polygon points="390,150 510,150 490,210 410,210" fill="#0c111b" />
          <rect x="360" y="185" width="180" height="170" rx="16" fill="url(#veturiG)" />
          <rect x="368" y="178" width="164" height="18" rx="9" fill="#3a4658" />
          <rect x="405" y="205" width="90" height="58" rx="6" fill="#0a1420" stroke="#1e2836" strokeWidth="2" />
          <rect x="410" y="210" width="40" height="48" fill="#16202e" opacity="0.5" />
          <rect x="395" y="285" width="110" height="50" rx="6" fill="#12161f" />
          {[...Array(4)].map((_, i) => (
            <rect key={i} x={402} y={293 + i * 11} width="96" height="4" rx="2" fill="#2a3040" />
          ))}
          <circle cx="392" cy="270" r="30" fill="url(#ajovaloG)" className="ajovalo" />
          <circle cx="508" cy="270" r="30" fill="url(#ajovaloG)" className="ajovalo" />
          <circle cx="392" cy="270" r="11" fill="#fff8e0" />
          <circle cx="508" cy="270" r="11" fill="#fff8e0" />
        </g>
      </svg>
    )
  }

  // UUTISET: puhelin.
  if (teema === 'uutiset') {
    return (
      <svg viewBox="0 0 900 500" className="kuvitus-svg">
        <defs>
          <linearGradient id="ruutuG" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#1a1f2a" />
            <stop offset="100%" stopColor="#0e1119" />
          </linearGradient>
        </defs>
        <g transform="rotate(-4 450 250)">
          <rect x="335" y="70" width="230" height="400" rx="30" fill="#0a0c11" stroke="#232a35" strokeWidth="3" />
          <rect x="352" y="104" width="196" height="332" rx="8" fill="url(#ruutuG)" />
          <rect x="352" y="104" width="196" height="30" rx="8" fill="#0e1119" />
          <circle cx="450" cy="119" r="3" fill="#2a3040" />
          <rect x="366" y="146" width="168" height="86" rx="6" fill="#2a0d0f" className="uutis-varoitus" />
          <path d="M450 162 L466 192 L434 192 Z" fill="#e63946" className="uutis-varoitus" />
          <rect x="450" y="176" width="3" height="10" fill="#0a0c11" />
          <circle cx="451.5" cy="189" r="1.8" fill="#0a0c11" />
          <rect x="366" y="248" width="168" height="9" rx="4" fill="#c8ccd4" />
          <rect x="366" y="266" width="140" height="9" rx="4" fill="#8a909c" />
          <rect x="366" y="298" width="168" height="6" rx="3" fill="#3a4150" />
          <rect x="366" y="312" width="168" height="6" rx="3" fill="#3a4150" />
          <rect x="366" y="326" width="120" height="6" rx="3" fill="#3a4150" />
          <rect x="366" y="352" width="168" height="6" rx="3" fill="#2a3040" />
          <rect x="366" y="366" width="150" height="6" rx="3" fill="#2a3040" />
        </g>
      </svg>
    )
  }

// MATKUSTAJA: sairas mies istuu leveää penkkiä vasten, sumea tausta.
  if (teema === 'matkustaja') {
    return (
      <svg viewBox="0 0 900 500" className="kuvitus-svg">
        <defs>
          <linearGradient id="ihoM" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#c8c2b0" />
            <stop offset="55%" stopColor="#a49a84" />
            <stop offset="100%" stopColor="#7a7058" />
          </linearGradient>
          <linearGradient id="paitaM" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#4a4438" />
            <stop offset="100%" stopColor="#28221a" />
          </linearGradient>
          <linearGradient id="penkkiM" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#3a2222" />
            <stop offset="100%" stopColor="#180d0d" />
          </linearGradient>
          <radialGradient id="hehkuM" cx="50%" cy="30%" r="60%">
            <stop offset="0%" stopColor="#3a2c1c" stopOpacity="0.5" />
            <stop offset="100%" stopColor="#000" stopOpacity="0" />
          </radialGradient>
          {/* Sumennussuodatin taustalle */}
          <filter id="sumea" x="-20%" y="-20%" width="140%" height="140%">
            <feGaussianBlur stdDeviation="8" />
          </filter>
        </defs>

        {/* Tumma tausta */}
        <rect width="900" height="500" fill="#080605" />

        {/* Sumea tausta: leveä penkki + hehku, koko taustan levyinen */}
        <g filter="url(#sumea)">
          {/* Leveä penkin selkänoja taustalla */}
          <rect x="60" y="200" width="780" height="300" rx="12" fill="url(#penkkiM)" />
          {/* Selkänojan yläreuna */}
          <rect x="60" y="200" width="780" height="40" rx="10" fill="#2a1616" />
          {/* Pehmeä lämmin hehku */}
          <ellipse cx="450" cy="180" rx="340" ry="200" fill="url(#hehkuM)" />
        </g>

        {/* SAIRAS MATKUSTAJA terävänä etualalla */}
        <g className="matkustaja-huoju" transform="translate(450 300)">
          {/* Hartiat ja rintakehä, likainen paita */}
          <path d="M-95 200 Q-105 40 -60 -30 L60 -30 Q105 40 95 200 Z" fill="url(#paitaM)" />
          <path d="M-40 -10 Q-30 60 -45 140" fill="none" stroke="#1e1a12" strokeWidth="3" opacity="0.6" />
          <path d="M42 -5 Q32 65 46 145" fill="none" stroke="#1e1a12" strokeWidth="3" opacity="0.6" />
          {/* Hikiläikkä rinnassa */}
          <ellipse cx="0" cy="60" rx="35" ry="55" fill="#20201a" opacity="0.5" />
          {/* Kaula */}
          <rect x="-22" y="-70" width="44" height="50" rx="10" fill="#9a917b" />
          <path d="M-16 -45 Q0 -38 16 -45" fill="none" stroke="#5a5040" strokeWidth="2" opacity="0.5" />
          {/* PÄÄ */}
          <g className="paa-huoju">
            <ellipse cx="0" cy="-125" rx="52" ry="60" fill="url(#ihoM)" />
            <path d="M-52 -125 Q-38 -110 -40 -85" fill="none" stroke="#6a5f4a" strokeWidth="4" opacity="0.5" />
            <path d="M52 -125 Q38 -110 40 -85" fill="none" stroke="#6a5f4a" strokeWidth="4" opacity="0.5" />
            {/* Silmäkuopat */}
            <ellipse cx="-19" cy="-135" rx="13" ry="15" fill="#2a251c" />
            <ellipse cx="19" cy="-135" rx="13" ry="15" fill="#2a251c" />
            {/* Lasittuneet silmät */}
            <circle cx="-19" cy="-133" r="6" fill="#c8c2a8" opacity="0.8" />
            <circle cx="19" cy="-133" r="6" fill="#c8c2a8" opacity="0.8" />
            <circle cx="-18" cy="-132" r="2.5" fill="#3a3428" />
            <circle cx="20" cy="-132" r="2.5" fill="#3a3428" />
            {/* Tummat renkaat silmien alla */}
            <path d="M-30 -120 Q-19 -114 -8 -120" fill="none" stroke="#5a4a38" strokeWidth="3" opacity="0.6" />
            <path d="M8 -120 Q19 -114 30 -120" fill="none" stroke="#5a4a38" strokeWidth="3" opacity="0.6" />
            {/* Nenä */}
            <path d="M0 -128 L-7 -100 L7 -100 Z" fill="#8a8068" />
            <path d="M-7 -100 L0 -95 L7 -100" fill="#1a1610" opacity="0.5" />
            {/* Raollaan oleva suu */}
            <ellipse cx="0" cy="-82" rx="13" ry="8" fill="#2a1818" />
            <path d="M-13 -82 Q0 -78 13 -82" fill="none" stroke="#6a5a48" strokeWidth="2" />
            {/* Hiki otsalla */}
            <ellipse cx="-25" cy="-165" rx="3" ry="5" fill="#e8e4d0" opacity="0.5" />
            <ellipse cx="15" cy="-170" rx="2.5" ry="4" fill="#e8e4d0" opacity="0.5" />
            {/* Harva tukka */}
            <path d="M-48 -165 Q-25 -185 0 -180 Q25 -185 48 -165" fill="none" stroke="#3a3226" strokeWidth="8" opacity="0.7" />
          </g>
        </g>
      </svg>
    )
  }

  // VESSA: ovi + ääniaallot.
  if (teema === 'vessa') {
    return (
      <svg viewBox="0 0 900 500" className="kuvitus-svg">
        <defs>
          <linearGradient id="oviG" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#20262f" />
            <stop offset="100%" stopColor="#12161c" />
          </linearGradient>
        </defs>
        <rect x="0" y="0" width="900" height="500" fill="#0c0f14" />
        <rect x="250" y="40" width="400" height="440" fill="#141821" />
        <rect x="300" y="70" width="300" height="410" rx="6" fill="url(#oviG)" stroke="#2a3038" strokeWidth="3" />
        <circle cx="565" cy="285" r="10" fill="#3a4250" />
        <circle cx="565" cy="285" r="5" fill="#1a1f26" />
        <rect x="600" y="70" width="6" height="410" fill="#e63946" opacity="0.3" className="ovenrako-valo" />
        {[...Array(4)].map((_, i) => (
          <path key={i} className="aani-aalto"
            d={`M630 ${160 + i * 55} q35 -22 70 0 q35 22 70 0`}
            stroke="#e63946" strokeWidth="3" fill="none" opacity="0.5"
            style={{ animationDelay: `${i * 0.35}s` }} />
        ))}
      </svg>
    )
  }

  // ASE: pistooli.
  return (
    <svg viewBox="0 0 900 500" className="kuvitus-svg">
      <defs>
        <linearGradient id="aseG" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#3a4048" />
          <stop offset="50%" stopColor="#1a1e24" />
          <stop offset="100%" stopColor="#0c0e12" />
        </linearGradient>
      </defs>
      <g className="ase-esiin" transform="translate(450 250)">
        <rect x="-160" y="-30" width="320" height="46" rx="8" fill="url(#aseG)" />
        <rect x="-150" y="12" width="150" height="26" rx="4" fill="#20252c" />
        <path d="M-60 38 q0 40 -35 40 q-35 0 -35 -40 Z" fill="none" stroke="#20252c" strokeWidth="8" />
        <rect x="-150" y="34" width="42" height="95" rx="8" fill="#2a2016" transform="rotate(14 -129 80)" />
        <rect x="-130" y="-24" width="220" height="5" rx="2" fill="#5a6472" opacity="0.6" className="ase-kiilto" />
      </g>
    </svg>
  )
}