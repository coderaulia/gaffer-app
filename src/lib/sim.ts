import type {
  Action,
  BallKeyframe,
  Drill,
  DrillPlayer,
  Keyframe,
} from './types'
import { STATIONARY_ACTIONS } from './types'

/**
 * Motion model.
 *
 * Waypoints are turned into a Catmull-Rom spline, sampled at a fixed rate,
 * then low-pass filtered. That single pass buys three things at once:
 *
 *  - continuous velocity through waypoints, so players no longer decelerate
 *    to a dead stop at every keyframe (the old per-segment easing did);
 *  - rounded corners, because filtering a polyline is a corner cut;
 *  - an implicit acceleration limit, since the filter width caps how fast
 *    velocity can change.
 *
 * Everything is precomputed into a table at load, so sampling is a lookup:
 * scrubbing backwards gives byte-identical poses to playing forwards, which
 * a stateful smoother could not guarantee.
 */

const HZ = 60
/** Filter half-width in seconds. Wider = smoother and lazier. */
const SMOOTH = 0.17
/** Below this speed a player is treated as planted and keeps their facing. */
const MOVING = 0.45

export interface Pose {
  x: number
  z: number
  /** Facing, radians, derived from smoothed velocity. */
  heading: number
  /** Ground speed, m/s. */
  speed: number
  /** Distance-integrated stride phase — this is what plants the feet. */
  stride: number
  /** Lean into the turn, radians, from lateral acceleration. */
  bank: number
  action: Action
  /** 0..1 progress through a strike/header, or -1 when not striking. */
  strike: number
  strikeKind: StrikeKind | null
}

export type StrikeKind = 'pass' | 'shoot' | 'cross' | 'layoff' | 'header'

const STRIKE_ACTIONS: StrikeKind[] = [
  'pass',
  'shoot',
  'cross',
  'layoff',
  'header',
]

/* ------------------------------------------------------------------ */
/* Spline                                                              */
/* ------------------------------------------------------------------ */

/** Centripetal Catmull-Rom: no cusps, no overshoot on tight waypoints. */
function catmullRom(
  p0: number,
  p1: number,
  p2: number,
  p3: number,
  t: number,
): number {
  const t2 = t * t
  const t3 = t2 * t
  return (
    0.5 *
    (2 * p1 +
      (-p0 + p2) * t +
      (2 * p0 - 5 * p1 + 4 * p2 - p3) * t2 +
      (-p0 + 3 * p1 - 3 * p2 + p3) * t3)
  )
}

/**
 * Position along a keyframed path at time `t`, before smoothing.
 * Segments bounded by a stationary action are interpolated linearly so a
 * player holding position does not get dragged around by spline tension.
 */
function rawPosition(path: Keyframe[], t: number): { x: number; z: number } {
  const n = path.length
  if (n === 0) return { x: 0, z: 0 }
  if (n === 1 || t <= path[0].t) return { x: path[0].x, z: path[0].z }
  const last = path[n - 1]
  if (t >= last.t) return { x: last.x, z: last.z }

  let i = 0
  while (i < n - 2 && path[i + 1].t <= t) i++

  const a = path[i]
  const b = path[i + 1]
  const k = (t - a.t) / Math.max(b.t - a.t, 1e-4)

  const planted =
    isStationaryAction(a.action) || isStationaryAction(b.action) || n < 4
  if (planted) {
    return { x: a.x + (b.x - a.x) * k, z: a.z + (b.z - a.z) * k }
  }

  const p0 = path[Math.max(i - 1, 0)]
  const p3 = path[Math.min(i + 2, n - 1)]
  return {
    x: catmullRom(p0.x, a.x, b.x, p3.x, k),
    z: catmullRom(p0.z, a.z, b.z, p3.z, k),
  }
}

function isStationaryAction(a?: Action) {
  return a !== undefined && STATIONARY_ACTIONS.includes(a)
}

/** The authored action in force at time `t`. */
function actionAt(path: Keyframe[], t: number): Action {
  let out: Action = path[0]?.action ?? 'idle'
  for (const k of path) {
    if (k.t > t) break
    if (k.action) out = k.action
  }
  return out
}

/* ------------------------------------------------------------------ */
/* Trajectory table                                                    */
/* ------------------------------------------------------------------ */

export class Trajectory {
  readonly xs: Float32Array
  readonly zs: Float32Array
  readonly headings: Float32Array
  readonly speeds: Float32Array
  readonly strides: Float32Array
  readonly banks: Float32Array
  private readonly path: Keyframe[]
  private readonly strikes: { t: number; kind: StrikeKind }[]
  readonly count: number
  readonly duration: number

