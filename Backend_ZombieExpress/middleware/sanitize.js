// Poistaa objekteista avaimet jotka alkavat $-merkillä tai sisältävät pisteen
// nämä ovat MongoDB-operaattoreita, joilla voi yrittää NoSQL-injektiota
function puhdistaObjekti(kohde) {
  if (kohde === null || typeof kohde !== 'object') {
    return;
  }

  // Taulukon jokainen alkio käydään läpi erikseen
  if (Array.isArray(kohde)) {
    for (const alkio of kohde) {
      puhdistaObjekti(alkio);
    }
    return;
  }

  for (const avain of Object.keys(kohde)) {
    // Vaarallinen avain poistetaan kokonaan
    if (avain.startsWith('$') || avain.includes('.')) {
      delete kohde[avain];
      continue;
    }

    // Sisäkkäiset objektit käydään läpi rekursiivisesti
    puhdistaObjekti(kohde[avain]);
  }
}

// LISÄYS: Pieni apufunktio req.querylle, joka tarkistaa myös sisäkkäiset rakenteet
function sisaltaakoVaarallisia(kohde) {
  if (kohde === null || typeof kohde !== 'object') return false;
  if (Array.isArray(kohde)) return kohde.some(sisaltaakoVaarallisia);
  
  for (const avain of Object.keys(kohde)) {
    if (avain.startsWith('$') || avain.includes('.')) return true;
    if (sisaltaakoVaarallisia(kohde[avain])) return true;
  }
  return false;
}

// Middleware joka puhdistaa pyynnön sisällön
function sanitize(req, res, next) {
  // Body ja params ovat muokattavia, joten ne voidaan puhdistaa suoraan
  if (req.body) {
    puhdistaObjekti(req.body);
  }

  if (req.params) {
    puhdistaObjekti(req.params);
  }

  // Query on Express 5:ssä vain luettava -> tarkistetaan apufunktiolla
  if (req.query && sisaltaakoVaarallisia(req.query)) {
    return res.status(400).json({ error: 'Virheellinen pyyntö' });
  }

  next();
}

module.exports = sanitize;