import * as THREE from 'three'
import type { Equipment } from '@/lib/types'

const CONE = '#ff7a2f'
const POLE_A = '#f2e14c'
const POLE_B = '#e3453a'
const MANNEQUIN = '#e8dc4a'
const FRAME = '#eef2f6'

function Cone({ color = CONE }: { color?: string }) {
  return (
    <group>
      <mesh position={[0, 0.16, 0]}>
        <coneGeometry args={[0.11, 0.32, 8]} />
        <meshLambertMaterial color={color} />
      </mesh>
      <mesh position={[0, 0.01, 0]}>
        <boxGeometry args={[0.24, 0.02, 0.24]} />
        <meshLambertMaterial color={color} />
      </mesh>
    </group>
  )
}

function Disc({ color = CONE }: { color?: string }) {
  return (
    <mesh position={[0, 0.025, 0]}>
      <coneGeometry args={[0.16, 0.05, 12]} />
      <meshLambertMaterial color={color} />
    </mesh>
  )
}

function Pole({ color = POLE_A }: { color?: string }) {
  return (
    <group>
      <mesh position={[0, 0.02, 0]}>
        <cylinderGeometry args={[0.16, 0.18, 0.04, 12]} />
        <meshLambertMaterial color="#f2c94c" />
      </mesh>
      <mesh position={[0, 0.85, 0]}>
        <cylinderGeometry args={[0.028, 0.028, 1.7, 8]} />
        <meshLambertMaterial color={color} />
      </mesh>
      <mesh position={[0, 1.1, 0]}>
        <cylinderGeometry args={[0.03, 0.03, 0.16, 8]} />
        <meshLambertMaterial color="#1b1f26" />
      </mesh>
    </group>
  )
}

function Hurdle({ color = '#cfe34a' }: { color?: string }) {
  const mat = <meshLambertMaterial color={color} />
  return (
    <group>
      <mesh position={[-0.25, 0.15, 0]}>
        <cylinderGeometry args={[0.022, 0.022, 0.3, 6]} />
        {mat}
      </mesh>
      <mesh position={[0.25, 0.15, 0]}>
        <cylinderGeometry args={[0.022, 0.022, 0.3, 6]} />
        {mat}
      </mesh>
      <mesh position={[0, 0.3, 0]} rotation={[0, 0, Math.PI / 2]}>
        <cylinderGeometry args={[0.022, 0.022, 0.5, 6]} />
        {mat}
      </mesh>
    </group>
  )
}

/** Agility ladder: a strip of rungs, laid flat. */
function Ladder() {
  const rungs = Array.from({ length: 9 }, (_, i) => i)
  return (
    <group>
      <mesh position={[-0.24, 0.006, 2]} rotation={[-Math.PI / 2, 0, 0]}>
        <planeGeometry args={[0.04, 4]} />
        <meshBasicMaterial color="#15181d" side={THREE.DoubleSide} />
      </mesh>
      <mesh position={[0.24, 0.006, 2]} rotation={[-Math.PI / 2, 0, 0]}>
        <planeGeometry args={[0.04, 4]} />
        <meshBasicMaterial color="#15181d" side={THREE.DoubleSide} />
      </mesh>
      {rungs.map((i) => (
        <mesh
          key={i}
          position={[0, 0.007, 0.25 + i * 0.45]}
          rotation={[-Math.PI / 2, 0, 0]}
        >
          <planeGeometry args={[0.52, 0.07]} />
          <meshBasicMaterial
            color={i % 2 ? '#f2d14c' : '#4a7fe3'}
            side={THREE.DoubleSide}
          />
        </mesh>
      ))}
    </group>
  )
}

function GoalFrame({ w, h, color = FRAME }: { w: number; h: number; color?: string }) {
  const r = 0.05
  return (
    <group>
      <mesh position={[-w / 2, h / 2, 0]}>
        <cylinderGeometry args={[r, r, h, 8]} />
        <meshLambertMaterial color={color} />
      </mesh>
      <mesh position={[w / 2, h / 2, 0]}>
        <cylinderGeometry args={[r, r, h, 8]} />
        <meshLambertMaterial color={color} />
      </mesh>
      <mesh position={[0, h, 0]} rotation={[0, 0, Math.PI / 2]}>
        <cylinderGeometry args={[r, r, w, 8]} />
        <meshLambertMaterial color={color} />
      </mesh>
      <mesh position={[0, h / 2, 0.35]}>
        <planeGeometry args={[w, h]} />
        <meshBasicMaterial
          color="#dfe6ee"
          transparent
          opacity={0.16}
          side={THREE.DoubleSide}
        />
      </mesh>
    </group>
  )
}

/** Flat mannequin on a spiked base, matching the training-kit reference. */
function Mannequin({ color = MANNEQUIN }: { color?: string }) {
  return (
    <group>
      <mesh position={[0, 0.95, 0]}>
        <boxGeometry args={[0.5, 1.2, 0.06]} />
        <meshLambertMaterial color={color} />
      </mesh>
      <mesh position={[0, 1.68, 0]}>
        <torusGeometry args={[0.11, 0.025, 6, 14]} />
        <meshLambertMaterial color={color} />
      </mesh>
      <mesh position={[-0.14, 0.18, 0]}>
        <cylinderGeometry args={[0.025, 0.025, 0.36, 6]} />
        <meshLambertMaterial color={color} />
      </mesh>
      <mesh position={[0.14, 0.18, 0]}>
        <cylinderGeometry args={[0.025, 0.025, 0.36, 6]} />
        <meshLambertMaterial color={color} />
      </mesh>
    </group>
  )
}

/** Passing gate: two cones with the target line between them. */
function Gate({ color = '#4ad1c6' }: { color?: string }) {
  return (
    <group>
      <group position={[-1, 0, 0]}>
        <Cone color={color} />
      </group>
      <group position={[1, 0, 0]}>
        <Cone color={color} />
      </group>
    </group>
  )
}

export function EquipmentField({ items }: { items: Equipment[] }) {
  return (
    <>
      {items.map((e, i) => (
        <group
          key={i}
          position={[e.x, 0, e.z]}
          rotation={[0, ((e.rot ?? 0) * Math.PI) / 180, 0]}
        >
          {e.kind === 'cone' && <Cone color={e.color} />}
          {e.kind === 'disc' && <Disc color={e.color} />}
          {e.kind === 'pole' && <Pole color={e.color ?? (i % 2 ? POLE_B : POLE_A)} />}
          {e.kind === 'hurdle' && <Hurdle color={e.color} />}
          {e.kind === 'ladder' && <Ladder />}
          {e.kind === 'gate' && <Gate color={e.color} />}
          {e.kind === 'mannequin' && <Mannequin color={e.color} />}
          {e.kind === 'mini-goal' && <GoalFrame w={3} h={1} color={e.color} />}
          {e.kind === 'full-goal' && <GoalFrame w={7.32} h={2.44} color={e.color} />}
        </group>
      ))}
    </>
  )
}
