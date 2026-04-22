import Link from 'next/link'
import { redirect } from 'next/navigation'
import { ArrowRight } from 'lucide-react'
import { createClient } from '@/lib/supabase/server'
import { PendingInvites } from '@/components/athlete/pending-invites'
import { RegisteredEventCard, type RegisteredEvent } from '@/components/athlete/registered-event-card'
import { EventCard } from '@/components/events/event-card'
import type { Event } from '@/types'

export default async function AthleteDashboard() {
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const [profileRes, userRes, registrationsRes, invitesRes] = await Promise.all([
    supabase
      .from('athlete_profiles')
      .select('location')
      .eq('user_id', user.id)
      .single(),

    supabase
      .from('users')
      .select('name')
      .eq('id', user.id)
      .single(),

    supabase
      .from('registrations')
      .select(`
        id, division, team_name, is_team, status, registered_at,
        events ( id, name, date, location, status ),
        heat_assignments (
          heats ( name, start_time, workouts ( name, order_num ) )
        )
      `)
      .eq('athlete_id', user.id)
      .order('registered_at', { ascending: false }),

    supabase
      .from('team_members')
      .select(`
        id, name, email, status, registration_id,
        registrations (
          id, division, team_name,
          events ( id, name, date, location )
        )
      `)
      .eq('user_id', user.id)
      .eq('status', 'invited'),
  ])

  const firstName = ((userRes.data as { name?: string } | null)?.name ?? '').split(' ')[0] || null
  const location  = profileRes.data?.location ?? null
  const registrations = (registrationsRes.data ?? []) as unknown as RegisteredEvent[]
  const invites = invitesRes.data ?? []

  const city = location?.split(',')[0]?.trim() ?? null

  const registeredEventIds = registrations
    .map((r) => r.events?.id)
    .filter((id): id is string => Boolean(id))

  let nearbyEvents: Event[] = []
  if (city) {
    let query = supabase
      .from('events')
      .select('*, registrations(count)')
      .eq('status', 'open')
      .ilike('location', `%${city}%`)
      .order('date', { ascending: true })
      .limit(6)

    if (registeredEventIds.length > 0) {
      query = query.not('id', 'in', `(${registeredEventIds.join(',')})`)
    }

    const { data } = await query
    nearbyEvents = (data ?? []) as Event[]
  }

  const now = new Date()
  const upcomingRegs = registrations.filter((r) => r.events && new Date(r.events.date) >= now)
  const pastRegs     = registrations.filter((r) => r.events && new Date(r.events.date) < now)

  const nextReg       = upcomingRegs[upcomingRegs.length - 1] ?? null
  const nextEventDate = nextReg?.events?.date
    ? new Date(nextReg.events.date).toLocaleDateString('en-GB', { day: 'numeric', month: 'long' })
    : null

  return (
    <main className="max-w-5xl mx-auto px-page-x pt-24 pb-section">

      {/* ── Greeting ─────────────────────────────────────────────────────── */}
      <header className="pt-10 pb-10 border-b border-border">
        <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-muted-foreground mb-2">
          Dashboard
        </p>
        <h1 className="text-title md:text-display font-bold leading-[1.02] tracking-tight">
          {firstName ? `Hey ${firstName}.` : 'Hey there.'}
        </h1>
        <p className="mt-3 text-base text-muted-foreground max-w-prose">
          {upcomingRegs.length === 0
            ? "You haven't signed up for anything yet. Something below might change that."
            : upcomingRegs.length === 1
              ? `You've got one event coming up${nextEventDate ? ` — ${nextEventDate}` : ''}.`
              : `You've got ${upcomingRegs.length} events coming up${nextEventDate ? ` — next on ${nextEventDate}` : ''}.`}
        </p>
      </header>

      {/* ── Pending invites ───────────────────────────────────────────────── */}
      {invites.length > 0 && (
        <section className="mt-10">
          <PendingInvites invites={invites} />
        </section>
      )}

      {/* ── My events ─────────────────────────────────────────────────────── */}
      <section className="mt-12">

        {upcomingRegs.length > 0 && (
          <div className="mb-10">
            <div className="flex items-baseline justify-between mb-5">
              <h2 className="text-xl font-bold">Coming up</h2>
              <span className="text-sm tabular-nums text-muted-foreground">{upcomingRegs.length}</span>
            </div>
            <div className="grid sm:grid-cols-2 gap-4">
              {upcomingRegs.map((reg) => (
                <RegisteredEventCard key={reg.id} reg={reg} />
              ))}
            </div>
          </div>
        )}

        {pastRegs.length > 0 && (
          <div className="mb-10">
            <div className="flex items-baseline justify-between mb-5">
              <h2 className="text-xl font-bold">Previously</h2>
              <span className="text-sm tabular-nums text-muted-foreground">{pastRegs.length}</span>
            </div>
            <div className="grid sm:grid-cols-2 gap-4 opacity-70">
              {pastRegs.map((reg) => (
                <RegisteredEventCard key={reg.id} reg={reg} />
              ))}
            </div>
          </div>
        )}

        {registrations.length === 0 && (
          <div className="max-w-md py-4">
            <h2 className="text-xl font-bold">Nothing on the calendar yet.</h2>
            <p className="mt-3 text-sm text-muted-foreground leading-relaxed">
              When you register for an event it&apos;ll land here — along with your division,
              heat assignments, and check-in info once the organiser publishes them.
            </p>
            <Link
              href="/events"
              className="inline-flex items-center gap-2 mt-5 rounded-full bg-foreground text-background
                         px-5 py-2.5 text-sm font-semibold
                         hover:-translate-y-0.5 transition-transform duration-300 ease-[cubic-bezier(0.32,0.72,0,1)]"
            >
              Find an event
              <span className="flex size-5 items-center justify-center rounded-full bg-white/10">
                <ArrowRight className="size-3" strokeWidth={2} />
              </span>
            </Link>
          </div>
        )}
      </section>

      {/* ── Events near you ───────────────────────────────────────────────── */}
      {city ? (
        <section className="mt-16 pt-10 border-t border-border">
          <div className="flex items-start justify-between gap-4 mb-6">
            <div>
              <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-muted-foreground mb-1">
                Nearby
              </p>
              <h2 className="text-xl font-bold">Near {city}</h2>
              <p className="mt-1 text-sm text-muted-foreground">
                Open competitions in your area.
              </p>
            </div>
            <Link
              href="/events"
              className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors shrink-0 flex items-center gap-1"
            >
              All events
              <ArrowRight className="size-3.5" strokeWidth={1.5} />
            </Link>
          </div>

          {nearbyEvents.length > 0 ? (
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {nearbyEvents.map((event) => (
                <EventCard key={event.id} event={event} />
              ))}
            </div>
          ) : (
            <p className="text-sm text-muted-foreground max-w-md py-4">
              Nothing open in {city} right now. Check back soon, or{' '}
              <Link href="/events" className="text-foreground underline-offset-4 hover:underline">
                browse events in other regions
              </Link>
              .
            </p>
          )}
        </section>
      ) : (
        <section className="mt-16 pt-10 border-t border-border">
          <h2 className="text-xl font-bold">Tell us where you train.</h2>
          <p className="mt-3 text-sm text-muted-foreground max-w-md leading-relaxed">
            Add a location to your profile and we&apos;ll surface competitions nearby the moment
            they open — no chasing.
          </p>
          <Link
            href="/athlete/profile"
            className="inline-flex items-center gap-2 mt-5 rounded-full border border-border bg-background
                       px-5 py-2.5 text-sm font-semibold
                       hover:bg-muted transition-colors duration-200"
          >
            Set my location
          </Link>
        </section>
      )}

    </main>
  )
}
