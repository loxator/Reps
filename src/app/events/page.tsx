import { createClient } from '@/lib/supabase/server'
import { Navbar } from '@/components/layout/navbar'
import { EventsBrowse } from './_browse'
import type { Event } from '@/types'

export default async function EventsPage() {
  const supabase = await createClient()
  const today    = new Date().toISOString().split('T')[0]

  const { data: events } = await supabase
    .from('events')
    .select('*, registrations(count)')
    .neq('status', 'draft')
    .order('date', { ascending: true })

  const list = (events ?? []) as Event[]

  return (
    <>
      <Navbar />
      <main>
        <EventsBrowse events={list} today={today} />
      </main>
    </>
  )
}
