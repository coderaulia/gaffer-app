import { useMemo, useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'
import type { DrillPlayer, Team } from '@/lib/types'
import { clock } from '@/lib/clock'
import { isStationary, samplePath } from '@/lib/utils'
import { Label } from './Label'

export const TEAM_COLORS: Record<Team, { shirt: string; shorts: string }> = {
  attack: { shirt: '#e35d4a', shorts: '#f2f2f2' },
  defense: { shirt: '#4a7fe3', shorts: '#1f2937' },
  neutral: { shirt: '#f2c14e', shorts: '#1f2937' },
  gk: { shirt: '#57c98a', shorts: '#1f2937' },
}

const SKIN = '#c98d63'
const BOOT = '#161a20'

/** One shared set of primitives keeps the draw call/material count low. */
function useRigMaterials(team: Team) {
  return useMemo(() => {
    const c = TEAM_COLORS[team]
    return {
      shirt: new THREE.MeshLambertMaterial({ color: c.shirt }),
      shorts: new THREE.MeshLambertMaterial({ color: c.shorts }),
      skin: new THREE.MeshLambertMaterial({ color: SKIN }),
      boot: new THREE.MeshLambertMaterial({ color: BOOT }),
    }
  }, [team])
}

interface Props {
  player: DrillPlayer
  showLabel: boolean
}

/**
 * Low-poly humanoid built from primitives and animated with a procedural
 * run cycle. No skinned mesh, no GLTF download — the whole figure is a
 * dozen boxes and capsules, so a full 16-player drill stays cheap.
 */
export function PlayerFigure({ player, showLabel }: Props) {
  const root = useRef<THREE.Group>(null)
  const body = useRef<THREE.Group>(null)
  const legL = useRef<THREE.Group>(null)
  const legR = useRef<THREE.Group>(null)
  const kneeL = useRef<THREE.Group>(null)
  const kneeR = useRef<THREE.Group>(null)
  const armL = useRef<THREE.Group>(null)
  const armR = useRef<THREE.Group>(null)
  const phase = useRef(Math.random() * Math.PI * 2)

  const mats = useRigMaterials(player.team)

  useFrame((_, delta) => {
    if (!root.current || !body.current) return
    const pose = samplePath(player.path, clock.t)

    root.current.position.set(pose.x, 0, pose.z)

    // Face the direction of travel; hold the last heading when planted.
    const target = pose.heading
    const cur = root.current.rotation.y
    let diff = target - cur
    while (diff > Math.PI) diff -= Math.PI * 2
    while (diff < -Math.PI) diff += Math.PI * 2
    root.current.rotation.y = cur + diff * Math.min(1, delta * 8)

    const planted = isStationary(pose.action)
    const speed = planted ? 0 : pose.speed

    // Stride frequency scales with speed; amplitude saturates at a sprint.
    phase.current += delta * (1.6 + speed * 1.15) * (speed > 0.05 ? 1 : 0)
    const swing = Math.sin(phase.current)
    const amp = Math.min(speed / 6, 1) * 0.95

    if (legL.current) legL.current.rotation.x = swing * amp
    if (legR.current) legR.current.rotation.x = -swing * amp
    if (kneeL.current)
      kneeL.current.rotation.x = Math.max(0, -swing) * amp * 1.3
    if (kneeR.current) kneeR.current.rotation.x = Math.max(0, swing) * amp * 1.3
    if (armL.current) armL.current.rotation.x = -swing * amp * 0.8
    if (armR.current) armR.current.rotation.x = swing * amp * 0.8

    // Forward lean when running, plus a small vertical bob per stride.
    body.current.rotation.x = Math.min(speed / 8, 0.9) * 0.32
    body.current.position.y = Math.abs(Math.cos(phase.current)) * amp * 0.045

    // Planted actions get a readable "working the ball" crouch.
    if (planted) {
      const s = pose.action === 'jockey' || pose.action === 'hold' ? 0.16 : 0.06
      body.current.rotation.x = s
    }
  })

  return (
    <group ref={root}>
      <group ref={body}>
        {/* legs */}
        <group ref={legL} position={[0.11, 0.86, 0]}>
          <mesh material={mats.skin} position={[0, -0.21, 0]}>
            <capsuleGeometry args={[0.065, 0.3, 3, 6]} />
          </mesh>
          <mesh material={mats.shorts} position={[0, -0.07, 0]}>
            <capsuleGeometry args={[0.085, 0.16, 3, 6]} />
          </mesh>
          <group ref={kneeL} position={[0, -0.42, 0]}>
            <mesh material={mats.skin} position={[0, -0.2, 0]}>
              <capsuleGeometry args={[0.055, 0.3, 3, 6]} />
            </mesh>
            <mesh material={mats.boot} position={[0, -0.4, 0.04]}>
              <boxGeometry args={[0.11, 0.07, 0.24]} />
            </mesh>
          </group>
        </group>
        <group ref={legR} position={[-0.11, 0.86, 0]}>
          <mesh material={mats.skin} position={[0, -0.21, 0]}>
            <capsuleGeometry args={[0.065, 0.3, 3, 6]} />
          </mesh>
          <mesh material={mats.shorts} position={[0, -0.07, 0]}>
            <capsuleGeometry args={[0.085, 0.16, 3, 6]} />
          </mesh>
          <group ref={kneeR} position={[0, -0.42, 0]}>
            <mesh material={mats.skin} position={[0, -0.2, 0]}>
              <capsuleGeometry args={[0.055, 0.3, 3, 6]} />
            </mesh>
            <mesh material={mats.boot} position={[0, -0.4, 0.04]}>
              <boxGeometry args={[0.11, 0.07, 0.24]} />
            </mesh>
          </group>
        </group>

        {/* torso */}
        <mesh material={mats.shirt} position={[0, 1.18, 0]}>
          <capsuleGeometry args={[0.185, 0.34, 4, 10]} />
        </mesh>

        {/* arms */}
        <group ref={armL} position={[0.235, 1.34, 0]}>
          <mesh material={mats.shirt} position={[0, -0.12, 0]}>
            <capsuleGeometry args={[0.055, 0.14, 3, 6]} />
          </mesh>
          <mesh material={mats.skin} position={[0, -0.34, 0]}>
            <capsuleGeometry args={[0.048, 0.26, 3, 6]} />
          </mesh>
        </group>
        <group ref={armR} position={[-0.235, 1.34, 0]}>
          <mesh material={mats.shirt} position={[0, -0.12, 0]}>
            <capsuleGeometry args={[0.055, 0.14, 3, 6]} />
          </mesh>
          <mesh material={mats.skin} position={[0, -0.34, 0]}>
            <capsuleGeometry args={[0.048, 0.26, 3, 6]} />
          </mesh>
        </group>

        {/* neck + head */}
        <mesh material={mats.skin} position={[0, 1.44, 0]}>
          <cylinderGeometry args={[0.055, 0.065, 0.08, 6]} />
        </mesh>
        <mesh material={mats.skin} position={[0, 1.58, 0]}>
          <sphereGeometry args={[0.115, 10, 8]} />
        </mesh>
      </group>

      {/* team-tinted ground disc: keeps roles readable from the top-down view */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.015, 0]}>
        <ringGeometry args={[0.32, 0.42, 20]} />
        <meshBasicMaterial
          color={TEAM_COLORS[player.team].shirt}
          transparent
          opacity={0.75}
          side={THREE.DoubleSide}
        />
      </mesh>

      {showLabel && <Label text={player.role} y={2.05} scale={1.05} />}
    </group>
  )
}
