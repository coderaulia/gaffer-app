import { useState } from 'react'
import { ArrowLeft, PanelLeft, PanelRight } from 'lucide-react'
import { Sidebar } from './components/Sidebar'
import { Landing } from './components/Landing'
import { Viewport } from './components/Viewport'
import { Controls } from './components/Controls'
import { DrillPanel } from './components/DrillPanel'
import { HoverTooltip, PhaseCaption } from './components/Overlays'
import { Button } from './components/ui/button'
import { useSim } from './lib/store'
import { cn } from './lib/utils'

export default function App() {
  const drill = useSim((s) => s.drill())
  const sidebarOpen = useSim((s) => s.sidebarOpen)
  const setSidebarOpen = useSim((s) => s.setSidebarOpen)
  const backToMenu = useSim((s) => s.backToMenu)
  const [infoOpen, setInfoOpen] = useState(true)

  // No drill picked yet: the menu is the landing screen, nothing is running.
  if (!drill) {
    return (
      <div className="h-full w-full overflow-hidden bg-bg">
        <Landing />
      </div>
    )
  }

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
            title="Back to the drill menu"
          >
            <ArrowLeft className="h-3.5 w-3.5" />
            Menu
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
          <Viewport key={drill.id} drill={drill} />
          <PhaseCaption drill={drill} />
        </div>

        <Controls drill={drill} />
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
