import { redirect } from 'next/navigation'
import Link from 'next/link'
import { Plus, Calendar, MapPin } from 'lucide-react'
import { createClient } from '@/lib/supabase/server'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import type { Event, EventStatus } from '@/types'

function formatDate(s: string) {
  return new Date(s).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })
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

  // Split out: upcoming (date >= today) and past. Drafts always go under upcoming.
  const now = new Date()
  const upcoming = list.filter((e) => e.status === 'draft' || new Date(e.date) >= now)
  const past     = list.filter((e) => e.status !== 'draft' && new Date(e.date) < now)

  const totalRegistrations = list.reduce(
    (sum, e) => sum + (e.registrations?.[0]?.count ?? 0),
    0,
  )

  return (
    <main className="max-w-5xl mx-auto px-page-x pt-24 pb-section">

      {/* Header */}
      <header className="pt-10 pb-10 border-b border-border flex flex-col md:flex-row md:items-end md:justify-between gap-6">
        <div>
          <h1 className="text-title md:text-display font-bold leading-[1.02] tracking-tight">
            Your events
          </h1>
          <p className="mt-3 text-sm text-muted-foreground">
            {list.length === 0
              ? 'Nothing published yet.'
              : `${list.length} event${list.length !== 1 ? 's' : ''} · ${totalRegistrations} total registration${totalRegistrations !== 1 ? 's' : ''}`}
          </p>
        </div>
        <Button asChild size="lg">
          <Link href="/organizer/events/new">
            <Plus className="size-4" />
            New event
          </Link>
        </Button>
      </header>

      {list.length === 0 ? (
        <section className="py-20 max-w-lg">
          <h2 className="text-subhead md:text-heading font-bold leading-tight">
            Let&apos;s get the first one on the calendar.
          </h2>
          <p className="mt-3 text-sm text-muted-foreground leading-relaxed">
            Set up categories, workouts, and a capacity — athletes can register the moment you flip
            it to <span className="font-medium text-foreground">Open</span>. You can keep it in
            draft as long as you want.
          </p>
          <Button asChild size="lg" className="mt-7">
            <Link href="/organizer/events/new">
              <Plus className="size-4" />
              Create your first event
            </Link>
          </Button>
        </section>
      ) : (
        <>
          {upcoming.length > 0 && (
            <section className="mt-10">
              <h2 className="text-subhead font-bold mb-5">Upcoming &amp; drafts</h2>
              <ul className="flex flex-col divide-y divide-border border-y border-border">
                {upcoming.map((e) => (
                  <EventRow key={e.id} event={e} />
                ))}
              </ul>
            </section>
          )}

          {past.length > 0 && (
            <section className="mt-12">
              <h2 className="text-subhead font-bold mb-5">Wrapped</h2>
              <ul className="flex flex-col divide-y divide-border border-y border-border opacity-80">
                {past.map((e) => (
                  <EventRow key={e.id} event={e} />
                ))}
              </ul>
            </section>
          )}
        </>
      )}
    </main>
  )
}

// ── Row component (inline so this page stays self-contained) ─────────────────
function EventRow({
  event,
}: {
  event: Event & { registrations: { count: number }[] }
}) {
  const filled = event.registrations?.[0]?.count ?? 0
  const cap = event.capacity
  const pct = cap > 0 ? Math.min(filled / cap, 1) : 0

  return (
    <li>
      <Link
        href={`/organizer/events/${event.id}`}
        className="group grid grid-cols-1 md:grid-cols-[1fr_auto_11rem] gap-x-8 gap-y-2 py-5 items-center hover:bg-muted/40 -mx-2 px-2 rounded-md transition-colors"
      >
        <div className="min-w-0">
          <div className="flex items-center gap-2 mb-1.5">
            <Badge variant={event.status as EventStatus}>{statusLabel[event.status]}</Badge>
          </div>
          <p className="font-semibold text-base leading-snug group-hover:underline underline-offset-4 decoration-primary/50 truncate">
            {event.name}
          </p>
          <div className="flex flex-wrap gap-x-4 gap-y-1 mt-1.5 text-xs text-muted-foreground">
            <span className="inline-flex items-center gap-1">
              <Calendar className="size-3" />{formatDate(event.date)}
            </span>
            <span className="inline-flex items-center gap-1">
              <MapPin className="size-3" />{event.location}
            </span>
          </div>
        </div>

        <div className="text-right tabular-nums">
          <p className="text-subhead font-bold leading-none">{filled}</p>
          <p className="text-xs text-muted-foreground mt-1">
            {cap > 0 ? `of ${cap}` : 'registered'}
          </p>
        </div>

        {/* Capacity bar — only when capacity is set */}
        <div className="hidden md:block">
          {cap > 0 && (
            <div className="h-1 w-full rounded-full bg-muted overflow-hidden">
              <div
                className="h-full bg-foreground transition-all"
                style={{ width: `${pct * 100}%` }}
              />
            </div>
          )}
        </div>
      </Link>
    </li>
  )
}
