import { notFound } from 'next/navigation'
import Link from 'next/link'
import { CheckCircle2, Calendar, MapPin } from 'lucide-react'
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
      <main className="mx-auto max-w-md px-page-x pt-28 pb-section text-center">
        {/* Icon */}
        <div className="flex items-center justify-center size-16 rounded-full bg-success-100 mx-auto mb-6">
          <CheckCircle2 className="size-8 text-success-600" />
        </div>

        <h1 className="text-title font-bold mb-2">You&apos;re in!</h1>
        <p className="text-muted-foreground text-sm mb-8">
          Your registration for{' '}
          <span className="font-medium text-foreground">{event.name}</span>
          {registration?.division && (
            <> — <span className="font-medium text-foreground">{registration.division}</span></>
          )}
          {' '}is confirmed.
        </p>

        {/* Event details card */}
        <div className="rounded-xl border border-border p-card text-left mb-8 shadow-card">
          <p className="font-semibold mb-3">{event.name}</p>
          <div className="flex flex-col gap-2 text-sm text-muted-foreground">
            <span className="flex items-center gap-2">
              <Calendar className="size-4 shrink-0" />
              {formatDate(event.date)}
            </span>
            <span className="flex items-center gap-2">
              <MapPin className="size-4 shrink-0" />
              {event.location}
            </span>
          </div>
          {registration?.team_name && (
            <p className="mt-3 text-sm">
              <span className="text-muted-foreground">Team: </span>
              <span className="font-medium">{registration.team_name}</span>
            </p>
          )}
        </div>

        <div className="flex flex-col gap-3">
          <Button asChild size="lg" className="w-full">
            <Link href="/events">Browse more events</Link>
          </Button>
          <Button asChild variant="outline" size="lg" className="w-full">
            <Link href="/athlete">My dashboard</Link>
          </Button>
        </div>
      </main>
    </>
  )
}
