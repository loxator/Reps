import { notFound } from 'next/navigation'
import { MapPin, Calendar } from 'lucide-react'
import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { Navbar } from '@/components/layout/navbar'
import { LiveCapacity } from '@/components/events/live-capacity'
import { EventTabs } from '@/components/events/event-tabs'
import { CategoryCard } from '@/components/events/category-card'
import { MyScheduleBanner, type ScheduleEntry } from '@/components/events/my-schedule-banner'
import { EventScheduleTab } from '@/components/events/event-schedule-tab'
import type { Event, Category, Workout, EventStatus, HeatAssignment } from '@/types'

const BANNER_IMAGES = [
  'https://images.unsplash.com/photo-1571019614242-c5c5dee9f50b?w=1800&h=900&fit=crop&q=85',
  'https://images.unsplash.com/photo-1517836357463-d25dfeac3438?w=1800&h=900&fit=crop&q=85',
  'https://images.unsplash.com/photo-1534438327276-14e5300c3a48?w=1800&h=900&fit=crop&q=85',
  'https://images.unsplash.com/photo-1526506118085-60ce8714f8c5?w=1800&h=900&fit=crop&q=85',
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

const statusPill: Record<EventStatus, string> = {
  open:   'bg-success-100/90 text-success-800',
  closed: 'bg-neutral-100/90 text-neutral-600',
  draft:  'bg-warning-100/90 text-warning-700',
}

const VALID_TABS = ['overview', 'workouts', 'schedule'] as const
type TabKey = typeof VALID_TABS[number]

type Props = {
  params:      Promise<{ id: string }>
  searchParams: Promise<{ tab?: string }>
}

export default async function EventPage({ params, searchParams }: Props) {
  const { id }       = await params
  const { tab: tabParam } = await searchParams
  const activeTab: TabKey = VALID_TABS.includes(tabParam as TabKey)
    ? (tabParam as TabKey)
    : 'overview'

  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  const { data: event } = await supabase
    .from('events')
    .select('*, categories(*, workouts(*))')
    .eq('id', id)
    .single()

  if (!event) notFound()

  const { count: filledCount } = await createAdminClient()
    .from('registrations')
    .select('*', { count: 'exact', head: true })
    .eq('event_id', id)

  const e = event as Event & {
    categories: (Category & { workouts: Workout[] })[]
  }

  const categories = (e.categories ?? []).sort((a, b) => a.order_num - b.order_num)

  // ── Athlete's registrations ──────────────────────────────────────────────────
  const registeredCategoryIds = new Set<string>()
  type MyReg = { category_id: string | null; heat_assignments: HeatAssignment[] }
  const myRegsByCategoryId    = new Map<string, MyReg>()

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

  // ── "Your schedule" banner entries ──────────────────────────────────────────
  const myScheduleEntries: ScheduleEntry[] = []
  for (const [catId, reg] of myRegsByCategoryId) {
    const cat = categories.find((c) => c.id === catId)
    for (const ha of reg.heat_assignments ?? []) {
      myScheduleEntries.push({
        categoryName: cat?.name ?? '',
        workoutName:  ha.heats?.workouts?.name ?? 'Workout',
        workoutOrder: ha.heats?.workouts?.order_num ?? 0,
        heatName:     ha.heats?.name ?? '',
        startTime:    ha.heats?.start_time ?? null,
      })
    }
  }
  myScheduleEntries.sort((a, b) => a.workoutOrder - b.workoutOrder)

  // ── Schedule tab data ────────────────────────────────────────────────────────
  type ScheduleCategoryRow = Parameters<typeof EventScheduleTab>[0]['categories'][number]
  let scheduleCategories: ScheduleCategoryRow[] | null = null

  if (activeTab === 'schedule') {
    const { data } = await supabase
      .from('categories')
      .select(`
        id, name, order_num,
        workouts(
          id, name, order_num, scoring_type,
          heats(
            id, name, start_time, capacity, order_num,
            heat_assignments(
              registration:registrations(
                id, team_name, is_team,
                athlete:users!registrations_athlete_id_fkey(name)
              )
            )
          )
        )
      `)
      .eq('event_id', id)
      .order('order_num')

    scheduleCategories = (data ?? []) as unknown as ScheduleCategoryRow[]
  }

  // ── Derived booleans ─────────────────────────────────────────────────────────
  const today        = new Date().toISOString().split('T')[0]
  const isPast       = e.date < today
  const filled       = filledCount ?? 0
  const isFull       = e.capacity > 0 && filled >= e.capacity
  const isNearlyFull = e.capacity > 0 && filled / e.capacity >= 0.8
  const remaining    = e.capacity > 0 ? e.capacity - filled : null
  const canRegister  = e.status === 'open' && !isFull && !isPast
  const effectiveStatus: EventStatus = isPast ? 'closed' : e.status

  return (
    <>
      <Navbar />
      <main className="pb-section">

        {/* ── Hero banner with overlaid title ────────────────────────────── */}
        <div className="relative h-80 md:h-[36rem] overflow-hidden mt-14">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={bannerFor(e.id)}
            alt=""
            aria-hidden
            className="w-full h-full object-cover object-center"
          />
          <div className="absolute inset-0 bg-gradient-to-b from-black/10 via-black/25 to-black/80" />

          {/* Overlaid text at bottom */}
          <div className="absolute inset-x-0 bottom-0 max-w-4xl mx-auto px-page-x pb-8">
            <div className="flex flex-wrap gap-2 mb-4">
              <span className={`inline-flex items-center rounded-full px-3 py-1 text-xs font-semibold backdrop-blur-sm ${statusPill[effectiveStatus]}`}>
                {statusLabel[effectiveStatus]}
              </span>
              {isFull && (
                <span className="inline-flex items-center rounded-full px-3 py-1 text-xs font-semibold bg-danger-100/90 text-danger-700">
                  Full
                </span>
              )}
              {!isFull && isNearlyFull && remaining !== null && (
                <span className="inline-flex items-center rounded-full px-3 py-1 text-xs font-semibold bg-warning-100/90 text-warning-700">
                  {remaining} spot{remaining !== 1 ? 's' : ''} left
                </span>
              )}
            </div>

            <h1 className="text-3xl md:text-5xl font-bold text-white leading-tight tracking-tight drop-shadow-sm max-w-3xl">
              {e.name}
            </h1>

            <div className="flex flex-wrap items-center gap-5 mt-4 text-white/75 text-sm">
              <span className="flex items-center gap-1.5">
                <Calendar className="size-3.5 shrink-0" strokeWidth={1.5} />
                {formatDate(e.date)}
              </span>
              <span className="flex items-center gap-1.5">
                <MapPin className="size-3.5 shrink-0" strokeWidth={1.5} />
                {e.location}
              </span>
            </div>
          </div>
        </div>

        {/* ── Content ─────────────────────────────────────────────────────── */}
        <div className="mx-auto max-w-4xl px-page-x">

          {/* Capacity bar + description */}
          <div className="pt-8 pb-6 border-b border-border">
            <LiveCapacity eventId={e.id} initialFilled={filled} capacity={e.capacity} />

            {e.description && (
              <p className="mt-5 text-base leading-relaxed text-muted-foreground max-w-2xl">
                {e.description}
              </p>
            )}
          </div>

          {/* My schedule (registered athletes) */}
          {myScheduleEntries.length > 0 && (
            <MyScheduleBanner entries={myScheduleEntries} />
          )}

          {/* Tab bar */}
          <EventTabs eventId={e.id} activeTab={activeTab} />

          {/* Tab content */}
          <div className="py-10">

            {(activeTab === 'overview' || activeTab === 'workouts') && (
              <>
                <div className="flex items-baseline justify-between mb-6">
                  <h2 className="text-xl font-bold">
                    {categories.length > 0 ? 'Categories' : 'Workouts'}
                  </h2>
                  {canRegister && activeTab === 'overview' && (
                    <p className="text-sm text-muted-foreground">Pick one to register.</p>
                  )}
                </div>

                {categories.length === 0 ? (
                  <div className="py-14 max-w-md">
                    <p className="font-semibold text-base">No categories yet.</p>
                    <p className="mt-2 text-sm text-muted-foreground leading-relaxed">
                      The organiser hasn&apos;t published divisions for this event. Check back — they
                      usually go up a week or two before the date.
                    </p>
                  </div>
                ) : (
                  <div className="flex flex-col gap-4">
                    {categories.map((cat) => {
                      const isRegistered = registeredCategoryIds.has(cat.id)
                      const clickable    = canRegister && !isRegistered && activeTab === 'overview'
                      const myReg        = myRegsByCategoryId.get(cat.id)
                      const heatEntries  = (myReg?.heat_assignments ?? []).map((ha) => ({
                        workoutName:  ha.heats?.workouts?.name ?? 'Workout',
                        workoutOrder: ha.heats?.workouts?.order_num ?? 0,
                        heatName:     ha.heats?.name ?? '',
                        startTime:    ha.heats?.start_time ?? null,
                      }))

                      return (
                        <CategoryCard
                          key={cat.id}
                          eventId={e.id}
                          category={{ ...cat, workouts: cat.workouts ?? [] }}
                          isRegistered={isRegistered}
                          heatEntries={heatEntries}
                          clickable={clickable}
                          defaultExpanded={activeTab === 'workouts'}
                        />
                      )
                    })}
                  </div>
                )}
              </>
            )}

            {activeTab === 'schedule' && scheduleCategories && (
              <EventScheduleTab categories={scheduleCategories} />
            )}

          </div>
        </div>
      </main>
    </>
  )
}
