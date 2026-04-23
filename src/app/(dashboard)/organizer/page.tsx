import { redirect } from 'next/navigation'
import Link from 'next/link'
import { Plus, Calendar, MapPin, ArrowRight } from 'lucide-react'
import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'
import type { Event, EventStatus } from '@/types'

const CARD_IMAGES = [
  'https://images.unsplash.com/photo-1571019614242-c5c5dee9f50b?w=800&h=400&fit=crop&q=80',
  'https://images.unsplash.com/photo-1517836357463-d25dfeac3438?w=800&h=400&fit=crop&q=80',
  'https://images.unsplash.com/photo-1534438327276-14e5300c3a48?w=800&h=400&fit=crop&q=80',
  'https://images.unsplash.com/photo-1526506118085-60ce8714f8c5?w=800&h=400&fit=crop&q=80',
  'https://images.unsplash.com/photo-1541534741688-6078c6bfb5c5?w=800&h=400&fit=crop&q=80',
  'https://images.unsplash.com/photo-1604480132736-44c188fe4d20?w=800&h=400&fit=crop&q=80',
]

function imageFor(id: string) {
  const byte = parseInt(id.replace(/-/g, '').slice(0, 4), 16)
  return CARD_IMAGES[byte % CARD_IMAGES.length]
}

function formatDate(s: string) {
  return new Date(s).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })
}

const statusLabel: Record<EventStatus, string> = { draft: 'Draft', open: 'Open', closed: 'Closed' }
const statusPill: Record<EventStatus, string>  = {
  open:   'bg-success-100 text-success-700',
  closed: 'bg-neutral-100 text-neutral-500',
  draft:  'bg-warning-100 text-warning-700',
}

export default async function OrganizerDashboard() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')
  if (user.user_metadata?.role !== 'organizer') redirect('/athlete')

  const { data: events } = await supabase
    .from('events')
    .select('*')
    .eq('organizer_id', user.id)
    .order('date', { ascending: false })

  const raw = events ?? []

  let countMap = new Map<string, number>()
  if (raw.length > 0) {
    const { data: regRows } = await createAdminClient()
      .from('registrations')
      .select('event_id')
      .in('event_id', raw.map((e) => e.id))

    for (const row of regRows ?? []) {
      countMap.set(row.event_id, (countMap.get(row.event_id) ?? 0) + 1)
    }
  }

  const list = raw.map((e) => ({
    ...e,
    registrations: [{ count: countMap.get(e.id) ?? 0 }],
  })) as (Event & { registrations: { count: number }[] })[]

  const now      = new Date()
  const upcoming = list.filter((e) => e.status === 'draft' || new Date(e.date) >= now)
  const past     = list.filter((e) => e.status !== 'draft' && new Date(e.date) < now)

  const totalRegistrations = list.reduce(
    (sum, e) => sum + (e.registrations?.[0]?.count ?? 0),
    0,
  )

  return (
    <main className="max-w-5xl mx-auto px-page-x pt-24 pb-section">

      {/* ── Header ────────────────────────────────────────────────────────── */}
      <header className="pt-10 pb-10 border-b border-border flex flex-col md:flex-row md:items-end md:justify-between gap-6">
        <div>
          <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-muted-foreground mb-2">
            Organizer
          </p>
          <h1 className="text-title md:text-display font-bold leading-[1.02] tracking-tight">
            Your events
          </h1>
          {list.length > 0 && (
            <p className="mt-3 text-sm text-muted-foreground">
              {list.length} event{list.length !== 1 ? 's' : ''} · {totalRegistrations} total registration{totalRegistrations !== 1 ? 's' : ''}
            </p>
          )}
        </div>
        <Link
          href="/organizer/events/new"
          className="inline-flex items-center gap-2 rounded-full bg-foreground text-background
                     px-5 py-2.5 text-sm font-semibold self-start md:self-auto shrink-0
                     hover:-translate-y-0.5 transition-transform duration-300 ease-[cubic-bezier(0.32,0.72,0,1)]"
        >
          <Plus className="size-4" strokeWidth={2} />
          New event
          <span className="flex size-5 items-center justify-center rounded-full bg-white/10">
            <ArrowRight className="size-3" strokeWidth={2} />
          </span>
        </Link>
      </header>

      {list.length === 0 ? (
        <section className="py-20 max-w-lg">
          <h2 className="text-2xl font-bold leading-tight">
            Let&apos;s get the first one on the calendar.
          </h2>
          <p className="mt-3 text-sm text-muted-foreground leading-relaxed">
            Set up categories, workouts, and a capacity — athletes can register the moment you flip
            it to <span className="font-medium text-foreground">Open</span>. You can keep it in
            draft as long as you want.
          </p>
          <Link
            href="/organizer/events/new"
            className="inline-flex items-center gap-2 mt-7 rounded-full bg-foreground text-background
                       px-5 py-2.5 text-sm font-semibold
                       hover:-translate-y-0.5 transition-transform duration-300 ease-[cubic-bezier(0.32,0.72,0,1)]"
          >
            <Plus className="size-4" strokeWidth={2} />
            Create your first event
          </Link>
        </section>
      ) : (
        <>
          {upcoming.length > 0 && (
            <section className="mt-10">
              <h2 className="text-sm font-semibold mb-4">Upcoming &amp; drafts</h2>
              <div className="flex flex-col gap-3">
                {upcoming.map((e) => (
                  <EventRow key={e.id} event={e} />
                ))}
              </div>
            </section>
          )}

          {past.length > 0 && (
            <section className="mt-12">
              <h2 className="text-sm font-semibold mb-4 text-muted-foreground">Wrapped</h2>
              <div className="flex flex-col gap-3 opacity-75">
                {past.map((e) => (
                  <EventRow key={e.id} event={e} />
                ))}
              </div>
            </section>
          )}
        </>
      )}
    </main>
  )
}

