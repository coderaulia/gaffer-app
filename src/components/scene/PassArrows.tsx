import { useMemo, useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import { Line } from '@react-three/drei'
import * as THREE from 'three'
import { clock } from '@/lib/clock'
import { useSimulation } from '@/lib/simContext'
import type { PassEvent } from '@/lib/sim'
import { Label } from './Label'

const KIND_COLOR: Record<string, string> = {
  pass: '#ffd84d',
  layoff: '#ffb04d',
  cross: '#7fd1ff',
  shoot: '#ff6b5a',
  header: '#c9a0ff',
}

/** Arc between two ground points, bowed sideways so arrows never overlap. */
function arc(
  from: { x: number; z: number },
  to: { x: number; z: number },
  bow: number,
) {
  const pts: [number, number, number][] = []
  const dx = to.x - from.x
  const dz = to.z - from.z
  const len = Math.hypot(dx, dz) || 1
  const nx = -dz / len
  const nz = dx / len
  const steps = 20
  for (let i = 0; i <= steps; i++) {
    const k = i / steps
    const bulge = Math.sin(Math.PI * k) * bow
    pts.push([
      from.x + dx * k + nx * bulge,
      0.09,
      from.z + dz * k + nz * bulge,
    ])
  }
  return pts
}

function Arrowhead({
  event,
  color,
}: {
  event: PassEvent
  color: string
}) {
  const angle = Math.atan2(
    event.toPos.x - event.fromPos.x,
    event.toPos.z - event.fromPos.z,
  )
  return (
    <mesh
      position={[event.toPos.x, 0.1, event.toPos.z]}
      rotation={[-Math.PI / 2, 0, angle - Math.PI / 2]}
    >
      <circleGeometry args={[0.62, 3]} />
      <meshBasicMaterial color={color} transparent depthWrite={false} />
    </mesh>
  )
}

/**
 * Numbered pass arrows that draw on as each delivery happens and stay on the
 * pitch afterwards, so the pattern accumulates into a coaching diagram
 * instead of vanishing with the loop.
 */
export function PassArrows() {
  const sim = useSimulation()
  const groups = useRef<(THREE.Group | null)[]>([])

  const arcs = useMemo(
    () =>
      sim.passes.map((e, i) => ({
        event: e,
        color: KIND_COLOR[e.kind] ?? '#ffd84d',
        // Alternate the bow so consecutive passes stay legible.
        points: arc(e.fromPos, e.toPos, (i % 2 ? 1 : -1) * Math.min(e.distance * 0.09, 2.4)),
        mid: {
          x: (e.fromPos.x + e.toPos.x) / 2,
          z: (e.fromPos.z + e.toPos.z) / 2,
        },
      })),
    [sim],
  )

  useFrame(() => {
    for (let i = 0; i < arcs.length; i++) {
      const g = groups.current[i]
      if (!g) continue
      const age = clock.t - arcs[i].event.t
      // Fade in on contact, then settle to a persistent low opacity.
      const vis = age < -0.15 ? 0 : age < 0.25 ? 1 : 0.55
      g.visible = vis > 0
      g.scale.setScalar(age >= -0.15 && age < 0.25 ? 1.06 : 1)
      g.traverse((o) => {
        const m = (o as THREE.Mesh).material as THREE.Material | undefined
        if (m && 'opacity' in m) {
          ;(m as THREE.Material & { opacity: number }).opacity = vis
        }
      })
    }
  })

  return (
    <group>
      {arcs.map((a, i) => (
        <group
          key={i}
          ref={(el) => {
            groups.current[i] = el
          }}
          visible={false}
        >
          <Line
            points={a.points}
            color={a.color}
            lineWidth={2.6}
            transparent
            opacity={0.9}
            dashed={a.event.kind === 'cross'}
            dashSize={0.9}
            gapSize={0.5}
          />
          <Arrowhead event={a.event} color={a.color} />
          <group position={[a.mid.x, 0.9, a.mid.z]}>
            <Label
              text={String(a.event.index)}
              color={a.color}
              y={0}
              scale={0.95}
            />
          </group>
        </group>
      ))}
    </group>
  )
}
