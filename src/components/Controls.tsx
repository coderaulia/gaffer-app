import { useEffect } from 'react'
import {
  ChevronLeft,
  ChevronRight,
  Footprints,
  Pause,
  Play,
  Repeat,
  RotateCcw,
  Route,
  Tag,
  Video,
} from 'lucide-react'
import type { Drill } from '@/lib/types'
import type { DrillSim } from '@/lib/sim'
import { useSim, type CameraPreset, type SpeedLevel } from '@/lib/store'
import { Button } from './ui/button'
import { Slider } from './ui/slider'
import { ToggleGroup, ToggleGroupItem } from './ui/toggle-group'
import { PhaseStrip } from './Overlays'
import { cn, formatTime } from '@/lib/utils'

const SPEEDS: { value: SpeedLevel; label: string; hint: string }[] = [
  { value: 0.5, label: '0.5×', hint: 'Slow — coaching detail' },
  { value: 1, label: '1×', hint: 'Match tempo' },
  { value: 2, label: '2×', hint: 'Fast — pattern overview' },
]

const CAMERAS: { value: CameraPreset; label: string }[] = [
  { value: 'broadcast', label: 'Broadcast' },
  { value: 'sideline', label: 'Sideline' },
  { value: 'topdown', label: 'Top-down' },
  { value: 'board', label: 'Board' },
]

/**
 * Timecode and scrub bar — the only part of the controls that follows the
 * playhead, so only it re-renders as the scene publishes the clock.
 */
function Timeline({ duration }: { duration: number }) {
  const time = useSim((s) => s.time)
  const seek = useSim((s) => s.seek)
  return (
    <>
      <span className="w-20 shrink-0 font-mono text-xs text-muted tabular-nums">
        {formatTime(time)} / {formatTime(duration)}
      </span>

      <Slider
        value={[Math.min(time, duration)]}
        min={0}
        max={duration}
        step={0.02}
        onValueChange={([v]) => seek(v)}
        aria-label="Scrub timeline"
        className="flex-1"
      />
    </>
  )
}

