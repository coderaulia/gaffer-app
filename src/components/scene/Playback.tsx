import { useEffect, useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import { clock } from '@/lib/clock'
import { useSim } from '@/lib/store'

/**
 * Drives the shared playhead. Runs inside the Canvas so the animation never
 * costs a React render; the store is refreshed ~20x a second purely so the
 * scrub slider and timecode stay in sync.
 */
export function Playback({ duration }: { duration: number }) {
  const publish = useSim((s) => s.publishTime)
  const pause = useSim((s) => s.pause)
  const acc = useRef(0)

  // Resync when the user scrubs or a new drill is selected.
  const seekToken = useSim((s) => s.seekToken)
  useEffect(() => {
    clock.t = useSim.getState().time
    clock.duration = duration
  }, [seekToken, duration])

  useFrame((_, delta) => {
    const { playing, speed, loop } = useSim.getState()
    clock.duration = duration

    if (playing) {
      clock.t += Math.min(delta, 0.1) * speed
      if (clock.t >= duration) {
        if (loop) {
          clock.t = clock.t % duration
        } else {
          clock.t = duration
          pause()
        }
      }
    }

    acc.current += delta
    if (acc.current >= 0.05) {
      acc.current = 0
      publish(clock.t)
    }
  })

  return null
}