  constructor(path: Keyframe[], duration: number, marker?: MarkerFn) {
    this.path = path
    this.duration = duration
    this.count = Math.max(2, Math.round(duration * HZ) + 1)
    const n = this.count

    // 1. Raw spline samples, with marking blended in before smoothing so the
    //    reaction itself is smoothed rather than snapping.
    const rx = new Float32Array(n)
    const rz = new Float32Array(n)
    for (let i = 0; i < n; i++) {
      const t = (i / (n - 1)) * duration
      const p = rawPosition(path, t)
      if (marker) {
        const m = marker(t, p)
        rx[i] = m.x
        rz[i] = m.z
      } else {
        rx[i] = p.x
        rz[i] = p.z
      }
    }

    // 2. Two box passes ≈ a Gaussian: rounds corners and caps acceleration.
    this.xs = boxBlur(boxBlur(rx, SMOOTH), SMOOTH)
    this.zs = boxBlur(boxBlur(rz, SMOOTH), SMOOTH)

    // 3. Velocity, heading, bank and stride fall out of the smoothed table.
    this.speeds = new Float32Array(n)
    this.headings = new Float32Array(n)
    this.banks = new Float32Array(n)
    this.strides = new Float32Array(n)

    const dt = duration / (n - 1)
    let heading = 0
    let stride = 0
    let prevVx = 0
    let prevVz = 0

    for (let i = 0; i < n; i++) {
      const i0 = Math.max(i - 1, 0)
      const i1 = Math.min(i + 1, n - 1)
      const span = (i1 - i0) * dt
      const vx = (this.xs[i1] - this.xs[i0]) / span
      const vz = (this.zs[i1] - this.zs[i0]) / span
      const speed = Math.hypot(vx, vz)
      this.speeds[i] = speed

      if (speed > MOVING) heading = Math.atan2(vx, vz)
      this.headings[i] = heading

      // Lateral acceleration -> lean, the way a runner banks into a turn.
      const ax = (vx - prevVx) / dt
      const az = (vz - prevVz) / dt
      const lateral = (ax * Math.cos(heading) - az * Math.sin(heading)) * -1
      this.banks[i] = clamp(lateral * 0.028, -0.32, 0.32)
      prevVx = vx
      prevVz = vz

      // Stride advances with ground covered, not with wall time — this is
      // what stops the feet from sliding. Longer strides at higher speed.
      const strideLength = clamp(1.05 + speed * 0.2, 1.05, 2.5)
      stride += (speed * dt) / strideLength * Math.PI
      this.strides[i] = stride
    }

    // Backfill the facing held before the first real movement.
    const firstMoving = this.headings.findIndex((_, i) => this.speeds[i] > MOVING)
    if (firstMoving > 0) {
      const h = this.headings[firstMoving]
      for (let i = 0; i < firstMoving; i++) this.headings[i] = h
    }

    this.strikes = path
      .filter((k) => STRIKE_ACTIONS.includes(k.action as StrikeKind))
      .map((k) => ({ t: k.t, kind: k.action as StrikeKind }))
  }

  sample(t: number, out: Pose): Pose {
    const n = this.count
    const clamped = clamp(t, 0, this.duration)
    const f = (clamped / this.duration) * (n - 1)
    const i = Math.min(Math.floor(f), n - 2)
    const k = f - i

    out.x = lerp(this.xs[i], this.xs[i + 1], k)
    out.z = lerp(this.zs[i], this.zs[i + 1], k)
    out.speed = lerp(this.speeds[i], this.speeds[i + 1], k)
    out.stride = lerp(this.strides[i], this.strides[i + 1], k)
    out.bank = lerp(this.banks[i], this.banks[i + 1], k)
    out.heading = lerpAngle(this.headings[i], this.headings[i + 1], k)
    out.action = actionAt(this.path, clamped)

    out.strike = -1
    out.strikeKind = null
    for (const s of this.strikes) {
      // Wind-up before contact, follow-through after.
      const p = (clamped - (s.t - 0.28)) / 0.62
      if (p >= 0 && p <= 1) {
        out.strike = p
        out.strikeKind = s.kind
        break
      }
    }
    return out
  }