export function Controls({ drill, sim }: { drill: Drill; sim: DrillSim }) {
  const playing = useSim((s) => s.playing)
  const toggle = useSim((s) => s.toggle)
  const speed = useSim((s) => s.speed)
  const setSpeed = useSim((s) => s.setSpeed)
  const loop = useSim((s) => s.loop)
  const setLoop = useSim((s) => s.setLoop)
  const camera = useSim((s) => s.camera)
  const setCamera = useSim((s) => s.setCamera)
  const seek = useSim((s) => s.seek)
  const showLabels = useSim((s) => s.showLabels)
  const setShowLabels = useSim((s) => s.setShowLabels)
  const showTrails = useSim((s) => s.showTrails)
  const setShowTrails = useSim((s) => s.setShowTrails)
  const showArrows = useSim((s) => s.showArrows)
  const setShowArrows = useSim((s) => s.setShowArrows)
  const stepMode = useSim((s) => s.stepMode)
  const setStepMode = useSim((s) => s.setStepMode)

  // Deliveries and the true playback length both come from the retimed
  // simulation, so the slider matches what the scene is actually doing.
  const { passes, duration } = sim

  const jumpPass = (dir: 1 | -1) => {
    const t = useSim.getState().time
    const target =
      dir === 1
        ? passes.find((p) => p.t > t + 0.08)
        : [...passes].reverse().find((p) => p.t < t - 0.12)
    seek(target ? target.t + 0.05 : dir === 1 ? duration : 0)
    useSim.getState().pause()
  }

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      const el = e.target as HTMLElement | null
      if (el && (el.tagName === 'INPUT' || el.tagName === 'TEXTAREA')) return
      const s = useSim.getState()
      switch (e.code) {
        case 'Space':
          e.preventDefault()
          s.toggle()
          break
        case 'ArrowLeft':
          e.preventDefault()
          s.seek(Math.max(0, s.time - 0.25))
          break
        case 'ArrowRight':
          e.preventDefault()
          s.seek(Math.min(duration, s.time + 0.25))
          break
        case 'BracketLeft':
          jumpPass(-1)
          break
        case 'BracketRight':
          jumpPass(1)
          break
        case 'Digit1':
          s.setCamera('broadcast')
          break
        case 'Digit2':
          s.setCamera('sideline')
          break
        case 'Digit3':
          s.setCamera('topdown')
          break
        case 'Digit4':
          s.setCamera('board')
          break
      }
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [duration, passes])

  return (
    <div className="border-t border-border bg-panel px-4 py-3">
      <div className="flex items-center gap-2.5">
        <Button
          variant="ghost"
          size="icon"
          onClick={() => jumpPass(-1)}
          aria-label="Previous pass"
          title="Previous pass ( [ )"
        >
          <ChevronLeft className="h-4 w-4" />
        </Button>

        <Button
          variant="accent"
          size="icon"
          onClick={toggle}
          aria-label={playing ? 'Pause' : 'Play'}
          title={playing ? 'Pause (Space)' : 'Play (Space)'}
        >
          {playing ? (
            <Pause className="h-4 w-4" />
          ) : (
            <Play className="ml-0.5 h-4 w-4" />
          )}
        </Button>

        <Button
          variant="ghost"
          size="icon"
          onClick={() => jumpPass(1)}
          aria-label="Next pass"
          title="Next pass ( ] )"
        >
          <ChevronRight className="h-4 w-4" />
        </Button>

        <Button
          variant="ghost"
          size="icon"
          onClick={() => seek(0)}
          aria-label="Restart"
          title="Restart"
        >
          <RotateCcw className="h-4 w-4" />
        </Button>

        <Timeline duration={duration} />

        <Button
          variant="ghost"
          size="icon"
          onClick={() => setLoop(!loop)}
          aria-label="Toggle loop"
          title="Loop"
          className={cn(loop && 'text-accent')}
        >
          <Repeat className="h-4 w-4" />
        </Button>
      </div>

      <PhaseStrip drill={drill} />

      <div className="mt-3 flex flex-wrap items-center gap-x-5 gap-y-2">
        <div className="flex items-center gap-2">
          <span className="text-[11px] tracking-wide text-muted uppercase">
            Speed
          </span>
          <ToggleGroup
            type="single"
            value={String(speed)}
            onValueChange={(v) => v && setSpeed(Number(v) as SpeedLevel)}
          >
            {SPEEDS.map((s) => (
              <ToggleGroupItem
                key={s.value}
                value={String(s.value)}
                title={s.hint}
              >
                {s.label}
              </ToggleGroupItem>
            ))}
          </ToggleGroup>
        </div>

        <div className="flex items-center gap-2">
          <Video className="h-3.5 w-3.5 text-muted" />
          <ToggleGroup
            type="single"
            value={camera}
            onValueChange={(v) => v && setCamera(v as CameraPreset)}
          >
            {CAMERAS.map((c, i) => (
              <ToggleGroupItem
                key={c.value}
                value={c.value}
                title={`${c.label} (${i + 1})`}
              >
                {c.label}
              </ToggleGroupItem>
            ))}
          </ToggleGroup>
        </div>

        <Button
          variant={stepMode ? 'accent' : 'outline'}
          size="sm"
          onClick={() => setStepMode(!stepMode)}
          title="Pause automatically at every pass"
        >
          <Footprints className="h-3.5 w-3.5" />
          Step by pass
        </Button>

        <div className="ml-auto flex items-center gap-1">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setShowArrows(!showArrows)}
            className={cn(showArrows && 'text-accent')}
            title="Toggle numbered pass arrows"
          >
            <ChevronRight className="h-3.5 w-3.5" />
            Passes
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setShowLabels(!showLabels)}
            className={cn(showLabels && 'text-accent')}
            title="Toggle role labels"
          >
            <Tag className="h-3.5 w-3.5" />
            Labels
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setShowTrails(!showTrails)}
            className={cn(showTrails && 'text-accent')}
            title="Toggle movement paths"
          >
            <Route className="h-3.5 w-3.5" />
            Paths
          </Button>
        </div>
      </div>
    </div>
  )
}
