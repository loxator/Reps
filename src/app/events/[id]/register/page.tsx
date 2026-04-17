import { notFound, redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { Navbar } from '@/components/layout/navbar'
import { RegistrationFlow } from '@/components/registration/registration-flow'
import type { Event, Category } from '@/types'

type Props = {
  params:      Promise<{ id: string }>
  searchParams: Promise<{ category?: string }>
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
      <>
        <Navbar />
        <main className="mx-auto max-w-2xl px-page-x pt-28 pb-section text-center">
          <p className="text-muted-foreground">This event is not open for registration.</p>
        </main>
      </>
    )
  }

  const filled = e.registrations?.[0]?.count ?? 0
  if (e.capacity > 0 && filled >= e.capacity) {
    return (
      <>
        <Navbar />
        <main className="mx-auto max-w-2xl px-page-x pt-28 pb-section text-center">
          <p className="font-semibold mb-1">This event is full</p>
          <p className="text-sm text-muted-foreground">All spots have been taken.</p>
        </main>
      </>
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
