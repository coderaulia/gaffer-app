import { useMemo } from 'react'
import * as THREE from 'three'
import type { Zone } from '@/lib/types'

const HALF_W = 34
const HALF_L = 52.5
const LINE_Y = 0.02

/** A flat white line quad laid on the turf. */
function Line({
  x,
  z,
  w,
  d,
  color = '#ffffff',
  opacity = 0.85,
}: {
  x: number
  z: number
  w: number
  d: number
  color?: string
  opacity?: number
}) {
  return (
    <mesh position={[x, LINE_Y, z]} rotation={[-Math.PI / 2, 0, 0]}>
      <planeGeometry args={[w, d]} />
      <meshBasicMaterial
        color={color}
        transparent
        opacity={opacity}
        depthWrite={false}
      />
    </mesh>
  )
}

function Rect({
  x,
  z,
  w,
  d,
  t = 0.12,
  color = '#ffffff',
  opacity = 0.85,
}: {
  x: number
  z: number
  w: number
  d: number
  t?: number
  color?: string
  opacity?: number
}) {
  return (
    <>
      <Line x={x} z={z - d / 2} w={w} d={t} color={color} opacity={opacity} />
      <Line x={x} z={z + d / 2} w={w} d={t} color={color} opacity={opacity} />
      <Line x={x - w / 2} z={z} w={t} d={d} color={color} opacity={opacity} />
      <Line x={x + w / 2} z={z} w={t} d={d} color={color} opacity={opacity} />
    </>
  )
}

function Circle({
  x,
  z,
  r,
  t = 0.12,
  color = '#ffffff',
  opacity = 0.85,
}: {
  x: number
  z: number
  r: number
  t?: number
  color?: string
  opacity?: number
}) {
  return (
    <mesh position={[x, LINE_Y, z]} rotation={[-Math.PI / 2, 0, 0]}>
      <ringGeometry args={[r - t / 2, r + t / 2, 64]} />
      <meshBasicMaterial
        color={color}
        transparent
        opacity={opacity}
        depthWrite={false}
        side={THREE.DoubleSide}
      />
    </mesh>
  )
}

function Goal({ z, facing }: { z: number; facing: 1 | -1 }) {
  const post = '#f4f6f8'
  const depth = 2
  return (
    <group position={[0, 0, z]}>
      {/* posts */}
      <mesh position={[-3.66, 1.22, 0]}>
        <cylinderGeometry args={[0.06, 0.06, 2.44, 8]} />
        <meshLambertMaterial color={post} />
      </mesh>
      <mesh position={[3.66, 1.22, 0]}>
        <cylinderGeometry args={[0.06, 0.06, 2.44, 8]} />
        <meshLambertMaterial color={post} />
      </mesh>
      {/* crossbar */}
      <mesh position={[0, 2.44, 0]} rotation={[0, 0, Math.PI / 2]}>
        <cylinderGeometry args={[0.06, 0.06, 7.32, 8]} />
        <meshLambertMaterial color={post} />
      </mesh>
      {/* net: two translucent planes read fine at this scale */}
      <mesh position={[0, 1.22, (depth / 2) * facing]}>
        <planeGeometry args={[7.32, 2.44]} />
        <meshBasicMaterial
          color="#dfe6ee"
          transparent
          opacity={0.14}
          side={THREE.DoubleSide}
        />
      </mesh>
      <mesh
        position={[0, 2.44, (depth / 2) * facing]}
        rotation={[Math.PI / 2, 0, 0]}
      >
        <planeGeometry args={[7.32, depth]} />
        <meshBasicMaterial
          color="#dfe6ee"
          transparent
          opacity={0.1}
          side={THREE.DoubleSide}
        />
      </mesh>
    </group>
  )
}

/** Mowing stripes, drawn as alternating turf tones running across the pitch. */
function Stripes() {
  const stripes = useMemo(() => {
    const out: { z: number; d: number; dark: boolean }[] = []
    const count = 14
    const d = (HALF_L * 2) / count
    for (let i = 0; i < count; i++) {
      out.push({ z: -HALF_L + d / 2 + i * d, d, dark: i % 2 === 0 })
    }
    return out
  }, [])

  return (
    <>
      {stripes.map((s, i) => (
        <mesh
          key={i}
          position={[0, 0.005, s.z]}
          rotation={[-Math.PI / 2, 0, 0]}
          receiveShadow
        >
          <planeGeometry args={[HALF_W * 2, s.d]} />
          <meshLambertMaterial color={s.dark ? '#2f7a35' : '#37903d'} />
        </mesh>
      ))}
    </>
  )
}

function PenaltyArea({ end }: { end: 1 | -1 }) {
  const zBox = end * (HALF_L - 8.25)
  const zSix = end * (HALF_L - 2.75)
  const zSpot = end * (HALF_L - 11)
  return (
    <group>
      <Rect x={0} z={zBox} w={40.3} d={16.5} />
      <Rect x={0} z={zSix} w={18.32} d={5.5} />
      <Line x={0} z={zSpot} w={0.3} d={0.3} />
      {/* penalty arc, clipped by drawing only the outer half of a thin ring */}
      <mesh
        position={[0, LINE_Y, zSpot]}
        rotation={[-Math.PI / 2, 0, 0]}
        renderOrder={1}
      >
        <ringGeometry
          args={[
            9.05,
            9.17,
            48,
            1,
            end === -1 ? Math.PI * 0.72 : Math.PI * 1.72,
            Math.PI * 0.56,
          ]}
        />
        <meshBasicMaterial
          color="#ffffff"
          transparent
          opacity={0.85}
          depthWrite={false}
          side={THREE.DoubleSide}
        />
      </mesh>
    </group>
  )
}

/** Drill-specific markings: grids, zones, lanes, channels. */
function Zones({ zones }: { zones: Zone[] }) {
  return (
    <>
      {zones.map((z, i) => (
        <group key={i}>
          <Rect
            x={z.x}
            z={z.z}
            w={z.w}
            d={z.d}
            t={0.16}
            color={z.color ?? '#ffd84d'}
            opacity={0.6}
          />
          {z.fill && (
            <mesh
              position={[z.x, 0.012, z.z]}
              rotation={[-Math.PI / 2, 0, 0]}
            >
              <planeGeometry args={[z.w, z.d]} />
              <meshBasicMaterial
                color={z.color ?? '#ffd84d'}
                transparent
                opacity={0.08}
                depthWrite={false}
              />
            </mesh>
          )}
        </group>
      ))}
    </>
  )
}

export function Pitch({ zones }: { zones?: Zone[] }) {
  return (
    <group>
      {/* surround so the pitch does not float in the void */}
      <mesh position={[0, -0.01, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <planeGeometry args={[150, 150]} />
        <meshLambertMaterial color="#1d2a20" />
      </mesh>

      <Stripes />

      {/* touchlines, halfway line, centre circle */}
      <Rect x={0} z={0} w={HALF_W * 2} d={HALF_L * 2} />
      <Line x={0} z={0} w={HALF_W * 2} d={0.12} />
      <Circle x={0} z={0} r={9.15} />
      <Line x={0} z={0} w={0.3} d={0.3} />

      <PenaltyArea end={-1} />
      <PenaltyArea end={1} />

      <Goal z={-HALF_L} facing={-1} />
      <Goal z={HALF_L} facing={1} />

      {zones && zones.length > 0 && <Zones zones={zones} />}
    </group>
  )
}
