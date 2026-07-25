import { create } from 'zustand'
import { DRILLS } from './drills'
import type { Drill } from './types'

export type SpeedLevel = 0.5 | 1 | 2
export type CameraPreset = 'broadcast' | 'sideline' | 'topdown'

interface SimState {
  drillId: string
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
  sidebarOpen: boolean

  drill: () => Drill
  selectDrill: (id: string) => void
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
  setSidebarOpen: (v: boolean) => void
}

export const useSim = create<SimState>((set, get) => ({
  drillId: DRILLS[0].id,
  playing: true,
  speed: 1,
  loop: true,
  camera: 'broadcast',
  time: 0,
  seekToken: 0,
  showLabels: true,
  showTrails: true,
  sidebarOpen: true,

  drill: () => DRILLS.find((d) => d.id === get().drillId) ?? DRILLS[0],
  selectDrill: (id) =>
    set((s) => ({
      drillId: id,
      time: 0,
      playing: true,
      seekToken: s.seekToken + 1,
    })),
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
  setSidebarOpen: (sidebarOpen) => set({ sidebarOpen }),
}))
