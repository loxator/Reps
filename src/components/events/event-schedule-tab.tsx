import { Clock } from 'lucide-react'
import type { ScoringType } from '@/types'

type AthleteRow      = { name: string } | null
type RegistrationRow = { id: string; team_name: string | null; is_team: boolean; athlete: AthleteRow }
type AssignmentRow   = { registration: RegistrationRow | null }
type HeatRow         = { id: string; name: string; start_time: string | null; capacity: number; order_num: number; heat_assignments: AssignmentRow[] }
type WorkoutRow      = { id: string; name: string; order_num: number; scoring_type: ScoringType; heats: HeatRow[] }
type CategoryRow     = { id: string; name: string; order_num: number; workouts: WorkoutRow[] }

export function EventScheduleTab({ categories }: { categories: CategoryRow[] }) {
  type WorkoutWithCat = WorkoutRow & { categoryName: string }

  const allWorkouts: WorkoutWithCat[] = categories
    .flatMap((cat) => (cat.workouts ?? []).map((w) => ({ ...w, categoryName: cat.name })))
    .sort((a, b) => a.order_num - b.order_num)

  const hasAnyHeats = allWorkouts.some((w) => (w.heats ?? []).length > 0)

  if (!hasAnyHeats) {
    return (
      <div className="flex flex-col items-center justify-center py-16 text-center rounded-xl border border-dashed border-border">
        <Clock className="size-6 text-muted-foreground mb-3" />
        <p className="font-medium text-sm mb-1">Schedule not yet available</p>
        <p className="text-sm text-muted-foreground">
          Heats will be posted here once the organizer assigns them.
        </p>
      </div>
    )
  }

  return (
    <div className="flex flex-col gap-10">
      {allWorkouts.map((workout) => {
        const heats = (workout.heats ?? []).slice().sort((a, b) => a.order_num - b.order_num)
        if (heats.length === 0) return null

        return (
          <div key={workout.id}>
            <div className="mb-3">
              <p className="text-xs font-medium text-muted-foreground uppercase tracking-widest">
                Workout {workout.order_num} · {workout.categoryName}
              </p>
              <h3 className="font-semibold text-base mt-0.5">{workout.name}</h3>
            </div>

            <div className="flex flex-col gap-3">
              {heats.map((heat) => {
                const participants = heat.heat_assignments
                  .map((ha) => ha.registration)
                  .filter((r): r is RegistrationRow => r !== null)

                return (
                  <div key={heat.id} className="rounded-xl border border-border bg-card overflow-hidden">
                    <div className="flex items-center gap-3 px-4 py-3 bg-muted/30 border-b border-border">
                      <span className="font-semibold text-sm">{heat.name}</span>
                      {heat.start_time ? (
                        <span className="flex items-center gap-1 text-xs text-muted-foreground">
                          <Clock className="size-3" />
                          {new Date(heat.start_time).toLocaleTimeString('en-GB', {
                            hour: '2-digit', minute: '2-digit',
                          })}
                        </span>
                      ) : (
                        <span className="text-xs text-muted-foreground italic">Time TBA</span>
                      )}
                      <span className="ml-auto text-xs text-muted-foreground">
                        {participants.length}
                        {heat.capacity > 0 ? ` / ${heat.capacity}` : ''} athletes
                      </span>
                    </div>

                    {participants.length > 0 ? (
                      <div className="px-4 py-3 flex flex-wrap gap-x-5 gap-y-1.5">
                        {participants.map((reg, i) => (
                          <span key={i} className="text-sm">
                            {reg.team_name ?? reg.athlete?.name ?? 'Unknown'}
                          </span>
                        ))}
                      </div>
                    ) : (
                      <p className="px-4 py-3 text-sm text-muted-foreground italic">
                        No athletes assigned yet.
                      </p>
                    )}
                  </div>
                )
              })}
            </div>
          </div>
        )
      })}
    </div>
  )
}
