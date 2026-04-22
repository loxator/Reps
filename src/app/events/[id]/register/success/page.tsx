import { notFound } from 'next/navigation'
import Link from 'next/link'
import { Calendar, MapPin, CheckCircle2, ArrowRight } from 'lucide-react'
import { createClient } from '@/lib/supabase/server'
import { Navbar } from '@/components/layout/navbar'

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
      <main className="mx-auto max-w-5xl px-page-x pt-28 pb-section">

        <div className="grid md:grid-cols-12 gap-10 md:gap-16 items-start">

          {/* ── Left: confirmation message ─────────────────────────── */}
          <div className="md:col-span-7">
            <div className="inline-flex items-center gap-2 rounded-full bg-success-50 ring-1 ring-success-200 px-3 py-1.5 mb-8">
              <CheckCircle2 className="size-3.5 text-success-600" strokeWidth={1.5} />
              <span className="text-xs font-semibold text-success-700 uppercase tracking-widest">
                Registration confirmed
              </span>
            </div>

            <h1 className="text-title md:text-display font-bold leading-[1.02] tracking-tight">
              You&apos;re in.
            </h1>

            <p className="mt-6 text-base text-muted-foreground leading-relaxed max-w-prose">
              You&apos;re registered for{' '}
              <span className="font-semibold text-foreground">{event.name}</span>
              {registration?.division && (
                <> in <span className="font-semibold text-foreground">{registration.division}</span></>
              )}
              {registration?.team_name && (
                <> as <span className="font-semibold text-foreground">{registration.team_name}</span></>
              )}
              {". We'll send heat assignments and check-in details closer to the date."}
            </p>

            <div className="mt-10 flex flex-wrap gap-3">
              <Link
                href="/athlete"
                className="inline-flex items-center gap-2 rounded-full bg-foreground text-background
                           px-5 py-2.5 text-sm font-semibold
                           hover:-translate-y-0.5 transition-all duration-300 ease-[cubic-bezier(0.32,0.72,0,1)]"
              >
                Go to my dashboard
                <span className="flex size-5 items-center justify-center rounded-full bg-white/10">
                  <ArrowRight className="size-3" strokeWidth={2} />
                </span>
              </Link>
              <Link
                href="/events"
                className="inline-flex items-center gap-2 rounded-full border border-border bg-background
                           px-5 py-2.5 text-sm font-semibold hover:bg-muted transition-colors duration-200"
              >
                Browse more events
              </Link>
            </div>
          </div>

          {/* ── Right: event details card ──────────────────────────── */}
          <div className="md:col-span-5">
            <div className="rounded-xl border border-border bg-muted/30 p-6">
              <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-muted-foreground mb-5">
                Event details
              </p>
              <dl className="flex flex-col gap-4">
                <div>
                  <dt className="text-xs text-muted-foreground mb-1">Event</dt>
                  <dd className="font-semibold text-sm leading-snug">{event.name}</dd>
                </div>
                <div>
                  <dt className="flex items-center gap-1.5 text-xs text-muted-foreground mb-1">
                    <Calendar className="size-3 shrink-0" strokeWidth={1.5} />
                    Date
                  </dt>
                  <dd className="font-semibold text-sm">{formatDate(event.date)}</dd>
                </div>
                <div>
                  <dt className="flex items-center gap-1.5 text-xs text-muted-foreground mb-1">
                    <MapPin className="size-3 shrink-0" strokeWidth={1.5} />
                    Location
                  </dt>
                  <dd className="font-semibold text-sm">{event.location}</dd>
                </div>
                {registration?.division && (
                  <div>
                    <dt className="text-xs text-muted-foreground mb-1">Division</dt>
                    <dd className="font-semibold text-sm">{registration.division}</dd>
                  </div>
                )}
                {registration?.team_name && (
                  <div>
                    <dt className="text-xs text-muted-foreground mb-1">Team</dt>
                    <dd className="font-semibold text-sm">{registration.team_name}</dd>
                  </div>
                )}
              </dl>
            </div>
          </div>

        </div>
      </main>
    </>
  )
}
