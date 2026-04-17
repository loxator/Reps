import { redirect } from 'next/navigation'
import Link from 'next/link'
import { Plus, Calendar, MapPin, Users } from 'lucide-react'
import { createClient } from '@/lib/supabase/server'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import type { Event, EventStatus } from '@/types'

function formatDate(s: string) {
  return new Date(s).toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' })
}

const statusLabel: Record<EventStatus, string> = {
  draft:  'Draft',
  open:   'Open',
  closed: 'Closed',
}

export default async function OrganizerDashboard() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')
  if (user.user_metadata?.role !== 'organizer') redirect('/athlete')

  const { data: events } = await supabase
    .from('events')
    .select('*, registrations(count)')
    .eq('organizer_id', user.id)
    .order('date', { ascending: false })

  const list = (events ?? []) as (Event & { registrations: { count: number }[] })[]

  return (
    <main className="max-w-4xl mx-auto px-page-x pt-28 pb-section">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-semibold">Your events</h1>
          <p className="text-sm text-muted-foreground mt-1">
            {list.length} event{list.length !== 1 ? 's' : ''} total
          </p>
        </div>
        <Button asChild>
          <Link href="/organizer/events/new">
            <Plus className="size-4 mr-1.5" />
            New event
          </Link>
        </Button>
      </div>

      {list.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-24 rounded-xl border border-dashed border-border text-center">
          <p className="font-medium mb-1">No events yet</p>
          <p className="text-sm text-muted-foreground mb-6">Create your first event to get started.</p>
          <Button asChild>
            <Link href="/organizer/events/new">
              <Plus className="size-4 mr-1.5" />
              Create event
            </Link>
          </Button>
        </div>
      ) : (
        <div className="flex flex-col gap-3">
          {list.map((e) => {
            const filled = e.registrations?.[0]?.count ?? 0
            return (
              <Link
                key={e.id}
                href={`/organizer/events/${e.id}`}
                className="flex items-center gap-4 rounded-xl border border-border bg-card px-5 py-4 shadow-card
                           hover:shadow-panel hover:border-neutral-300 hover:-translate-y-px transition-all duration-150 group"
              >
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <Badge variant={e.status as EventStatus}>{statusLabel[e.status]}</Badge>
                  </div>
                  <p className="font-semibold group-hover:text-primary transition-colors">{e.name}</p>
                  <div className="flex flex-wrap gap-x-4 gap-y-1 mt-1.5">
                    <span className="flex items-center gap-1 text-xs text-muted-foreground">
                      <Calendar className="size-3" />{formatDate(e.date)}
                    </span>
                    <span className="flex items-center gap-1 text-xs text-muted-foreground">
                      <MapPin className="size-3" />{e.location}
                    </span>
                  </div>
                </div>
                <div className="text-right shrink-0">
                  <p className="text-lg font-semibold">{filled}</p>
                  <p className="text-xs text-muted-foreground">
                    {e.capacity > 0 ? `/ ${e.capacity} spots` : 'registrations'}
                  </p>
                </div>
              </Link>
            )
          })}
        </div>
      )}
    </main>
  )
}
