import { useMemo } from 'react'
import { Instance, Instances } from '@react-three/drei'
import * as THREE from 'three'
import { SignPanel } from './Label'

export const GROUND_NAME = 'VANAILA FC TRAINING GROUND'

const HALF_W = 34
const HALF_L = 52.5

/* ------------------------------------------------------------------ */
/* Beach behind the attacking goal                                     */
/* ------------------------------------------------------------------ */

function Palm({ lean = 0 }: { lean?: number }) {
  const fronds = useMemo(
    () => Array.from({ length: 7 }, (_, i) => (i / 7) * Math.PI * 2),
    [],
  )
  return (
    <group rotation={[0, 0, lean]}>
      <mesh position={[0, 3, 0]} castShadow>
        <cylinderGeometry args={[0.16, 0.28, 6, 6]} />
        <meshLambertMaterial color="#8a6a45" />
      </mesh>
      <group position={[0, 6, 0]}>
        {fronds.map((a, i) => (
          <mesh
            key={i}
            rotation={[0.55, a, 0]}
            position={[Math.sin(a) * 1.1, 0.1, Math.cos(a) * 1.1]}
            castShadow
          >
            <boxGeometry args={[0.5, 0.08, 2.6]} />
            <meshLambertMaterial color={i % 2 ? '#2f7d45' : '#37934f'} />
          </mesh>
        ))}
        <mesh position={[0, -0.2, 0]}>
          <sphereGeometry args={[0.4, 8, 6]} />
          <meshLambertMaterial color="#6f5a3a" />
        </mesh>
      </group>
    </group>
  )
}

function Beach() {
  const palms = useMemo(
    () => [
      { x: -26, z: -66, lean: 0.1, s: 1 },
      { x: -14, z: -71, lean: -0.08, s: 0.85 },
      { x: 8, z: -68, lean: 0.13, s: 1.05 },
      { x: 22, z: -73, lean: -0.11, s: 0.92 },
      { x: 36, z: -67, lean: 0.06, s: 1 },
      { x: -38, z: -72, lean: -0.05, s: 0.9 },
    ],
    [],
  )

  return (
    <group>
      {/* dry sand */}
      <mesh
        position={[0, 0.005, -72]}
        rotation={[-Math.PI / 2, 0, 0]}
        receiveShadow
      >
        <planeGeometry args={[300, 30]} />
        <meshLambertMaterial color="#e3d3a8" />
      </mesh>

      {/* wet sand at the waterline */}
      <mesh position={[0, 0.01, -89]} rotation={[-Math.PI / 2, 0, 0]}>
        <planeGeometry args={[300, 6]} />
        <meshLambertMaterial color="#cdb98b" />
      </mesh>

      {/* foam */}
      <mesh position={[0, 0.02, -92.2]} rotation={[-Math.PI / 2, 0, 0]}>
        <planeGeometry args={[300, 2.4]} />
        <meshBasicMaterial color="#f4fbff" transparent opacity={0.85} />
      </mesh>

      {/* shallows, then open sea */}
      <mesh position={[0, 0.008, -104]} rotation={[-Math.PI / 2, 0, 0]}>
        <planeGeometry args={[300, 22]} />
        <meshLambertMaterial color="#4fb9c9" />
      </mesh>
      <mesh position={[0, 0.006, -220]} rotation={[-Math.PI / 2, 0, 0]}>
        <planeGeometry args={[420, 220]} />
        <meshLambertMaterial color="#1f7fa8" />
      </mesh>

      {palms.map((p, i) => (
        <group key={i} position={[p.x, 0, p.z]} scale={p.s}>
          <Palm lean={p.lean} />
        </group>
      ))}
    </group>
  )
}

/* ------------------------------------------------------------------ */
/* Stand                                                               */
/* ------------------------------------------------------------------ */

function Floodlight({ height = 22 }: { height?: number }) {
  return (
    <group>
      <mesh position={[0, height / 2, 0]} castShadow>
        <cylinderGeometry args={[0.22, 0.34, height, 6]} />
        <meshLambertMaterial color="#9aa3ad" />
      </mesh>
      <mesh position={[0, height + 1.1, 0]}>
        <boxGeometry args={[4.4, 2.2, 0.4]} />
        <meshLambertMaterial color="#5c646e" />
      </mesh>
      {[-1.5, -0.5, 0.5, 1.5].map((x) => (
        <mesh key={x} position={[x, height + 1.1, -0.3]}>
          <boxGeometry args={[0.85, 1.5, 0.2]} />
          <meshBasicMaterial color="#fdf6d8" />
        </mesh>
      ))}
    </group>
  )
}

/**
 * Covered stand with tiered blue seating, matching the main stand in the
 * reference photographs. Seats are instanced so the row count stays cheap.
 */
