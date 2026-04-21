import Link from 'next/link'
import { notFound, redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { Navbar } from '@/components/layout/navbar'
import { Button } from '@/components/ui/button'
import { RegistrationFlow } from '@/components/registration/registration-flow'
import type { Event, Category } from '@/types'

type Props = {
  params:      Promise<{ id: string }>
  searchParams: Promise<{ category?: string }>
}

// Small inline state component — keeps the "event not registerable" paths visually
// consistent without pulling in a shared component for two callsites.
function RegistrationBlocked({
  eventId,
  heading,
  body,
}: {
  eventId: string
  heading: string
  body: string
}) {
  return (
    <>
      <Navbar />
      <main className="mx-auto max-w-2xl px-page-x pt-32 pb-section">
        <p className="text-xs font-medium text-muted-foreground mb-3">
          Registration
        </p>
        <h1 className="text-title font-bold leading-tight">{heading}</h1>
        <p className="mt-3 text-sm text-muted-foreground max-w-md leading-relaxed">
          {body}
        </p>
        <div className="mt-8 flex gap-3">
          <Button asChild variant="outline">
            <Link href={`/events/${eventId}`}>Back to event</Link>
          </Button>
          <Button asChild variant="ghost">
            <Link href="/events">Browse other events</Link>
          </Button>
        </div>
      </main>
    </>
  )
}

export default async function RegisterForEventPage({ params, searchParams }: Props) {
  const { id }       = await params
  const { category: categoryId } = await searchParams

  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: event } = await supabase
    .from('events')
    .select('*, categories(*), registrations(count)')
    .eq('id', id)
    .single()

  if (!event) notFound()

  const e = event as Event & {
    categories: Category[]
    registrations: { count: number }[]
  }

  if (e.status !== 'open') {
    return (
      <RegistrationBlocked
        eventId={e.id}
        heading="Registration isn't open."
        body="The organiser hasn't opened this event for registration yet — or it's already closed. Check the event page for updates."
      />
    )
  }

  const filled = e.registrations?.[0]?.count ?? 0
  if (e.capacity > 0 && filled >= e.capacity) {
    return (
      <RegistrationBlocked
        eventId={e.id}
        heading="This one's full."
        body="Every spot has been taken. Some events open a waitlist closer to the date — keep an eye on the event page."
      />
    )
  }

  const categories = (e.categories ?? []).sort((a, b) => a.order_num - b.order_num)

  // If a category was pre-selected from the event page, find it
  const preselected = categoryId
    ? categories.find((c) => c.id === categoryId) ?? null
    : null

  return (
    <>
      <Navbar />
      <main className="mx-auto max-w-2xl px-page-x pt-28 pb-section">
        <RegistrationFlow
          eventId={e.id}
          eventName={e.name}
          athleteId={user.id}
          categories={categories}
          preselectedCategory={preselected}
        />
      </main>
    </>
  )
}
