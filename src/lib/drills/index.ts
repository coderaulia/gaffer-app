import type { Drill } from '../types'
import { ATTACKING } from './attacking'
import { DEFENDING } from './defending'
import { PASSING } from './passing'

export const DRILLS: Drill[] = [...ATTACKING, ...DEFENDING, ...PASSING]

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
