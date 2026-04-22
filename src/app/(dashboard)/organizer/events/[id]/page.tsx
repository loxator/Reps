import { notFound, redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { EventOverviewForm } from '@/components/events/event-overview-form'
import type { Event } from '@/types'

type Props = { params: Promise<{ id: string }> }

export default async function OrganizerEventOverview({ params }: Props) {
  const { id } = await params
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const [{ data: event }, { data: categories }] = await Promise.all([
    supabase
      .from('events')
      .select('id, name, location, date, description, status, capacity, registrations(count)')
      .eq('id', id)
      .eq('organizer_id', user.id)
      .single(),
    supabase
      .from('categories')
      .select('id, capacity')
      .eq('event_id', id),
  ])

  if (!event) notFound()

  const filled = (event as Event & { registrations: { count: number }[] }).registrations?.[0]?.count ?? 0
  const cap = (event as Event).capacity

  // Derive total capacity from categories:
  // null  → no categories, user edits freely
  // 0     → any category is unlimited → whole event is unlimited
  // n>0   → sum of all category capacities
  const cats = categories ?? []
  let lockedCapacity: number | null = null
  if (cats.length > 0) {
    if (cats.some((c) => c.capacity === 0)) {
      lockedCapacity = 0
    } else {
      lockedCapacity = cats.reduce((sum, c) => sum + c.capacity, 0)
    }
  }

  return (
    <main className="max-w-2xl mx-auto px-page-x py-10">
      <header className="pb-8 mb-8 border-b border-border flex items-end justify-between gap-6">
        <div>
          <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-muted-foreground mb-1">
            Event settings
          </p>
          <h1 className="text-2xl font-bold tracking-tight">Overview</h1>
          <p className="mt-1.5 text-sm text-muted-foreground">
            The basics athletes see when they land on this event.
          </p>
        </div>
        <div className="text-right tabular-nums shrink-0">
          <p className="text-2xl font-bold leading-none">{filled}</p>
          <p className="text-xs text-muted-foreground mt-1">
            {cap > 0 ? `of ${cap} registered` : `registration${filled !== 1 ? 's' : ''}`}
          </p>
        </div>
      </header>

      <EventOverviewForm event={event as Event} lockedCapacity={lockedCapacity} />
    </main>
  )
}
