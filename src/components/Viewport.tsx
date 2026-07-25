import { Suspense, useMemo } from 'react'
import { Canvas } from '@react-three/fiber'
import { AdaptiveDpr, SoftShadows } from '@react-three/drei'
import type { Drill } from '@/lib/types'
import { useSim } from '@/lib/store'
import { DrillSim } from '@/lib/sim'
import { SimContext } from '@/lib/simContext'
import { Pitch } from './scene/Pitch'
import { GroundEnvironment } from './scene/Environment'
import { PlayerFigure } from './scene/Player'
import { Ball } from './scene/Ball'
import { EquipmentField } from './scene/Equipment'
import { Trails } from './scene/Trails'
import { PassArrows } from './scene/PassArrows'
import { CameraRig } from './scene/CameraRig'
import { Playback } from './scene/Playback'

function Lights({ flat }: { flat: boolean }) {
  return (
    <>
      <hemisphereLight args={['#bfe0ff', '#3c6b3f', flat ? 1.9 : 1.35]} />
      <directionalLight
        position={[38, 60, 26]}
        intensity={flat ? 0.6 : 1.35}
        castShadow={!flat}
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

export function Viewport({ drill }: { drill: Drill }) {
  const showLabels = useSim((s) => s.showLabels)
  const showTrails = useSim((s) => s.showTrails)
  const showArrows = useSim((s) => s.showArrows)
  const camera = useSim((s) => s.camera)
  const time = useSim((s) => s.time)
  const setHovered = useSim((s) => s.setHovered)

  const sim = useMemo(() => new DrillSim(drill), [drill])

  // Players outside the current phase's focus set fade back.
  const dimmedIds = useMemo(() => {
    const phase = drill.phases?.find((p) => time >= p.t0 && time < p.t1)
    if (!phase?.focus?.length) return []
    return drill.players
      .filter((p) => !phase.focus!.includes(p.id))
      .map((p) => p.id)
  }, [drill, time])

  const board = camera === 'board'

  return (
    <SimContext.Provider value={sim}>
      <Canvas
        shadows={!board}
        dpr={[1, 1.75]}
        camera={{ position: [0, 45, 68], fov: 45, near: 0.5, far: 500 }}
        gl={{ antialias: true, powerPreference: 'high-performance' }}
      >
        <color attach="background" args={['#8fc3e8']} />
        <fog attach="fog" args={['#a9d2ee', 210, 460]} />

        <Lights flat={board} />
        {!board && <SoftShadows size={26} samples={8} focus={0.7} />}

        <Suspense fallback={null}>
          <GroundEnvironment />
          <Pitch zones={drill.zones} />
          {drill.equipment && drill.equipment.length > 0 && (
            <EquipmentField items={drill.equipment} />
          )}
          {showTrails && (
            <Trails players={drill.players} dimmedIds={dimmedIds} />
          )}
          {showArrows && <PassArrows />}

          {drill.players.map((p) => (
            <PlayerFigure
              key={p.id}
              player={p}
              showLabel={showLabels || board}
              dimmed={dimmedIds.includes(p.id)}
              onHover={setHovered}
            />
          ))}
          <Ball />
        </Suspense>

        <Playback />
        <CameraRig drill={drill} />
        <AdaptiveDpr pixelated />
      </Canvas>
    </SimContext.Provider>
  )
}