// ── Event row card ─────────────────────────────────────────────────────────────
function EventRow({
  event,
}: {
  event: Event & { registrations: { count: number }[] }
}) {
  const filled = event.registrations?.[0]?.count ?? 0
  const cap    = event.capacity
  const pct    = cap > 0 ? Math.min(filled / cap, 1) : 0

  return (
    <Link
      href={`/organizer/events/${event.id}`}
      className="group flex items-center gap-4 rounded-xl border border-border bg-card p-3
                 hover:shadow-card hover:-translate-y-px
                 transition-all duration-300 ease-[cubic-bezier(0.32,0.72,0,1)]"
    >
      {/* Thumbnail */}
      <div className="relative size-14 rounded-lg overflow-hidden shrink-0">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={imageFor(event.id)}
          alt=""
          aria-hidden
          className="w-full h-full object-cover object-center transition-transform duration-500 group-hover:scale-110"
        />
      </div>

      {/* Name + meta */}
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 mb-1">
          <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-[11px] font-semibold ${statusPill[event.status as EventStatus]}`}>
            {statusLabel[event.status as EventStatus]}
          </span>
        </div>
        <p className="font-semibold text-sm leading-snug truncate group-hover:text-primary transition-colors duration-200">
          {event.name}
        </p>
        <div className="flex flex-wrap gap-x-4 gap-y-0.5 mt-1 text-xs text-muted-foreground">
          <span className="flex items-center gap-1">
            <Calendar className="size-3 shrink-0" strokeWidth={1.5} />
            {formatDate(event.date)}
          </span>
          <span className="flex items-center gap-1">
            <MapPin className="size-3 shrink-0" strokeWidth={1.5} />
            {event.location}
          </span>
        </div>
      </div>

      {/* Stats + bar */}
      <div className="hidden md:flex flex-col items-end gap-1.5 shrink-0 w-28">
        <div className="text-right">
          <span className="text-lg font-bold tabular-nums leading-none">{filled}</span>
          <span className="text-xs text-muted-foreground ml-1">
            {cap > 0 ? `/ ${cap}` : 'registered'}
          </span>
        </div>
        {cap > 0 && (
          <div className="h-1 w-full rounded-full bg-muted overflow-hidden">
            <div
              className="h-full rounded-full bg-foreground transition-all duration-500"
              style={{ width: `${pct * 100}%` }}
            />
          </div>
        )}
      </div>

      <ArrowRight className="size-4 text-muted-foreground group-hover:text-primary group-hover:translate-x-0.5 transition-all duration-200 shrink-0" strokeWidth={1.5} />
    </Link>
  )
}
