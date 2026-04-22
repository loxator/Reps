import Link from 'next/link'
import { notFound, redirect } from 'next/navigation'
import { ArrowLeft, ArrowRight } from 'lucide-react'
import { createClient } from '@/lib/supabase/server'
import { Navbar } from '@/components/layout/navbar'
import { RegistrationFlow } from '@/components/registration/registration-flow'
import type { Event, Category } from '@/types'

type Props = {
  params:      Promise<{ id: string }>
  searchParams: Promise<{ category?: string }>
}

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
        <div className="h-px w-10 bg-foreground mb-8" />
        <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-muted-foreground mb-3">
          Registration
        </p>
        <h1 className="text-2xl font-bold leading-tight">{heading}</h1>
        <p className="mt-3 text-sm text-muted-foreground max-w-md leading-relaxed">
          {body}
        </p>
        <div className="mt-10 flex flex-wrap gap-3">
          <Link
            href={`/events/${eventId}`}
            className="inline-flex items-center gap-2 rounded-full border border-border bg-background
                       px-5 py-2.5 text-sm font-semibold hover:bg-muted transition-colors duration-200"
          >
            <ArrowLeft className="size-3.5" strokeWidth={1.5} />
            Back to event
          </Link>
          <Link
            href="/events"
            className="inline-flex items-center gap-2 rounded-full bg-foreground text-background
                       px-5 py-2.5 text-sm font-semibold
                       hover:-translate-y-0.5 transition-all duration-300 ease-[cubic-bezier(0.32,0.72,0,1)]"
          >
            Browse events
            <span className="flex size-5 items-center justify-center rounded-full bg-white/10">
              <ArrowRight className="size-3" strokeWidth={2} />
            </span>
          </Link>
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
