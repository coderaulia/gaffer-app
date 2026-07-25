import * as React from 'react'
import { useMemo } from 'react'
import * as THREE from 'three'

const cache = new Map<string, THREE.CanvasTexture>()

/**
 * Role labels rendered to a canvas texture and shown on a sprite. Keeps the
 * app fully self-contained — no webfont fetch, no SDF text pipeline — and
 * sprites are always camera-facing, which is what a pitch label wants.
 */
function labelTexture(text: string, color: string) {
  const key = `${text}|${color}`
  const hit = cache.get(key)
  if (hit) return hit

  const pad = 12
  const font = 'bold 52px ui-sans-serif, system-ui, Segoe UI, Roboto, sans-serif'
  const measure = document.createElement('canvas').getContext('2d')!
  measure.font = font
  const w = Math.ceil(measure.measureText(text).width) + pad * 2

  const canvas = document.createElement('canvas')
  canvas.width = Math.max(w, 64)
  canvas.height = 78
  const ctx = canvas.getContext('2d')!

  ctx.font = font
  ctx.textAlign = 'center'
  ctx.textBaseline = 'middle'
  ctx.lineWidth = 8
  ctx.strokeStyle = 'rgba(9,12,17,0.92)'
  ctx.strokeText(text, canvas.width / 2, canvas.height / 2)
  ctx.fillStyle = color
  ctx.fillText(text, canvas.width / 2, canvas.height / 2)

  const tex = new THREE.CanvasTexture(canvas)
  tex.anisotropy = 4
  tex.needsUpdate = true
  cache.set(key, tex)
  return tex
}

const panelCache = new Map<string, THREE.CanvasTexture>()

/**
 * Signage texture — wide canvas type for building walls and stand facades.
 * Drawn locally so the app stays free of webfonts and image assets.
 */
export function signTexture(
  text: string,
  color: string,
  background: string | null,
  weight = 'bold',
) {
  const key = `${text}|${color}|${background}|${weight}`
  const hit = panelCache.get(key)
  if (hit) return hit

  const canvas = document.createElement('canvas')
  canvas.width = 2048
  canvas.height = 256
  const ctx = canvas.getContext('2d')!

  if (background) {
    ctx.fillStyle = background
    ctx.fillRect(0, 0, canvas.width, canvas.height)
  } else {
    ctx.clearRect(0, 0, canvas.width, canvas.height)
  }

  // Shrink to fit rather than overflowing the wall.
  let size = 150
  ctx.textAlign = 'center'
  ctx.textBaseline = 'middle'
  do {
    ctx.font = `${weight} ${size}px ui-sans-serif, system-ui, Segoe UI, Roboto, sans-serif`
    size -= 4
  } while (ctx.measureText(text).width > canvas.width - 120 && size > 20)

  ctx.fillStyle = color
  ctx.fillText(text, canvas.width / 2, canvas.height / 2 + 4)

  const tex = new THREE.CanvasTexture(canvas)
  tex.anisotropy = 8
  tex.needsUpdate = true
  panelCache.set(key, tex)
  return tex
}

/** Flat lettering applied to a wall or hoarding. */
export function SignPanel({
  text,
  width,
  height,
  color = '#ffffff',
  background = null,
  ...props
}: {
  text: string
  width: number
  height: number
  color?: string
  background?: string | null
} & React.ComponentProps<'mesh'>) {
  const tex = useMemo(
    () => signTexture(text, color, background),
    [text, color, background],
  )
  return (
    <mesh {...props}>
      <planeGeometry args={[width, height]} />
      <meshBasicMaterial map={tex} transparent toneMapped={false} />
    </mesh>
  )
}

export function Label({
  text,
  color = '#ffffff',
  y = 2.1,
  scale = 1,
}: {
  text: string
  color?: string
  y?: number
  scale?: number
}) {
  const tex = useMemo(() => labelTexture(text, color), [text, color])
  const aspect = tex.image.width / tex.image.height
  const h = 0.5 * scale
  return (
    <sprite position={[0, y, 0]} scale={[h * aspect, h, 1]}>
      <spriteMaterial
        map={tex}
        transparent
        depthTest={false}
        sizeAttenuation
      />
    </sprite>
  )
}
