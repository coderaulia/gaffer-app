import {
  CalendarDays,
  ClipboardList,
  Clock,
  Play,
  Plus,
  UserPlus,
  Users,
} from 'lucide-react'
import { DRILLS } from '@/lib/drills'
import {
  AVAILABILITY_COLOR,
  AVAILABILITY_LABEL,
  availabilityCounts,
  nextSession,
  sessionMinutes,
  todayISO,
  useCoach,
  type Availability,
} from '@/lib/coach'
import { useSim } from '@/lib/store'
import { cn } from '@/lib/utils'
import { Button } from '../ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card'
import { AppShell } from '../shell/AppShell'
import { CATEGORY_STYLE } from './DrillsPage'

function Panel({
  title,
  icon: Icon,
  action,
  children,
  className,
}: {
  title: string
  icon: typeof Users
  action?: React.ReactNode
  children: React.ReactNode
  className?: string
}) {
  return (
    <Card className={cn('flex flex-col', className)}>
      <CardHeader className="flex items-center justify-between gap-2">
        <CardTitle className="flex items-center gap-2 text-[12px] tracking-wider text-muted uppercase">
          <Icon className="h-3.5 w-3.5" />
          {title}
        </CardTitle>
        {action}
      </CardHeader>
      <CardContent className="flex-1">{children}</CardContent>
    </Card>
  )
}

function Empty({ children }: { children: React.ReactNode }) {
  return (
    <p className="py-3 text-[13px] leading-relaxed text-muted">{children}</p>
  )
}

function ContinuePanel() {
  const recent = useCoach((s) => s.recentDrillIds)
  const selectDrill = useSim((s) => s.selectDrill)
  const setRoute = useSim((s) => s.setRoute)

  const drills = recent
    .map((id) => DRILLS.find((d) => d.id === id))
    .filter((d): d is (typeof DRILLS)[number] => Boolean(d))

  if (drills.length === 0) {
    return (
      <Panel title="Continue" icon={Play}>
        <Empty>
          No drills opened yet. Pick one from the library and it will show up
          here for quick access.
        </Empty>
        <Button variant="accent" onClick={() => setRoute('drills')}>
          Browse drills
        </Button>
      </Panel>
    )
  }

  const [latest, ...rest] = drills

  return (
    <Panel
      title="Continue"
      icon={Play}
      action={
        <button
          onClick={() => setRoute('drills')}
          className="text-[11px] text-muted hover:text-fg"
        >
          All drills
        </button>
      }
    >
      <button
        onClick={() => selectDrill(latest.id)}
        className="group w-full rounded-lg border border-border bg-panel-2 p-3 text-left transition-colors hover:border-accent/60"
      >
        <div className="flex items-center gap-2">
          <span
            className={cn(
              'rounded border border-border px-1.5 py-0.5 text-[10px] font-bold',
              CATEGORY_STYLE[latest.category].text,
            )}
          >
            {latest.code}
          </span>
          <span className="truncate text-[10px] tracking-wider text-muted uppercase">
            {latest.category}
          </span>
          <Play className="ml-auto h-4 w-4 text-accent" />
        </div>
        <p className="mt-1.5 text-[14px] leading-snug font-semibold">
          {latest.title}
        </p>
        <p className="mt-1 line-clamp-2 text-[12px] text-muted">
          {latest.description}
        </p>
      </button>

      {rest.length > 0 && (
        <ul className="mt-2 space-y-0.5">
          {rest.slice(0, 4).map((d) => (
            <li key={d.id}>
              <button
                onClick={() => selectDrill(d.id)}
                className="flex w-full items-center gap-2 rounded-md px-2 py-1.5 text-left text-[12px] text-muted transition-colors hover:bg-panel-2 hover:text-fg"
              >
                <span
                  className={cn(
                    'w-7 shrink-0 text-center text-[10px] font-bold',
                    CATEGORY_STYLE[d.category].text,
                  )}
                >
                  {d.code}
                </span>
                <span className="truncate">{d.title}</span>
              </button>
            </li>
          ))}
        </ul>
      )}
    </Panel>
  )
}

