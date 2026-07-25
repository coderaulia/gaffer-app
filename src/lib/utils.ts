import { clsx, type ClassValue } from 'clsx'
import { twMerge } from 'tailwind-merge'
import type { BallKeyframe, Keyframe, Action } from './types'
import { STATIONARY_ACTIONS } from './types'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

/** Smoothstep easing — keeps kinematic motion from looking robotic. */
function ease(k: number) {
  return k * k * (3 - 2 * k)
}

export interface SampledPose {
  x: number
  z: number
  /** Facing angle in radians, derived from direction of travel. */
  heading: number
  /** Ground speed in m/s. */
  speed: number
  action: Action
}

/**
 * Sample a keyframed path at time `t`. Positions are eased between
 * keyframes; heading and speed fall out of the resulting motion, so a
 * single set of waypoints drives both placement and the run cycle.
 */
export function samplePath(path: Keyframe[], t: number): SampledPose {
  if (path.length === 0) {
    return { x: 0, z: 0, heading: 0, speed: 0, action: 'idle' }
  }
  if (path.length === 1 || t <= path[0].t) {
    const k = path[0]
    return { x: k.x, z: k.z, heading: 0, speed: 0, action: k.action ?? 'idle' }
  }

  const last = path[path.length - 1]
  if (t >= last.t) {
    const prev = path[path.length - 2]
    return {
      x: last.x,
      z: last.z,
      heading: Math.atan2(last.x - prev.x, last.z - prev.z),
      speed: 0,
      action: last.action ?? 'idle',
    }
  }

  let i = 0
  while (i < path.length - 2 && path[i + 1].t <= t) i++
  const a = path[i]
  const b = path[i + 1]
  const span = Math.max(b.t - a.t, 1e-4)
  const raw = (t - a.t) / span
  const k = ease(raw)

  const x = a.x + (b.x - a.x) * k
  const z = a.z + (b.z - a.z) * k

  const dx = b.x - a.x
  const dz = b.z - a.z
  const dist = Math.hypot(dx, dz)

  // Instantaneous speed: average speed scaled by the easing derivative.
  const dk = 6 * raw * (1 - raw)
  const speed = (dist / span) * dk

  const action = a.action ?? (dist < 0.35 ? 'idle' : 'run')
  const heading =
    dist < 0.05 ? nearestHeading(path, i) : Math.atan2(dx, dz)

  return { x, z, heading, speed, action }
}

/** When a segment has no travel, borrow facing from the nearest moving one. */
function nearestHeading(path: Keyframe[], i: number): number {
  for (let j = i; j >= 0; j--) {
    if (j + 1 >= path.length) continue
    const dx = path[j + 1].x - path[j].x
    const dz = path[j + 1].z - path[j].z
    if (Math.hypot(dx, dz) > 0.05) return Math.atan2(dx, dz)
  }
  for (let j = i + 1; j < path.length - 1; j++) {
    const dx = path[j + 1].x - path[j].x
    const dz = path[j + 1].z - path[j].z
    if (Math.hypot(dx, dz) > 0.05) return Math.atan2(dx, dz)
  }
  return 0
}

export const BALL_RADIUS = 0.11

/**
 * Sample the ball. When no explicit height is authored the ball is given a
 * parabolic arc for long segments (a flighted pass) and stays grounded for
 * short ones, which reads correctly without running a physics engine.
 */
export function sampleBall(
  path: BallKeyframe[],
  t: number,
): { x: number; z: number; y: number } {
  if (path.length === 0) return { x: 0, z: 0, y: BALL_RADIUS }
  if (path.length === 1 || t <= path[0].t) {
    const k = path[0]
    return { x: k.x, z: k.z, y: k.y ?? BALL_RADIUS }
  }

  const last = path[path.length - 1]
  if (t >= last.t) return { x: last.x, z: last.z, y: last.y ?? BALL_RADIUS }

  let i = 0
  while (i < path.length - 2 && path[i + 1].t <= t) i++
  const a = path[i]
  const b = path[i + 1]
  const span = Math.max(b.t - a.t, 1e-4)
  const k = (t - a.t) / span

  const x = a.x + (b.x - a.x) * k
  const z = a.z + (b.z - a.z) * k

  const ay = a.y ?? BALL_RADIUS
  const by = b.y ?? BALL_RADIUS
  let y = ay + (by - ay) * k

  // Implicit loft on fast, long passes with no authored height.
  const dist = Math.hypot(b.x - a.x, b.z - a.z)
  if (a.y === undefined && b.y === undefined && dist > 12) {
    const apex = Math.min(dist * 0.09, 3.2)
    y += Math.sin(Math.PI * k) * apex
  }
  return { x, z, y: Math.max(y, BALL_RADIUS) }
}

export function isStationary(action: Action) {
  return STATIONARY_ACTIONS.includes(action)
}

export function formatTime(s: number) {
  const whole = Math.floor(s)
  const tenths = Math.floor((s - whole) * 10)
  return `${whole}.${tenths}s`
}
