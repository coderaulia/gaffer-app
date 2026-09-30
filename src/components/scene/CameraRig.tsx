import { useEffect, useRef } from 'react'
import { useFrame, useThree } from '@react-three/fiber'
import { OrbitControls } from '@react-three/drei'
import type { OrbitControls as OrbitControlsImpl } from 'three-stdlib'
import * as THREE from 'three'
import type { Drill, PitchView } from '@/lib/types'
import { useSim, type CameraPreset } from '@/lib/store'

/** Where the action lives for each pitch view: [centre, half-extent]. */
const FRAMING: Record<PitchView, { cx: number; cz: number; span: number }> = {
  full: { cx: 0, cz: 0, span: 60 },
  half: { cx: 0, cz: -26, span: 40 },
  'attacking-third': { cx: 0, cz: -36, span: 30 },
  grid: { cx: 0, cz: -20, span: 24 },
  box: { cx: 0, cz: -44, span: 22 },
}

interface Shot {
  pos: THREE.Vector3
  target: THREE.Vector3
}

function shotFor(preset: CameraPreset, view: PitchView): Shot {
  const f = FRAMING[view]
  const t = new THREE.Vector3(f.cx, 0, f.cz)
  switch (preset) {
    // Elevated, behind the play, looking toward the attacking goal.
    case 'broadcast':
      return {
        pos: new THREE.Vector3(f.cx, f.span * 0.62, f.cz + f.span * 1.05),
        target: t,
      }
    // Low and parallel to the line of confrontation, from the touchline.
    case 'sideline':
      return {
        pos: new THREE.Vector3(f.cx - f.span * 1.25, f.span * 0.2, f.cz + 2),
        target: t,
      }
    // Coach's board view.
    case 'topdown':
      return {
        pos: new THREE.Vector3(f.cx, f.span * 1.55, f.cz + 0.01),
        target: t,
      }
    // Tight, square-on tactics board — the framing coaching diagrams use.
    case 'board':
      return {
        pos: new THREE.Vector3(f.cx, f.span * 1.02, f.cz + 0.01),
        target: t,
      }
  }
}

export function CameraRig({ drill }: { drill: Drill }) {
  const controls = useRef<OrbitControlsImpl>(null)
  const camera = useThree((s) => s.camera)
  const invalidate = useThree((s) => s.invalidate)
  const preset = useSim((s) => s.camera)

  const from = useRef(new THREE.Vector3())
  const fromTarget = useRef(new THREE.Vector3())
  const to = useRef(new THREE.Vector3())
  const toTarget = useRef(new THREE.Vector3())
  const k = useRef(1)

  // Start a transition whenever the preset or the framed area changes.
  useEffect(() => {
    const shot = shotFor(preset, drill.view)
    from.current.copy(camera.position)
    fromTarget.current.copy(
      controls.current?.target ?? new THREE.Vector3(0, 0, 0),
    )
    to.current.copy(shot.pos)
    toTarget.current.copy(shot.target)
    k.current = 0
    invalidate()
  }, [preset, drill.view, drill.id, camera, invalidate])

  useFrame((_, delta) => {
    if (k.current >= 1) return
    if (!controls.current) {
      invalidate()
      return
    }
    k.current = Math.min(1, k.current + delta / 0.9)
    const e = k.current * k.current * (3 - 2 * k.current)
    camera.position.lerpVectors(from.current, to.current, e)
    controls.current.target.lerpVectors(fromTarget.current, toTarget.current, e)
    controls.current.update()
    // The canvas renders on demand; keep frames coming until the move lands.
    invalidate()
  })

  return (
    <OrbitControls
      ref={controls}
      makeDefault
      enableDamping
      dampingFactor={0.08}
      minDistance={8}
      maxDistance={180}
      maxPolarAngle={Math.PI / 2.05}
    />
  )
}
