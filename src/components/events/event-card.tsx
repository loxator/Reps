import Link from 'next/link'
import { MapPin, Calendar } from 'lucide-react'
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

const statusLabel: Record<EventStatus, string> = { open: 'Open', closed: 'Closed', draft: 'Draft' }
const statusPill: Record<EventStatus, string> = {
  open:   'bg-success-100 text-success-700',
  closed: 'bg-neutral-100 text-neutral-500',
  draft:  'bg-warning-100 text-warning-700',
}

export function EventCard({ event }: { event: Event }) {
  const filled = event.registrations?.[0]?.count ?? 0
  const isFull = event.capacity > 0 && filled >= event.capacity
  const today  = new Date().toISOString().split('T')[0]
  const isPast = event.date < today
  const effectiveStatus: EventStatus = isPast ? 'closed' : event.status

  return (
    <Link
      href={`/events/${event.id}`}
      className="group flex flex-col rounded-xl border border-border bg-card overflow-hidden shadow-card
                 hover:shadow-panel hover:-translate-y-0.5
                 transition-all duration-500 ease-[cubic-bezier(0.32,0.72,0,1)]"
    >
      <div className="relative h-36 overflow-hidden shrink-0">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={imageFor(event.id)}
          alt=""
          aria-hidden
          className={`w-full h-full object-cover object-center transition-transform duration-700 ease-[cubic-bezier(0.32,0.72,0,1)] group-hover:scale-[1.06]${isPast ? ' grayscale opacity-60' : ''}`}
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/55 via-transparent to-transparent" />
        <div className="absolute bottom-3 left-3">
          <span className="flex items-center gap-1 text-xs font-semibold text-white/90 drop-shadow-sm">
            <Calendar className="size-3 shrink-0" strokeWidth={1.5} />
            {new Date(event.date).toLocaleDateString('en-GB', { day: 'numeric', month: 'short' })}
          </span>
        </div>
        <div className="absolute top-3 right-3">
          <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-[11px] font-semibold ${statusPill[effectiveStatus]}`}>
            {statusLabel[effectiveStatus]}
          </span>
        </div>
      </div>

      <div className="flex flex-col flex-1 p-4">
        <h3 className="font-semibold text-sm leading-snug line-clamp-2 mb-auto group-hover:text-primary transition-colors duration-200">
          {event.name}
        </h3>
        <div className="pt-3 space-y-1.5">
          <p className="text-xs text-muted-foreground flex items-center gap-1 truncate">
            <MapPin className="size-3 shrink-0" strokeWidth={1.5} />
            {event.location}
          </p>
          {event.capacity > 0 && (
            <p className={`text-xs font-medium ${isFull ? 'text-danger-600' : 'text-muted-foreground'}`}>
              {isFull ? 'Full' : `${event.capacity - filled} / ${event.capacity} spots`}
            </p>
          )}
        </div>
      </div>
    </Link>
  )
}
