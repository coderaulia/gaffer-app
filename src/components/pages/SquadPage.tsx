import { useEffect, useMemo, useState } from 'react'
import { ArrowLeft, Plus, Search, Trash2, Users, X } from 'lucide-react'
import {
  AVAILABILITY_COLOR,
  AVAILABILITY_LABEL,
  availabilityCounts,
  POSITIONS,
  useCoach,
  type Availability,
  type Foot,
  type Player,
  type Position,
} from '@/lib/coach'
import { useSim } from '@/lib/store'
import { cn } from '@/lib/utils'
import { Button } from '../ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card'
import { Field, Input, Select, Textarea } from '../ui/input'
import { AppShell } from '../shell/AppShell'

const AVAILABILITIES: Availability[] = [
  'available',
  'doubtful',
  'injured',
  'suspended',
]

const FEET: Foot[] = ['Right', 'Left', 'Both']

/** Rough unit each position belongs to, used to group the squad list. */
const UNIT: Record<Position, string> = {
  GK: 'Goalkeepers',
  RB: 'Defenders',
  CB: 'Defenders',
  LB: 'Defenders',
  RWB: 'Defenders',
  LWB: 'Defenders',
  DM: 'Midfielders',
  CM: 'Midfielders',
  AM: 'Midfielders',
  RW: 'Forwards',
  LW: 'Forwards',
  ST: 'Forwards',
}

const UNIT_ORDER = ['Goalkeepers', 'Defenders', 'Midfielders', 'Forwards']

function AvailabilityDot({ value }: { value: Availability }) {
  return (
    <span
      className="h-2 w-2 shrink-0 rounded-full"
      style={{ background: AVAILABILITY_COLOR[value] }}
      title={AVAILABILITY_LABEL[value]}
    />
  )
}

function AvailabilityPill({ value }: { value: Availability }) {
  return (
    <span
      className="inline-flex items-center gap-1.5 rounded px-1.5 py-0.5 text-[11px]"
      style={{
        color: AVAILABILITY_COLOR[value],
        background: `${AVAILABILITY_COLOR[value]}1f`,
      }}
    >
      <AvailabilityDot value={value} />
      {AVAILABILITY_LABEL[value]}
    </span>
  )
}

/* ------------------------------------------------------------------ */
/* List                                                                */
/* ------------------------------------------------------------------ */

function PlayerRow({ player }: { player: Player }) {
  const setEditingPlayer = useSim((s) => s.setEditingPlayer)

  return (
    <button
      onClick={() => setEditingPlayer(player.id)}
      className={cn(
        'flex w-full items-center gap-3 rounded-lg border border-border bg-panel px-3 py-2.5 text-left',
        'transition-colors hover:border-accent/50 hover:bg-panel-2',
      )}
    >
      <span className="w-7 shrink-0 text-center font-mono text-[13px] text-muted tabular-nums">
        {player.squadNumber ?? '–'}
      </span>
      <span className="w-11 shrink-0 rounded border border-border px-1 py-0.5 text-center text-[10px] font-bold text-fg/80">
        {player.position}
      </span>
      <span className="min-w-0 flex-1">
        <span className="block truncate text-[14px] font-semibold">
          {player.name || 'Unnamed player'}
        </span>
        <span className="block truncate text-[11px] text-muted">
          {player.foot} footed
          {player.notes ? ' · has notes' : ''}
        </span>
      </span>
      <span className="hidden shrink-0 sm:block">
        <AvailabilityPill value={player.availability} />
      </span>
      <span className="shrink-0 sm:hidden">
        <AvailabilityDot value={player.availability} />
      </span>
    </button>
  )
}

