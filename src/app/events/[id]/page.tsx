import { notFound } from 'next/navigation'
import Link from 'next/link'
import { MapPin, Calendar, Clock, Repeat, Dumbbell, RefreshCw, Users, User, ArrowRight, CheckCircle2 } from 'lucide-react'
import { createClient } from '@/lib/supabase/server'
import { Navbar } from '@/components/layout/navbar'
import { Badge } from '@/components/ui/badge'
import { LiveCapacity } from '@/components/events/live-capacity'
import type { Event, Category, Workout, EventStatus, ScoringType, HeatAssignment } from '@/types'

const BANNER_IMAGES = [
  'https://images.unsplash.com/photo-1571019614242-c5c5dee9f50b?w=1400&h=500&fit=crop&q=80',
  'https://images.unsplash.com/photo-1517836357463-d25dfeac3438?w=1400&h=500&fit=crop&q=80',
  'https://images.unsplash.com/photo-1534438327276-14e5300c3a48?w=1400&h=500&fit=crop&q=80',
  'https://images.unsplash.com/photo-1526506118085-60ce8714f8c5?w=1400&h=500&fit=crop&q=80',
]

function bannerFor(id: string) {
  const byte = parseInt(id.replace(/-/g, '').slice(0, 4), 16)
  return BANNER_IMAGES[byte % BANNER_IMAGES.length]
}

function formatDate(dateStr: string) {
  return new Date(dateStr).toLocaleDateString('en-GB', {
    weekday: 'long', day: 'numeric', month: 'long', year: 'numeric',
  })
}

const statusLabel: Record<EventStatus, string> = {
  open:   'Open for registration',
  closed: 'Registration closed',
  draft:  'Draft',
}

const scoringMeta: Record<ScoringType, { label: string; Icon: React.ElementType }> = {
  time:   { label: 'For Time',  Icon: Clock },
  reps:   { label: 'Max Reps',  Icon: Repeat },
  load:   { label: 'Max Load',  Icon: Dumbbell },
  rounds: { label: 'AMRAP',     Icon: RefreshCw },
}

type Props = { params: Promise<{ id: string }> }

