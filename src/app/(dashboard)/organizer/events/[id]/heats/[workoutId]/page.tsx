import { notFound, redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { HeatManager } from '@/components/events/heat-manager'
import type { HeatRow, RegSummary } from '@/components/events/use-heat-manager'

type Props = { params: Promise<{ id: string; workoutId: string }> }

export default async function HeatPage({ params }: Props) {
  const { workoutId } = await params
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  // Fetch workout + verify it belongs to this organizer's event
  const { data: workout } = await supabase
    .from('workouts')
    .select('id, name, order_num, category_id, categories(name, event_id, events(organizer_id))')
    .eq('id', workoutId)
    .single()

  if (!workout) notFound()

  type WorkoutWithRelations = typeof workout & {
    categories: { name: string; event_id: string; events: { organizer_id: string } | null } | null
  }
  const w = workout as unknown as WorkoutWithRelations

  if (w.categories?.events?.organizer_id !== user.id) redirect('/organizer')

  // Heats for this workout
  const { data: heatsData } = await supabase
    .from('heats')
    .select('*, heat_assignments(registration_id)')
    .eq('workout_id', workoutId)
    .order('order_num')

  const heats: HeatRow[] = (heatsData ?? []).map((h) => ({
    id:          h.id,
    name:        h.name,
    start_time:  h.start_time,
    capacity:    h.capacity,
    order_num:   h.order_num,
    assignedIds: (h.heat_assignments ?? []).map((a: { registration_id: string }) => a.registration_id),
    saving:      false,
  }))

  // Confirmed registrations for this category
  const { data: regsData } = await supabase
    .from('registrations')
    .select(`
      id, team_name, is_team,
      athlete:users!registrations_athlete_id_fkey(id, name)
    `)
    .eq('category_id', w.category_id)
    .eq('status', 'confirmed')

  const registrations: RegSummary[] = (regsData ?? []).map((r) => {
    type Row = { id: string; team_name: string | null; is_team: boolean; athlete: { id: string; name: string } | null }
    const row = r as unknown as Row
    return {
      id:          row.id,
      athleteName: row.athlete?.name ?? 'Unknown',
      teamName:    row.team_name,
      isTeam:      row.is_team,
    }
  })

  const unassigned = registrations.length - heats.reduce((n, h) => n + h.assignedIds.length, 0)

  return (
    <main className="max-w-5xl mx-auto px-page-x py-10 overflow-x-hidden">
      <header className="pb-8 mb-8 border-b border-border flex flex-col md:flex-row md:items-end md:justify-between gap-6">
        <div className="min-w-0">
          <p className="text-xs font-medium text-muted-foreground tabular-nums mb-2">
            Workout {workout.order_num} · {w.categories?.name}
          </p>
          <h1 className="text-heading font-bold tracking-tight truncate">
            {workout.name}
          </h1>
          <p className="mt-2 text-sm text-muted-foreground">
            Assign athletes to heats and set start times.
          </p>
        </div>
        <div className="flex gap-8 tabular-nums shrink-0">
          <div>
            <p className="text-subhead font-bold leading-none">{heats.length}</p>
            <p className="text-xs text-muted-foreground mt-1">Heats</p>
          </div>
          <div>
            <p className="text-subhead font-bold leading-none">{unassigned}</p>
            <p className="text-xs text-muted-foreground mt-1">Unassigned</p>
          </div>
        </div>
      </header>

      <HeatManager
        workoutId={workoutId}
        workoutName={workout.name}
        initialHeats={heats}
        registrations={registrations}
      />
    </main>
  )
}