  positionAt(t: number): { x: number; z: number } {
    const n = this.count
    const f = (clamp(t, 0, this.duration) / this.duration) * (n - 1)
    const i = Math.min(Math.floor(f), n - 2)
    const k = f - i
    return {
      x: lerp(this.xs[i], this.xs[i + 1], k),
      z: lerp(this.zs[i], this.zs[i + 1], k),
    }
  }
}

type MarkerFn = (
  t: number,
  authored: { x: number; z: number },
) => { x: number; z: number }

/* ------------------------------------------------------------------ */
/* Helpers                                                             */
/* ------------------------------------------------------------------ */

function boxBlur(src: Float32Array, seconds: number): Float32Array {
  const half = Math.max(1, Math.round(seconds * HZ))
  const n = src.length
  const out = new Float32Array(n)
  for (let i = 0; i < n; i++) {
    let sum = 0
    for (let j = -half; j <= half; j++) {
      sum += src[clampInt(i + j, 0, n - 1)]
    }
    out[i] = sum / (half * 2 + 1)
  }
  return out
}

function clamp(v: number, lo: number, hi: number) {
  return v < lo ? lo : v > hi ? hi : v
}

function clampInt(v: number, lo: number, hi: number) {
  return v < lo ? lo : v > hi ? hi : v
}

function lerp(a: number, b: number, k: number) {
  return a + (b - a) * k
}

function lerpAngle(a: number, b: number, k: number) {
  let d = b - a
  while (d > Math.PI) d -= Math.PI * 2
  while (d < -Math.PI) d += Math.PI * 2
  return a + d * k
}

export function emptyPose(): Pose {
  return {
    x: 0,
    z: 0,
    heading: 0,
    speed: 0,
    stride: 0,
    bank: 0,
    action: 'idle',
    strike: -1,
    strikeKind: null,
  }
}

/* ------------------------------------------------------------------ */
/* Ball                                                                */
/* ------------------------------------------------------------------ */

export const BALL_RADIUS = 0.11

export interface BallState {
  x: number
  y: number
  z: number
  /** Player currently in contact with the ball, if any. */
  carrier: string | null
}

export interface Strike {
  t: number
  kind: StrikeKind
  playerId: string
}

/** Realistic delivery speeds in m/s, by type of strike. */
const DELIVERY_SPEED: Record<StrikeKind, number> = {
  layoff: 9,
  pass: 14,
  cross: 16,
  header: 11,
  shoot: 22,
}

interface Delivery {
  /** When the ball actually leaves the foot. */
  t0: number
  /** When it reaches the target. */
  t1: number
  from: { x: number; y: number; z: number }
  to: { x: number; y: number; z: number }
  kind: StrikeKind
  /** Player who struck it, when one could be matched. */
  by: string | null
  dist: number
  /** Apex of the arc above the straight line, metres. */
  loft: number
}

/**
 * Ball flight.
 *
 * Authored ball keyframes describe *where* the ball goes; this retimes *when*
 * it goes there, because hand-authored times drifted badly in two ways: the
 * ball left up to 1.2s before the passer's foot swung, and short segments
 * gave deliveries of over 100 m/s.
 *
 * Each delivery is therefore snapped to the strike that produced it and given
 * a flight time derived from distance and delivery type. Between deliveries
 * the ball rests where it arrived, or sticks to a dribbler's outside foot.
 */
export class BallTrack {
  readonly deliveries: Delivery[] = []
  private readonly rest: { x: number; y: number; z: number }

