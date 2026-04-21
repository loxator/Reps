import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'
import { Navbar } from '@/components/layout/navbar'
import { EventCard } from '@/components/events/event-card'
import { Button } from '@/components/ui/button'
import type { Event } from '@/types'
import { Separator } from '@/components/ui/separator'

export default async function EventsPage() {
  const supabase = await createClient()

  const today = new Date().toISOString().split('T')[0]

  const { data: events } = await supabase
    .from('events')
    .select('*, registrations(count)')
    .neq('status', 'draft')
    .order('date', { ascending: true })

  const list = (events ?? []) as Event[]
  const upcomingEvents = list.filter((e) => e.date >= today).sort((a, b) => a.date.localeCompare(b.date))
  const pastEvents = list.filter((e) => e.date < today).sort((a, b) => b.date.localeCompare(a.date))

  return (
    <>
      <Navbar />
      <main className="mx-auto max-w-6xl px-page-x pt-24 pb-section">

        {/* Page header */}
        <header className="pt-10 pb-10 md:pb-14 flex flex-col md:flex-row md:items-end md:justify-between gap-4">
          <div>
            <h1 className="text-title md:text-display font-bold leading-[1.02] tracking-tight">
              Events
            </h1>
            <p className="mt-3 text-sm text-muted-foreground max-w-md">
              {upcomingEvents.length > 0
                ? `${upcomingEvents.length} open for registration. Sorted by date.`
                : 'Sorted by date.'}
            </p>
          </div>
          <p className="text-sm text-muted-foreground tabular-nums">
            {upcomingEvents.length + pastEvents.length} {upcomingEvents.length + pastEvents.length === 1 ? 'event' : 'events'}
          </p>
        </header>

        {/* Events grid */}
        {list.length > 0 ? (
          <div className="mt-10 grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {upcomingEvents.map((event) => (
              <EventCard key={event.id} event={event} />
            ))}
          </div>
        ) : (
          <div className="py-24 md:py-32 max-w-lg">
            <p className="text-subhead md:text-heading font-bold leading-tight">
              No events yet.
            </p>
            <p className="mt-3 text-sm text-muted-foreground leading-relaxed">
              New events are added as organisers publish them. Want to host your own?
              It&apos;s free and takes about ten minutes.
            </p>
            <Button asChild variant="outline" size="sm" className="mt-6">
              <Link href="/register">Host an event</Link>
            </Button>
          </div>
        )}
        <Separator className="my-10" />
        {pastEvents.length > 0 && (
          <>
            <header className='pt-10 pb-10 md:pb-14 flex flex-col md:flex-row md:items-end md:justify-between gap-4'>
              <h2 className="text-subhead md:text-heading font-bold leading-tight">
                Past events
              </h2>
              <p className="text-sm text-muted-foreground tabular-nums">
                {pastEvents.length} {pastEvents.length === 1 ? 'event' : 'events'}
              </p>
            </header>
            <div className="mt-10 grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
              {pastEvents.map((event) => (
                <EventCard key={event.id} event={event} />
              ))}
            </div>
          </>
        )}
      </main>
    </>
  )
}
