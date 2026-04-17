import { createClient } from '@/lib/supabase/server'
import { Navbar } from '@/components/layout/navbar'
import { EventCard } from '@/components/events/event-card'
import { CalendarX } from 'lucide-react'
import type { Event } from '@/types'

export default async function EventsPage() {
  const supabase = await createClient()

  const { data: events } = await supabase
    .from('events')
    .select('*, registrations(count)')
    .eq('status', 'open')
    .order('date', { ascending: true })

  return (
    <>
      <Navbar />
      <main className="mx-auto max-w-6xl px-page-x pt-20 pb-section">

        {/* Page header */}
        <div className="mt-8 mb-10">
          <p className="text-sm font-medium text-muted-foreground uppercase tracking-widest mb-2">
            Competitions
          </p>
          <h1 className="text-heading font-bold">Upcoming events</h1>
          <p className="mt-2 text-sm text-muted-foreground">
            Open competitions you can register for right now.
          </p>
        </div>

        {/* Events grid */}
        {events && events.length > 0 ? (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {(events as Event[]).map((event) => (
              <EventCard key={event.id} event={event} />
            ))}
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center py-24 text-center">
            <div className="flex items-center justify-center size-14 rounded-xl bg-muted mb-4">
              <CalendarX className="size-6 text-muted-foreground" />
            </div>
            <h2 className="font-semibold text-base mb-1">No open events yet</h2>
            <p className="text-sm text-muted-foreground max-w-xs">
              Check back soon — new competitions are added regularly.
            </p>
          </div>
        )}
      </main>
    </>
  )
}
