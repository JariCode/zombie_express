require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const helmet = require('helmet');
const cookieParser = require('cookie-parser');

const sanitize = require('./middleware/sanitize');
const authRoutes = require('./routes/auth');
const profileRoutes = require('./routes/profile');
const adminRoutes = require('./routes/admin');

const app = express();

// Render on käänteisproxy, luotetaan ensimmäiseen proxyyn jotta rate limiting toimii
app.set('trust proxy', 1);

// Turvaotsikot, räätälöity api-backendille joka ei tarjoile html:aa
// Tiukka csp koska mitään sisältöä ei ladata selaimeen tästä palvelimesta
app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'none'"],
      frameAncestors: ["'none'"]
    }
  },
  crossOriginResourcePolicy: { policy: 'same-site' },
  referrerPolicy: { policy: 'no-referrer' }
}));

// Piilotetaan express-tunniste kokonaan
app.disable('x-powered-by');

// Cors vain sallitulle originille, osoite haetaan envistä
app.use(cors({
  origin: process.env.ALLOWED_ORIGIN,
  credentials: true
}));

// Cookies
app.use(cookieParser());

// Nosql-injektiosuojaus
app.use(sanitize);

//Reitit
app.use('/api/auth', authRoutes);
app.use('/api/profile', profileRoutes);
app.use('/api/admin', adminRoutes);

// Tuntemattomat reitit, siisti 404 ilman lisätietoja
app.use((req, res) => {
  res.status(404).json({ error: 'Reittiä ei löytynyt' });
});


// Käsittelemättömät virheet, siisti 500 ilman lisätietoja
app.use((err, req, res, next) => {
  console.error('Käsittelemätön virhe', err);
  res.status(500).json({ error: 'Palvelinvirhe' });
});

// Tietokantayhteys envistä
mongoose.connect(process.env.MONGODB_URI)
  .then(() => {
    console.log('Yhteys tietokantaan onnistui');
    app.listen(process.env.PORT, () => {
      console.log(`Palvelin käynnissä portissa ${process.env.PORT}`);
    });
  })
  .catch((err) => {
    console.error('Tietokantayhteys epäonnistui', err);
});