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
    <div className="rounded-xl ring-1 ring-success-200 bg-success-50/50 px-5 py-4 mt-8">
      <div className="flex items-center gap-2 mb-3">
        <CheckCircle2 className="size-3.5 text-success-600 shrink-0" strokeWidth={1.5} />
        <span className="text-[10px] font-semibold text-success-700 uppercase tracking-widest">
          Your schedule
        </span>
      </div>
      <div className="flex flex-col gap-2">
        {entries.map((entry, i) => (
          <div key={i} className="flex items-center gap-3 text-sm">
            <span className="w-20 text-xs text-muted-foreground truncate shrink-0">
              {entry.workoutName}
            </span>
            <span className="font-semibold flex-1 truncate">{entry.heatName}</span>
            <span className="text-xs text-muted-foreground shrink-0 truncate hidden sm:block">
              {entry.categoryName}
            </span>
            {entry.startTime ? (
              <span className="flex items-center gap-1 text-xs font-medium text-muted-foreground whitespace-nowrap shrink-0">
                <Clock className="size-3 shrink-0" strokeWidth={1.5} />
                {new Date(entry.startTime).toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' })}
              </span>
            ) : (
              <span className="text-xs text-muted-foreground italic whitespace-nowrap shrink-0">TBA</span>
            )}
          </div>
        ))}
      </div>
    </div>
  )
}
