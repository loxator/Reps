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

  const { data: event } = await supabase
    .from('events')
    .select('id, name, location, date, description, status, capacity, registrations(count)')
    .eq('id', id)
    .eq('organizer_id', user.id)
    .single()

  if (!event) notFound()

  const filled = (event as Event & { registrations: { count: number }[] }).registrations?.[0]?.count ?? 0

  return (
    <main className="max-w-2xl mx-auto px-page-x py-10">
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-xl font-semibold">Overview</h1>
        <p className="text-sm text-muted-foreground">{filled} registration{filled !== 1 ? 's' : ''}</p>
      </div>
      <EventOverviewForm event={event as Event} />
    </main>
  )
}
