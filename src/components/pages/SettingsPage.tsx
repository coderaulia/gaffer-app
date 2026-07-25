import { useState } from 'react'
import { Trash2 } from 'lucide-react'
import { useCoach } from '@/lib/coach'
import { cn } from '@/lib/utils'
import { Button } from '../ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card'
import { AppShell } from '../shell/AppShell'

const inputClass = cn(
  'h-10 w-full rounded-md border border-border bg-panel-2 px-3 text-[13px]',
  'placeholder:text-muted focus:ring-2 focus:ring-accent/50 focus:outline-none',
)

export function SettingsPage() {
  const { clubName, coachName, setClubName, setCoachName, resetAll } =
    useCoach()
  const [confirming, setConfirming] = useState(false)

  return (
    <AppShell title="Settings" subtitle="Stored on this device only">
      <div className="mx-auto w-full max-w-2xl space-y-4 px-4 py-6 md:px-8">
        <Card>
          <CardHeader>
            <CardTitle className="text-[12px] tracking-wider text-muted uppercase">
              Club
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <label className="block">
              <span className="mb-1 block text-[12px] text-muted">
                Club name
              </span>
              <input
                value={clubName}
                onChange={(e) => setClubName(e.target.value)}
                placeholder="Vanaila FC"
                className={inputClass}
              />
            </label>
            <label className="block">
              <span className="mb-1 block text-[12px] text-muted">
                Coach name
              </span>
              <input
                value={coachName}
                onChange={(e) => setCoachName(e.target.value)}
                placeholder="Your name"
                className={inputClass}
              />
            </label>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-[12px] tracking-wider text-muted uppercase">
              Data
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-[13px] leading-relaxed text-muted">
              Sessions and players are saved in this browser only. Clearing site
              data, or opening the app on another device, will start you fresh.
            </p>
            {confirming ? (
              <div className="mt-3 flex flex-wrap gap-2">
                <Button
                  variant="default"
                  className="bg-attack text-bg hover:opacity-90"
                  onClick={() => {
                    resetAll()
                    setConfirming(false)
                  }}
                >
                  <Trash2 className="h-3.5 w-3.5" />
                  Yes, erase everything
                </Button>
                <Button variant="outline" onClick={() => setConfirming(false)}>
                  Cancel
                </Button>
              </div>
            ) : (
              <Button
                variant="outline"
                className="mt-3"
                onClick={() => setConfirming(true)}
              >
                <Trash2 className="h-3.5 w-3.5" />
                Clear sessions and players
              </Button>
            )}
          </CardContent>
        </Card>
      </div>
    </AppShell>
  )
}
