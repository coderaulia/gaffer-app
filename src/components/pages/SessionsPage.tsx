import { useMemo, useState } from 'react'
import {
  ArrowLeft,
  CalendarDays,
  ChevronDown,
  ChevronUp,
  Clock,
  Plus,
  Search,
  Trash2,
  X,
} from 'lucide-react'
import { DRILLS, CATEGORY_ORDER, searchDrills } from '@/lib/drills'
import {
  sessionMinutes,
  todayISO,
  useCoach,
  type Session,
} from '@/lib/coach'
import { useSim } from '@/lib/store'
import { cn } from '@/lib/utils'
import { Button } from '../ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card'
import { Field, Input, Textarea } from '../ui/input'
import { AppShell } from '../shell/AppShell'
import { CATEGORY_STYLE } from './DrillsPage'

const BLOCK_PRESETS = [5, 10, 15, 20, 30]

function formatClock(totalMinutes: number) {
  const h = Math.floor(totalMinutes / 60)
  const m = totalMinutes % 60
  return h > 0 ? `${h}h ${m.toString().padStart(2, '0')}m` : `${m}m`
}

/* ------------------------------------------------------------------ */
/* List                                                                */
/* ------------------------------------------------------------------ */

function SessionRow({ session }: { session: Session }) {
  const setEditingSession = useSim((s) => s.setEditingSession)
  const removeSession = useCoach((s) => s.removeSession)
  const minutes = sessionMinutes(session)
  const isToday = session.date === todayISO()
  const isPast = session.date < todayISO()

  return (
    <div
      className={cn(
        'flex items-center gap-3 rounded-lg border border-border bg-panel p-3',
        'transition-colors hover:border-accent/50 hover:bg-panel-2',
      )}
    >
      <button
        onClick={() => setEditingSession(session.id)}
        className="min-w-0 flex-1 text-left"
      >
        <div className="flex flex-wrap items-center gap-2">
          <span
            className={cn(
              'rounded px-1.5 py-0.5 text-[10px] font-bold',
              isToday
                ? 'bg-accent/15 text-accent'
                : isPast
                  ? 'bg-panel-2 text-muted'
                  : 'bg-panel-2 text-fg/75',
            )}
          >
            {isToday ? 'TODAY' : session.date}
          </span>
          <span className="flex items-center gap-1 text-[11px] text-muted">
            <Clock className="h-3 w-3" />
            {formatClock(minutes)}
          </span>
          <span className="text-[11px] text-muted">
            {session.blocks.length} block
            {session.blocks.length === 1 ? '' : 's'}
          </span>
        </div>
        <p className="mt-1 truncate text-[14px] font-semibold">
          {session.title}
        </p>
      </button>

      <Button
        variant="ghost"
        size="icon"
        aria-label={`Delete ${session.title}`}
        title="Delete session"
        onClick={() => removeSession(session.id)}
        className="shrink-0 hover:text-attack"
      >
        <Trash2 className="h-4 w-4" />
      </Button>
    </div>
  )
}

function SessionList() {
  const sessions = useCoach((s) => s.sessions)
  const createSession = useCoach((s) => s.createSession)
  const setEditingSession = useSim((s) => s.setEditingSession)

  const sorted = useMemo(
    () => [...sessions].sort((a, b) => b.date.localeCompare(a.date)),
    [sessions],
  )

  const totalMinutes = sessions.reduce((n, s) => n + sessionMinutes(s), 0)

  const newSession = () => setEditingSession(createSession())

  return (
    <AppShell
      title="Sessions"
      subtitle={
        sessions.length
          ? `${sessions.length} planned · ${formatClock(totalMinutes)} total`
          : 'Training plans, saved on this device'
      }
      actions={
        <Button variant="accent" onClick={newSession}>
          <Plus className="h-3.5 w-3.5" />
          New session
        </Button>
      }
    >
      <div className="mx-auto w-full max-w-4xl px-4 py-6 md:px-8">
        {sessions.length === 0 ? (
          <Card>
            <CardContent className="pt-6">
              <span className="flex h-11 w-11 items-center justify-center rounded-lg bg-accent/12 text-accent">
                <CalendarDays className="h-5 w-5" />
              </span>
              <h3 className="mt-3 text-lg font-bold tracking-tight">
                No sessions yet
              </h3>
              <p className="mt-1.5 text-[13px] leading-relaxed text-muted">
                Build a plan by dropping drills from the library into an ordered
                timeline. Set the minutes for each block and the total updates
                as you go.
              </p>
              <Button variant="accent" className="mt-4" onClick={newSession}>
                <Plus className="h-3.5 w-3.5" />
                Plan your first session
              </Button>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-2">
            {sorted.map((s) => (
              <SessionRow key={s.id} session={s} />
            ))}
          </div>
        )}
      </div>
    </AppShell>
  )
}

/* ------------------------------------------------------------------ */
/* Drill picker                                                        */
/* ------------------------------------------------------------------ */

