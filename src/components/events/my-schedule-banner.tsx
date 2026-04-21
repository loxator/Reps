import { CheckCircle2, Clock } from 'lucide-react'

export type ScheduleEntry = {
  categoryName: string
  workoutName: string
  workoutOrder: number
  heatName: string
  startTime: string | null
}

export function MyScheduleBanner({ entries }: { entries: ScheduleEntry[] }) {
  if (entries.length === 0) return null

  return (
    <div className="rounded-xl border border-success-200 bg-success-50/20 px-5 py-4 mt-6">
      <div className="flex items-center gap-2 mb-3">
        <CheckCircle2 className="size-4 text-success-600 shrink-0" />
        <span className="text-sm font-semibold text-success-800">Your schedule</span>
      </div>
      <div className="flex flex-col gap-2">
        {entries.map((entry, i) => (
          <div key={i} className="grid grid-cols-[5rem_1fr_auto] items-center gap-x-3 text-sm">
            <span className="text-xs text-muted-foreground truncate">{entry.workoutName}</span>
            <div className="flex items-center gap-2 min-w-0">
              <span className="font-medium truncate">{entry.heatName}</span>
              <span className="text-xs text-muted-foreground truncate">{entry.categoryName}</span>
            </div>
            {entry.startTime ? (
              <span className="flex items-center gap-1 text-xs text-muted-foreground whitespace-nowrap">
                <Clock className="size-3 shrink-0" />
                {new Date(entry.startTime).toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' })}
              </span>
            ) : (
              <span className="text-xs text-muted-foreground italic">TBA</span>
            )}
          </div>
        ))}
      </div>
    </div>
  )
}
