import { create } from 'zustand'
import { DRILLS } from './drills'
import { useCoach } from './coach'
import type { Drill } from './types'

export type SpeedLevel = 0.5 | 1 | 2
export type CameraPreset = 'broadcast' | 'sideline' | 'topdown' | 'board'

/** Management screens. A drill being open takes precedence over all of them. */
export type Route = 'home' | 'drills' | 'sessions' | 'squad' | 'settings'

interface SimState {
  /** Which management page is showing when no drill is open. */
  route: Route
  /** Session being edited on the Sessions page, if any. */
  editingSessionId: string | null
  /** Player being viewed on the Squad page, if any. */
  editingPlayerId: string | null
  /** null while the management screens are showing — no pitch, nothing playing. */
  drillId: string | null
  playing: boolean
  speed: SpeedLevel
  loop: boolean
  camera: CameraPreset
  /** Published playhead in seconds — updated by the scene at ~20Hz. */
  time: number
  /** Bumped whenever the user scrubs, so the scene resyncs its clock. */
  seekToken: number
  showLabels: boolean
  showTrails: boolean
  showArrows: boolean
  /** Pause automatically at each pass so the pattern can be stepped through. */
  stepMode: boolean
  sidebarOpen: boolean
  hoveredId: string | null

  drill: () => Drill | null
  setRoute: (r: Route) => void
  setEditingSession: (id: string | null) => void
  setEditingPlayer: (id: string | null) => void
  selectDrill: (id: string) => void
  backToMenu: () => void
  play: () => void
  pause: () => void
  toggle: () => void
  setSpeed: (s: SpeedLevel) => void
  setLoop: (v: boolean) => void
  setCamera: (c: CameraPreset) => void
  seek: (t: number) => void
  publishTime: (t: number) => void
  setShowLabels: (v: boolean) => void
  setShowTrails: (v: boolean) => void
  setShowArrows: (v: boolean) => void
  setStepMode: (v: boolean) => void
  setSidebarOpen: (v: boolean) => void
  setHovered: (id: string | null) => void
}

export const useSim = create<SimState>((set, get) => ({
  route: 'home',
  editingSessionId: null,
  editingPlayerId: null,
  drillId: null,
  playing: false,
  speed: 1,
  loop: true,
  camera: 'broadcast',
  time: 0,
  seekToken: 0,
  showLabels: true,
  showTrails: true,
  showArrows: true,
  stepMode: false,
  sidebarOpen: true,
  hoveredId: null,

  drill: () => DRILLS.find((d) => d.id === get().drillId) ?? null,
  setRoute: (route) => set({ route, drillId: null, playing: false }),
  setEditingSession: (editingSessionId) => set({ editingSessionId }),
  setEditingPlayer: (editingPlayerId) => set({ editingPlayerId }),
  selectDrill: (id) => {
    useCoach.getState().noteDrillOpened(id)
    set((s) => ({
      drillId: id,
      time: 0,
      playing: true,
      hoveredId: null,
      seekToken: s.seekToken + 1,
    }))
  },
  backToMenu: () =>
    set({ drillId: null, playing: false, time: 0, route: 'drills' }),
  play: () => set({ playing: true }),
  pause: () => set({ playing: false }),
  toggle: () => set((s) => ({ playing: !s.playing })),
  setSpeed: (speed) => set({ speed }),
  setLoop: (loop) => set({ loop }),
  setCamera: (camera) => set({ camera }),
  seek: (time) => set((s) => ({ time, seekToken: s.seekToken + 1 })),
  publishTime: (time) => set({ time }),
  setShowLabels: (showLabels) => set({ showLabels }),
  setShowTrails: (showTrails) => set({ showTrails }),
  setShowArrows: (showArrows) => set({ showArrows }),
  setStepMode: (stepMode) => set({ stepMode }),
  setSidebarOpen: (sidebarOpen) => set({ sidebarOpen }),
  setHovered: (hoveredId) => set({ hoveredId }),
}))