function DrillPicker({ onAdd }: { onAdd: (drillId: string) => void }) {
  const [query, setQuery] = useState('')
  const [category, setCategory] = useState<string | null>(null)

  const list = useMemo(() => {
    const base = query ? searchDrills(query) : DRILLS
    return category ? base.filter((d) => d.category === category) : base
  }, [query, category])

  return (
    <Card className="flex max-h-[70vh] flex-col">
      <CardHeader>
        <CardTitle className="text-[12px] tracking-wider text-muted uppercase">
          Add a drill
        </CardTitle>
      </CardHeader>
      <CardContent className="flex min-h-0 flex-1 flex-col">
        <div className="relative">
          <Search className="pointer-events-none absolute top-3 left-3 h-3.5 w-3.5 text-muted" />
          <Input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search the library…"
            className="pl-8"
          />
          {query && (
            <button
              onClick={() => setQuery('')}
              className="absolute top-3 right-3 text-muted hover:text-fg"
              aria-label="Clear search"
            >
              <X className="h-3.5 w-3.5" />
            </button>
          )}
        </div>

        <div className="mt-2 flex flex-wrap gap-1.5">
          <button
            onClick={() => setCategory(null)}
            className={cn(
              'rounded border px-2 py-1 text-[11px] transition-colors',
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
                'rounded border px-2 py-1 text-[11px] transition-colors',
                category === c
                  ? 'border-accent bg-accent/10 text-accent'
                  : 'border-border text-muted hover:text-fg',
              )}
            >
              {c}
            </button>
          ))}
        </div>

        <ul className="scrollbar-thin mt-2 min-h-0 flex-1 space-y-0.5 overflow-y-auto">
          {list.map((d) => (
            <li key={d.id}>
              <button
                onClick={() => onAdd(d.id)}
                className="flex w-full items-start gap-2 rounded-md px-2 py-2 text-left transition-colors hover:bg-panel-2"
              >
                <span
                  className={cn(
                    'mt-0.5 w-7 shrink-0 rounded border border-border text-center text-[10px] font-bold',
                    CATEGORY_STYLE[d.category].text,
                  )}
                >
                  {d.code}
                </span>
                <span className="min-w-0 flex-1">
                  <span className="block truncate text-[13px]">{d.title}</span>
                  <span className="block truncate text-[11px] text-muted">
                    {d.style}
                  </span>
                </span>
                <Plus className="mt-1 h-3.5 w-3.5 shrink-0 text-muted" />
              </button>
            </li>
          ))}
          {list.length === 0 && (
            <li className="px-2 py-6 text-center text-[12px] text-muted">
              No drills match that search.
            </li>
          )}
        </ul>
      </CardContent>
    </Card>
  )
}

/* ------------------------------------------------------------------ */
/* Builder                                                             */
/* ------------------------------------------------------------------ */

