# Football Drill Simulator

Browser-based 3D simulation of 43 football training drills, driven by drill
definitions transcribed from the attacking, defending and passing manuals.

## Stack

- **Vite + React 19 + TypeScript**
- **three.js** via `@react-three/fiber` / `@react-three/drei`
- **Tailwind v4** with shadcn-style primitives (Radix under the hood)
- **zustand** for playback state

No physics engine. Players and the ball move along eased keyframed paths, and
the run cycle is derived from the resulting speed — so a full drill costs a
handful of primitives and stays smooth on a laptop GPU.

## Running

```bash
npm install
npm run dev
```

`npm run build` produces the production bundle; `npm run typecheck` runs `tsc`.

## Using the app

| Control | Action |
| --- | --- |
| Sidebar | Drills grouped by manual, then by play style. Search filters across all 43. |
| Speed | 0.5× / 1× / 2× — scales the animation clock, not the keyframes |
| Slider | Scrub the timeline; poses update live while paused |
| Camera | Broadcast, Sideline, Top-down — smooth transitions, free orbit in between |
| Labels / Paths | Toggle role labels and movement trails |

Keyboard: `Space` play/pause, `←`/`→` scrub, `1`/`2`/`3` camera presets.

## Drill data

Each drill is a plain object in `src/lib/drills/`:

```ts
{
  id, category, group, code, title, style, area, playerCount, durationLabel,
  description, setup, keyPoints[], simulationNote,
  view,                       // which slice of the pitch the camera frames
  duration,                   // seconds for one repetition
  players: [{ id, role, name, team, path: [{ t, x, z, action }] }],
  ball:    [{ t, x, z, y }],
  equipment?, zones?,
}
```

Coordinates are metres on a 105 × 68 pitch: `x` is width (−34 → +34), `z` is
length (−52.5 → +52.5), and every drill attacks the goal at `z = -52.5`.
Movement is authored as waypoints; heading, stride frequency and lean all fall
out of the sampled motion (`src/lib/utils.ts`).

Paths are faithful approximations of the manuals' written movements — the
shape, sequencing and timing match the coaching text; exact coordinates are
authored to read clearly in 3D.

## Layout

```
src/
  components/
    scene/        Pitch, Player rig, Ball, Equipment, Trails, CameraRig, Playback
    ui/           Button, Slider, ToggleGroup, Card
    Sidebar · Viewport · Controls · DrillPanel
  lib/
    drills/       attacking.ts (15) · defending.ts (7) · passing.ts (21)
    types.ts      drill schema + authoring helpers
    utils.ts      path sampling, easing, ball flight
    store.ts      playback state
    clock.ts      shared playhead (mutated per frame, outside React)
```