function SquadList() {
  const players = useCoach((s) => s.players)
  const addPlayer = useCoach((s) => s.addPlayer)
  const setEditingPlayer = useSim((s) => s.setEditingPlayer)
  const [query, setQuery] = useState('')
  const [filter, setFilter] = useState<Availability | null>(null)

  const counts = availabilityCounts(players)

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase()
    return players.filter(
      (p) =>
        (!filter || p.availability === filter) &&
        (!q ||
          `${p.name} ${p.position} ${p.squadNumber ?? ''}`
            .toLowerCase()
            .includes(q)),
    )
  }, [players, query, filter])

  const groups = useMemo(() => {
    const byUnit = new Map<string, Player[]>()
    for (const p of filtered) {
      const unit = UNIT[p.position]
      byUnit.set(unit, [...(byUnit.get(unit) ?? []), p])
    }
    for (const list of byUnit.values()) {
      list.sort(
        (a, b) =>
          POSITIONS.indexOf(a.position) - POSITIONS.indexOf(b.position) ||
          (a.squadNumber ?? 999) - (b.squadNumber ?? 999) ||
          a.name.localeCompare(b.name),
      )
    }
    return UNIT_ORDER.filter((u) => byUnit.has(u)).map((u) => ({
      unit: u,
      players: byUnit.get(u)!,
    }))
  }, [filtered])

  const create = () => {
    const id = addPlayer({
      name: '',
      position: 'CM',
      foot: 'Right',
      availability: 'available',
      notes: '',
    })
    setEditingPlayer(id)
  }

  return (
    <AppShell
      title="Squad"
      subtitle={
        players.length
          ? `${players.length} player${players.length === 1 ? '' : 's'} · ${
              counts.available
            } available`
          : 'Players, availability and notes'
      }
      actions={
        <Button variant="accent" onClick={create}>
          <Plus className="h-3.5 w-3.5" />
          Add player
        </Button>
      }
    >
      <div className="mx-auto w-full max-w-4xl px-4 py-6 md:px-8">
        {players.length === 0 ? (
          <Card>
            <CardContent className="pt-6">
              <span className="flex h-11 w-11 items-center justify-center rounded-lg bg-accent/12 text-accent">
                <Users className="h-5 w-5" />
              </span>
              <h3 className="mt-3 text-lg font-bold tracking-tight">
                No players yet
              </h3>
              <p className="mt-1.5 text-[13px] leading-relaxed text-muted">
                Register your squad to track position, preferred foot and
                availability. The home screen shows a live breakdown as it
                changes.
              </p>
              <Button variant="accent" className="mt-4" onClick={create}>
                <Plus className="h-3.5 w-3.5" />
                Add your first player
              </Button>
            </CardContent>
          </Card>
        ) : (
          <>
            <div className="flex flex-wrap items-center gap-2">
              <div className="relative min-w-48 flex-1">
                <Search className="pointer-events-none absolute top-3 left-3 h-3.5 w-3.5 text-muted" />
                <Input
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  placeholder="Search by name, number or position…"
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

              <div className="flex flex-wrap gap-1.5">
                <button
                  onClick={() => setFilter(null)}
                  className={cn(
                    'rounded border px-2 py-1.5 text-[11px] transition-colors',
                    filter === null
                      ? 'border-accent bg-accent/10 text-accent'
                      : 'border-border text-muted hover:text-fg',
                  )}
                >
                  All {players.length}
                </button>
                {AVAILABILITIES.filter((a) => counts[a] > 0).map((a) => (
                  <button
                    key={a}
                    onClick={() => setFilter(a)}
                    className={cn(
                      'flex items-center gap-1.5 rounded border px-2 py-1.5 text-[11px] transition-colors',
                      filter === a
                        ? 'border-accent bg-accent/10 text-accent'
                        : 'border-border text-muted hover:text-fg',
                    )}
                  >
                    <AvailabilityDot value={a} />
                    {AVAILABILITY_LABEL[a]} {counts[a]}
                  </button>
                ))}
              </div>
            </div>

            {groups.length === 0 ? (
              <p className="py-10 text-center text-[13px] text-muted">
                No players match that search.
              </p>
            ) : (
              groups.map((g) => (
                <section key={g.unit} className="mt-6">
                  <h3 className="text-[11px] font-semibold tracking-wider text-muted uppercase">
                    {g.unit}
                    <span className="ml-2 font-normal">{g.players.length}</span>
                  </h3>
                  <div className="mt-2 space-y-1.5">
                    {g.players.map((p) => (
                      <PlayerRow key={p.id} player={p} />
                    ))}
                  </div>
                </section>
              ))
            )}
          </>
        )}
      </div>
    </AppShell>
  )
}

/* ------------------------------------------------------------------ */
/* Detail                                                              */
/* ------------------------------------------------------------------ */

