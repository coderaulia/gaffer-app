/**
 * Coordinate system (metres, right-handed, Y up):
 *   x  -> pitch width,  -34 (left touchline) .. +34 (right touchline)
 *   z  -> pitch length, -52.5 (attacking goal line) .. +52.5 (own goal line)
 *   y  -> height above turf, only used by the ball
 *
 * Every drill animates toward the goal at z = -52.5.
 */

export type Action =
  | 'idle'
  | 'jog'
  | 'run'
  | 'sprint'
  | 'jockey'
  | 'press'
  | 'dribble'
  | 'pass'
  | 'cross'
  | 'shoot'
  | 'receive'
  | 'layoff'
  | 'header'
  | 'tackle'
  | 'block'
  | 'scan'
  | 'hold'

/** Actions that read as "planted / working the ball", not "travelling". */
export const STATIONARY_ACTIONS: Action[] = [
  'idle',
  'pass',
  'shoot',
  'cross',
  'receive',
  'layoff',
  'header',
  'tackle',
  'block',
  'scan',
  'hold',
]

export type Team = 'attack' | 'defense' | 'neutral' | 'gk'

export interface Keyframe {
  t: number
  x: number
  z: number
  action?: Action
}

export interface BallKeyframe {
  t: number
  x: number
  z: number
  /** Height above turf; defaults to ball radius. */
  y?: number
  /** Who is in possession at this moment — used for the carry offset. */
  carrier?: string
}

export interface DrillPlayer {
  id: string
  /** Short label rendered above the figure, e.g. "CM", "GK". */
  role: string
  /** Long-form role name shown in the drill card. */
  name: string
  team: Team
  path: Keyframe[]
  /**
   * Id of an opponent this player defends. When set, the authored path is
   * blended toward a goal-side position relative to that opponent, so
   * jockeying and covering track the man instead of drifting off him.
   */
  marks?: string
  /** How strongly marking overrides the authored path, 0..1. Default 0.55. */
  markWeight?: number
  /** Metres of goal-side separation to hold. Default 1.4. */
  markDistance?: number
}

/**
 * A coaching phase of the drill. Drives the phase strip, the in-viewport
 * caption, which players are highlighted, and the per-player hover cue.
 */
export interface Phase {
  t0: number
  t1: number
  title: string
  text: string
  /** Players central to this phase; others dim while it is active. */
  focus?: string[]
  /** One short instruction per player, keyed by player id. */
  cues?: Record<string, string>
}

export type EquipmentKind =
  | 'cone'
  | 'disc'
  | 'pole'
  | 'hurdle'
  | 'ladder'
  | 'mini-goal'
  | 'full-goal'
  | 'mannequin'
  | 'gate'

export interface Equipment {
  kind: EquipmentKind
  x: number
  z: number
  /** Y rotation in degrees. */
  rot?: number
  color?: string
}

/** Rectangular markings drawn on the turf (grids, zones, lanes, channels). */
export interface Zone {
  x: number
  z: number
  w: number
  d: number
  label?: string
  color?: string
  /** Fill the zone with a translucent tint instead of an outline only. */
  fill?: boolean
}

export type PitchView = 'full' | 'half' | 'attacking-third' | 'grid' | 'box'

export interface Drill {
  id: string
  /** Source manual. */
  category: 'Attacking' | 'Defending' | 'Passing'
  /** Play-style grouping inside the manual. */
  group: string
  title: string
  /** Drill number/code as printed in the manual, e.g. "3" or "B2". */
  code: string
  style: string
  area: string
  playerCount: string
  durationLabel: string
  description: string
  setup: string
  keyPoints: string[]
  simulationNote?: string
  /** Which slice of the pitch the camera should frame. */
  view: PitchView
  /** Animation length in seconds (one repetition). */
  duration: number
  /**
   * Stretches the whole timeline at load. Ball flight speed is derived from
   * distance and so is unaffected — only the gaps between actions grow, which
   * is what separates a rushed pattern from a readable one.
   */
  timeScale?: number
  players: DrillPlayer[]
  ball: BallKeyframe[]
  equipment?: Equipment[]
  zones?: Zone[]
  phases?: Phase[]
}

/* ------------------------------------------------------------------ */
/* Compact authoring helpers — keeps the drill files readable          */
/* ------------------------------------------------------------------ */

export type PathTuple = [t: number, x: number, z: number, action?: Action]
export type BallTuple = [t: number, x: number, z: number, y?: number]

export function player(
  id: string,
  role: string,
  name: string,
  team: Team,
  path: PathTuple[],
  marking?: Pick<DrillPlayer, 'marks' | 'markWeight' | 'markDistance'>,
): DrillPlayer {
  return {
    id,
    role,
    name,
    team,
    path: path.map(([t, x, z, action]) => ({ t, x, z, action })),
    ...marking,
  }
}

export function ballPath(pts: BallTuple[]): BallKeyframe[] {
  return pts.map(([t, x, z, y]) => ({ t, x, z, y }))
}
