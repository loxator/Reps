'use client'

import { useState } from 'react'
import Link from 'next/link'
import {
  MapPin, Calendar, Users, ArrowRight, Flame,
  LayoutGrid, List, Search, ChevronDown,
} from 'lucide-react'
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

function daysUntil(dateStr: string): number {
  const today = new Date()
  today.setHours(0, 0, 0, 0)
  const event = new Date(dateStr)
  return Math.ceil((event.getTime() - today.getTime()) / 86_400_000)
}

function formatDate(dateStr: string) {
  return new Date(dateStr).toLocaleDateString('en-GB', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  })
}

function formatShortDate(dateStr: string) {
  return new Date(dateStr).toLocaleDateString('en-GB', {
    day: 'numeric',
    month: 'short',
  })
}

const statusLabel: Record<EventStatus, string> = {
  open: 'Open',
  closed: 'Closed',
  draft: 'Draft',
}

const statusPill: Record<EventStatus, string> = {
  open:   'bg-success-100 text-success-700',
  closed: 'bg-neutral-100 text-neutral-500',
  draft:  'bg-warning-100 text-warning-700',
}

// ── Featured horizontal card ──────────────────────────────────────────────────
function FeaturedCard({ event }: { event: Event }) {
  const filled = event.registrations?.[0]?.count ?? 0
  const days   = daysUntil(event.date)

  return (
    <Link
      href={`/events/${event.id}`}
      className="group relative flex rounded-[1.25rem] border border-border bg-card overflow-hidden shadow-card
                 hover:shadow-panel hover:-translate-y-0.5
                 transition-all duration-500 ease-[cubic-bezier(0.32,0.72,0,1)]"
    >
      {/* Image */}
      <div className="relative w-[42%] shrink-0 overflow-hidden">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={imageFor(event.id)}
          alt=""
          aria-hidden
          className="absolute inset-0 w-full h-full object-cover object-center
                     transition-transform duration-700 ease-[cubic-bezier(0.32,0.72,0,1)]
                     group-hover:scale-[1.04]"
        />
        <div className="absolute inset-0 bg-gradient-to-r from-transparent to-black/25" />
        <div className="absolute top-4 left-4">
          <span className={`inline-flex items-center rounded-full px-3 py-1 text-xs font-semibold ${statusPill[event.status]}`}>
            {statusLabel[event.status]}
          </span>
        </div>
      </div>

      {/* Body */}
      <div className="flex flex-col justify-between p-7 flex-1 min-w-0">
        <div>
          {days <= 14 && (
            <div className="flex items-center gap-1.5 mb-3">
              <Flame className="size-3.5 text-warning-500" strokeWidth={1.5} />
              <span className="text-xs font-semibold text-warning-600 uppercase tracking-widest">
                {days <= 0 ? 'Today' : days === 1 ? 'Tomorrow' : `${days} days left`}
              </span>
            </div>
          )}
          <h3 className="font-bold text-xl leading-tight mb-3 group-hover:text-primary transition-colors duration-300">
            {event.name}
          </h3>
          {event.description && (
            <p className="text-sm text-muted-foreground leading-relaxed line-clamp-2 mb-6">
              {event.description}
            </p>
          )}
        </div>

        {/* 2×2 meta grid */}
        <div className="grid grid-cols-2 gap-3 mb-5">
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Calendar className="size-3.5 shrink-0" strokeWidth={1.5} />
            <span>{formatDate(event.date)}</span>
          </div>
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <MapPin className="size-3.5 shrink-0" strokeWidth={1.5} />
            <span className="truncate">{event.location}</span>
          </div>
          {event.capacity > 0 ? (
            <>
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Users className="size-3.5 shrink-0" strokeWidth={1.5} />
                <span>{Math.max(0, event.capacity - filled)} spots left</span>
              </div>
              <div className="flex items-center self-center">
                <div className="h-1.5 w-full rounded-full bg-muted overflow-hidden">
                  <div
                    className="h-full rounded-full bg-primary transition-all duration-500"
                    style={{ width: `${Math.min((filled / event.capacity) * 100, 100)}%` }}
                  />
                </div>
              </div>
            </>
          ) : (
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Users className="size-3.5 shrink-0" strokeWidth={1.5} />
              <span>Unlimited capacity</span>
            </div>
          )}
        </div>

        {/* CTA row */}
        <div className="pt-4 border-t border-border flex items-center justify-between">
          <span className="text-sm text-muted-foreground">Register now</span>
          <span className="flex size-8 items-center justify-center rounded-full bg-foreground text-background
                          group-hover:scale-110 transition-transform duration-300 ease-[cubic-bezier(0.32,0.72,0,1)]">
            <ArrowRight className="size-3.5" strokeWidth={2} />
          </span>
        </div>
      </div>
    </Link>
  )
}