function UpcomingSessionPanel() {
  const sessions = useCoach((s) => s.sessions)
  const setRoute = useSim((s) => s.setRoute)
  const setEditingSession = useSim((s) => s.setEditingSession)
  const session = nextSession(sessions)

  const open = (id: string) => {
    setRoute('sessions')
    setEditingSession(id)
  }

  if (!session) {
    return (
      <Panel title="Upcoming session" icon={CalendarDays}>
        <Empty>
          Nothing planned. Build a session from the drill library and it will
          appear here.
        </Empty>
        <Button variant="accent" onClick={() => setRoute('sessions')}>
          Plan a session
        </Button>
      </Panel>
    )
  }

  const minutes = sessionMinutes(session)
  const isToday = session.date === todayISO()
  const isPast = session.date < todayISO()

  return (
    <Panel
      title="Upcoming session"
      icon={CalendarDays}
      action={
        <button
          onClick={() => setRoute('sessions')}
          className="text-[11px] text-muted hover:text-fg"
        >
          All sessions
        </button>
      }
    >
      <button
        onClick={() => open(session.id)}
        className="w-full rounded-lg border border-border bg-panel-2 p-3 text-left transition-colors hover:border-accent/60"
      >
        <div className="flex items-center gap-2">
          <span
            className={cn(
              'rounded px-1.5 py-0.5 text-[10px] font-bold',
              isToday
                ? 'bg-accent/15 text-accent'
                : isPast
                  ? 'bg-panel text-muted'
                  : 'bg-panel text-fg/70',
            )}
          >
            {isToday ? 'TODAY' : session.date}
          </span>
          <span className="ml-auto flex items-center gap-1 text-[11px] text-muted">
            <Clock className="h-3 w-3" />
            {minutes} min
          </span>
        </div>
        <p className="mt-1.5 text-[14px] leading-snug font-semibold">
          {session.title}
        </p>
        <p className="mt-1 text-[12px] text-muted">
          {session.blocks.length} block
          {session.blocks.length === 1 ? '' : 's'}
        </p>
      </button>

      {session.blocks.length > 0 && (
        <ul className="mt-2 space-y-0.5">
          {session.blocks.slice(0, 4).map((b) => {
            const drill = DRILLS.find((d) => d.id === b.drillId)
            return (
              <li
                key={b.id}
                className="flex items-center gap-2 px-2 py-1 text-[12px] text-muted"
              >
                <span className="w-10 shrink-0 text-right font-mono text-[11px] tabular-nums">
                  {b.minutes}m
                </span>
                <span className="truncate">{drill?.title ?? 'Drill'}</span>
              </li>
            )
          })}
        </ul>
      )}
    </Panel>
  )
}

function SquadPanel() {
  const players = useCoach((s) => s.players)
  const setRoute = useSim((s) => s.setRoute)
  const counts = availabilityCounts(players)
  const order: Availability[] = [
    'available',
    'doubtful',
    'injured',
    'suspended',
  ]

  if (players.length === 0) {
    return (
      <Panel title="Squad snapshot" icon={Users}>
        <Empty>
          No players yet. Add your squad to track availability alongside your
          session plans.
        </Empty>
        <Button variant="accent" onClick={() => setRoute('squad')}>
          Add players
        </Button>
      </Panel>
    )
  }

  return (
    <Panel
      title="Squad snapshot"
      icon={Users}
      action={
        <button
          onClick={() => setRoute('squad')}
          className="text-[11px] text-muted hover:text-fg"
        >
          Open squad
        </button>
      }
    >
      <div className="flex items-baseline gap-2">
        <span className="text-3xl font-bold tracking-tight">
          {players.length}
        </span>
        <span className="text-[12px] text-muted">
          player{players.length === 1 ? '' : 's'} registered
        </span>
      </div>

      {/* availability bar */}
      <div className="mt-3 flex h-2 overflow-hidden rounded-full bg-panel-2">
        {order.map((a) =>
          counts[a] > 0 ? (
            <div
              key={a}
              style={{
                width: `${(counts[a] / players.length) * 100}%`,
                background: AVAILABILITY_COLOR[a],
              }}
              title={`${AVAILABILITY_LABEL[a]}: ${counts[a]}`}
            />
          ) : null,
        )}
      </div>

      <dl className="mt-3 grid grid-cols-2 gap-x-4 gap-y-1.5">
        {order.map((a) => (
          <div key={a} className="flex items-center gap-2 text-[12px]">
            <span
              className="h-2 w-2 shrink-0 rounded-full"
              style={{ background: AVAILABILITY_COLOR[a] }}
            />
            <dt className="text-muted">{AVAILABILITY_LABEL[a]}</dt>
            <dd className="ml-auto font-medium tabular-nums">{counts[a]}</dd>
          </div>
        ))}
      </dl>
    </Panel>
  )
}

