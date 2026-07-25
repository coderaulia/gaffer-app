import type { LucideIcon } from 'lucide-react'
import { Card, CardContent } from '../ui/card'
import { AppShell } from '../shell/AppShell'

/** Shell for a page whose feature lands in a later phase. */
export function ComingSoonPage({
  title,
  subtitle,
  icon: Icon,
  blurb,
  bullets,
}: {
  title: string
  subtitle: string
  icon: LucideIcon
  blurb: string
  bullets: string[]
}) {
  return (
    <AppShell title={title} subtitle={subtitle}>
      <div className="mx-auto w-full max-w-3xl px-4 py-8 md:px-8">
        <Card>
          <CardContent className="pt-6">
            <span className="flex h-11 w-11 items-center justify-center rounded-lg bg-accent/12 text-accent">
              <Icon className="h-5 w-5" />
            </span>
            <h3 className="mt-3 text-lg font-bold tracking-tight">{title}</h3>
            <p className="mt-1.5 text-[13px] leading-relaxed text-muted">
              {blurb}
            </p>
            <ul className="mt-4 space-y-2">
              {bullets.map((b) => (
                <li
                  key={b}
                  className="flex gap-2.5 text-[13px] leading-relaxed text-fg/85"
                >
                  <span className="mt-1.5 h-1 w-1 shrink-0 rounded-full bg-accent" />
                  {b}
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>
      </div>
    </AppShell>
  )
}
