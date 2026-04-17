'use client'

import { Users, Calendar, MapPin, Check, X } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { usePendingInvites, type Invite } from './use-pending-invites'

function formatDate(dateStr: string) {
  return new Date(dateStr).toLocaleDateString('en-GB', {
    day: 'numeric', month: 'long', year: 'numeric',
  })
}

export function PendingInvites({ invites: initial }: { invites: Invite[] }) {
  const { invites, processing, respond } = usePendingInvites(initial)

  if (invites.length === 0) return null

  return (
    <div>
      <div className="flex items-center gap-2 mb-4">
        <h2 className="font-semibold">Team invitations</h2>
        <span className="flex items-center justify-center size-5 rounded-full bg-primary text-primary-foreground text-xs font-bold">
          {invites.length}
        </span>
      </div>

      <div className="flex flex-col gap-3">
        {invites.map((inv) => {
          const event        = inv.registrations?.events
          const isProcessing = processing === inv.id

          return (
            <div key={inv.id} className="rounded-xl border border-border bg-card shadow-card p-card">
              <div className="flex items-start justify-between gap-4">
                <div className="flex items-start gap-3 min-w-0">
                  <div className="flex items-center justify-center size-9 rounded-lg bg-brand-100 shrink-0 mt-0.5">
                    <Users className="size-4 text-brand-700" />
                  </div>
                  <div className="min-w-0">
                    <p className="font-medium text-sm">
                      {inv.registrations?.team_name ?? 'A team'} ·{' '}
                      <span className="text-muted-foreground font-normal">
                        {inv.registrations?.division}
                      </span>
                    </p>
                    {event && (
                      <div className="mt-1.5 flex flex-col gap-0.5">
                        <p className="text-sm font-medium">{event.name}</p>
                        <span className="flex items-center gap-1 text-xs text-muted-foreground">
                          <Calendar className="size-3" />
                          {formatDate(event.date)}
                        </span>
                        <span className="flex items-center gap-1 text-xs text-muted-foreground">
                          <MapPin className="size-3" />
                          {event.location}
                        </span>
                      </div>
                    )}
                  </div>
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  <button
                    onClick={() => respond(inv.id, false)}
                    disabled={isProcessing}
                    className="flex items-center justify-center size-8 rounded-lg border border-border text-muted-foreground hover:border-danger-300 hover:text-danger-600 hover:bg-danger-50 transition-colors disabled:opacity-50"
                    title="Decline"
                  >
                    <X className="size-4" />
                  </button>
                  <Button
                    size="sm"
                    onClick={() => respond(inv.id, true)}
                    disabled={isProcessing}
                  >
                    <Check className="size-3.5 mr-1" />
                    Accept
                  </Button>
                </div>
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
