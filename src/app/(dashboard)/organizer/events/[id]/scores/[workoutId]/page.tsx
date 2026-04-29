import { notFound, redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { ScoreManager } from '@/components/events/score-manager'
import type { ScoringType } from '@/types'

type Props = { params: Promise<{ id: string; workoutId: string }> }

export default async function ScoresPage({ params }: Props) {
  const { workoutId } = await params
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: workout } = await supabase
    .from('workouts')
    .select('id, name, order_num, scoring_type, category_id, categories(name, event_id, events(organizer_id))')
    .eq('id', workoutId)
    .single()

  if (!workout) notFound()

  type WorkoutWithRelations = typeof workout & {
    categories: { name: string; event_id: string; events: { organizer_id: string } | null } | null
  }
  const w = workout as unknown as WorkoutWithRelations
  if (w.categories?.events?.organizer_id !== user.id) redirect('/organizer')

  // Confirmed registrations for this workout's category
  const { data: regsData } = await supabase
    .from('registrations')
    .select(`
      id, team_name, is_team,
      athlete:users!registrations_athlete_id_fkey(id, name)
    `)
    .eq('category_id', w.category_id)
    .eq('status', 'confirmed')

  type RegRow = { id: string; team_name: string | null; is_team: boolean; athlete: { id: string; name: string } | null }

  const registrations = (regsData ?? []).map((r) => {
    const row = r as unknown as RegRow
    return {
      regId:       row.id,
      athleteName: row.athlete?.name ?? 'Unknown',
      teamName:    row.team_name,
      isTeam:      row.is_team,
    }
  })

  // Existing scores
  const { data: scoresData } = await supabase
    .from('workout_scores')
    .select('registration_id, score_value, notes')
    .eq('workout_id', workoutId)

  const initialScores = (scoresData ?? []).map((s) => ({
    regId: s.registration_id,
    value: s.score_value as number,
    notes: s.notes ?? '',
  }))

  const scored = initialScores.length

  return (
    <main className="max-w-5xl mx-auto px-page-x py-10">
      <header className="pb-8 mb-8 border-b border-border flex flex-col md:flex-row md:items-end md:justify-between gap-6">
        <div className="min-w-0">
          <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-muted-foreground mb-1">
            Workout {workout.order_num} · {w.categories?.name} · Scores
          </p>
          <h1 className="text-2xl font-bold tracking-tight truncate">{workout.name}</h1>
          <p className="mt-1.5 text-sm text-muted-foreground">
            Enter scores for each athlete. Tab between fields — scores save automatically.
          </p>
        </div>
        <div className="flex gap-8 tabular-nums shrink-0">
          <div className="text-right">
            <p className="text-2xl font-bold leading-none">{registrations.length}</p>
            <p className="text-xs text-muted-foreground mt-1">Athletes</p>
          </div>
          <div className="text-right">
            <p className="text-2xl font-bold leading-none">{scored}</p>
            <p className="text-xs text-muted-foreground mt-1">Scored</p>
          </div>
        </div>
      </header>

      <ScoreManager
        workoutId={workoutId}
        scoringType={workout.scoring_type as ScoringType}
        registrations={registrations}
        initialScores={initialScores}
      />
    </main>
  )
}
