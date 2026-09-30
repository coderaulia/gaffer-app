import { useRef, useState } from 'react'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'
import type { DrillPlayer, Team } from '@/lib/types'
import { useSimulation } from '@/lib/simContext'
import { TEAM_COLORS } from '@/lib/teamColors'
import { Label } from './Label'

export { TEAM_COLORS }

const SKIN = '#c98d63'
const BOOT = '#161a20'

type RigMaterials = Record<'shirt' | 'shorts' | 'skin' | 'boot', THREE.Material>

/**
 * Materials are shared by every figure on the same team, so a full squad
 * costs a handful of materials (and shader state switches) rather than four
 * per player, and hover/dim changes never allocate.
 */
const materialCache = new Map<string, RigMaterials>()

function rigMaterials(team: Team, dimmed: boolean): RigMaterials {
  const key = `${team}|${dimmed}`
  const hit = materialCache.get(key)
  if (hit) return hit
  const c = TEAM_COLORS[team]
  const mk = (color: string) => {
    const m = new THREE.MeshLambertMaterial({ color })
    if (dimmed) {
      m.transparent = true
      m.opacity = 0.28
    }
    return m
  }
  const mats = {
    shirt: mk(c.shirt),
    shorts: mk(c.shorts),
    skin: mk(SKIN),
    boot: mk(BOOT),
  }
  materialCache.set(key, mats)
  return mats
}

/** Rig geometry, built once and shared by every figure. */
const GEO = {
  thigh: new THREE.CapsuleGeometry(0.065, 0.3, 3, 6),
  shorts: new THREE.CapsuleGeometry(0.085, 0.16, 3, 6),
  shin: new THREE.CapsuleGeometry(0.055, 0.3, 3, 6),
  boot: new THREE.BoxGeometry(0.11, 0.07, 0.25),
  torso: new THREE.CapsuleGeometry(0.185, 0.34, 4, 10),
  upperArm: new THREE.CapsuleGeometry(0.055, 0.14, 3, 6),
  forearm: new THREE.CapsuleGeometry(0.048, 0.2, 3, 6),
  neck: new THREE.CylinderGeometry(0.055, 0.065, 0.08, 6),
  head: new THREE.SphereGeometry(0.115, 10, 8),
  hit: new THREE.CylinderGeometry(0.75, 0.75, 2, 6),
  ring: new THREE.RingGeometry(0.32, 0.44, 20),
}

interface Props {
  player: DrillPlayer
  showLabel: boolean
  dimmed: boolean
  onHover: (id: string | null) => void
}

/**
 * Low-poly humanoid animated from the precomputed trajectory.
 *
 * The run cycle is driven by `pose.stride`, which advances with ground
 * covered rather than wall time — that is what keeps the planted foot from
 * sliding. Strike actions overlay a one-shot plant-and-swing on top.
 */
