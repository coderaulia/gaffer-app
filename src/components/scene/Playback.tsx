import { useEffect, useRef } from 'react'
import { useFrame, useThree } from '@react-three/fiber'
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
export function Playback() {
  const sim = useSimulation()
  const duration = sim.duration
  const publishTime = useSim((s) => s.publishTime)
  const published = useRef(-1)
  const publish = (t: number) => {
    published.current = t
    publishTime(t)
  }
  const pause = useSim((s) => s.pause)
  const acc = useRef(0)
  const lastStop = useRef(-1)
  const invalidate = useThree((s) => s.invalidate)

  // The canvas renders on demand; wake the loop whenever playback starts.
  const playing = useSim((s) => s.playing)
  useEffect(() => {
    if (playing) invalidate()
  }, [playing, invalidate])

  const seekToken = useSim((s) => s.seekToken)
  useEffect(() => {
    clock.t = useSim.getState().time
    published.current = clock.t
    clock.duration = duration
    lastStop.current = -1
    sim.update(clock.t)
    invalidate()
  }, [seekToken, duration, sim, invalidate])

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

    // Keep the loop alive only while there is motion to show.
    // On stopping, publish the exact resting time so the scrubber agrees.
    if (useSim.getState().playing) invalidate()
    else if (published.current !== clock.t) publish(clock.t)
  })

  return null
}
