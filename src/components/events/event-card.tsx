import Link from 'next/link'
import { MapPin, Calendar, ArrowRight, Users } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import type { Event, EventStatus } from '@/types'

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
  if (capacity === 0) return null

  const remaining = capacity - filled
  const pct = filled / capacity

  if (remaining <= 0) {
    return <Badge variant="full">Full</Badge>
  }
  if (pct >= 0.8) {
    return <Badge variant="nearlyFull">{remaining} spot{remaining !== 1 ? 's' : ''} left</Badge>
  }
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
  const today = new Date().toISOString().split('T')[0]
  const isPast = event.date < today
  const effectiveStatus: EventStatus = isPast ? 'closed' : event.status

  return (
    <Link
      href={`/events/${event.id}`}
      className="group relative flex flex-col rounded-xl border border-border bg-card shadow-card
                 hover:shadow-panel hover:-translate-y-0.5 hover:border-neutral-300
                 transition-all duration-200 overflow-hidden"
    >
      {/* Event image */}
      <div className="relative h-44 overflow-hidden shrink-0">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={imageFor(event.id)}
          alt=""
          aria-hidden
          className={`w-full h-full object-cover object-center transition-transform duration-500 group-hover:scale-105${isPast ? ' grayscale opacity-60' : ''}`}
        />
        <div className="absolute top-3 left-3">
          <Badge variant={effectiveStatus}>{statusLabel[effectiveStatus]}</Badge>
        </div>
      </div>

      {/* Card body */}
      <div className="flex flex-col flex-1 p-card">
        {/* Date */}
        <span className="text-xs text-muted-foreground flex items-center gap-1.5 mb-3">
          <Calendar className="size-3.5" />
          {formatDate(event.date)}
        </span>

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

          {event.capacity > 0 && !isPast && (
            <div className="mt-3">
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
      </div>
    </Link>
  )
}
