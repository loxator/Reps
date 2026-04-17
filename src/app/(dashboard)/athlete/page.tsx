import { redirect } from 'next/navigation'
import { MapPin } from 'lucide-react'
import { createClient } from '@/lib/supabase/server'
import { PendingInvites } from '@/components/athlete/pending-invites'
import { RegisteredEventCard, type RegisteredEvent } from '@/components/athlete/registered-event-card'
import { EventCard } from '@/components/events/event-card'
import type { Event } from '@/types'

export default async function AthleteDashboard() {
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  // ── Parallel fetches ───────────────────────────────────────────────────────
  const [profileRes, registrationsRes, invitesRes] = await Promise.all([
    supabase
      .from('athlete_profiles')
      .select('location')
      .eq('user_id', user.id)
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

  const location = profileRes.data?.location ?? null
  const registrations = (registrationsRes.data ?? []) as RegisteredEvent[]
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

  return (
    <main className="max-w-4xl mx-auto px-page-x pt-28 pb-section">

      {/* ── Pending invites ─────────────────────────────────────────────── */}
      {invites.length > 0 && (
        <div className="mb-10">
          <PendingInvites invites={invites} />
        </div>
      )}

      {/* ── My events ───────────────────────────────────────────────────── */}
      <section className="mb-12">
        <h1 className="text-2xl font-semibold mb-1">My events</h1>
        <p className="text-sm text-muted-foreground mb-6">
          {registrations.length === 0
            ? `registered for any events yet.`
            : `${registrations.length} registration${registrations.length !== 1 ? 's' : ''}`}
        </p>

        {upcomingRegs.length > 0 && (
          <div className="mb-8">
            <h2 className="text-sm font-medium text-muted-foreground uppercase tracking-widest mb-4">
              Upcoming
            </h2>
            <div className="grid sm:grid-cols-2 gap-4">
              {upcomingRegs.map((reg) => (
                <RegisteredEventCard key={reg.id} reg={reg} />
              ))}
            </div>
          </div>
        )}

        {pastRegs.length > 0 && (
          <div>
            <h2 className="text-sm font-medium text-muted-foreground uppercase tracking-widest mb-4">
              Past
            </h2>
            <div className="grid sm:grid-cols-2 gap-4 opacity-60">
              {pastRegs.map((reg) => (
                <RegisteredEventCard key={reg.id} reg={reg} />
              ))}
            </div>
          </div>
        )}

        {registrations.length === 0 && (
          <div className="flex flex-col items-center justify-center py-16 rounded-xl border border-dashed border-border text-center">
            <p className="font-medium text-sm mb-1">No events yet</p>
            <p className="text-sm text-muted-foreground">
              Browse events and register to see them here.
            </p>
          </div>
        )}
      </section>

      {/* ── Events near you ─────────────────────────────────────────────── */}
      {city && (
        <section>
          <div className="flex items-center gap-2 mb-1">
            <h2 className="text-2xl font-semibold">Events near you</h2>
          </div>
          <p className="text-sm text-muted-foreground mb-6 flex items-center gap-1">
            <MapPin className="size-3.5 shrink-0" />
            Open events in {city}
          </p>

          {nearbyEvents.length > 0 ? (
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {nearbyEvents.map((event) => (
                <EventCard key={event.id} event={event} />
              ))}
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center py-16 rounded-xl border border-dashed border-border text-center">
              <p className="font-medium text-sm mb-1">Nothing nearby right now</p>
              <p className="text-sm text-muted-foreground">
                No open events found in {city}. Check back soon.
              </p>
            </div>
          )}
        </section>
      )}

      {/* Prompt to set location if missing */}
      {!city && (
        <div className="rounded-xl border border-dashed border-border p-card text-center">
          <p className="font-medium text-sm mb-1">Set your location</p>
          <p className="text-sm text-muted-foreground">
            Add a location to your profile to see events near you.
          </p>
        </div>
      )}

    </main>
  )
}
