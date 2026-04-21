import Link from 'next/link'
import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { Button } from '@/components/ui/button'
import { PendingInvites } from '@/components/athlete/pending-invites'
import { RegisteredEventCard, type RegisteredEvent } from '@/components/athlete/registered-event-card'
import { EventCard } from '@/components/events/event-card'
import type { Event } from '@/types'

export default async function AthleteDashboard() {
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  // ── Parallel fetches ───────────────────────────────────────────────────────
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
        id,
        division,
        team_name,
        is_team,
        status,
        registered_at,
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
  const location = profileRes.data?.location ?? null
  const registrations = (registrationsRes.data ?? []) as unknown as RegisteredEvent[]
  const invites = invitesRes.data ?? []

  // ── Events near the athlete's location ───────────────────────────────────
  // Extract city (text before the first comma) for a broad match
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

    // Exclude events the athlete is already registered for
    if (registeredEventIds.length > 0) {
      query = query.not('id', 'in', `(${registeredEventIds.join(',')})`)
    }

    const { data } = await query
    nearbyEvents = (data ?? []) as Event[]
  }

  const upcomingRegs = registrations.filter(
    (r) => r.events && new Date(r.events.date) >= new Date()
  )
  const pastRegs = registrations.filter(
    (r) => r.events && new Date(r.events.date) < new Date()
  )

  const nextReg = upcomingRegs[upcomingRegs.length - 1] ?? null // earliest upcoming
  const nextEventDate = nextReg?.events?.date
    ? new Date(nextReg.events.date).toLocaleDateString('en-GB', { day: 'numeric', month: 'long' })
    : null

  return (
    <main className="max-w-5xl mx-auto px-page-x pt-24 pb-section">

      {/* ── Greeting ───────────────────────────────────────────────────── */}
      <header className="pt-10 pb-10 border-b border-border">
        <h1 className="text-title md:text-display font-bold leading-[1.02] tracking-tight">
          {firstName ? `Hey ${firstName}.` : 'Hey there.'}
        </h1>
        <p className="mt-3 text-base text-muted-foreground max-w-prose">
          {upcomingRegs.length === 0
            ? 'You haven\'t signed up for anything yet. Something below might change that.'
            : upcomingRegs.length === 1
              ? `You\'ve got one event coming up${nextEventDate ? ` — ${nextEventDate}` : ''}.`
              : `You\'ve got ${upcomingRegs.length} events coming up${nextEventDate ? ` — next on ${nextEventDate}` : ''}.`}
        </p>
      </header>

      {/* ── Pending invites ────────────────────────────────────────────── */}
      {invites.length > 0 && (
        <section className="mt-10">
          <PendingInvites invites={invites} />
        </section>
      )}

      {/* ── My events ──────────────────────────────────────────────────── */}
      <section className="mt-12">

        {/* Upcoming */}
        {upcomingRegs.length > 0 && (
          <>
            <div className="flex items-baseline justify-between mb-5">
              <h2 className="text-subhead font-bold">Coming up</h2>
              <p className="text-sm text-muted-foreground tabular-nums">
                {upcomingRegs.length}
              </p>
            </div>
            <div className="grid sm:grid-cols-2 gap-4 mb-10">
              {upcomingRegs.map((reg) => (
                <RegisteredEventCard key={reg.id} reg={reg} />
              ))}
            </div>
          </>
        )}

        {/* Past */}
        {pastRegs.length > 0 && (
          <>
            <div className="flex items-baseline justify-between mb-5">
              <h2 className="text-subhead font-bold">Previously</h2>
              <p className="text-sm text-muted-foreground tabular-nums">
                {pastRegs.length}
              </p>
            </div>
            <div className="grid sm:grid-cols-2 gap-4 opacity-70">
              {pastRegs.map((reg) => (
                <RegisteredEventCard key={reg.id} reg={reg} />
              ))}
            </div>
          </>
        )}

        {/* Empty — prose, not a dashed-border card */}
        {registrations.length === 0 && (
          <div className="max-w-md py-4">
            <h2 className="text-subhead font-bold">Nothing on the calendar yet.</h2>
            <p className="mt-3 text-sm text-muted-foreground leading-relaxed">
              When you register for an event it&apos;ll land here — along with your division,
              heat assignments, and check-in info once the organiser publishes them.
            </p>
            <Button asChild variant="outline" size="sm" className="mt-5">
              <Link href="/events">Find an event</Link>
            </Button>
          </div>
        )}
      </section>

      {/* ── Events near you ────────────────────────────────────────────── */}
      {city ? (
        <section className="mt-16">
          <div className="flex items-baseline justify-between mb-5">
            <div>
              <h2 className="text-subhead font-bold">Near {city}</h2>
              <p className="mt-1 text-sm text-muted-foreground">
                Open competitions in your area you haven&apos;t registered for yet.
              </p>
            </div>
            <Button asChild variant="ghost" size="sm">
              <Link href="/events">All events →</Link>
            </Button>
          </div>

          {nearbyEvents.length > 0 ? (
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
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
        <section className="mt-16 py-10 border-t border-border">
          <h2 className="text-subhead font-bold">Tell us where you train.</h2>
          <p className="mt-3 text-sm text-muted-foreground max-w-md leading-relaxed">
            Add a location to your profile and we&apos;ll surface competitions nearby the moment
            they open — no chasing.
          </p>
          <Button asChild variant="outline" size="sm" className="mt-5">
            <Link href="/athlete/profile">Set my location</Link>
          </Button>
        </section>
      )}

    </main>
  )
}
