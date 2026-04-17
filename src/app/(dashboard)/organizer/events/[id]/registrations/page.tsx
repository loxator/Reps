import { notFound, redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { RegistrationList } from '@/components/events/registration-list'
import type { RegistrationRow } from '@/components/events/use-registration-list'

type Props = { params: Promise<{ id: string }> }

export default async function RegistrationsPage({ params }: Props) {
  const { id } = await params
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: event } = await supabase
    .from('events')
    .select('id, name, categories(id, name)')
    .eq('id', id)
    .eq('organizer_id', user.id)
    .single()

  if (!event) notFound()

  const { data: registrations } = await supabase
    .from('registrations')
    .select(`
      id, division, team_name, is_team, status, registered_at, checked_in,
      athlete:users!registrations_athlete_id_fkey(id, name, email),
      category:categories!registrations_category_id_fkey(id, name),
      heat_assignments(
        heats(name, start_time, workouts(name, order_num))
      )
    `)
    .eq('event_id', id)
    .order('registered_at', { ascending: true })

  const rows = (registrations ?? []) as unknown as RegistrationRow[]
  const categories = (event.categories ?? []) as { id: string; name: string }[]

  return (
    <main className="max-w-5xl mx-auto px-page-x py-10">
      <h1 className="text-xl font-semibold mb-2">Registrations</h1>
      <p className="text-sm text-muted-foreground mb-8">
        {rows.length} athlete{rows.length !== 1 ? 's' : ''} registered for {event.name}
      </p>
      <RegistrationList registrations={rows} categories={categories} />
    </main>
  )
}
