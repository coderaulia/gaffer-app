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
