import { notFound } from 'next/navigation'
import { MapPin, Calendar } from 'lucide-react'
import { createClient } from '@/lib/supabase/server'
import { Navbar } from '@/components/layout/navbar'
import { Badge } from '@/components/ui/badge'
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
    .select('*, registrations(count), categories(*, workouts(*))')
    .eq('id', id)
    .single()

  if (!event) notFound()

  const e = event as Event & {
    registrations: { count: number }[]
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

  // ── Schedule tab data (fetched only when needed) ────────────────────────────
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
  const filled       = e.registrations?.[0]?.count ?? 0
  const isFull       = e.capacity > 0 && filled >= e.capacity
  const isNearlyFull = e.capacity > 0 && filled / e.capacity >= 0.8
  const remaining    = e.capacity > 0 ? e.capacity - filled : null
  const canRegister  = e.status === 'open' && !isFull && !isPast

  return (
    <>
      <Navbar />
      <main className="pb-section">

        {/* ── Banner ──────────────────────────────────────────────────────── */}
        <div className="relative h-80 md:h-[28rem] overflow-hidden mt-14">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={bannerFor(e.id)}
            alt=""
            aria-hidden
            className="w-full h-full object-cover object-center"
          />
          {/* Subtle bottom fade so the title block below feels anchored */}
          <div
            className="absolute inset-0 pointer-events-none"
            style={{
              background:
                'linear-gradient(to bottom, transparent 60%, rgba(0,0,0,0.15) 100%)',
            }}
          />
        </div>

        <div className="mx-auto max-w-4xl px-page-x">

          {/* ── Event header ────────────────────────────────────────────────── */}
          <div className="py-10 border-b border-border">
            <div className="flex flex-wrap gap-2 mb-5">
              <Badge variant={isPast ? 'closed' : e.status as EventStatus}>
                {statusLabel[isPast ? 'closed' : e.status]}
              </Badge>
              {isFull && <Badge variant="full">Full</Badge>}
              {!isFull && isNearlyFull && (
                <Badge variant="nearlyFull">{remaining} spot{remaining !== 1 ? 's' : ''} left</Badge>
              )}
            </div>

            <h1 className="text-title md:text-display font-bold leading-[1.02] tracking-tight max-w-3xl">
              {e.name}
            </h1>

            <dl className="mt-6 flex flex-wrap gap-x-8 gap-y-3 text-sm">
              <div className="flex items-center gap-2 text-muted-foreground">
                <Calendar className="size-4" />
                <dt className="sr-only">Date</dt>
                <dd className="text-foreground font-medium">{formatDate(e.date)}</dd>
              </div>
              <div className="flex items-center gap-2 text-muted-foreground">
                <MapPin className="size-4" />
                <dt className="sr-only">Location</dt>
                <dd className="text-foreground font-medium">{e.location}</dd>
              </div>
            </dl>

            <LiveCapacity eventId={e.id} initialFilled={filled} capacity={e.capacity} />

            {e.description && (
              <p className="mt-6 text-base leading-relaxed text-muted-foreground max-w-2xl">
                {e.description}
              </p>
            )}
          </div>

          {/* ── My schedule banner (registered athletes only) ────────────────── */}
          {myScheduleEntries.length > 0 && (
            <MyScheduleBanner entries={myScheduleEntries} />
          )}

          {/* ── Tab bar ─────────────────────────────────────────────────────── */}
          <EventTabs eventId={e.id} activeTab={activeTab} />

          {/* ── Tab content ─────────────────────────────────────────────────── */}
          <div className="py-10">

            {/* Overview & Workouts tabs share the category list */}
            {(activeTab === 'overview' || activeTab === 'workouts') && (
              <>
                <div className="flex items-baseline justify-between mb-6">
                  <h2 className="text-subhead font-bold">
                    {categories.length > 0 ? 'Categories' : 'Workouts'}
                  </h2>
                  {canRegister && activeTab === 'overview' && (
                    <p className="text-sm text-muted-foreground">
                      Pick one to register.
                    </p>
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
                  <div className="flex flex-col gap-5">
                    {categories.map((cat) => {
                      const isRegistered = registeredCategoryIds.has(cat.id)
                      // Registration CTA only on Overview tab
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

            {/* Schedule tab */}
            {activeTab === 'schedule' && scheduleCategories && (
              <EventScheduleTab categories={scheduleCategories} />
            )}

          </div>
        </div>
      </main>
    </>
  )
}