  constructor(path: BallKeyframe[], strikes: Strike[]) {
    this.rest = path.length
      ? { x: path[0].x, y: path[0].y ?? BALL_RADIUS, z: path[0].z }
      : { x: 0, y: BALL_RADIUS, z: 0 }

    // 1. Collapse the authored path into the segments that actually travel.
    const raw: {
      t: number
      from: { x: number; y: number; z: number }
      to: { x: number; y: number; z: number }
      dist: number
      authoredLoft: boolean
    }[] = []

    for (let i = 0; i < path.length - 1; i++) {
      const a = path[i]
      const b = path[i + 1]
      const dist = Math.hypot(b.x - a.x, b.z - a.z)
      // Short hops are the ball drifting with a carrier, not a delivery.
      if (dist < 2) continue
      raw.push({
        t: a.t,
        from: { x: a.x, y: a.y ?? BALL_RADIUS, z: a.z },
        to: { x: b.x, y: b.y ?? BALL_RADIUS, z: b.z },
        dist,
        authoredLoft: a.y !== undefined || b.y !== undefined,
      })
    }

    // 2. Match each segment to the strike that caused it and retime.
    const used = new Set<number>()
    let previousArrival = 0

    for (const seg of raw) {
      let best = -1
      let bestGap = 1.6
      strikes.forEach((s, i) => {
        if (used.has(i)) return
        const gap = Math.abs(s.t - seg.t)
        if (gap < bestGap) {
          bestGap = gap
          best = i
        }
      })

      const strike = best >= 0 ? strikes[best] : null
      if (best >= 0) used.add(best)

      // An unmatched short segment is carrying, not a delivery.
      if (!strike && seg.dist < 5) continue

      const kind = strike?.kind ?? 'pass'
      const flight = clamp(seg.dist / DELIVERY_SPEED[kind], 0.16, 2.4)

      // The ball leaves when the foot goes through it, never before.
      let t0 = strike ? strike.t : seg.t
      // Deliveries cannot overlap: leave a beat for the receiver to control.
      if (t0 < previousArrival + 0.12) t0 = previousArrival + 0.12
      // A delivery always gets its full flight. If that runs past the
      // authored duration the drill is extended to cover it (see
      // DrillSim.duration) rather than the ball being teleported or the
      // kick being started early.
      const t1 = t0 + flight

      const loft = seg.authoredLoft
        ? 0
        : seg.dist > 11
          ? Math.min(seg.dist * 0.075, 2.6)
          : 0

      this.deliveries.push({
        t0,
        t1,
        from: seg.from,
        to: seg.to,
        kind,
        by: strike?.playerId ?? null,
        dist: seg.dist,
        loft,
      })
      previousArrival = t1
    }
  }

  sample(t: number, carriers: CarrierLookup, out: BallState): BallState {
    out.carrier = null

    const d = this.deliveries
    if (d.length === 0) {
      out.x = this.rest.x
      out.y = this.rest.y
      out.z = this.rest.z
      this.stickToCarrier(carriers, out)
      return out
    }

    // Before the first delivery the ball waits at the starting spot.
    if (t <= d[0].t0) {
      out.x = d[0].from.x
      out.y = d[0].from.y
      out.z = d[0].from.z
      this.stickToCarrier(carriers, out)
      return out
    }

    for (let i = 0; i < d.length; i++) {
      const seg = d[i]

      if (t < seg.t0) {
        // Resting between deliveries, at the previous arrival point.
        const prev = d[i - 1]
        out.x = prev.to.x
        out.y = prev.to.y
        out.z = prev.to.z
        this.stickToCarrier(carriers, out)
        return out
      }

      if (t <= seg.t1) {
        const k = (t - seg.t0) / Math.max(seg.t1 - seg.t0, 1e-4)
        out.x = lerp(seg.from.x, seg.to.x, k)
        out.z = lerp(seg.from.z, seg.to.z, k)
        out.y =
          lerp(seg.from.y, seg.to.y, k) + Math.sin(Math.PI * k) * seg.loft
        out.y = Math.max(out.y, BALL_RADIUS)
        return out
      }
    }

    const last = d[d.length - 1]
    out.x = last.to.x
    out.y = last.to.y
    out.z = last.to.z
    this.stickToCarrier(carriers, out)
    return out
  }

  /** A resting ball inside a player's control radius reads as a carry. */
  private stickToCarrier(carriers: CarrierLookup, out: BallState) {
    const near = carriers(out.x, out.z)
    if (!near) return
    out.carrier = near.id
    const side = near.heading + Math.PI * 0.38
    const touch = 0.3 + Math.sin(near.stride * 0.5) * 0.1
    out.x = near.x + Math.sin(side) * 0.26 + Math.sin(near.heading) * touch
    out.z = near.z + Math.cos(side) * 0.26 + Math.cos(near.heading) * touch
    out.y = BALL_RADIUS
  }
}

type CarrierLookup = (
  x: number,
  z: number,
) => { id: string; x: number; z: number; heading: number; stride: number } | null

/* ------------------------------------------------------------------ */
/* Whole-drill simulation                                              */
/* ------------------------------------------------------------------ */

export interface PassEvent {
  index: number
  t: number
  from: string
  to: string | null
  kind: StrikeKind
  /** Straight-line length of the delivery, metres. */
  distance: number
  fromPos: { x: number; z: number }
  toPos: { x: number; z: number }
}

