import { useEffect, useRef } from 'react'
import type { Drill } from '@/lib/types'
import { useSim } from '@/lib/store'
import { TEAM_COLORS } from '@/lib/teamColors'
import { cn } from '@/lib/utils'

/** The phase in force at time `t`, if the drill has been phased. */
export function phaseAt(drill: Drill, t: number) {
  return drill.phases?.find((p) => t >= p.t0 && t < p.t1) ?? null
}

/**
 * Index of the phase in force, or -1. Components subscribe to this rather
 * than the raw playhead so they re-render once per phase change instead of
 * every time the scene publishes the clock.
 */
export function usePhaseIndex(drill: Drill) {
  return useSim((s) =>
    drill.phases
      ? drill.phases.findIndex((p) => s.time >= p.t0 && s.time < p.t1)
      : -1,
  )
}

/** Last cursor position, so the tooltip can appear in place on hover. */
const lastPointer = { x: 0, y: 0 }
if (typeof window !== 'undefined') {
  window.addEventListener(
    'pointermove',
    (e) => {
      lastPointer.x = e.clientX
      lastPointer.y = e.clientY
    },
    { passive: true },
  )
}

/**
 * Cursor-following tooltip for the hovered figure: who they are and the one
 * thing they are doing in this phase of the drill.
 */
export function HoverTooltip({ drill }: { drill: Drill }) {
  const hoveredId = useSim((s) => s.hoveredId)
  const phaseIndex = usePhaseIndex(drill)
  const box = useRef<HTMLDivElement>(null)

  // Follow the cursor by writing the transform directly — no React render
  // per mousemove.
  useEffect(() => {
    if (!hoveredId) return
    let raf = 0
    let x = lastPointer.x
    let y = lastPointer.y
    const place = () => {
      raf = 0
      const el = box.current
      if (!el) return
      const flip = x > window.innerWidth - 300
      const left = flip ? x - 292 : x + 16
      const top = Math.min(y + 14, window.innerHeight - 130)
      el.style.transform = `translate3d(${left}px, ${top}px, 0)`
      el.style.visibility = 'visible'
    }
    const onMove = (e: MouseEvent) => {
      x = e.clientX
      y = e.clientY
      if (!raf) raf = requestAnimationFrame(place)
    }
    window.addEventListener('mousemove', onMove, { passive: true })
    place()
    return () => {
      window.removeEventListener('mousemove', onMove)
      if (raf) cancelAnimationFrame(raf)
    }
  }, [hoveredId])

  if (!hoveredId) return null
  const player = drill.players.find((p) => p.id === hoveredId)
  if (!player) return null

  const cue =
    phaseIndex >= 0 ? drill.phases![phaseIndex].cues?.[player.id] : undefined

  return (
    <div
      ref={box}
      className="pointer-events-none fixed top-0 left-0 z-50 max-w-[280px] will-change-transform"
      style={{ visibility: 'hidden' }}
    >
      <div className="rounded-lg border border-border bg-panel/95 px-3 py-2.5 shadow-xl backdrop-blur">
        <div className="flex items-center gap-2">
          <span
            className="rounded px-1.5 py-0.5 text-[10px] font-bold"
            style={{
              background: `${TEAM_COLORS[player.team].shirt}26`,
              color: TEAM_COLORS[player.team].shirt,
            }}
          >
            {player.role}
          </span>
          <span className="text-[12px] font-medium">{player.name}</span>
        </div>
        {cue ? (
          <p className="mt-1.5 text-[12px] leading-relaxed text-fg/85">{cue}</p>
        ) : (
          <p className="mt-1.5 text-[11px] text-muted italic">
            No instruction for this moment
          </p>
        )}
      </div>
    </div>
  )
}

/** Caption card that narrates the phase currently on screen. */
export function PhaseCaption({ drill }: { drill: Drill }) {
  const phaseIndex = usePhaseIndex(drill)
  if (phaseIndex < 0) return null

  const phase = drill.phases![phaseIndex]
  const index = phaseIndex + 1

  return (
    <div className="pointer-events-none absolute bottom-4 left-4 max-w-md">
      <div className="rounded-lg border border-border bg-panel/90 px-4 py-3 shadow-xl backdrop-blur">
        <p className="text-[10px] font-semibold tracking-widest text-accent uppercase">
          Phase {index} of {drill.phases!.length} · {phase.title}
        </p>
        <p className="mt-1 text-[13px] leading-relaxed text-fg/90">
          {phase.text}
        </p>
      </div>
    </div>
  )
}

/** Segmented strip under the timeline: click a phase to jump to it. */
export function PhaseStrip({ drill }: { drill: Drill }) {
  const phaseIndex = usePhaseIndex(drill)
  const seek = useSim((s) => s.seek)
  if (!drill.phases?.length) return null

  return (
    <div className="mt-2 flex gap-1">
      {drill.phases.map((p, i) => {
        const active = i === phaseIndex
        return (
          <button
            key={i}
            onClick={() => seek(p.t0 + 0.01)}
            title={p.text}
            style={{ flexGrow: p.t1 - p.t0 }}
            className={cn(
              'group relative h-6 min-w-0 rounded border px-2 text-[10px] font-medium transition-colors',
              active
                ? 'border-accent bg-accent/15 text-accent'
                : 'border-border bg-panel-2 text-muted hover:text-fg',
            )}
          >
            <span className="block truncate">
              {i + 1}. {p.title}
            </span>
          </button>
        )
      })}
    </div>
  )
}
