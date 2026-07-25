/**
 * Shared mutable playhead. The scene mutates and reads this every frame so
 * that 60fps animation never touches React state; the store is only
 * refreshed a few times a second to keep the scrub slider in sync.
 */
export const clock = {
  t: 0,
  duration: 10,
}
