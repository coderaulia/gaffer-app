import { useEffect, useMemo, useRef, useState } from 'react'
import * as Accordion from '@radix-ui/react-accordion'
import { ChevronDown, Search, X } from 'lucide-react'
import { DRILL_TREE, searchDrills } from '@/lib/drills'
import { useSim } from '@/lib/store'
import { cn } from '@/lib/utils'
import type { Drill } from '@/lib/types'

const CATEGORY_TINT: Record<string, string> = {
  Attacking: 'text-attack',
  Defending: 'text-defense',
  Passing: 'text-accent',
}

function DrillButton({ drill }: { drill: Drill }) {
  const drillId = useSim((s) => s.drillId)
  const selectDrill = useSim((s) => s.selectDrill)
  const active = drillId === drill.id
  const ref = useRef<HTMLButtonElement>(null)

  // Keep the open drill visible when the list is opened or switched.
  useEffect(() => {
    if (active) ref.current?.scrollIntoView({ block: 'nearest' })
  }, [active])

  return (
    <button
      ref={ref}
      onClick={() => selectDrill(drill.id)}
      className={cn(
        'group flex w-full items-start gap-2 rounded-md px-2 py-1.5 text-left transition-colors',
        active ? 'bg-panel-2 text-fg' : 'text-muted hover:bg-panel-2/60 hover:text-fg',
      )}
    >
      <span
        className={cn(
          'mt-0.5 w-7 shrink-0 rounded border border-border px-1 py-0.5 text-center text-[10px] font-semibold',
          active ? 'border-accent text-accent' : 'text-muted',
        )}
      >
        {drill.code}
      </span>
      <span className="text-[13px] leading-snug">{drill.title}</span>
    </button>
  )
}

export function Sidebar() {
  const [query, setQuery] = useState('')
  const current = useSim((s) => s.drill())
  // The list follows the drill that is actually open, rather than always
  // defaulting to the first category.
  const [open, setOpen] = useState<string[]>(() =>
    current ? [current.category] : [],
  )
  const results = useMemo(() => searchDrills(query), [query])

  useEffect(() => {
    if (!current) return
    setOpen((prev) =>
      prev.includes(current.category) ? prev : [...prev, current.category],
    )
  }, [current])

  return (
    <aside className="flex h-full w-full flex-col bg-panel">
      <button
        onClick={() => useSim.getState().backToMenu()}
        className="border-b border-border px-4 py-4 text-left transition-colors hover:bg-panel-2"
        title="Back to the drill menu"
      >
        <h1 className="text-lg font-bold tracking-tight">Drill Library</h1>
        <p className="mt-0.5 text-[12px] text-muted">
          43 drills · back to menu
        </p>
      </button>

      <div className="border-b border-border p-3">
        <div className="relative">
          <Search className="pointer-events-none absolute top-2.5 left-2.5 h-3.5 w-3.5 text-muted" />
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search drills…"
            className={cn(
              'h-9 w-full rounded-md border border-border bg-panel-2 pr-8 pl-8 text-[13px]',
              'placeholder:text-muted focus:outline-none focus:ring-2 focus:ring-accent/50',
            )}
          />
          {query && (
            <button
              onClick={() => setQuery('')}
              className="absolute top-2.5 right-2.5 text-muted hover:text-fg"
              aria-label="Clear search"
            >
              <X className="h-3.5 w-3.5" />
            </button>
          )}
        </div>
      </div>

      <div className="scrollbar-thin flex-1 overflow-y-auto p-2">
        {query ? (
          <div className="space-y-0.5">
            <p className="px-2 py-1.5 text-[11px] tracking-wide text-muted uppercase">
              {results.length} result{results.length === 1 ? '' : 's'}
            </p>
            {results.map((d) => (
              <DrillButton key={d.id} drill={d} />
            ))}
          </div>
        ) : (
          <Accordion.Root
            type="multiple"
            value={open}
            onValueChange={setOpen}
            className="space-y-1"
          >
            {DRILL_TREE.map((cat) => (
              <Accordion.Item key={cat.category} value={cat.category}>
                <Accordion.Header>
                  <Accordion.Trigger
                    className={cn(
                      'group flex w-full items-center justify-between rounded-md px-2 py-2.5',
                      'text-left transition-colors hover:bg-panel-2',
                    )}
                  >
                    <span className="flex items-baseline gap-2.5">
                      <span
                        className={cn(
                          'text-xl font-bold tracking-tight',
                          CATEGORY_TINT[cat.category],
                        )}
                      >
                        {cat.category}
                      </span>
                      <span className="text-[13px] font-medium text-muted">
                        {cat.count}
                      </span>
                    </span>
                    <ChevronDown className="h-4 w-4 text-muted transition-transform group-data-[state=open]:rotate-180" />
                  </Accordion.Trigger>
                </Accordion.Header>
                <Accordion.Content className="pt-0.5 pb-1.5">
                  {cat.groups.map((g) => (
                    <div key={g.group} className="mb-2.5">
                      <p className="px-2 py-1.5 text-[11px] font-semibold tracking-wider text-muted uppercase">
                        {g.group}
                      </p>
                      <div className="space-y-0.5">
                        {g.drills.map((d) => (
                          <DrillButton key={d.id} drill={d} />
                        ))}
                      </div>
                    </div>
                  ))}
                </Accordion.Content>
              </Accordion.Item>
            ))}
          </Accordion.Root>
        )}
      </div>
    </aside>
  )
}
