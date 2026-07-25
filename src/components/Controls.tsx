import { useEffect } from 'react'
import {
  Pause,
  Play,
  Repeat,
  RotateCcw,
  Route,
  Tag,
  Video,
} from 'lucide-react'
import type { Drill } from '@/lib/types'
import { useSim, type CameraPreset, type SpeedLevel } from '@/lib/store'
import { Button } from './ui/button'
import { Slider } from './ui/slider'
import { ToggleGroup, ToggleGroupItem } from './ui/toggle-group'
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
]

export function Controls({ drill }: { drill: Drill }) {
  const {
    playing,
    toggle,
    speed,
    setSpeed,
    loop,
    setLoop,
    camera,
    setCamera,
    time,
    seek,
    showLabels,
    setShowLabels,
    showTrails,
    setShowTrails,
  } = useSim()

  // Space toggles playback, arrow keys scrub, 1/2/3 pick the camera.
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
          s.seek(Math.min(drill.duration, s.time + 0.25))
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
      }
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [drill.duration])

  return (
    <div className="border-t border-border bg-panel px-4 py-3">
      <div className="flex items-center gap-3">
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
          onClick={() => seek(0)}
          aria-label="Restart"
          title="Restart"
        >
          <RotateCcw className="h-4 w-4" />
        </Button>

        <span className="w-20 shrink-0 font-mono text-xs text-muted tabular-nums">
          {formatTime(time)} / {formatTime(drill.duration)}
        </span>

        <Slider
          value={[Math.min(time, drill.duration)]}
          min={0}
          max={drill.duration}
          step={0.02}
          onValueChange={([v]) => seek(v)}
          aria-label="Scrub timeline"
          className="flex-1"
        />

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
              <ToggleGroupItem key={s.value} value={String(s.value)} title={s.hint}>
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

        <div className="ml-auto flex items-center gap-1">
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
