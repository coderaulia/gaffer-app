import type { Drill, Phase } from '../types'
import { ATTACKING } from './attacking'
import { DEFENDING } from './defending'
import { PASSING } from './passing'
import { ATTACKING_PHASES } from './phases-attacking'
import { DEFENDING_PHASES } from './phases-defending'
import { PASSING_PHASES } from './phases-passing'

const PHASES: Record<string, Phase[]> = {
  ...ATTACKING_PHASES,
  ...DEFENDING_PHASES,
  ...PASSING_PHASES,
}

/**
 * Timeline stretch per drill, chosen from the measured gap between
 * deliveries. The passing patterns were authored far too tight — several ran
 * a pass every 0.7s, which reads as a blur — so they are slowed to roughly a
 * pass every 1.5s. Ball speed is unaffected: only the spacing changes.
 */
const TIME_SCALE: Record<string, number> = {
  // Headroom so the closing cross or shot has time to complete its flight
  // instead of being started early to fit inside the drill.
  'atk-8': 1.08,
  'atk-10': 1.14,
  'atk-14': 1.08,
  'pas-a2': 1.7,
  'pas-b1': 1.45,
  'pas-b2': 1.3,
  'pas-b3': 1.45,
  'pas-c1': 1.65,
  'pas-c2': 1.25,
  'pas-c3': 1.45,
  'pas-d1': 1.5,
  'pas-d2': 1.42,
  'pas-d3': 1.3,
  'pas-e2': 1.6,
  'pas-e3': 1.35,
  'pas-f1': 1.4,
  'pas-f2': 1.7,
  'pas-g1': 1.8,
  'pas-g2': 2.1,
  'pas-g3': 1.4,
  'pas-a1': 1.15,
  'pas-a3': 1.1,
  'pas-e1': 1.15,
  'pas-f3': 1.15,
}

/** Multiply every time in a drill by `k`, leaving all positions untouched. */
function stretch(d: Drill, k: number): Drill {
  if (k === 1) return d
  return {
    ...d,
    duration: round(d.duration * k),
    players: d.players.map((p) => ({
      ...p,
      path: p.path.map((f) => ({ ...f, t: round(f.t * k) })),
    })),
    ball: d.ball.map((b) => ({ ...b, t: round(b.t * k) })),
    phases: d.phases?.map((p) => ({
      ...p,
      t0: round(p.t0 * k),
      t1: round(p.t1 * k),
    })),
  }
}

const round = (n: number) => Math.round(n * 1000) / 1000

/** Drill definitions with phases attached and timelines paced. */
export const DRILLS: Drill[] = [...ATTACKING, ...DEFENDING, ...PASSING].map(
  (d) => stretch({ ...d, phases: PHASES[d.id] }, TIME_SCALE[d.id] ?? 1),
)

export type Category = Drill['category']

export const CATEGORY_ORDER: Category[] = ['Attacking', 'Defending', 'Passing']

export interface DrillGroup {
  group: string
  drills: Drill[]
}

export interface CategoryTree {
  category: Category
  count: number
  groups: DrillGroup[]
}

/** Category -> play-style group -> drills, preserving manual ordering. */
export const DRILL_TREE: CategoryTree[] = CATEGORY_ORDER.map((category) => {
  const inCategory = DRILLS.filter((d) => d.category === category)
  const groups: DrillGroup[] = []
  for (const drill of inCategory) {
    const existing = groups.find((g) => g.group === drill.group)
    if (existing) existing.drills.push(drill)
    else groups.push({ group: drill.group, drills: [drill] })
  }
  return { category, count: inCategory.length, groups }
})

export function searchDrills(query: string): Drill[] {
  const q = query.trim().toLowerCase()
  if (!q) return []
  return DRILLS.filter((d) =>
    [d.title, d.group, d.style, d.category, d.code]
      .join(' ')
      .toLowerCase()
      .includes(q),
  )
}