function PlayerDetail({ player }: { player: Player }) {
  const updatePlayer = useCoach((s) => s.updatePlayer)
  const removePlayer = useCoach((s) => s.removePlayer)
  const setEditingPlayer = useSim((s) => s.setEditingPlayer)

  const set = (patch: Partial<Player>) => updatePlayer(player.id, patch)

  return (
    <AppShell
      title={player.name || 'New player'}
      subtitle={`${player.position} · ${player.foot} footed · ${
        AVAILABILITY_LABEL[player.availability]
      }`}
      actions={
        <Button variant="ghost" onClick={() => setEditingPlayer(null)}>
          <ArrowLeft className="h-3.5 w-3.5" />
          Squad
        </Button>
      }
    >
      <div className="mx-auto w-full max-w-3xl space-y-4 px-4 py-6 md:px-8">
        <Card>
          <CardHeader>
            <CardTitle className="text-[12px] tracking-wider text-muted uppercase">
              Details
            </CardTitle>
          </CardHeader>
          <CardContent className="grid gap-3 sm:grid-cols-2">
            <Field label="Name" className="sm:col-span-2">
              <Input
                value={player.name}
                onChange={(e) => set({ name: e.target.value })}
                placeholder="Full name"
                autoFocus={!player.name}
              />
            </Field>

            <Field label="Squad number" hint="optional">
              <Input
                type="number"
                min={1}
                max={99}
                value={player.squadNumber ?? ''}
                onChange={(e) =>
                  set({
                    squadNumber: e.target.value
                      ? Math.max(1, Math.min(99, Number(e.target.value)))
                      : undefined,
                  })
                }
                placeholder="—"
              />
            </Field>

            <Field label="Position">
              <Select
                value={player.position}
                onChange={(e) =>
                  set({ position: e.target.value as Position })
                }
              >
                {POSITIONS.map((p) => (
                  <option key={p} value={p}>
                    {p} — {UNIT[p].slice(0, -1)}
                  </option>
                ))}
              </Select>
            </Field>

            <Field label="Preferred foot" className="sm:col-span-2">
              <div className="flex gap-1.5">
                {FEET.map((f) => (
                  <button
                    key={f}
                    onClick={() => set({ foot: f })}
                    className={cn(
                      'h-10 flex-1 rounded-md border text-[13px] transition-colors',
                      player.foot === f
                        ? 'border-accent bg-accent/10 text-accent'
                        : 'border-border text-muted hover:text-fg',
                    )}
                  >
                    {f}
                  </button>
                ))}
              </div>
            </Field>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-[12px] tracking-wider text-muted uppercase">
              Availability
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 gap-1.5 sm:grid-cols-4">
              {AVAILABILITIES.map((a) => {
                const active = player.availability === a
                return (
                  <button
                    key={a}
                    onClick={() => set({ availability: a })}
                    className={cn(
                      'flex h-10 items-center justify-center gap-1.5 rounded-md border text-[12px] transition-colors',
                      active
                        ? 'text-fg'
                        : 'border-border text-muted hover:text-fg',
                    )}
                    style={
                      active
                        ? {
                            borderColor: AVAILABILITY_COLOR[a],
                            background: `${AVAILABILITY_COLOR[a]}1f`,
                          }
                        : undefined
                    }
                  >
                    <AvailabilityDot value={a} />
                    {AVAILABILITY_LABEL[a]}
                  </button>
                )
              })}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-[12px] tracking-wider text-muted uppercase">
              Notes
            </CardTitle>
          </CardHeader>
          <CardContent>
            <Textarea
              rows={6}
              value={player.notes}
              onChange={(e) => set({ notes: e.target.value })}
              placeholder="Fitness, development focus, discipline, anything worth remembering before the next session."
            />
          </CardContent>
        </Card>

        <Button
          variant="outline"
          className="hover:text-attack"
          onClick={() => {
            removePlayer(player.id)
            setEditingPlayer(null)
          }}
        >
          <Trash2 className="h-3.5 w-3.5" />
          Delete player
        </Button>
      </div>
    </AppShell>
  )
}

export function SquadPage() {
  const editingId = useSim((s) => s.editingPlayerId)
  const setEditingPlayer = useSim((s) => s.setEditingPlayer)
  const players = useCoach((s) => s.players)
  const addPlayer = useCoach((s) => s.addPlayer)

  // The home screen's "Add player" action routes here with a sentinel rather
  // than creating a record itself, so the defaults live in one place.
  useEffect(() => {
    if (editingId !== 'new') return
    setEditingPlayer(
      addPlayer({
        name: '',
        position: 'CM',
        foot: 'Right',
        availability: 'available',
        notes: '',
      }),
    )
  }, [editingId, addPlayer, setEditingPlayer])

  const player = players.find((p) => p.id === editingId)
  return player ? <PlayerDetail player={player} /> : <SquadList />
}
