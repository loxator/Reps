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
  const checkedIn = rows.filter((r) => r.checked_in).length

  return (
    <main className="max-w-5xl mx-auto px-page-x py-10">
      <header className="pb-8 mb-8 border-b border-border flex flex-col md:flex-row md:items-end md:justify-between gap-4">
        <div>
          <h1 className="text-heading font-bold tracking-tight">Registrations</h1>
          <p className="mt-2 text-sm text-muted-foreground">
            Everyone signed up for <span className="font-medium text-foreground">{event.name}</span>.
          </p>
        </div>
        <div className="flex gap-8 tabular-nums">
          <div>
            <p className="text-subhead font-bold leading-none">{rows.length}</p>
            <p className="text-xs text-muted-foreground mt-1">Registered</p>
          </div>
          <div>
            <p className="text-subhead font-bold leading-none">{checkedIn}</p>
            <p className="text-xs text-muted-foreground mt-1">Checked in</p>
          </div>
        </div>
      </header>

      <RegistrationList registrations={rows} categories={categories} />
    </main>
  )
}
