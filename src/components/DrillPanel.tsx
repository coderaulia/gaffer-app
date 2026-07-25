import type { Drill } from '@/lib/types'
import { Badge, Card, CardContent, CardHeader, CardTitle } from './ui/card'
import { TEAM_COLORS } from './scene/Player'

const TEAM_LABEL: Record<string, string> = {
  attack: 'Attacking',
  defense: 'Defending',
  neutral: 'Neutral / coach',
  gk: 'Goalkeeper',
}

export function DrillPanel({ drill }: { drill: Drill }) {
  const teams = [...new Set(drill.players.map((p) => p.team))]

  return (
    <div className="scrollbar-thin h-full overflow-y-auto p-3">
      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <Badge>{drill.category}</Badge>
            <Badge>Drill {drill.code}</Badge>
          </div>
          <CardTitle className="mt-2 text-[15px] leading-snug">
            {drill.title}
          </CardTitle>
          <p className="mt-1 text-[11px] text-muted">{drill.style}</p>
        </CardHeader>
        <CardContent>
          <p className="text-[13px] leading-relaxed text-fg/85">
            {drill.description}
          </p>

          <dl className="mt-3 grid grid-cols-[auto_1fr] gap-x-3 gap-y-1.5 text-[12px]">
            <dt className="text-muted">Area</dt>
            <dd>{drill.area}</dd>
            <dt className="text-muted">Players</dt>
            <dd>{drill.playerCount}</dd>
            <dt className="text-muted">Session</dt>
            <dd>{drill.durationLabel}</dd>
          </dl>
        </CardContent>
      </Card>

      <Card className="mt-3">
        <CardHeader>
          <CardTitle>Setup</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-[13px] leading-relaxed text-fg/85">{drill.setup}</p>
        </CardContent>
      </Card>

      <Card className="mt-3">
        <CardHeader>
          <CardTitle>Coaching points</CardTitle>
        </CardHeader>
        <CardContent>
          <ul className="space-y-2">
            {drill.keyPoints.map((k, i) => (
              <li
                key={i}
                className="flex gap-2 text-[13px] leading-relaxed text-fg/85"
              >
                <span className="mt-1.5 h-1 w-1 shrink-0 rounded-full bg-accent" />
                {k}
              </li>
            ))}
          </ul>
        </CardContent>
      </Card>

      {drill.simulationNote && (
        <Card className="mt-3">
          <CardHeader>
            <CardTitle>Simulation note</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-[13px] leading-relaxed text-fg/85">
              {drill.simulationNote}
            </p>
          </CardContent>
        </Card>
      )}

      <Card className="mt-3 mb-3">
        <CardHeader>
          <CardTitle>On the pitch</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="mb-3 flex flex-wrap gap-3">
            {teams.map((t) => (
              <span key={t} className="flex items-center gap-1.5 text-[11px] text-muted">
                <span
                  className="h-2.5 w-2.5 rounded-full"
                  style={{ background: TEAM_COLORS[t].shirt }}
                />
                {TEAM_LABEL[t]}
              </span>
            ))}
          </div>
          <ul className="space-y-1">
            {drill.players.map((p) => (
              <li key={p.id} className="flex items-baseline gap-2 text-[12px]">
                <span
                  className="w-9 shrink-0 rounded px-1 py-0.5 text-center text-[10px] font-semibold"
                  style={{
                    background: `${TEAM_COLORS[p.team].shirt}22`,
                    color: TEAM_COLORS[p.team].shirt,
                  }}
                >
                  {p.role}
                </span>
                <span className="text-fg/80">{p.name}</span>
              </li>
            ))}
          </ul>
        </CardContent>
      </Card>
    </div>
  )
}
