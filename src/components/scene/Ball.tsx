import { useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'
import type { BallKeyframe } from '@/lib/types'
import { clock } from '@/lib/clock'
import { BALL_RADIUS, sampleBall } from '@/lib/utils'

export function Ball({ path }: { path: BallKeyframe[] }) {
  const ref = useRef<THREE.Mesh>(null)
  const shadow = useRef<THREE.Mesh>(null)
  const prev = useRef(new THREE.Vector3())

  useFrame(() => {
    if (!ref.current || !shadow.current) return
    const p = sampleBall(path, clock.t)
    ref.current.position.set(p.x, p.y, p.z)

    // Roll the ball about the axis perpendicular to travel.
    const dx = p.x - prev.current.x
    const dz = p.z - prev.current.z
    const dist = Math.hypot(dx, dz)
    if (dist > 1e-4) {
      const axis = new THREE.Vector3(dz, 0, -dx).normalize()
      ref.current.rotateOnWorldAxis(axis, dist / BALL_RADIUS)
    }
    prev.current.set(p.x, p.y, p.z)

    // Fake contact shadow: shrinks and fades as the ball climbs.
    const h = Math.max(0, p.y - BALL_RADIUS)
    const s = 1 / (1 + h * 0.55)
    shadow.current.position.set(p.x, 0.018, p.z)
    shadow.current.scale.setScalar(s)
    ;(shadow.current.material as THREE.Material).opacity = 0.34 * s
  })

  return (
    <group>
      <mesh ref={ref} castShadow>
        <sphereGeometry args={[BALL_RADIUS, 16, 12]} />
        <meshLambertMaterial color="#fbfbfb" emissive="#101010" />
      </mesh>
      <mesh ref={shadow} rotation={[-Math.PI / 2, 0, 0]}>
        <circleGeometry args={[BALL_RADIUS * 1.6, 16]} />
        <meshBasicMaterial color="#0b1a0d" transparent opacity={0.34} />
      </mesh>
    </group>
  )
}
