import { createContext, useContext } from 'react'

// Välittää vahinkofunktion pelistä zombeille.
export const VahinkoContext = createContext(() => {})

export function useVahinko() {
  return useContext(VahinkoContext)
}