function Stand({
  length = 56,
  rows = 9,
  facing = 1,
}: {
  length?: number
  rows?: number
  facing?: 1 | -1
}) {
  const seatsPerRow = Math.floor(length / 0.62)
  const seats = useMemo(() => {
    const out: { x: number; y: number; z: number }[] = []
    for (let r = 0; r < rows; r++) {
      for (let s = 0; s < seatsPerRow; s++) {
        out.push({
          x: -length / 2 + 0.31 + s * 0.62,
          y: 1.1 + r * 0.52,
          z: 1.4 + r * 0.85,
        })
      }
    }
    return out
  }, [rows, seatsPerRow, length])

  return (
    <group scale={[1, 1, facing]}>
      {/* front wall onto the pitch */}
      <mesh position={[0, 0.6, 0]} castShadow receiveShadow>
        <boxGeometry args={[length, 1.2, 1.4]} />
        <meshLambertMaterial color="#e8ecef" />
      </mesh>

      {/* tiers */}
      {Array.from({ length: rows }, (_, r) => (
        <mesh
          key={r}
          position={[0, 0.55 + r * 0.52, 1.4 + r * 0.85]}
          receiveShadow
          castShadow
        >
          <boxGeometry args={[length, 1.1 + r * 0.52, 0.85]} />
          <meshLambertMaterial color="#c9d0d6" />
        </mesh>
      ))}

      <Instances limit={seats.length} castShadow>
        <boxGeometry args={[0.46, 0.44, 0.42]} />
        <meshLambertMaterial color="#2f6fd0" />
        {seats.map((s, i) => (
          <Instance key={i} position={[s.x, s.y, s.z]} />
        ))}
      </Instances>

      {/* rear wall */}
      <mesh
        position={[0, 3.4, 1.4 + rows * 0.85]}
        castShadow
        receiveShadow
      >
        <boxGeometry args={[length, 6.8, 0.6]} />
        <meshLambertMaterial color="#dfe4e8" />
      </mesh>

      {/* roof and its columns */}
      <mesh position={[0, 7.6, 1.4 + rows * 0.42]} castShadow>
        <boxGeometry args={[length + 1.5, 0.35, rows * 0.95 + 3]} />
        <meshLambertMaterial color="#aeb6bd" />
      </mesh>
      {Array.from({ length: 9 }, (_, i) => (
        <mesh
          key={i}
          position={[-length / 2 + 2 + (i * (length - 4)) / 8, 4.2, 1.2]}
          castShadow
        >
          <cylinderGeometry args={[0.14, 0.14, 7, 6]} />
          <meshLambertMaterial color="#8f979f" />
        </mesh>
      ))}

      {/* club name across the stand facade */}
      <SignPanel
        text={GROUND_NAME}
        width={length * 0.82}
        height={1.5}
        color="#12325e"
        position={[0, 5.4, 1.1 + rows * 0.85]}
        rotation={[0, Math.PI, 0]}
      />
    </group>
  )
}

/* ------------------------------------------------------------------ */
/* Training building                                                   */
/* ------------------------------------------------------------------ */

function TrainingBuilding({
  width = 54,
  depth = 16,
  height = 9,
}: {
  width?: number
  depth?: number
  height?: number
}) {
  const windows = useMemo(
    () => Array.from({ length: 10 }, (_, i) => -width / 2 + 4 + i * ((width - 8) / 9)),
    [width],
  )

  return (
    <group>
      <mesh position={[0, height / 2, 0]} castShadow receiveShadow>
        <boxGeometry args={[width, height, depth]} />
        <meshLambertMaterial color="#8d9299" />
      </mesh>

      {/* parapet */}
      <mesh position={[0, height + 0.35, 0]} castShadow>
        <boxGeometry args={[width + 0.8, 0.7, depth + 0.8]} />
        <meshLambertMaterial color="#6f757c" />
      </mesh>

      {/* glazing on the pitch-facing wall */}
      {windows.map((x, i) => (
        <mesh key={i} position={[x, 3.4, depth / 2 + 0.06]}>
          <planeGeometry args={[3.4, 2.4]} />
          <meshLambertMaterial color="#2b3a4a" emissive="#16212c" />
        </mesh>
      ))}

      {/* ground-floor shutters */}
      <mesh position={[0, 1, depth / 2 + 0.06]}>
        <planeGeometry args={[width - 8, 1.6]} />
        <meshLambertMaterial color="#5e646b" />
      </mesh>

      {/* the ground name, printed across the wall */}
      <SignPanel
        text={GROUND_NAME}
        width={width * 0.86}
        height={2.6}
        color="#ffffff"
        position={[0, 6.6, depth / 2 + 0.08]}
      />
    </group>
  )
}

