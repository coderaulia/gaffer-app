import { createContext, useContext } from 'react'
import type { DrillSim } from './sim'

/**
 * The live DrillSim for the mounted drill. Scene components read poses from
 * it every frame without going through React state.
 */
export const SimContext = createContext<DrillSim | null>(null)

export function useSimulation(): DrillSim {
  const sim = useContext(SimContext)
  if (!sim) throw new Error('useSimulation must be used inside <SimContext>')
  return sim
}
