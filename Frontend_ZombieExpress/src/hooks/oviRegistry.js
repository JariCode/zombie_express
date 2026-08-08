// Yksinkertainen rekisteri oville, jotta yksi E-painallus voi avata
// molemmat vierekkäiset ovet. Ovet rekisteröityvät mountissa ja
// poistuvat unmountissa.

const ovet = new Map()

export function registerOvi(id, worldZ, setAuki) {
  ovet.set(id, { worldZ, setAuki })
}

export function unregisterOvi(id) {
  ovet.delete(id)
}

export function openOvetNear(worldZ, range = 2.6) {
  for (const [, o] of ovet) {
    if (Math.abs(o.worldZ - worldZ) <= range) {
      o.setAuki(true)
    }
  }
}

export function closeOvetNear(worldZ, range = 2.6) {
  for (const [, o] of ovet) {
    if (Math.abs(o.worldZ - worldZ) <= range) {
      o.setAuki(false)
    }
  }
}

export function toggleOvetNear(worldZ, range = 2.6) {
  for (const [, o] of ovet) {
    if (Math.abs(o.worldZ - worldZ) <= range) {
      o.setAuki((v) => !v)
    }
  }
}