export class DrillSim {
  readonly trajectories = new Map<string, Trajectory>()
  readonly poses = new Map<string, Pose>()
  readonly ball: BallState = { x: 0, y: BALL_RADIUS, z: 0, carrier: null }
  readonly passes: PassEvent[]
  /**
   * Playback length. Usually the authored duration, but extended when the
   * closing delivery needs a moment longer to land.
   */
  readonly duration: number
  private readonly ballTrack: BallTrack
  private readonly players: DrillPlayer[]

  constructor(readonly drill: Drill) {
    this.players = drill.players

    // Unmarked players first: a marker needs its target's table to exist.
    const ordered = [...drill.players].sort(
      (a, b) => Number(!!a.marks) - Number(!!b.marks),
    )
    for (const p of ordered) {
      let marker: MarkerFn | undefined
      const target = p.marks ? this.trajectories.get(p.marks) : undefined
      if (target) {
        const weight = p.markWeight ?? 0.55
        const gap = p.markDistance ?? 1.4
        marker = (t, authored) => {
          const m = target.positionAt(t)
          // Hold station between the man and the goal he is attacking.
          const dx = m.x - 0
          const dz = m.z - -52.5
          const len = Math.hypot(dx, dz) || 1
          const gx = m.x - (dx / len) * gap * 0.35
          const gz = m.z - (dz / len) * gap
          return {
            x: authored.x + (gx - authored.x) * weight,
            z: authored.z + (gz - authored.z) * weight,
          }
        }
      }
      this.trajectories.set(
        p.id,
        new Trajectory(p.path, drill.duration, marker),
      )
      this.poses.set(p.id, emptyPose())
    }

    // Strikes come from the players' own actions, so the ball can be timed
    // to the foot rather than to a hand-written keyframe.
    const strikes: Strike[] = []
    for (const p of drill.players) {
      for (const k of p.path) {
        if (STRIKE_ACTIONS.includes(k.action as StrikeKind)) {
          strikes.push({
            t: k.t,
            kind: k.action as StrikeKind,
            playerId: p.id,
          })
        }
      }
    }
    strikes.sort((a, b) => a.t - b.t)

    this.ballTrack = new BallTrack(drill.ball, strikes)
    this.passes = derivePasses(this.ballTrack, drill, this.trajectories)

    const lastArrival = this.ballTrack.deliveries.at(-1)?.t1 ?? 0
    this.duration = Math.max(drill.duration, lastArrival + 0.25)
  }

  update(t: number) {
    for (const p of this.players) {
      const traj = this.trajectories.get(p.id)!
      traj.sample(t, this.poses.get(p.id)!)
    }
    this.ballTrack.sample(t, (x, z) => this.nearestCarrier(x, z), this.ball)
  }

  private nearestCarrier(x: number, z: number) {
    let best: {
      id: string
      x: number
      z: number
      heading: number
      stride: number
    } | null = null
    let bestD = 2.1
    for (const p of this.players) {
      const pose = this.poses.get(p.id)!
      const d = Math.hypot(pose.x - x, pose.z - z)
      if (d < bestD) {
        bestD = d
        best = {
          id: p.id,
          x: pose.x,
          z: pose.z,
          heading: pose.heading,
          stride: pose.stride,
        }
      }
    }
    return best
  }
}

/**
 * Pass events mirror the retimed deliveries, so arrows and step-mode stops
 * land exactly on the moment the ball is actually struck. The receiver is
 * whoever is closest to the ball when it arrives.
 */
function derivePasses(
  track: BallTrack,
  drill: Drill,
  trajectories: Map<string, Trajectory>,
): PassEvent[] {
  const events: PassEvent[] = []

  for (const seg of track.deliveries) {
    const fromPos = seg.by
      ? trajectories.get(seg.by)!.positionAt(seg.t0)
      : { x: seg.from.x, z: seg.from.z }
    const toPos = { x: seg.to.x, z: seg.to.z }

    let to: string | null = null
    if (seg.kind !== 'shoot') {
      let bestD = 4.5
      for (const other of drill.players) {
        if (other.id === seg.by) continue
        const o = trajectories.get(other.id)!.positionAt(seg.t1)
        const d = Math.hypot(o.x - toPos.x, o.z - toPos.z)
        if (d < bestD) {
          bestD = d
          to = other.id
        }
      }
    }

    events.push({
      index: 0,
      t: seg.t0,
      from: seg.by ?? '',
      to,
      kind: seg.kind,
      distance: seg.dist,
      fromPos,
      toPos,
    })
  }

  events.sort((a, b) => a.t - b.t)
  events.forEach((e, i) => (e.index = i + 1))
  return events
}
