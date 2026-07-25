import { useEffect, useState } from 'react'
import type { Drill } from '@/lib/types'
import { useSim } from '@/lib/store'
import { TEAM_COLORS } from './scene/Player'
import { cn } from '@/lib/utils'

/** The phase in force at time `t`, if the drill has been phased. */
export function phaseAt(drill: Drill, t: number) {
  return drill.phases?.find((p) => t >= p.t0 && t < p.t1) ?? null
}

/**
 * Cursor-following tooltip for the hovered figure: who they are and the one
 * thing they are doing in this phase of the drill.
 */
export function HoverTooltip({ drill }: { drill: Drill }) {
  const hoveredId = useSim((s) => s.hoveredId)
  const time = useSim((s) => s.time)
  const [pos, setPos] = useState({ x: 0, y: 0 })

  useEffect(() => {
    if (!hoveredId) return
    const onMove = (e: MouseEvent) => setPos({ x: e.clientX, y: e.clientY })
    window.addEventListener('mousemove', onMove)
    return () => window.removeEventListener('mousemove', onMove)
  }, [hoveredId])

  if (!hoveredId) return null
  const player = drill.players.find((p) => p.id === hoveredId)
  if (!player) return null

  const cue = phaseAt(drill, time)?.cues?.[player.id]
  const flip = pos.x > window.innerWidth - 300

  return (
    <div
      className="pointer-events-none fixed z-50 max-w-[280px]"
      style={{
        left: flip ? pos.x - 292 : pos.x + 16,
        top: Math.min(pos.y + 14, window.innerHeight - 130),
      }}
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
  const time = useSim((s) => s.time)
  const phase = phaseAt(drill, time)
  if (!phase) return null

  const index = drill.phases!.indexOf(phase) + 1

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
  const time = useSim((s) => s.time)
  const seek = useSim((s) => s.seek)
  if (!drill.phases?.length) return null

  return (
    <div className="mt-2 flex gap-1">
      {drill.phases.map((p, i) => {
        const active = time >= p.t0 && time < p.t1
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
