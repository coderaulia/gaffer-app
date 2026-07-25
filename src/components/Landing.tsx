import { useMemo, useState } from 'react'
import { Search, X } from 'lucide-react'
import { CATEGORY_ORDER, DRILL_TREE, searchDrills } from '@/lib/drills'
import { useSim } from '@/lib/store'
import { cn } from '@/lib/utils'
import type { Drill } from '@/lib/types'

const CATEGORY_STYLE: Record<
  string,
  { text: string; ring: string; blurb: string }
> = {
  Attacking: {
    text: 'text-attack',
    ring: 'hover:border-attack/60',
    blurb: 'Overloads, wing play, transitions, set pieces',
  },
  Defending: {
    text: 'text-defense',
    ring: 'hover:border-defense/60',
    blurb: 'Jockeying, cover, blocks, pressing traps',
  },
  Passing: {
    text: 'text-accent',
    ring: 'hover:border-accent/60',
    blurb: 'Foundation technique through six play styles',
  },
}

function DrillCard({ drill }: { drill: Drill }) {
  const selectDrill = useSim((s) => s.selectDrill)
  const tint = CATEGORY_STYLE[drill.category]

  return (
    <button
      onClick={() => selectDrill(drill.id)}
      className={cn(
        'group flex h-full flex-col rounded-lg border border-border bg-panel p-4 text-left',
        'transition-colors hover:bg-panel-2',
        tint.ring,
      )}
    >
      <div className="flex items-center gap-2">
        <span
          className={cn(
            'rounded border border-border px-1.5 py-0.5 text-[10px] font-bold',
            tint.text,
          )}
        >
          {drill.code}
        </span>
        <span className="text-[10px] tracking-wider text-muted uppercase">
          {drill.style}
        </span>
      </div>
      <h3 className="mt-2 text-[15px] leading-snug font-semibold">
        {drill.title}
      </h3>
      <p className="mt-1.5 line-clamp-3 text-[12px] leading-relaxed text-muted">
        {drill.description}
      </p>
      <div className="mt-auto flex flex-wrap gap-x-3 gap-y-1 pt-3 text-[11px] text-muted">
        <span>{drill.playerCount}</span>
        <span>·</span>
        <span>{drill.area}</span>
      </div>
    </button>
  )
}

/**
 * The app opens here: a menu of every drill, no pitch and nothing playing.
 * Picking a drill is what starts the simulation.
 */
export function Landing() {
  const [query, setQuery] = useState('')
  const [category, setCategory] = useState<string | null>(null)
  const results = useMemo(() => searchDrills(query), [query])

  const visible = query
    ? results
    : DRILL_TREE.filter((c) => !category || c.category === category)

  return (
    <div className="scrollbar-thin h-full overflow-y-auto">
      <div className="mx-auto w-full max-w-6xl px-8 py-10">
        <header>
          <h1 className="text-4xl font-bold tracking-tight">
            Football Drill Simulator
          </h1>
          <p className="mt-2 max-w-2xl text-[15px] leading-relaxed text-muted">
            43 training drills from the attacking, defending and passing
            manuals, simulated in 3D. Pick a drill to run it — adjust speed,
            scrub the timeline, switch camera angles, and hover any player to
            see what they should be doing.
          </p>
        </header>

        <div className="mt-8 flex flex-wrap items-center gap-3">
          <div className="relative min-w-64 flex-1">
            <Search className="pointer-events-none absolute top-3 left-3 h-4 w-4 text-muted" />
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search all 43 drills…"
              className={cn(
                'h-11 w-full rounded-lg border border-border bg-panel pr-9 pl-9 text-[14px]',
                'placeholder:text-muted focus:ring-2 focus:ring-accent/50 focus:outline-none',
              )}
            />
            {query && (
              <button
                onClick={() => setQuery('')}
                className="absolute top-3.5 right-3 text-muted hover:text-fg"
                aria-label="Clear search"
              >
                <X className="h-4 w-4" />
              </button>
            )}
          </div>

          {!query && (
            <div className="flex gap-2">
              <button
                onClick={() => setCategory(null)}
                className={cn(
                  'h-11 rounded-lg border px-4 text-[13px] font-medium transition-colors',
                  category === null
                    ? 'border-accent bg-accent/10 text-accent'
                    : 'border-border text-muted hover:text-fg',
                )}
              >
                All
              </button>
              {CATEGORY_ORDER.map((c) => (
                <button
                  key={c}
                  onClick={() => setCategory(c)}
                  className={cn(
                    'h-11 rounded-lg border px-4 text-[13px] font-medium transition-colors',
                    category === c
                      ? 'border-accent bg-accent/10 text-accent'
                      : 'border-border text-muted hover:text-fg',
                  )}
                >
                  {c}
                </button>
              ))}
            </div>
          )}
        </div>

        {query ? (
          <section className="mt-8">
            <h2 className="text-[13px] tracking-wider text-muted uppercase">
              {results.length} result{results.length === 1 ? '' : 's'}
            </h2>
            <div className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
              {results.map((d) => (
                <DrillCard key={d.id} drill={d} />
              ))}
            </div>
          </section>
        ) : (
          (visible as typeof DRILL_TREE).map((cat) => (
            <section key={cat.category} className="mt-12">
              <div className="flex items-baseline gap-3 border-b border-border pb-3">
                <h2
                  className={cn(
                    'text-2xl font-bold tracking-tight',
                    CATEGORY_STYLE[cat.category].text,
                  )}
                >
                  {cat.category}
                </h2>
                <span className="text-[13px] text-muted">
                  {cat.count} drills · {CATEGORY_STYLE[cat.category].blurb}
                </span>
              </div>

              {cat.groups.map((g) => (
                <div key={g.group} className="mt-6">
                  <h3 className="text-[13px] font-semibold tracking-wider text-muted uppercase">
                    {g.group}
                  </h3>
                  <div className="mt-3 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                    {g.drills.map((d) => (
                      <DrillCard key={d.id} drill={d} />
                    ))}
                  </div>
                </div>
              ))}
            </section>
          ))
        )}
      </div>
    </div>
  )
}
