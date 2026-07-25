import { PanelLeft, PanelRight } from 'lucide-react'
import { Sidebar } from './components/Sidebar'
import { Viewport } from './components/Viewport'
import { Controls } from './components/Controls'
import { DrillPanel } from './components/DrillPanel'
import { Button } from './components/ui/button'
import { useSim } from './lib/store'
import { useState } from 'react'
import { cn } from './lib/utils'

export default function App() {
  const drill = useSim((s) => s.drill())
  const sidebarOpen = useSim((s) => s.sidebarOpen)
  const setSidebarOpen = useSim((s) => s.setSidebarOpen)
  const [infoOpen, setInfoOpen] = useState(true)

  return (
    <div className="flex h-full w-full overflow-hidden bg-bg">
      <div
        className={cn(
          'h-full shrink-0 border-r border-border transition-[width] duration-200',
          sidebarOpen ? 'w-72' : 'w-0',
        )}
      >
        {sidebarOpen && <Sidebar />}
      </div>

      <main className="flex min-w-0 flex-1 flex-col">
        <header className="flex items-center gap-2 border-b border-border bg-panel px-3 py-2">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setSidebarOpen(!sidebarOpen)}
            aria-label="Toggle drill list"
            title="Toggle drill list"
          >
            <PanelLeft className="h-4 w-4" />
          </Button>

          <div className="min-w-0">
            <h2 className="truncate text-[13px] font-medium">{drill.title}</h2>
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
          {/* Remounting per drill resets every path, trail and clock cleanly. */}
          <Viewport key={drill.id} drill={drill} />
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
    </div>
  )
}
