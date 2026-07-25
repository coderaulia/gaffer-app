import { useMemo } from 'react'
import { Line } from '@react-three/drei'
import type { BallKeyframe, DrillPlayer } from '@/lib/types'
import { TEAM_COLORS } from './Player'

/** Resample a path into a smooth polyline so trails match the eased motion. */
function densify(pts: { x: number; z: number }[], per = 6) {
  if (pts.length < 2) return []
  const out: [number, number, number][] = []
  for (let i = 0; i < pts.length - 1; i++) {
    const a = pts[i]
    const b = pts[i + 1]
    for (let s = 0; s < per; s++) {
      const raw = s / per
      const k = raw * raw * (3 - 2 * raw)
      out.push([a.x + (b.x - a.x) * k, 0.06, a.z + (b.z - a.z) * k])
    }
  }
  const last = pts[pts.length - 1]
  out.push([last.x, 0.06, last.z])
  return out
}

export function Trails({
  players,
  ball,
}: {
  players: DrillPlayer[]
  ball: BallKeyframe[]
}) {
  const playerLines = useMemo(
    () =>
      players
        .map((p) => ({
          id: p.id,
          color: TEAM_COLORS[p.team].shirt,
          points: densify(p.path),
        }))
        .filter((l) => l.points.length > 1),
    [players],
  )

  const ballLine = useMemo(() => densify(ball, 8), [ball])

  return (
    <group>
      {playerLines.map((l) => (
        <Line
          key={l.id}
          points={l.points}
          color={l.color}
          lineWidth={1.6}
          transparent
          opacity={0.28}
          dashed={false}
        />
      ))}
      {ballLine.length > 1 && (
        <Line
          points={ballLine}
          color="#ffffff"
          lineWidth={1.8}
          transparent
          opacity={0.42}
          dashed
          dashSize={0.7}
          gapSize={0.5}
        />
      )}
    </group>
  )
}