function QuickActions() {
  const setRoute = useSim((s) => s.setRoute)
  const setEditingSession = useSim((s) => s.setEditingSession)
  const setEditingPlayer = useSim((s) => s.setEditingPlayer)
  const createSession = useCoach((s) => s.createSession)

  const actions = [
    {
      label: 'New session',
      hint: 'Build a training plan',
      icon: Plus,
      run: () => {
        const id = createSession()
        setRoute('sessions')
        setEditingSession(id)
      },
    },
    {
      label: 'Add player',
      hint: 'Register a squad member',
      icon: UserPlus,
      run: () => {
        setRoute('squad')
        setEditingPlayer('new')
      },
    },
    {
      label: 'Browse drills',
      hint: '43 drills, 3 manuals',
      icon: ClipboardList,
      run: () => setRoute('drills'),
    },
  ]

  return (
    <div className="grid gap-3 sm:grid-cols-3">
      {actions.map((a) => (
        <button
          key={a.label}
          onClick={a.run}
          className="flex items-center gap-3 rounded-lg border border-border bg-panel p-3 text-left transition-colors hover:border-accent/60 hover:bg-panel-2"
        >
          <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-md bg-accent/12 text-accent">
            <a.icon className="h-4 w-4" />
          </span>
          <span className="min-w-0">
            <span className="block truncate text-[13px] font-semibold">
              {a.label}
            </span>
            <span className="block truncate text-[11px] text-muted">
              {a.hint}
            </span>
          </span>
        </button>
      ))}
    </div>
  )
}

export function HomePage() {
  const clubName = useCoach((s) => s.clubName)
  const players = useCoach((s) => s.players)
  const sessions = useCoach((s) => s.sessions)

  const today = new Date().toLocaleDateString(undefined, {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
  })

  return (
    <AppShell title={clubName || 'Vanaila FC'} subtitle={today}>
      <div className="mx-auto w-full max-w-6xl space-y-4 px-4 py-5 md:px-8 md:py-6">
        <QuickActions />

        <div className="grid gap-4 lg:grid-cols-3">
          <ContinuePanel />
          <UpcomingSessionPanel />
          <SquadPanel />
        </div>

        <Card>
          <CardHeader>
            <CardTitle className="text-[12px] tracking-wider text-muted uppercase">
              At a glance
            </CardTitle>
          </CardHeader>
          <CardContent>
            <dl className="grid grid-cols-2 gap-4 sm:grid-cols-4">
              {[
                { label: 'Drills available', value: DRILLS.length },
                { label: 'Sessions planned', value: sessions.length },
                { label: 'Players registered', value: players.length },
                {
                  label: 'Minutes planned',
                  value: sessions.reduce((n, s) => n + sessionMinutes(s), 0),
                },
              ].map((s) => (
                <div key={s.label}>
                  <dd className="text-2xl font-bold tracking-tight tabular-nums">
                    {s.value}
                  </dd>
                  <dt className="text-[11px] text-muted">{s.label}</dt>
                </div>
              ))}
            </dl>
          </CardContent>
        </Card>
      </div>
    </AppShell>
  )
}
