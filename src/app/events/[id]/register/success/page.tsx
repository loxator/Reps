import { notFound } from 'next/navigation'
import Link from 'next/link'
import { Calendar, MapPin } from 'lucide-react'
import { createClient } from '@/lib/supabase/server'
import { Navbar } from '@/components/layout/navbar'
import { Button } from '@/components/ui/button'

type Props = { params: Promise<{ id: string }> }

function formatDate(dateStr: string) {
  return new Date(dateStr).toLocaleDateString('en-GB', {
    weekday: 'long', day: 'numeric', month: 'long', year: 'numeric',
  })
}

export default async function RegistrationSuccessPage({ params }: Props) {
  const { id } = await params
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()

  // Fetch the event and the athlete's most recent registration for it
  const [{ data: event }, { data: registration }] = await Promise.all([
    supabase.from('events').select('name, date, location').eq('id', id).single(),
    user
      ? supabase
          .from('registrations')
          .select('division, team_name, category_id')
          .eq('event_id', id)
          .eq('athlete_id', user.id)
          .order('registered_at', { ascending: false })
          .limit(1)
          .single()
      : Promise.resolve({ data: null }),
  ])

  if (!event) notFound()

  return (
    <>
      <Navbar />
      <main className="mx-auto max-w-lg px-page-x pt-28 pb-section">

        {/* A thin success rule does the work a rounded icon used to. */}
        <div className="h-px w-12 bg-success-500 mb-8" />

        <p className="text-xs font-medium text-success-700 mb-3 tracking-wide">
          Registration confirmed
        </p>

        <h1 className="text-title md:text-display font-bold leading-[1.02] tracking-tight">
          You&apos;re in.
        </h1>

        <p className="mt-5 text-base text-muted-foreground leading-relaxed">
          You&apos;re registered for{' '}
          <span className="font-medium text-foreground">{event.name}</span>
          {registration?.division && (
            <> in <span className="font-medium text-foreground">{registration.division}</span></>
          )}
          {registration?.team_name && (
            <> as <span className="font-medium text-foreground">{registration.team_name}</span></>
          )}
          {'. We\'ll send heat assignments closer to the date.'}
        </p>

        {/* Event details — borderless, typographic */}
        <dl className="mt-10 pt-8 border-t border-border flex flex-col gap-4">
          <div className="grid grid-cols-[7rem_1fr] gap-4 text-sm">
            <dt className="text-muted-foreground">Event</dt>
            <dd className="font-medium">{event.name}</dd>
          </div>
          <div className="grid grid-cols-[7rem_1fr] gap-4 text-sm">
            <dt className="text-muted-foreground">
              <span className="inline-flex items-center gap-1.5">
                <Calendar className="size-3.5" /> Date
              </span>
            </dt>
            <dd className="font-medium">{formatDate(event.date)}</dd>
          </div>
          <div className="grid grid-cols-[7rem_1fr] gap-4 text-sm">
            <dt className="text-muted-foreground">
              <span className="inline-flex items-center gap-1.5">
                <MapPin className="size-3.5" /> Location
              </span>
            </dt>
            <dd className="font-medium">{event.location}</dd>
          </div>
        </dl>

        <div className="mt-10 flex flex-wrap gap-3">
          <Button asChild size="lg">
            <Link href="/athlete">Go to my dashboard</Link>
          </Button>
          <Button asChild size="lg" variant="outline">
            <Link href="/events">Find another event</Link>
          </Button>
        </div>
      </main>
    </>
  )
}
