import { Suspense, useEffect, useLayoutEffect, useMemo, useRef, useState } from 'react'
import { Canvas, useFrame, useThree } from '@react-three/fiber'
import { AdaptiveDpr, SoftShadows } from '@react-three/drei'
import type * as THREE from 'three'
import type { Drill } from '@/lib/types'
import { useSim } from '@/lib/store'
import type { DrillSim } from '@/lib/sim'
import { SimContext } from '@/lib/simContext'
import { usePhaseIndex } from './Overlays'
import { Pitch } from './scene/Pitch'
import { GroundEnvironment } from './scene/Environment'
import { PlayerFigure } from './scene/Player'
import { Ball } from './scene/Ball'
import { EquipmentField } from './scene/Equipment'
import { Trails } from './scene/Trails'
import { PassArrows } from './scene/PassArrows'
import { CameraRig } from './scene/CameraRig'
import { Playback } from './scene/Playback'

const NO_IDS: string[] = []

function Lights({ flat, shadows }: { flat: boolean; shadows: boolean }) {
  return (
    <>
      <hemisphereLight args={['#bfe0ff', '#3c6b3f', flat ? 1.9 : 1.35]} />
      <directionalLight
        position={[38, 60, 26]}
        intensity={flat ? 0.6 : 1.35}
        castShadow={shadows}
        shadow-mapSize={[1024, 1024]}
        shadow-camera-left={-70}
        shadow-camera-right={70}
        shadow-camera-top={70}
        shadow-camera-bottom={-70}
        shadow-camera-far={200}
      />
    </>
  )
}

/**
 * Scenery that never moves. Its world matrices are computed once on mount
 * and then skipped by three's per-frame scene-graph walk.
 */
function Static({ children }: { children: React.ReactNode }) {
  const ref = useRef<THREE.Group>(null)
  const invalidate = useThree((s) => s.invalidate)
  useLayoutEffect(() => {
    const g = ref.current
    if (!g) return
    g.traverse((o) => {
      o.updateMatrix()
      o.matrixAutoUpdate = false
    })
    g.updateMatrixWorld(true)
    g.matrixWorldAutoUpdate = false
    invalidate()
  })
  return <group ref={ref}>{children}</group>
}

export function Viewport({ drill, sim }: { drill: Drill; sim: DrillSim }) {
  const showLabels = useSim((s) => s.showLabels)
  const showTrails = useSim((s) => s.showTrails)
  const showArrows = useSim((s) => s.showArrows)
  const camera = useSim((s) => s.camera)
  const setHovered = useSim((s) => s.setHovered)

  // Re-render on phase changes only, never on every published clock tick.
  const phaseIndex = usePhaseIndex(drill)

  // Players outside the current phase's focus set fade back.
  const dimmed = useMemo(() => {
    const focus = drill.phases?.[phaseIndex]?.focus
    if (!focus?.length) return NO_IDS
    return drill.players.filter((p) => !focus.includes(p.id)).map((p) => p.id)
  }, [drill, phaseIndex])

  // Soft shadows are the most expensive part of the frame; drop them on
  // devices that can't hold a steady frame rate.
  const [highQuality, setHighQuality] = useState(true)

  const board = camera === 'board'
  const shadows = !board && highQuality

  return (
    <SimContext.Provider value={sim}>
      <Canvas
        shadows={!board}
        dpr={[1, 1.75]}
        // Render on demand: the loop stops while paused and idle, and
        // Playback keeps it running while the drill plays.
        frameloop="demand"
        // Let the sidebar slide finish before reallocating the drawing buffer.
        resize={{ debounce: { scroll: 50, resize: 120 } }}
        camera={{ position: [0, 45, 68], fov: 45, near: 0.5, far: 1200 }}
        gl={{ antialias: true, powerPreference: 'high-performance' }}
      >
        {highQuality && <QualityGuard onDegrade={() => setHighQuality(false)} />}
        <color attach="background" args={['#8fc3e8']} />
        <fog attach="fog" args={['#a9d2ee', 170, 430]} />

        <Lights flat={board} shadows={!board} />
        {shadows && <SoftShadows size={26} samples={8} focus={0.7} />}

        <Suspense fallback={null}>
          <Static>
            <GroundEnvironment />
            <Pitch zones={drill.zones} />
            {drill.equipment && drill.equipment.length > 0 && (
              <EquipmentField items={drill.equipment} />
            )}
          </Static>
          {showTrails && <Trails players={drill.players} dimmedIds={dimmed} />}
          {showArrows && <PassArrows />}

          {drill.players.map((p) => (
            <PlayerFigure
              key={p.id}
              player={p}
              showLabel={showLabels || board}
              dimmed={dimmed.includes(p.id)}
              onHover={setHovered}
            />
          ))}
          <Ball />
        </Suspense>

        <Playback />
        <CameraRig drill={drill} />
        <AdaptiveDpr pixelated />
        <Redraw deps={[showLabels, showTrails, showArrows, board, dimmed, shadows]} />
      </Canvas>
    </SimContext.Provider>
  )
}

/** Requests a frame whenever a display option changes while paused. */
function Redraw({ deps }: { deps: unknown[] }) {
  const invalidate = useThree((s) => s.invalidate)
  // eslint-disable-next-line react-hooks/exhaustive-deps
  useEffect(() => invalidate(), deps)
  return null
}

/** Frames skipped after play starts (shader compile, first uploads). */
const WARMUP_FRAMES = 45
/** Frames averaged before deciding. */
const SAMPLE_FRAMES = 120
/** Below this average frame rate the soft shadows are dropped. */
const MIN_FPS = 42

/**
 * Samples the frame rate while the drill is actually playing (the loop is
 * on demand, so idle gaps would read as a slow device) and reports once if
 * the device can't keep up.
 */
function QualityGuard({ onDegrade }: { onDegrade: () => void }) {
  const seen = useRef(0)
  const total = useRef(0)
  const done = useRef(false)
  useFrame((_, delta) => {
    if (done.current) return
    if (!useSim.getState().playing) {
      seen.current = 0
      total.current = 0
      return
    }
    seen.current++
    if (seen.current <= WARMUP_FRAMES) return
    total.current += delta
    if (seen.current >= WARMUP_FRAMES + SAMPLE_FRAMES) {
      done.current = true
      if (SAMPLE_FRAMES / total.current < MIN_FPS) onDegrade()
    }
  })
  return null
}
