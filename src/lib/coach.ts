import { create } from 'zustand'
import { persist } from 'zustand/middleware'

/**
 * The coach's own data — squad, sessions and recent activity.
 *
 * Kept separate from `useSim`, which holds throwaway playback state. This
 * store is persisted to localStorage so a session plan survives a reload
 * pitch-side. There is no backend yet; the shape below is what a backend
 * would eventually store.
 */

export type Availability = 'available' | 'doubtful' | 'injured' | 'suspended'

export const AVAILABILITY_LABEL: Record<Availability, string> = {
  available: 'Available',
  doubtful: 'Doubtful',
  injured: 'Injured',
  suspended: 'Suspended',
}

export const AVAILABILITY_COLOR: Record<Availability, string> = {
  available: '#57c98a',
  doubtful: '#f2c14e',
  injured: '#e35d4a',
  suspended: '#9aa3ad',
}

export type Foot = 'Left' | 'Right' | 'Both'

export const POSITIONS = [
  'GK',
  'RB',
  'CB',
  'LB',
  'RWB',
  'LWB',
  'DM',
  'CM',
  'AM',
  'RW',
  'LW',
  'ST',
] as const

export type Position = (typeof POSITIONS)[number]

export interface Player {
  id: string
  name: string
  position: Position
  foot: Foot
  availability: Availability
  squadNumber?: number
  notes: string
  createdAt: number
}

/** One drill slotted into a session, with the time given to it. */
export interface SessionBlock {
  id: string
  drillId: string
  minutes: number
  note?: string
}

export interface Session {
  id: string
  title: string
  /** ISO date, yyyy-mm-dd. */
  date: string
  notes: string
  blocks: SessionBlock[]
  createdAt: number
}

interface CoachState {
  players: Player[]
  sessions: Session[]
  /** Drill ids, most recently opened first. */
  recentDrillIds: string[]
  coachName: string
  clubName: string

  addPlayer: (p: Omit<Player, 'id' | 'createdAt'>) => string
  updatePlayer: (id: string, patch: Partial<Player>) => void
  removePlayer: (id: string) => void

  createSession: (title?: string, date?: string) => string
  updateSession: (id: string, patch: Partial<Session>) => void
  removeSession: (id: string) => void
  addBlock: (sessionId: string, drillId: string, minutes?: number) => void
  updateBlock: (
    sessionId: string,
    blockId: string,
    patch: Partial<SessionBlock>,
  ) => void
  removeBlock: (sessionId: string, blockId: string) => void
  moveBlock: (sessionId: string, blockId: string, direction: -1 | 1) => void

  noteDrillOpened: (drillId: string) => void
  setCoachName: (v: string) => void
  setClubName: (v: string) => void
  resetAll: () => void
}

const uid = () => Math.random().toString(36).slice(2, 10)

export const todayISO = () => new Date().toISOString().slice(0, 10)

export const useCoach = create<CoachState>()(
  persist(
    (set) => ({
      players: [],
      sessions: [],
      recentDrillIds: [],
      coachName: '',
      clubName: 'Vanaila FC',

      addPlayer: (p) => {
        const id = uid()
        set((s) => ({
          players: [...s.players, { ...p, id, createdAt: Date.now() }],
        }))
        return id
      },
      updatePlayer: (id, patch) =>
        set((s) => ({
          players: s.players.map((p) => (p.id === id ? { ...p, ...patch } : p)),
        })),
      removePlayer: (id) =>
        set((s) => ({ players: s.players.filter((p) => p.id !== id) })),

      createSession: (title, date) => {
        const id = uid()
        set((s) => ({
          sessions: [
            {
              id,
              title: title?.trim() || 'Untitled session',
              date: date || todayISO(),
              notes: '',
              blocks: [],
              createdAt: Date.now(),
            },
            ...s.sessions,
          ],
        }))
        return id
      },
      updateSession: (id, patch) =>
        set((s) => ({
          sessions: s.sessions.map((x) =>
            x.id === id ? { ...x, ...patch } : x,
          ),
        })),
      removeSession: (id) =>
        set((s) => ({ sessions: s.sessions.filter((x) => x.id !== id) })),

      addBlock: (sessionId, drillId, minutes = 15) =>
        set((s) => ({
          sessions: s.sessions.map((x) =>
            x.id === sessionId
              ? {
                  ...x,
                  blocks: [...x.blocks, { id: uid(), drillId, minutes }],
                }
              : x,
          ),
        })),
      updateBlock: (sessionId, blockId, patch) =>
        set((s) => ({
          sessions: s.sessions.map((x) =>
            x.id === sessionId
              ? {
                  ...x,
                  blocks: x.blocks.map((b) =>
                    b.id === blockId ? { ...b, ...patch } : b,
                  ),
                }
              : x,
          ),
        })),
      removeBlock: (sessionId, blockId) =>
        set((s) => ({
          sessions: s.sessions.map((x) =>
            x.id === sessionId
              ? { ...x, blocks: x.blocks.filter((b) => b.id !== blockId) }
              : x,
          ),
        })),
      moveBlock: (sessionId, blockId, direction) =>
        set((s) => ({
          sessions: s.sessions.map((x) => {
            if (x.id !== sessionId) return x
            const i = x.blocks.findIndex((b) => b.id === blockId)
            const j = i + direction
            if (i < 0 || j < 0 || j >= x.blocks.length) return x
            const blocks = [...x.blocks]
            ;[blocks[i], blocks[j]] = [blocks[j], blocks[i]]
            return { ...x, blocks }
          }),
        })),

      noteDrillOpened: (drillId) =>
        set((s) => ({
          recentDrillIds: [
            drillId,
            ...s.recentDrillIds.filter((d) => d !== drillId),
          ].slice(0, 8),
        })),

      setCoachName: (coachName) => set({ coachName }),
      setClubName: (clubName) => set({ clubName }),
      resetAll: () => set({ players: [], sessions: [], recentDrillIds: [] }),
    }),
    { name: 'vanaila-gaffer' },
  ),
)

/** Total planned minutes for a session. */
export function sessionMinutes(session: Session) {
  return session.blocks.reduce((n, b) => n + b.minutes, 0)
}

/** The next session on or after today, else the most recent one. */
export function nextSession(sessions: Session[]): Session | null {
  if (sessions.length === 0) return null
  const today = todayISO()
  const upcoming = sessions
    .filter((s) => s.date >= today)
    .sort((a, b) => a.date.localeCompare(b.date))
  if (upcoming.length) return upcoming[0]
  return [...sessions].sort((a, b) => b.date.localeCompare(a.date))[0]
}

export function availabilityCounts(players: Player[]) {
  const counts: Record<Availability, number> = {
    available: 0,
    doubtful: 0,
    injured: 0,
    suspended: 0,
  }
  for (const p of players) counts[p.availability]++
  return counts
}