/* ------------------------------------------------------------------ */
/* Site dressing                                                       */
/* ------------------------------------------------------------------ */

/** Advertising boards ringing the pitch, as in the reference photographs. */
function Hoardings() {
  const boards = useMemo(() => {
    const out: { x: number; z: number; rot: number; w: number }[] = []
    const w = 4
    for (let x = -HALF_W + 2; x < HALF_W; x += w + 0.2) {
      out.push({ x, z: -HALF_L - 4, rot: 0, w })
      out.push({ x, z: HALF_L + 4, rot: Math.PI, w })
    }
    for (let z = -HALF_L + 2; z < HALF_L; z += w + 0.2) {
      out.push({ x: -HALF_W - 4, z, rot: Math.PI / 2, w })
      out.push({ x: HALF_W + 4, z, rot: -Math.PI / 2, w })
    }
    return out
  }, [])

  return (
    <Instances limit={boards.length} castShadow>
      <boxGeometry args={[4, 1, 0.18]} />
      <meshLambertMaterial color="#7fc4e8" />
      {boards.map((b, i) => (
        <Instance
          key={i}
          position={[b.x, 0.5, b.z]}
          rotation={[0, b.rot, 0]}
        />
      ))}
    </Instances>
  )
}

function Trees() {
  const trees = useMemo(
    () => [
      [-72, 20],
      [-78, 2],
      [-70, -18],
      [-80, 34],
      [76, 36],
      [82, 10],
      [74, -20],
      [86, 26],
      [-30, 62],
      [-6, 66],
      [18, 63],
      [42, 67],
      [-52, 60],
      [58, 61],
    ],
    [],
  )
  return (
    <group>
      {trees.map(([x, z], i) => (
        <group key={i} position={[x, 0, z]}>
          <mesh position={[0, 1.6, 0]} castShadow>
            <cylinderGeometry args={[0.28, 0.38, 3.2, 5]} />
            <meshLambertMaterial color="#6b5236" />
          </mesh>
          <mesh position={[0, 4.4, 0]} castShadow>
            <sphereGeometry args={[2.5 + (i % 3) * 0.35, 7, 6]} />
            <meshLambertMaterial color={i % 2 ? '#2f6a34' : '#37793c'} />
          </mesh>
        </group>
      ))}
    </group>
  )
}

/** Ball-stop netting behind the far goal, as on a real training ground. */
function Netting() {
  return (
    <group position={[0, 0, HALF_L + 9]}>
      {Array.from({ length: 9 }, (_, i) => (
        <mesh key={i} position={[-40 + i * 10, 5, 0]} castShadow>
          <cylinderGeometry args={[0.12, 0.12, 10, 5]} />
          <meshLambertMaterial color="#3f4750" />
        </mesh>
      ))}
      <mesh position={[0, 5, 0]}>
        <planeGeometry args={[86, 10]} />
        <meshBasicMaterial
          color="#12301c"
          transparent
          opacity={0.22}
          side={THREE.DoubleSide}
        />
      </mesh>
    </group>
  )
}

export function GroundEnvironment() {
  return (
    <group>
      {/* grass apron the pitch sits on, stopping short of the sand */}
      <mesh position={[0, -0.01, 0]} rotation={[-Math.PI / 2, 0, 0]} receiveShadow>
        <planeGeometry args={[220, 122]} />
        <meshLambertMaterial color="#2c6b32" />
      </mesh>

      <Beach />
      <Hoardings />

      {/* main stand, right-hand side */}
      <group position={[HALF_W + 12, 0, 0]} rotation={[0, -Math.PI / 2, 0]}>
        <Stand length={64} rows={9} />
      </group>

      {/* training building and its small stand, left-hand side */}
      <group position={[-HALF_W - 26, 0, 4]} rotation={[0, Math.PI / 2, 0]}>
        <TrainingBuilding />
      </group>
      <group position={[-HALF_W - 10, 0, -26]} rotation={[0, Math.PI / 2, 0]}>
        <Stand length={26} rows={5} />
      </group>

      <Floodlights />
      <Netting />
      <Trees />
    </group>
  )
}

function Floodlights() {
  const masts: [number, number][] = [
    [HALF_W + 26, -34],
    [HALF_W + 26, 34],
    [-HALF_W - 24, -34],
    [-HALF_W - 24, 34],
  ]
  return (
    <group>
      {masts.map(([x, z], i) => (
        <group key={i} position={[x, 0, z]} rotation={[0, x > 0 ? -1.6 : 1.6, 0]}>
          <Floodlight height={i % 2 ? 24 : 22} />
        </group>
      ))}
    </group>
  )
}
