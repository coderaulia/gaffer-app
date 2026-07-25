import { Suspense } from 'react'
import { Canvas } from '@react-three/fiber'
import { AdaptiveDpr, SoftShadows } from '@react-three/drei'
import type { Drill } from '@/lib/types'
import { useSim } from '@/lib/store'
import { Pitch } from './scene/Pitch'
import { PlayerFigure } from './scene/Player'
import { Ball } from './scene/Ball'
import { EquipmentField } from './scene/Equipment'
import { Trails } from './scene/Trails'
import { CameraRig } from './scene/CameraRig'
import { Playback } from './scene/Playback'

function Lights() {
  return (
    <>
      <hemisphereLight args={['#cfe3ff', '#2b4a2f', 1.15]} />
      <directionalLight
        position={[38, 60, 26]}
        intensity={1.5}
        castShadow
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

  return (
    <Canvas
      shadows
      dpr={[1, 1.75]}
      camera={{ position: [0, 40, 62], fov: 45, near: 0.5, far: 500 }}
      gl={{ antialias: true, powerPreference: 'high-performance' }}
    >
      <color attach="background" args={['#0e141b']} />
      <fog attach="fog" args={['#0e141b', 130, 260]} />

      <Lights />
      <SoftShadows size={26} samples={8} focus={0.7} />

      <Suspense fallback={null}>
        <Pitch zones={drill.zones} />
        {drill.equipment && drill.equipment.length > 0 && (
          <EquipmentField items={drill.equipment} />
        )}
        {showTrails && <Trails players={drill.players} ball={drill.ball} />}

        {drill.players.map((p) => (
          <PlayerFigure key={p.id} player={p} showLabel={showLabels} />
        ))}
        <Ball path={drill.ball} />
      </Suspense>

      <Playback duration={drill.duration} />
      <CameraRig drill={drill} />
      <AdaptiveDpr pixelated />
    </Canvas>
  )
}
