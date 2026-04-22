import Link from 'next/link'
import { Calendar, MapPin, Users, User, CheckCircle2, Clock } from 'lucide-react'

const CARD_IMAGES = [
  'https://images.unsplash.com/photo-1571019614242-c5c5dee9f50b?w=800&h=400&fit=crop&q=80',
  'https://images.unsplash.com/photo-1517836357463-d25dfeac3438?w=800&h=400&fit=crop&q=80',
  'https://images.unsplash.com/photo-1534438327276-14e5300c3a48?w=800&h=400&fit=crop&q=80',
  'https://images.unsplash.com/photo-1526506118085-60ce8714f8c5?w=800&h=400&fit=crop&q=80',
  'https://images.unsplash.com/photo-1541534741688-6078c6bfb5c5?w=800&h=400&fit=crop&q=80',
  'https://images.unsplash.com/photo-1604480132736-44c188fe4d20?w=800&h=400&fit=crop&q=80',
]

function imageFor(id: string) {
  const byte = parseInt(id.replace(/-/g, '').slice(0, 4), 16)
  return CARD_IMAGES[byte % CARD_IMAGES.length]
}

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

  const isPast = new Date(event.date) < new Date()
  const isTeam = reg.is_team

  const heats = (reg.heat_assignments ?? [])
    .filter((ha) => ha.heats)
    .sort((a, b) => (a.heats?.workouts?.order_num ?? 0) - (b.heats?.workouts?.order_num ?? 0))

  return (
    <Link
      href={`/events/${event.id}`}
      className="group flex flex-col rounded-xl border border-border bg-card overflow-hidden shadow-card
                 hover:shadow-panel hover:-translate-y-0.5
                 transition-all duration-500 ease-[cubic-bezier(0.32,0.72,0,1)]"
    >
      {/* Image */}
      <div className="relative h-28 overflow-hidden shrink-0">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={imageFor(event.id)}
          alt=""
          aria-hidden
          className={`w-full h-full object-cover object-center transition-transform duration-700 ease-[cubic-bezier(0.32,0.72,0,1)] group-hover:scale-[1.05]${isPast ? ' grayscale opacity-60' : ''}`}
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />

        {/* Status + type chips over image */}
        <div className="absolute top-3 left-3 flex gap-1.5">
          {reg.status === 'confirmed' ? (
            <span className="inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-[11px] font-semibold bg-success-100 text-success-700">
              <CheckCircle2 className="size-3" strokeWidth={1.5} />
              Confirmed
            </span>
          ) : (
            <span className="inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-[11px] font-semibold bg-warning-100 text-warning-700">
              <Clock className="size-3" strokeWidth={1.5} />
              Waitlist
            </span>
          )}
        </div>

        <div className="absolute bottom-3 left-3">
          <span className="flex items-center gap-1 text-xs font-semibold text-white/90 drop-shadow-sm">
            <Calendar className="size-3 shrink-0" strokeWidth={1.5} />
            {new Date(event.date).toLocaleDateString('en-GB', { day: 'numeric', month: 'short' })}
          </span>
        </div>

        <div className="absolute top-3 right-3">
          <span className={`inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-[11px] font-semibold ${
            isTeam ? 'bg-brand-100 text-brand-700' : 'bg-neutral-100/90 text-neutral-700'
          }`}>
            {isTeam
              ? <><Users className="size-3" strokeWidth={1.5} />Team</>
              : <><User  className="size-3" strokeWidth={1.5} />Individual</>}
          </span>
        </div>
      </div>

      {/* Body */}
      <div className="flex flex-col flex-1 p-4">
        <h3 className="font-semibold text-sm leading-snug mb-1 group-hover:text-primary transition-colors duration-200">
          {event.name}
        </h3>
        <p className="text-xs text-muted-foreground mb-auto">
          {reg.division}
          {reg.team_name && (
            <span className="text-foreground font-medium"> · {reg.team_name}</span>
          )}
        </p>

        {/* Heat assignments */}
        {heats.length > 0 && (
          <div className="mt-3 pt-3 border-t border-border space-y-1">
            <p className="text-[10px] font-semibold text-muted-foreground uppercase tracking-widest mb-1.5">
              Your heats
            </p>
            {heats.map((ha, i) => (
              <div key={i} className="flex items-center gap-2 text-xs text-muted-foreground">
                <span className="truncate flex-1">{ha.heats?.workouts?.name ?? `Workout ${i + 1}`}</span>
                <span className="text-foreground font-semibold">{ha.heats?.name}</span>
                {ha.heats?.start_time && (
                  <span className="tabular-nums">· {formatTime(ha.heats.start_time)}</span>
                )}
              </div>
            ))}
          </div>
        )}

        {/* Date + location */}
        <div className="mt-3 pt-3 border-t border-border space-y-1">
          <span className="flex items-center gap-1.5 text-xs text-muted-foreground">
            <Calendar className="size-3 shrink-0" strokeWidth={1.5} />
            {formatDate(event.date)}
          </span>
          <span className="flex items-center gap-1.5 text-xs text-muted-foreground">
            <MapPin className="size-3 shrink-0" strokeWidth={1.5} />
            {event.location}
          </span>
        </div>
      </div>
    </Link>
  )
}
