import Link from 'next/link'
import { Calendar, MapPin, Users, User, CheckCircle2, Clock, Flame } from 'lucide-react'

function formatDate(dateStr: string) {
  return new Date(dateStr).toLocaleDateString('en-GB', {
    weekday: 'short', day: 'numeric', month: 'long', year: 'numeric',
  })
}

function formatTime(ts: string) {
  return new Date(ts).toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' })
}

type HeatInfo = {
  heats: {
    name: string
    start_time: string | null
    workouts: { name: string; order_num: number } | null
  } | null
}

export type RegisteredEvent = {
  id:            string
  division:      string
  team_name:     string | null
  is_team:       boolean
  status:        'confirmed' | 'waitlist'
  registered_at: string
  events: {
    id:       string
    name:     string
    date:     string
    location: string
    status:   string
  } | null
  heat_assignments?: HeatInfo[]
}

export function RegisteredEventCard({ reg }: { reg: RegisteredEvent }) {
  const event = reg.events
  if (!event) return null

  const isPast  = new Date(event.date) < new Date()
  const isTeam  = reg.is_team

  const heats = (reg.heat_assignments ?? [])
    .filter((ha) => ha.heats)
    .sort((a, b) => (a.heats?.workouts?.order_num ?? 0) - (b.heats?.workouts?.order_num ?? 0))

  return (
    <Link
      href={`/events/${event.id}`}
      className="group flex flex-col rounded-xl border border-border bg-card shadow-card
                 hover:shadow-panel hover:-translate-y-0.5 hover:border-neutral-300
                 transition-all duration-200 overflow-hidden"
    >
      {/* Coloured top stripe */}
      <div className={`h-1 w-full ${isPast ? 'bg-neutral-300' : 'bg-success-400'}`} />

      <div className="p-card flex flex-col gap-3">
        {/* Status row */}
        <div className="flex items-center justify-between gap-2">
          {reg.status === 'confirmed' ? (
            <span className="inline-flex items-center gap-1 text-xs font-medium text-success-700 bg-success-100 rounded-md px-2 py-0.5">
              <CheckCircle2 className="size-3" />
              Registered
            </span>
          ) : (
            <span className="inline-flex items-center gap-1 text-xs font-medium text-warning-700 bg-warning-100 rounded-md px-2 py-0.5">
              <Clock className="size-3" />
              Waitlist
            </span>
          )}
          <span className={`inline-flex items-center gap-1 rounded-md px-2 py-0.5 text-xs font-medium ${
            isTeam ? 'bg-brand-100 text-brand-700' : 'bg-neutral-100 text-neutral-600'
          }`}>
            {isTeam ? <><Users className="size-3" /> Team</> : <><User className="size-3" /> Individual</>}
          </span>
        </div>

        {/* Event name */}
        <h3 className="font-semibold text-base leading-snug group-hover:text-primary transition-colors">
          {event.name}
        </h3>

        {/* Division + team name */}
        <p className="text-sm text-muted-foreground">
          {reg.division}
          {reg.team_name && (
            <span className="text-foreground font-medium"> · {reg.team_name}</span>
          )}
        </p>

        {/* Heat assignments */}
        {heats.length > 0 && (
          <div className="flex flex-col gap-1 pt-2 border-t border-border">
            <span className="flex items-center gap-1 text-xs font-medium text-muted-foreground mb-0.5">
              <Flame className="size-3" /> Your heats
            </span>
            {heats.map((ha, i) => (
              <div key={i} className="flex items-center gap-2 text-xs text-muted-foreground">
                <span className="truncate">{ha.heats?.workouts?.name ?? `Workout ${i + 1}`}</span>
                <span className="text-foreground font-medium">{ha.heats?.name}</span>
                {ha.heats?.start_time && (
                  <span>· {formatTime(ha.heats.start_time)}</span>
                )}
              </div>
            ))}
          </div>
        )}

        {/* Date + location */}
        <div className="flex flex-col gap-1 pt-2 border-t border-border">
          <span className="flex items-center gap-1.5 text-xs text-muted-foreground">
            <Calendar className="size-3.5 shrink-0" />
            {formatDate(event.date)}
          </span>
          <span className="flex items-center gap-1.5 text-xs text-muted-foreground">
            <MapPin className="size-3.5 shrink-0" />
            {event.location}
          </span>
        </div>
      </div>
    </Link>
  )
}