export default async function EventPage({ params }: Props) {
  const { id } = await params
  const supabase = await createClient()

  // Current user may be null (guests can view event pages)
  const { data: { user } } = await supabase.auth.getUser()

  const { data: event } = await supabase
    .from('events')
    .select('*, registrations(count), categories(*, workouts(*))')
    .eq('id', id)
    .single()

  if (!event) notFound()

  const e = event as Event & {
    registrations: { count: number }[]
    categories: (Category & { workouts: Workout[] })[]
  }

  // Fetch this athlete's registrations for the event (with heat assignments)
  const registeredCategoryIds = new Set<string>()
  type MyReg = { category_id: string | null; heat_assignments: HeatAssignment[] }
  const myRegsByCategoryId = new Map<string, MyReg>()

  if (user) {
    const { data: myRegs } = await supabase
      .from('registrations')
      .select(`
        category_id,
        heat_assignments(
          heats(name, start_time, workouts(name, order_num))
        )
      `)
      .eq('event_id', id)
      .eq('athlete_id', user.id)

    myRegs?.forEach((r) => {
      if (r.category_id) {
        registeredCategoryIds.add(r.category_id)
        myRegsByCategoryId.set(r.category_id, r as unknown as MyReg)
      }
    })
  }

  const filled       = e.registrations?.[0]?.count ?? 0
  const isFull       = e.capacity > 0 && filled >= e.capacity
  const isNearlyFull = e.capacity > 0 && filled / e.capacity >= 0.8
  const remaining    = e.capacity > 0 ? e.capacity - filled : null
  const canRegister  = e.status === 'open' && !isFull

  const categories = (e.categories ?? []).sort((a, b) => a.order_num - b.order_num)

  return (
    <>
      <Navbar />
      <main className="pb-section">

        {/* ── Banner ──────────────────────────────────────────────────── */}
        <div className="h-72 md:h-96 overflow-hidden mt-14">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={bannerFor(e.id)} alt={e.name} className="w-full h-full object-cover object-center" />
        </div>

        <div className="mx-auto max-w-4xl px-page-x">

          {/* ── Event header ────────────────────────────────────────────── */}
          <div className="py-8 border-b border-border">
            <div className="flex flex-wrap gap-2 mb-3">
              <Badge variant={e.status as EventStatus}>{statusLabel[e.status]}</Badge>
              {isFull && <Badge variant="full">Full</Badge>}
              {!isFull && isNearlyFull && (
                <Badge variant="nearlyFull">{remaining} spot{remaining !== 1 ? 's' : ''} left</Badge>
              )}
            </div>

            <h1 className="text-title font-bold leading-tight">{e.name}</h1>

            <div className="mt-5 flex flex-wrap gap-x-6 gap-y-2 text-sm text-muted-foreground">
              <span className="flex items-center gap-1.5">
                <Calendar className="size-4" />
                {formatDate(e.date)}
              </span>
              <span className="flex items-center gap-1.5">
                <MapPin className="size-4" />
                {e.location}
              </span>
            </div>

            <LiveCapacity eventId={e.id} initialFilled={filled} capacity={e.capacity} />

            {e.description && (
              <p className="mt-5 text-sm leading-relaxed text-muted-foreground max-w-2xl">
                {e.description}
              </p>
            )}
          </div>

          {/* ── Categories & Workouts ───────────────────────────────────── */}
          <div className="py-8">
            <div className="flex items-baseline justify-between mb-6">
              <h2 className="font-semibold text-base">
                {categories.length > 0 ? 'Categories' : 'Workouts'}
              </h2>
              {canRegister && (
                <p className="text-sm text-muted-foreground">Click a category to register</p>
              )}
            </div>

            {categories.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-16 text-center rounded-xl border border-dashed border-border">
                <p className="font-medium text-sm mb-1">No categories yet</p>
                <p className="text-sm text-muted-foreground">The organizer hasn&apos;t set up categories for this event.</p>
              </div>
            ) : (
              <div className="flex flex-col gap-5">
                {categories.map((cat) => {
                  const workouts    = (cat.workouts ?? []).sort((a, b) => a.order_num - b.order_num)
                  const isTeam      = cat.type === 'team'
                  const isRegistered = registeredCategoryIds.has(cat.id)
                  // Clickable if the event is open, not full, and user hasn't registered for this category
                  const clickable   = canRegister && !isRegistered

                  return (
                    <div key={cat.id} className="relative group">
                      {/* Clickable overlay — only when not yet registered */}
                      {clickable && (
                        <Link
                          href={`/events/${e.id}/register?category=${cat.id}`}
                          className="absolute inset-0 z-10 rounded-xl focus:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                          aria-label={`Register for ${cat.name}`}
                        />
                      )}

                      <div className={`rounded-xl border-2 bg-card shadow-card transition-all duration-150 overflow-hidden ${
                        isRegistered
                          ? 'border-success-300 bg-success-50/20'
                          : clickable
                            ? 'border-border group-hover:border-primary group-hover:bg-primary/5 group-hover:-translate-y-px group-hover:shadow-panel'
                            : 'border-border opacity-75'
                      }`}>

                        {/* Category header */}
                        <div className="flex items-center justify-between gap-4 px-6 pt-6 pb-4">
                          <div className="flex items-center gap-3 min-w-0">
                            <h3 className={`font-semibold text-lg transition-colors ${clickable ? 'group-hover:text-primary' : ''}`}>
                              {cat.name}
                            </h3>
                            <span className={`inline-flex items-center gap-1 rounded-md px-2 py-0.5 text-xs font-medium shrink-0 ${
                              isTeam
                                ? 'bg-brand-100 text-brand-700'
                                : 'bg-neutral-100 text-neutral-600'
                            }`}>
                              {isTeam
                                ? <><Users className="size-3" />Team</>
                                : <><User  className="size-3" />Individual</>}
                            </span>
                          </div>
                          {cat.capacity > 0 && (
                            <span className="text-xs text-muted-foreground shrink-0">
                              {cat.capacity} spots
                            </span>
                          )}
                        </div>

                        {/* Workouts */}
                        {workouts.length > 0 && (
                          <div className="px-6 pb-4 flex flex-col gap-3">
                            {workouts.map((w) => {
                              const { label, Icon } = scoringMeta[w.scoring_type]
                              return (
                                <div key={w.id} className="rounded-lg border border-border bg-background p-4">
                                  <div className="flex items-start justify-between gap-3 mb-2">
                                    <div>
                                      <span className="text-xs font-medium text-muted-foreground uppercase tracking-widest">
                                        Workout {w.order_num}
                                      </span>
                                      <h4 className="font-semibold text-sm mt-0.5">{w.name}</h4>
                                    </div>
                                    <span className="flex items-center gap-1 text-xs font-medium text-muted-foreground bg-muted rounded px-2 py-1 shrink-0">
                                      <Icon className="size-3" />
                                      {label}
                                    </span>
                                  </div>
                                  <p className="text-sm text-muted-foreground leading-relaxed whitespace-pre-line">
                                    {w.description}
                                  </p>
                                </div>
                              )
                            })}
                          </div>
                        )}

                        {workouts.length === 0 && (
                          <p className="px-6 pb-4 text-sm text-muted-foreground italic">
                            Workouts not yet announced.
                          </p>
                        )}

                        {/* Footer row */}
                        <div className={`flex items-center justify-between px-6 py-4 border-t border-border transition-colors ${
                          isRegistered
                            ? 'bg-success-50/30'
                            : clickable
                              ? 'bg-muted/40 group-hover:bg-primary/10'
                              : 'bg-muted/20'
                        }`}>
                          <span className="text-sm text-muted-foreground">
                            {isTeam ? 'Team registration' : 'Individual registration'}
                          </span>
                          {isRegistered ? (
                            <span className="flex items-center gap-1.5 text-sm font-medium text-success-700">
                              <CheckCircle2 className="size-4" />
                              Registered
                            </span>
                          ) : clickable ? (
                            <span className="flex items-center gap-1 text-sm font-medium text-muted-foreground group-hover:text-primary transition-colors">
                              Register
                              <ArrowRight className="size-4 group-hover:translate-x-0.5 transition-transform" />
                            </span>
                          ) : null}
                        </div>

                        {/* Your schedule — heat assignments for this registration */}
                        {isRegistered && (() => {
                          const myReg = myRegsByCategoryId.get(cat.id)
                          const assignments = myReg?.heat_assignments ?? []
                          if (assignments.length === 0) return null
                          return (
                            <div className="px-6 py-4 border-t border-border bg-success-50/10">
                              <p className="text-xs font-medium text-muted-foreground uppercase tracking-widest mb-2">
                                Your schedule
                              </p>
                              <div className="flex flex-col gap-1">
                                {assignments
                                  .slice()
                                  .sort((a, b) => (a.heats?.workouts?.order_num ?? 0) - (b.heats?.workouts?.order_num ?? 0))
                                  .map((ha, i) => (
                                    <div key={i} className="flex items-center gap-2 text-sm">
                                      <span className="text-muted-foreground w-24 truncate">
                                        {ha.heats?.workouts?.name ?? `Workout ${i + 1}`}
                                      </span>
                                      <span className="font-medium">{ha.heats?.name}</span>
                                      {ha.heats?.start_time && (
                                        <span className="text-muted-foreground text-xs">
                                          · {new Date(ha.heats.start_time).toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' })}
                                        </span>
                                      )}
                                    </div>
                                  ))}
                              </div>
                            </div>
                          )
                        })()}
                      </div>
                    </div>
                  )
                })}
              </div>
            )}
          </div>
        </div>
      </main>
    </>
  )
}