// ── Upcoming grid card (date overlaid on image) ───────────────────────────────
function UpcomingCard({ event }: { event: Event }) {
  const filled = event.registrations?.[0]?.count ?? 0
  const isFull = event.capacity > 0 && filled >= event.capacity

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
          className="w-full h-full object-cover object-center
                     transition-transform duration-700 ease-[cubic-bezier(0.32,0.72,0,1)]
                     group-hover:scale-[1.06]"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/55 via-transparent to-transparent" />
        <div className="absolute bottom-3 left-3">
          <span className="flex items-center gap-1 text-xs font-semibold text-white/90 drop-shadow-sm">
            <Calendar className="size-3 shrink-0" strokeWidth={1.5} />
            {formatShortDate(event.date)}
          </span>
        </div>
        <div className="absolute top-3 right-3">
          <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-[11px] font-semibold ${statusPill[event.status]}`}>
            {statusLabel[event.status]}
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

// ── Past card (grayscale, sits in chalk band) ─────────────────────────────────
function PastCard({ event }: { event: Event }) {
  return (
    <Link
      href={`/events/${event.id}`}
      className="group flex flex-col rounded-xl border border-neutral-200/80 bg-white overflow-hidden
                 hover:shadow-card transition-all duration-300 ease-[cubic-bezier(0.32,0.72,0,1)]"
    >
      <div className="relative h-28 overflow-hidden shrink-0">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={imageFor(event.id)}
          alt=""
          aria-hidden
          className="w-full h-full object-cover object-center grayscale opacity-60
                     transition-all duration-500 group-hover:opacity-80"
        />
      </div>
      <div className="p-3.5">
        <p className="text-[11px] text-muted-foreground mb-1">{formatShortDate(event.date)}</p>
        <h3 className="font-semibold text-sm leading-tight line-clamp-2 mb-1.5">{event.name}</h3>
        <p className="text-[11px] text-muted-foreground flex items-center gap-1 truncate">
          <MapPin className="size-3 shrink-0" strokeWidth={1.5} />
          {event.location}
        </p>
      </div>
    </Link>
  )
}

// ── Filter pill ───────────────────────────────────────────────────────────────
function FilterPill({
  label, active, onClick,
}: { label: string; active: boolean; onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      className={`px-3 py-1.5 rounded-full text-xs font-medium transition-all duration-200
                  ease-[cubic-bezier(0.32,0.72,0,1)] ${
        active
          ? 'bg-foreground text-background'
          : 'bg-muted text-muted-foreground hover:bg-neutral-200 hover:text-foreground'
      }`}
    >
      {label}
    </button>
  )
}

// ── Main exported component ───────────────────────────────────────────────────
const FILTERS  = ['All', 'Individuals', 'Teams', 'Online', 'Masters']
const REGIONS  = ['Americas', 'EMEA', 'APAC', 'Online']
const SORT_OPTS = [
  { value: 'date', label: 'Sort: Date' },
  { value: 'name', label: 'Sort: Name' },
  { value: 'spots', label: 'Sort: Spots' },
]

export function EventsBrowse({ events, today }: { events: Event[]; today: string }) {
  const [filter, setFilter] = useState('All')
  const [region, setRegion] = useState<string | null>(null)
  const [view,   setView]   = useState<'grid' | 'list'>('grid')
  const [search, setSearch] = useState('')
  const [sort,   setSort]   = useState('date')

  const upcomingEvents = events
    .filter((e) => e.date >= today)
    .sort((a, b) => a.date.localeCompare(b.date))

  const pastEvents = events
    .filter((e) => e.date < today)
    .sort((a, b) => b.date.localeCompare(a.date))

  const featuredEvent = upcomingEvents[0] ?? null
  const gridEvents    = upcomingEvents.slice(1)

  return (
    <>
      {/* ── Main layout ──────────────────────────────────────────────────── */}
      <div className="mx-auto max-w-7xl px-page-x pt-24 pb-section">
        <div className="grid grid-cols-12 gap-8 lg:gap-12 items-start">

          {/* ── Left Rail ─────────────────────────────────────────────── */}
          <aside className="hidden lg:block lg:col-span-3">
            <div className="sticky top-20 flex flex-col gap-7">

              {/* Title */}
              <div>
                <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-muted-foreground mb-2">
                  Browse
                </p>
                <h1 className="text-3xl font-bold tracking-tight leading-none mb-2">Events</h1>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  {upcomingEvents.length > 0
                    ? `${upcomingEvents.length} upcoming · open for registration.`
                    : 'Discover upcoming fitness competitions.'}
                </p>
              </div>

              {/* Category filters */}
              <div>
                <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-muted-foreground mb-2.5">
                  Category
                </p>
                <div className="flex flex-wrap gap-1.5">
                  {FILTERS.map((f) => (
                    <FilterPill key={f} label={f} active={filter === f} onClick={() => setFilter(f)} />
                  ))}
                </div>
              </div>

              {/* Region chips */}
              <div>
                <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-muted-foreground mb-2.5">
                  Region
                </p>
                <div className="flex flex-wrap gap-1.5">
                  {REGIONS.map((r) => (
                    <FilterPill
                      key={r}
                      label={r}
                      active={region === r}
                      onClick={() => setRegion(region === r ? null : r)}
                    />
                  ))}
                </div>
              </div>

              {/* Organizer CTA */}
              <div className="rounded-xl border border-border bg-muted/30 p-4">
                <p className="text-xs font-semibold mb-1">Host an event</p>
                <p className="text-xs text-muted-foreground leading-relaxed mb-3">
                  Set up your competition in minutes. Free for organisers.
                </p>
                <Link
                  href="/register"
                  className="inline-flex items-center gap-1 text-xs font-semibold text-primary hover:underline underline-offset-2"
                >
                  Get started
                  <ArrowRight className="size-3" strokeWidth={2} />
                </Link>
              </div>
            </div>
          </aside>

          {/* ── Content ───────────────────────────────────────────────── */}
          <div className="col-span-12 lg:col-span-9">

            {/* Mobile title (hidden on lg+) */}
            <div className="lg:hidden mb-6">
              <h1 className="text-3xl font-bold tracking-tight">Events</h1>
              {upcomingEvents.length > 0 && (
                <p className="text-sm text-muted-foreground mt-1">
                  {upcomingEvents.length} upcoming · open for registration
                </p>
              )}
            </div>

            {/* Toolbar */}
            <div className="flex items-center gap-2.5 mb-8">
              <div className="relative flex-1">
                <Search
                  className="absolute left-3 top-1/2 -translate-y-1/2 size-3.5 text-muted-foreground pointer-events-none"
                  strokeWidth={1.5}
                />
                <input
                  type="text"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="Search events…"
                  className="w-full rounded-lg border border-border bg-background pl-9 pr-4 py-2 text-sm
                             placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring/50
                             transition-shadow duration-200"
                />
              </div>
              <div className="relative shrink-0">
                <select
                  value={sort}
                  onChange={(e) => setSort(e.target.value)}
                  className="appearance-none rounded-lg border border-border bg-background pl-3 pr-8 py-2 text-sm
                             focus:outline-none focus:ring-2 focus:ring-ring/50 cursor-pointer transition-shadow duration-200"
                >
                  {SORT_OPTS.map((o) => (
                    <option key={o.value} value={o.value}>{o.label}</option>
                  ))}
                </select>
                <ChevronDown
                  className="pointer-events-none absolute right-2.5 top-1/2 -translate-y-1/2 size-3.5 text-muted-foreground"
                  strokeWidth={1.5}
                />
              </div>
              <div className="flex items-center gap-0.5 rounded-lg border border-border bg-background p-0.5 shrink-0">
                <button
                  onClick={() => setView('grid')}
                  className={`rounded-md p-1.5 transition-colors duration-150 ${
                    view === 'grid' ? 'bg-muted text-foreground' : 'text-muted-foreground hover:text-foreground'
                  }`}
                  aria-label="Grid view"
                >
                  <LayoutGrid className="size-3.5" strokeWidth={1.5} />
                </button>
                <button
                  onClick={() => setView('list')}
                  className={`rounded-md p-1.5 transition-colors duration-150 ${
                    view === 'list' ? 'bg-muted text-foreground' : 'text-muted-foreground hover:text-foreground'
                  }`}
                  aria-label="List view"
                >
                  <List className="size-3.5" strokeWidth={1.5} />
                </button>
              </div>
            </div>

            {/* Empty state */}
            {events.length === 0 && (
              <div className="py-24 text-center">
                <p className="text-lg font-semibold mb-2">No events yet</p>
                <p className="text-sm text-muted-foreground mb-6 max-w-xs mx-auto">
                  New events are added as organisers publish them. Want to host your own?
                </p>
                <Link
                  href="/register"
                  className="inline-flex items-center gap-2 rounded-full bg-foreground text-background
                             px-5 py-2.5 text-sm font-semibold
                             hover:-translate-y-0.5 transition-transform duration-300 ease-[cubic-bezier(0.32,0.72,0,1)]"
                >
                  Host an event
                  <span className="flex size-5 items-center justify-center rounded-full bg-white/10">
                    <ArrowRight className="size-3" strokeWidth={2} />
                  </span>
                </Link>
              </div>
            )}

            {/* Closing soon */}
            {featuredEvent && (
              <section className="mb-10">
                <div className="flex items-center gap-2 mb-4">
                  <Flame className="size-4 text-warning-500" strokeWidth={1.5} />
                  <h2 className="text-sm font-semibold">Closing soon</h2>
                </div>
                <FeaturedCard event={featuredEvent} />
              </section>
            )}

            {/* All upcoming */}
            {gridEvents.length > 0 && (
              <section>
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-sm font-semibold">All upcoming</h2>
                  <span className="text-xs tabular-nums text-muted-foreground">{gridEvents.length} events</span>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                  {gridEvents.map((event) => (
                    <UpcomingCard key={event.id} event={event} />
                  ))}
                </div>
              </section>
            )}
          </div>
        </div>
      </div>

      {/* ── Past events — full-bleed chalk band ──────────────────────────── */}
      {pastEvents.length > 0 && (
        <div className="w-full bg-chalk-100 mt-section py-12">
          <div className="mx-auto max-w-7xl px-page-x">
            <div className="flex items-baseline justify-between mb-6">
              <h2 className="text-lg font-bold">Past events</h2>
              <span className="text-xs tabular-nums text-muted-foreground">{pastEvents.length} completed</span>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
              {pastEvents.map((event) => (
                <PastCard key={event.id} event={event} />
              ))}
            </div>
          </div>
        </div>
      )}
    </>
  )
}