export function PlayerFigure({ player, showLabel, dimmed, onHover }: Props) {
  const sim = useSimulation()
  const root = useRef<THREE.Group>(null)
  const body = useRef<THREE.Group>(null)
  const hips = useRef<THREE.Group>(null)
  const chest = useRef<THREE.Group>(null)
  const legL = useRef<THREE.Group>(null)
  const legR = useRef<THREE.Group>(null)
  const kneeL = useRef<THREE.Group>(null)
  const kneeR = useRef<THREE.Group>(null)
  const armL = useRef<THREE.Group>(null)
  const armR = useRef<THREE.Group>(null)
  const elbowL = useRef<THREE.Group>(null)
  const elbowR = useRef<THREE.Group>(null)
  const ring = useRef<THREE.Mesh>(null)

  const [hovered, setHovered] = useState(false)
  const mats = rigMaterials(player.team, dimmed && !hovered)

  useFrame(() => {
    const pose = sim.poses.get(player.id)
    if (!pose || !root.current || !body.current) return

    root.current.position.set(pose.x, 0, pose.z)
    root.current.rotation.y = pose.heading

    const speed = pose.speed
    const running = speed > 0.35
    const swing = Math.sin(pose.stride)
    const cosSwing = Math.cos(pose.stride)

    // Amplitude saturates around sprinting pace.
    const amp = Math.min(speed / 6.5, 1)

    // Jockeying is a crouched side-shuffle, not a forward stride.
    const jockeying = pose.action === 'jockey' || pose.action === 'block'
    const shuffle = jockeying ? 0.45 : 1

    const legSwing = swing * (0.35 + amp * 0.75) * shuffle
    if (legL.current) legL.current.rotation.x = legSwing
    if (legR.current) legR.current.rotation.x = -legSwing

    // Knees only bend on the recovery leg — the stance leg stays extended,
    // which is what sells the foot staying put on the ground.
    if (kneeL.current)
      kneeL.current.rotation.x = Math.max(0, -swing) * (0.5 + amp) * 1.25
    if (kneeR.current)
      kneeR.current.rotation.x = Math.max(0, swing) * (0.5 + amp) * 1.25

    // Arms counter-swing against the opposite leg, elbows carried bent.
    const armSwing = -swing * (0.3 + amp * 0.7) * shuffle
    if (armL.current) armL.current.rotation.x = armSwing
    if (armR.current) armR.current.rotation.x = -armSwing
    const elbowBend = jockeying ? 1.05 : 0.45 + amp * 0.75
    if (elbowL.current) elbowL.current.rotation.x = -elbowBend
    if (elbowR.current) elbowR.current.rotation.x = -elbowBend

    // Torso counter-rotates against the hips; shoulders roll with the stride.
    if (hips.current) hips.current.rotation.y = swing * amp * 0.13
    if (chest.current) {
      chest.current.rotation.y = -swing * amp * 0.2
      chest.current.rotation.z = cosSwing * amp * 0.06
    }

    // Forward lean with speed, bank into the turn, crouch when jockeying.
    const lean = jockeying ? 0.2 : Math.min(speed / 7, 1) * 0.3
    body.current.rotation.x = lean
    body.current.rotation.z = pose.bank
    body.current.position.y =
      (running ? Math.abs(cosSwing) * amp * 0.05 : 0) - (jockeying ? 0.12 : 0)

    // Wider base when jockeying or holding the ball up.
    const base = jockeying || pose.action === 'hold' ? 1.55 : 1
    if (legL.current) legL.current.position.x = 0.11 * base
    if (legR.current) legR.current.position.x = -0.11 * base

    // One-shot strike: plant, swing through, follow through.
    if (pose.strike >= 0) {
      const p = pose.strike
      if (pose.strikeKind === 'header') {
        // Jump and snap the head through the ball.
        const jump = Math.sin(Math.PI * Math.min(p * 1.25, 1))
        root.current.position.y = jump * 0.42
        body.current.rotation.x = -0.25 + p * 0.85
        if (legL.current) legL.current.rotation.x = -0.5 * jump
        if (legR.current) legR.current.rotation.x = -0.35 * jump
        if (armL.current) armL.current.rotation.x = -1.1 * jump
        if (armR.current) armR.current.rotation.x = -1.1 * jump
      } else {
        root.current.position.y = 0
        // Kick leg: back-lift to contact at p=0.45, then follow through.
        const kick =
          p < 0.45
            ? -Math.sin((p / 0.45) * Math.PI * 0.5) * 0.95
            : Math.sin(((p - 0.45) / 0.55) * Math.PI * 0.5) * 1.15
        const power = pose.strikeKind === 'layoff' ? 0.45 : 1
        if (legR.current) legR.current.rotation.x = kick * power
        if (kneeR.current)
          kneeR.current.rotation.x = Math.max(0, -kick) * 0.9 * power
        // Standing leg plants, opposite arm counterbalances.
        if (legL.current) legL.current.rotation.x = 0.12
        if (kneeL.current) kneeL.current.rotation.x = 0.1
        if (armL.current) armL.current.rotation.x = -kick * 0.55 * power
        if (armR.current) armR.current.rotation.x = kick * 0.3 * power
        if (chest.current) chest.current.rotation.y = kick * 0.22 * power
        body.current.rotation.x = 0.12 + Math.max(0, kick) * 0.16
      }
    } else {
      root.current.position.y = 0
    }

    if (ring.current) {
      const m = ring.current.material as THREE.MeshBasicMaterial
      m.opacity = hovered ? 1 : dimmed ? 0.18 : 0.7
      ring.current.scale.setScalar(hovered ? 1.25 : 1)
    }
  })

  return (
    <group ref={root}>
      <group ref={body}>
        <group ref={hips} position={[0, 0.86, 0]}>
          <group ref={legL} position={[0.11, 0, 0]}>
            <mesh geometry={GEO.thigh} material={mats.skin} position={[0, -0.21, 0]} />
            <mesh geometry={GEO.shorts} material={mats.shorts} position={[0, -0.07, 0]} />
            <group ref={kneeL} position={[0, -0.42, 0]}>
              <mesh geometry={GEO.shin} material={mats.skin} position={[0, -0.2, 0]} />
              <mesh geometry={GEO.boot} material={mats.boot} position={[0, -0.4, 0.045]} />
            </group>
          </group>
          <group ref={legR} position={[-0.11, 0, 0]}>
            <mesh geometry={GEO.thigh} material={mats.skin} position={[0, -0.21, 0]} />
            <mesh geometry={GEO.shorts} material={mats.shorts} position={[0, -0.07, 0]} />
            <group ref={kneeR} position={[0, -0.42, 0]}>
              <mesh geometry={GEO.shin} material={mats.skin} position={[0, -0.2, 0]} />
              <mesh geometry={GEO.boot} material={mats.boot} position={[0, -0.4, 0.045]} />
            </group>
          </group>
        </group>

        <group ref={chest} position={[0, 0.9, 0]}>
          <mesh geometry={GEO.torso} material={mats.shirt} position={[0, 0.28, 0]} />

          <group ref={armL} position={[0.235, 0.44, 0]}>
            <mesh geometry={GEO.upperArm} material={mats.shirt} position={[0, -0.12, 0]} />
            <group ref={elbowL} position={[0, -0.24, 0]}>
              <mesh geometry={GEO.forearm} material={mats.skin} position={[0, -0.12, 0]} />
            </group>
          </group>
          <group ref={armR} position={[-0.235, 0.44, 0]}>
            <mesh geometry={GEO.upperArm} material={mats.shirt} position={[0, -0.12, 0]} />
            <group ref={elbowR} position={[0, -0.24, 0]}>
              <mesh geometry={GEO.forearm} material={mats.skin} position={[0, -0.12, 0]} />
            </group>
          </group>

          <mesh geometry={GEO.neck} material={mats.skin} position={[0, 0.54, 0]} />
          <mesh geometry={GEO.head} material={mats.skin} position={[0, 0.68, 0]} />
        </group>
      </group>

      {/* Generous invisible hover target — the rig itself is thin to click.
          Handlers live here rather than on the root so pointer moves raycast
          one low-poly cylinder per player instead of every limb. */}
      <mesh
        geometry={GEO.hit}
        visible={false}
        position={[0, 1, 0]}
        onPointerOver={(e) => {
          e.stopPropagation()
          setHovered(true)
          onHover(player.id)
        }}
        onPointerOut={() => {
          setHovered(false)
          onHover(null)
        }}
      />

      <mesh
        ref={ring}
        geometry={GEO.ring}
        rotation={[-Math.PI / 2, 0, 0]}
        position={[0, 0.015, 0]}
      >
        <meshBasicMaterial
          color={TEAM_COLORS[player.team].shirt}
          transparent
          opacity={0.7}
          side={THREE.DoubleSide}
        />
      </mesh>

      {showLabel && <Label text={player.role} y={2.05} scale={1.05} />}
    </group>
  )
}
