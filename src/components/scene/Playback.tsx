import { useEffect, useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import { clock } from '@/lib/clock'
import { useSim } from '@/lib/store'
import { useSimulation } from '@/lib/simContext'

/** How long after a pass the auto-pause releases, in drill seconds. */
const STEP_GRACE = 0.05

/**
 * Drives the shared playhead and advances the simulation. Runs inside the
 * Canvas so animation never costs a React render; the store is refreshed
 * ~20x a second purely to keep the scrub slider and timecode in sync.
 */
export function Playback({ duration }: { duration: number }) {
  const sim = useSimulation()
  const publish = useSim((s) => s.publishTime)
  const pause = useSim((s) => s.pause)
  const acc = useRef(0)
  const lastStop = useRef(-1)

  const seekToken = useSim((s) => s.seekToken)
  useEffect(() => {
    clock.t = useSim.getState().time
    clock.duration = duration
    lastStop.current = -1
    sim.update(clock.t)
  }, [seekToken, duration, sim])

  useFrame((_, delta) => {
    const { playing, speed, loop, stepMode } = useSim.getState()
    clock.duration = duration

    if (playing) {
      const prev = clock.t
      clock.t += Math.min(delta, 0.1) * speed

      // Step mode: halt on the first pass crossed this frame.
      if (stepMode) {
        const hit = sim.passes.find(
          (p) =>
            p.t + STEP_GRACE > prev &&
            p.t + STEP_GRACE <= clock.t &&
            p.t !== lastStop.current,
        )
        if (hit) {
          clock.t = hit.t + STEP_GRACE
          lastStop.current = hit.t
          pause()
        }
      }

      if (clock.t >= duration) {
        if (loop) {
          clock.t = clock.t % duration
          lastStop.current = -1
        } else {
          clock.t = duration
          pause()
        }
      }
    }

    sim.update(clock.t)

    acc.current += delta
    if (acc.current >= 0.05) {
      acc.current = 0
      publish(clock.t)
    }
  })

  return null
}
