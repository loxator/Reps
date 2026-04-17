import Link from 'next/link'
import { MapPin, Calendar, ArrowRight, Users } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import type { Event, EventStatus } from '@/types'

function formatDate(dateStr: string) {
  return new Date(dateStr).toLocaleDateString('en-GB', {
    weekday: 'short',
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  })
}

const statusLabel: Record<EventStatus, string> = {
  open:   'Open',
  closed: 'Closed',
  draft:  'Draft',
}

function CapacityIndicator({ capacity, filled }: { capacity: number; filled: number }) {
  // No capacity limit set
  if (capacity === 0) return null

  const remaining = capacity - filled
  const pct = filled / capacity

  if (remaining <= 0) {
    return <Badge variant="full">Full</Badge>
  }
  if (pct >= 0.8) {
    return <Badge variant="nearlyFull">{remaining} spot{remaining !== 1 ? 's' : ''} left</Badge>
  }
  // Plenty of space — show a subtle count
  return (
    <span className="flex items-center gap-1 text-xs text-muted-foreground">
      <Users className="size-3" />
      {remaining} / {capacity}
    </span>
  )
}

export function EventCard({ event }: { event: Event }) {
  const filled = event.registrations?.[0]?.count ?? 0
  const isFull = event.capacity > 0 && filled >= event.capacity

  return (
    <Link
      href={`/events/${event.id}`}
      className="group relative flex flex-col rounded-xl border border-border bg-card p-card shadow-card
                 hover:shadow-panel hover:-translate-y-0.5 hover:border-neutral-300
                 transition-all duration-200 overflow-hidden"
    >
      {/* Top accent line — slides in on hover */}
      <span
        className="absolute inset-x-0 top-0 h-0.5 bg-primary
                   scale-x-0 group-hover:scale-x-100 origin-left transition-transform duration-300"
      />

      {/* Status + date row */}
      <div className="flex items-center justify-between mb-4">
        <Badge variant={event.status as EventStatus}>{statusLabel[event.status]}</Badge>
        <span className="text-xs text-muted-foreground flex items-center gap-1.5">
          <Calendar className="size-3.5" />
          {formatDate(event.date)}
        </span>
      </div>

      {/* Event name */}
      <h3 className="font-semibold text-base leading-snug mb-2 group-hover:text-primary transition-colors duration-150">
        {event.name}
      </h3>

      {/* Description */}
      {event.description && (
        <p className="text-sm text-muted-foreground leading-relaxed line-clamp-2 mb-4">
          {event.description}
        </p>
      )}

      {/* Location + capacity + arrow */}
      <div className="mt-auto pt-4 border-t border-border">
        <div className="flex items-center justify-between">
          <span className="text-sm text-muted-foreground flex items-center gap-1.5">
            <MapPin className="size-3.5 shrink-0" />
            {event.location}
          </span>
          <ArrowRight className="size-4 text-muted-foreground group-hover:text-primary group-hover:translate-x-1 transition-all duration-150" />
        </div>

        {event.capacity > 0 && (
          <div className="mt-3">
            {/* Capacity progress bar */}
            <div className="flex items-center justify-between mb-1.5">
              <CapacityIndicator capacity={event.capacity} filled={filled} />
            </div>
            <div className="h-1 w-full rounded-full bg-muted overflow-hidden">
              <div
                className={`h-full rounded-full transition-all ${
                  isFull
                    ? 'bg-danger-500'
                    : filled / event.capacity >= 0.8
                    ? 'bg-warning-500'
                    : 'bg-success-500'
                }`}
                style={{ width: `${Math.min((filled / event.capacity) * 100, 100)}%` }}
              />
            </div>
          </div>
        )}
      </div>
    </Link>
  )
}
