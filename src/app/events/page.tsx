import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { Navbar } from '@/components/layout/navbar'
import { EventsBrowse } from './_browse'
import type { Event } from '@/types'

export default async function EventsPage() {
  const supabase = await createClient()
  const today    = new Date().toISOString().split('T')[0]

  const { data: events } = await supabase
    .from('events')
    .select('*')
    .neq('status', 'draft')
    .order('date', { ascending: true })

  const raw = events ?? []

  // Fetch registration counts via admin client to bypass RLS.
  // RLS on registrations filters by auth.uid(), making counts wrong for
  // anonymous users (0) and registered athletes (only their own row).
  let countMap = new Map<string, number>()
  if (raw.length > 0) {
    const { data: regRows } = await createAdminClient()
      .from('registrations')
      .select('event_id')
      .in('event_id', raw.map((e) => e.id))

    for (const row of regRows ?? []) {
      countMap.set(row.event_id, (countMap.get(row.event_id) ?? 0) + 1)
    }
  }

  const list = raw.map((e) => ({
    ...e,
    registrations: [{ count: countMap.get(e.id) ?? 0 }],
  })) as Event[]

  return (
    <>
      <Navbar />
      <main>
        <EventsBrowse events={list} today={today} />
      </main>
    </>
  )
}
