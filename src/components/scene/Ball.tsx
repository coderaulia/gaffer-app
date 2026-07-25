import { useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'
import { BALL_RADIUS } from '@/lib/sim'
import { useSimulation } from '@/lib/simContext'

export function Ball() {
  const sim = useSimulation()
  const ref = useRef<THREE.Mesh>(null)
  const shadow = useRef<THREE.Mesh>(null)
  const halo = useRef<THREE.Mesh>(null)
  const prev = useRef(new THREE.Vector3())
  const axis = useRef(new THREE.Vector3())

  useFrame((_, delta) => {
    if (!ref.current || !shadow.current || !halo.current) return
    const b = sim.ball
    ref.current.position.set(b.x, b.y, b.z)

    // Roll about the axis perpendicular to travel.
    const dx = b.x - prev.current.x
    const dz = b.z - prev.current.z
    const dist = Math.hypot(dx, dz)
    if (dist > 1e-4) {
      axis.current.set(dz, 0, -dx).normalize()
      ref.current.rotateOnWorldAxis(axis.current, dist / BALL_RADIUS)
    }
    prev.current.set(b.x, b.y, b.z)

    // Contact shadow shrinks and fades as the ball climbs.
    const h = Math.max(0, b.y - BALL_RADIUS)
    const s = 1 / (1 + h * 0.55)
    shadow.current.position.set(b.x, 0.018, b.z)
    shadow.current.scale.setScalar(s)
    ;(shadow.current.material as THREE.Material).opacity = 0.34 * s

    // Tracking halo: a soft ring on the turf under the ball so the eye can
    // follow the delivery in a crowded box. Pulses while the ball is loose.
    halo.current.position.set(b.x, 0.02, b.z)
    const speed = dist / Math.max(delta, 1e-3)
    const pulse = b.carrier ? 0.16 : 0.3 + Math.min(speed / 25, 0.35)
    ;(halo.current.material as THREE.MeshBasicMaterial).opacity = pulse
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
      <mesh ref={halo} rotation={[-Math.PI / 2, 0, 0]}>
        <ringGeometry args={[0.42, 0.56, 24]} />
        <meshBasicMaterial
          color="#ffffff"
          transparent
          opacity={0.3}
          depthWrite={false}
        />
      </mesh>
    </group>
  )
}
