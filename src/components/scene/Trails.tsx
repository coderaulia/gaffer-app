import { useMemo } from 'react'
import { Line } from '@react-three/drei'
import type { DrillPlayer } from '@/lib/types'
import { useSimulation } from '@/lib/simContext'
import { TEAM_COLORS } from './Player'

/** Sample the smoothed trajectory so the trail matches the actual motion. */
function tableToPoints(xs: Float32Array, zs: Float32Array, stride: number) {
  const pts: [number, number, number][] = []
  for (let i = 0; i < xs.length; i += stride) pts.push([xs[i], 0.06, zs[i]])
  const last = xs.length - 1
  pts.push([xs[last], 0.06, zs[last]])
  return pts
}

export function Trails({
  players,
  dimmedIds,
}: {
  players: DrillPlayer[]
  dimmedIds: string[]
}) {
  const sim = useSimulation()

  const lines = useMemo(
    () =>
      players
        .map((p) => {
          const traj = sim.trajectories.get(p.id)!
          return {
            id: p.id,
            color: TEAM_COLORS[p.team].shirt,
            points: tableToPoints(traj.xs, traj.zs, 4),
          }
        })
        .filter((l) => l.points.length > 1),
    [players, sim],
  )

  return (
    <group>
      {lines.map((l) => (
        <Line
          key={l.id}
          points={l.points}
          color={l.color}
          lineWidth={1.6}
          transparent
          opacity={dimmedIds.includes(l.id) ? 0.08 : 0.28}
        />
      ))}
    </group>
  )
}
