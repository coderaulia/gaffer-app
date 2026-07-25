import type { ReactNode } from 'react'
import {
  CalendarDays,
  ClipboardList,
  LayoutDashboard,
  Settings,
  Users,
} from 'lucide-react'
import { useSim, type Route } from '@/lib/store'
import { cn } from '@/lib/utils'

export const APP_NAME = 'Vanaila Gaffer Management'

const NAV: { route: Route; label: string; icon: typeof LayoutDashboard }[] = [
  { route: 'home', label: 'Home', icon: LayoutDashboard },
  { route: 'drills', label: 'Drills', icon: ClipboardList },
  { route: 'sessions', label: 'Sessions', icon: CalendarDays },
  { route: 'squad', label: 'Squad', icon: Users },
  { route: 'settings', label: 'Settings', icon: Settings },
]

function NavButton({
  route,
  label,
  Icon,
  compact,
}: {
  route: Route
  label: string
  Icon: typeof LayoutDashboard
  compact?: boolean
}) {
  const active = useSim((s) => s.route) === route
  const setRoute = useSim((s) => s.setRoute)

  return (
    <button
      onClick={() => setRoute(route)}
      aria-current={active ? 'page' : undefined}
      className={cn(
        'flex items-center gap-2.5 transition-colors',
        compact
          ? 'min-w-0 flex-1 flex-col gap-1 py-2 text-[10px]'
          : 'w-full rounded-md px-3 py-2 text-[13px]',
        active
          ? compact
            ? 'text-accent'
            : 'bg-panel-2 font-medium text-fg'
          : 'text-muted hover:text-fg' + (compact ? '' : ' hover:bg-panel-2/60'),
      )}
    >
      <Icon className={compact ? 'h-5 w-5' : 'h-4 w-4'} />
      <span className="truncate">{label}</span>
      {!compact && active && (
        <span className="ml-auto h-1.5 w-1.5 rounded-full bg-accent" />
      )}
    </button>
  )
}

/**
 * Management-screen chrome: a persistent left rail on desktop, a bottom tab
 * bar on phones. Wraps every page except the drill simulator, which keeps
 * its own full-bleed layout.
 */
export function AppShell({
  children,
  title,
  subtitle,
  actions,
}: {
  children: ReactNode
  title: string
  subtitle?: string
  actions?: ReactNode
}) {
  return (
    <div className="flex h-full w-full overflow-hidden bg-bg">
      {/* desktop rail */}
      <aside className="hidden w-56 shrink-0 flex-col border-r border-border bg-panel md:flex">
        <div className="border-b border-border px-4 py-4">
          <p className="text-[10px] font-semibold tracking-[0.18em] text-accent uppercase">
            Vanaila
          </p>
          <h1 className="mt-0.5 text-[15px] leading-tight font-bold tracking-tight">
            Gaffer Management
          </h1>
        </div>

        <nav className="flex-1 space-y-0.5 overflow-y-auto p-2">
          {NAV.map((n) => (
            <NavButton
              key={n.route}
              route={n.route}
              label={n.label}
              Icon={n.icon}
            />
          ))}
        </nav>

        <div className="border-t border-border px-4 py-3">
          <p className="text-[10px] text-muted">Saved on this device</p>
        </div>
      </aside>

      <div className="flex min-w-0 flex-1 flex-col">
        <header className="flex items-center gap-3 border-b border-border bg-panel px-4 py-3 md:px-6">
          <div className="min-w-0 flex-1">
            <h2 className="truncate text-lg font-bold tracking-tight md:text-xl">
              {title}
            </h2>
            {subtitle && (
              <p className="truncate text-[12px] text-muted">{subtitle}</p>
            )}
          </div>
          {actions && (
            <div className="flex shrink-0 items-center gap-2">{actions}</div>
          )}
        </header>

        <main className="scrollbar-thin min-h-0 flex-1 overflow-y-auto pb-16 md:pb-0">
          {children}
        </main>
      </div>

      {/* phone tab bar */}
      <nav className="fixed inset-x-0 bottom-0 z-40 flex border-t border-border bg-panel md:hidden">
        {NAV.map((n) => (
          <NavButton
            key={n.route}
            route={n.route}
            label={n.label}
            Icon={n.icon}
            compact
          />
        ))}
      </nav>
    </div>
  )
}
