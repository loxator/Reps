import Link from 'next/link'
import { redirect } from 'next/navigation'
import { ArrowLeft } from 'lucide-react'
import { createClient } from '@/lib/supabase/server'
import { EventCreateForm } from '@/components/events/event-form'

export default async function NewEventPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')
  if (user.user_metadata?.role !== 'organizer') redirect('/athlete')

  return (
    <main className="max-w-2xl mx-auto px-page-x pt-24 pb-section">
      <Link
        href="/organizer"
        className="inline-flex items-center gap-1.5 mt-8 mb-8 text-sm text-muted-foreground hover:text-foreground transition-colors"
      >
        <ArrowLeft className="size-3.5" /> All events
      </Link>

      <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-muted-foreground mb-2">
        Organizer
      </p>
      <h1 className="text-2xl font-bold tracking-tight">
        New event
      </h1>
      <p className="mt-2 text-sm text-muted-foreground max-w-md leading-relaxed mb-10">
        The basics first — name, date, location. You can add categories, workouts, and heats
        after you save. Nothing goes live until you open it for registration.
      </p>

      <EventCreateForm organizerId={user.id} />
    </main>
  )
}