function SessionBuilder({ session }: { session: Session }) {
  const {
    updateSession,
    addBlock,
    updateBlock,
    removeBlock,
    moveBlock,
    removeSession,
  } = useCoach()
  const setEditingSession = useSim((s) => s.setEditingSession)
  const selectDrill = useSim((s) => s.selectDrill)
  const [pickerOpen, setPickerOpen] = useState(false)

  const total = sessionMinutes(session)

  // Running clock so a coach can see when each block starts.
  let elapsed = 0
  const timeline = session.blocks.map((b) => {
    const start = elapsed
    elapsed += b.minutes
    return { block: b, start, end: elapsed }
  })

  // The picker stays open after adding: sessions are usually built several
  // drills at a time, and the running total in the header updates live.
  const add = (drillId: string) => addBlock(session.id, drillId)

  return (
    <AppShell
      title={session.title || 'Untitled session'}
      subtitle={`${session.blocks.length} block${
        session.blocks.length === 1 ? '' : 's'
      } · ${formatClock(total)}`}
      actions={
        <Button variant="ghost" onClick={() => setEditingSession(null)}>
          <ArrowLeft className="h-3.5 w-3.5" />
          Sessions
        </Button>
      }
    >
      <div className="mx-auto grid w-full max-w-5xl gap-4 px-4 py-6 md:px-8 lg:grid-cols-[1fr_20rem]">
        <div className="min-w-0 space-y-4">
          <Card>
            <CardContent className="grid gap-3 pt-4 sm:grid-cols-2">
              <Field label="Title" className="sm:col-span-2">
                <Input
                  value={session.title}
                  onChange={(e) =>
                    updateSession(session.id, { title: e.target.value })
                  }
                  placeholder="Wing play session"
                />
              </Field>
              <Field label="Date">
                <Input
                  type="date"
                  value={session.date}
                  onChange={(e) =>
                    updateSession(session.id, { date: e.target.value })
                  }
                />
              </Field>
              <Field label="Total" hint="from the blocks below">
                <div className="flex h-10 items-center rounded-md border border-border bg-panel px-3 text-[13px] font-semibold tabular-nums">
                  {formatClock(total)}
                </div>
              </Field>
              <Field label="Notes" className="sm:col-span-2">
                <Textarea
                  rows={2}
                  value={session.notes}
                  onChange={(e) =>
                    updateSession(session.id, { notes: e.target.value })
                  }
                  placeholder="Focus, equipment, anything to remember"
                />
              </Field>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex items-center justify-between gap-2">
              <CardTitle className="text-[12px] tracking-wider text-muted uppercase">
                Timeline
              </CardTitle>
              <Button
                variant="outline"
                size="sm"
                className="lg:hidden"
                onClick={() => setPickerOpen((v) => !v)}
              >
                <Plus className="h-3.5 w-3.5" />
                Add drill
              </Button>
            </CardHeader>
            <CardContent>
              {timeline.length === 0 ? (
                <p className="py-4 text-[13px] leading-relaxed text-muted">
                  No blocks yet. Pick drills from the library to build the
                  session, then set how long each one runs.
                </p>
              ) : (
                <ol className="space-y-2">
                  {timeline.map(({ block, start, end }, i) => {
                    const drill = DRILLS.find((d) => d.id === block.drillId)
                    return (
                      <li
                        key={block.id}
                        className="rounded-lg border border-border bg-panel-2 p-3"
                      >
                        <div className="flex items-start gap-3">
                          <span className="w-16 shrink-0 pt-0.5 font-mono text-[11px] text-muted tabular-nums">
                            {start}–{end}m
                          </span>

                          <div className="min-w-0 flex-1">
                            <div className="flex flex-wrap items-center gap-2">
                              {drill && (
                                <span
                                  className={cn(
                                    'rounded border border-border px-1.5 text-[10px] font-bold',
                                    CATEGORY_STYLE[drill.category].text,
                                  )}
                                >
                                  {drill.code}
                                </span>
                              )}
                              <button
                                onClick={() =>
                                  drill && selectDrill(drill.id)
                                }
                                className="truncate text-[13px] font-semibold hover:text-accent"
                                title="Open in the simulator"
                              >
                                {drill?.title ?? 'Drill removed'}
                              </button>
                            </div>

                            <div className="mt-2 flex flex-wrap items-center gap-1.5">
                              <Input
                                type="number"
                                min={1}
                                step={1}
                                value={block.minutes}
                                onChange={(e) =>
                                  updateBlock(session.id, block.id, {
                                    minutes: Math.max(
                                      1,
                                      Number(e.target.value) || 1,
                                    ),
                                  })
                                }
                                aria-label="Minutes"
                                className="h-8 w-20"
                              />
                              {BLOCK_PRESETS.map((m) => (
                                <button
                                  key={m}
                                  onClick={() =>
                                    updateBlock(session.id, block.id, {
                                      minutes: m,
                                    })
                                  }
                                  className={cn(
                                    'rounded border px-1.5 py-0.5 text-[11px] transition-colors',
                                    block.minutes === m
                                      ? 'border-accent bg-accent/10 text-accent'
                                      : 'border-border text-muted hover:text-fg',
                                  )}
                                >
                                  {m}m
                                </button>
                              ))}
                            </div>

                            <Input
                              value={block.note ?? ''}
                              onChange={(e) =>
                                updateBlock(session.id, block.id, {
                                  note: e.target.value,
                                })
                              }
                              placeholder="Coaching focus for this block"
                              className="mt-2 h-8 text-[12px]"
                            />
                          </div>

                          <div className="flex shrink-0 flex-col gap-0.5">
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-7 w-7"
                              disabled={i === 0}
                              aria-label="Move up"
                              onClick={() =>
                                moveBlock(session.id, block.id, -1)
                              }
                            >
                              <ChevronUp className="h-3.5 w-3.5" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-7 w-7"
                              disabled={i === timeline.length - 1}
                              aria-label="Move down"
                              onClick={() => moveBlock(session.id, block.id, 1)}
                            >
                              <ChevronDown className="h-3.5 w-3.5" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-7 w-7 hover:text-attack"
                              aria-label="Remove block"
                              onClick={() => removeBlock(session.id, block.id)}
                            >
                              <Trash2 className="h-3.5 w-3.5" />
                            </Button>
                          </div>
                        </div>
                      </li>
                    )
                  })}
                </ol>
              )}
            </CardContent>
          </Card>

          <Button
            variant="outline"
            className="hover:text-attack"
            onClick={() => {
              removeSession(session.id)
              setEditingSession(null)
            }}
          >
            <Trash2 className="h-3.5 w-3.5" />
            Delete session
          </Button>
        </div>

        {/* picker: a column on desktop, a toggled panel on phones */}
        <div className={cn('min-w-0', pickerOpen ? 'block' : 'hidden lg:block')}>
          <DrillPicker onAdd={add} />
        </div>
      </div>
    </AppShell>
  )
}

export function SessionsPage() {
  const editingId = useSim((s) => s.editingSessionId)
  const sessions = useCoach((s) => s.sessions)
  const session = sessions.find((s) => s.id === editingId)

  return session ? <SessionBuilder session={session} /> : <SessionList />
}
