import { lazy, Suspense, useMemo, useState } from 'react'
import { ArrowLeft, PanelLeft, PanelRight } from 'lucide-react'
import { Sidebar } from './components/Sidebar'
import { Controls } from './components/Controls'
import { DrillPanel } from './components/DrillPanel'
import { HoverTooltip, PhaseCaption } from './components/Overlays'
import { Button } from './components/ui/button'
import { HomePage } from './components/pages/HomePage'
import { DrillsPage } from './components/pages/DrillsPage'
import { SessionsPage } from './components/pages/SessionsPage'
import { SquadPage } from './components/pages/SquadPage'
import { SettingsPage } from './components/pages/SettingsPage'
import { useSim } from './lib/store'
import { DrillSim } from './lib/sim'
import { cn } from './lib/utils'

// three.js and the scene only load once a drill is opened, so the
// management screens start fast.
const loadViewport = () => import('./components/Viewport')
const Viewport = lazy(() =>
  loadViewport().then((m) => ({ default: m.Viewport })),
)

// Warm the scene chunk in the background once the first screen is idle.
if (typeof window !== 'undefined') {
  const idle =
    window.requestIdleCallback ?? ((cb: () => void) => setTimeout(cb, 1500))
  idle(() => void loadViewport())
}

/** The pitch simulator. Unchanged by the management screens around it. */
function DrillSimulator() {
  const drill = useSim((s) => s.drill())!
  const sidebarOpen = useSim((s) => s.sidebarOpen)
  const setSidebarOpen = useSim((s) => s.setSidebarOpen)
  const backToMenu = useSim((s) => s.backToMenu)
  const [infoOpen, setInfoOpen] = useState(true)
  // One simulation per drill, shared by the scene and the transport controls.
  const sim = useMemo(() => new DrillSim(drill), [drill])

  return (
    <div className="flex h-full w-full overflow-hidden bg-bg">
      <div
        className={cn(
          'h-full shrink-0 border-r border-border transition-[width] duration-200',
          sidebarOpen ? 'w-80' : 'w-0',
        )}
      >
        {sidebarOpen && <Sidebar />}
      </div>

      <main className="flex min-w-0 flex-1 flex-col">
        <header className="flex items-center gap-2 border-b border-border bg-panel px-3 py-2.5">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setSidebarOpen(!sidebarOpen)}
            aria-label="Toggle drill list"
            title="Toggle drill list"
          >
            <PanelLeft className="h-4 w-4" />
          </Button>

          <Button
            variant="ghost"
            size="sm"
            onClick={backToMenu}
            title="Back to the drill library"
          >
            <ArrowLeft className="h-3.5 w-3.5" />
            Library
          </Button>

          <div className="min-w-0 pl-1">
            <h2 className="truncate text-[15px] font-semibold tracking-tight">
              {drill.title}
            </h2>
            <p className="truncate text-[11px] text-muted">
              {drill.category} · {drill.group}
            </p>
          </div>

          <Button
            variant="ghost"
            size="icon"
            onClick={() => setInfoOpen(!infoOpen)}
            aria-label="Toggle drill details"
            title="Toggle drill details"
            className="ml-auto"
          >
            <PanelRight className="h-4 w-4" />
          </Button>
        </header>

        <div className="relative min-h-0 flex-1">
          {/* Remounting per drill rebuilds every trajectory table cleanly. */}
          <Suspense
            fallback={
              <div className="flex h-full items-center justify-center text-xs text-muted">
                Loading pitch…
              </div>
            }
          >
            <Viewport key={drill.id} drill={drill} sim={sim} />
          </Suspense>
          <PhaseCaption drill={drill} />
        </div>

        <Controls drill={drill} sim={sim} />
      </main>

      <div
        className={cn(
          'h-full shrink-0 border-l border-border bg-bg transition-[width] duration-200',
          infoOpen ? 'w-80' : 'w-0',
        )}
      >
        {infoOpen && <DrillPanel drill={drill} />}
      </div>

      <HoverTooltip drill={drill} />
    </div>
  )
}

export default function App() {
  const drillId = useSim((s) => s.drillId)
  const route = useSim((s) => s.route)

  // A drill being open takes over the whole screen.
  if (drillId) return <DrillSimulator />

  switch (route) {
    case 'drills':
      return <DrillsPage />
    case 'sessions':
      return <SessionsPage />
    case 'squad':
      return <SquadPage />
    case 'settings':
      return <SettingsPage />
    default:
      return <HomePage />
  }
}
